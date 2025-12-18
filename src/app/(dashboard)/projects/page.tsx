/**
 * ============================================================================
 * PROJECTS PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang danh sách dự án
 * URL: /projects
 * 
 * Features:
 * - Hiển thị danh sách projects dạng cards
 * - Tạo project mới qua modal
 * - Filter theo status (TODO)
 * - Phân trang (TODO)
 * 
 * ============================================================================
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { getProjects } from "@/server/services/project.service";
import { ProjectsPageClient } from "./page-client";

export const metadata = {
    title: "Dự án | NovaWork Hub",
    description: "Quản lý các dự án của bạn",
};

export default async function ProjectsPage() {
    // Auth check
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    // Fetch projects
    const { projects, total } = await getProjects({
        take: 50,
        orderBy: "createdAt",
        orderDir: "desc",
    });

    // Fetch users for PM selection (only ADMIN and PM roles)
    const users = await prisma.user.findMany({
        where: {
            role: { in: ["ADMIN", "PM"] },
            status: "ACTIVE",
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
        orderBy: { name: "asc" },
    });

    return (
        <ProjectsPageClient
            projects={projects}
            totalProjects={total}
            users={users}
            currentUserId={session.user.id}
            userRole={session.user.role}
        />
    );
}
