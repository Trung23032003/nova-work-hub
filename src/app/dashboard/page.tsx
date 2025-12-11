/**
 * ============================================================================
 * DASHBOARD PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang dashboard chính sau khi đăng nhập
 * Hiển thị thông tin session để verify authentication hoạt động
 * 
 * ĐÂY LÀ PROTECTED ROUTE:
 * - Chỉ truy cập được khi đã đăng nhập
 * - Nếu chưa login, middleware sẽ redirect về /login
 * 
 * ============================================================================
 */

import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Hàm helper để lấy màu theo role
 */
function getRoleBadgeColor(role: string) {
    switch (role) {
        case "ADMIN":
            return "bg-red-500/20 text-red-400 border-red-500/50";
        case "PM":
            return "bg-blue-500/20 text-blue-400 border-blue-500/50";
        case "MEMBER":
            return "bg-green-500/20 text-green-400 border-green-500/50";
        case "VIEWER":
            return "bg-slate-500/20 text-slate-400 border-slate-500/50";
        default:
            return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
}

export default async function DashboardPage() {
    // =========================================================================
    // AUTHENTICATION CHECK
    // =========================================================================

    /**
     * auth() - Lấy session trong Server Component
     * 
     * Trả về:
     * - Session object nếu đã đăng nhập
     * - null nếu chưa đăng nhập
     * 
     * Lưu ý: Middleware đã redirect về /login nếu chưa đăng nhập
     * Nhưng double-check ở đây để type safety
     */
    const session = await auth();

    // Redirect nếu không có session (backup cho middleware)
    if (!session?.user) {
        redirect("/login");
    }

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* ============================================= */}
                {/* HEADER */}
                {/* ============================================= */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            🎉 Chào mừng, {session.user.name || "User"}!
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Bạn đã đăng nhập thành công vào NovaWork Hub
                        </p>
                    </div>

                    {/* Logout Button */}
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/login" });
                        }}
                    >
                        <Button
                            type="submit"
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        >
                            Đăng xuất
                        </Button>
                    </form>
                </div>

                {/* ============================================= */}
                {/* SESSION INFO CARD */}
                {/* ============================================= */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            ✅ Authentication Test - Thành công!
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Dưới đây là thông tin session hiện tại
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* User Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">
                                    User ID
                                </label>
                                <p className="text-sm text-slate-300 font-mono bg-slate-700/50 p-2 rounded">
                                    {session.user.id}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">
                                    Email
                                </label>
                                <p className="text-sm text-slate-300 font-mono bg-slate-700/50 p-2 rounded">
                                    {session.user.email}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">
                                    Name
                                </label>
                                <p className="text-sm text-slate-300 font-mono bg-slate-700/50 p-2 rounded">
                                    {session.user.name || "N/A"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider">
                                    Role
                                </label>
                                <div className="p-2">
                                    <Badge className={getRoleBadgeColor(session.user.role)}>
                                        {session.user.role}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Raw Session Object */}
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 uppercase tracking-wider">
                                Raw Session Object (JSON)
                            </label>
                            <pre className="text-xs text-slate-300 font-mono bg-slate-900/50 p-4 rounded overflow-auto max-h-48">
                                {JSON.stringify(session, null, 2)}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================= */}
                {/* TEST ROUTES CARD */}
                {/* ============================================= */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">
                            🧪 Test Routes
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Click các link dưới để test middleware protection
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <a
                                href="/dashboard"
                                className="p-3 bg-green-500/20 border border-green-500/50 rounded-md text-center hover:bg-green-500/30 transition"
                            >
                                <p className="text-green-400 font-medium">/dashboard</p>
                                <p className="text-xs text-green-400/70">Protected ✓</p>
                            </a>

                            <a
                                href="/projects"
                                className="p-3 bg-green-500/20 border border-green-500/50 rounded-md text-center hover:bg-green-500/30 transition"
                            >
                                <p className="text-green-400 font-medium">/projects</p>
                                <p className="text-xs text-green-400/70">Protected ✓</p>
                            </a>

                            <a
                                href="/admin"
                                className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-center hover:bg-red-500/30 transition"
                            >
                                <p className="text-red-400 font-medium">/admin</p>
                                <p className="text-xs text-red-400/70">Admin Only</p>
                            </a>

                            <a
                                href="/login"
                                className="p-3 bg-slate-500/20 border border-slate-500/50 rounded-md text-center hover:bg-slate-500/30 transition"
                            >
                                <p className="text-slate-400 font-medium">/login</p>
                                <p className="text-xs text-slate-400/70">Public</p>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================= */}
                {/* NEXT STEPS */}
                {/* ============================================= */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">
                            📋 Các bước tiếp theo
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Authentication đang hoạt động
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Session chứa đầy đủ thông tin (id, email, role)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Middleware bảo vệ protected routes
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-yellow-400">→</span>
                                Tiếp tục với bước 2.3: App Shell Layout (Sidebar, Header)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-yellow-400">→</span>
                                Tiếp tục với bước 2.4: SessionProvider cho Client Components
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
