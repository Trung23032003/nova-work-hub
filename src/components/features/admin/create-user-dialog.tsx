"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema, CreateUserInput } from "@/lib/zod-schemas";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { createUser } from "@/actions/user";
import { toast } from "sonner";
import { Department } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    departments: Department[];
}

export function CreateUserDialog({ open, onOpenChange, departments }: CreateUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CreateUserInput>({
        resolver: zodResolver(CreateUserSchema) as any,
        defaultValues: {

            name: "",
            email: "",
            password: "Password123", // Default password
            role: "MEMBER",
            departmentId: "",
        },
    });

    const onSubmit = async (values: CreateUserInput) => {
        setIsLoading(true);
        try {
            const result = await createUser(values);
            if (result.success) {
                toast.success(result.message);
                form.reset();
                onOpenChange(false);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi không xác định");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Thêm người dùng mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin bên dưới để tạo tài khoản mới. Mật khẩu mặc định là Password123.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Họ và tên</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nguyễn Văn A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="example@company.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vai trò</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn vai trò" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ADMIN">Administrator</SelectItem>
                                                <SelectItem value="PM">Project Manager</SelectItem>
                                                <SelectItem value="MEMBER">Member</SelectItem>
                                                <SelectItem value="VIEWER">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phòng ban</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn phòng ban" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu (có thể đổi)</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo người dùng
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
