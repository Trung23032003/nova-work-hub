"use client";

/**
 * CREATE PROJECT DIALOG
 * 
 * Modal form để tạo dự án mới
 * Sử dụng react-hook-form + zod validation + Server Action
 */

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Calendar as CalendarIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CreateProjectSchema, type CreateProjectInput } from "@/lib/zod-schemas";
import { createProject } from "@/actions/project";

// ============================================
// TYPES
// ============================================

interface User {
    id: string;
    name: string | null;
    email: string | null;
}

interface CreateProjectDialogProps {
    /** Danh sách users có thể làm PM */
    users: User[];
    /** ID của user hiện tại (mặc định là PM) */
    currentUserId: string;
    /** Custom trigger button */
    trigger?: React.ReactNode;
}

// ============================================
// COMPONENT
// ============================================

export function CreateProjectDialog({
    users,
    currentUserId,
    trigger
}: CreateProjectDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [prevName, setPrevName] = useState("");  // Track previous name for auto-gen logic
    const router = useRouter();

    // Form values type (explicit để tránh type inference issues với Zod v4)
    type FormValues = {
        name: string;
        code: string;
        description: string;
        clientName: string;
        priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
        pmId: string;
        startDate: Date | undefined;
        dueDate: Date | undefined;
    };

    // Initialize form with react-hook-form + zod
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<FormValues>({
        resolver: zodResolver(CreateProjectSchema) as any,
        defaultValues: {
            name: "",
            code: "",
            description: "",
            clientName: "",
            priority: "MEDIUM",
            pmId: currentUserId,
            startDate: undefined,
            dueDate: undefined,
        },
    });

    // Auto-generate code from name
    const handleNameChange = (name: string) => {
        const currentCode = form.getValues("code");
        const expectedCode = generateCode(prevName);

        // Only auto-generate if code is empty or matches the expected generated code
        if (!currentCode || currentCode === expectedCode) {
            form.setValue("code", generateCode(name));
        }

        // Update prevName for next comparison
        setPrevName(name);
    };

    const generateCode = (name: string): string => {
        return name
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "D")
            .replace(/[^A-Z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
            .slice(0, 15);
    };

    // Submit handler
    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            const result = await createProject(data as CreateProjectInput);

            if (result.success) {
                toast.success(result.message || "Tạo dự án thành công!");
                setOpen(false);
                form.reset();
                setPrevName("");  // Reset prevName state
                router.refresh();
                // Optionally navigate to the new project
                // router.push(`/projects/${result.data.id}`);
            } else {
                toast.error(result.error);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tạo dự án mới
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo dự án mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin để tạo dự án. Bạn có thể chỉnh sửa sau.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên dự án *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="VD: Website E-commerce ABC"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                handleNameChange(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Code & Priority Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã dự án *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="VD: WEB-ABC"
                                                className="font-mono uppercase"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value.toUpperCase());
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Chỉ chữ IN HOA, số và dấu -
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Độ ưu tiên</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn độ ưu tiên" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LOW">Thấp</SelectItem>
                                                <SelectItem value="MEDIUM">Trung bình</SelectItem>
                                                <SelectItem value="HIGH">Cao</SelectItem>
                                                <SelectItem value="CRITICAL">Khẩn cấp</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Mô tả ngắn về dự án..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Client Name */}
                        <FormField
                            control={form.control}
                            name="clientName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Khách hàng</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Tên khách hàng (nếu có)"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* PM Select */}
                        <FormField
                            control={form.control}
                            name="pmId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Manager *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn PM" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name || user.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Dates Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày bắt đầu</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="date"
                                                    className="pl-10"
                                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày kết thúc</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="date"
                                                    className="pl-10"
                                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo dự án
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
