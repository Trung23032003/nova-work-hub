"use server";

/**
 * TASK SERVER ACTIONS
 * 
 * Server Actions cho quản lý Tasks.
 * Pattern:
 * 1. Authenticate: Kiểm tra session
 * 2. Authorize: Kiểm tra quyền (phải là member của project)
 * 3. Validate: Validate input với Zod
 * 4. Execute: Gọi Prisma
 * 5. Return: Trả về kết quả hoặc lỗi
 */

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";
import {
    CreateTaskSchema,
    UpdateTaskSchema,
    type CreateTaskInput,
    type UpdateTaskInput,
} from "@/lib/zod-schemas";
import { getNextTaskPosition } from "@/server/services/task.service";
import type { TaskStatus } from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ActionResponse<T = unknown> =
    | { success: true; data: T; message?: string }
    | { success: false; error: string };

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Kiểm tra user có quyền truy cập project không
 * User có quyền nếu là PM, Member, hoặc ADMIN
 */
async function canAccessProject(projectId: string, userId: string, userRole: string): Promise<boolean> {
    if (userRole === "ADMIN") return true;

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { pmId: userId },
                { members: { some: { userId } } },
            ],
        },
        select: { id: true },
    });

    return !!project;
}

/**
 * Kiểm tra user có quyền sửa/xóa task không
 * Có quyền nếu: là reporter, assignee, PM của project, hoặc ADMIN
 */
async function canModifyTask(taskId: string, userId: string, userRole: string): Promise<boolean> {
    if (userRole === "ADMIN") return true;

    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            OR: [
                { reporterId: userId },
                { assigneeId: userId },
                { project: { pmId: userId } },
            ],
        },
        select: { id: true },
    });

    return !!task;
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Tạo task mới
 * 
 * @param input - Dữ liệu tạo task (theo CreateTaskSchema)
 * @returns Success với taskId hoặc Error message
 * 
 * @example
 * const result = await createTask({
 *   title: "Thiết kế UI trang chủ",
 *   projectId: "project-id",
 *   priority: "HIGH",
 *   assigneeId: "user-id"
 * });
 */
export async function createTask(
    input: CreateTaskInput
): Promise<ActionResponse<{ id: string }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Validate
        const validatedData = CreateTaskSchema.safeParse(input);
        if (!validatedData.success) {
            const firstError = validatedData.error.issues[0];
            return {
                success: false,
                error: firstError?.message || "Dữ liệu không hợp lệ"
            };
        }

        // 3. Authorize - Kiểm tra quyền truy cập project
        const hasAccess = await canAccessProject(
            validatedData.data.projectId,
            session.user.id,
            session.user.role || "MEMBER"
        );

        if (!hasAccess) {
            return {
                success: false,
                error: "Bạn không có quyền tạo task trong dự án này"
            };
        }

        // 4. Get next position
        const position = await getNextTaskPosition(
            validatedData.data.projectId,
            validatedData.data.status || "TODO"
        );

        // 5. Create task
        const task = await prisma.task.create({
            data: {
                title: validatedData.data.title,
                description: validatedData.data.description,
                priority: validatedData.data.priority,
                status: validatedData.data.status || "TODO",
                type: validatedData.data.type,
                startDate: validatedData.data.startDate,
                dueDate: validatedData.data.dueDate,
                estimateHours: validatedData.data.estimateHours || 0,
                position,
                projectId: validatedData.data.projectId,
                assigneeId: validatedData.data.assigneeId || null,
                reporterId: session.user.id,
            },
            select: { id: true },
        });

        // 6. Revalidate cache
        revalidatePath(`/projects/${validatedData.data.projectId}/tasks`);
        revalidatePath(`/projects/${validatedData.data.projectId}`);

        return {
            success: true,
            data: task,
            message: "Tạo task thành công!"
        };
    } catch (error) {
        console.error("createTask error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}

/**
 * Cập nhật task
 * 
 * @param input - Dữ liệu cập nhật task
 * @returns Success hoặc Error
 */
export async function updateTask(
    input: UpdateTaskInput
): Promise<ActionResponse<{ id: string }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Validate
        const validatedData = UpdateTaskSchema.safeParse(input);
        if (!validatedData.success) {
            const firstError = validatedData.error.issues[0];
            return {
                success: false,
                error: firstError?.message || "Dữ liệu không hợp lệ"
            };
        }

        // 3. Find task
        const existingTask = await prisma.task.findUnique({
            where: { id: validatedData.data.id },
            select: { id: true, projectId: true },
        });

        if (!existingTask) {
            return { success: false, error: "Không tìm thấy task" };
        }

        // 4. Authorize
        const canModify = await canModifyTask(
            validatedData.data.id,
            session.user.id,
            session.user.role || "MEMBER"
        );

        if (!canModify) {
            return {
                success: false,
                error: "Bạn không có quyền chỉnh sửa task này"
            };
        }

        // 5. Update
        const { id, ...updateData } = validatedData.data;

        const task = await prisma.task.update({
            where: { id },
            data: {
                ...(updateData.title && { title: updateData.title }),
                ...(updateData.description !== undefined && { description: updateData.description }),
                ...(updateData.priority && { priority: updateData.priority }),
                ...(updateData.status && { status: updateData.status }),
                ...(updateData.type !== undefined && { type: updateData.type }),
                ...(updateData.startDate !== undefined && { startDate: updateData.startDate }),
                ...(updateData.dueDate !== undefined && { dueDate: updateData.dueDate }),
                ...(updateData.estimateHours !== undefined && { estimateHours: updateData.estimateHours }),
                ...(updateData.assigneeId !== undefined && { assigneeId: updateData.assigneeId || null }),
                ...(updateData.position !== undefined && { position: updateData.position }),
            },
            select: { id: true },
        });

        // 6. Revalidate
        revalidatePath(`/projects/${existingTask.projectId}/tasks`);
        revalidatePath(`/projects/${existingTask.projectId}`);

        return {
            success: true,
            data: task,
            message: "Cập nhật task thành công!"
        };
    } catch (error) {
        console.error("updateTask error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}

/**
 * Cập nhật status của task (dùng cho inline status change)
 * 
 * @param taskId - ID của task
 * @param status - Status mới
 */
export async function updateTaskStatus(
    taskId: string,
    status: TaskStatus
): Promise<ActionResponse<{ id: string }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Find task
        const existingTask = await prisma.task.findUnique({
            where: { id: taskId },
            select: { id: true, projectId: true, status: true },
        });

        if (!existingTask) {
            return { success: false, error: "Không tìm thấy task" };
        }

        // 3. Authorize - Đối với status change, cho phép reporter, assignee, PM, ADMIN
        const canModify = await canModifyTask(
            taskId,
            session.user.id,
            session.user.role || "MEMBER"
        );

        if (!canModify) {
            return {
                success: false,
                error: "Bạn không có quyền thay đổi trạng thái task này"
            };
        }

        // 4. Get new position nếu đổi status (để thêm vào cuối cột mới)
        let newPosition: number | undefined;
        if (existingTask.status !== status) {
            newPosition = await getNextTaskPosition(existingTask.projectId, status);
        }

        // 5. Update
        const task = await prisma.task.update({
            where: { id: taskId },
            data: {
                status,
                ...(newPosition !== undefined && { position: newPosition }),
            },
            select: { id: true },
        });

        // 6. Revalidate
        revalidatePath(`/projects/${existingTask.projectId}/tasks`);
        revalidatePath(`/projects/${existingTask.projectId}`);

        return {
            success: true,
            data: task,
            message: "Cập nhật trạng thái thành công!"
        };
    } catch (error) {
        console.error("updateTaskStatus error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}

/**
 * Xóa task
 * Chỉ reporter, PM của project, hoặc ADMIN mới có thể xóa
 * 
 * @param taskId - ID của task cần xóa
 */
export async function deleteTask(
    taskId: string
): Promise<ActionResponse<null>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Find task
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: {
                id: true,
                projectId: true,
                reporterId: true,
                project: { select: { pmId: true } },
            },
        });

        if (!task) {
            return { success: false, error: "Không tìm thấy task" };
        }

        // 3. Authorize - Chỉ reporter, PM, hoặc ADMIN
        const isAdmin = session.user.role === "ADMIN";
        const isReporter = task.reporterId === session.user.id;
        const isPM = task.project.pmId === session.user.id;

        if (!isAdmin && !isReporter && !isPM) {
            return {
                success: false,
                error: "Bạn không có quyền xóa task này. Chỉ người tạo, PM dự án hoặc ADMIN mới có thể xóa."
            };
        }

        // 4. Delete (cascade sẽ tự động xóa comments, subtasks, etc.)
        await prisma.task.delete({
            where: { id: taskId },
        });

        // 5. Revalidate
        revalidatePath(`/projects/${task.projectId}/tasks`);
        revalidatePath(`/projects/${task.projectId}`);

        return {
            success: true,
            data: null,
            message: "Xóa task thành công!"
        };
    } catch (error) {
        console.error("deleteTask error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}

/**
 * Cập nhật assignee của task
 * 
 * @param taskId - ID của task
 * @param assigneeId - ID của user được assign (null để bỏ assign)
 */
export async function updateTaskAssignee(
    taskId: string,
    assigneeId: string | null
): Promise<ActionResponse<{ id: string }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Find task
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { id: true, projectId: true },
        });

        if (!task) {
            return { success: false, error: "Không tìm thấy task" };
        }

        // 3. Authorize
        const canModify = await canModifyTask(
            taskId,
            session.user.id,
            session.user.role || "MEMBER"
        );

        if (!canModify) {
            return {
                success: false,
                error: "Bạn không có quyền thay đổi người thực hiện task này"
            };
        }

        // 4. Nếu có assigneeId, kiểm tra user có phải member của project không
        if (assigneeId) {
            const isMember = await canAccessProject(task.projectId, assigneeId, "MEMBER");
            if (!isMember) {
                return {
                    success: false,
                    error: "Người được gán phải là thành viên của dự án"
                };
            }
        }

        // 5. Update
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { assigneeId },
            select: { id: true },
        });

        // 6. Revalidate
        revalidatePath(`/projects/${task.projectId}/tasks`);

        return {
            success: true,
            data: updatedTask,
            message: assigneeId ? "Đã gán người thực hiện!" : "Đã bỏ gán người thực hiện!"
        };
    } catch (error) {
        console.error("updateTaskAssignee error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}
