"use client";

/**
 * KANBAN COLUMN COMPONENT
 * 
 * Cột trong Kanban board, chứa danh sách tasks theo status.
 * Sử dụng useDroppable từ @dnd-kit để nhận task được kéo vào.
 * 
 * Features:
 * - Droppable area
 * - Header với count và add button
 * - Scrollable task list
 */

import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./task-card";
import type { TaskListItem } from "@/server/services/task.service";
import type { TaskStatus } from "@prisma/client";

// ============================================
// CONSTANTS
// ============================================

const STATUS_CONFIG: Record<TaskStatus, {
    label: string;
    bgColor: string;
    borderColor: string;
    headerBg: string;
}> = {
    TODO: {
        label: "Chờ làm",
        bgColor: "bg-slate-50 dark:bg-slate-900/50",
        borderColor: "border-slate-200 dark:border-slate-800",
        headerBg: "bg-slate-100 dark:bg-slate-800",
    },
    IN_PROGRESS: {
        label: "Đang làm",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        headerBg: "bg-blue-100 dark:bg-blue-900/50",
    },
    REVIEW: {
        label: "Đang review",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        borderColor: "border-purple-200 dark:border-purple-800",
        headerBg: "bg-purple-100 dark:bg-purple-900/50",
    },
    DONE: {
        label: "Hoàn thành",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
        headerBg: "bg-green-100 dark:bg-green-900/50",
    },
};

// ============================================
// COMPONENT
// ============================================

interface KanbanColumnProps {
    status: TaskStatus;
    tasks: TaskListItem[];
    onTaskClick?: (task: TaskListItem) => void;
    onAddTask?: (status: TaskStatus) => void;
}

export function KanbanColumn({ status, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
    });

    const config = STATUS_CONFIG[status];
    const taskIds = tasks.map((t) => t.id);

    return (
        <div
            className={`
                flex flex-col w-[300px] min-w-[300px] rounded-lg border
                ${config.bgColor} ${config.borderColor}
                ${isOver ? "ring-2 ring-primary ring-offset-2" : ""}
            `}
        >
            {/* Column Header */}
            <div className={`flex items-center justify-between p-3 rounded-t-lg ${config.headerBg}`}>
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{config.label}</h3>
                    <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                        {tasks.length}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onAddTask?.(status)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Task List - Droppable & Sortable */}
            <div ref={setNodeRef} className="flex-1 min-h-[200px]">
                <ScrollArea className="h-[calc(100vh-320px)]">
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                        <div className="p-2 space-y-2">
                            {tasks.length === 0 ? (
                                <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                                    Kéo task vào đây
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onClick={onTaskClick}
                                    />
                                ))
                            )}
                        </div>
                    </SortableContext>
                </ScrollArea>
            </div>
        </div>
    );
}
