# Bộ công cụ kỹ thuật cho NovaWork Hub (Updated)

Dự án NovaWork Hub sử dụng React, Next.js và Tailwind CSS làm core. Tài liệu này mô tả bộ công cụ chuẩn đi kèm để xây dựng một hệ thống intranet quản lý công việc, thống nhất cho toàn team.

---

## 1. Ngôn ngữ, framework, UI

### 1.1. Ngôn ngữ và core framework

- **TypeScript** cho toàn bộ codebase (Strict mode).
- **Next.js (App Router)**:
  - **Server Components (RSC):** Mặc định cho việc fetch data (SEO tốt, load nhanh).
  - **Server Actions:** Xử lý mutation (Tạo/Sửa/Xóa) thay cho API Route truyền thống.
  - **Route Handlers:** Chỉ dùng cho Webhook, upload file, hoặc các endpoint public.
- **T3 Env**: Validate biến môi trường (`env.mjs`) để đảm bảo type-safety cho config.

### 1.2. UI và styling

- **Tailwind CSS**: Styling system.
- **shadcn/ui** (dựa trên Radix UI): Bộ component base.
- **Lucide React**: Bộ icon chuẩn.
- **UX nâng cao**:
  - **Tiptap** hoặc **Quill**: Rich Text Editor (quan trọng cho Mô tả Task, Knowledge Base).
  - **React Dropzone**: Xử lý kéo thả upload file.
  - **FullCalendar** hoặc **React Big Calendar**: Xử lý view Lịch phức tạp.

---

## 2. Backend, database, ORM

### 2.1. Database & Storage

- **PostgreSQL**: Database chính (Production dùng Supabase/Neon hoặc Self-hosted).
- **Object Storage (S3/MinIO/R2)**: Lưu trữ file đính kèm (Spec, Design, Avatar). *Không lưu file trực tiếp lên server disk.*
- **Redis (Optional)**: Dùng cho caching phức tạp hoặc hàng đợi (Queue) nếu hệ thống lớn.

### 2.2. ORM và truy vấn

- **Prisma ORM**:
  - Schema: User, Department, Project, Task, Comment, TimeLog, Form, Attachment, Notification.
- **Data Pattern**:
  - Fetch data chủ yếu tại Server Component (trực tiếp qua Prisma).
  - Client Fetching dùng React Query cho các dữ liệu realtime hoặc tương tác nhiều (VD: Kanban board, Comment).

### 2.3. Real-time Communication

- **Pusher** hoặc **Socket.io**:
  - Thông báo realtime khi có task mới, comment mới, hoặc mention.
  - Cập nhật trạng thái Kanban board khi người khác kéo thả.

---

## 3. Auth, phân quyền và bảo mật

### 3.1. Xác thực (Authentication)

- **Auth.js (NextAuth v5)**:
  - Strategy: JWT Strategy.
  - Provider: Credentials (Email/Pass) & OAuth (Google/Microsoft cho doanh nghiệp).

### 3.2. Phân quyền (Authorization)

- **RBAC (Role-Based Access Control)**:
  - Role: `ADMIN`, `PM`, `MEMBER`, `VIEWER`.
  - Kiểm tra quyền tại 3 lớp:
    1.  **Middleware**: Chặn route cấp cao (`/admin`).
    2.  **UI/Component**: Ẩn/hiện nút bấm dựa trên role.
    3.  **Data Access Layer (DAL)**: Chặn truy vấn DB nếu không phải owner hoặc admin.

---

## 4. State management và data fetching

### 4.1. Data fetching

- **TanStack Query (React Query v5)**:
  - Quản lý server state phía client.
  - Optimistic Updates: Cập nhật UI ngay lập tức khi kéo thả Task/Comment (trước khi server phản hồi).

### 4.2. Global State

- **Zustand**:
  - Quản lý UI state: Sidebar toggle, Modal stack, Global filters.

---

## 5. Form, validation và UX

### 5.1. Xử lý form

- **React Hook Form**: Quản lý state form hiệu năng cao.
- **Zod**: Schema validation (Client & Server đồng bộ).

### 5.2. Notification & Feedback

- **Sonner** (thay cho Toast mặc định): Hiển thị thông báo đẹp, stack được nhiều thông báo.
- **React Email**: Template email HTML cho thông báo gửi về mail.

---

## 6. DevOps, build & Quality Control

### 6.1. Linting & Formatting

- **ESLint** + **Prettier**.
- **Husky** + **Commitlint**: Đảm bảo commit message đúng chuẩn (VD: `feat: add task board`).

### 6.2. CI/CD

- **GitHub Actions**:
  - Tự động chạy `tsc` (check type), `lint`, `test` khi Pull Request.
  - Build Docker image và push lên Registry.
- **Deployment**:
  - Docker Container (khuyến nghị cho Intranet): Node.js image tối ưu (`node:alpine` hoặc `standalone` output của Next.js).