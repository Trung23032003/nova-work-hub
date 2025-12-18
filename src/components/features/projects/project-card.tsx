"use client";

/**
 * PROJECT CARD COMPONENT
 * 
 * Hiển thị thông tin tóm tắt của một project trong danh sách
 * Dùng trong trang /projects
 * 
 * Features:
 * - Double-click để xem chi tiết project
 * - Menu 3 chấm với các action: Xem chi tiết, Chỉnh sửa, Xóa
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Users,
    CheckSquare,
    Calendar,
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectListItem } from "@/server/services/project.service";

// ============================================
// STATUS CONFIG
// ============================================

const statusConfig = {
    PLANNING: {
        label: "Lên kế hoạch",
        variant: "secondary" as const,
        className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    },
    IN_PROGRESS: {
        label: "Đang thực hiện",
        variant: "default" as const,
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    },
    ON_HOLD: {
        label: "Tạm dừng",
        variant: "outline" as const,
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    },
    DONE: {
        label: "Hoàn thành",
        variant: "default" as const,
        className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    },
    CANCELED: {
        label: "Đã hủy",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
    },
};

const priorityConfig = {
    LOW: { label: "Thấp", className: "text-slate-500" },
    MEDIUM: { label: "Trung bình", className: "text-blue-500" },
    HIGH: { label: "Cao", className: "text-orange-500" },
    CRITICAL: { label: "Khẩn cấp", className: "text-red-500" },
};

// ============================================
// COMPONENT
// ============================================

interface ProjectCardProps {
    project: ProjectListItem;
    onEdit?: (project: ProjectListItem) => void;
    onDelete?: (project: ProjectListItem) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const router = useRouter();
    const status = statusConfig[project.status];
    const priority = priorityConfig[project.priority];

    // Format dates
    const createdAgo = formatDistanceToNow(new Date(project.createdAt), {
        addSuffix: true,
        locale: vi
    });

    const dueDateFormatted = project.dueDate
        ? new Date(project.dueDate).toLocaleDateString("vi-VN")
        : null;

    // Check if overdue
    const isOverdue = project.dueDate &&
        new Date(project.dueDate) < new Date() &&
        project.status !== "DONE" &&
        project.status !== "CANCELED";

    // Handle double-click to navigate to project detail
    const handleDoubleClick = () => {
        router.push(`/projects/${project.id}`);
    };

    return (
        <Card
            className="group hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onDoubleClick={handleDoubleClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className="text-xs font-mono"
                            >
                                {project.code}
                            </Badge>
                            <Badge className={status.className}>
                                {status.label}
                            </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-1">
                            <Link
                                href={`/projects/${project.id}`}
                                className="hover:text-primary transition-colors"
                            >
                                {project.name}
                            </Link>
                        </CardTitle>
                        {project.description && (
                            <CardDescription className="line-clamp-2">
                                {project.description}
                            </CardDescription>
                        )}
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/projects/${project.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem chi tiết
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(project)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete?.(project)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa dự án
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pb-4">
                {/* Client & Priority */}
                {project.clientName && (
                    <p className="text-sm text-muted-foreground mb-3">
                        Khách hàng: <span className="font-medium">{project.clientName}</span>
                    </p>
                )}

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                        <CheckSquare className="h-4 w-4" />
                        <span>{project._count.tasks} tasks</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project._count.members} thành viên</span>
                    </div>
                    <div className={`flex items-center gap-1 ${priority.className}`}>
                        <span className="font-medium">{priority.label}</span>
                    </div>
                </div>

                {/* Footer: PM & Due Date */}
                <div className="flex items-center justify-between pt-3 border-t">
                    {/* PM Info */}
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            {project.pm.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={project.pm.image} alt={project.pm.name || ""} />
                            ) : (
                                <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-xs font-medium">
                                    {project.pm.name?.charAt(0) || "?"}
                                </div>
                            )}
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                            {project.pm.name}
                        </span>
                    </div>

                    {/* Due Date */}
                    {dueDateFormatted && (
                        <div className={`flex items-center gap-1 text-sm ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{dueDateFormatted}</span>
                            {isOverdue && <span className="font-medium">(Quá hạn)</span>}
                        </div>
                    )}

                    {/* Created time if no due date */}
                    {!dueDateFormatted && (
                        <span className="text-xs text-muted-foreground">
                            Tạo {createdAgo}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
