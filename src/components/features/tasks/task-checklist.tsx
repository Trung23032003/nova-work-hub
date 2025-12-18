"use client";

/**
 * TASK CHECKLIST COMPONENT
 * 
 * Hiển thị và quản lý checklist items (subtasks) của task.
 * Features:
 * - Hiển thị danh sách checklist items
 * - Toggle hoàn thành
 * - Thêm item mới
 * - Xóa item
 * - Progress bar
 */

import { useState } from "react";
import { Plus, Trash2, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
}

interface TaskChecklistProps {
    taskId: string;
    items: ChecklistItem[];
    onItemsChange?: (items: ChecklistItem[]) => void;
}

// ============================================
// COMPONENT
// ============================================

export function TaskChecklist({ taskId, items, onItemsChange }: TaskChecklistProps) {
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(items);
    const [newItemTitle, setNewItemTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Calculate progress
    const completedCount = checklistItems.filter((i) => i.completed).length;
    const totalCount = checklistItems.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // Toggle item completion
    const handleToggle = async (itemId: string) => {
        const updatedItems = checklistItems.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        setChecklistItems(updatedItems);
        onItemsChange?.(updatedItems);

        // TODO: Call API to update checklist item
        // await updateChecklistItem(taskId, itemId, { completed: !item.completed });
    };

    // Add new item
    const handleAddItem = async () => {
        if (!newItemTitle.trim()) return;

        setIsAdding(true);
        try {
            // Generate temporary ID (sẽ được thay bởi ID từ DB)
            const tempId = `temp-${Date.now()}`;
            const newItem: ChecklistItem = {
                id: tempId,
                title: newItemTitle.trim(),
                completed: false,
            };

            const updatedItems = [...checklistItems, newItem];
            setChecklistItems(updatedItems);
            setNewItemTitle("");
            onItemsChange?.(updatedItems);

            // TODO: Call API to add checklist item
            // const result = await addChecklistItem(taskId, { title: newItemTitle.trim() });
            // if (result.success && result.data) {
            //     // Replace temp ID with real ID
            //     setChecklistItems(items => items.map(i => 
            //         i.id === tempId ? { ...i, id: result.data.id } : i
            //     ));
            // }
        } catch (error) {
            toast.error("Không thể thêm item");
        } finally {
            setIsAdding(false);
        }
    };

    // Delete item
    const handleDeleteItem = async (itemId: string) => {
        const updatedItems = checklistItems.filter((item) => item.id !== itemId);
        setChecklistItems(updatedItems);
        onItemsChange?.(updatedItems);

        // TODO: Call API to delete checklist item
        // await deleteChecklistItem(taskId, itemId);
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isAdding) {
            handleAddItem();
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with Progress */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Checklist</span>
                    <span className="text-muted-foreground">
                        {completedCount}/{totalCount}
                    </span>
                </div>
                {totalCount > 0 && (
                    <Progress value={progress} className="h-2" />
                )}
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
                {checklistItems.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group"
                    >
                        <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => handleToggle(item.id)}
                        />
                        <span
                            className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""
                                }`}
                        >
                            {item.title}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteItem(item.id)}
                        >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Add New Item */}
            <div className="flex items-center gap-2">
                <Input
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Thêm mục mới..."
                    className="flex-1"
                    disabled={isAdding}
                />
                <Button
                    size="icon"
                    variant="outline"
                    onClick={handleAddItem}
                    disabled={!newItemTitle.trim() || isAdding}
                >
                    {isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
