"use client";

/**
 * PROJECT TASKS PAGE - CLIENT COMPONENT
 * 
 * Features:
 * - Toggle giữa List View và Kanban View
 * - Hiển thị danh sách tasks dạng table hoặc kanban
 * - Filter theo status, priority, assignee
 * - Search task
 * - Tạo task mới
 * - Inline status change
 * - Drag & Drop trong Kanban view
 */

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw, List, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    TaskList,
    TaskFilters,
    CreateTaskDialog,
    KanbanBoard,
} from "@/components/features/tasks";
import type { TaskFiltersValue } from "@/components/features/tasks/task-filters";
import type { TaskListItem } from "@/server/services/task.service";
import type { TaskStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

type ViewMode = "list" | "kanban";

interface AssigneeOption {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

interface TasksPageClientProps {
    projectId: string;
    tasks: TaskListItem[];
    total: number;
    members: AssigneeOption[];
    taskCounts: Record<TaskStatus, number>;
    initialFilters: {
        status?: TaskStatus;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        assigneeId?: string;
        search?: string;
    };
}

// ============================================
// COMPONENT
// ============================================

export function TasksPageClient({
    projectId,
    tasks,
    total,
    members,
    taskCounts,
    initialFilters,
}: TasksPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // View mode state (persisted in URL)
    const [viewMode, setViewMode] = useState<ViewMode>(
        (searchParams.get("view") as ViewMode) || "list"
    );
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>("TODO");
    const [filters, setFilters] = useState<TaskFiltersValue>(initialFilters);

    // Tổng số tasks
    const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);

    // Handle view mode change
    const handleViewChange = (newView: ViewMode) => {
        setViewMode(newView);

        // Update URL with view param
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", newView);
        router.push(`?${params.toString()}`);
    };

    // Handle filter change - update URL
    const handleFilterChange = (newFilters: TaskFiltersValue) => {
        setFilters(newFilters);

        // Build new URL with search params
        const params = new URLSearchParams();
        params.set("view", viewMode);
        if (newFilters.status) params.set("status", newFilters.status);
        if (newFilters.priority) params.set("priority", newFilters.priority);
        if (newFilters.assigneeId) params.set("assignee", newFilters.assigneeId);
        if (newFilters.search) params.set("search", newFilters.search);

        // Update URL without full page reload
        router.push(`?${params.toString()}`);
    };

    // Handle task created
    const handleTaskCreated = () => {
        router.refresh();
    };

    // Handle task deleted/moved
    const handleTaskUpdated = () => {
        router.refresh();
    };

    // Handle edit task (placeholder - sẽ implement ở phase sau)
    const handleEditTask = (task: TaskListItem) => {
        // TODO: Implement edit task sheet
        console.log("Edit task:", task.id);
    };

    // Handle add task from Kanban column
    const handleAddTaskFromKanban = (status: TaskStatus) => {
        setCreateTaskStatus(status);
        setIsCreateDialogOpen(true);
    };

    // Handle add task from header button
    const handleAddTask = () => {
        setCreateTaskStatus("TODO");
        setIsCreateDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        Công việc
                        <Badge variant="secondary" className="ml-2">
                            {totalTasks}
                        </Badge>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Quản lý các tasks của dự án
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <Tabs value={viewMode} onValueChange={(v) => handleViewChange(v as ViewMode)}>
                        <TabsList className="h-9">
                            <TabsTrigger value="list" className="gap-1.5 px-3">
                                <List className="h-4 w-4" />
                                <span className="hidden sm:inline">Danh sách</span>
                            </TabsTrigger>
                            <TabsTrigger value="kanban" className="gap-1.5 px-3">
                                <Columns3 className="h-4 w-4" />
                                <span className="hidden sm:inline">Kanban</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.refresh()}
                        title="Làm mới"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleAddTask} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tạo task mới
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                        {taskCounts.TODO}
                    </p>
                    <p className="text-sm text-muted-foreground">Chờ làm</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {taskCounts.IN_PROGRESS}
                    </p>
                    <p className="text-sm text-muted-foreground">Đang làm</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {taskCounts.REVIEW}
                    </p>
                    <p className="text-sm text-muted-foreground">Đang review</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {taskCounts.DONE}
                    </p>
                    <p className="text-sm text-muted-foreground">Hoàn thành</p>
                </div>
            </div>

            {/* Filters - Only show in List view */}
            {viewMode === "list" && (
                <TaskFilters
                    value={filters}
                    onChange={handleFilterChange}
                    assignees={members}
                    taskCounts={taskCounts}
                />
            )}

            {/* Content based on view mode */}
            {viewMode === "list" ? (
                <TaskList
                    tasks={tasks}
                    onEdit={handleEditTask}
                    onDeleted={handleTaskUpdated}
                />
            ) : (
                <KanbanBoard
                    tasks={tasks}
                    onTaskClick={handleEditTask}
                    onAddTask={handleAddTaskFromKanban}
                    onTaskMoved={handleTaskUpdated}
                />
            )}

            {/* Create Task Dialog */}
            <CreateTaskDialog
                projectId={projectId}
                assignees={members}
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onCreated={handleTaskCreated}
            />
        </div>
    );
}
