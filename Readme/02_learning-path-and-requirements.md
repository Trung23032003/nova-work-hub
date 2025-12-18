# Lộ trình Học tập và Kiến thức Cần thiết cho Dự án NovaWork Hub

Tài liệu này tổng hợp các kiến thức, công nghệ và trình tự học tập phù hợp để bạn có thể nắm vững và đóng góp hiệu quả vào dự án NovaWork Hub.

---

## 1. Các thành phần chính của dự án (What is needed)

Dự án NovaWork Hub được xây dựng trên một stack hiện đại (Bleeding Edge), yêu cầu sự phối hợp chặt chẽ giữa Frontend và Backend.

### **Core Stack (Nền tảng chính)**
*   **Framework:** Next.js 15+ (App Router) - Framework React mạnh mẽ nhất hiện nay.
*   **Ngôn ngữ:** TypeScript 5.x - Đảm bảo an toàn kiểu dữ liệu cho toàn bộ hệ thống.
*   **Styling:** Tailwind CSS v4 - Công cụ CSS-in-JS thế hệ mới cho tốc độ render cực nhanh.
*   **Database:** PostgreSQL (Lưu trữ trên Supabase) - Cửa hàng dữ liệu quan hệ.
*   **ORM:** Prisma 7 - Cầu nối giữa code JavaScript/TypeScript và Database.

### **UI/UX & Library**
*   **Hệ thống UI:** Shadcn UI (Radix UI) - Các component được thiết kế sẵn và tinh chỉnh cao.
*   **Icon:** Lucide React - Bộ icons phong cách tối giản, hiện đại.
*   **Biểu đồ:** Recharts - Hiển thị thống kê dashboard.
*   **Kéo thả:** @dnd-kit - Phục vụ bảng Kanban.
*   **Form:** React Hook Form + Zod - Xử lý nhập liệu và validation.

---

## 2. Các kiến thức & Khái niệm cốt lõi (Core Concepts)

### **A. Next.js 15 - Tư duy Server-First**
Đây là phần quan trọng nhất. Bạn cần phân biệt rõ:
*   **Server Components:** Mặc định trong App Router. Tải dữ liệu trực tiếp từ Database mà không cần API route. Giảm dung lượng JS tải xuống client.
*   **Client Components:** Chỉ dùng khi cần tương tác (onClick, useState, useEffect). Đánh dấu bằng `"use client"`.
*   **Server Actions:** Thay thế hoàn toàn API Routes truyền thống (GET/POST). Dùng để gửi dữ liệu từ form lên server một cách bảo mật và type-safe.

### **B. Cơ sở dữ liệu & Prisma 7**
*   **Relational Modeling:** Hiểu cách thiết kế các bảng (User, Project, Task) và mối quan hệ (1-n, n-n) giữa chúng.
*   **Prisma Client:** Cách viết query (findMany, create, update, delete) hiệu quả.
*   **Migrations:** Cách đồng bộ thay đổi từ schema vào database thật.

### **C. Xác thực & Phân quyền (Auth.js v5)**
*   **Middleware:** Chặn truy cập trái phép ở cấp độ route trước khi trang kịp render.
*   **Role-Based Access Control (RBAC):** Kiểm tra quyền user (ADMIN, PM, MEMBER) để hiển thị menu hoặc cho phép thực hiện hành động (CRUD).

### **D. State Management & Data Fetching**
*   **Zustand:** Quản lý Global State đơn giản (ví dụ: trạng tháy đóng/mở Sidebar).
*   **Suspense & Skeleton:** Cải thiện trải nghiệm người dùng bằng cách hiển thị khung trang khi đang chờ tải dữ liệu.

---

## 3. Thứ tự học tập phù hợp (Learning Path)

Nếu bạn là người mới hoặc muốn hệ thống lại kiến thức, hãy đi theo lộ trình 6 bước dưới đây:

### **Bước 1: Nền tảng Frontend (1-2 tuần)**
- Học vững **TypeScript**: Interface, Types, Enums, Generics (rất quan trọng cho Prisma).
- Học **Tailwind CSS**: Cách dùng utility classes để build layout nhanh.
- Hiểu về **React Hooks** cơ bản: `useState`, `useEffect`, `useMemo`, `useCallback`.

### **Bước 2: Next.js App Router cơ bản (1 tuần)**
- Học cách chia folder trong `src/app`.
- Hiểu về `layout.tsx`, `page.tsx`, `loading.tsx`, và `error.tsx`.
- Phân biệt **Server vs Client Components**.

### **Bước 3: Làm việc với Database (1-2 tuần)**
- Học cách dùng **Prisma**: Viết schema, chạy migration.
- Thực hành viết các **Server Actions** để thực hiện CRUD (Thêm, Sửa, Xóa).
- Học cách dùng **Zod** để validate dữ liệu đầu vào.

### **Bước 4: Authentication & Security (3-5 ngày)**
- Tìm hiểu **Auth.js v5 (NextAuth)**: Cách cấu hình CredentialsProvider.
- Cách bảo vệ route bằng `middleware.ts`.
- Cách lấy session trên cả Server (`auth()`) và Client (`useSession()`).

### **Bước 5: Nâng cao UI/UX (Học song song)**
- Cách sử dụng và tùy biến **Shadcn UI**.
- Học cách triển khai **Optimistic UI** (Cập nhật giao diện trước khi server phản hồi - dùng cho Kanban hoặc Like/Comment).
- Làm quen với **@dnd-kit** cho các tính năng kéo thả.

### **Bước 6: Testing & Optimization (Cuối cùng)**
- **Vitest:** Viết unit test cho logic server.
- **Playwright:** Test luồng đăng nhập và các thao tác trên trình duyệt.
- Tối ưu hiệu năng: Caching, ISR, Streaming.

---

## Mẹo để tiến bộ nhanh
1.  **Đọc file `Readme/07_implementation-plan-novawork-hub.md`**: Đây là "xương sống" của dự án hiện tại. Khi làm đến module nào (Project, Task, Kanban), hãy đọc kỹ phần đó trước.
2.  **Code đến đâu hiểu đến đó**: Đừng copy code. Hãy cố gắng hiểu tại sao đoạn code đó phải nằm ở Server hay Client.
3.  **Tận dụng Type Safety**: Nếu TypeScript báo lỗi đỏ, đừng bỏ qua bằng `any`. Hãy tìm cách định nghĩa đúng type, nó sẽ giúp bạn tránh được 90% lỗi lúc chạy (runtime).
