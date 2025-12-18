"use client";

/**
 * TASK ROW COMPONENT
 * 
 * Hiển thị một task trong danh sách dạng table row.
 * Features:
 * - Inline status change (dropdown)
 * - Priority badge
 * - Assignee avatar
 * - Due date với warning nếu quá hạn
 * - Actions menu (Edit, Delete)
 */

import { useState } from "react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { vi } from "date-fns/locale";
import {
    MoreHorizontal,
    Trash2,
    Edit,
    User,
    Calendar,
    MessageSquare,
    CheckSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableCell, TableRow } from "@/components/ui/table";
import { updateTaskStatus, deleteTask } from "@/actions/task";
import { toast } from "sonner";
import type { TaskListItem } from "@/server/services/task.service";
import type { Priority, TaskStatus } from "@prisma/client";

// ============================================
// CONSTANTS
// ============================================

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
    TODO: {
        label: "Chờ làm",
        className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
    IN_PROGRESS: {
        label: "Đang làm",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
    REVIEW: {
        label: "Đang review",
        className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    },
    DONE: {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
    LOW: {
        label: "Thấp",
        className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    MEDIUM: {
        label: "Trung bình",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    },
    HIGH: {
        label: "Cao",
        className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    },
    CRITICAL: {
        label: "Khẩn cấp",
        className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
};

// ============================================
// HELPERS
// ============================================

function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function formatDueDate(date: Date | null): { text: string; className: string } {
    if (!date) return { text: "", className: "" };

    const dueDate = new Date(date);

    if (isPast(dueDate) && !isToday(dueDate)) {
        return {
            text: `Quá hạn ${format(dueDate, "dd/MM", { locale: vi })}`,
            className: "text-red-600 dark:text-red-400 font-medium",
        };
    }

    if (isToday(dueDate)) {
        return {
            text: "Hôm nay",
            className: "text-orange-600 dark:text-orange-400 font-medium",
        };
    }

    if (isTomorrow(dueDate)) {
        return {
            text: "Ngày mai",
            className: "text-yellow-600 dark:text-yellow-400",
        };
    }

    return {
        text: format(dueDate, "dd/MM/yyyy", { locale: vi }),
        className: "text-muted-foreground",
    };
}

// ============================================
// COMPONENT
// ============================================

interface TaskRowProps {
    task: TaskListItem;
    onEdit?: (task: TaskListItem) => void;
    onDeleted?: () => void;
}

export function TaskRow({ task, onEdit, onDeleted }: TaskRowProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const statusConfig = STATUS_CONFIG[task.status];
    const priorityConfig = PRIORITY_CONFIG[task.priority];
    const dueDateInfo = formatDueDate(task.dueDate);

    // Handle status change
    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (newStatus === task.status) return;

        setIsUpdating(true);
        try {
            const result = await updateTaskStatus(task.id, newStatus);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!confirm("Bạn có chắc chắn muốn xóa task này?")) return;

        setIsDeleting(true);
        try {
            const result = await deleteTask(task.id);
            if (result.success) {
                toast.success(result.message);
                onDeleted?.();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <TableRow className={isDeleting ? "opacity-50" : ""}>
            {/* Title */}
            <TableCell className="font-medium">
                <div className="flex flex-col gap-1">
                    <span className="line-clamp-1">{task.title}</span>
                    {task.type && (
                        <span className="text-xs text-muted-foreground capitalize">
                            {task.type}
                        </span>
                    )}
                </div>
            </TableCell>

            {/* Status */}
            <TableCell>
                <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusChange(value as TaskStatus)}
                    disabled={isUpdating}
                >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue>
                            <Badge variant="secondary" className={statusConfig.className}>
                                {statusConfig.label}
                            </Badge>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                                <Badge variant="secondary" className={config.className}>
                                    {config.label}
                                </Badge>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>

            {/* Priority */}
            <TableCell>
                <Badge variant="secondary" className={priorityConfig.className}>
                    {priorityConfig.label}
                </Badge>
            </TableCell>

            {/* Assignee */}
            <TableCell>
                {task.assignee ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={task.assignee.image || undefined} />
                                        <AvatarFallback className="text-xs">
                                            {getInitials(task.assignee.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm truncate max-w-[100px]">
                                        {task.assignee.name}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{task.assignee.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {task.assignee.email}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Chưa gán</span>
                    </div>
                )}
            </TableCell>

            {/* Due Date */}
            <TableCell>
                {task.dueDate ? (
                    <div className={`flex items-center gap-1 text-sm ${dueDateInfo.className}`}>
                        <Calendar className="h-3 w-3" />
                        {dueDateInfo.text}
                    </div>
                ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                )}
            </TableCell>

            {/* Stats (comments, subtasks) */}
            <TableCell>
                <div className="flex items-center gap-3 text-muted-foreground">
                    {task._count.comments > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 text-sm">
                                        <MessageSquare className="h-3 w-3" />
                                        {task._count.comments}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {task._count.comments} bình luận
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {task._count.subtasks > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 text-sm">
                                        <CheckSquare className="h-3 w-3" />
                                        {task._count.subtasks}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {task._count.subtasks} checklist items
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isDeleting}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa task
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
