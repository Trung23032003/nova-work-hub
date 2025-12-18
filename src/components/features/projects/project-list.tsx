"use client";

/**
 * PROJECT LIST COMPONENT
 * 
 * Hiển thị danh sách projects dạng grid cards
 */

import { useState } from "react";
import { toast } from "sonner";
import { FolderKanban, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import { deleteProject } from "@/actions/project";
import type { ProjectListItem } from "@/server/services/project.service";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// ============================================
// TYPES
// ============================================

interface ProjectListProps {
    projects: ProjectListItem[];
    onCreateClick?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function ProjectList({ projects, onCreateClick }: ProjectListProps) {
    const router = useRouter();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<ProjectListItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Handle delete confirmation
    const handleDeleteClick = (project: ProjectListItem) => {
        setProjectToDelete(project);
        setDeleteDialogOpen(true);
    };

    // Handle actual delete
    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteProject(projectToDelete.id);
            if (result.success) {
                toast.success(result.message || "Xóa dự án thành công!");
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle edit
    const handleEdit = (project: ProjectListItem) => {
        // For now, just navigate to project detail
        router.push(`/projects/${project.id}`);
    };

    // Empty state
    if (projects.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Chưa có dự án nào</CardTitle>
                    <CardDescription>
                        Bắt đầu bằng cách tạo dự án đầu tiên của bạn
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-12">
                    <FolderKanban className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                        Dự án giúp bạn tổ chức công việc và cộng tác với team
                    </p>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={onCreateClick}
                    >
                        <Plus className="h-4 w-4" />
                        Tạo dự án đầu tiên
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Projects Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                ))}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa dự án</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa dự án{" "}
                            <span className="font-semibold text-foreground">
                                {projectToDelete?.name}
                            </span>
                            ? Hành động này không thể hoàn tác và sẽ xóa tất cả tasks,
                            members và dữ liệu liên quan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Đang xóa..." : "Xóa dự án"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
