"use client";

/**
 * ============================================================================
 * PROJECTS PAGE CLIENT COMPONENT
 * ============================================================================
 * 
 * Client component cho trang danh sách dự án
 * Xử lý tất cả interactive UI
 * 
 * ============================================================================
 */

import { useRef } from "react";
import { ProjectList, CreateProjectDialog } from "@/components/features/projects";
import type { ProjectListItem } from "@/server/services/project.service";

// ============================================
// TYPES
// ============================================

interface User {
    id: string;
    name: string | null;
    email: string | null;
}

interface ProjectsPageClientProps {
    projects: ProjectListItem[];
    totalProjects: number;
    users: User[];
    currentUserId: string;
    userRole?: string;
}

// ============================================
// COMPONENT
// ============================================

export function ProjectsPageClient({
    projects,
    totalProjects,
    users,
    currentUserId,
    userRole,
}: ProjectsPageClientProps) {
    const dialogTriggerRef = useRef<HTMLButtonElement>(null);

    // Check if user can create projects
    const canCreate = userRole === "ADMIN" || userRole === "PM";

    // Handle create click from empty state
    const handleCreateClick = () => {
        dialogTriggerRef.current?.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dự án</h1>
                    <p className="text-muted-foreground">
                        {totalProjects > 0
                            ? `Tổng cộng ${totalProjects} dự án`
                            : "Quản lý và theo dõi tất cả dự án của bạn"
                        }
                    </p>
                </div>

                {/* Create Button */}
                {canCreate && (
                    <CreateProjectDialog
                        users={users}
                        currentUserId={currentUserId}
                        trigger={
                            <button ref={dialogTriggerRef} className="hidden" />
                        }
                    />
                )}

                {canCreate && (
                    <CreateProjectDialog
                        users={users}
                        currentUserId={currentUserId}
                    />
                )}
            </div>

            {/* TODO: Filters Section */}
            {/* <ProjectFilters /> */}

            {/* Project List */}
            <ProjectList
                projects={projects}
                onCreateClick={handleCreateClick}
            />

            {/* TODO: Pagination */}
            {/* <Pagination total={totalProjects} /> */}
        </div>
    );
}
