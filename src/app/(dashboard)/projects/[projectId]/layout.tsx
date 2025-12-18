/**
 * ============================================================================
 * PROJECT DETAIL LAYOUT
 * ============================================================================
 * 
 * Layout cho trang chi tiết dự án
 * - Fetch thông tin project một lần
 * - Truyền xuống các tabs thông qua context hoặc props
 * - Tab Navigation: Overview | Tasks | Members | Settings
 * 
 * ============================================================================
 */

import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectById, canAccessProject } from "@/server/services/project.service";
import { ProjectDetailHeader } from "./components/project-detail-header";
import { ProjectTabs } from "./components/project-tabs";

interface ProjectLayoutProps {
    children: React.ReactNode;
    params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailLayout({
    children,
    params,
}: ProjectLayoutProps) {
    // Await params (Next.js 15+)
    const { projectId } = await params;

    // Auth check
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    // Fetch project
    const project = await getProjectById(projectId);

    if (!project) {
        notFound();
    }

    // Authorization check
    const hasAccess = await canAccessProject(
        project.id,
        session.user.id,
        session.user.role || "MEMBER"
    );

    if (!hasAccess) {
        redirect("/projects?error=unauthorized");
    }

    return (
        <div className="space-y-6">
            {/* Project Header with basic info */}
            <ProjectDetailHeader project={project} />

            {/* Tab Navigation */}
            <ProjectTabs projectId={project.id} />

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {children}
            </div>
        </div>
    );
}
