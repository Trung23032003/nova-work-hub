/**
 * Prisma Client Singleton
 * 
 * Sử dụng Driver Adapter (bắt buộc cho Prisma 7)
 * Import file này để sử dụng Prisma trong toàn app:
 * 
 * import { prisma } from "@/server/db";
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Lấy connection string từ environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error(
        "DATABASE_URL is not set. Please check your .env file."
    );
}

// Tạo connection pool
const pool = new Pool({ connectionString });

// Tạo adapter cho PostgreSQL
const adapter = new PrismaPg(pool);

// Singleton pattern để tránh tạo nhiều instances trong development
// (Next.js hot reload sẽ tạo nhiều instances nếu không dùng pattern này)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        // Bật logging trong development
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

// Export mặc định
export default prisma;
