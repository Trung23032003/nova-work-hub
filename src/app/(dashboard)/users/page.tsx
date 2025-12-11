/**
 * ============================================================================
 * USERS PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang danh sách nhân sự
 * URL: /users
 * 
 * ============================================================================
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export const metadata = {
    title: "Nhân sự | NovaWork Hub",
    description: "Quản lý nhân sự của tổ chức",
};

export default async function UsersPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nhân sự</h1>
                    <p className="text-muted-foreground">
                        Quản lý thành viên trong tổ chức
                    </p>
                </div>
                {session.user.role === "ADMIN" && (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Thêm thành viên
                    </Button>
                )}
            </div>

            {/* Empty State */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách nhân sự</CardTitle>
                    <CardDescription>
                        Xem và quản lý tất cả thành viên
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                        Chức năng đang được phát triển...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
