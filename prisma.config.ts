import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "npx tsx prisma/seed.ts",
    },
    datasource: {
        // Sử dụng DIRECT_URL cho migrations (port 5432, không qua pooler)
        // DATABASE_URL (port 6543) dùng cho runtime trong app
        url: env("DIRECT_URL") || env("DATABASE_URL"),
    },
});
