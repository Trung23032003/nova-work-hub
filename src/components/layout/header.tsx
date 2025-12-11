/**
 * ============================================================================
 * HEADER COMPONENT - NOVAWORK HUB
 * ============================================================================
 * 
 * Header chính của dashboard layout
 * 
 * TÍNH NĂNG:
 * - Theme toggle (Light/Dark mode)
 * - User dropdown menu với avatar
 * - Responsive design
 * 
 * LƯU Ý:
 * - Đây là Client Component ("use client") vì dùng hooks:
 *   + useSession() để lấy thông tin user
 *   + useTheme() để toggle theme
 * 
 * ============================================================================
 */

"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Helper: Lấy 2 ký tự đầu của tên để hiển thị trong Avatar
 */
function getInitials(name: string | null | undefined): string {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

/**
 * Helper: Lấy màu badge theo role
 */
function getRoleBadgeVariant(role: string | undefined): "default" | "secondary" | "destructive" | "outline" {
    switch (role) {
        case "ADMIN":
            return "destructive";
        case "PM":
            return "default";
        case "MEMBER":
            return "secondary";
        default:
            return "outline";
    }
}

export function Header() {
    // =========================================================================
    // HOOKS
    // =========================================================================

    /**
     * mounted state - Để tránh hydration mismatch
     * next-themes cần chờ client mount trước khi có thể đọc theme từ localStorage
     */
    const [mounted, setMounted] = useState(false);

    /**
     * useSession() - Lấy session từ SessionProvider
     */
    const { data: session } = useSession();

    /**
     * useTheme() - Hook từ next-themes để quản lý theme
     * - theme: Current theme name
     * - setTheme: Function để đổi theme
     */
    const { setTheme, theme } = useTheme();

    /**
     * Effect để set mounted = true sau khi client mount
     * Điều này đảm bảo server và client render giống nhau lần đầu
     */
    useEffect(() => {
        setMounted(true);
    }, []);

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <header className="h-16 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
                {/* ------------------------------------------ */}
                {/* LEFT SIDE - Breadcrumb placeholder         */}
                {/* ------------------------------------------ */}
                <div className="flex items-center gap-2">
                    {/* TODO: Add breadcrumb navigation later */}
                    <span className="text-sm text-muted-foreground">
                        {/* Có thể thêm Breadcrumb ở đây */}
                    </span>
                </div>

                {/* ------------------------------------------ */}
                {/* RIGHT SIDE - Theme toggle + User menu      */}
                {/* ------------------------------------------ */}
                <div className="flex items-center gap-3">
                    {/* ------------------------------------ */}
                    {/* THEME TOGGLE BUTTON                  */}
                    {/* ------------------------------------ */}
                    {!mounted ? (
                        // Skeleton khi chưa mount - tránh hydration mismatch
                        <Skeleton className="h-9 w-9 rounded-md" />
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="relative"
                        >
                            {/* Sun icon - Visible in light mode */}
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                            {/* Moon icon - Visible in dark mode */}
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    )}

                    {/* ------------------------------------ */}
                    {/* USER DROPDOWN MENU                   */}
                    {/* ------------------------------------ */}
                    <DropdownMenu>
                        {/* Trigger - Avatar + Name */}
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2 px-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium">
                                        {getInitials(session?.user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-medium">
                                        {session?.user?.name || "User"}
                                    </span>
                                    <Badge
                                        variant={getRoleBadgeVariant(session?.user?.role)}
                                        className="text-[10px] px-1.5 py-0"
                                    >
                                        {session?.user?.role || "USER"}
                                    </Badge>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>

                        {/* Dropdown Content */}
                        <DropdownMenuContent align="end" className="w-56">
                            {/* User Info Header */}
                            <div className="px-2 py-1.5 text-sm">
                                <p className="font-medium">{session?.user?.name}</p>
                                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                            </div>

                            <DropdownMenuSeparator />

                            {/* Profile Link */}
                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                Hồ sơ cá nhân
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Logout Button */}
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
