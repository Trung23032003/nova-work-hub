/**
 * ============================================================================
 * TASKS PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang danh sách công việc
 * URL: /tasks
 * 
 * ============================================================================
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";

export const metadata = {
    title: "Công việc | NovaWork Hub",
    description: "Quản lý công việc của bạn",
};

export default async function TasksPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Công việc</h1>
                    <p className="text-muted-foreground">
                        Tất cả công việc được giao cho bạn
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo công việc mới
                </Button>
            </div>

            {/* Empty State */}
            <Card>
                <CardHeader>
                    <CardTitle>Chưa có công việc nào</CardTitle>
                    <CardDescription>
                        Công việc sẽ xuất hiện ở đây khi được giao
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-12">
                    <CheckSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                        Tạo công việc trong dự án hoặc tạo todo cá nhân
                    </p>
                    <Button variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Tạo công việc đầu tiên
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
