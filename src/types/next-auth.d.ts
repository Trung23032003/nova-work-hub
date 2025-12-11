/**
 * ============================================================================
 * NEXTAUTH TYPE DECLARATIONS - NOVAWORK HUB
 * ============================================================================
 * 
 * File này mở rộng (extend) các types mặc định của Auth.js/NextAuth
 * Sử dụng TypeScript Declaration Merging để thêm custom fields
 * 
 * TẠI SAO CẦN FILE NÀY?
 * ----------------------
 * Auth.js có sẵn types cơ bản cho User và Session:
 * - id, name, email, image
 * 
 * Nhưng ứng dụng cần thêm các fields custom:
 * - role: Quyền của user (ADMIN, PM, MEMBER, VIEWER)
 * - departmentId: Phòng ban của user
 * 
 * Nếu không có file này, TypeScript sẽ báo lỗi khi truy cập:
 * - session.user.role      // Error: Property 'role' does not exist
 * - session.user.departmentId  // Error: Property 'departmentId' does not exist
 * 
 * DECLARATION MERGING LÀ GÌ?
 * ---------------------------
 * TypeScript cho phép "merge" các declarations cùng tên
 * Khi import "next-auth", các interfaces được merge với types gốc
 * 
 * CÁCH SỬ DỤNG:
 * -------------
 * // Server Component
 * const session = await auth();
 * const role = session?.user.role; // "ADMIN" | "PM" | "MEMBER" | "VIEWER"
 * 
 * // Client Component  
 * const { data: session } = useSession();
 * if (session?.user.role === "ADMIN") { ... }
 * 
 * ============================================================================
 */

// Import để kích hoạt declaration merging
import "next-auth";

// ============================================================================
// MODULE: NEXT-AUTH (CORE)
// ============================================================================

declare module "next-auth" {
    /**
     * SESSION INTERFACE
     * ------------------
     * Định nghĩa cấu trúc của session object
     * 
     * Session được trả về từ:
     * - Server: auth() function
     * - Client: useSession() hook
     * 
     * Mỗi khi gọi session callback trong auth config,
     * object này sẽ được tạo và trả về client
     */
    interface Session {
        user: {
            /**
             * ID của user trong database
             * Sử dụng CUID (Collision-resistant Unique Identifier)
             * Ví dụ: "clp1234567890abcdef"
             */
            id: string;

            /**
             * Email của user
             * Unique trong hệ thống, dùng làm login identifier
             */
            email: string;

            /**
             * Tên hiển thị của user
             * Có thể null nếu OAuth không cung cấp
             */
            name: string | null;

            /**
             * URL ảnh đại diện
             * Từ OAuth provider hoặc upload thủ công
             */
            image?: string | null;

            /**
             * Role/Quyền của user trong hệ thống
             * Dùng cho authorization (kiểm tra quyền truy cập)
             * 
             * - ADMIN: Toàn quyền quản trị
             * - PM: Project Manager, quản lý dự án
             * - MEMBER: Thành viên team
             * - VIEWER: Chỉ xem, không edit
             */
            role: "ADMIN" | "PM" | "MEMBER" | "VIEWER";

            /**
             * ID phòng ban của user
             * Optional vì không phải user nào cũng thuộc phòng ban
             * Dùng để filter data theo department
             */
            departmentId?: string | null;
        };

        /**
         * Thời gian session hết hạn
         * Format: ISO 8601 string
         */
        expires: string;
    }

    /**
     * USER INTERFACE
     * ---------------
     * Định nghĩa cấu trúc User object từ authorize() và OAuth
     * 
     * User object được tạo/trả về từ:
     * - Credentials provider: authorize() return value
     * - OAuth providers: dữ liệu từ provider + adapter
     * 
     * User object được truyền vào jwt callback
     */
    interface User {
        /** @see Session.user.id */
        id: string;

        /** @see Session.user.email */
        email: string;

        /** @see Session.user.name */
        name: string | null;

        /** @see Session.user.image */
        image?: string | null;

        /** @see Session.user.role */
        role: "ADMIN" | "PM" | "MEMBER" | "VIEWER";

        /** @see Session.user.departmentId */
        departmentId?: string | null;
    }
}

// ============================================================================
// MODULE: NEXT-AUTH/JWT
// ============================================================================

declare module "next-auth/jwt" {
    /**
     * JWT INTERFACE
     * --------------
     * Định nghĩa cấu trúc của JWT token
     * 
     * JWT token chứa claims được mã hóa trong cookie
     * Token được tạo/cập nhật trong jwt callback
     * 
     * Lưu ý:
     * - Không lưu dữ liệu nhạy cảm trong token
     * - Token size ảnh hưởng đến cookie size (limit ~4KB)
     * - Chỉ lưu những gì thực sự cần
     */
    interface JWT {
        /**
         * User ID - cần để query data
         */
        id: string;

        /**
         * Role - cần để authorization
         */
        role: "ADMIN" | "PM" | "MEMBER" | "VIEWER";

        /**
         * Department ID - optional, dùng cho filtering
         */
        departmentId?: string | null;

        /**
         * Standard JWT claims (automatically added):
         * - sub: Subject (user identifier)
         * - iat: Issued at (timestamp)
         * - exp: Expiration time (timestamp)
         * - jti: JWT ID (unique identifier)
         * 
         * Các claims này được Auth.js tự động thêm vào
         */
    }
}
