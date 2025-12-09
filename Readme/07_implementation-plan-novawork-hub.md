# Kế hoạch Triển khai Chi tiết NovaWork Hub (Step-by-Step Optimized)

> [!TIP]
> **Nguyên tắc thực hiện:** Server Actions trước, UI sau. Luôn viết logic backend và test trước khi gắn vào giao diện.

---

## Các quy tắc xuyên suốt dự án (Cross-cutting Concerns)

> [!IMPORTANT]
> Các pattern dưới đây cần được áp dụng ngay từ đầu và duy trì trong suốt dự án.

- [ ] **Xử lý lỗi (Error Handling):**
  - Global Error Boundary (`src/app/error.tsx`)
  - Trang Not Found (`src/app/not-found.tsx`)
  - Xử lý lỗi API với try-catch
  
- [ ] **Trạng thái Loading:**
  - Global loading (`src/app/loading.tsx`)
  - Skeleton components cho mỗi trang có data-fetching
  - Trạng thái loading cho button khi submit form

- [ ] **Quy tắc Form:**
  - Hiển thị lỗi validation (inline + toast)
  - Trạng thái disabled khi đang submit
  - Thông báo thành công với Sonner toast

- [ ] **An toàn kiểu dữ liệu (Type Safety):**
  - Tận dụng `Prisma.ProjectGetPayload` / `Prisma.TaskCreateInput`
  - Không định nghĩa lại type thủ công

---

## Giai đoạn 1: Khởi tạo Project & Cơ sở hạ tầng (Foundation)

**Mục tiêu:** Có project chạy được, kết nối Database thành công, đầy đủ thư viện nền.

**Kết quả đạt được:**
- ✅ Next.js 15 với App Router, TypeScript, TailwindCSS v4
- ✅ Prisma 7.1.0 với PostgreSQL
- ✅ Shadcn UI với 17+ components
- ✅ `npm run build` thành công

---

### 1.1. Cài đặt Next.js & Dependencies

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

### 1.2. Cấu trúc thư mục dự án

```
nova-work-hub/
├── prisma/
│   ├── migrations/        # SQL migrations
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data script
├── src/
│   ├── actions/           # Server Actions
│   ├── app/               # Next.js App Router
│   ├── components/
│   │   ├── ui/            # Shadcn components
│   │   ├── layout/        # Sidebar, Header
│   │   └── features/      # Task, Project components
│   ├── constants/         # App configs, enums
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities (utils.ts, zod-schemas.ts)
│   ├── providers/         # React Providers
│   ├── server/
│   │   └── db.ts          # Prisma Client Singleton
│   └── types/             # TypeScript definitions
├── prisma.config.ts       # Prisma 7 configuration
├── .env                   # Environment variables (git ignored)
└── .env.example           # Environment template
```

---

### 1.3. Setup Database & Prisma 7 (Supabase)

> **⚠️ QUAN TRỌNG - Prisma 7 có nhiều thay đổi lớn:**
> 1. URL database nằm trong `prisma.config.ts`, không còn trong `schema.prisma`
> 2. **Bắt buộc dùng Driver Adapter** để khởi tạo PrismaClient trong runtime
> 3. Không còn tự động load `.env` - phải import `dotenv/config` thủ công

---

#### Bước 1: Tạo Project trên Supabase

**Mục đích:** Tạo PostgreSQL database miễn phí trên cloud.

1. Truy cập: https://supabase.com/ → Đăng ký/Đăng nhập
2. Click **"New Project"**
3. Điền thông tin:
   - **Name:** `nova-work-hub`
   - **Database Password:** Ghi nhớ password này! (dùng cho connection string)
   - **Region:** Singapore (gần Việt Nam nhất)
4. Đợi ~2 phút để project được tạo

> 💡 **Lưu ý:** Project miễn phí sẽ bị **pause sau 7 ngày không hoạt động**. Vào dashboard để resume nếu cần.

---

#### Bước 2: Lấy Connection Strings

**Mục đích:** Lấy 2 loại connection string cho các mục đích khác nhau.

1. Vào **Project Settings** (icon bánh răng) → **Database**
2. Cuộn xuống phần **Connection string** → Chọn tab **URI**
3. Lấy **2 connection strings:**

| Loại | Port | Mục đích sử dụng |
|------|------|------------------|
| **Transaction pooler** | 6543 | App runtime (PrismaClient) |
| **Session pooler / Direct** | 5432 | Prisma CLI (migrate, push) |

**Ví dụ:**
```env
# Transaction pooler (port 6543) - cho app runtime
DATABASE_URL="postgres://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (port 5432) - cho Prisma CLI
DIRECT_URL="postgres://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

> ⚠️ **Quan trọng:** 
> - Thay `[PASSWORD]` bằng password bạn đặt ở Bước 1
> - Thêm `?pgbouncer=true` vào cuối DATABASE_URL

---

#### Bước 3: Cấu hình `.env`

**Mục đích:** Lưu trữ thông tin nhạy cảm (credentials) tách biệt khỏi code.

```powershell
copy .env.example .env
```

Cập nhật file `.env`:
```env
# ===========================================
# DATABASE (Supabase PostgreSQL)
# ===========================================
# Transaction pooler - dùng cho app runtime
DATABASE_URL="postgres://postgres.xxx:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection - dùng cho Prisma CLI (migrate, push)
DIRECT_URL="postgres://postgres.xxx:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# ===========================================
# AUTHENTICATION (Auth.js v5)
# ===========================================
AUTH_SECRET="your-random-secret-key-32-chars-min"
AUTH_URL="http://localhost:3000"
```

---

#### Bước 4: Cấu hình Prisma 7

**Mục đích:** Cấu hình Prisma để đọc database URL từ environment variables.

**File `prisma.config.ts`** (root folder):
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
        // Dùng DIRECT_URL cho CLI commands (port 5432)
        // Fallback về DATABASE_URL nếu không có DIRECT_URL
        url: env("DIRECT_URL") || env("DATABASE_URL"),
    },
});
```

**File `prisma/schema.prisma`:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  // URL được cấu hình trong prisma.config.ts (Prisma 7+)
  // KHÔNG đặt url ở đây nữa!
}

// Enums và Models (xem file 04_database-schema-novawork-hub.md)
```

---

#### Bước 5: Chạy Prisma Commands

##### 5.1. Generate Prisma Client

```bash
npx prisma generate
```

**Tác dụng:** Tạo TypeScript types và Prisma Client từ schema. File được generate vào `node_modules/@prisma/client`.

**Khi nào cần chạy lại:**
- Mỗi khi thay đổi `schema.prisma`
- Sau khi cài lại `node_modules`

##### 5.2. Đẩy Schema lên Database

```bash
npx prisma db push
```

**Tác dụng:** Đồng bộ schema với database thật. Tạo các tables, enums, indexes.

> ⚠️ **Lưu ý:** Lệnh này có thể bị **treo (timeout)** nếu dùng sai PORT. Xem phần xử lý lỗi bên dưới.

##### 5.3. Seed dữ liệu mẫu

```bash
npx prisma db seed
```

**Tác dụng:** Chạy file `prisma/seed.ts` để tạo dữ liệu mẫu (users, departments, projects, tasks).

##### 5.4. Xem database (Optional)

```bash
npx prisma studio
```

**Tác dụng:** Mở GUI trong browser để xem và chỉnh sửa data.

---

#### Bước 6: Cài Driver Adapter (BẮT BUỘC cho Prisma 7)

**Mục đích:** Prisma 7 yêu cầu driver adapter để khởi tạo PrismaClient.

```bash
npm install @prisma/adapter-pg pg
npm install -D @types/pg
```

---

#### Bước 7: Tạo Prisma Client Singleton

**Mục đích:** Tạo instance PrismaClient dùng chung trong toàn app, tránh tạo nhiều connections.

**File `src/server/db.ts`:**
```typescript
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Connection pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Singleton pattern để tránh tạo nhiều instances trong development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
```

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
| `prisma.config.ts` | Cấu hình Prisma 7 (datasource URL) |
| `prisma/schema.prisma` | Database schema (models, enums) |
| `prisma/seed.ts` | Script seed dữ liệu mẫu |
| `src/server/db.ts` | Prisma Client Singleton với Driver Adapter |
| `src/lib/utils.ts` | Utility `cn()` cho TailwindCSS |

---

### 1.6. Test Connection

Tạo file test để xác nhận kết nối:

**File `src/test-prisma.js`:**
```javascript
require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.$connect();
    console.log("✅ Connected!");
    
    const counts = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
    ]);
    console.log("Users:", counts[0], "| Projects:", counts[1]);
}

main()
    .finally(() => prisma.$disconnect())
    .finally(() => pool.end());
```

Chạy test:
```bash
node src/test-prisma.js
```

---

### 1.7. Verify Setup

```bash
npm run build
```

Kết quả mong đợi:
```
✓ Compiled successfully
✓ Generating static pages
```

---

### ✅ Checkpoint GĐ 1

| Task | Status |
|------|--------|
| Project structure | ✅ Done |
| Dependencies installed | ✅ Done |
| Prisma 7 + Driver Adapter configured | ✅ Done |
| Database connected (Supabase) | ✅ Done |
| Seed data created | ✅ Done |
| Shadcn UI (17 components) | ✅ Done |
| `npm run build` passed | ✅ Done |

---

### 🔧 Lệnh Prisma Thường Dùng

| Lệnh | Mô tả |
|------|-------|
| `npx prisma generate` | Tạo Prisma Client từ schema |
| `npx prisma db push` | Đẩy schema lên database (dev) |
| `npx prisma migrate dev` | Tạo và apply migration (production) |
| `npx prisma db seed` | Chạy seed data |
| `npx prisma studio` | GUI xem database |
| `npx prisma --version` | Xem version Prisma |

---

### 🚨 Xử lý lỗi thường gặp

#### ❌ Lỗi 1: `prisma db push` bị treo (timeout)

**Triệu chứng:** 
```
Datasource "db": PostgreSQL database "postgres"...
(lệnh treo không phản hồi)
```

**Nguyên nhân:** Dùng **port 6543 (pooler)** cho CLI commands. Pooler không ổn định cho schema operations.

**Cách fix:** 
1. Thêm `DIRECT_URL` với **port 5432** vào `.env`:
   ```env
   DIRECT_URL="postgres://...@...supabase.com:5432/postgres"
   ```
2. Cập nhật `prisma.config.ts`:
   ```typescript
   datasource: {
       url: env("DIRECT_URL") || env("DATABASE_URL"),
   },
   ```

---

#### ❌ Lỗi 2: `PrismaClientInitializationError`

**Triệu chứng:**
```
PrismaClientInitializationError: `PrismaClient` is unable to run in this browser environment
```

**Nguyên nhân:** Prisma 7 **bắt buộc dùng Driver Adapter** cho relational databases.

**Cách fix:**
1. Cài driver adapter:
   ```bash
   npm install @prisma/adapter-pg pg
   ```
2. Khởi tạo PrismaClient với adapter:
   ```typescript
   import { Pool } from "pg";
   import { PrismaPg } from "@prisma/adapter-pg";
   import { PrismaClient } from "@prisma/client";

   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const adapter = new PrismaPg(pool);
   const prisma = new PrismaClient({ adapter });
   ```

---

#### ❌ Lỗi 3: `datasource url is no longer allowed in schema`

**Triệu chứng:**
```
The datasource property `url` is no longer allowed in schema.prisma
```

**Nguyên nhân:** Prisma 7 không cho phép `url` trong `schema.prisma` nữa.

**Cách fix:** Xóa dòng `url = env("DATABASE_URL")` trong datasource block:
```prisma
datasource db {
  provider = "postgresql"
  // KHÔNG có dòng url ở đây!
}
```

---

#### ❌ Lỗi 4: `Can't reach database server`

**Triệu chứng:**
```
Can't reach database server at `aws-0-ap-southeast-1.pooler.supabase.com`
```

**Nguyên nhân:** 
- Supabase project bị **pause** (sau 7 ngày không hoạt động)
- Kết nối internet có vấn đề

**Cách fix:**
1. Vào https://supabase.com/dashboard
2. Kiểm tra project có đang **Active** không
3. Nếu bị pause → Click **"Resume project"**

---

#### ❌ Lỗi 5: `password authentication failed`

**Triệu chứng:**
```
password authentication failed for user "postgres.xxx"
```

**Nguyên nhân:** Password trong connection string sai.

**Cách fix:** 
1. Vào Supabase Dashboard → **Project Settings** → **Database**
2. Click **"Reset database password"** để lấy password mới
3. Cập nhật lại `.env`

---

#### ❌ Lỗi 6: `prepared statement already exists`

**Triệu chứng:**
```
prepared statement "s0" already exists
```

**Nguyên nhân:** Dùng pooler connection mà không có flag `pgbouncer=true`.

**Cách fix:** Thêm `?pgbouncer=true` vào cuối DATABASE_URL:
```env
DATABASE_URL="postgres://...@...supabase.com:6543/postgres?pgbouncer=true"
```

---

#### ❌ Lỗi 7: Seed thất bại với `PrismaClientInitializationError`

**Triệu chứng:** `npx prisma db seed` thất bại.

**Nguyên nhân:** File `seed.ts` chưa dùng Driver Adapter.

**Cách fix:** Cập nhật đầu file `prisma/seed.ts`:
```typescript
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

Và cuối file thêm `pool.end()`:
```typescript
main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
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

### 3.1. Phía Server (Logic)

  - [ ] **Schema Validation:** Định nghĩa `CreateProjectSchema` trong `src/lib/zod-schemas.ts`.
  - [ ] **Service:** Tạo `src/server/services/project.service.ts` (Hàm `getProjects`, `getProjectById`).
  - [ ] **Server Action:** Tạo `src/actions/project.ts` (Hàm `createProject`, `updateProjectStatus`).

### 3.2. Phía Client (Giao diện)

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

## Giai đoạn 4A: Quản lý Task & Dạng danh sách

**Mục tiêu:** Quản lý Task cơ bản với List View (nhanh hoàn thành, có thể demo sớm).

### 4A.1. Task Backend

  - [ ] **Zod Schema:** `CreateTaskSchema` (bao gồm title, priority, assignee, due date) trong `src/lib/zod-schemas.ts`.
  - [ ] **Service:** `src/server/services/task.service.ts` (Get tasks by project, get detail).
  - [ ] **Action:** `src/actions/task.ts` (Create, Update, Delete).

### 4A.2. Giao diện danh sách Task

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

## Giai đoạn 4B: Bảng Kanban (Kéo thả)

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

### 4B.2. Logic kéo thả

  - [ ] **Reorder Action:** Thêm `reorderTasks` vào `src/actions/task.ts`.
  - [ ] **Optimistic UI:** Cập nhật state ngay lập tức trước khi API trả về để kéo thả mượt mà.
  - [ ] **View Toggle:** Button chuyển đổi giữa List View và Kanban View.

### ✅ Checkpoint GĐ 4B
- [ ] Kéo thả task giữa các cột hoạt động
- [ ] Reorder task trong cùng cột hoạt động
- [ ] UI không bị giật khi kéo thả (optimistic update)

-----

## Giai đoạn 4C: Chi tiết Task (Sheet)

**Mục tiêu:** Xem và chỉnh sửa chi tiết task trong Slide-over Sheet.

> [!NOTE]
> Cài thêm dependencies cho Rich Text Editor:
> ```bash
> npm install @tiptap/react @tiptap/starter-kit
> ```

### 4C.1. Các component chi tiết

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

## Giai đoạn 5: Tương tác & Tiện ích

**Mục tiêu:** Tăng tính cộng tác (Comment, File, Log time).

### 5.1. Bình luận & Hoạt động

  - [ ] **Database:** Kiểm tra lại model `Comment` và `AuditLog`.
  - [ ] **UI:** Tạo component `TaskCommentSection`.
  - [ ] **Action:** `addComment` (hỗ trợ text thuần trước, mention tính sau).

### 5.2. Đính kèm file (Upload)

  - [ ] **API Route:** `src/app/api/upload/route.ts` xử lý upload lên Supabase Storage/S3.
  - [ ] **Component:** Tạo `FileUpload` dropzone. Tích hợp vào Form tạo Task và Comment.

### 5.3. Chấm công (Log giờ)

  - [ ] **Modal Log Time:** Tạo Dialog cho phép nhập số giờ và ghi chú.
  - [ ] **Logic:** Server Action update bảng `TimeLog` và tính lại `totalHours` của Task (nếu cần hiển thị).

### ✅ Checkpoint GĐ 5
- [ ] Comment trên task hoạt động
- [ ] Upload file thành công, hiển thị attachment
- [ ] Log time và hiển thị tổng giờ

-----

## Giai đoạn 6: Quản trị & Báo cáo

**Mục tiêu:** Quản trị hệ thống và xem dashboard tổng quan.

> [!NOTE]
> Cài thêm dependencies cho Charts:
> ```bash
> npm install recharts
> ```

### 6.1. Quản lý người dùng

  - [ ] **Page:** `src/app/(dashboard)/admin/users/page.tsx`.
  - [ ] **Chức năng:** List user, Tạo user mới (cấp password mặc định), Set Role/Department.
  - [ ] **Security:** Đảm bảo Server Action check `session.user.role === 'ADMIN'`.

### 6.2. Biểu đồ Dashboard

  - [ ] **Service:** `src/server/services/report.service.ts` (Query count task by status, workload by user).
  - [ ] **UI:** Vẽ biểu đồ tròn (Task Status) và biểu đồ cột (Workload) tại trang chủ `src/app/(dashboard)/page.tsx`.

### ✅ Checkpoint GĐ 6
- [ ] Admin có thể quản lý users
- [ ] Dashboard hiển thị charts đúng data
- [ ] Non-admin không truy cập được trang admin

-----

## Giai đoạn 7: Kiểm thử, Review & Triển khai

**Mục tiêu:** Đảm bảo chất lượng code và đưa sản phẩm lên Production.

### 7.1. Kiểm thử (Có thể chạy song song từ GĐ 3)

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

### 7.2. Rà soát & Tối ưu

  - [ ] **Lint:** Chạy `npm run lint` để fix lỗi cú pháp.
  - [ ] **Type Check:** Chạy `tsc --noEmit` để đảm bảo không lỗi Type.
  - [ ] **Build Test:** Chạy `npm run build` ở local xem có lỗi build không.
  - [ ] **Performance:** Kiểm tra bundle size, lazy load components nếu cần.

### 7.3. Triển khai lên Vercel

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

## Mẹo thực hiện

1.  **Server Actions trước, UI sau:** Luôn viết hàm trong `src/actions/...` và test bằng console log hoặc script nhỏ trước khi gắn vào UI. Điều này giúp tách biệt logic và giao diện.

2.  **Type Safety:** Tận dụng tối đa `Prisma.ProjectGetPayload` hoặc `Prisma.TaskCreateInput` để không phải define lại type thủ công.

3.  **Shadcn UI:** Đừng sửa core component trong `components/ui` quá nhiều. Hãy wrap chúng lại hoặc custom thông qua `className`.

4.  **Lazy Install Dependencies:** Chỉ cài thư viện khi thực sự cần (VD: @dnd-kit khi làm Kanban, recharts khi làm Dashboard). Giảm complexity ban đầu.

5.  **Commit thường xuyên:** Mỗi checkpoint hoàn thành nên có 1 commit rõ ràng. Dễ rollback nếu có vấn đề.

6.  **Demo sớm:** Sau GĐ 4A đã có thể demo cho stakeholder với List View. Không cần đợi Kanban hoàn thiện.
