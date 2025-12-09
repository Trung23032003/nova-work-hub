# Kế hoạch Triển khai Chi tiết NovaWork Hub (Step-by-Step Optimized)

> [!TIP]
> **Nguyên tắc thực hiện:** Server Actions trước, UI sau. Luôn viết logic backend và test trước khi gắn vào giao diện.

---

## Tổng quan Timeline

| Giai đoạn | Mô tả | Thời gian ước tính |
|-----------|-------|-------------------|
| GĐ 1 | Foundation (Setup & Database) | 1-2 ngày |
| GĐ 2 | Authentication & Layout | 2-3 ngày |
| GĐ 3 | Project Management | 2-3 ngày |
| GĐ 4A | Task CRUD & List View | 2-3 ngày |
| GĐ 4B | Kanban Board (Drag & Drop) | 3-4 ngày |
| GĐ 4C | Task Detail Sheet | 2-3 ngày |
| GĐ 5 | Interaction & Utilities | 3-4 ngày |
| GĐ 6 | Admin & Reporting | 2-3 ngày |
| GĐ 7 | Review & Deploy | 1-2 ngày |
| **Tổng** | | **18-27 ngày** |

---

## Cross-cutting Concerns (Áp dụng xuyên suốt)

> [!IMPORTANT]
> Các pattern dưới đây cần được áp dụng ngay từ đầu và duy trì trong suốt dự án.

- [ ] **Error Handling:**
  - Global Error Boundary (`src/app/error.tsx`)
  - Not Found page (`src/app/not-found.tsx`)
  - API error handling pattern với try-catch
  
- [ ] **Loading States:**
  - Global loading (`src/app/loading.tsx`)
  - Skeleton components cho mỗi data-fetching page
  - Button loading states khi submit form

- [ ] **Form Patterns:**
  - Validation error display (inline + toast)
  - Disabled state khi đang submit
  - Success feedback với Sonner toast

- [ ] **Type Safety:**
  - Tận dụng `Prisma.ProjectGetPayload` / `Prisma.TaskCreateInput`
  - Không define lại type thủ công

---

## Giai đoạn 1: Khởi tạo Project & Cơ sở hạ tầng (Foundation)

**Mục tiêu:** Có project chạy được, kết nối Database thành công, đầy đủ thư viện nền.

**Kết quả đạt được:**
- ✅ Next.js 15 với App Router, TypeScript, TailwindCSS v4
- ✅ Prisma 7.1.0 với PostgreSQL
- ✅ Shadcn UI với 17+ components
- ✅ `npm run build` thành công

---

### 1.1. Setup Next.js & Dependencies

- [x] **Khởi tạo dự án:**
  ```bash
  npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --no-import-alias --skip-install
  ```

- [x] **Cài đặt Dependencies:**
  ```bash
  npm install

  # Core
  npm install next-auth@beta @prisma/client @tanstack/react-query zustand date-fns lucide-react

  # Utils
  npm install clsx tailwind-merge zod react-hook-form sonner @hookform/resolvers bcryptjs

  # Dev
  npm install -D prisma@latest @types/bcryptjs dotenv tsx
  ```

---

### 1.2. Cấu trúc thư mục

```
src/
├── actions/           # Server Actions
├── components/
│   ├── ui/            # Shadcn components
│   ├── layout/        # Sidebar, Header
│   └── features/      # Task, Project components
├── constants/         # App configs, enums
├── hooks/             # Custom React hooks
├── lib/               # Utilities (utils.ts, zod-schemas.ts)
├── providers/         # React Providers
├── server/
│   ├── db.ts          # Prisma Client
│   └── services/      # Business logic
└── types/             # TypeScript definitions
```

---

### 1.3. Setup Database & Prisma 7 (Supabase)

> **Lưu ý:** Prisma 7 thay đổi cách cấu hình - URL nằm trong `prisma.config.ts`, không còn trong `schema.prisma`.

#### Bước 1: Tạo Project trên Supabase

1. Truy cập: https://supabase.com/ → Đăng ký/Đăng nhập
2. Click **"New Project"**
3. Điền thông tin:
   - **Name:** `nova-work-hub`
   - **Database Password:** Ghi nhớ password này!
   - **Region:** Singapore (gần Việt Nam)
4. Đợi ~2 phút để project được tạo

#### Bước 2: Lấy Connection String

1. Vào **Project Settings** (icon bánh răng) → **Database**
2. Cuộn xuống phần **Connection string** → Chọn tab **URI**
3. Copy **Transaction pooler** (Port 6543):
   ```
   postgres://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

> ⚠️ **Quan trọng:** Thay `[password]` bằng password bạn đặt ở Bước 1

#### Bước 3: Cấu hình `.env`

Tạo file `.env` từ `.env.example`:
```powershell
copy .env.example .env
```

Cập nhật file `.env`:
```env
# --- DATABASE (Supabase) ---
DATABASE_URL="postgres://postgres.[project-ref]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# --- AUTHENTICATION ---
AUTH_SECRET="your-secret-key"
AUTH_URL="http://localhost:3000"
```

#### Bước 4: Cấu hình Prisma 7

**`prisma.config.ts`** (root folder):
```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

**`prisma/schema.prisma`**:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  // URL được cấu hình trong prisma.config.ts (Prisma 7+)
}

// Enums và 18 Models (xem file 04_database-schema-novawork-hub.md)
```

#### Bước 5: Chạy Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Tạo migration và apply
npx prisma migrate dev --name init_schema

# Seed dữ liệu mẫu
npx prisma db seed

# Xem database trong browser
npx prisma studio
```

> 💡 **Tip:** Bạn cũng có thể xem data trực tiếp trong Supabase Dashboard → **Table Editor**

---

### 1.4. Setup Shadcn UI

```bash
# Init Shadcn (auto-detect Next.js, TailwindCSS v4)
npx shadcn@latest init -d

# Cài components cơ bản
npx shadcn@latest add button input form card dialog sheet dropdown-menu avatar badge separator table tabs textarea select scroll-area skeleton -y
```

---

### 1.5. Các file quan trọng đã tạo

| File | Mô tả |
|------|-------|
| `src/server/db.ts` | Prisma Client Singleton |
| `src/lib/utils.ts` | Utility `cn()` cho TailwindCSS |
| `src/lib/zod-schemas.ts` | Validation schemas |
| `src/constants/app-config.ts` | App config, routes |
| `src/constants/enums.ts` | Enum labels và colors |
| `src/types/next-auth.d.ts` | NextAuth type extensions |
| `prisma/seed.ts` | Dữ liệu mẫu |

---

### 1.6. Verify Setup

```bash
# Build project
npm run build

# Kết quả mong đợi:
# ✓ Compiled successfully
# ✓ Generating static pages
```

---

### ✅ Checkpoint GĐ 1

| Task | Status |
|------|--------|
| Project structure | ✅ Done |
| Dependencies installed | ✅ Done |
| Prisma 7 configured | ✅ Done |
| Shadcn UI (17 components) | ✅ Done |
| Database connected | ✅ Done |
| `npm run build` passed | ✅ Done |

---

### 🔧 Lệnh Prisma Thường Dùng

| Lệnh | Mô tả |
|------|-------|
| `npx prisma generate` | Tạo Prisma Client |
| `npx prisma migrate dev` | Tạo và apply migration |
| `npx prisma db seed` | Chạy seed data |
| `npx prisma studio` | GUI xem database |
| `npx prisma --version` | Xem version Prisma |

---

### 🚨 Xử lý lỗi thường gặp (Supabase)

**Lỗi: "Can't reach database server"**
→ Kiểm tra kết nối internet và Supabase project đang active (không bị pause)

**Lỗi: "password authentication failed"**
→ Kiểm tra lại password trong `.env` (phải giống password khi tạo project)

**Lỗi: "connection refused" hoặc timeout**
→ Đảm bảo dùng đúng Connection pooler URL (port 6543, không phải 5432)

**Lỗi: "prepared statement already exists"**
→ Thêm `?pgbouncer=true` vào cuối DATABASE_URL:
```
DATABASE_URL="postgres://...@...supabase.com:6543/postgres?pgbouncer=true"
```

-----

## Giai đoạn 2: Xác thực & App Shell (Authentication & Layout)

**Mục tiêu:** User đăng nhập được, nhìn thấy Sidebar và Header đúng role.

### 2.1. Authentication (Backend)

  - [ ] **Config Auth:** Tạo `src/lib/auth.ts` cấu hình CredentialsProvider và GoogleProvider. Adapter dùng PrismaAdapter.
  - [ ] **API Route:** Tạo `src/app/api/auth/[...nextauth]/route.ts`.
  - [ ] **Middleware:** Tạo `middleware.ts` để chặn các route `/dashboard` nếu chưa login.

### 2.2. Global Providers

  - [ ] **Providers Wrapper:** Tạo `src/providers/app-provider.tsx` bọc `SessionProvider`, `QueryProvider`, `ThemeProvider`, `Toaster`.
  - [ ] **Root Layout:** Import `AppProvider` vào `src/app/layout.tsx`.

### 2.3. Dashboard Layout (Frontend)

  - [ ] **Menu Config:** Tạo `src/constants/menus.ts` định nghĩa mảng menu cho Sidebar.
  - [ ] **Component Sidebar:** Code `src/components/layout/main-sidebar.tsx`.
  - [ ] **Component Header:** Code `src/components/layout/header.tsx` (Chứa UserNav, ThemeToggle).
  - [ ] **Layout File:** Code `src/app/(dashboard)/layout.tsx` ghép Sidebar và Header vào.

### ✅ Checkpoint GĐ 2
- [ ] Login/Logout hoạt động (cả Credentials và Google)
- [ ] Truy cập `/dashboard` khi chưa login → redirect về login
- [ ] Sidebar hiển thị đúng menu theo role (Admin thấy thêm mục Admin)

-----

## Giai đoạn 3: Module Dự án (Project Management)

**Mục tiêu:** CRUD Dự án, hiển thị danh sách và layout chi tiết dự án.

### 3.1. Server Side (Logic)

  - [ ] **Schema Validation:** Định nghĩa `CreateProjectSchema` trong `src/lib/zod-schemas.ts`.
  - [ ] **Service:** Tạo `src/server/services/project.service.ts` (Hàm `getProjects`, `getProjectById`).
  - [ ] **Server Action:** Tạo `src/actions/project.ts` (Hàm `createProject`, `updateProjectStatus`).

### 3.2. Client Side (UI)

  - [ ] **Project List:** Tạo `src/app/(dashboard)/projects/page.tsx`. Sử dụng component `DataTable` của Shadcn hoặc Grid Card.
  - [ ] **Create Project Modal:** Tạo form dùng `react-hook-form` + `zod` để gọi Server Action tạo dự án.
  - [ ] **Project Detail Layout:** Tạo `src/app/(dashboard)/projects/[projectId]/layout.tsx`.
      - Fetch thông tin dự án tại đây.
      - Tạo Tab Navigation: *Overview | Tasks | Members | Settings*.

### ✅ Checkpoint GĐ 3
- [ ] Tạo dự án mới thành công, hiển thị trong danh sách
- [ ] Click vào dự án → vào trang detail với đầy đủ tabs
- [ ] Loading skeleton hiển thị khi đang fetch data

-----

## Giai đoạn 4A: Task CRUD & List View

**Mục tiêu:** Quản lý Task cơ bản với List View (nhanh hoàn thành, có thể demo sớm).

### 4A.1. Task Backend

  - [ ] **Zod Schema:** `CreateTaskSchema` (bao gồm title, priority, assignee, due date) trong `src/lib/zod-schemas.ts`.
  - [ ] **Service:** `src/server/services/task.service.ts` (Get tasks by project, get detail).
  - [ ] **Action:** `src/actions/task.ts` (Create, Update, Delete).

### 4A.2. Task List View

  - [ ] **Task Page:** `src/app/(dashboard)/projects/[projectId]/tasks/page.tsx`.
  - [ ] **List Component:** `src/components/features/tasks/task-list.tsx`.
      - Hiển thị dạng table với các cột: Title, Status, Priority, Assignee, Due Date.
      - Inline status change (click để đổi status).
  - [ ] **Create Task Form:** Modal hoặc inline form để tạo task nhanh.

### ✅ Checkpoint GĐ 4A
- [ ] CRUD Task hoạt động (tạo, sửa, xóa)
- [ ] List view hiển thị đầy đủ thông tin task
- [ ] Filter theo status hoạt động

-----

## Giai đoạn 4B: Kanban Board (Drag & Drop)

**Mục tiêu:** Giao diện Kanban với khả năng kéo thả mượt mà.

> [!NOTE]
> Cài thêm dependencies cho Drag & Drop:
> ```bash
> npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
> ```

### 4B.1. Kanban Components

  - [ ] **Board Component:** `src/components/features/tasks/kanban-board.tsx`.
      - Dùng `@dnd-kit` để bọc các cột (Columns) và thẻ (TaskCard).
  - [ ] **Column Component:** `src/components/features/tasks/kanban-column.tsx`.
  - [ ] **Task Card:** `src/components/features/tasks/task-card.tsx`.

### 4B.2. Drag & Drop Logic

  - [ ] **Reorder Action:** Thêm `reorderTasks` vào `src/actions/task.ts`.
  - [ ] **Optimistic UI:** Cập nhật state ngay lập tức trước khi API trả về để kéo thả mượt mà.
  - [ ] **View Toggle:** Button chuyển đổi giữa List View và Kanban View.

### ✅ Checkpoint GĐ 4B
- [ ] Kéo thả task giữa các cột hoạt động
- [ ] Reorder task trong cùng cột hoạt động
- [ ] UI không bị giật khi kéo thả (optimistic update)

-----

## Giai đoạn 4C: Task Detail Sheet

**Mục tiêu:** Xem và chỉnh sửa chi tiết task trong Slide-over Sheet.

> [!NOTE]
> Cài thêm dependencies cho Rich Text Editor:
> ```bash
> npm install @tiptap/react @tiptap/starter-kit
> ```

### 4C.1. Detail Components

  - [ ] **Sheet Component:** `src/components/features/tasks/task-detail-sheet.tsx`.
  - [ ] **Description Editor:** Tích hợp `Tiptap` editor để sửa Description.
  - [ ] **Properties Panel:** Các Select box để đổi Assignee, Priority, Status ngay trên Sheet.

### 4C.2. Subtasks (Checklist)

  - [ ] **Checklist Component:** `src/components/features/tasks/task-checklist.tsx`.
  - [ ] **Checklist Actions:** CRUD subtasks trong `src/actions/task.ts`.

### ✅ Checkpoint GĐ 4C
- [ ] Click task → mở Sheet với đầy đủ thông tin
- [ ] Sửa description với Tiptap editor
- [ ] Thêm/sửa/xóa checklist items

-----

## Giai đoạn 5: Tương tác & Tiện ích (Interaction & Utilities)

**Mục tiêu:** Tăng tính cộng tác (Comment, File, Log time).

### 5.1. Comments & Activity

  - [ ] **Database:** Kiểm tra lại model `Comment` và `AuditLog`.
  - [ ] **UI:** Tạo component `TaskCommentSection`.
  - [ ] **Action:** `addComment` (hỗ trợ text thuần trước, mention tính sau).

### 5.2. File Attachment (Upload)

  - [ ] **API Route:** `src/app/api/upload/route.ts` xử lý upload lên Supabase Storage/S3.
  - [ ] **Component:** Tạo `FileUpload` dropzone. Tích hợp vào Form tạo Task và Comment.

### 5.3. Time Tracking

  - [ ] **Modal Log Time:** Tạo Dialog cho phép nhập số giờ và ghi chú.
  - [ ] **Logic:** Server Action update bảng `TimeLog` và tính lại `totalHours` của Task (nếu cần hiển thị).

### ✅ Checkpoint GĐ 5
- [ ] Comment trên task hoạt động
- [ ] Upload file thành công, hiển thị attachment
- [ ] Log time và hiển thị tổng giờ

-----

## Giai đoạn 6: Admin & Báo cáo (Admin & Reporting)

**Mục tiêu:** Quản trị hệ thống và xem dashboard tổng quan.

> [!NOTE]
> Cài thêm dependencies cho Charts:
> ```bash
> npm install recharts
> ```

### 6.1. User Management

  - [ ] **Page:** `src/app/(dashboard)/admin/users/page.tsx`.
  - [ ] **Chức năng:** List user, Tạo user mới (cấp password mặc định), Set Role/Department.
  - [ ] **Security:** Đảm bảo Server Action check `session.user.role === 'ADMIN'`.

### 6.2. Dashboard Charts

  - [ ] **Service:** `src/server/services/report.service.ts` (Query count task by status, workload by user).
  - [ ] **UI:** Vẽ biểu đồ tròn (Task Status) và biểu đồ cột (Workload) tại trang chủ `src/app/(dashboard)/page.tsx`.

### ✅ Checkpoint GĐ 6
- [ ] Admin có thể quản lý users
- [ ] Dashboard hiển thị charts đúng data
- [ ] Non-admin không truy cập được trang admin

-----

## Giai đoạn 7: Testing, Review & Deploy

**Mục tiêu:** Đảm bảo chất lượng code và đưa sản phẩm lên Production.

### 7.1. Testing (Có thể chạy song song từ GĐ 3)

  - [ ] **Setup Vitest:**
    ```bash
    npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react
    ```
  - [ ] **Unit Tests:** Test các service functions và Server Actions.
  - [ ] **Setup Playwright (E2E):**
    ```bash
    npm install -D @playwright/test
    npx playwright install
    ```
  - [ ] **E2E Tests:** Login flow, Create Project, Create Task, Kanban DnD.

### 7.2. Review & Optimize

  - [ ] **Lint:** Chạy `npm run lint` để fix lỗi cú pháp.
  - [ ] **Type Check:** Chạy `tsc --noEmit` để đảm bảo không lỗi Type.
  - [ ] **Build Test:** Chạy `npm run build` ở local xem có lỗi build không.
  - [ ] **Performance:** Kiểm tra bundle size, lazy load components nếu cần.

### 7.3. Deploy Vercel

  - [ ] **Push Github:** Commit code lên repo.
  - [ ] **Vercel Project:** Import repo.
  - [ ] **Env Vars:** Nhập đầy đủ biến môi trường trên Vercel (đặc biệt là `DATABASE_URL` pooling).
  - [ ] **Redeploy:** Trigger build và kiểm tra domain.

### ✅ Checkpoint GĐ 7 (Final)
- [ ] Tất cả tests pass
- [ ] Build production thành công
- [ ] App chạy ổn định trên Vercel
- [ ] Monitoring (Sentry) đã setup

-----

## Mẹo thực hiện (Pro Tips)

1.  **Server Actions trước, UI sau:** Luôn viết hàm trong `src/actions/...` và test bằng console log hoặc script nhỏ trước khi gắn vào UI. Điều này giúp tách biệt logic và giao diện.

2.  **Type Safety:** Tận dụng tối đa `Prisma.ProjectGetPayload` hoặc `Prisma.TaskCreateInput` để không phải define lại type thủ công.

3.  **Shadcn UI:** Đừng sửa core component trong `components/ui` quá nhiều. Hãy wrap chúng lại hoặc custom thông qua `className`.

4.  **Lazy Install Dependencies:** Chỉ cài thư viện khi thực sự cần (VD: @dnd-kit khi làm Kanban, recharts khi làm Dashboard). Giảm complexity ban đầu.

5.  **Commit thường xuyên:** Mỗi checkpoint hoàn thành nên có 1 commit rõ ràng. Dễ rollback nếu có vấn đề.

6.  **Demo sớm:** Sau GĐ 4A đã có thể demo cho stakeholder với List View. Không cần đợi Kanban hoàn thiện.
