/**
 * TIME LOG SERVER ACTIONS
 * 
 * Server-side actions cho TimeLog operations.
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";
import { LogTimeSchema } from "@/lib/zod-schemas";
import {
    getTimeLogsByTask,
    canDeleteTimeLog,
    getTotalHoursByTask
} from "@/server/services/timelog.service";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ActionResponse<T = unknown> =
    | { success: true; data: T; message?: string }
    | { success: false; error: string };

// ============================================
// ACTIONS
// ============================================

/**
 * Thêm log giờ cho task
 */
export async function addTimeLog(input: z.infer<typeof LogTimeSchema>): Promise<ActionResponse<{ id: string }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Vui lòng đăng nhập" };
        }

        // 2. Validate input
        const validatedData = LogTimeSchema.safeParse(input);
        if (!validatedData.success) {
            return {
                success: false,
                error: validatedData.error.issues[0]?.message || "Dữ liệu không hợp lệ",
            };
        }

        const { taskId, hours, date, note } = validatedData.data;

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

        // Check if user is PM or member of the project or Admin
        const isMember = task.project.members.some((m: { userId: string }) => m.userId === session.user.id);
        const isPM = task.project.pmId === session.user.id;
        const isAdmin = session.user.role === "ADMIN";

        if (!isMember && !isPM && !isAdmin) {
            return { success: false, error: "Bạn không có quyền log giờ trên task này" };
        }

        // 4. Create time log
        const timeLog = await prisma.timeLog.create({
            data: {
                hours,
                date,
                note,
                taskId,
                userId: session.user.id,
            },
            select: {
                id: true,
            },
        });

        // 5. Revalidate
        revalidatePath(`/projects/${task.project.id}/tasks`);

        return {
            success: true,
            data: { id: timeLog.id },
            message: "Đã ghi nhận thời gian",
        };
    } catch (error) {
        console.error("Add time log error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra khi ghi nhận thời gian",
        };
    }
}

/**
 * Xóa log giờ
 */
export async function deleteTimeLog(logId: string): Promise<ActionResponse<null>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Vui lòng đăng nhập" };
        }

        // 2. Check permissions
        const canDelete = await canDeleteTimeLog(logId, session.user.id, session.user.role);
        if (!canDelete) {
            return { success: false, error: "Bạn không có quyền xóa log giờ này" };
        }

        // 3. Get task for revalidation before deleting
        const log = await prisma.timeLog.findUnique({
            where: { id: logId },
            select: {
                task: {
                    select: {
                        projectId: true,
                    },
                },
            },
        });

        // 4. Delete log
        await prisma.timeLog.delete({
            where: { id: logId },
        });

        // 5. Revalidate
        if (log?.task) {
            revalidatePath(`/projects/${log.task.projectId}/tasks`);
        }

        return {
            success: true,
            data: null,
            message: "Đã xóa log giờ",
        };
    } catch (error) {
        console.error("Delete time log error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra khi xóa log giờ",
        };
    }
}

/**
 * Lấy danh sách log giờ của task (Server Action cho Client Components)
 */
export async function getTaskTimeLogs(taskId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false as const, error: "Vui lòng đăng nhập" };
        }

        if (!taskId) {
            return { success: false as const, error: "Task ID là bắt buộc" };
        }

        const logs = await getTimeLogsByTask(taskId);
        const totalHours = await getTotalHoursByTask(taskId);

        return {
            success: true as const,
            data: {
                logs,
                totalHours,
            },
        };
    } catch (error) {
        console.error("Get task time logs error:", error);
        return {
            success: false as const,
            error: "Đã có lỗi xảy ra khi tải danh sách log giờ",
        };
    }
}
