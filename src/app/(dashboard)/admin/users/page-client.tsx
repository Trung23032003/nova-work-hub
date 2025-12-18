"use client";

import { useState } from "react";
import { UserListItem } from "@/server/services/user.service";
import { Department } from "@prisma/client";
import { UserList } from "@/components/features/admin/user-list";
import { CreateUserDialog } from "@/components/features/admin/create-user-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface AdminUsersPageClientProps {
    initialUsers: UserListItem[];
    departments: Department[];
    currentUserId: string;
}

export function AdminUsersPageClient({
    initialUsers,
    departments,
    currentUserId
}: AdminUsersPageClientProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("ALL");

    // Lọc users ở client để phản hồi nhanh (server vẫn làm lọc chính)
    const filteredUsers = initialUsers.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                    <p className="text-muted-foreground">
                        Thêm mới, chỉnh sửa và quản lý quyền truy cập của nhân viên.
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 shrink-0">
                    <Plus className="h-4 w-4" />
                    Thêm người dùng
                </Button>
            </div>

            {/* Stats Summary (Optional but nice) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Tổng nhân sự</p>
                            <h3 className="text-2xl font-bold">{initialUsers.length}</h3>
                        </div>
                    </div>
                </div>
                {/* Có thể thêm các stats khác ở đây */}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Tất cả vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả vai trò</SelectItem>
                            <SelectItem value="ADMIN">Administrator</SelectItem>
                            <SelectItem value="PM">Project Manager</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List */}
            <UserList users={filteredUsers} currentUserId={currentUserId} />

            {/* Dialogs */}
            <CreateUserDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                departments={departments}
            />
        </div>
    );
}
