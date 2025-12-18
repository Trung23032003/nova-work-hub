"use server";

/**
 * PROJECT SERVER ACTIONS
 * 
 * Server Actions là hàm chạy trên server, được gọi từ client.
 * Ưu điểm:
 * - Không cần tạo API route riêng
 * - Tự động serialize/deserialize data
 * - Type-safe end-to-end
 * - Có thể revalidate cache
 * 
 * Pattern này:
 * 1. Authenticate: Kiểm tra session
 * 2. Authorize: Kiểm tra quyền
 * 3. Validate: Validate input với Zod
 * 4. Execute: Gọi service hoặc Prisma
 * 5. Return: Trả về kết quả hoặc lỗi
 */

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";
import {
    CreateProjectSchema,
    UpdateProjectSchema,
    type CreateProjectInput,
} from "@/lib/zod-schemas";
import type { ProjectStatus } from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Chuẩn hóa response cho tất cả actions
 * Pattern này giúp client dễ handle kết quả
 */
export type ActionResponse<T = unknown> =
    | { success: true; data: T; message?: string }
    | { success: false; error: string };

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Tạo slug từ tên project
 * Ví dụ: "Website E-commerce" -> "website-e-commerce"
 */
function generateSlug(name: string, code: string): string {
    const baseSlug = name
        .toLowerCase()
        .normalize("NFD") // Chuẩn hóa Unicode
        .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-") // Thay thế ký tự đặc biệt bằng -
        .replace(/(^-|-$)+/g, ""); // Xóa - ở đầu và cuối

    // Thêm code vào slug để đảm bảo unique
    return `${baseSlug}-${code.toLowerCase()}`;
}

/**
 * Kiểm tra user có quyền tạo/sửa project không
 * ADMIN và PM có thể tạo project
 */
function canManageProject(role: string | undefined): boolean {
    return role === "ADMIN" || role === "PM";
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Tạo project mới
 * 
 * Yêu cầu: User phải đăng nhập và có role ADMIN hoặc PM
 * 
 * @param input - Dữ liệu tạo project (theo CreateProjectSchema)
 * @returns Success với projectId hoặc Error message
 * 
 * @example
 * // Client component
 * const result = await createProject({
 *   name: "Website E-commerce",
 *   code: "WEB-001",
 *   priority: "HIGH",
 *   pmId: "user-id"
 * });
 * 
 * if (result.success) {
 *   toast.success("Tạo dự án thành công!");
 *   router.push(`/projects/${result.data.id}`);
 * } else {
 *   toast.error(result.error);
 * }
 */
export async function createProject(
    input: CreateProjectInput
): Promise<ActionResponse<{ id: string; slug: string | null }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Authorize
        if (!canManageProject(session.user.role)) {
            return {
                success: false,
                error: "Bạn không có quyền tạo dự án. Chỉ ADMIN và PM mới có quyền này."
            };
        }

        // 3. Validate
        const validatedData = CreateProjectSchema.safeParse(input);
        if (!validatedData.success) {
            // Lấy lỗi đầu tiên
            const firstError = validatedData.error.issues[0];
            return {
                success: false,
                error: firstError?.message || "Dữ liệu không hợp lệ"
            };
        }

        // 4. Check duplicates
        const existingProject = await prisma.project.findFirst({
            where: { code: validatedData.data.code },
        });

        if (existingProject) {
            return {
                success: false,
                error: `Mã dự án "${validatedData.data.code}" đã tồn tại`
            };
        }

        // 5. Create project
        const slug = generateSlug(validatedData.data.name, validatedData.data.code);

        const project = await prisma.project.create({
            data: {
                ...validatedData.data,
                slug,
                // Tự động thêm PM vào project members
                members: {
                    create: {
                        userId: validatedData.data.pmId,
                        role: "PM",
                    },
                },
            },
            select: {
                id: true,
                slug: true,
            },
        });

        // 6. Revalidate cache
        revalidatePath("/projects");

        return {
            success: true,
            data: project,
            message: "Tạo dự án thành công!"
        };
    } catch (error) {
        console.error("createProject error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}

/**
 * Cập nhật status của project
 * 
 * @param projectId - ID của project
 * @param status - Status mới
 * @returns Success hoặc Error
 * 
 * @example
 * await updateProjectStatus("project-id", "IN_PROGRESS");
 */
export async function updateProjectStatus(
    projectId: string,
    status: ProjectStatus
): Promise<ActionResponse<{ id: string }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Find project & authorize
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                pmId: true,
                status: true,
            },
        });

        if (!project) {
            return { success: false, error: "Không tìm thấy dự án" };
        }

        // Chỉ PM của project hoặc ADMIN mới có thể đổi status
        const isAdmin = session.user.role === "ADMIN";
        const isPM = project.pmId === session.user.id;

        if (!isAdmin && !isPM) {
            return {
                success: false,
                error: "Bạn không có quyền thay đổi trạng thái dự án này"
            };
        }

        // 3. Update
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                status,
                // Nếu chuyển sang DONE, tự động set completedAt
                ...(status === "DONE" && { completedAt: new Date() }),
                // Nếu chuyển từ DONE sang status khác, xóa completedAt
                ...(status !== "DONE" && project.status === "DONE" && { completedAt: null }),
            },
            select: { id: true },
        });

        // 4. Revalidate
        revalidatePath("/projects");
        revalidatePath(`/projects/${projectId}`);

        return {
            success: true,
            data: updatedProject,
            message: "Cập nhật trạng thái thành công!"
        };
    } catch (error) {
        console.error("updateProjectStatus error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}

/**
 * Cập nhật thông tin project
 * 
 * @param input - Dữ liệu cập nhật (theo UpdateProjectSchema)
 * @returns Success hoặc Error
 */
export async function updateProject(
    input: { id: string } & Partial<CreateProjectInput>
): Promise<ActionResponse<{ id: string }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Validate
        const validatedData = UpdateProjectSchema.safeParse(input);
        if (!validatedData.success) {
            const firstError = validatedData.error.issues[0];
            return {
                success: false,
                error: firstError?.message || "Dữ liệu không hợp lệ"
            };
        }

        // 3. Find project & authorize
        const project = await prisma.project.findUnique({
            where: { id: validatedData.data.id },
            select: { id: true, pmId: true, name: true, code: true },
        });

        if (!project) {
            return { success: false, error: "Không tìm thấy dự án" };
        }

        const isAdmin = session.user.role === "ADMIN";
        const isPM = project.pmId === session.user.id;

        if (!isAdmin && !isPM) {
            return {
                success: false,
                error: "Bạn không có quyền chỉnh sửa dự án này"
            };
        }

        // 4. Check code duplicate nếu đổi code
        if (validatedData.data.code && validatedData.data.code !== project.code) {
            const existingProject = await prisma.project.findFirst({
                where: {
                    code: validatedData.data.code,
                    NOT: { id: project.id },
                },
            });

            if (existingProject) {
                return {
                    success: false,
                    error: `Mã dự án "${validatedData.data.code}" đã tồn tại`
                };
            }
        }

        // 5. Update
        const { id, ...updateData } = validatedData.data;

        // Regenerate slug nếu name hoặc code thay đổi
        let newSlug: string | undefined;
        if (updateData.name || updateData.code) {
            newSlug = generateSlug(
                updateData.name || project.name,
                updateData.code || project.code
            );
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                ...updateData,
                ...(newSlug && { slug: newSlug }),
            },
            select: { id: true },
        });

        // 6. Revalidate
        revalidatePath("/projects");
        revalidatePath(`/projects/${id}`);

        return {
            success: true,
            data: updatedProject,
            message: "Cập nhật dự án thành công!"
        };
    } catch (error) {
        console.error("updateProject error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}

/**
 * Xóa project
 * Chỉ ADMIN mới có quyền xóa
 * 
 * @param projectId - ID của project cần xóa
 */
export async function deleteProject(
    projectId: string
): Promise<ActionResponse<null>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Authorize - Chỉ ADMIN
        if (session.user.role !== "ADMIN") {
            return {
                success: false,
                error: "Chỉ ADMIN mới có quyền xóa dự án"
            };
        }

        // 3. Check project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true },
        });

        if (!project) {
            return { success: false, error: "Không tìm thấy dự án" };
        }

        // 4. Delete (cascade sẽ tự động xóa tasks, members, etc.)
        await prisma.project.delete({
            where: { id: projectId },
        });

        // 5. Revalidate
        revalidatePath("/projects");

        return {
            success: true,
            data: null,
            message: "Xóa dự án thành công!"
        };
    } catch (error) {
        console.error("deleteProject error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}

/**
 * Thêm member vào project
 * 
 * @param projectId - ID của project
 * @param userId - ID của user cần thêm
 * @param role - Role trong project (mặc định: "MEMBER")
 */
export async function addProjectMember(
    projectId: string,
    userId: string,
    role: string = "MEMBER"
): Promise<ActionResponse<{ id: string }>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Find project & authorize
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, pmId: true },
        });

        if (!project) {
            return { success: false, error: "Không tìm thấy dự án" };
        }

        const isAdmin = session.user.role === "ADMIN";
        const isPM = project.pmId === session.user.id;

        if (!isAdmin && !isPM) {
            return {
                success: false,
                error: "Bạn không có quyền thêm thành viên vào dự án này"
            };
        }

        // 3. Check if already member
        const existingMember = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: { projectId, userId }
            },
        });

        if (existingMember) {
            return { success: false, error: "Người dùng đã là thành viên của dự án" };
        }

        // 4. Add member
        const member = await prisma.projectMember.create({
            data: {
                projectId,
                userId,
                role,
            },
            select: { id: true },
        });

        // 5. Revalidate
        revalidatePath(`/projects/${projectId}`);

        return {
            success: true,
            data: member,
            message: "Thêm thành viên thành công!"
        };
    } catch (error) {
        console.error("addProjectMember error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}

/**
 * Xóa member khỏi project
 * 
 * @param projectId - ID của project
 * @param userId - ID của user cần xóa
 */
export async function removeProjectMember(
    projectId: string,
    userId: string
): Promise<ActionResponse<null>> {
    try {
        // 1. Authenticate
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Bạn cần đăng nhập để thực hiện" };
        }

        // 2. Find project & authorize
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, pmId: true },
        });

        if (!project) {
            return { success: false, error: "Không tìm thấy dự án" };
        }

        // Không thể xóa PM ra khỏi project
        if (userId === project.pmId) {
            return {
                success: false,
                error: "Không thể xóa Project Manager ra khỏi dự án. Hãy chuyển giao PM trước."
            };
        }

        const isAdmin = session.user.role === "ADMIN";
        const isPM = project.pmId === session.user.id;

        if (!isAdmin && !isPM) {
            return {
                success: false,
                error: "Bạn không có quyền xóa thành viên khỏi dự án này"
            };
        }

        // 3. Delete member
        await prisma.projectMember.delete({
            where: {
                projectId_userId: { projectId, userId }
            },
        });

        // 4. Revalidate
        revalidatePath(`/projects/${projectId}`);

        return {
            success: true,
            data: null,
            message: "Xóa thành viên thành công!"
        };
    } catch (error) {
        console.error("removeProjectMember error:", error);
        return {
            success: false,
            error: "Đã có lỗi xảy ra. Vui lòng thử lại sau."
        };
    }
}
