/**
 * TASK SERVICE
 * 
 * Service layer chứa logic truy vấn database cho Tasks.
 * Pattern này giúp tách biệt:
 * - Server Actions: xử lý validation, auth, gọi service
 * - Services: truy vấn database thuần túy, có thể reuse
 */

import { prisma } from "@/server/db";
import type { Priority, TaskStatus, Prisma } from "@prisma/client";

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Options cho getTasksByProject
 */
export interface GetTasksOptions {
    /** ID của project */
    projectId: string;
    /** Lọc theo status */
    status?: TaskStatus;
    /** Lọc theo priority */
    priority?: Priority;
    /** Lọc theo assignee */
    assigneeId?: string;
    /** Tìm kiếm theo title */
    search?: string;
    /** Số lượng kết quả (phân trang) */
    take?: number;
    /** Bỏ qua bao nhiêu kết quả (phân trang) */
    skip?: number;
    /** Sắp xếp theo trường */
    orderBy?: "createdAt" | "updatedAt" | "title" | "dueDate" | "priority" | "position";
    /** Thứ tự sắp xếp */
    orderDir?: "asc" | "desc";
}

/**
 * Thông tin trả về khi lấy danh sách tasks
 */
export type TaskListItem = Prisma.TaskGetPayload<{
    select: {
        id: true;
        title: true;
        description: true;
        status: true;
        priority: true;
        type: true;
        position: true;
        startDate: true;
        dueDate: true;
        estimateHours: true;
        createdAt: true;
        updatedAt: true;
        assignee: {
            select: {
                id: true;
                name: true;
                email: true;
                image: true;
            };
        };
        reporter: {
            select: {
                id: true;
                name: true;
                email: true;
                image: true;
            };
        };
        _count: {
            select: {
                comments: true;
                subtasks: true;
            };
        };
    };
}>;

/**
 * Thông tin chi tiết task
 */
export type TaskDetail = Prisma.TaskGetPayload<{
    select: {
        id: true;
        title: true;
        description: true;
        status: true;
        priority: true;
        type: true;
        position: true;
        startDate: true;
        dueDate: true;
        estimateHours: true;
        createdAt: true;
        updatedAt: true;
        projectId: true;
        project: {
            select: {
                id: true;
                name: true;
                code: true;
            };
        };
        assignee: {
            select: {
                id: true;
                name: true;
                email: true;
                image: true;
            };
        };
        reporter: {
            select: {
                id: true;
                name: true;
                email: true;
                image: true;
            };
        };
        subtasks: {
            select: {
                id: true;
                title: true;
                isDone: true;
            };
        };
        _count: {
            select: {
                comments: true;
                subtasks: true;
                timeLogs: true;
            };
        };
    };
}>;

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Lấy danh sách tasks của một project
 * 
 * @param options - Các tham số lọc, sắp xếp, phân trang
 * @returns Danh sách tasks và tổng số
 * 
 * @example
 * const { tasks, total } = await getTasksByProject({ projectId: "xxx" });
 * 
 * @example
 * const { tasks } = await getTasksByProject({ 
 *   projectId: "xxx",
 *   status: "TODO",
 *   take: 10 
 * });
 */
export async function getTasksByProject(options: GetTasksOptions) {
    const {
        projectId,
        status,
        priority,
        assigneeId,
        search,
        take = 50,
        skip = 0,
        orderBy = "position",
        orderDir = "asc",
    } = options;

    // Build where clause dynamically
    const where: Prisma.TaskWhereInput = {
        projectId,
        // Filter by status
        ...(status && { status }),
        // Filter by priority
        ...(priority && { priority }),
        // Filter by assignee
        ...(assigneeId && { assigneeId }),
        // Search by title
        ...(search && {
            title: { contains: search, mode: "insensitive" },
        }),
    };

    // Execute query với count song song
    const [tasks, total] = await Promise.all([
        prisma.task.findMany({
            where,
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                type: true,
                position: true,
                startDate: true,
                dueDate: true,
                estimateHours: true,
                createdAt: true,
                updatedAt: true,
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        subtasks: true,
                    },
                },
            },
            orderBy: { [orderBy]: orderDir },
            take,
            skip,
        }),
        prisma.task.count({ where }),
    ]);

    return {
        tasks,
        total,
        hasMore: skip + tasks.length < total,
    };
}

/**
 * Lấy chi tiết một task
 * 
 * @param taskId - ID của task
 * @returns Task detail hoặc null nếu không tìm thấy
 */
export async function getTaskById(taskId: string): Promise<TaskDetail | null> {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            type: true,
            position: true,
            startDate: true,
            dueDate: true,
            estimateHours: true,
            createdAt: true,
            updatedAt: true,
            projectId: true,
            project: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            reporter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            subtasks: {
                select: {
                    id: true,
                    title: true,
                    isDone: true,
                },
            },
            _count: {
                select: {
                    comments: true,
                    subtasks: true,
                    timeLogs: true,
                },
            },
        },
    });

    return task;
}

/**
 * Lấy tất cả members của một project (để assign task)
 * 
 * @param projectId - ID của project
 * @returns Danh sách members có thể assign
 */
export async function getProjectMembers(projectId: string) {
    const members = await prisma.projectMember.findMany({
        where: { projectId },
        select: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });

    // Lấy thêm PM (không nằm trong members table)
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            pm: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });

    // Map ra chỉ lấy user info
    const memberUsers = members.map(m => m.user);

    // Thêm PM nếu chưa có trong list (tránh duplicate)
    if (project?.pm && !memberUsers.some(u => u.id === project.pm.id)) {
        memberUsers.unshift(project.pm);
    }

    return memberUsers;
}

/**
 * Lấy position mới cho task (để thêm vào cuối cột)
 * 
 * @param projectId - ID của project
 * @param status - Status của task
 * @returns Position mới
 */
export async function getNextTaskPosition(
    projectId: string,
    status: TaskStatus = "TODO"
): Promise<number> {
    const lastTask = await prisma.task.findFirst({
        where: { projectId, status },
        orderBy: { position: "desc" },
        select: { position: true },
    });

    // Position mới = position cuối + 1000 (để có khoảng trống cho reorder)
    return (lastTask?.position || 0) + 1000;
}

/**
 * Đếm số tasks theo status của một project
 * 
 * @param projectId - ID của project
 * @returns Object với số lượng tasks theo từng status
 */
export async function getTaskCountsByStatus(projectId: string) {
    const counts = await prisma.task.groupBy({
        by: ["status"],
        where: { projectId },
        _count: true,
    });

    const result: Record<TaskStatus, number> = {
        TODO: 0,
        IN_PROGRESS: 0,
        REVIEW: 0,
        DONE: 0,
    };

    counts.forEach(item => {
        result[item.status] = item._count;
    });

    return result;
}
