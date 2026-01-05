/**
 * AUTH CONFIG CHO EDGE RUNTIME (Middleware)
 * 
 * File này chứa config tối thiểu để auth() hoạt động trong middleware
 * KHÔNG dùng PrismaAdapter vì Prisma không chạy trên Edge Runtime
 */

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

/**
 * Auth config cho Edge Runtime
 * Chỉ cần những config cơ bản, không cần adapter
 */
export const authConfig: NextAuthConfig = {
    trustHost: true, // Quan trọng cho Docker/production
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        /**
         * Authorized callback - kiểm tra user có được truy cập route không
         * Chạy trong middleware (Edge Runtime)
         */
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Public routes - không cần đăng nhập
            const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

            // Protected routes - cần đăng nhập
            const protectedRoutes = ["/dashboard", "/projects", "/tasks", "/calendar", "/reports", "/settings", "/profile"];

            // Admin routes
            const adminRoutes = ["/admin"];

            const isPublicRoute = publicRoutes.includes(pathname);
            const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
            const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
            const isAuthRoute = pathname === "/login" || pathname === "/register";

            // Protected route + chưa login → redirect login
            if (isProtectedRoute && !isLoggedIn) {
                return false; // Redirect to signIn page
            }

            // Admin route + không phải admin → redirect dashboard
            if (isAdminRoute && isLoggedIn && auth?.user?.role !== "ADMIN") {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            // Auth route + đã login → redirect dashboard
            if (isAuthRoute && isLoggedIn) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            return true;
        },
    },
    providers: [], // Providers sẽ được config ở auth.ts (Node.js)
};

/**
 * Export auth cho middleware
 * Chỉ dùng config tối thiểu, không có PrismaAdapter
 */
export const { auth } = NextAuth(authConfig);
