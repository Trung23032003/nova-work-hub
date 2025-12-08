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

**Mục tiêu:** Có một project chạy được, kết nối Database thành công và có đầy đủ thư viện nền.

**Kết quả mong đợi:**
- ✅ Next.js 16 với App Router, TypeScript, TailwindCSS
- ✅ Prisma ORM với schema đầy đủ
- ✅ Shadcn UI với 17+ components
- ✅ Cấu trúc thư mục chuyên nghiệp
- ✅ `npm run build` thành công

---

### 1.1. Setup Next.js & Environment

> **Giải thích:** Next.js là React framework hỗ trợ SSR, SSG và nhiều tính năng production-ready.

- [x] **Khởi tạo dự án:**
  ```bash
  npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --no-import-alias --skip-install
  # Nếu hỏi React Compiler -> Chọn No
  ```
  
  | Flag | Ý nghĩa |
  |------|---------|
  | `--typescript` | Sử dụng TypeScript cho type safety |
  | `--tailwind` | Tích hợp TailwindCSS |
  | `--eslint` | Code linting |
  | `--app` | Sử dụng App Router (mới nhất) |
  | `--src-dir` | Tạo thư mục `src/` tách code khỏi configs |

- [x] **Cài đặt Core Dependencies:**
  ```bash
  npm install

  # Core & Auth
  npm install next-auth@beta @prisma/client @tanstack/react-query zustand date-fns lucide-react

  # Utils
  npm install clsx tailwind-merge zod react-hook-form sonner @hookform/resolvers bcryptjs
  ```

  | Package | Mục đích |
  |---------|----------|
  | `next-auth@beta` | Authentication (Google OAuth, Credentials) |
  | `@prisma/client` | ORM để tương tác database |
  | `@tanstack/react-query` | Server state management, caching |
  | `zustand` | Client state management (nhẹ hơn Redux) |
  | `date-fns` | Xử lý ngày tháng |
  | `lucide-react` | Icon library |
  | `zod` | Schema validation |
  | `react-hook-form` | Form handling hiệu quả |
  | `sonner` | Toast notifications đẹp |
  | `bcryptjs` | Hash passwords |

- [x] **Cài đặt Dev Dependencies:**
  ```bash
  npm install -D prisma ts-node @types/bcryptjs dotenv
  ```

- [x] **Setup `.env.example`:**
  
  Tạo file `.env.example` với template (xem file `05_preparation-checklist-novawork-hub.md`):
  ```bash
  # --- DATABASE (Supabase Pooling) ---
  DATABASE_URL="postgres://[user]:[password]@[host]:6543/[db_name]?pgbouncer=true"
  
  # --- AUTHENTICATION ---
  AUTH_SECRET="your-auth-secret-here"
  AUTH_URL="http://localhost:3000"
  AUTH_GOOGLE_ID="your-google-client-id"
  AUTH_GOOGLE_SECRET="your-google-client-secret"
  ```

---

### 1.2. Cấu trúc thư mục

> **Giải thích:** Cấu trúc thư mục hợp lý giúp dự án dễ maintain và scale.

- [x] Tạo các folder theo cấu trúc:
  ```bash
  mkdir -p src/actions
  mkdir -p src/components/ui
  mkdir -p src/components/layout
  mkdir -p src/components/features
  mkdir -p src/constants
  mkdir -p src/hooks
  mkdir -p src/lib
  mkdir -p src/providers
  mkdir -p src/server/services
  mkdir -p src/types
  ```

  | Thư mục | Mục đích |
  |---------|----------|
  | `src/actions/` | Server Actions - gọi từ client để mutation data |
  | `src/server/services/` | Business logic thuần (không phụ thuộc framework) |
  | `src/providers/` | React Context/Providers (Session, Theme, Query) |
  | `src/types/` | TypeScript type definitions |
  | `src/constants/` | App configs, enum mappings |
  | `src/lib/` | Utilities và helpers |
  | `src/components/ui/` | Base UI components (Shadcn) |
  | `src/components/layout/` | Layout components (Sidebar, Header) |
  | `src/components/features/` | Domain-specific components (Task, Project) |

- [x] **Tạo file `src/lib/utils.ts`:**
  ```typescript
  import { clsx, type ClassValue } from "clsx";
  import { twMerge } from "tailwind-merge";

  /**
   * Merge CSS classes thông minh
   * - clsx: Conditional class names
   * - twMerge: Giải quyết xung đột TailwindCSS
   */
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

- [x] **Tạo file `src/constants/app-config.ts`:**
  ```typescript
  export const APP_CONFIG = {
    name: "NovaWork Hub",
    description: "Hệ thống quản lý công việc nội bộ doanh nghiệp",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  } as const;

  export const ROUTES = {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    projects: "/projects",
    tasks: "/tasks",
  } as const;
  ```

- [x] **Tạo file `src/constants/enums.ts`:**
  ```typescript
  // Mapping enum values → display text (tiếng Việt) và màu badge
  export const TASK_STATUS_LABELS = {
    TODO: "Cần làm",
    IN_PROGRESS: "Đang làm",
    REVIEW: "Đang review",
    DONE: "Hoàn thành",
  } as const;

  export const TASK_STATUS_COLORS = {
    TODO: "bg-slate-100 text-slate-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    REVIEW: "bg-orange-100 text-orange-800",
    DONE: "bg-green-100 text-green-800",
  } as const;
  // ... tương tự cho PROJECT_STATUS, PRIORITY, USER_ROLE
  ```

- [x] **Tạo file `src/types/next-auth.d.ts`** (mở rộng NextAuth types):
  ```typescript
  import "next-auth";

  declare module "next-auth" {
    interface Session {
      user: {
        id: string;
        email: string;
        name: string;
        role: "ADMIN" | "PM" | "MEMBER" | "VIEWER";
        departmentId?: string | null;
      };
    }
  }
  ```

- [x] **Tạo file `src/types/api.ts`** (response types chuẩn):
  ```typescript
  export type SuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
  };

  export type ErrorResponse = {
    success: false;
    error: string;
    code?: string;
  };

  export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
  ```

- [x] **Tạo file `src/lib/zod-schemas.ts`** (validation schemas):
  ```typescript
  import { z } from "zod";

  export const LoginSchema = z.object({
    email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
    password: z.string().min(1, "Mật khẩu là bắt buộc").min(6, "Tối thiểu 6 ký tự"),
  });

  export const CreateProjectSchema = z.object({
    name: z.string().min(1, "Tên dự án là bắt buộc").max(200),
    code: z.string().regex(/^[A-Z0-9-]+$/, "Mã dự án chỉ chứa IN HOA, số và -"),
    // ... các fields khác
  });

  export type LoginInput = z.infer<typeof LoginSchema>;
  ```

---

### 1.3. Setup Database & Prisma

> **Giải thích:** Prisma là ORM hiện đại với schema-first approach và auto-generated TypeScript types.

- [x] **Khởi tạo Prisma:**
  ```bash
  npx prisma init
  ```
  
  Lệnh này tạo:
  - `prisma/schema.prisma` - Database schema
  - `prisma.config.ts` - Config file (Prisma v7+)
  - `.env` - Environment variables

- [x] **Cập nhật `prisma/schema.prisma`:**
  
  Copy schema từ file `04_database-schema-novawork-hub.md`. Lưu ý Prisma v7+ cấu hình URL trong `prisma.config.ts`:
  
  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
  }

  // Enums
  enum UserRole {
    ADMIN
    PM
    MEMBER
    VIEWER
  }
  
  // ... 18 models (User, Project, Task, Comment, etc.)
  ```

- [x] **Tạo file `src/server/db.ts`** (Prisma Client Singleton):
  ```typescript
  import { PrismaClient } from "@prisma/client";

  /**
   * Singleton Pattern - tránh lỗi "Too many connections" trong development
   * Hot-reload tạo nhiều instances → dùng globalThis để reuse
   */
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
  ```

- [x] **Tạo file `prisma/seed.ts`** (dữ liệu mẫu):
  ```typescript
  import { PrismaClient, UserRole, TaskStatus } from "@prisma/client";
  import bcrypt from "bcryptjs";

  const prisma = new PrismaClient();

  async function main() {
    // 1. Tạo Departments
    const devDept = await prisma.department.upsert({
      where: { code: "DEV" },
      update: {},
      create: { code: "DEV", name: "Phòng Phát triển" },
    });

    // 2. Tạo Admin user
    const hashedPassword = await bcrypt.hash("Password@123", 10);
    await prisma.user.upsert({
      where: { email: "admin@novawork.local" },
      update: {},
      create: {
        email: "admin@novawork.local",
        name: "Admin NovaWork",
        password: hashedPassword,
        role: UserRole.ADMIN,
        departmentId: devDept.id,
      },
    });

    // 3. Tạo Project và Tasks mẫu
    // ... (xem chi tiết trong prisma/seed.ts)
  }

  main()
    .then(() => prisma.$disconnect())
    .catch((e) => { console.error(e); process.exit(1); });
  ```

- [x] **Cập nhật `package.json`** để chạy seed:
  ```json
  {
    "prisma": {
      "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
    }
  }
  ```

- [ ] **Migration (sau khi có DATABASE_URL thực):**
  ```bash
  # Tạo và apply migration
  npx prisma migrate dev --name init_schema

  # Chạy seed data
  npx prisma db seed

  # Mở Studio để xem data
  npx prisma studio
  ```

---

### 1.4. Setup UI Base (Shadcn)

> **Giải thích:** Shadcn UI copy code vào project (không phải npm import) → full control để customize.

- [x] **Init Shadcn:**
  ```bash
  npx shadcn@latest init -d
  # Tự động detect Next.js, TailwindCSS v4
  ```

- [x] **Cài đặt Components cơ bản:**
  ```bash
  npx shadcn@latest add button input form card dialog sheet dropdown-menu avatar badge separator table tabs textarea select scroll-area skeleton -y
  ```

  Kết quả: 17 components trong `src/components/ui/`:
  - `button.tsx`, `input.tsx`, `textarea.tsx`
  - `form.tsx`, `label.tsx`
  - `card.tsx`, `dialog.tsx`, `sheet.tsx`
  - `dropdown-menu.tsx`, `select.tsx`
  - `avatar.tsx`, `badge.tsx`
  - `table.tsx`, `tabs.tsx`
  - `scroll-area.tsx`, `skeleton.tsx`, `separator.tsx`

---

### 1.5. Verify Build

- [x] **Generate Prisma Client (với placeholder URL):**
  ```bash
  # Windows PowerShell
  $env:DATABASE_URL="postgresql://user:password@localhost:5432/test"; npx prisma generate

  # Linux/Mac
  DATABASE_URL="postgresql://user:password@localhost:5432/test" npx prisma generate
  ```

- [x] **Build project:**
  ```bash
  npm run build
  ```
  
  Kết quả mong đợi:
  ```
  ✓ Compiled successfully
  ✓ Finished TypeScript
  ✓ Generating static pages
  Route (app)
  ├ ○ /
  └ ○ /_not-found
  ```

---

### ✅ Checkpoint GĐ 1

| Task | Status |
|------|--------|
| Project structure created | ✅ Done |
| Core dependencies installed | ✅ Done |
| Prisma schema defined (18 models) | ✅ Done |
| Shadcn UI initialized (17 components) | ✅ Done |
| Type definitions created | ✅ Done |
| Zod validation schemas | ✅ Done |
| `npm run build` thành công | ✅ Done |
| Database connected | ⏳ Cần DATABASE_URL thực |
| Prisma Studio hiển thị data | ⏳ Sau khi migrate |

---

### 📁 Cấu trúc thư mục sau GĐ 1

```
nova-work-hub/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data script
├── src/
│   ├── actions/           # (GĐ2+)
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/            # 17 Shadcn components
│   │   ├── layout/        # (GĐ2)
│   │   └── features/      # (GĐ3+)
│   ├── constants/
│   │   ├── app-config.ts
│   │   └── enums.ts
│   ├── hooks/             # (khi cần)
│   ├── lib/
│   │   ├── utils.ts
│   │   └── zod-schemas.ts
│   ├── providers/         # (GĐ2)
│   ├── server/
│   │   ├── db.ts
│   │   └── services/      # (GĐ3+)
│   └── types/
│       ├── api.ts
│       ├── nav.ts
│       ├── next-auth.d.ts
│       └── index.ts
├── .env.example
├── package.json
└── prisma.config.ts
```

---

### 🔜 Chuẩn bị cho Giai đoạn 2

Trước khi bắt đầu GĐ2, cần hoàn thành:

1. **Tạo Supabase account** và project mới
2. **Copy DATABASE_URL** từ Supabase Dashboard
3. **Tạo file `.env`** từ `.env.example` với values thực
4. **Chạy migration:** `npx prisma migrate dev --name init_schema`
5. **Chạy seed:** `npx prisma db seed`

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
