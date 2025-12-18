import { prisma } from "@/server/db";
import { TaskStatus, ProjectStatus } from "@prisma/client";

/**
 * Lấy thống kê tổng quan cho Dashboard
 */
export async function getDashboardStats() {
    const [
        totalProjects,
        totalTasks,
        totalUsers,
        tasksByStatus,
        projectsByStatus,
        recentProjects
    ] = await Promise.all([
        prisma.project.count(),
        prisma.task.count(),
        prisma.user.count(),
        prisma.task.groupBy({
            by: ['status'],
            _count: true,
        }),
        prisma.project.groupBy({
            by: ['status'],
            _count: true,
        }),
        prisma.project.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                pm: {
                    select: { name: true, image: true }
                },
                _count: {
                    select: { tasks: true }
                }
            }
        })
    ]);

    return {
        totalProjects,
        totalTasks,
        totalUsers,
        tasksByStatus,
        projectsByStatus,
        recentProjects
    };
}

/**
 * Lấy dữ liệu biểu đồ phân bổ Task theo trạng thái
 */
export async function getTaskStatusDistribution() {
    const stats = await prisma.task.groupBy({
        by: ['status'],
        _count: true,
    });

    // Map to recharts format
    const statusLabels: Record<TaskStatus, string> = {
        TODO: "Cần làm",
        IN_PROGRESS: "Đang làm",
        REVIEW: "Đang duyệt",
        DONE: "Hoàn thành"
    };

    const colors: Record<TaskStatus, string> = {
        TODO: "#94a3b8", // slate-400
        IN_PROGRESS: "#3b82f6", // blue-500
        REVIEW: "#f59e0b", // amber-500
        DONE: "#10b981" // emerald-500
    };

    return stats.map(item => ({
        name: statusLabels[item.status],
        value: item._count,
        color: colors[item.status]
    }));
}

/**
 * Lấy khối lượng công việc theo người dùng (Top 5 users có nhiều task nhất)
 */
export async function getUserWorkloadStats() {
    const users = await prisma.user.findMany({
        take: 8,
        where: {
            assignedTasks: {
                some: {
                    status: { not: 'DONE' }
                }
            }
        },
        select: {
            name: true,
            _count: {
                select: {
                    assignedTasks: {
                        where: { status: { not: 'DONE' } }
                    }
                }
            }
        },
        orderBy: {
            assignedTasks: {
                _count: 'desc'
            }
        }
    });

    return users.map(user => ({
        name: user.name || "N/A",
        tasks: user._count.assignedTasks
    }));
}
