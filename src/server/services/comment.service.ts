/**
 * COMMENT SERVICE
 * 
 * Service layer cho Comment operations.
 * Handles database queries cho comments của tasks.
 */

import { prisma } from "@/server/db";

// ============================================
// TYPES
// ============================================

export interface CommentListItem {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

export interface GetCommentsOptions {
    taskId: string;
    take?: number;
    skip?: number;
}

// ============================================
// QUERY FUNCTIONS
// ============================================

/**
 * Get comments for a task
 */
export async function getCommentsByTask(options: GetCommentsOptions) {
    const { taskId, take = 50, skip = 0 } = options;

    const [comments, total] = await Promise.all([
        prisma.comment.findMany({
            where: {
                taskId,
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take,
            skip,
        }),
        prisma.comment.count({
            where: {
                taskId,
            },
        }),
    ]);

    return {
        comments,
        total,
        hasMore: skip + comments.length < total,
    };
}

/**
 * Get single comment by ID
 */
export async function getCommentById(commentId: string) {
    return prisma.comment.findUnique({
        where: {
            id: commentId,
        },
        select: {
            id: true,
            content: true,
            taskId: true,
            authorId: true,
            createdAt: true,
            updatedAt: true,
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });
}

/**
 * Check if user can delete comment
 * (Author or ADMIN can delete)
 */
export async function canDeleteComment(commentId: string, userId: string, userRole: string): Promise<boolean> {
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true },
    });

    if (!comment) return false;

    // Author or ADMIN can delete
    return comment.authorId === userId || userRole === "ADMIN";
}
