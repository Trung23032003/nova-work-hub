/**
 * ============================================================================
 * MIDDLEWARE - ROUTE PROTECTION - NOVAWORK HUB
 * ============================================================================
 * 
 * Sử dụng auth config riêng cho Edge Runtime
 * KHÔNG import từ @/lib/auth vì file đó dùng PrismaAdapter
 */

import { auth } from "@/lib/auth.config";

export default auth;

/**
 * MIDDLEWARE MATCHER CONFIG
 * Định nghĩa các paths mà middleware sẽ chạy
 */
export const config = {
    matcher: [
        /**
         * Match tất cả paths NGOẠI TRỪ:
         * - api : API routes
         * - _next/static : Static files
         * - _next/image : Next.js image optimizer
         * - favicon.ico : Browser icon
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
