"use client";

/**
 * KANBAN BOARD COMPONENT
 * 
 * Board chính chứa 4 cột (TODO, IN_PROGRESS, REVIEW, DONE).
 * Sử dụng DndContext từ @dnd-kit để quản lý drag & drop.
 * 
 * Features:
 * - Drag & drop tasks giữa các cột
 * - Reorder tasks trong cùng cột
 * - Optimistic UI updates
 * - Collision detection với closestCorners
 */

import { useState, useMemo, useRef } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { updateTaskStatus } from "@/actions/task";
import { toast } from "sonner";
import type { TaskListItem } from "@/server/services/task.service";
import type { TaskStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

interface KanbanBoardProps {
    tasks: TaskListItem[];
    onTaskClick?: (task: TaskListItem) => void;
    onAddTask?: (status: TaskStatus) => void;
    onTaskMoved?: () => void; // Callback để refresh data
}

type TasksByStatus = Record<TaskStatus, TaskListItem[]>;

// ============================================
// CONSTANTS
// ============================================

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

// ============================================
// HELPERS
// ============================================

function groupTasksByStatus(tasks: TaskListItem[]): TasksByStatus {
    const grouped: TasksByStatus = {
        TODO: [],
        IN_PROGRESS: [],
        REVIEW: [],
        DONE: [],
    };

    tasks.forEach((task) => {
        grouped[task.status].push(task);
    });

    // Sort by position within each status
    Object.keys(grouped).forEach((status) => {
        grouped[status as TaskStatus].sort((a, b) => a.position - b.position);
    });

    return grouped;
}

function findTaskById(tasks: TaskListItem[], id: string): TaskListItem | undefined {
    return tasks.find((t) => t.id === id);
}

// ============================================
// COMPONENT
// ============================================

export function KanbanBoard({ tasks, onTaskClick, onAddTask, onTaskMoved }: KanbanBoardProps) {
    // Group tasks by status - memoized
    const initialGrouped = useMemo(() => groupTasksByStatus(tasks), [tasks]);

    // Local state for optimistic updates
    const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>(initialGrouped);
    const [activeTask, setActiveTask] = useState<TaskListItem | null>(null);

    // Ref để lưu cột ban đầu khi bắt đầu kéo
    const originalColumnRef = useRef<TaskStatus | null>(null);

    // Update local state when props change
    useMemo(() => {
        setTasksByStatus(groupTasksByStatus(tasks));
    }, [tasks]);

    // Sensors configuration
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement before drag starts
            },
        })
    );

    // Find which column a task belongs to (from current local state)
    const findColumnByTaskId = (taskId: string): TaskStatus | null => {
        for (const status of STATUSES) {
            if (tasksByStatus[status].some((t) => t.id === taskId)) {
                return status;
            }
        }
        return null;
    };

    // Handle drag start - lưu cột ban đầu
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = findTaskById(tasks, active.id as string);
        if (task) {
            setActiveTask(task);
            // Lưu cột ban đầu từ props (chưa bị modify bởi optimistic update)
            originalColumnRef.current = task.status;
        }
    };

    // Handle drag over (when hovering over a different column)
    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find current columns
        const activeColumn = findColumnByTaskId(activeId);
        const overColumn = STATUSES.includes(overId as TaskStatus)
            ? (overId as TaskStatus)
            : findColumnByTaskId(overId);

        if (!activeColumn || !overColumn || activeColumn === overColumn) return;

        // Move task to new column (optimistic)
        setTasksByStatus((prev) => {
            const activeItems = [...prev[activeColumn]];
            const overItems = [...prev[overColumn]];

            const activeIndex = activeItems.findIndex((t) => t.id === activeId);
            if (activeIndex === -1) return prev;

            const [movedTask] = activeItems.splice(activeIndex, 1);

            // Add to new column
            overItems.push({
                ...movedTask,
                status: overColumn,
            });

            return {
                ...prev,
                [activeColumn]: activeItems,
                [overColumn]: overItems,
            };
        });
    };

    // Handle drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        const activeId = active.id as string;
        const originalColumn = originalColumnRef.current;

        // Reset state
        setActiveTask(null);
        originalColumnRef.current = null;

        if (!over || !originalColumn) return;

        const overId = over.id as string;

        // Tìm cột đích - có thể là ID của cột hoặc ID của task trong cột đó
        const targetColumn = STATUSES.includes(overId as TaskStatus)
            ? (overId as TaskStatus)
            : findColumnByTaskId(overId);

        if (!targetColumn) return;

        // Same column - chỉ reorder (không cần gọi API trong phase này)
        if (originalColumn === targetColumn) {
            const items = tasksByStatus[targetColumn];
            const activeIndex = items.findIndex((t) => t.id === activeId);
            const overIndex = items.findIndex((t) => t.id === overId);

            if (activeIndex !== overIndex && overIndex >= 0) {
                setTasksByStatus((prev) => ({
                    ...prev,
                    [targetColumn]: arrayMove(items, activeIndex, overIndex),
                }));
            }
            return;
        }

        // Different column - update status via API
        try {
            console.log(`Moving task ${activeId} from ${originalColumn} to ${targetColumn}`);
            const result = await updateTaskStatus(activeId, targetColumn);

            if (result.success) {
                toast.success(`Đã chuyển task sang "${getStatusLabel(targetColumn)}"`);
                onTaskMoved?.();
            } else {
                // Revert on error
                console.error("Update failed:", result.error);
                setTasksByStatus(groupTasksByStatus(tasks));
                toast.error(result.error);
            }
        } catch (error) {
            // Revert on error
            console.error("Update error:", error);
            setTasksByStatus(groupTasksByStatus(tasks));
            toast.error("Đã có lỗi xảy ra");
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4">
                {STATUSES.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        tasks={tasksByStatus[status]}
                        onTaskClick={onTaskClick}
                        onAddTask={onAddTask}
                    />
                ))}
            </div>

            {/* Drag Overlay - Shows preview of dragged task */}
            <DragOverlay>
                {activeTask ? (
                    <div className="w-[280px]">
                        <TaskCard task={activeTask} isDragging />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Helper to get status label
function getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
        TODO: "Chờ làm",
        IN_PROGRESS: "Đang làm",
        REVIEW: "Đang review",
        DONE: "Hoàn thành",
    };
    return labels[status];
}
