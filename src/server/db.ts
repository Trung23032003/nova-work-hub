import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton Pattern
 * 
 * Giải thích tại sao cần pattern này:
 * - Trong development, Next.js hot-reload sẽ tạo nhiều instances
 * - Mỗi PrismaClient là 1 connection pool riêng
 * - Nếu tạo nhiều instances → lỗi "Too many connections"
 * 
 * Pattern này đảm bảo:
 * - Production: Tạo 1 instance duy nhất
 * - Development: Lưu instance vào globalThis để reuse
 */

// Khai báo biến toàn cục để TypeScript hiểu
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Khởi tạo Prisma Client với các options
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"] // Log queries trong dev
                : ["error"], // Chỉ log errors trong production
    });

// Lưu vào global trong development
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
