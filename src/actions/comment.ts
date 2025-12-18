/**
 * COMMENT SERVER ACTIONS
 * 
 * Server-side actions cho Comment CRUD operations.
 * Handles authentication, authorization, validation.
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";
import {
    getCommentsByTask,
    getCommentById,
    canDeleteComment
} from "@/server/services/comment.service";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ActionResponse<T = unknown> =
    | { success: true; data: T; message?: string }
    | { success: false; error: string };


// ============================================
// VALIDATION SCHEMAS
// ============================================

const AddCommentSchema = z.object({
    taskId: z.string().min(1, "Task ID là bắt buộc"),
    content: z.string().min(1, "Nội dung comment là bắt buộc").max(5000, "Nội dung không quá 5000 ký tự"),
});

const DeleteCommentSchema = z.object({
    commentId: z.string().min(1, "Comment ID là bắt buộc"),
});

const UpdateCommentSchema = z.object({
    commentId: z.string().min(1, "Comment ID là bắt buộc"),
    content: z.string().min(1, "Nội dung comment là bắt buộc").max(5000, "Nội dung không quá 5000 ký tự"),
});

// ============================================
// ACTIONS
// ============================================

/**
 * Add a comment to a task
 */
export async function addComment(input: z.infer<typeof AddCommentSchema>): Promise<ActionResponse<{ id: string }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Vui lòng đăng nhập" };
        }

        // 2. Validate input
        const validatedData = AddCommentSchema.safeParse(input);
        if (!validatedData.success) {
            return {
                success: false,
                error: validatedData.error.issues[0]?.message || "Dữ liệu không hợp lệ",
            };
        }

        const { taskId, content } = validatedData.data;

        // 3. Check if task exists and user has access
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                project: {
                    select: {
                        id: true,
                        pmId: true,
                        members: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                },
            },
        });

        if (!task) {
            return { success: false, error: "Không tìm thấy task" };
        }

        // Check if user is PM or member of the project
        const isMember = task.project.members.some((m: { userId: string }) => m.userId === session.user.id);
        const isPM = task.project.pmId === session.user.id;
        const isAdmin = session.user.role === "ADMIN";

        if (!isMember && !isPM && !isAdmin) {
            return { success: false, error: "Bạn không có quyền comment trên task này" };
        }

        // 4. Create comment
        const comment = await prisma.comment.create({
            data: {
                content,
                taskId,
                authorId: session.user.id,
            },
            select: {
                id: true,
            },
        });

        // 5. Revalidate
        revalidatePath(`/projects/${task.project.id}/tasks`);

        return {
            success: true,
            data: { id: comment.id },
            message: "Đã thêm comment",
        };
    } catch (error) {
        console.error("Add comment error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra khi thêm comment",
        };
    }
}

/**
 * Update a comment
 */
export async function updateComment(input: z.infer<typeof UpdateCommentSchema>): Promise<ActionResponse<null>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Vui lòng đăng nhập" };
        }

        // 2. Validate input
        const validatedData = UpdateCommentSchema.safeParse(input);
        if (!validatedData.success) {
            return {
                success: false,
                error: validatedData.error.issues[0]?.message || "Dữ liệu không hợp lệ",
            };
        }

        const { commentId, content } = validatedData.data;

        // 3. Get comment and check ownership
        const comment = await getCommentById(commentId);
        if (!comment) {
            return { success: false, error: "Không tìm thấy comment" };
        }

        // Only author can edit
        if (comment.authorId !== session.user.id) {
            return { success: false, error: "Bạn chỉ có thể sửa comment của mình" };
        }

        // 4. Update comment
        await prisma.comment.update({
            where: { id: commentId },
            data: {
                content,
            },
        });

        // 5. Get project ID for revalidation
        const task = await prisma.task.findUnique({
            where: { id: comment.taskId },
            select: { projectId: true },
        });

        if (task) {
            revalidatePath(`/projects/${task.projectId}/tasks`);
        }

        return {
            success: true,
            data: null,
            message: "Đã cập nhật comment",
        };
    } catch (error) {
        console.error("Update comment error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra khi cập nhật comment",
        };
    }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<ActionResponse<null>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Vui lòng đăng nhập" };
        }

        // 2. Validate input
        const validatedData = DeleteCommentSchema.safeParse({ commentId });
        if (!validatedData.success) {
            return {
                success: false,
                error: validatedData.error.issues[0]?.message || "Dữ liệu không hợp lệ",
            };
        }

        // 3. Check permissions
        const canDelete = await canDeleteComment(commentId, session.user.id, session.user.role);
        if (!canDelete) {
            return { success: false, error: "Bạn không có quyền xóa comment này" };
        }

        // 4. Get task for revalidation before deleting
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: {
                task: {
                    select: {
                        projectId: true,
                    },
                },
            },
        });

        // 5. Delete comment
        await prisma.comment.delete({
            where: { id: commentId },
        });

        // 6. Revalidate
        if (comment?.task) {
            revalidatePath(`/projects/${comment.task.projectId}/tasks`);
        }

        return {
            success: true,
            data: null,
            message: "Đã xóa comment",
        };
    } catch (error) {
        console.error("Delete comment error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra khi xóa comment",
        };
    }
}

/**
 * Get comments for a task (Server Action for Client Components)
 * 
 * @param taskId - ID của task
 * @returns Comments list hoặc error
 */
export async function getTaskComments(taskId: string) {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false as const, error: "Vui lòng đăng nhập" };
        }

        // 2. Validate taskId
        if (!taskId) {
            return { success: false as const, error: "Task ID là bắt buộc" };
        }

        // 3. Fetch comments
        const { comments } = await getCommentsByTask({
            taskId,
            take: 50
        });

        return {
            success: true as const,
            data: comments,
        };
    } catch (error) {
        console.error("Get task comments error:", error);
        return {
            success: false as const,
            error: "Đã có lỗi xảy ra khi tải comments",
        };
    }
}
