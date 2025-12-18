import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Users, Clock, Activity } from "lucide-react";
import { getDashboardStats, getTaskStatusDistribution, getUserWorkloadStats } from "@/server/services/report.service";
import { TaskStatusPieChart } from "@/components/features/dashboard/task-status-chart";
import { UserWorkloadBarChart } from "@/components/features/dashboard/user-workload-chart";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

/**
 * Metadata cho SEO
 */
export const metadata = {
    title: "Dashboard | NovaWork Hub",
    description: "Tổng quan dự án và công việc của bạn",
};

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch real data
    const [stats, taskDistribution, workload] = await Promise.all([
        getDashboardStats(),
        getTaskStatusDistribution(),
        getUserWorkloadStats(),
    ]);

    return (
        <div className="space-y-6">
            {/* WELCOME HEADER */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Xin chào, {session.user.name?.split(" ").at(-1) || "User"}! 👋
                    </h1>
                    <p className="text-muted-foreground">
                        Đây là tổng quan hệ thống NovaWork Hub của bạn.
                    </p>
                </div>
                <Badge variant="outline" className="px-3 py-1 gap-2 border-primary/20 bg-primary/5">
                    <Activity className="h-3 w-3 text-primary animate-pulse" />
                    Hệ thống ổn định
                </Badge>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng số dự án
                        </CardTitle>
                        <FolderKanban className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.totalProjects}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Dự án đã khởi tạo
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng số công việc
                        </CardTitle>
                        <CheckSquare className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.totalTasks}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tasks trong hệ thống
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Nhân sự
                        </CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Thành viên tổ chức
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Trạng thái công việc</CardTitle>
                        <CardDescription>Phân bổ tasks theo các bước thực hiện</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TaskStatusPieChart data={taskDistribution} />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Khối lượng công việc</CardTitle>
                        <CardDescription>Số lượng task chưa hoàn thành theo nhân sự</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserWorkloadBarChart data={workload} />
                    </CardContent>
                </Card>
            </div>

            {/* RECENT PROJECTS */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Dự án mới cập nhật</CardTitle>
                        <CardDescription>Các dự án vừa được khởi tạo hoặc thay đổi</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/projects">Xem tất cả</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentProjects.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground italic">
                                Chưa có dự án nào được tạo.
                            </div>
                        ) : (
                            stats.recentProjects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-md text-primary font-bold text-xs">
                                            {project.code}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{project.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={project.pm.image || ""} />
                                                    <AvatarFallback className="text-[10px]">{project.pm.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-muted-foreground">{project.pm.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs font-medium">{project._count.tasks} công việc</p>
                                            <p className="text-[10px] text-muted-foreground italic">
                                                {project.status === 'IN_PROGRESS' ? 'Đang triển khai' :
                                                    project.status === 'DONE' ? 'Đã hoàn thành' : 'Đang lập kế hoạch'}
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                                            <Link href={`/projects/${project.id}`}>
                                                <Activity className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Re-using Button from dashboard folder or global ui? 
// The file previously used button from @/components/ui/button. Let's make sure it's imported.
import { Button } from "@/components/ui/button";
