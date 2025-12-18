/**
 * PROJECT OVERVIEW PAGE (Default Tab)
 * 
 * URL: /projects/[projectId]
 * Hiển thị tổng quan dự án:
 * - Stats cards
 * - Recent activity
 * - Quick links
 */

import { notFound } from "next/navigation";
import {
    CheckSquare,
    Clock,
    Users,
    AlertCircle,
    TrendingUp,
    Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjectById, getProjectStats } from "@/server/services/project.service";

interface ProjectOverviewPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function ProjectOverviewPage({ params }: ProjectOverviewPageProps) {
    const { projectId } = await params;

    // Fetch project and stats
    const [project, stats] = await Promise.all([
        getProjectById(projectId),
        getProjectStats(projectId),
    ]);

    if (!project) {
        notFound();
    }

    // Calculate progress
    const progressPercentage = stats.totalTasks > 0
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Tasks */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng công việc
                        </CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTasks}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.completedTasks} hoàn thành
                        </p>
                    </CardContent>
                </Card>

                {/* Progress */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tiến độ
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progressPercentage}%</div>
                        <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                            <div
                                className="h-2 rounded-full bg-primary transition-all"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Members */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Thành viên
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.memberCount}</div>
                        <p className="text-xs text-muted-foreground">
                            người tham gia
                        </p>
                    </CardContent>
                </Card>

                {/* Hours Logged */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Giờ đã log
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalHoursLogged}</div>
                        <p className="text-xs text-muted-foreground">
                            giờ làm việc
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Task Status Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Phân bổ công việc</CardTitle>
                        <CardDescription>
                            Số lượng tasks theo trạng thái
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { key: "TODO", label: "Cần làm", color: "bg-slate-500" },
                                { key: "IN_PROGRESS", label: "Đang làm", color: "bg-blue-500" },
                                { key: "REVIEW", label: "Đang review", color: "bg-yellow-500" },
                                { key: "DONE", label: "Hoàn thành", color: "bg-green-500" },
                            ].map((status) => {
                                const count = stats.tasksByStatus[status.key] || 0;
                                const percentage = stats.totalTasks > 0
                                    ? (count / stats.totalTasks) * 100
                                    : 0;

                                return (
                                    <div key={status.key} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{status.label}</span>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-secondary">
                                            <div
                                                className={`h-2 rounded-full ${status.color} transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Project Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin dự án</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Dates */}
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Thời gian</p>
                                <p className="text-sm text-muted-foreground">
                                    {project.startDate
                                        ? new Date(project.startDate).toLocaleDateString("vi-VN")
                                        : "Chưa xác định"
                                    }
                                    {" → "}
                                    {project.dueDate
                                        ? new Date(project.dueDate).toLocaleDateString("vi-VN")
                                        : "Chưa xác định"
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Client */}
                        {project.clientName && (
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Khách hàng</p>
                                    <p className="text-sm text-muted-foreground">
                                        {project.clientName}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Budget */}
                        {project.budget && (
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Ngân sách</p>
                                    <p className="text-sm text-muted-foreground">
                                        {Number(project.budget).toLocaleString("vi-VN")} VNĐ
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Members preview */}
                        <div>
                            <p className="text-sm font-medium mb-2">Thành viên</p>
                            <div className="flex flex-wrap gap-2">
                                {project.members.slice(0, 5).map((member) => (
                                    <Badge key={member.id} variant="secondary">
                                        {member.user.name || member.user.email}
                                        {member.role === "PM" && " (PM)"}
                                    </Badge>
                                ))}
                                {project.members.length > 5 && (
                                    <Badge variant="outline">
                                        +{project.members.length - 5} khác
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity - Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Hoạt động gần đây</CardTitle>
                    <CardDescription>
                        Các cập nhật mới nhất của dự án
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Chức năng đang được phát triển...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
