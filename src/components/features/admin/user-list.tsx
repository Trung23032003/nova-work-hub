"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    MoreHorizontal,
    Shield,
    User as UserIcon,
    Mail,
    Building2,
    Trash2,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    Lock
} from "lucide-react";
import { UserListItem } from "@/server/services/user.service";
import { UserRole, UserStatus } from "@prisma/client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { updateUserStatus, deleteUser } from "@/actions/user";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserListProps {
    users: UserListItem[];
    currentUserId: string;
}

export function UserList({ users, currentUserId }: UserListProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleStatusChange = async (userId: string, status: UserStatus) => {
        const result = await updateUserStatus(userId, status);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async (userId: string) => {
        const result = await deleteUser(userId);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.error);
        }
        setIsDeleting(null);
    };

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case "ADMIN":
                return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" /> Admin</Badge>;
            case "PM":
                return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 gap-1"><ShieldAlert className="h-3 w-3" /> PM</Badge>;
            case "MEMBER":
                return <Badge variant="secondary" className="gap-1"><UserIcon className="h-3 w-3" /> Member</Badge>;
            case "VIEWER":
                return <Badge variant="outline" className="gap-1"><Mail className="h-3 w-3" /> Viewer</Badge>;
        }
    };

    const getStatusBadge = (status: UserStatus) => {
        switch (status) {
            case "ACTIVE":
                return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 gap-1"><CheckCircle2 className="h-3 w-3" /> Đang hoạt động</Badge>;
            case "INACTIVE":
                return <Badge variant="outline" className="text-muted-foreground gap-1"><XCircle className="h-3 w-3" /> Tạm nghỉ</Badge>;
            case "LOCKED":
                return <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5 gap-1"><Lock className="h-3 w-3" /> Đã khóa</Badge>;
        }
    };

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Phòng ban</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tham gia</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Không tìm thấy người dùng nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.image || ""} />
                                                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            {user.department?.name || "Chưa có"}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: vi })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => toast.info("Tính năng sửa đang phát triển")}>
                                                    Sửa thông tin
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider">Trạng thái</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusChange(user.id, "ACTIVE")}
                                                    disabled={user.status === "ACTIVE" || user.id === currentUserId}
                                                >
                                                    Kích hoạt
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusChange(user.id, "INACTIVE")}
                                                    disabled={user.status === "INACTIVE" || user.id === currentUserId}
                                                >
                                                    Tạm nghỉ
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusChange(user.id, "LOCKED")}
                                                    className="text-destructive"
                                                    disabled={user.status === "LOCKED" || user.id === currentUserId}
                                                >
                                                    Khóa tài khoản
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive font-medium"
                                                    disabled={user.id === currentUserId}
                                                    onClick={() => setIsDeleting(user.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Xóa vĩnh viễn
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!isDeleting} onOpenChange={() => setIsDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Toàn bộ dữ liệu liên quan đến người dùng này sẽ bị xóa khỏi hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => isDeleting && handleDelete(isDeleting)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Xác nhận xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
