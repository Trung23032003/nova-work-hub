"use client";

/**
 * TASK LIST COMPONENT
 * 
 * Hiển thị danh sách tasks dạng table.
 * Features:
 * - Table với các cột: Title, Status, Priority, Assignee, Due Date
 * - Empty state
 * - Loading skeleton
 */

import { ListTodo } from "lucide-react";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { TaskRow } from "./task-row";
import type { TaskListItem } from "@/server/services/task.service";

// ============================================
// COMPONENT
// ============================================

interface TaskListProps {
    tasks: TaskListItem[];
    onEdit?: (task: TaskListItem) => void;
    onDeleted?: () => void;
}

export function TaskList({ tasks, onEdit, onDeleted }: TaskListProps) {
    // Empty state
    if (tasks.length === 0) {
        return (
            <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <ListTodo className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-1">Không có task nào</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Bắt đầu bằng cách tạo task mới hoặc thử thay đổi bộ lọc.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[35%]">Tiêu đề</TableHead>
                        <TableHead className="w-[140px]">Trạng thái</TableHead>
                        <TableHead className="w-[100px]">Độ ưu tiên</TableHead>
                        <TableHead className="w-[150px]">Người thực hiện</TableHead>
                        <TableHead className="w-[120px]">Hạn hoàn thành</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                        <TableHead className="w-[50px] text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onEdit={onEdit}
                            onDeleted={onDeleted}
                        />
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
