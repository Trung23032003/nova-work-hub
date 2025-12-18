/**
 * PROJECT TASKS PAGE
 * 
 * URL: /projects/[projectId]/tasks
 * Server Component - Fetch tasks data và render
 * 
 * Features:
 * - Hiển thị danh sách tasks dạng table
 * - Filter theo status, priority, assignee
 * - Search task
 * - Tạo task mới
 * - Inline status change
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTasksByProject, getProjectMembers, getTaskCountsByStatus } from "@/server/services/task.service";
import { canAccessProject } from "@/server/services/project.service";
import { TasksPageClient } from "./page-client";

interface ProjectTasksPageProps {
    params: Promise<{ projectId: string }>;
    searchParams: Promise<{
        status?: string;
        priority?: string;
        assignee?: string;
        search?: string;
    }>;
}

export default async function ProjectTasksPage({
    params,
    searchParams: searchParamsPromise,
}: ProjectTasksPageProps) {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const { projectId } = await params;
    const searchParams = await searchParamsPromise;

    // 2. Authorization - kiểm tra quyền truy cập project
    const hasAccess = await canAccessProject(
        projectId,
        session.user.id,
        session.user.role || "MEMBER"
    );

    if (!hasAccess) {
        redirect("/projects");
    }

    // 3. Parse search params
    const status = searchParams.status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | undefined;
    const priority = searchParams.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined;
    const assigneeId = searchParams.assignee;
    const search = searchParams.search;

    // 4. Fetch data in parallel
    const [{ tasks, total }, members, taskCounts] = await Promise.all([
        getTasksByProject({
            projectId,
            status,
            priority,
            assigneeId,
            search,
            take: 100, // Lấy nhiều hơn để client-side filter nếu cần
        }),
        getProjectMembers(projectId),
        getTaskCountsByStatus(projectId),
    ]);

    return (
        <TasksPageClient
            projectId={projectId}
            tasks={tasks}
            total={total}
            members={members}
            taskCounts={taskCounts}
            initialFilters={{
                status,
                priority,
                assigneeId,
                search,
            }}
        />
    );
}
