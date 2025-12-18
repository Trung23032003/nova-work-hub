import { prisma } from "@/server/db";
import { UserRole, UserStatus, Prisma } from "@prisma/client";

export type UserListItem = Prisma.UserGetPayload<{
    include: {
        department: true;
        _count: {
            select: {
                assignedTasks: true;
                managedProjects: true;
            };
        };
    };
}>;

export interface GetUsersOptions {
    role?: UserRole;
    status?: UserStatus;
    departmentId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

/**
 * Lấy danh sách người dùng với filter và phân trang
 */
export async function getUsers(options: GetUsersOptions = {}) {
    const {
        role,
        status,
        departmentId,
        search,
        page = 1,
        pageSize = 10,
    } = options;

    const skip = (page - 1) * pageSize;

    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                department: true,
                _count: {
                    select: {
                        assignedTasks: true,
                        managedProjects: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}

/**
 * Lấy danh sách tất cả phòng ban
 */
export async function getDepartments() {
    return prisma.department.findMany({
        orderBy: { name: 'asc' },
    });
}

/**
 * Lấy chi tiết người dùng
 */
export async function getUserById(id: string) {
    return prisma.user.findUnique({
        where: { id },
        include: {
            department: true,
            _count: {
                select: {
                    assignedTasks: true,
                    managedProjects: true,
                    reportedTasks: true,
                    comments: true,
                },
            },
        },
    });
}
