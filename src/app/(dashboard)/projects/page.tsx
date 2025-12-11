/**
 * ============================================================================
 * PROJECTS PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang danh sách dự án
 * URL: /projects
 * 
 * ============================================================================
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";

export const metadata = {
    title: "Dự án | NovaWork Hub",
    description: "Quản lý các dự án của bạn",
};

export default async function ProjectsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dự án</h1>
                    <p className="text-muted-foreground">
                        Quản lý và theo dõi tất cả dự án của bạn
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo dự án mới
                </Button>
            </div>

            {/* Empty State */}
            <Card>
                <CardHeader>
                    <CardTitle>Chưa có dự án nào</CardTitle>
                    <CardDescription>
                        Bắt đầu bằng cách tạo dự án đầu tiên của bạn
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-12">
                    <FolderKanban className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                        Dự án giúp bạn tổ chức công việc và cộng tác với team
                    </p>
                    <Button variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tạo dự án đầu tiên
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
