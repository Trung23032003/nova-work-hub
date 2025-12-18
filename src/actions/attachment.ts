/**
 * ATTACHMENT SERVER ACTIONS
 * 
 * Xử lý CRUD attachments với authorization và validation
 */

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";
import { CreateAttachmentSchema } from "@/lib/zod-schemas";
import { getAttachments, canDeleteAttachment } from "@/server/services/attachment.service";
import type { CreateAttachmentInput } from "@/lib/zod-schemas";
import type { AttachmentListItem } from "@/server/services/attachment.service";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

/**
 * Action Response Type
 */
type ActionResponse<T> =
    | { success: true; data: T; message?: string }
    | { success: false; error: string };

/**
 * Tạo attachment record sau khi upload file
 */
export async function createAttachment(
    input: CreateAttachmentInput
): Promise<ActionResponse<AttachmentListItem>> {
    try {
        // 1. Auth check
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // 2. Validate input
        const validated = CreateAttachmentSchema.safeParse(input);
        if (!validated.success) {
            const firstError = validated.error.issues[0];
            return { success: false, error: firstError?.message || "Invalid input" };
        }

        // 3. Create attachment
        const attachment = await prisma.attachment.create({
            data: {
                ...validated.data,
                uploaderId: session.user.id,
            },
            select: {
                id: true,
                fileName: true,
                fileUrl: true,
                fileType: true,
                fileSize: true,
                createdAt: true,
                uploaderId: true,
            },
        });

        // 4. Revalidate
        if (input.taskId) {
            revalidatePath(`/projects/*/tasks`);
        }
        if (input.projectId) {
            revalidatePath(`/projects/${input.projectId}`);
        }

        return {
            success: true,
            data: attachment,
            message: "File đã được đính kèm",
        };

    } catch (error) {
        console.error("Create attachment error:", error);
        return { success: false, error: "Không thể tạo attachment" };
    }
}

/**
 * Lấy danh sách attachments
 */
export async function getTaskAttachments(
    taskId: string
): Promise<ActionResponse<AttachmentListItem[]>> {
    try {
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const attachments = await getAttachments({ taskId });
        return { success: true, data: attachments };

    } catch (error) {
        console.error("Get attachments error:", error);
        return { success: false, error: "Không thể lấy danh sách attachments" };
    }
}

/**
 * Xóa attachment
 */
export async function deleteAttachment(
    attachmentId: string
): Promise<ActionResponse<void>> {
    try {
        // 1. Auth check
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // 2. Get attachment info before deletion
        const attachment = await prisma.attachment.findUnique({
            where: { id: attachmentId },
            select: {
                id: true,
                fileKey: true,
                taskId: true,
                projectId: true,
                uploaderId: true,
            },
        });

        if (!attachment) {
            return { success: false, error: "Attachment không tồn tại" };
        }

        // 3. Permission check
        const hasPermission = await canDeleteAttachment(
            attachmentId,
            session.user.id,
            session.user.role
        );

        if (!hasPermission) {
            return { success: false, error: "Bạn không có quyền xóa file này" };
        }

        // 4. Delete from database
        await prisma.attachment.delete({
            where: { id: attachmentId },
        });

        // 5. Delete physical file (best effort, don't fail if file not found)
        try {
            const filePath = path.join(process.cwd(), 'public', 'uploads', attachment.fileKey);
            if (existsSync(filePath)) {
                await unlink(filePath);
            }
        } catch (fileError) {
            console.warn("Could not delete physical file:", fileError);
            // Continue anyway, database record is deleted
        }

        // 6. Revalidate
        if (attachment.taskId) {
            revalidatePath(`/projects/*/tasks`);
        }
        if (attachment.projectId) {
            revalidatePath(`/projects/${attachment.projectId}`);
        }

        return {
            success: true,
            data: undefined,
            message: "Đã xóa file",
        };

    } catch (error) {
        console.error("Delete attachment error:", error);
        return { success: false, error: "Không thể xóa attachment" };
    }
}
