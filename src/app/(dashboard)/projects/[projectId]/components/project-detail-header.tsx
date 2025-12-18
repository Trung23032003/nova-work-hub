"use client";

/**
 * PROJECT DETAIL HEADER
 * 
 * Hiển thị thông tin chính của project:
 * - Tên, mã, status
 * - PM info
 * - Quick actions
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ArrowLeft,
    Calendar,
    Users,
    CheckSquare,
    MoreHorizontal,
    Pencil,
    Settings,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateProjectStatus } from "@/actions/project";
import type { ProjectDetail } from "@/server/services/project.service";
import type { ProjectStatus } from "@prisma/client";

// ============================================
// STATUS CONFIG
// ============================================

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
    PLANNING: {
        label: "Lên kế hoạch",
        className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    },
    IN_PROGRESS: {
        label: "Đang thực hiện",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    },
    ON_HOLD: {
        label: "Tạm dừng",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
    },
    DONE: {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    },
    CANCELED: {
        label: "Đã hủy",
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

interface ProjectDetailHeaderProps {
    project: ProjectDetail;
}

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [currentStatus, setCurrentStatus] = useState<ProjectStatus>(project.status);

    const status = statusConfig[currentStatus];
    const priority = priorityConfig[project.priority];

    // Format dates
    const dueDateFormatted = project.dueDate
        ? new Date(project.dueDate).toLocaleDateString("vi-VN")
        : null;

    // Handle status change
    const handleStatusChange = (newStatus: ProjectStatus) => {
        setCurrentStatus(newStatus); // Optimistic update

        startTransition(async () => {
            const result = await updateProjectStatus(project.id, newStatus);

            if (result.success) {
                toast.success(result.message);
                router.refresh();
            } else {
                setCurrentStatus(project.status); // Rollback
                toast.error(result.error);
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                    href="/projects"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Dự án
                </Link>
                <span>/</span>
                <span className="font-mono">{project.code}</span>
            </div>

            {/* Main Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono">
                            {project.code}
                        </Badge>
                        <Badge className={`${priority.className} bg-transparent border`}>
                            {priority.label}
                        </Badge>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {project.name}
                    </h1>

                    {project.description && (
                        <p className="text-muted-foreground max-w-2xl">
                            {project.description}
                        </p>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground flex-wrap">
                        {/* PM */}
                        <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-[10px] font-medium">
                                    {project.pm.name?.charAt(0) || "?"}
                                </div>
                            </Avatar>
                            <span>PM: {project.pm.name}</span>
                        </div>

                        {/* Members count */}
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{project._count.members} thành viên</span>
                        </div>

                        {/* Tasks count */}
                        <div className="flex items-center gap-1">
                            <CheckSquare className="h-4 w-4" />
                            <span>{project._count.tasks} tasks</span>
                        </div>

                        {/* Due date */}
                        {dueDateFormatted && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Hạn: {dueDateFormatted}</span>
                            </div>
                        )}

                        {/* Client */}
                        {project.clientName && (
                            <span>• Khách hàng: {project.clientName}</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Status Dropdown */}
                    <Select
                        value={currentStatus}
                        onValueChange={(value) => handleStatusChange(value as ProjectStatus)}
                        disabled={isPending}
                    >
                        <SelectTrigger className={`w-[160px] ${status.className}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* More Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/projects/${project.id}/settings`}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Cài đặt
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa dự án
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
