"use client";

/**
 * KANBAN TASK CARD COMPONENT
 * 
 * Card hiển thị task trong Kanban board.
 * Được bọc trong useSortable từ @dnd-kit/sortable.
 * 
 * Features:
 * - Draggable
 * - Priority badge
 * - Assignee avatar
 * - Due date warning
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isPast, isToday } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, MessageSquare, CheckSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TaskListItem } from "@/server/services/task.service";
import type { Priority } from "@prisma/client";

// ============================================
// CONSTANTS
// ============================================

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; dotColor: string }> = {
    LOW: {
        label: "Thấp",
        className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        dotColor: "bg-gray-400",
    },
    MEDIUM: {
        label: "Trung bình",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        dotColor: "bg-yellow-500",
    },
    HIGH: {
        label: "Cao",
        className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        dotColor: "bg-orange-500",
    },
    CRITICAL: {
        label: "Khẩn cấp",
        className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        dotColor: "bg-red-500",
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

function getDueDateInfo(date: Date | null): { text: string; isOverdue: boolean; isToday: boolean } | null {
    if (!date) return null;

    const dueDate = new Date(date);
    const overdue = isPast(dueDate) && !isToday(dueDate);
    const today = isToday(dueDate);

    return {
        text: format(dueDate, "dd/MM", { locale: vi }),
        isOverdue: overdue,
        isToday: today,
    };
}

// ============================================
// COMPONENT
// ============================================

interface TaskCardProps {
    task: TaskListItem;
    onClick?: (task: TaskListItem) => void;
    isDragging?: boolean;
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    const priorityConfig = PRIORITY_CONFIG[task.priority];
    const dueDateInfo = getDueDateInfo(task.dueDate);

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow
                ${isDragging || isSortableDragging ? "shadow-lg ring-2 ring-primary" : ""}
            `}
            onClick={() => onClick?.(task)}
        >
            {/* Header: Priority dot + Type badge */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Priority indicator dot */}
                    <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig.dotColor}`}
                        title={priorityConfig.label}
                    />
                    {/* Task type tag */}
                    {task.type && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                            {task.type}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Title */}
            <h4 className="text-sm font-medium line-clamp-2 mb-2">{task.title}</h4>

            {/* Footer: Stats + Assignee */}
            <div className="flex items-center justify-between">
                {/* Left: Due date + Stats */}
                <div className="flex items-center gap-2 text-muted-foreground">
                    {/* Due date */}
                    {dueDateInfo && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`flex items-center gap-1 text-xs ${dueDateInfo.isOverdue
                                            ? "text-red-600 dark:text-red-400"
                                            : dueDateInfo.isToday
                                                ? "text-orange-600 dark:text-orange-400"
                                                : ""
                                            }`}
                                    >
                                        <Calendar className="h-3 w-3" />
                                        <span>{dueDateInfo.text}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {dueDateInfo.isOverdue
                                        ? "Quá hạn"
                                        : dueDateInfo.isToday
                                            ? "Hôm nay"
                                            : "Hạn hoàn thành"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {/* Comments count */}
                    {task._count.comments > 0 && (
                        <div className="flex items-center gap-0.5 text-xs">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task._count.comments}</span>
                        </div>
                    )}

                    {/* Subtasks count */}
                    {task._count.subtasks > 0 && (
                        <div className="flex items-center gap-0.5 text-xs">
                            <CheckSquare className="h-3 w-3" />
                            <span>{task._count.subtasks}</span>
                        </div>
                    )}
                </div>

                {/* Right: Assignee */}
                {task.assignee && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={task.assignee.image || undefined} />
                                    <AvatarFallback className="text-[10px]">
                                        {getInitials(task.assignee.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{task.assignee.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </Card>
    );
}
