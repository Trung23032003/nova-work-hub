import "next-auth";

/**
 * Mở rộng types của NextAuth
 * 
 * Giải thích:
 * - NextAuth có sẵn các types cơ bản (id, email, name, image)
 * - Ta cần thêm các fields custom (role, departmentId)
 * - Declaration merging: TypeScript cho phép mở rộng types có sẵn
 * 
 * Sau khi thêm file này:
 * - session.user.role sẽ có type safety
 * - Không cần cast type mỗi lần sử dụng
 */

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string | null;
            role: "ADMIN" | "PM" | "MEMBER" | "VIEWER";
            departmentId?: string | null;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        image?: string | null;
        role: "ADMIN" | "PM" | "MEMBER" | "VIEWER";
        departmentId?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "ADMIN" | "PM" | "MEMBER" | "VIEWER";
        departmentId?: string | null;
    }
}
