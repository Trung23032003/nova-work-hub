/**
 * ============================================================================
 * MIDDLEWARE - ROUTE PROTECTION - NOVAWORK HUB
 * ============================================================================
 * 
 * Middleware là code chạy TRƯỚC mỗi request được xử lý bởi route handler.
 * File này phải nằm ở ROOT folder (cùng cấp với src/).
 * 
 * CHỨC NĂNG CHÍNH:
 * -----------------
 * 1. Bảo vệ routes yêu cầu đăng nhập (protected routes)
 * 2. Redirect user đã đăng nhập khỏi trang login
 * 3. Kiểm tra quyền truy cập dựa theo role (authorization)
 * 
 * FLOW XỬ LÝ:
 * ------------
 * 1. Request đến
 * 2. Middleware check authentication status
 * 3. Nếu route protected + chưa login → redirect /login
 * 4. Nếu route admin + không phải admin → redirect /dashboard
 * 5. Nếu pass → tiếp tục xử lý route
 * 
 * LƯU Ý QUAN TRỌNG:
 * ------------------
 * - Middleware chạy trên Edge Runtime (không phải Node.js)
 * - Không thể dùng một số Node.js APIs
 * - Phải nhẹ và nhanh (chạy mọi request)
 * 
 * ============================================================================
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * AUTH MIDDLEWARE WRAPPER
 * ------------------------
 * Sử dụng auth() từ Auth.js để wrap middleware function
 * 
 * auth() trả về middleware function với req.auth chứa session
 * Đây là cách official của Auth.js v5 để check auth trong middleware
 */
export default auth((req) => {
    // =========================================================================
    // BƯỚC 1: EXTRACT REQUEST INFO
    // =========================================================================

    /**
     * nextUrl: URL object của request hiện tại
     * Chứa: pathname, searchParams, origin, etc.
     */
    const { nextUrl } = req;

    /**
     * pathname: Đường dẫn của request (không bao gồm query string)
     * Ví dụ: "/dashboard", "/projects/123", "/admin/users"
     */
    const pathname = nextUrl.pathname;

    /**
     * isLoggedIn: Kiểm tra user đã đăng nhập chưa
     * req.auth được inject bởi auth() wrapper, chứa session nếu đã login
     */
    const isLoggedIn = !!req.auth;

    /**
     * userRole: Role của user (nếu đã login)
     * Dùng để kiểm tra quyền truy cập các trang admin
     */
    const userRole = req.auth?.user?.role;

    // =========================================================================
    // BƯỚC 2: ĐỊNH NGHĨA CÁC LOẠI ROUTES
    // =========================================================================

    /**
     * PUBLIC ROUTES
     * --------------
     * Các routes không cần đăng nhập
     * Mọi user (kể cả guest) đều có thể truy cập
     */
    const publicRoutes = [
        "/",              // Homepage
        "/login",         // Trang đăng nhập
        "/register",      // Trang đăng ký (nếu có)
        "/forgot-password", // Quên mật khẩu (nếu có)
    ];

    /**
     * PROTECTED ROUTES
     * -----------------
     * Các routes yêu cầu đăng nhập
     * User chưa login sẽ bị redirect về /login
     */
    const protectedRoutes = [
        "/dashboard",     // Trang dashboard chính
        "/projects",      // Quản lý dự án
        "/tasks",         // Quản lý công việc
        "/calendar",      // Lịch làm việc
        "/reports",       // Báo cáo
        "/settings",      // Cài đặt cá nhân
        "/profile",       // Trang profile
    ];

    /**
     * ADMIN ROUTES
     * -------------
     * Các routes chỉ dành cho Admin
     * User không phải ADMIN sẽ bị redirect về /dashboard
     */
    const adminRoutes = [
        "/admin",         // Admin panel
    ];

    /**
     * PM ROUTES
     * ----------
     * Các routes dành cho Project Manager trở lên
     * MEMBER và VIEWER không có quyền truy cập
     */
    const pmRoutes: string[] = [
        // Có thể thêm các routes dành riêng cho PM
        // Ví dụ: "/reports", "/analytics"
    ];

    // =========================================================================
    // BƯỚC 3: KIỂM TRA VÀ PHÂN LOẠI REQUEST
    // =========================================================================

    /**
     * isPublicRoute: Kiểm tra path có phải public route không
     * Dùng exact match cho các path cố định
     */
    const isPublicRoute = publicRoutes.includes(pathname);

    /**
     * isProtectedRoute: Kiểm tra path có phải protected route không
     * Dùng startsWith để match cả nested routes
     * Ví dụ: "/projects" match cả "/projects/123"
     */
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    /**
     * isAdminRoute: Kiểm tra path có phải admin route không
     * Admin routes cần role ADMIN
     */
    const isAdminRoute = adminRoutes.some((route) =>
        pathname.startsWith(route)
    );

    /**
     * isPMRoute: Kiểm tra path có phải PM route không
     * PM routes cần role PM hoặc ADMIN
     */
    const isPMRoute = pmRoutes.some((route) =>
        pathname.startsWith(route)
    );

    /**
     * isAuthRoute: Kiểm tra path có phải auth route không
     * (login, register) - User đã đăng nhập không cần vào
     */
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    // =========================================================================
    // BƯỚC 4: XỬ LÝ REDIRECT LOGIC
    // =========================================================================

    /**
     * CASE 1: Protected Route + Chưa Login
     * -------------------------------------
     * Redirect về trang login với callbackUrl
     * Sau khi login xong sẽ redirect lại trang ban đầu
     */
    if (isProtectedRoute && !isLoggedIn) {
        // Tạo URL login với callback parameter
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);

        console.log("[Middleware] Redirecting unauthenticated user to login:", pathname);
        return NextResponse.redirect(loginUrl);
    }

    /**
     * CASE 2: Admin Route + Không phải Admin
     * ---------------------------------------
     * Redirect về dashboard (không có quyền)
     */
    if (isAdminRoute && isLoggedIn && userRole !== "ADMIN") {
        console.log("[Middleware] Non-admin user trying to access admin route:", pathname);
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    /**
     * CASE 3: PM Route + Không phải PM hoặc Admin
     * --------------------------------------------
     * Redirect về dashboard (không có quyền)
     */
    if (isPMRoute && isLoggedIn && userRole !== "PM" && userRole !== "ADMIN") {
        console.log("[Middleware] Non-PM user trying to access PM route:", pathname);
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    /**
     * CASE 4: Auth Route (login/register) + Đã Login
     * ------------------------------------------------
     * Redirect về dashboard (không cần login nữa)
     */
    if (isAuthRoute && isLoggedIn) {
        console.log("[Middleware] Logged-in user accessing auth route, redirecting to dashboard");
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    // =========================================================================
    // BƯỚC 5: PASS - CHO PHÉP REQUEST TIẾP TỤC
    // =========================================================================

    /**
     * Nếu không có redirect nào được trigger
     * Cho request tiếp tục đến route handler
     */
    return NextResponse.next();
});

/**
 * ============================================================================
 * MIDDLEWARE MATCHER CONFIG
 * ============================================================================
 * 
 * Định nghĩa các paths mà middleware sẽ chạy
 * Nếu không match → middleware KHÔNG chạy
 * 
 * SYNTAX:
 * --------
 * - "/(.*)" : Match tất cả paths
 * - "/dashboard/:path*" : Match /dashboard và tất cả nested paths
 * - "/((?!api|_next).*)" : Negative lookahead - exclude api và _next
 * 
 * EXCLUDED PATHS (không cần auth check):
 * ---------------------------------------
 * - /api/* : API routes (có thể có auth riêng)
 * - /_next/* : Next.js internal files (static, image optimizer)
 * - /favicon.ico : Browser icon request
 * - /public/* : Static public files
 * 
 * LƯU Ý:
 * -------
 * Matcher giúp tối ưu performance
 * Không chạy middleware cho static files, images, etc.
 */
export const config = {
    matcher: [
        /**
         * Match tất cả paths NGOẠI TRỪ:
         * - api : API routes
         * - _next/static : Static files
         * - _next/image : Next.js image optimizer
         * - favicon.ico : Browser icon
         * 
         * Regex breakdown:
         * /(           : Bắt đầu group
         * (?!          : Negative lookahead (không match nếu...)
         * api|_next... : Các patterns cần exclude
         * )            : Kết thúc lookahead
         * .*           : Match phần còn lại
         * )            : Kết thúc group
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
