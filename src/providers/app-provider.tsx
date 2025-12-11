"use client";

/**
 * AppProvider - Global Providers Wrapper
 * 
 * File này wrap toàn bộ ứng dụng với các providers cần thiết:
 * 
 * 1. SessionProvider (next-auth/react)
 *    - Cho phép sử dụng useSession() hook trong Client Components
 *    - Tự động refresh session khi gần hết hạn
 * 
 * 2. ThemeProvider (next-themes)
 *    - Hỗ trợ chuyển đổi dark/light mode
 *    - Lưu preference vào localStorage
 *    - attribute="class" → Thêm class "dark" vào <html>
 * 
 * 3. Toaster (sonner)
 *    - Hiển thị toast notifications
 *    - Sử dụng: import { toast } from "sonner"; toast.success("Thành công!");
 */

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

interface AppProviderProps {
    children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                />
            </ThemeProvider>
        </SessionProvider>
    );
}
