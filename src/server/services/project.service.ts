/**
 * PROJECT SERVICE
 * 
 * Service layer chứa logic truy vấn database.
 * Pattern này giúp tách biệt:
 * - Server Actions: xử lý validation, auth, gọi service
 * - Services: truy vấn database thuần túy, có thể reuse
 * 
 * Lợi ích:
 * 1. Service có thể được gọi từ nhiều nơi (Actions, API Routes, Scripts)
 * 2. Dễ test riêng từng layer
 * 3. Logic database tập trung một chỗ
 */

import { prisma } from "@/server/db";
import type { Priority, ProjectStatus, Prisma } from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Options cho getProjects
 * Sử dụng optional properties để linh hoạt filter
 */
export interface GetProjectsOptions {
    /** Lọc theo PM (Project Manager) */
    pmId?: string;
    /** Lọc theo status */
    status?: ProjectStatus;
    /** Lọc theo priority */
    priority?: Priority;
    /** Tìm kiếm theo tên hoặc mã dự án */
    search?: string;
    /** Số lượng kết quả (phân trang) */
    take?: number;
    /** Bỏ qua bao nhiêu kết quả (phân trang) */
    skip?: number;
    /** Sắp xếp theo trường */
    orderBy?: "createdAt" | "updatedAt" | "name" | "dueDate";
    /** Thứ tự sắp xếp */
    orderDir?: "asc" | "desc";
}

/**
 * Thông tin trả về khi lấy danh sách projects
 * Sử dụng Prisma.ProjectGetPayload để tự động infer types từ select/include
 */
export type ProjectListItem = Prisma.ProjectGetPayload<{
    select: {
        id: true;
        name: true;
        code: true;
        slug: true;
        description: true;
        clientName: true;
        status: true;
        priority: true;
        startDate: true;
        dueDate: true;
        createdAt: true;
        pm: {
            select: {
                id: true;
                name: true;
                email: true;
                image: true;
            };
        };
        _count: {
            select: {
                tasks: true;
                members: true;
            };
        };
    };
}>;

/**
 * Thông tin chi tiết project (bao gồm cả members và recent tasks)
 */
export type ProjectDetail = Prisma.ProjectGetPayload<{
    select: {
        id: true;
        name: true;
        code: true;
        slug: true;
        description: true;
        clientName: true;
        status: true;
        priority: true;
        startDate: true;
        dueDate: true;
        completedAt: true;
        budget: true;
        createdAt: true;
        updatedAt: true;
        pm: {
            select: {
                id: true;
                name: true;
                email: true;
                image: true;
            };
        };
        members: {
            select: {
                id: true;
                role: true;
                joinedAt: true;
                user: {
                    select: {
                        id: true;
                        name: true;
                        email: true;
                        image: true;
                    };
                };
            };
        };
        _count: {
            select: {
                tasks: true;
                members: true;
            };
        };
    };
}>;

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Lấy danh sách projects với các options filter/sort/paginate
 * 
 * @param options - Các tham số lọc, sắp xếp, phân trang
 * @returns Danh sách projects và tổng số
 * 
 * @example
 * // Lấy tất cả projects của một PM
 * const { projects, total } = await getProjects({ pmId: "user-id" });
 * 
 * @example
 * // Tìm kiếm với phân trang
 * const { projects } = await getProjects({ 
 *   search: "web", 
 *   take: 10, 
 *   skip: 0 
 * });
 */
export async function getProjects(options: GetProjectsOptions = {}) {
    const {
        pmId,
        status,
        priority,
        search,
        take = 20,
        skip = 0,
        orderBy = "createdAt",
        orderDir = "desc",
    } = options;

    // Build where clause dynamically
    const where: Prisma.ProjectWhereInput = {
        // Filter by PM
        ...(pmId && { pmId }),
        // Filter by status
        ...(status && { status }),
        // Filter by priority
        ...(priority && { priority }),
        // Search by name or code
        ...(search && {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
                { clientName: { contains: search, mode: "insensitive" } },
            ],
        }),
    };

    // Execute query với count song song (tối ưu performance)
    const [projects, total] = await Promise.all([
        prisma.project.findMany({
            where,
            select: {
                id: true,
                name: true,
                code: true,
                slug: true,
                description: true,
                clientName: true,
                status: true,
                priority: true,
                startDate: true,
                dueDate: true,
                createdAt: true,
                pm: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
            orderBy: { [orderBy]: orderDir },
            take,
            skip,
        }),
        prisma.project.count({ where }),
    ]);

    return {
        projects,
        total,
        hasMore: skip + projects.length < total,
    };
}

/**
 * Lấy chi tiết một project theo ID hoặc slug
 * 
 * @param identifier - Project ID hoặc slug
 * @returns Project detail hoặc null nếu không tìm thấy
 * 
 * @example
 * const project = await getProjectById("clxxx...");
 * 
 * @example
 * const project = await getProjectById("my-project-slug");
 */
export async function getProjectById(
    identifier: string
): Promise<ProjectDetail | null> {
    // Kiểm tra là ID (CUID format) hay slug
    const isCuid = identifier.startsWith("c") && identifier.length === 25;

    const project = await prisma.project.findFirst({
        where: isCuid ? { id: identifier } : { slug: identifier },
        select: {
            id: true,
            name: true,
            code: true,
            slug: true,
            description: true,
            clientName: true,
            status: true,
            priority: true,
            startDate: true,
            dueDate: true,
            completedAt: true,
            budget: true,
            createdAt: true,
            updatedAt: true,
            pm: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            members: {
                select: {
                    id: true,
                    role: true,
                    joinedAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
                orderBy: { joinedAt: "asc" },
            },
            _count: {
                select: {
                    tasks: true,
                    members: true,
                },
            },
        },
    });

    return project;
}

/**
 * Kiểm tra user có quyền truy cập project không
 * User có quyền nếu:
 * - Là PM của project
 * - Là member của project
 * - Là ADMIN
 * 
 * @param projectId - ID của project
 * @param userId - ID của user
 * @param userRole - Role của user (ADMIN, PM, MEMBER, VIEWER)
 * @returns true nếu có quyền
 */
export async function canAccessProject(
    projectId: string,
    userId: string,
    userRole: string
): Promise<boolean> {
    // Admin có quyền truy cập tất cả
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
 * Lấy thống kê của một project
 * 
 * @param projectId - ID của project
 * @returns Object chứa các thống kê
 */
export async function getProjectStats(projectId: string) {
    const [taskStats, memberCount, timeLoggedHours] = await Promise.all([
        // Đếm tasks theo status
        prisma.task.groupBy({
            by: ["status"],
            where: { projectId },
            _count: true,
        }),
        // Đếm members
        prisma.projectMember.count({ where: { projectId } }),
        // Tổng giờ đã log
        prisma.timeLog.aggregate({
            where: { task: { projectId } },
            _sum: { hours: true },
        }),
    ]);

    // Transform taskStats thành object dễ dùng
    const tasksByStatus = taskStats.reduce(
        (acc, item) => {
            acc[item.status] = item._count;
            return acc;
        },
        {} as Record<string, number>
    );

    const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);
    const completedTasks = tasksByStatus["DONE"] || 0;

    return {
        totalTasks,
        completedTasks,
        tasksByStatus,
        memberCount,
        totalHoursLogged: timeLoggedHours._sum.hours || 0,
        completionPercentage: totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0,
    };
}
