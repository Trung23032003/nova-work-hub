/**
 * ============================================================================
 * NEXTAUTH API ROUTE - NOVAWORK HUB
 * ============================================================================
 * 
 * File này tạo các API endpoints cho Auth.js xử lý:
 * 
 * GET /api/auth/signin       - Trang đăng nhập (nếu không có custom page)
 * POST /api/auth/signin      - Xử lý đăng nhập
 * GET /api/auth/signout      - Trang đăng xuất
 * POST /api/auth/signout     - Xử lý đăng xuất
 * GET /api/auth/session      - Lấy session hiện tại
 * GET /api/auth/csrf         - Lấy CSRF token
 * GET /api/auth/callback/:provider - OAuth callback (Google, GitHub, etc.)
 * GET /api/auth/providers    - Danh sách providers
 * 
 * CÁCH HOẠT ĐỘNG:
 * ----------------
 * 1. File route này export GET và POST handlers
 * 2. handlers được import từ cấu hình auth chính (src/lib/auth.ts)
 * 3. Auth.js xử lý routing nội bộ dựa trên [...nextauth] path
 * 
 * VÍ DỤ FLOW ĐĂNG NHẬP GOOGLE:
 * -----------------------------
 * 1. Client redirect đến /api/auth/signin/google
 * 2. Auth.js redirect đến Google OAuth consent screen
 * 3. User đồng ý, Google redirect về /api/auth/callback/google
 * 4. Auth.js xử lý callback, tạo session
 * 5. Redirect về trang đã cấu hình (hoặc homepage)
 * 
 * VÍ DỤ FLOW ĐĂNG NHẬP CREDENTIALS:
 * ----------------------------------
 * 1. Client gọi signIn("credentials", { email, password })
 * 2. POST đến /api/auth/callback/credentials
 * 3. Auth.js gọi authorize() trong config
 * 4. Nếu thành công, tạo JWT + session
 * 5. Trả về success response
 * 
 * LƯU Ý:
 * -------
 * - File name [...nextauth] là catch-all route
 * - Bắt tất cả các paths bắt đầu bằng /api/auth/
 * - KHÔNG được thay đổi structure này
 * 
 * ============================================================================
 */

// Import handlers từ cấu hình auth chính
// handlers là object chứa { GET, POST } request handlers
import { handlers } from "@/lib/auth";

/**
 * Export các HTTP method handlers
 * 
 * Cách làm này gọn hơn so với:
 * export async function GET(request) { return handlers.GET(request); }
 * export async function POST(request) { return handlers.POST(request); }
 * 
 * Destructuring export: export { handlers.GET as GET, handlers.POST as POST }
 */
export const { GET, POST } = handlers;
