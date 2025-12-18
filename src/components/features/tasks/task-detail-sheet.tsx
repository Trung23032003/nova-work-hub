"use client";

/**
 * TASK DETAIL SHEET COMPONENT
 * 
 * Sheet (Slide-over) hiển thị chi tiết task với giao diện được cải thiện.
 * Features:
 * - Header với title, type badge, status badge
 * - Properties panel: Assignee, Priority, Due Date với icons
 * - Description editor (Textarea)
 * - Improved visual hierarchy and spacing
 * - Footer với action buttons
 */

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    CalendarIcon,
    Loader2,
    X,
    User,
    Flag,
    Clock,
    CheckSquare,
    FileText,
    Tag,
} from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { updateTask, deleteTask } from "@/actions/task";
import { UpdateTaskSchema, type UpdateTaskInput } from "@/lib/zod-schemas";
import type { TaskListItem } from "@/server/services/task.service";
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

interface TaskDetailSheetProps {
    task: TaskListItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignees: AssigneeOption[];
    onUpdated?: () => void;
    onDeleted?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; bgColor: string }[] = [
    { value: "TODO", label: "Chờ làm", color: "text-slate-700 dark:text-slate-300", bgColor: "bg-slate-100 dark:bg-slate-800" },
    { value: "IN_PROGRESS", label: "Đang làm", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-100 dark:bg-blue-900" },
    { value: "REVIEW", label: "Đang review", color: "text-purple-700 dark:text-purple-300", bgColor: "bg-purple-100 dark:bg-purple-900" },
    { value: "DONE", label: "Hoàn thành", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; icon: string }[] = [
    { value: "LOW", label: "Thấp", color: "text-gray-600", icon: "▼" },
    { value: "MEDIUM", label: "Trung bình", color: "text-yellow-600", icon: "■" },
    { value: "HIGH", label: "Cao", color: "text-orange-600", icon: "▲" },
    { value: "CRITICAL", label: "Khẩn cấp", color: "text-red-600", icon: "▲▲" },
];

const TASK_TYPES = [
    { value: "feature", label: "Tính năng mới", color: "bg-blue-100 text-blue-700" },
    { value: "bug", label: "Sửa lỗi", color: "bg-red-100 text-red-700" },
    { value: "improvement", label: "Cải thiện", color: "bg-purple-100 text-purple-700" },
    { value: "task", label: "Task thường", color: "bg-gray-100 text-gray-700" },
];

// ============================================
// HELPERS
// ============================================

function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ============================================
// COMPONENT
// ============================================

export function TaskDetailSheet({
    task,
    open,
    onOpenChange,
    assignees,
    onUpdated,
    onDeleted,
}: TaskDetailSheetProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dropdown open states
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
    const [isDueDateOpen, setIsDueDateOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(task?.description || "");
    const [status, setStatus] = useState<TaskStatus>(task?.status || "TODO");
    const [priority, setPriority] = useState<Priority>(task?.priority || "MEDIUM");
    const [assigneeId, setAssigneeId] = useState<string | null>(task?.assignee?.id || null);
    const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate ? new Date(task.dueDate) : null);
    const [type, setType] = useState(task?.type || "task");
    const [estimateHours, setEstimateHours] = useState(task?.estimateHours || 0);

    // Reset form when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setStatus(task.status);
            setPriority(task.priority);
            setAssigneeId(task.assignee?.id || null);
            setDueDate(task.dueDate ? new Date(task.dueDate) : null);
            setType(task.type || "task");
            setEstimateHours(task.estimateHours || 0);
        }
    }, [task]);

    // Check if form has changes
    const hasChanges = task && (
        title !== task.title ||
        description !== (task.description || "") ||
        status !== task.status ||
        priority !== task.priority ||
        assigneeId !== (task.assignee?.id || null) ||
        (dueDate?.toISOString() !== (task.dueDate ? new Date(task.dueDate).toISOString() : null)) ||
        type !== (task.type || "task") ||
        estimateHours !== (task.estimateHours || 0)
    );

    // Handle save
    const handleSave = async () => {
        if (!task) return;

        setIsSubmitting(true);
        try {
            const result = await updateTask({
                id: task.id,
                title,
                description: description || undefined,
                status,
                priority,
                assigneeId,
                dueDate,
                type,
                estimateHours,
            });

            if (result.success) {
                toast.success("Đã cập nhật task");
                onUpdated?.();
                onOpenChange(false);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!task) return;
        if (!confirm("Bạn có chắc muốn xóa task này?")) return;

        setIsDeleting(true);
        try {
            const result = await deleteTask(task.id);
            if (result.success) {
                toast.success("Đã xóa task");
                onDeleted?.();
                onOpenChange(false);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!task) return null;

    const selectedAssignee = assignees.find((a) => a.id === assigneeId);
    const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status);
    const selectedPriority = PRIORITY_OPTIONS.find((p) => p.value === priority);
    const selectedType = TASK_TYPES.find((t) => t.value === type);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto p-0">
                {/* Header with gradient background */}
                <SheetHeader className="px-6 pt-6 pb-4 bg-gradient-to-b from-muted/50 to-background border-b space-y-4">
                    {/* Status and Type Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn("capitalize font-medium", selectedType?.color)}>
                            {selectedType?.label || type}
                        </Badge>
                        <Badge className={cn(selectedStatus?.bgColor, selectedStatus?.color)}>
                            {selectedStatus?.label}
                        </Badge>
                    </div>

                    {/* Title - Editable */}
                    <div>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                            placeholder="Tiêu đề task..."
                        />
                    </div>
                </SheetHeader>

                <div className="px-6 py-6 space-y-6">
                    {/* Properties Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Thông tin
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {/* Status */}
                            <div
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => setIsStatusOpen(true)}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                                    <CheckSquare className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                                    <Select
                                        value={status}
                                        onValueChange={(v) => setStatus(v as TaskStatus)}
                                        open={isStatusOpen}
                                        onOpenChange={setIsStatusOpen}
                                    >
                                        <SelectTrigger className="border-0 h-auto p-0 focus:ring-0 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    <Badge className={cn(opt.bgColor, opt.color)}>
                                                        {opt.label}
                                                    </Badge>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Priority */}
                            <div
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => setIsPriorityOpen(true)}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-orange-500/10">
                                    <Flag className="h-4 w-4 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Label className="text-xs text-muted-foreground">Độ ưu tiên</Label>
                                    <Select
                                        value={priority}
                                        onValueChange={(v) => setPriority(v as Priority)}
                                        open={isPriorityOpen}
                                        onOpenChange={setIsPriorityOpen}
                                    >
                                        <SelectTrigger className="border-0 h-auto p-0 focus:ring-0 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PRIORITY_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    <span className={opt.color}>
                                                        {opt.icon} {opt.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Assignee */}
                            <div
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => setIsAssigneeOpen(true)}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500/10">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Label className="text-xs text-muted-foreground">Người thực hiện</Label>
                                    <Select
                                        value={assigneeId || "unassigned"}
                                        onValueChange={(v) => setAssigneeId(v === "unassigned" ? null : v)}
                                        open={isAssigneeOpen}
                                        onOpenChange={setIsAssigneeOpen}
                                    >
                                        <SelectTrigger className="border-0 h-auto p-0 focus:ring-0">
                                            <SelectValue>
                                                {selectedAssignee ? (
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarImage src={selectedAssignee.image || undefined} />
                                                            <AvatarFallback className="text-[10px]">
                                                                {getInitials(selectedAssignee.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate">{selectedAssignee.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Chưa gán</span>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Chưa gán</SelectItem>
                                            {assignees.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-5 w-5">
                                                            <AvatarImage src={user.image || undefined} />
                                                            <AvatarFallback className="text-[10px]">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{user.name || user.email}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                onClick={() => setIsDueDateOpen(true)}
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-500/10">
                                    <CalendarIcon className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Label className="text-xs text-muted-foreground">Hạn hoàn thành</Label>
                                    <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" className="h-auto p-0 font-medium hover:bg-transparent justify-start">
                                                {dueDate
                                                    ? format(dueDate, "dd/MM/yyyy", { locale: vi })
                                                    : "Chọn ngày"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dueDate || undefined}
                                                onSelect={(d) => setDueDate(d || null)}
                                                locale={vi}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Type & Estimate in one row */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Type */}
                                <div
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                    onClick={() => setIsTypeOpen(true)}
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-purple-500/10">
                                        <Tag className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Label className="text-xs text-muted-foreground">Loại</Label>
                                        <Select
                                            value={type}
                                            onValueChange={setType}
                                            open={isTypeOpen}
                                            onOpenChange={setIsTypeOpen}
                                        >
                                            <SelectTrigger className="border-0 h-auto p-0 focus:ring-0 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TASK_TYPES.map((t) => (
                                                    <SelectItem key={t.value} value={t.value}>
                                                        {t.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Estimate Hours */}
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-500/10">
                                        <Clock className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Label className="text-xs text-muted-foreground">Giờ</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={0.5}
                                            value={estimateHours}
                                            onChange={(e) => setEstimateHours(parseFloat(e.target.value) || 0)}
                                            className="border-0 h-auto p-0 focus-visible:ring-0 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-semibold">Mô tả</Label>
                        </div>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Thêm mô tả chi tiết cho task..."
                            className="min-h-[150px] resize-none"
                        />
                    </div>
                </div>

                {/* Footer Actions - Sticky */}
                <div className="sticky bottom-0 px-6 py-4 bg-background border-t flex items-center justify-between">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xóa task
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSubmitting || !hasChanges}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
