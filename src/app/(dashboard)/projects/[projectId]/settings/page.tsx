/**
 * PROJECT SETTINGS PAGE
 * 
 * URL: /projects/[projectId]/settings
 * Cài đặt dự án
 */

import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { getProjectById } from "@/server/services/project.service";

interface ProjectSettingsPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
    const { projectId } = await params;

    const project = await getProjectById(projectId);

    if (!project) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-2xl">
            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin chung</CardTitle>
                    <CardDescription>
                        Cập nhật thông tin cơ bản của dự án
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tên dự án</Label>
                        <Input
                            id="name"
                            defaultValue={project.name}
                            placeholder="Tên dự án"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">Mã dự án</Label>
                        <Input
                            id="code"
                            defaultValue={project.code}
                            placeholder="Mã dự án"
                            className="font-mono uppercase"
                            disabled
                        />
                        <p className="text-xs text-muted-foreground">
                            Mã dự án không thể thay đổi sau khi tạo
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            defaultValue={project.description || ""}
                            placeholder="Mô tả dự án..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clientName">Khách hàng</Label>
                        <Input
                            id="clientName"
                            defaultValue={project.clientName || ""}
                            placeholder="Tên khách hàng"
                        />
                    </div>

                    <Button>Lưu thay đổi</Button>
                </CardContent>
            </Card>

            {/* Dates */}
            <Card>
                <CardHeader>
                    <CardTitle>Thời gian</CardTitle>
                    <CardDescription>
                        Ngày bắt đầu và kết thúc dự án
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Ngày bắt đầu</Label>
                            <Input
                                id="startDate"
                                type="date"
                                defaultValue={project.startDate
                                    ? new Date(project.startDate).toISOString().split('T')[0]
                                    : ""
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Ngày kết thúc</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                defaultValue={project.dueDate
                                    ? new Date(project.dueDate).toISOString().split('T')[0]
                                    : ""
                                }
                            />
                        </div>
                    </div>
                    <Button>Cập nhật thời gian</Button>
                </CardContent>
            </Card>

            <Separator />

            {/* Danger Zone */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Vùng nguy hiểm
                    </CardTitle>
                    <CardDescription>
                        Các hành động không thể hoàn tác
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <p className="font-medium">Xóa dự án</p>
                            <p className="text-sm text-muted-foreground">
                                Xóa vĩnh viễn dự án và tất cả dữ liệu liên quan
                            </p>
                        </div>
                        <Button variant="destructive">
                            Xóa dự án
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
