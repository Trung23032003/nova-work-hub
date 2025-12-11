/**
 * ============================================================================
 * LOGIN PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang đăng nhập cho phép user đăng nhập bằng:
 * - Email/Password (Credentials)
 * - Google OAuth (nếu đã cấu hình)
 * 
 * FLOW ĐĂNG NHẬP:
 * 1. User nhập email + password
 * 2. Submit form → gọi signIn("credentials", {...})
 * 3. Auth.js validate credentials trong authorize()
 * 4. Nếu thành công → redirect về callbackUrl hoặc /dashboard
 * 5. Nếu thất bại → hiển thị error message
 * 
 * ============================================================================
 */

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    // =========================================================================
    // STATE MANAGEMENT
    // =========================================================================

    /**
     * Form state - lưu trữ giá trị email và password
     */
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    /**
     * Loading state - hiển thị spinner khi đang xử lý
     */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Error state - hiển thị lỗi khi đăng nhập thất bại
     */
    const [error, setError] = useState("");

    // =========================================================================
    // HOOKS
    // =========================================================================

    /**
     * Router - dùng để redirect sau khi đăng nhập
     */
    const router = useRouter();

    /**
     * SearchParams - lấy callbackUrl và error từ URL
     * - callbackUrl: Trang redirect sau khi login thành công
     * - error: Error code từ Auth.js
     */
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const urlError = searchParams.get("error");

    // =========================================================================
    // HANDLERS
    // =========================================================================

    /**
     * Xử lý đăng nhập bằng Credentials (email/password)
     */
    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn form submit mặc định

        setIsLoading(true);
        setError("");

        try {
            /**
             * Gọi signIn từ next-auth/react
             * 
             * Params:
             * - "credentials": Tên provider
             * - { email, password }: Credentials data
             * - redirect: false để xử lý redirect thủ công
             */
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false, // QUAN TRỌNG: Để false để xử lý error
            });

            console.log("[Login] signIn result:", result);

            if (result?.error) {
                // Đăng nhập thất bại
                setError("Email hoặc mật khẩu không đúng");
            } else if (result?.ok) {
                // Đăng nhập thành công - redirect
                console.log("[Login] Success, redirecting to:", callbackUrl);
                router.push(callbackUrl);
                router.refresh(); // Refresh để cập nhật session
            }
        } catch (err) {
            console.error("[Login] Error:", err);
            setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Xử lý đăng nhập bằng Google OAuth
     */
    const handleGoogleLogin = async () => {
        setIsLoading(true);

        /**
         * Với OAuth, redirect: true (mặc định)
         * Auth.js sẽ redirect đến Google, sau đó quay lại callbackUrl
         */
        await signIn("google", { callbackUrl });
    };

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur">
                {/* ============================================= */}
                {/* CARD HEADER */}
                {/* ============================================= */}
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-white">
                        NovaWork Hub
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Đăng nhập để tiếp tục
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* ============================================= */}
                    {/* ERROR MESSAGES */}
                    {/* ============================================= */}

                    {/* Error từ form */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    {/* Error từ URL (OAuth error, etc.) */}
                    {urlError && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                            <p className="text-red-400 text-sm text-center">
                                {urlError === "OAuthAccountNotLinked"
                                    ? "Email này đã được sử dụng với phương thức đăng nhập khác"
                                    : "Đã có lỗi xảy ra khi đăng nhập"}
                            </p>
                        </div>
                    )}

                    {/* ============================================= */}
                    {/* CREDENTIALS FORM */}
                    {/* ============================================= */}
                    <form onSubmit={handleCredentialsLogin} className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm text-slate-300">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm text-slate-300">
                                Mật khẩu
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                    </form>

                    {/* ============================================= */}
                    {/* DIVIDER */}
                    {/* ============================================= */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-800/50 px-2 text-slate-500">
                                Hoặc
                            </span>
                        </div>
                    </div>

                    {/* ============================================= */}
                    {/* GOOGLE OAUTH BUTTON */}
                    {/* ============================================= */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Đăng nhập với Google
                    </Button>

                    {/* ============================================= */}
                    {/* TEST ACCOUNT INFO */}
                    {/* ============================================= */}
                    <div className="mt-6 p-4 bg-slate-700/30 rounded-md border border-slate-600/50">
                        <p className="text-xs text-slate-400 font-medium mb-2">
                            🔐 Tài khoản test:
                        </p>
                        <div className="text-xs text-slate-300 space-y-1">
                            <p>
                                <span className="text-slate-500">Admin:</span>{" "}
                                <code className="bg-slate-600/50 px-1 rounded">admin@novawork.local</code>
                            </p>
                            <p>
                                <span className="text-slate-500">PM:</span>{" "}
                                <code className="bg-slate-600/50 px-1 rounded">pm@novawork.local</code>
                            </p>
                            <p>
                                <span className="text-slate-500">Password:</span>{" "}
                                <code className="bg-slate-600/50 px-1 rounded">Password@123</code>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
