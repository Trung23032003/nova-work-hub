/**
 * ============================================================================
 * ADMIN PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang quản trị hệ thống
 * URL: /admin
 * 
 * LƯU Ý:
 * - Chỉ ADMIN mới truy cập được (middleware đã bảo vệ)
 * 
 * ============================================================================
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FolderKanban, Settings } from "lucide-react";

export const metadata = {
    title: "Quản trị | NovaWork Hub",
    description: "Trang quản trị hệ thống",
};

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Double-check: Only ADMIN can access
    if (session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-destructive" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản trị hệ thống</h1>
                    <p className="text-muted-foreground">
                        Bạn đang truy cập với quyền Administrator
                    </p>
                </div>
            </div>

            {/* Admin Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Quản lý Users
                        </CardTitle>
                        <CardDescription>
                            Thêm, sửa, xóa và phân quyền users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Đang phát triển...
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderKanban className="h-5 w-5 text-emerald-500" />
                            Quản lý Dự án
                        </CardTitle>
                        <CardDescription>
                            Xem tất cả dự án trong hệ thống
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Đang phát triển...
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-purple-500" />
                            Cài đặt hệ thống
                        </CardTitle>
                        <CardDescription>
                            Cấu hình chung cho toàn bộ ứng dụng
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Đang phát triển...
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
