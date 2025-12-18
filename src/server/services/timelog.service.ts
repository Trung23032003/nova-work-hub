import { prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

/**
 * Type cho TimeLog Item trong danh sách
 */
export type TimeLogListItem = Prisma.TimeLogGetPayload<{
    include: {
        user: {
            select: {
                id: true;
                name: true;
                image: true;
            };
        };
    };
}>;

/**
 * Lấy danh sách logs giờ của một task
 */
export async function getTimeLogsByTask(taskId: string): Promise<TimeLogListItem[]> {
    return await prisma.timeLog.findMany({
        where: { taskId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
        },
        orderBy: {
            date: "desc",
        },
    });
}

/**
 * Tính tổng số giờ đã log cho một task
 */
export async function getTotalHoursByTask(taskId: string): Promise<number> {
    const result = await prisma.timeLog.aggregate({
        where: { taskId },
        _sum: {
            hours: true,
        },
    });

    return result._sum.hours || 0;
}

/**
 * Kiểm tra quyền xóa log giờ
 * Quy tắc:
 * 1. Chủ nhân của log giờ (userId khớp)
 * 2. ADMIN có quyền xóa mọi log
 */
export async function canDeleteTimeLog(
    logId: string,
    userId: string,
    userRole: string
): Promise<boolean> {
    if (userRole === "ADMIN") return true;

    const log = await prisma.timeLog.findUnique({
        where: { id: logId },
        select: { userId: true },
    });

    return log?.userId === userId;
}
