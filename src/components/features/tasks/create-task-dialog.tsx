"use client";

/**
 * CREATE TASK DIALOG COMPONENT
 * 
 * Modal form để tạo task mới.
 * Features:
 * - React Hook Form + Zod validation
 * - Assignee select từ project members
 * - Priority select
 * - Due date picker
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

import { createTask } from "@/actions/task";
import { CreateTaskSchema, type CreateTaskInput } from "@/lib/zod-schemas";
import type { Priority, TaskStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

interface AssigneeOption {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

interface CreateTaskDialogProps {
    projectId: string;
    assignees: AssigneeOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
    { value: "LOW", label: "Thấp" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HIGH", label: "Cao" },
    { value: "CRITICAL", label: "Khẩn cấp" },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "TODO", label: "Chờ làm" },
    { value: "IN_PROGRESS", label: "Đang làm" },
    { value: "REVIEW", label: "Đang review" },
    { value: "DONE", label: "Hoàn thành" },
];

const TASK_TYPES = [
    { value: "feature", label: "Tính năng mới" },
    { value: "bug", label: "Sửa lỗi" },
    { value: "improvement", label: "Cải thiện" },
    { value: "task", label: "Task thường" },
];

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

// ============================================
// COMPONENT
// ============================================

export function CreateTaskDialog({
    projectId,
    assignees,
    open,
    onOpenChange,
    onCreated,
}: CreateTaskDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateTaskInput>({
        resolver: zodResolver(CreateTaskSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            projectId,
            priority: "MEDIUM",
            status: "TODO",
            assigneeId: null,
            dueDate: null,
            estimateHours: 0,
            type: "task",
        },
    });

    // Reset form when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            form.reset({
                title: "",
                description: "",
                projectId,
                priority: "MEDIUM",
                status: "TODO",
                assigneeId: null,
                dueDate: null,
                estimateHours: 0,
                type: "task",
            });
        }
        onOpenChange(newOpen);
    };

    // Handle form submit
    const onSubmit = async (data: CreateTaskInput) => {
        setIsSubmitting(true);
        try {
            const result = await createTask({
                ...data,
                projectId, // Đảm bảo projectId đúng
            });

            if (result.success) {
                toast.success(result.message || "Tạo task thành công!");
                onOpenChange(false);
                onCreated?.();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Tạo task mới</DialogTitle>
                    <DialogDescription>
                        Thêm một công việc mới vào dự án
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tiêu đề *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nhập tiêu đề task..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Mô tả chi tiết task..."
                                            className="resize-none h-20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Row 1: Type + Priority + Status */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Type */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loại task</FormLabel>
                                        <Select
                                            value={field.value || "task"}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TASK_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Priority */}
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Độ ưu tiên</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn độ ưu tiên" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {PRIORITY_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trạng thái</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Row 2: Assignee + Due Date + Estimate */}
                        <div className="grid grid-cols-3 gap-4">
                            {/* Assignee */}
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Người thực hiện</FormLabel>
                                        <Select
                                            value={field.value || "unassigned"}
                                            onValueChange={(v) =>
                                                field.onChange(v === "unassigned" ? null : v)
                                            }
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn người thực hiện" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="unassigned">
                                                    Chưa gán
                                                </SelectItem>
                                                {assignees.map((user) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarImage src={user.image || undefined} />
                                                                <AvatarFallback className="text-xs">
                                                                    {getInitials(user.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>{user.name || user.email}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Due Date */}
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hạn hoàn thành</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left font-normal"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy", { locale: vi })
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                Chọn ngày
                                                            </span>
                                                        )}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value || undefined}
                                                    onSelect={field.onChange}
                                                    locale={vi}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Estimate Hours */}
                            <FormField
                                control={form.control}
                                name="estimateHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ước tính (giờ)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={0.5}
                                                placeholder="0"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(value ? parseFloat(value) : 0);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Tạo task
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
