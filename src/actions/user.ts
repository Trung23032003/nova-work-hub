"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";
import { CreateUserSchema, CreateUserInput, UpdateUserSchema, UpdateUserInput } from "@/lib/zod-schemas";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "@prisma/client";

/**
 * Action Response Type
 */
export type ActionResponse<T> =
    | { success: true; data: T; message?: string }
    | { success: false; error: string };

/**
 * Tạo người dùng mới
 * Chỉ ADMIN mới có quyền này
 */
export async function createUser(input: CreateUserInput): Promise<ActionResponse<any>> {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return { success: false, error: "Bạn không có quyền thực hiện hành động này" };
        }

        const validatedFields = CreateUserSchema.safeParse(input);

        if (!validatedFields.success) {
            return { success: false, error: "Dữ liệu không hợp lệ: " + validatedFields.error.issues.map(i => i.message).join(", ") };
        }

        const { email, name, password, role, departmentId } = validatedFields.data;

        // Kiểm tra email tồn tại
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { success: false, error: "Email này đã được sử dụng" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: role as UserRole,
                departmentId,
            },
        });

        revalidatePath("/admin/users");
        return { success: true, data: user, message: "Tạo người dùng thành công" };
    } catch (error) {
        console.error("[CREATE_USER_ERROR]", error);
        return { success: false, error: "Đã xảy ra lỗi khi tạo người dùng" };
    }
}

/**
 * Cập nhật thông tin người dùng
 * Chỉ ADMIN mới có quyền này
 */
export async function updateUser(input: UpdateUserInput): Promise<ActionResponse<any>> {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return { success: false, error: "Bạn không có quyền thực hiện hành động này" };
        }

        const validatedFields = UpdateUserSchema.safeParse(input);

        if (!validatedFields.success) {
            return { success: false, error: "Dữ liệu không hợp lệ" };
        }

        const { id, password, ...data } = validatedFields.data;

        // Prepare update data
        const updateData: any = { ...data };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/admin/users");
        return { success: true, data: user, message: "Cập nhật người dùng thành công" };
    } catch (error) {
        console.error("[UPDATE_USER_ERROR]", error);
        return { success: false, error: "Đã xảy ra lỗi khi cập nhật người dùng" };
    }
}

/**
 * Thay đổi trạng thái người dùng
 */
export async function updateUserStatus(id: string, status: UserStatus): Promise<ActionResponse<any>> {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return { success: false, error: "Bạn không có quyền thực hiện hành động này" };
        }

        // Không cho phép tự khóa chính mình
        if (id === session.user.id) {
            return { success: false, error: "Bạn không thể tự thay đổi trạng thái của chính mình" };
        }

        const user = await prisma.user.update({
            where: { id },
            data: { status },
        });

        revalidatePath("/admin/users");
        return { success: true, data: user, message: "Cập nhật trạng thái thành công" };
    } catch (error) {
        console.error("[UPDATE_USER_STATUS_ERROR]", error);
        return { success: false, error: "Đã xảy ra lỗi khi cập nhật trạng thái" };
    }
}

/**
 * Xóa người dùng
 * Chỉ ADMIN mới có quyền này
 */
export async function deleteUser(id: string): Promise<ActionResponse<null>> {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return { success: false, error: "Bạn không có quyền thực hiện hành động này" };
        }

        // Không cho phép tự xóa chính mình
        if (id === session.user.id) {
            return { success: false, error: "Bạn không thể tự xóa chính mình" };
        }

        // Kiểm tra xem user có đang quản lý dự án nào không
        const managedProjectsCount = await prisma.project.count({
            where: { pmId: id }
        });

        if (managedProjectsCount > 0) {
            return {
                success: false,
                error: `Người dùng này đang quản lý ${managedProjectsCount} dự án. Vui lòng bàn giao dự án trước khi xóa.`
            };
        }

        // Kiểm tra xem user có đang là reporter của task nào không
        const reportedTasksCount = await prisma.task.count({
            where: { reporterId: id }
        });

        if (reportedTasksCount > 0) {
            return {
                success: false,
                error: `Người dùng này đang là người báo cáo của ${reportedTasksCount} công việc. Vui lòng thay đổi người báo cáo trước khi xóa.`
            };
        }

        await prisma.user.delete({
            where: { id },
        });

        revalidatePath("/admin/users");
        return { success: true, data: null, message: "Xóa người dùng thành công" };
    } catch (error) {
        console.error("[DELETE_USER_ERROR]", error);
        return { success: false, error: "Đã xảy ra lỗi khi xóa người dùng. Có thể do ràng buộc dữ liệu." };
    }
}
