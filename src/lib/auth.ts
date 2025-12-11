/**
 * ============================================================================
 * AUTH.JS V5 CONFIGURATION - NOVAWORK HUB
 * ============================================================================
 * 
 * File này chứa toàn bộ cấu hình xác thực (authentication) của ứng dụng.
 * Sử dụng Auth.js v5 (trước đây là NextAuth.js) với các tính năng:
 * 
 * 1. PROVIDERS (Nhà cung cấp đăng nhập):
 *    - Credentials: Đăng nhập bằng email/password
 *    - Google OAuth: Đăng nhập bằng tài khoản Google
 * 
 * 2. DATABASE ADAPTER:
 *    - PrismaAdapter: Lưu trữ users, accounts, sessions vào database
 *    - Tương thích Prisma 7 với Driver Adapter
 * 
 * 3. SESSION STRATEGY:
 *    - JWT: Nhanh hơn database sessions, không cần query mỗi request
 * 
 * 4. CALLBACKS:
 *    - jwt: Thêm thông tin custom vào JWT token
 *    - session: Expose thông tin từ token ra session
 * 
 * CÁCH SỬ DỤNG:
 * - Server Component: import { auth } from "@/lib/auth"
 * - Client Component: import { useSession } from "next-auth/react"
 * - API Route: import { handlers } from "@/lib/auth"
 * 
 * ============================================================================
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

// Import Prisma Client singleton đã cấu hình với Driver Adapter (Giai đoạn 1)
// Đây là cách dùng chuẩn cho Prisma 7 - KHÔNG tạo PrismaClient mới trong file này
import { prisma } from "@/server/db";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Định nghĩa type cho User trả về từ authorize()
 * - Phải khớp với schema User trong Prisma
 * - Các fields này sẽ được truyền vào callbacks
 */
interface AuthUser {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role: "ADMIN" | "PM" | "MEMBER" | "VIEWER";
    departmentId?: string | null;
}

// ============================================================================
// NEXTAUTH CONFIGURATION
// ============================================================================

export const { handlers, auth, signIn, signOut } = NextAuth({
    /**
     * PRISMA ADAPTER
     * ---------------
     * Kết nối Auth.js với database thông qua Prisma
     * 
     * Chức năng:
     * - Tự động tạo/cập nhật User khi đăng nhập OAuth
     * - Lưu Account (OAuth connections) vào database
     * - Lưu Session (nếu dùng database strategy)
     * 
     * Lưu ý Prisma 7:
     * - Phải dùng Prisma Client đã khởi tạo với Driver Adapter
     * - Import từ "@/server/db" (KHÔNG tạo new PrismaClient ở đây)
     * 
     * Type assertion (as any) được dùng để fix lỗi version mismatch
     * giữa @auth/prisma-adapter và next-auth. Đây là workaround phổ biến
     * khi các packages có dependencies nội bộ khác version.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(prisma) as any,

    /**
     * SESSION STRATEGY
     * -----------------
     * Có 2 strategies: "jwt" hoặc "database"
     * 
     * JWT (được chọn):
     * - Token lưu trong cookie, không cần query database mỗi request
     * - Nhanh hơn, phù hợp cho apps có nhiều requests
     * - Dung lượng token lớn hơn nếu lưu nhiều data
     * 
     * Database:
     * - Session lưu trong database, query mỗi request
     * - Có thể revoke session bất kỳ lúc nào
     * - Chậm hơn nhưng bảo mật tốt hơn
     * 
     * Với JWT strategy, PrismaAdapter chỉ dùng để lưu User/Account
     */
    session: { strategy: "jwt" },

    /**
     * CUSTOM PAGES
     * -------------
     * Override các trang mặc định của Auth.js
     * 
     * signIn: Trang đăng nhập custom (thay vì /api/auth/signin)
     * error: Trang hiển thị lỗi xác thực
     * 
     * Các trang khác có thể override:
     * - signOut: "/auth/signout"
     * - verifyRequest: "/auth/verify-request" (email magic link)
     * - newUser: "/auth/new-user" (redirect sau khi tạo user mới)
     */
    pages: {
        signIn: "/login",
        error: "/login", // Redirect về login với error params
    },

    /**
     * AUTHENTICATION PROVIDERS
     * -------------------------
     * Định nghĩa các phương thức đăng nhập
     */
    providers: [
        /**
         * GOOGLE OAUTH PROVIDER
         * ----------------------
         * Cho phép đăng nhập bằng tài khoản Google
         * 
         * Yêu cầu:
         * 1. Tạo project trên Google Cloud Console
         * 2. Enable Google+ API
         * 3. Tạo OAuth 2.0 credentials
         * 4. Thêm Authorized redirect URI: 
         *    http://localhost:3000/api/auth/callback/google
         * 
         * Khi user đăng nhập:
         * 1. Redirect đến Google để xác thực
         * 2. Google trả về access_token và user info
         * 3. Lưu vào Account table (nếu dùng PrismaAdapter)
         * 4. Tạo/cập nhật User record
         */
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            /**
             * Authorization parameters
             * - access_type: "offline" để lấy refresh_token
             * - prompt: "consent" để luôn hỏi permission (optional)
             */
            authorization: {
                params: {
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),

        /**
         * CREDENTIALS PROVIDER
         * ---------------------
         * Cho phép đăng nhập bằng email/password
         * 
         * Flow:
         * 1. User nhập email + password
         * 2. Gọi hàm authorize() để validate
         * 3. Trả về User object nếu valid, null nếu invalid
         * 
         * Bảo mật:
         * - Password được hash bằng bcrypt khi tạo user
         * - So sánh hash khi đăng nhập (bcrypt.compare)
         * - KHÔNG bao giờ lưu password dạng plain text
         */
        Credentials({
            name: "Credentials",
            /**
             * Định nghĩa các fields của form đăng nhập
             * (Không dùng trực tiếp nếu có custom login page)
             */
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "your@email.com",
                },
                password: {
                    label: "Password",
                    type: "password",
                },
            },

            /**
             * AUTHORIZE FUNCTION
             * -------------------
             * Hàm xác thực credentials
             * 
             * @param credentials - Object chứa email, password từ form
             * @returns User object nếu valid, null nếu invalid
             * 
             * Best practices:
             * - Không throw error, return null để báo thất bại
             * - Không expose lý do cụ thể (security)
             * - Log lỗi cho debugging nhưng không leak ra client
             */
            async authorize(credentials) {
                // =====================================
                // BƯỚC 1: Validate input
                // =====================================
                // Kiểm tra có đủ email và password không
                if (!credentials?.email || !credentials?.password) {
                    console.log("[Auth] Missing email or password");
                    return null;
                }

                // =====================================
                // BƯỚC 2: Tìm user trong database
                // =====================================
                // Query user theo email (unique)
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    // Select các fields cần thiết (không lấy hết để tối ưu)
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true,
                        password: true, // Cần thiết để so sánh
                        role: true,
                        departmentId: true,
                        status: true, // Kiểm tra user có bị lock không
                    },
                });

                // User không tồn tại
                if (!user) {
                    console.log("[Auth] User not found:", credentials.email);
                    return null;
                }

                // User không có password (đăng ký qua OAuth)
                if (!user.password) {
                    console.log("[Auth] User has no password (OAuth user):", credentials.email);
                    return null;
                }

                // =====================================
                // BƯỚC 3: Kiểm tra trạng thái user
                // =====================================
                // Chặn đăng nhập nếu user bị khóa hoặc inactive
                if (user.status === "LOCKED") {
                    console.log("[Auth] User is locked:", credentials.email);
                    return null;
                }

                if (user.status === "INACTIVE") {
                    console.log("[Auth] User is inactive:", credentials.email);
                    return null;
                }

                // =====================================
                // BƯỚC 4: Xác thực password
                // =====================================
                // So sánh password nhập vào với hash trong database
                // bcrypt.compare tự động xử lý salt
                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValidPassword) {
                    console.log("[Auth] Invalid password for:", credentials.email);
                    return null;
                }

                // =====================================
                // BƯỚC 5: Trả về User object
                // =====================================
                // Object này sẽ được truyền vào jwt callback
                // QUAN TRỌNG: KHÔNG trả về password
                console.log("[Auth] Login successful:", credentials.email);

                return {
                    id: user.id,
                    email: user.email!,
                    name: user.name || "",
                    image: user.image,
                    role: user.role,
                    departmentId: user.departmentId,
                } as AuthUser;
            },
        }),
    ],

    /**
     * CALLBACKS
     * ----------
     * Các hàm hook được gọi trong quá trình xác thực
     * 
     * Thứ tự gọi khi đăng nhập:
     * 1. signIn - Sau khi provider validate thành công
     * 2. jwt - Tạo/cập nhật JWT token
     * 3. session - Tạo session object từ token
     */
    callbacks: {
        /**
         * SIGNIN CALLBACK (Optional)
         * ---------------------------
         * Gọi sau khi provider validate thành công
         * 
         * Dùng để:
         * - Kiểm tra thêm điều kiện (whitelist email domain, etc.)
         * - Block đăng nhập từ một số providers
         * - Log đăng nhập
         * 
         * @returns true để cho phép, false để block
         */
        async signIn({ user, account }) {
            // Log cho debugging
            console.log("[Auth][SignIn] Provider:", account?.provider);
            console.log("[Auth][SignIn] User ID:", user.id);

            // Có thể thêm logic như:
            // - Chỉ cho phép email từ domain cụ thể
            // - Block OAuth nếu user đã có password
            // - Update lastLoginAt

            return true; // Cho phép tất cả
        },

        /**
         * JWT CALLBACK
         * -------------
         * Gọi mỗi khi tạo hoặc cập nhật JWT token
         * 
         * Khi nào được gọi:
         * - Đăng nhập lần đầu: user object có data
         * - Refresh token: user object = undefined
         * 
         * Dùng để:
         * - Thêm custom claims vào token (id, role, etc.)
         * - Refresh token từ OAuth provider
         * 
         * @param token - JWT token hiện tại
         * @param user - User object (chỉ có khi đăng nhập lần đầu)
         * @returns Token đã được cập nhật
         */
        async jwt({ token, user, account, trigger }) {
            // =====================================
            // Xử lý khi đăng nhập lần đầu
            // =====================================
            if (user) {
                // User vừa đăng nhập - có data từ provider
                token.id = user.id;
                token.role = (user as AuthUser).role || "MEMBER";
                token.departmentId = (user as AuthUser).departmentId;

                console.log("[Auth][JWT] Initial token for user:", user.id);
            }

            // =====================================
            // Xử lý khi session được update thủ công
            // =====================================
            // Trigger "update" khi gọi session.update() từ client
            if (trigger === "update") {
                // Fetch lại user data từ database
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: {
                        role: true,
                        departmentId: true,
                        name: true,
                        image: true,
                    },
                });

                if (freshUser) {
                    token.role = freshUser.role;
                    token.departmentId = freshUser.departmentId;
                    token.name = freshUser.name;
                    token.picture = freshUser.image;
                }

                console.log("[Auth][JWT] Token updated for user:", token.id);
            }

            return token;
        },

        /**
         * SESSION CALLBACK
         * -----------------
         * Gọi mỗi khi tạo session object để trả về client
         * 
         * Khi nào được gọi:
         * - Mỗi lần gọi auth() trong Server Component
         * - Mỗi lần useSession() trong Client Component
         * 
         * Dùng để:
         * - Expose data từ token ra session
         * - Format lại session object
         * 
         * QUAN TRỌNG:
         * - Chỉ expose những gì client cần
         * - KHÔNG expose sensitive data
         * 
         * @param session - Session object hiện tại
         * @param token - JWT token (chứa custom claims)
         * @returns Session object đã được cập nhật
         */
        async session({ session, token }) {
            // =====================================
            // Map data từ token vào session.user
            // =====================================
            if (session.user) {
                // ID - bắt buộc cho mọi thao tác
                session.user.id = token.id as string;

                // Role - cần cho authorization (kiểm tra quyền)
                session.user.role = token.role as "ADMIN" | "PM" | "MEMBER" | "VIEWER";

                // Department - optional, dùng cho filter data
                session.user.departmentId = token.departmentId as string | undefined;
            }

            return session;
        },
    },

    /**
     * EVENTS (Optional)
     * ------------------
     * Async hooks cho các sự kiện xác thực
     * 
     * Khác với callbacks:
     * - Events là fire-and-forget (không block flow)
     * - Dùng cho logging, analytics, notifications
     */
    events: {
        // Log khi đăng nhập thành công
        async signIn({ user, account }) {
            console.log(`[Auth][Event] User signed in: ${user.email} via ${account?.provider}`);

            // TODO: Có thể thêm:
            // - Ghi audit log vào database
            // - Gửi notification
            // - Update lastLoginAt
        },

        // Log khi đăng xuất
        async signOut(message) {
            console.log("[Auth][Event] User signed out");
        },
    },

    /**
     * DEBUG MODE
     * -----------
     * Bật log chi tiết trong development
     * KHÔNG bật trong production (leak sensitive data)
     */
    debug: process.env.NODE_ENV === "development",

    /**
     * SECRET KEY
     * -----------
     * Dùng để mã hóa JWT và session cookies
     * 
     * Yêu cầu:
     * - Ít nhất 32 ký tự
     * - Random và unique cho mỗi environment
     * - KHÔNG commit vào git
     * 
     * Generate bằng: openssl rand -base64 32
     */
    secret: process.env.AUTH_SECRET,
});

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * EXPORTED FUNCTIONS:
 * 
 * 1. handlers - { GET, POST } cho API route (/api/auth/[...nextauth])
 * 2. auth - Function lấy session trong Server Components
 * 3. signIn - Function đăng nhập programmatically
 * 4. signOut - Function đăng xuất programmatically
 * 
 * CÁCH SỬ DỤNG:
 * 
 * // Server Component
 * const session = await auth();
 * if (session?.user) {
 *     console.log(session.user.role);
 * }
 * 
 * // API Route
 * export { handlers as GET, handlers as POST } from "@/lib/auth";
 * 
 * // Server Action
 * await signIn("credentials", { email, password });
 * await signOut();
 */
