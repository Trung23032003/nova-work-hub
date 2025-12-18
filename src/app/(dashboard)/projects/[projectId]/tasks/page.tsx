/**
 * PROJECT TASKS PAGE
 * 
 * URL: /projects/[projectId]/tasks
 * Placeholder cho danh sách tasks của project
 * Sẽ được implement đầy đủ ở Giai đoạn 4
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo } from "lucide-react";

interface ProjectTasksPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function ProjectTasksPage({ params }: ProjectTasksPageProps) {
    const { projectId } = await params;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Công việc</h2>
                    <p className="text-sm text-muted-foreground">
                        Quản lý các tasks của dự án
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo task mới
                </Button>
            </div>

            {/* Empty State - Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Chưa có công việc nào</CardTitle>
                    <CardDescription>
                        Bắt đầu bằng cách tạo task đầu tiên cho dự án
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-12">
                    <ListTodo className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                        Tasks giúp bạn chia nhỏ dự án thành các công việc cụ thể,
                        gán cho thành viên và theo dõi tiến độ.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        (Chức năng sẽ được phát triển đầy đủ ở Giai đoạn 4)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
