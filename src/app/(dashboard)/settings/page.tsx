/**
 * ============================================================================
 * SETTINGS PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang cài đặt
 * URL: /settings
 * 
 * ============================================================================
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export const metadata = {
    title: "Cài đặt | NovaWork Hub",
    description: "Cài đặt tài khoản và ứng dụng",
};

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
                <p className="text-muted-foreground">
                    Quản lý cài đặt tài khoản và ứng dụng
                </p>
            </div>

            {/* Settings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Hồ sơ cá nhân</CardTitle>
                        <CardDescription>
                            Cập nhật thông tin cá nhân của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-8">
                        <Settings className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-sm text-muted-foreground">
                            Đang phát triển...
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Thông báo</CardTitle>
                        <CardDescription>
                            Cấu hình cài đặt thông báo
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-8">
                        <Settings className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-sm text-muted-foreground">
                            Đang phát triển...
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
