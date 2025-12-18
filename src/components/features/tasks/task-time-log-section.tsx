"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Clock,
    Plus,
    Trash2,
    History,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { LogTimeSchema } from "@/lib/zod-schemas";
import { addTimeLog, deleteTimeLog, getTaskTimeLogs } from "@/actions/timelog";
import { TimeLogListItem } from "@/server/services/timelog.service";

interface TaskTimeLogSectionProps {
    taskId: string;
    estimateHours?: number | null;
    currentUserId: string;
    currentUserRole: string;
    onRefresh?: () => void;
}

export function TaskTimeLogSection({
    taskId,
    estimateHours = 0,
    currentUserId,
    currentUserRole,
    onRefresh,
}: TaskTimeLogSectionProps) {
    const [logs, setLogs] = useState<TimeLogListItem[]>([]);
    const [totalHours, setTotalHours] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch logs
    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const result = await getTaskTimeLogs(taskId);
            if (result.success) {
                setLogs(result.data.logs);
                setTotalHours(result.data.totalHours);
            }
        } catch (error) {
            console.error("Fetch logs error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [taskId]);

    const handleAddSuccess = () => {
        setIsDialogOpen(false);
        fetchLogs();
        if (onRefresh) onRefresh();
    };

    const handleDelete = async (logId: string) => {
        const result = await deleteTimeLog(logId);
        if (result.success) {
            toast.success("Đã xóa log giờ");
            fetchLogs();
            if (onRefresh) onRefresh();
        } else {
            toast.error(result.error);
        }
    };

    // Tính toán phần trăm tiến độ dựa trên estimate
    const progress = estimateHours && estimateHours > 0
        ? Math.min(Math.round((totalHours / estimateHours) * 100), 100)
        : 0;

    const isOverEstimated = estimateHours && estimateHours > 0 && totalHours > estimateHours;

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Chấm công</h3>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Ghi nhận giờ
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <LogTimeForm taskId={taskId} onSuccess={handleAddSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Card */}
            <Card className="bg-muted/30 border-none shadow-sm">
                <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Tổng thời gian</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">{totalHours}</span>
                                <span className="text-muted-foreground">/ {estimateHours || "?"} giờ</span>
                            </div>
                        </div>
                        {isOverEstimated ? (
                            <div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Vượt dự kiến
                            </div>
                        ) : totalHours > 0 && totalHours === estimateHours ? (
                            <div className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Đạt tiến độ
                            </div>
                        ) : null}
                    </div>

                    {estimateHours && estimateHours > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>Tiến độ thời gian</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className={`h-2 ${isOverEstimated ? "bg-destructive/20" : ""}`} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Logs List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <History className="h-4 w-4" />
                    Lịch sử ghi nhận
                </div>

                {logs.length === 0 ? (
                    <div className="text-center py-8 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                        <p className="text-sm text-muted-foreground italic">Chưa có bản ghi nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors"
                                id={`timelog-${log.id}`}
                            >
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src={log.user.image || ""} />
                                    <AvatarFallback className="text-[10px]">
                                        {log.user.name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold truncate">{log.user.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(log.date), "dd/MM/yyyy", { locale: vi })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                                            {log.hours} giờ
                                        </span>
                                        {log.note && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 italic">"{log.note}"</p>
                                        )}
                                    </div>

                                    <div className="text-[10px] text-muted-foreground">
                                        Ghi nhận lúc: {format(new Date(log.createdAt), "HH:mm, dd/MM", { locale: vi })}
                                    </div>
                                </div>

                                {(log.userId === currentUserId || currentUserRole === "ADMIN") && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity"
                                                id={`delete-timelog-${log.id}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Xóa bản ghi này?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Hành động này không thể hoàn tác. Tổng số giờ của task sẽ được tính toán lại.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(log.id)}
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    Xóa
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Form component inside the dialog
function LogTimeForm({ taskId, onSuccess }: { taskId: string; onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof LogTimeSchema>>({
        resolver: zodResolver(LogTimeSchema) as any,
        defaultValues: {
            taskId: taskId,
            hours: 1,
            date: new Date(),
            note: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof LogTimeSchema>) => {
        try {
            setIsSubmitting(true);
            const result = await addTimeLog(values);
            if (result.success) {
                toast.success(result.message);
                onSuccess();
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Ghi nhận thời gian</DialogTitle>
                    <DialogDescription>
                        Nhập số giờ bạn đã dành cho task này và ngày thực hiện.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="hours"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số giờ</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.25"
                                        placeholder="VD: 1.5"
                                        {...field}
                                        id="timelog-hours-input"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ngày làm việc</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        id="timelog-date-input"
                                        value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ghi chú (Tùy chọn)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Bạn đã làm gì trong khoảng thời gian này?"
                                    className="resize-none"
                                    {...field}
                                    id="timelog-note-input"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                        id="submit-timelog-button"
                    >
                        {isSubmitting ? "Đang lưu..." : "Lưu bản ghi"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}
