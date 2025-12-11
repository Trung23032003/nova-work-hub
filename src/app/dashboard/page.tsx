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
 * Hàm helper để lấy màu theo role (Light Theme)
 */
function getRoleBadgeColor(role: string) {
    switch (role) {
        case "ADMIN":
            return "bg-red-100 text-red-700 border-red-300";
        case "PM":
            return "bg-blue-100 text-blue-700 border-blue-300";
        case "MEMBER":
            return "bg-emerald-100 text-emerald-700 border-emerald-300";
        case "VIEWER":
            return "bg-slate-100 text-slate-600 border-slate-300";
        default:
            return "bg-slate-100 text-slate-600 border-slate-300";
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
    // RENDER - LIGHT THEME
    // =========================================================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* ============================================= */}
                {/* HEADER */}
                {/* ============================================= */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            🎉 Chào mừng, {session.user.name || "User"}!
                        </h1>
                        <p className="text-slate-500 mt-1">
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
                            className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-colors"
                        >
                            Đăng xuất
                        </Button>
                    </form>
                </div>

                {/* ============================================= */}
                {/* SESSION INFO CARD */}
                {/* ============================================= */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg shadow-slate-200/50">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            ✅ Authentication Test - Thành công!
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Dưới đây là thông tin session hiện tại
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* User Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                                    User ID
                                </label>
                                <p className="text-sm text-slate-700 font-mono bg-slate-100 p-2 rounded-lg border border-slate-200">
                                    {session.user.id}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                                    Email
                                </label>
                                <p className="text-sm text-slate-700 font-mono bg-slate-100 p-2 rounded-lg border border-slate-200">
                                    {session.user.email}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                                    Name
                                </label>
                                <p className="text-sm text-slate-700 font-mono bg-slate-100 p-2 rounded-lg border border-slate-200">
                                    {session.user.name || "N/A"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-slate-500 uppercase tracking-wider font-medium">
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
                            <label className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                                Raw Session Object (JSON)
                            </label>
                            <pre className="text-xs text-slate-600 font-mono bg-slate-50 border border-slate-200 p-4 rounded-lg overflow-auto max-h-48">
                                {JSON.stringify(session, null, 2)}
                            </pre>
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================= */}
                {/* TEST ROUTES CARD */}
                {/* ============================================= */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg shadow-slate-200/50">
                    <CardHeader>
                        <CardTitle className="text-slate-800">
                            🧪 Test Routes
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Click các link dưới để test middleware protection
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <a
                                href="/dashboard"
                                className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                            >
                                <p className="text-emerald-700 font-medium">/dashboard</p>
                                <p className="text-xs text-emerald-600/70">Protected ✓</p>
                            </a>

                            <a
                                href="/projects"
                                className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 hover:shadow-md"
                            >
                                <p className="text-emerald-700 font-medium">/projects</p>
                                <p className="text-xs text-emerald-600/70">Protected ✓</p>
                            </a>

                            <a
                                href="/admin"
                                className="p-3 bg-red-50 border border-red-200 rounded-lg text-center hover:bg-red-100 hover:border-red-300 transition-all duration-200 hover:shadow-md"
                            >
                                <p className="text-red-700 font-medium">/admin</p>
                                <p className="text-xs text-red-600/70">Admin Only</p>
                            </a>

                            <a
                                href="/login"
                                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 hover:shadow-md"
                            >
                                <p className="text-slate-700 font-medium">/login</p>
                                <p className="text-xs text-slate-500">Public</p>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* ============================================= */}
                {/* NEXT STEPS */}
                {/* ============================================= */}
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg shadow-slate-200/50">
                    <CardHeader>
                        <CardTitle className="text-slate-800">
                            📋 Các bước tiếp theo
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">
                                <span className="text-emerald-500 font-bold">✓</span>
                                Authentication đang hoạt động
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-emerald-500 font-bold">✓</span>
                                Session chứa đầy đủ thông tin (id, email, role)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-emerald-500 font-bold">✓</span>
                                Middleware bảo vệ protected routes
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-amber-500 font-bold">→</span>
                                Tiếp tục với bước 2.3: App Shell Layout (Sidebar, Header)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-amber-500 font-bold">→</span>
                                Tiếp tục với bước 2.4: SessionProvider cho Client Components
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
