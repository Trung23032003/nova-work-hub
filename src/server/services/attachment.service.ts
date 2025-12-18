/**
 * ATTACHMENT SERVICE
 * 
 * Service này xử lý logic truy vấn attachments từ database.
 * Không chứa authentication logic (xử lý ở Server Actions).
 */

import { prisma } from "@/server/db";
import type { Prisma } from "@prisma/client";

/**
 * Type cho attachment list item
 */
export type AttachmentListItem = Prisma.AttachmentGetPayload<{
    select: {
        id: true;
        fileName: true;
        fileUrl: true;
        fileType: true;
        fileSize: true;
        createdAt: true;
        uploaderId: true;
    };
}>;

/**
 * Options cho getAttachments
 */
export type GetAttachmentsOptions = {
    taskId?: string;
    projectId?: string;
    internalFormId?: string;
};

/**
 * Lấy danh sách attachments theo filter
 */
export async function getAttachments(
    options: GetAttachmentsOptions
): Promise<AttachmentListItem[]> {
    const where: Prisma.AttachmentWhereInput = {};

    if (options.taskId) where.taskId = options.taskId;
    if (options.projectId) where.projectId = options.projectId;
    if (options.internalFormId) where.internalFormId = options.internalFormId;

    const attachments = await prisma.attachment.findMany({
        where,
        select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
            uploaderId: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    return attachments;
}

/**
 * Lấy attachment theo ID
 */
export async function getAttachmentById(id: string): Promise<AttachmentListItem | null> {
    const attachment = await prisma.attachment.findUnique({
        where: { id },
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

    return attachment;
}

/**
 * Kiểm tra quyền xóa attachment
 * - Uploader có thể xóa
 * - ADMIN có thể xóa
 */
export async function canDeleteAttachment(
    attachmentId: string,
    userId: string,
    userRole: string
): Promise<boolean> {
    if (userRole === 'ADMIN') return true;

    const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId },
        select: { uploaderId: true },
    });

    if (!attachment) return false;

    return attachment.uploaderId === userId;
}
