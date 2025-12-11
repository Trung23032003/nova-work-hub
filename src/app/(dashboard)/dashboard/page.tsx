/**
 * ============================================================================
 * DASHBOARD PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang Dashboard chính sau khi đăng nhập
 * Hiển thị overview với các card thống kê
 * 
 * URL: /dashboard
 * FILE: src/app/(dashboard)/dashboard/page.tsx
 * 
 * LƯU Ý:
 * - Đây là Server Component (async function)
 * - auth() được gọi ở server để lấy session
 * - Middleware đã protect route này
 * 
 * ============================================================================
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, AlertTriangle, Clock } from "lucide-react";

/**
 * Metadata cho SEO
 */
export const metadata = {
    title: "Dashboard | NovaWork Hub",
    description: "Tổng quan dự án và công việc của bạn",
};

export default async function DashboardPage() {
    // =========================================================================
    // AUTHENTICATION CHECK
    // =========================================================================

    const session = await auth();

    // Redirect nếu không có session (backup cho middleware)
    if (!session?.user) {
        redirect("/login");
    }

    // =========================================================================
    // FAKE DATA (sẽ thay bằng real data sau)
    // =========================================================================

    const stats = {
        activeProjects: 5,
        myTasks: 12,
        completedToday: 3,
        overdue: 2,
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <div className="space-y-6">
            {/* ============================================= */}
            {/* WELCOME HEADER                               */}
            {/* ============================================= */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                    Xin chào, {session.user.name?.split(" ").at(-1) || "User"}! 👋
                </h1>
                <p className="text-muted-foreground">
                    Đây là tổng quan công việc của bạn hôm nay.
                </p>
            </div>

            {/* ============================================= */}
            {/* STATS CARDS                                  */}
            {/* ============================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Active Projects */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Dự án đang hoạt động
                        </CardTitle>
                        <FolderKanban className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.activeProjects}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            dự án đang tiến hành
                        </p>
                    </CardContent>
                </Card>

                {/* Card 2: My Tasks */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Công việc của tôi
                        </CardTitle>
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.myTasks}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            task được giao
                        </p>
                    </CardContent>
                </Card>

                {/* Card 3: Completed Today */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Hoàn thành hôm nay
                        </CardTitle>
                        <Clock className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-emerald-600">{stats.completedToday}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            task đã xong
                        </p>
                    </CardContent>
                </Card>

                {/* Card 4: Overdue */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Quá hạn
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-destructive">{stats.overdue}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            cần xử lý gấp
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ============================================= */}
            {/* RECENT ACTIVITY (Placeholder)                */}
            {/* ============================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">📋 Task gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Chưa có task nào.</p>
                            <p className="text-xs">Bắt đầu bằng cách tạo dự án mới.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">👥 Hoạt động của team</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Chưa có hoạt động nào.</p>
                            <p className="text-xs">Thêm thành viên vào dự án để xem.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
