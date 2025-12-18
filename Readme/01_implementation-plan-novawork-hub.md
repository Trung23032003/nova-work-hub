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

## Giai đoạn 1: Khởi tạo Project & Cơ sở hạ tầng (Foundation) ✅

**Mục tiêu:** Có project chạy được, kết nối Database thành công, đầy đủ thư viện nền.

> [!IMPORTANT]  
> **ĐÃ HOÀN THÀNH** - Tất cả bước đã được thực hiện và test thành công.

---

### ✅ Kết quả đạt được

| Thành phần | Phiên bản | Trạng thái |
|------------|-----------|------------|
| Next.js | 15+ (App Router) | ✅ |
| TypeScript | 5.x | ✅ |
| TailwindCSS | v4 | ✅ |
| Prisma | 7.1.0 | ✅ |
| PostgreSQL | Supabase | ✅ |
| Shadcn UI | 17+ components | ✅ |
| `npm run build` | Passed | ✅ |

---

### 1.1. Cài đặt Next.js & Dependencies ✅

**Lệnh khởi tạo:**
```bash
npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --no-import-alias --skip-install
```

**Dependencies đã cài:**
```bash
# Core
npm install next-auth@beta @prisma/client @tanstack/react-query zustand date-fns lucide-react

# Utils
npm install clsx tailwind-merge zod react-hook-form sonner @hookform/resolvers bcryptjs

# Dev
npm install -D prisma@latest @types/bcryptjs dotenv tsx

# Prisma 7 Driver Adapter (BẮT BUỘC)
npm install @prisma/adapter-pg pg
npm install -D @types/pg
```

---

### 1.2. Cấu trúc thư mục dự án ✅

```
nova-work-hub/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data script
├── src/
│   ├── actions/           # Server Actions
│   ├── app/               # Next.js App Router
│   ├── components/ui/     # Shadcn components
│   ├── lib/               # Utilities (utils.ts, auth.ts)
│   ├── server/db.ts       # Prisma Client Singleton
│   └── types/             # TypeScript definitions
├── prisma.config.ts       # Prisma 7 configuration
├── middleware.ts          # Route protection
└── .env                   # Environment variables
```

---

### 1.3. Setup Database & Prisma 7 (Supabase) ✅

> [!CAUTION]
> **Prisma 7 có thay đổi lớn:**
> 1. URL database nằm trong `prisma.config.ts`, KHÔNG trong `schema.prisma`
> 2. **BẮT BUỘC dùng Driver Adapter** để khởi tạo PrismaClient
> 3. Prisma 7 không tự động load `.env` - phải import `dotenv/config`

---

#### 📁 Các file cấu hình Prisma

| File | Mục đích |
|------|----------|
| `prisma.config.ts` | Cấu hình datasource URL cho Prisma CLI |
| `prisma/schema.prisma` | Định nghĩa models, enums, relations |
| `src/server/db.ts` | Prisma Client Singleton với Driver Adapter |
| `prisma/seed.ts` | Script tạo dữ liệu mẫu |

---

#### ⚙️ Cấu hình `.env`

```env
# DATABASE (Supabase)
DATABASE_URL="postgres://...@...supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://...@...supabase.com:5432/postgres"

# AUTHENTICATION
AUTH_SECRET="novawork-hub-super-secret-key-for-development-only-32chars"
AUTH_URL="http://localhost:3000"
```

| Biến | Port | Mục đích |
|------|------|----------|
| `DATABASE_URL` | 6543 | App runtime (PrismaClient) |
| `DIRECT_URL` | 5432 | Prisma CLI (migrate, push, seed) |

---

#### 🔧 Lệnh Prisma thường dùng

| Lệnh | Mô tả |
|------|-------|
| `npx prisma generate` | Tạo Prisma Client từ schema |
| `npx prisma db push` | Đẩy schema lên database |
| `npx prisma db seed` | Chạy seed data |
| `npx prisma studio` | GUI xem database |

---

### 1.4. Setup Shadcn UI ✅

```bash
npx shadcn@latest init -d
npx shadcn@latest add button input form card dialog sheet dropdown-menu avatar badge separator table tabs textarea select scroll-area skeleton -y
```

---

### 1.5. Checkpoint Giai đoạn 1

| Task | Status |
|------|--------|
| Project structure | ✅ |
| Dependencies installed | ✅ |
| Prisma 7 + Driver Adapter | ✅ |
| Database connected (Supabase) | ✅ |
| Seed data created | ✅ |
| Shadcn UI components | ✅ |
| `npm run build` passed | ✅ |

---

### � Xử lý lỗi thường gặp - Giai đoạn 1

> [!TIP]
> Các lỗi dưới đây thường gặp khi setup Prisma 7 với Supabase. **Giữ lại code fix lỗi để tham khảo.**

---

#### ❌ Lỗi 1: `prisma db push` bị treo (timeout)

| Thông tin | Chi tiết |
|-----------|----------|
| **Triệu chứng** | Lệnh treo không phản hồi sau "Datasource db: PostgreSQL..." |
| **Nguyên nhân** | Dùng port 6543 (pooler) cho CLI commands |

**Code fix - `prisma.config.ts`:**
```typescript
datasource: {
    // Dùng DIRECT_URL (port 5432) cho CLI, fallback về DATABASE_URL
    url: env("DIRECT_URL") || env("DATABASE_URL"),
},
```

---

#### ❌ Lỗi 2: `PrismaClientInitializationError`

| Thông tin | Chi tiết |
|-----------|----------|
| **Triệu chứng** | "PrismaClient is unable to run in this browser environment" |
| **Nguyên nhân** | Prisma 7 bắt buộc dùng Driver Adapter |

**Code fix - `src/server/db.ts`:**
```typescript
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

---

#### ❌ Lỗi 3: `datasource url is no longer allowed`

| Thông tin | Chi tiết |
|-----------|----------|
| **Triệu chứng** | "The datasource property url is no longer allowed in schema.prisma" |
| **Nguyên nhân** | Prisma 7 không cho phép `url` trong schema.prisma |

**Code fix - `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  // KHÔNG có dòng url ở đây - URL nằm trong prisma.config.ts
}
```

---

#### ❌ Lỗi 4: `Can't reach database server`

| Thông tin | Chi tiết |
|-----------|----------|
| **Triệu chứng** | "Can't reach database server at aws-0-ap-southeast-1.pooler.supabase.com" |
| **Nguyên nhân** | Supabase project bị pause sau 7 ngày không hoạt động |

**Cách fix:**
1. Vào https://supabase.com/dashboard
2. Kiểm tra project có đang Active không
3. Nếu bị pause → Click "Resume project"

---

#### ❌ Lỗi 5: `password authentication failed`

| Thông tin | Chi tiết |
|-----------|----------|
| **Triệu chứng** | "password authentication failed for user postgres.xxx" |
| **Nguyên nhân** | Password trong connection string sai |

**Cách fix:**
1. Vào Supabase Dashboard → Project Settings → Database
2. Click "Reset database password"
3. Cập nhật `.env` với password mới

---

#### ❌ Lỗi 6: `prepared statement already exists`

| Thông tin | Chi tiết |
|-----------|----------|
| **Triệu chứng** | 'prepared statement "s0" already exists' |
| **Nguyên nhân** | Dùng pooler mà không có flag pgbouncer |

**Code fix - `.env`:**
```env
DATABASE_URL="postgres://...@...supabase.com:6543/postgres?pgbouncer=true"
```

---

#### ❌ Lỗi 7: Seed thất bại với `PrismaClientInitializationError`

| Thông tin | Chi tiết |
|-----------|----------|
| **Triệu chứng** | `npx prisma db seed` thất bại |
| **Nguyên nhân** | File seed.ts chưa dùng Driver Adapter |

**Code fix - `prisma/seed.ts` (đầu file):**
```typescript
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

**Code fix - `prisma/seed.ts` (cuối file):**
```typescript
main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();  // QUAN TRỌNG: Đóng pool
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
```

---



## Giai đoạn 2: Xác thực & App Shell (Authentication & Layout)

**Mục tiêu:** User đăng nhập được, nhìn thấy Sidebar và Header đúng role.

> [!IMPORTANT]
> **Lưu ý tương thích Prisma 7:**
> - Auth.js v5 sử dụng `@auth/prisma-adapter` (KHÔNG phải `@next-auth/prisma-adapter` cũ)
> - Prisma 7 yêu cầu Driver Adapter → PrismaAdapter cần nhận instance PrismaClient đã có adapter
> - Sử dụng lại Prisma Client singleton từ `src/server/db.ts` đã tạo ở GĐ 1

---

### 2.1. Cài đặt Dependencies cho Authentication

```bash
# Auth.js Prisma Adapter (tương thích Auth.js v5)
npm install @auth/prisma-adapter

# Theme switching (optional, but recommended)
npm install next-themes
```

---

### 2.2. Cấu hình Auth.js v5 (Backend) ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Tất cả file chứa comments chi tiết bằng tiếng Việt giải thích từng phần.

---

#### 📁 File 1: Cấu hình Auth chính

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/lib/auth.ts` |
| **Mục đích** | Cấu hình toàn bộ hệ thống xác thực |
| **Exports** | `handlers`, `auth`, `signIn`, `signOut` |

**Tính năng đã cài đặt:**
- ✅ **Credentials Provider** - Đăng nhập email/password với bcrypt hash
- ✅ **Google OAuth Provider** - Đăng nhập bằng Google
- ✅ **PrismaAdapter** - Lưu users/accounts vào database (tương thích Prisma 7)
- ✅ **JWT Strategy** - Nhanh hơn database sessions
- ✅ **Callbacks** - Thêm `id`, `role`, `departmentId` vào session
- ✅ **Kiểm tra user status** - Chặn login nếu LOCKED/INACTIVE

**Cách sử dụng:**
```typescript
// Server Component
import { auth } from "@/lib/auth";
const session = await auth();

// Server Action  
import { signIn, signOut } from "@/lib/auth";
await signIn("credentials", { email, password });
```

---

#### 📁 File 2: API Route

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/app/api/auth/[...nextauth]/route.ts` |
| **Mục đích** | Tạo API endpoints cho Auth.js |

**Endpoints được tạo:**
- `POST /api/auth/signin` - Xử lý đăng nhập
- `POST /api/auth/signout` - Xử lý đăng xuất
- `GET /api/auth/session` - Lấy session hiện tại
- `GET /api/auth/callback/:provider` - OAuth callback

---

#### 📁 File 3: TypeScript Type Declarations

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/types/next-auth.d.ts` |
| **Mục đích** | Mở rộng types của Auth.js để có type safety |

**Ý nghĩa:**
- Cho phép truy cập `session.user.role` và `session.user.departmentId` mà không bị TypeScript báo lỗi
- Định nghĩa enum cho roles: `"ADMIN" | "PM" | "MEMBER" | "VIEWER"`

---

#### 📁 File 4: Middleware bảo vệ route

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `middleware.ts` (root folder) |
| **Mục đích** | Kiểm tra authentication trước mỗi request |

**Logic bảo vệ:**

| Loại Route | Paths | Quyền truy cập |
|------------|-------|----------------|
| **Public** | `/`, `/login`, `/register`, `/forgot-password` | Mọi người đều xem được |
| **Protected** | `/dashboard`, `/projects`, `/tasks`, `/calendar`, `/reports`, `/settings`, `/profile` | Phải đăng nhập |
| **Admin Only** | `/admin/*` | Chỉ role ADMIN |
| **Auth Routes** | `/login`, `/register` | Redirect về dashboard nếu đã login |

---

#### ⚙️ Bước 5: Cập nhật `.env` (BẮT BUỘC)

> [!CAUTION]
> **Thiếu `AUTH_SECRET` sẽ gây lỗi `error=Configuration`**

**Thêm vào file `.env`:**
```env
# BẮT BUỘC
AUTH_SECRET="your-secret-key-at-least-32-characters"
AUTH_URL="http://localhost:3000"

# OPTIONAL (nếu dùng Google OAuth)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Cách tạo `AUTH_SECRET`:**

| Cách | Độ an toàn | Lệnh/Hướng dẫn |
|------|------------|----------------|
| **Node.js** | ⭐⭐⭐⭐ | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| **Website** | ⭐⭐⭐ | https://generate-secret.vercel.app/32 |
| **Tự nghĩ** | ⭐⭐ | Bất kỳ chuỗi nào đủ 32 ký tự |

**Ví dụ chạy lệnh Node.js:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Output: Tk/6tyZwEWv4mMwk9N4botsKGfqRJ9fsjmopVvlQLnU=
```

> [!TIP]
> Copy output và paste vào `AUTH_SECRET` trong file `.env`

---

#### 📁 File 5 & 6: Trang Login và Dashboard Test

| File | Mục đích |
|------|----------|
| `src/app/login/page.tsx` | Form đăng nhập với UI đẹp, hiển thị tài khoản test |
| `src/app/dashboard/page.tsx` | Hiển thị session info, test route protection |

---

#### ✅ Kết quả đạt được

**Tài khoản test (từ seed data):**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@novawork.local` | `Password@123` |
| PM | `pm@novawork.local` | `Password@123` |
| Member | `member1@novawork.local` | `Password@123` |

**Cách test:**
1. Đảm bảo `.env` có `AUTH_SECRET`
2. Chạy `npm run dev`
3. Truy cập http://localhost:3000/login
4. Đăng nhập → redirect về `/dashboard`
5. Dashboard hiển thị: `id`, `email`, `name`, `role`

---

#### 🚨 Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `error=Configuration` | Thiếu `AUTH_SECRET` trong `.env` | Thêm `AUTH_SECRET` và restart server |
| `Email/password không đúng` | Chưa seed data hoặc password sai | Chạy `npx prisma db seed` |
| TypeScript lỗi Adapter | Version mismatch | Dùng `as any` type assertion |

---

### 2.3. Global Providers ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Cho phép sử dụng `useSession()` trong Client Components

---

#### 📁 File 1: AppProvider Wrapper

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/providers/app-provider.tsx` |
| **Loại** | Client Component (`"use client"`) |
| **Mục đích** | Wrap toàn bộ app với các providers cần thiết |

**Providers được cài đặt:**

| Provider | Package | Mục đích |
|----------|---------|----------|
| `SessionProvider` | `next-auth/react` | Cho phép dùng `useSession()` hook trong Client Components |
| `ThemeProvider` | `next-themes` | Chuyển đổi dark/light mode, lưu preference vào localStorage |
| `Toaster` | `sonner` | Hiển thị toast notifications |

---

#### 📁 File 2: Root Layout

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/app/layout.tsx` |
| **Thay đổi** | Wrap `{children}` với `<AppProvider>` |

**Lưu ý quan trọng:**
- `suppressHydrationWarning` trong `<html>` tag: Cần thiết cho `next-themes` để tránh hydration mismatch

---

#### 📁 File 3: Sonner Toaster Component

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/components/ui/sonner.tsx` |
| **Nguồn** | Shadcn UI (`npx shadcn@latest add sonner`) |

**Cách sử dụng toast:**
```tsx
import { toast } from "sonner";

// Các loại toast
toast.success("Thành công!");
toast.error("Có lỗi xảy ra");
toast.info("Thông tin");
toast.warning("Cảnh báo");
```

---

#### ✅ Kết quả đạt được

- ✅ `useSession()` hoạt động trong Client Components (Sidebar, Header)
- ✅ Dark/Light mode switching với `next-themes`
- ✅ Toast notifications với Sonner
- ✅ `npm run build` passed

---

### 2.4. Trang Login ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH**

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/app/login/page.tsx` |
| **Loại** | Client Component (`"use client"`) |

**Tính năng:**
- ✅ Form nhập email/password
- ✅ Nút đăng nhập Google OAuth
- ✅ Xử lý lỗi với thông báo rõ ràng
- ✅ Hiển thị thông tin tài khoản test
- ✅ Giao diện light mode đẹp mắt
- ✅ Redirect về `callbackUrl` sau khi login

---

### 2.4.1. Trang Dashboard Test ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH**

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/app/dashboard/page.tsx` |
| **Loại** | Server Component (async) |

**Tính năng:**
- ✅ Hiển thị thông tin session (id, email, name, role)
- ✅ Raw JSON của session object
- ✅ Các link test route protection
- ✅ Nút đăng xuất (Server Action)

**Cách lấy session trong Server Component:**
```typescript
import { auth } from "@/lib/auth";
const session = await auth();
```

---

### 2.4.2. Landing Page (Homepage) ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH**

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/app/page.tsx` |
| **Loại** | Server Component (async) |
| **URL** | `/` (homepage) |

**Tính năng:**
- ✅ Giao diện light mode đẹp mắt
- ✅ Hiển thị tên app và mô tả
- ✅ Kiểm tra trạng thái đăng nhập
- ✅ **Chưa login:** Hiển thị nút "Đăng nhập" + "Đăng ký"
- ✅ **Đã login:** Hiển thị nút "Vào Dashboard" + tên user
- ✅ Hiển thị features của app (Quản lý Dự án, Task, Cộng tác)

**Lưu ý về Route:**
- Trang `/` nằm trong `publicRoutes` của middleware → **Không yêu cầu đăng nhập**
- User chưa login vẫn xem được homepage

---

### 2.5. Dashboard Layout (Frontend) ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Dashboard Layout với Sidebar và Header

---

#### 📁 Cấu trúc thư mục (Route Group)

```
src/app/
├── (dashboard)/           ← Route Group (không ảnh hưởng URL)
│   ├── layout.tsx         ← Layout chung: Sidebar + Header + Content
│   ├── dashboard/
│   │   └── page.tsx       ← URL: /dashboard
│   ├── projects/
│   │   └── page.tsx       ← URL: /projects
│   ├── tasks/
│   │   └── page.tsx       ← URL: /tasks
│   ├── users/
│   │   └── page.tsx       ← URL: /users
│   ├── settings/
│   │   └── page.tsx       ← URL: /settings
│   └── admin/
│       └── page.tsx       ← URL: /admin
├── login/
│   └── page.tsx           ← URL: /login (không có sidebar)
└── page.tsx               ← URL: / (landing page)
```

**Lưu ý về Route Group:**
- Folder `(dashboard)` với dấu ngoặc đơn là **Route Group**
- Route Group **KHÔNG ảnh hưởng đến URL**
- Tất cả pages trong folder này sẽ sử dụng chung `layout.tsx`

---

#### 📁 File 1: Menu Config

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/constants/menus.ts` |
| **Mục đích** | Cấu hình menu items cho Sidebar |

**Tính năng:**
- ✅ `mainMenuItems`: Menu chính (Dashboard, Dự án, Công việc, Nhân sự)
- ✅ `adminMenuItems`: Menu quản trị (Quản trị - Admin only, Cài đặt)
- ✅ Interface `MenuItem` với type-safe icons từ Lucide

---

#### 📁 File 2: Main Sidebar

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/components/layout/main-sidebar.tsx` |
| **Loại** | Client Component (`"use client"`) |

**Tính năng:**
- ✅ Hiển thị logo và tên app
- ✅ Menu items với icons
- ✅ Active state highlighting (dựa trên `usePathname()`)
- ✅ Role-based menu filtering (Admin vs User)
- ✅ ScrollArea cho menu dài

---

#### 📁 File 3: Header

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/components/layout/header.tsx` |
| **Loại** | Client Component (`"use client"`) |

**Tính năng:**
- ✅ Theme toggle button (Light/Dark mode)
- ✅ User avatar với initials
- ✅ Role badge hiển thị
- ✅ Dropdown menu (Hồ sơ, Đăng xuất)
- ✅ Fix hydration mismatch với mounted state

---

#### 📁 File 4: Sidebar Context

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/contexts/sidebar-context.tsx` |
| **Loại** | Client Component (`"use client"`) |
| **Mục đích** | Quản lý trạng thái ẩn/hiện sidebar |

**Tính năng:**
- ✅ `SidebarProvider` - Wrap layout để share state
- ✅ `useSidebar()` hook - Access state từ bất kỳ component nào
- ✅ Lưu preference vào localStorage

**Cách sử dụng:**
```tsx
// Trong layout
<SidebarProvider>
    <MainSidebar />
    <Header />
</SidebarProvider>

// Trong component
const { isOpen, toggle } = useSidebar();
```

---

#### 📁 File 5: Dashboard Layout

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/app/(dashboard)/layout.tsx` |
| **Loại** | Server Component |

**Cấu trúc layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (fixed)  │         Header (sticky)              │
│  [Toggle] 🚀 Logo ├──────────────────────────────────────│
│   - Dashboard     │                                      │
│   - Dự án         │         Main Content Area            │
│   - Công việc     │         (children)                   │
└──────────────────────────────────────────────────────────┘
```

**Wrap với SidebarProvider:** Layout được wrap với `<SidebarProvider>` để quản lý trạng thái sidebar.

---

#### 📁 File 6: Dashboard Page

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/app/(dashboard)/dashboard/page.tsx` |
| **URL** | `/dashboard` |

**Tính năng:**
- ✅ Welcome message với tên user
- ✅ 4 stat cards (Dự án, Công việc, Hoàn thành, Quá hạn)
- ✅ Placeholder cho Recent Tasks và Team Activity

---

#### 📁 File 7-11: Các trang placeholder

| File | URL | Mô tả |
|------|-----|-------|
| `(dashboard)/projects/page.tsx` | `/projects` | Danh sách dự án |
| `(dashboard)/tasks/page.tsx` | `/tasks` | Danh sách công việc |
| `(dashboard)/users/page.tsx` | `/users` | Danh sách nhân sự |
| `(dashboard)/settings/page.tsx` | `/settings` | Cài đặt |
| `(dashboard)/admin/page.tsx` | `/admin` | Trang quản trị (Admin only) |

---

### 2.5.1. Tính năng Collapse/Expand Sidebar ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Sidebar có thể thu gọn/mở rộng

#### Cách hoạt động:

| Trạng thái | Sidebar | Icon Toggle |
|------------|---------|-------------|
| **Mở (expanded)** | Rộng 256px, hiện đầy đủ text | Phần tối lớn hơn |
| **Đóng (collapsed)** | Hẹp 64px, chỉ hiện icon | Phần trắng lớn hơn |

#### Icon Toggle:
```
┌─────────────┐         ┌─────────────┐
│ ████│      │         │ ██│         │
│ ████│      │   →     │ ██│         │
│ ████│      │         │ ██│         │
└─────────────┘         └─────────────┘
  Sidebar MỞ             Sidebar ĐÓNG
(phần tối lớn)         (phần tối nhỏ)
```

#### Các file liên quan:

| File | Thay đổi |
|------|----------|
| `src/contexts/sidebar-context.tsx` | Context quản lý state |
| `src/components/layout/main-sidebar.tsx` | Logic collapse/expand + toggle icon |
| `src/app/(dashboard)/layout.tsx` | Wrap với SidebarProvider |

#### Cài đặt Tooltip (cho collapsed state):
```bash
npx shadcn@latest add tooltip -y
```

---

#### ✅ Kết quả đạt được

- ✅ Sidebar với navigation menu động theo role
- ✅ Sidebar collapse/expand với icon toggle
- ✅ Tooltip hiển thị tên menu khi collapsed
- ✅ Header với theme toggle và user dropdown
- ✅ Layout responsive
- ✅ Lưu trạng thái sidebar vào localStorage
- ✅ Tất cả routes hoạt động
- ✅ `npm run build` passed

---

### 2.6. Checklist thực hiện

  - [x] **Cài dependencies:** `@auth/prisma-adapter`, `next-themes`
  - [x] **Config Auth:** Tạo `src/lib/auth.ts` với CredentialsProvider và GoogleProvider
  - [x] **API Route:** Tạo `src/app/api/auth/[...nextauth]/route.ts`
  - [x] **Type definitions:** Tạo `src/types/next-auth.d.ts` mở rộng types
  - [x] **Middleware:** Tạo `middleware.ts` để bảo vệ routes
  - [x] **Providers Wrapper:** Tạo `src/providers/app-provider.tsx`
  - [x] **Root Layout:** Cập nhật `src/app/layout.tsx` với AppProvider
  - [x] **Login Page:** Tạo `src/app/login/page.tsx`
  - [x] **Menu Config:** Tạo `src/constants/menus.ts`
  - [x] **Sidebar:** Tạo `src/components/layout/main-sidebar.tsx`
  - [x] **Header:** Tạo `src/components/layout/header.tsx`
  - [x] **Dashboard Layout:** Tạo `src/app/(dashboard)/layout.tsx`
  - [x] **Dashboard Page:** Tạo `src/app/(dashboard)/dashboard/page.tsx`
  - [x] **Các trang placeholder:** projects, tasks, users, settings, admin
  - [x] **Sidebar Context:** Tạo `src/contexts/sidebar-context.tsx`
  - [x] **Tooltip Component:** `npx shadcn@latest add tooltip`
  - [x] **Sidebar Collapse/Expand:** Nút toggle với icon 2 phần

---

### ✅ Checkpoint GĐ 2

| Task | Status |
|------|--------|
| `@auth/prisma-adapter` cài đặt | ✅ |
| Auth config with Prisma 7 Driver Adapter | ✅ |
| Login/Logout hoạt động (Credentials) | ✅ |
| Google OAuth hoạt động (optional) | ⬜ (chưa cấu hình GOOGLE_CLIENT_ID/SECRET) |
| Middleware bảo vệ `/dashboard` | ✅ |
| Sidebar hiển thị đúng menu theo role | ✅ |
| Sidebar collapse/expand | ✅ |
| Theme toggle (dark/light) | ✅ |
| `npm run build` passed | ✅ |

---

### 🚨 Xử lý lỗi thường gặp GĐ 2

#### ❌ Lỗi 1: `Module not found: @auth/prisma-adapter`

**Nguyên nhân:** Chưa cài package.

**Cách fix:**
```bash
npm install @auth/prisma-adapter
```

---

#### ❌ Lỗi 2: `PrismaAdapter is not compatible with Prisma 7`

**Nguyên nhân:** Sử dụng `@next-auth/prisma-adapter` cũ thay vì `@auth/prisma-adapter`.

**Cách fix:**
1. Gỡ package cũ (nếu có):
   ```bash
   npm uninstall @next-auth/prisma-adapter
   ```
2. Cài package mới:
   ```bash
   npm install @auth/prisma-adapter
   ```

---

#### ❌ Lỗi 3: `AUTH_SECRET is missing`

**Triệu chứng:**
```
[auth][error] MissingSecret: Please define a `secret`.
```

**Cách fix:** Thêm `AUTH_SECRET` vào `.env`:
```env
AUTH_SECRET="your-32-character-random-string"
```

Tạo secret ngẫu nhiên:
```bash
openssl rand -base64 32
```

---

#### ❌ Lỗi 4: Session không có `id` hoặc `role`

**Nguyên nhân:** Chưa cấu hình callbacks trong Auth config.

**Cách fix:** Đảm bảo có callbacks `jwt` và `session` trong `src/lib/auth.ts` (xem code mẫu ở trên).

---

#### ❌ Lỗi 5: Prisma adapter không hoạt động

**Nguyên nhân:** Cần các model bổ sung cho Auth.js trong Prisma schema.

**Cách fix:** Đảm bảo `prisma/schema.prisma` có các model sau:
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

Sau đó chạy:
```bash
npx prisma db push
npx prisma generate
```

---

#### ❌ Lỗi 6: Hydration Mismatch với `next-themes`

**Triệu chứng (Console Error):**
```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
This won't be patched up. This can happen if a SSR-ed Client Component used:
- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
...
```

**Nguyên nhân:** 
- `next-themes` sử dụng `localStorage` để lưu theme preference
- Server không có access đến `localStorage` → render HTML mặc định
- Client đọc từ `localStorage` → render HTML khác với server
- React phát hiện sự khác biệt → Hydration mismatch

**Cách fix - Pattern "mounted" state:**

Trong các Client Components sử dụng `useTheme()`, thêm logic chờ mount trước khi render theme-dependent content:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

export function ThemeToggle() {
    // State để track xem client đã mount chưa
    const [mounted, setMounted] = useState(false);
    const { setTheme, theme } = useTheme();

    // Effect chạy sau khi client mount
    useEffect(() => {
        setMounted(true);
    }, []);

    // Render skeleton khi chưa mount (server + client lần đầu đều render cái này)
    if (!mounted) {
        return <Skeleton className="h-9 w-9 rounded-md" />;
    }

    // Sau khi mount mới render theme toggle thật
    return (
        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
    );
}

```

**Giải thích:**
1. **Server render (SSR)**: `mounted = false` → render Skeleton
2. **Client hydration**: `mounted = false` → render Skeleton (giống server ✅)
3. **Sau useEffect chạy**: `mounted = true` → render Theme Toggle Button thực sự

**Lưu ý bổ sung:**
- Đảm bảo `<html>` tag có `suppressHydrationWarning` trong `layout.tsx`:
```tsx
<html lang="vi" suppressHydrationWarning>
```

---

#### ❌ Lỗi 7: Route conflict - Two parallel pages resolve to same path

**Triệu chứng:**
```
Error: You cannot have two parallel pages that resolve to the same path. 
Please check /(dashboard)/dashboard and /dashboard.
```

**Nguyên nhân:** 
- Có 2 file page.tsx cho cùng một URL
- Ví dụ: `src/app/dashboard/page.tsx` và `src/app/(dashboard)/dashboard/page.tsx` đều tạo URL `/dashboard`

**Cách fix:**
1. Xóa một trong hai file (giữ file trong route group nếu muốn dùng layout chung):
```bash
Remove-Item -Path "src/app/dashboard" -Recurse -Force
```
2. Hoặc đổi tên folder để tránh conflict

**Lưu ý về Route Group:**
- Folder có dấu ngoặc đơn `(dashboard)` là **Route Group**
- Route Group **KHÔNG ảnh hưởng đến URL**
- `src/app/(dashboard)/dashboard/page.tsx` → URL vẫn là `/dashboard`

-----

## Giai đoạn 3: Module Dự án (Project Management)

**Mục tiêu:** CRUD Dự án, hiển thị danh sách và layout chi tiết dự án.

### 3.1. Phía Server (Logic) ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Backend logic cho Module Dự án

---

#### 📁 File 1: Schema Validation

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/lib/zod-schemas.ts` |
| **Schema** | `CreateProjectSchema`, `UpdateProjectSchema` |

**Đã có sẵn từ trước**, bao gồm:
- `name`: Bắt buộc, tối đa 200 ký tự
- `code`: Bắt buộc, chỉ chữ IN HOA, số và dấu `-`, regex `/^[A-Z0-9-]+$/`
- `description`, `clientName`: Optional
- `priority`: Enum `LOW | MEDIUM | HIGH | CRITICAL`
- `startDate`, `dueDate`: Date (coerce từ string)
- `pmId`: ID của Project Manager (bắt buộc)

---

#### 📁 File 2: Project Service

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/server/services/project.service.ts` |
| **Mục đích** | Logic truy vấn database cho Projects |

**Các hàm đã implement:**

| Hàm | Mô tả |
|-----|-------|
| `getProjects(options)` | Lấy danh sách projects với filter, sort, paginate |
| `getProjectById(id)` | Lấy chi tiết project theo ID hoặc slug |
| `canAccessProject(projectId, userId, userRole)` | Kiểm tra quyền truy cập |
| `getProjectStats(projectId)` | Lấy thống kê (tasks theo status, members, hours) |

**Types được export:**
- `ProjectListItem` - Type cho item trong danh sách
- `ProjectDetail` - Type cho trang chi tiết
- `GetProjectsOptions` - Options cho filter/sort/paginate

---

#### 📁 File 3: Project Server Actions

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `src/actions/project.ts` |
| **Loại** | Server Actions (`"use server"`) |

**Các hàm đã implement:**

| Hàm | Mô tả | Authorization |
|-----|-------|---------------|
| `createProject(input)` | Tạo dự án mới | ADMIN, PM |
| `updateProject(input)` | Cập nhật thông tin dự án | ADMIN, PM của project |
| `updateProjectStatus(id, status)` | Đổi trạng thái dự án | ADMIN, PM của project |
| `deleteProject(id)` | Xóa dự án | ADMIN only |
| `addProjectMember(projectId, userId, role)` | Thêm thành viên | ADMIN, PM của project |
| `removeProjectMember(projectId, userId)` | Xóa thành viên | ADMIN, PM của project |

**Response type chuẩn:**
```typescript
type ActionResponse<T> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string };
```

**Cách sử dụng trong Client Component:**
```tsx
"use client";
import { createProject } from "@/actions/project";
import { toast } from "sonner";

async function handleSubmit(data: CreateProjectInput) {
  const result = await createProject(data);
  if (result.success) {
    toast.success(result.message);
    router.push(`/projects/${result.data.id}`);
  } else {
    toast.error(result.error);
  }
}
```

---

#### ✅ Kết quả đạt được

- ✅ `CreateProjectSchema` đã có trong `zod-schemas.ts`
- ✅ Project Service với 4 hàm query
- ✅ 6 Server Actions cho CRUD + member management
- ✅ Type-safe với Prisma.ProjectGetPayload
- ✅ Authorization đầy đủ (ADMIN, PM, Member)
- ✅ `npm run build` passed



### 3.2. Phía Client (Giao diện) ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Giao diện Module Dự án

---

#### 📁 Cấu trúc files đã tạo

```
src/
├── components/features/projects/
│   ├── index.ts                    ← Barrel exports
│   ├── project-card.tsx            ← Card hiển thị project
│   ├── project-list.tsx            ← Grid danh sách projects
│   └── create-project-dialog.tsx   ← Modal tạo project mới
│
└── app/(dashboard)/projects/
    ├── page.tsx                    ← Server Component (data fetching)
    ├── page-client.tsx             ← Client Component (interactive UI)
    └── [projectId]/
        ├── layout.tsx              ← Layout với header + tabs
        ├── page.tsx                ← Tab Overview (stats, info)
        ├── components/
        │   ├── project-detail-header.tsx
        │   └── project-tabs.tsx
        ├── tasks/
        │   └── page.tsx            ← Tab Tasks (placeholder)
        ├── members/
        │   └── page.tsx            ← Tab Members (danh sách)
        └── settings/
            └── page.tsx            ← Tab Settings (form edit)
```

---

#### 📁 File 1: Project Components

| Component | File | Mô tả |
|-----------|------|-------|
| `ProjectCard` | `project-card.tsx` | Card với status, priority, PM, task count, actions, **double-click để xem chi tiết** |
| `ProjectList` | `project-list.tsx` | Grid layout + empty state + delete confirmation |
| `CreateProjectDialog` | `create-project-dialog.tsx` | Modal form với react-hook-form + zod |

**Tính năng ProjectCard:**
- ✅ Hiển thị status, priority, PM, task count
- ✅ Menu 3 chấm với actions: Xem chi tiết, Chỉnh sửa, Xóa
- ✅ **Double-click** vào card để chuyển đến trang chi tiết project

**Lưu ý Zod v4 + @hookform/resolvers:**
- Cần sử dụng explicit type cho form values
- Cast resolver với `as any` để tránh type mismatch

---

#### 📁 File 2: Project List Page

| Thông tin | Chi tiết |
|-----------|----------|
| **Server Component** | `page.tsx` - Fetch projects và users |
| **Client Component** | `page-client.tsx` - Render UI tương tác |

**Pattern Server/Client Component:**
```tsx
// page.tsx (Server - data fetching)
const { projects } = await getProjects();
return <ProjectsPageClient projects={projects} />;

// page-client.tsx (Client - interactivity)
"use client";
export function ProjectsPageClient({ projects }) { ... }
```

---

#### 📁 File 3: Project Detail Layout

| Thông tin | Chi tiết |
|-----------|----------|
| **File** | `[projectId]/layout.tsx` |
| **Features** | Auth check, fetch project, authorization, header, tabs |

**URL Structure:**
| URL | Tab | File |
|-----|-----|------|
| `/projects/[id]` | Tổng quan | `page.tsx` |
| `/projects/[id]/tasks` | Công việc | `tasks/page.tsx` |
| `/projects/[id]/members` | Thành viên | `members/page.tsx` |
| `/projects/[id]/settings` | Cài đặt | `settings/page.tsx` |

---

#### 📁 File 4: Tab Overview

Hiển thị:
- ✅ 4 Stats cards (Tổng tasks, Tiến độ, Thành viên, Giờ log)
- ✅ Phân bổ công việc theo status (progress bars)
- ✅ Thông tin dự án (dates, client, budget, members)
- ⬜ Recent activity (placeholder)

---

#### ✅ Kết quả đạt được

- ✅ Trang danh sách projects với Grid Cards
- ✅ Modal tạo project mới (react-hook-form + zod + server action)
- ✅ Auto-generate code từ name
- ✅ Delete confirmation dialog
- ✅ Project detail layout với 4 tabs
- ✅ Tab Overview với stats
- ✅ Tab Members với danh sách thành viên
- ✅ Tab Settings với form (placeholder functionality)
- ✅ Tab Tasks (placeholder cho Giai đoạn 4)
- ✅ Status dropdown thay đổi trực tiếp
- ✅ Authorization check (chỉ PM/ADMIN edit)
- ✅ **Double-click** vào card để xem chi tiết project
- ✅ `npm run build` passed

### ✅ Checkpoint GĐ 3
- [x] Tạo dự án mới thành công, hiển thị trong danh sách
- [x] Click vào dự án → vào trang detail với đầy đủ tabs
- [x] Double-click vào card → chuyển đến trang chi tiết
- [ ] Loading skeleton hiển thị khi đang fetch data (TODO)



-----

## Giai đoạn 4A: Quản lý Task & Dạng danh sách ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Module Task cơ bản với List View

**Mục tiêu:** Quản lý Task cơ bản với List View (nhanh hoàn thành, có thể demo sớm).

### 4A.1. Task Backend ✅

  - [x] **Zod Schema:** `CreateTaskSchema`, `UpdateTaskSchema` đã có sẵn trong `src/lib/zod-schemas.ts`.
  - [x] **Service:** `src/server/services/task.service.ts`
      - `getTasksByProject(options)` - Lấy danh sách tasks với filter, sort, paginate
      - `getTaskById(taskId)` - Lấy chi tiết task
      - `getProjectMembers(projectId)` - Lấy danh sách members để assign
      - `getNextTaskPosition()` - Lấy position cho task mới (chuẩn bị cho Kanban)
      - `getTaskCountsByStatus(projectId)` - Đếm tasks theo status
  - [x] **Action:** `src/actions/task.ts`
      - `createTask(input)` - Tạo task mới
      - `updateTask(input)` - Cập nhật task
      - `updateTaskStatus(taskId, status)` - Đổi status (inline)
      - `deleteTask(taskId)` - Xóa task
      - `updateTaskAssignee(taskId, assigneeId)` - Đổi assignee

### 4A.2. Giao diện danh sách Task ✅

#### 📁 Cấu trúc files đã tạo

```
src/
├── components/features/tasks/
│   ├── index.ts                    ← Barrel exports
│   ├── task-row.tsx                ← Row trong table với inline status change
│   ├── task-list.tsx               ← Table component + empty state
│   ├── task-filters.tsx            ← Bộ lọc: status, priority, assignee, search
│   └── create-task-dialog.tsx      ← Modal tạo task mới
│
└── app/(dashboard)/projects/[projectId]/tasks/
    ├── page.tsx                    ← Server Component (data fetching)
    └── page-client.tsx             ← Client Component (interactive UI)
```

#### Tính năng đã implement:

| Tính năng | Mô tả |
|-----------|-------|
| **Table View** | Hiển thị tasks dạng table với các cột: Title, Status, Priority, Assignee, Due Date |
| **Inline Status Change** | Dropdown đổi status ngay trong table row |
| **Priority Badge** | Badge màu theo độ ưu tiên (Low/Medium/High/Critical) |
| **Due Date Warning** | Hiển thị cảnh báo nếu task quá hạn hoặc sắp hết hạn |
| **Filters** | Lọc theo status, priority, assignee, search by title |
| **Stats Summary** | 4 cards hiển thị số lượng tasks theo status |
| **Create Task Dialog** | Modal form với type, priority, status, assignee, due date, estimate hours |
| **Delete Task** | Xóa task với confirmation |

#### UI Components mới:

| Component | File | Mô tả |
|-----------|------|-------|
| `TaskRow` | `task-row.tsx` | Row với status dropdown, priority badge, assignee avatar, actions menu |
| `TaskList` | `task-list.tsx` | Table wrapper với empty state |
| `TaskFilters` | `task-filters.tsx` | Search + Status/Priority/Assignee dropdowns + Active filters badges |
| `CreateTaskDialog` | `create-task-dialog.tsx` | Modal form với react-hook-form + zod validation |

### ✅ Checkpoint GĐ 4A
- [x] CRUD Task hoạt động (tạo, sửa, xóa)
- [x] List view hiển thị đầy đủ thông tin task
- [x] Filter theo status hoạt động
- [x] Inline status change
- [x] `npm run build` passed

-----

## Giai đoạn 4B: Bảng Kanban (Kéo thả) ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Giao diện Kanban với drag & drop

**Mục tiêu:** Giao diện Kanban với khả năng kéo thả mượt mà.

> [!NOTE]
> Dependencies đã cài:
> ```bash
> npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
> ```

### 4B.1. Kanban Components ✅

  - [x] **Board Component:** `src/components/features/tasks/kanban-board.tsx`
      - DndContext từ `@dnd-kit/core` bọc toàn bộ board
      - closestCorners collision detection
      - DragOverlay hiển thị preview khi kéo
      - Optimistic UI updates
      - **Fix:** Sử dụng `useRef` lưu cột ban đầu để đảm bảo API được gọi đúng
      
  - [x] **Column Component:** `src/components/features/tasks/kanban-column.tsx`
      - useDroppable cho mỗi cột
      - SortableContext với verticalListSortingStrategy
      - Header với count và nút "+" add task
      - ScrollArea cho danh sách task
      
  - [x] **Task Card:** `src/components/features/tasks/task-card.tsx`
      - useSortable từ `@dnd-kit/sortable`
      - **Kéo từ bất kỳ đâu** trên thẻ (không cần grip handle)
      - Priority dot, type badge, assignee avatar
      - Due date warning
      - Cursor: `cursor-grab` / `active:cursor-grabbing`

### 4B.2. Logic kéo thả ✅

  - [x] **Status Update:** Sử dụng `updateTaskStatus` từ `task.ts` khi kéo task sang cột khác
  - [x] **Optimistic UI:** Local state cập nhật ngay lập tức, rollback nếu API fail
  - [x] **View Toggle:** Tabs component chuyển đổi giữa "Danh sách" và "Kanban"
  - [x] **URL Persistence:** View mode được lưu trong URL query param `?view=kanban`
  - [x] **Original Column Tracking:** Lưu cột ban đầu với `useRef` để detect chính xác khi task di chuyển

### 📁 Cấu trúc files mới

```
src/components/features/tasks/
├── kanban-board.tsx     ← Board chính với DndContext + originalColumnRef
├── kanban-column.tsx    ← Cột (TODO, IN_PROGRESS, REVIEW, DONE)
├── task-card.tsx        ← Card draggable (kéo từ bất kỳ đâu)
└── index.ts             ← Updated exports
```

### ✅ Checkpoint GĐ 4B
- [x] Kéo thả task giữa các cột hoạt động
- [x] **Status được lưu vào database** khi kéo sang cột khác
- [x] Kéo từ bất kỳ đâu trên thẻ (UX tốt hơn)
- [x] UI không bị giật khi kéo thả (optimistic update)
- [x] View Toggle (List ↔ Kanban) hoạt động
- [x] `npm run build` passed

-----

## Giai đoạn 4C: Chi tiết Task (Sheet) ✅

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Task Detail Sheet với đầy đủ properties

**Mục tiêu:** Xem và chỉnh sửa chi tiết task trong Slide-over Sheet.

> [!NOTE]
> Dependencies bổ sung đã cài:
> ```bash
> npx shadcn@latest add checkbox progress
> ```

### 4C.1. Các component chi tiết ✅

  - [x] **Sheet Component:** `src/components/features/tasks/task-detail-sheet.tsx`
      - Slide-over Sheet từ bên phải
      - Editable title (inline input)
      - Properties panel với grid layout 2 cột
      
  - [x] **Properties Panel:**
      - Status select với color dots
      - Priority select với color coding
      - Assignee select với avatar
      - Due Date picker với Calendar
      - Task Type select
      - Estimate Hours input
      
  - [x] **Description Editor:** Textarea (có thể nâng cấp lên Tiptap sau)
  
  - [x] **Actions:**
      - "Lưu thay đổi" button (disabled nếu không có changes)
      - "Xóa task" button với confirmation

### 4C.2. Subtasks (Checklist) ✅

  - [x] **Checklist Component:** `src/components/features/tasks/task-checklist.tsx`
      - Hiển thị danh sách items với checkbox
      - Toggle hoàn thành
      - Thêm item mới (input + button)
      - Xóa item
      - Progress bar hiển thị tiến độ

  - [ ] **Checklist Actions:** CRUD subtasks trong `src/actions/task.ts` (TODO - cần thêm API)

### 4C.3. UX Improvements ✅

  - [x] **Improved Visual Design:**
      - Gradient header (from-muted/50 to-background)
      - Card-based property layout với icons màu sắc
      - Better spacing và visual hierarchy
      - Sticky footer với action buttons
      
  - [x] **Enhanced Interactions:**
      - **Click anywhere on card** → dropdown/picker mở ra
      - Controlled Select states với open/onOpenChange
      - cursor-pointer cho interactive cards
      - Hover effects cho feedback
      
  - [x] **TaskRow Click-to-Open:**
      - Click anywhere on task row → mở Task Detail Sheet
      - stopPropagation cho Status dropdown và Actions menu
      - hover:bg-muted/50 highlight effect

### 📁 Cấu trúc files mới

```
src/components/features/tasks/
├── task-detail-sheet.tsx   ← Sheet với improved UI, controlled dropdowns
├── task-checklist.tsx      ← Checklist component
├── task-row.tsx            ← Updated với click-to-open
└── index.ts                ← Updated exports
```

### ✅ Checkpoint GĐ 4C
- [x] Click task (row hoặc card) → mở Sheet với đầy đủ thông tin
- [x] Sửa tất cả properties (status, priority, assignee, due date, type, estimate)
- [x] **Click vào bất kỳ đâu trong property card** → dropdown mở
- [x] Sửa title và description
- [x] Giao diện đẹp với gradient, icons, cards
- [x] Checklist UI component có sẵn (API integration TODO)
- [x] `npm run build` passed

-----

## Giai đoạn 5: Tương tác & Tiện ích

**Mục tiêu:** Tăng tính cộng tác (Comment, File, Log time).

### 5.1. Bình luận & Hoạt động ✅ (100% Complete)

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Comment System đã được tích hợp đầy đủ vào Task Detail Sheet
> 
> **Đã cài đặt:** `npx shadcn@latest add alert-dialog`

**Backend - ✅ Hoàn thành:**

  - [x] **Database Model:** Đã có sẵn `Comment` model trong Prisma schema
      - Fields: id, content, taskId, authorId, createdAt, updatedAt
      - Relations: author (User), task (Task)
      - Cascade delete khi task bị xóa

  - [x] **Comment Service:** `src/server/services/comment.service.ts`
      - `getCommentsByTask()` - Get comments với pagination, ordering
      - `getCommentById()` - Get single comment
      - `canDeleteComment()` - Check permissions (author hoặc ADMIN)
      - Type exports: `CommentListItem`, `GetCommentsOptions`
      - ✅ Fixed import path: `@/server/db`

  - [x] **Comment Server Actions:** `src/actions/comment.ts`
      - `addComment()` - Thêm comment với auth, project access check
      - `updateComment()` - Sửa comment (chỉ author)
      - `deleteComment()` - Xóa comment (author hoặc ADMIN)
      - Full validation với Zod schemas
      - Revalidation paths sau CRUD
      - ✅ Fixed Zod error handling: `error.issues` thay vì `error.errors`
      - ✅ Fixed import paths: `@/lib/auth`, `@/server/db`
      - ✅ Added ActionResponse type definition

**Frontend - ✅ Hoàn thành:**

  - [x] **TaskCommentSection Component:** `src/components/features/tasks/task-comment-section.tsx`
      - ✅ Danh sách comments với avatar, name, relative time
      - ✅ Form thêm comment mới (Ctrl+Enter để gửi)
      - ✅ Inline edit cho comment của mình
      - ✅ Delete với AlertDialog confirmation
      - ✅ Permission-based UI (show edit/delete chỉ khi có quyền)
      - ✅ Empty state message
      - ✅ Max height với scroll cho nhiều comments
      - ✅ "(đã chỉnh sửa)" indicator khi updated > created

  - [x] **Barrel exports:** Updated `src/components/features/tasks/index.ts`

**Integration - ✅ Hoàn thành:**

  - [x] **TaskDetailSheet Integration:**
      - ✅ Added `MessageSquare` icon import
      - ✅ Import `CommentListItem` type và `TaskCommentSection` component
      - ✅ Added props: `comments`, `currentUserId`, `currentUserRole`
      - ✅ Render comment section sau Description, trước Footer
      - ✅ Conditional rendering based on authentication
      
  - [x] **Server Data Fetching:**
      - ✅ Added `currentUser` prop to `TasksPageClient`
      - ✅ Import `getCommentsByTask` service
      - ✅ Fetch comments on task click (async)
      - ✅ Pass comments + currentUser info to TaskDetailSheet
      
  - [x] **Type Safety:**
      - ✅ All TypeScript types properly defined
      - ✅ No lint/type errors

### 📁 Files đã tạo/chỉnh sửa

```
src/
├── server/services/
│   └── comment.service.ts               ← Comment queries & permission checks (UPDATED)
├── actions/
│   └── comment.ts                       ← CRUD Server Actions (UPDATED - Fixed lint errors)
├── components/features/tasks/
│   ├── task-comment-section.tsx        ← Full-featured comment UI
│   ├── task-detail-sheet.tsx           ← Comment section integrated (UPDATED)
│   └── index.ts                         ← Updated exports
└── app/(dashboard)/projects/[projectId]/tasks/
    ├── page.tsx                         ← Pass currentUser (UPDATED)
    └── page-client.tsx                  ← Fetch comments on task click (UPDATED)
```

### 🎯 Tính năng Comments hoàn chỉnh

| Tính năng | Trạng thái |
|-----------|------------|
| Add comment | ✅ Hoạt động (Ctrl+Enter) |
| Edit comment | ✅ Hoạt động (inline, chỉ author) |
| Delete comment | ✅ Hoạt động (với confirmation, author/ADMIN) |
| Permission-based UI | ✅ Hoạt động |
| Real-time updates | ✅ Hoạt động (revalidation) |
| Avatar display | ✅ Hoạt động |
| Relative timestamps | ✅ Hoạt động |
| Empty state | ✅ Hoạt động |
| Scroll container | ✅ Hoạt động |
| Edited indicator | ✅ Hoạt động |
| **Real-time updates** | ✅ **Hoạt động** |

### 🔧 Technical Fixes (Post-Integration)

**Issue 1: Client-Server Boundary Violation**
- **Problem:** Client Component import Server Service trực tiếp → DNS module error
- **Solution:** Tạo `getTaskComments()` Server Action trong `comment.ts`
- **Result:** Client components gọi Server Action thay vì import service

**Issue 2: Comments không update real-time**
- **Problem:** Sau add/edit/delete comment, phải đóng/mở lại sheet để thấy changes
- **Solution:** 
  - Tạo `refetchComments()` function trong `page-client.tsx`
  - Truyền `onCommentsRefresh` callback từ page-client → TaskDetailSheet → TaskCommentSection
  - TaskCommentSection gọi callback này thay vì `router.refresh()`
- **Result:** Comments update immediately sau CRUD operations ✨

---

### 5.2. Đính kèm file (Upload) ✅ (100% Complete)

> [!IMPORTANT]
> **ĐÃ HOÀN THÀNH** - Hệ thống đính kèm file đã tích hợp vào Task Detail

**Backend - ✅ Hoàn thành:**
 - [x] **API Route:** `src/app/api/upload/route.ts` xử lý upload file vật lý (local storage `public/uploads`).
 - [x] **Attachment Service:** `src/server/services/attachment.service.ts` xử lý logic database & check permission.
 - [x] **Server Actions:** `src/actions/attachment.ts` cho CRUD attachments (Create, Delete, Get).
 - [x] **Validation:** Zod schemas cho attachment (hỗ trợ đường dẫn tương đối).

**Frontend - ✅ Hoàn thành:**
 - [x] **FileUpload Component:** `src/components/features/tasks/file-upload.tsx` hỗ trợ kéo thả, validate dung lượng (10MB) và loại file.
 - [x] **Attachment List:** Hiển thị danh sách file với preview ảnh, thông tin size và nút xóa theo quyền.
 - [x] **Task Detail Integration:** Tích hợp vào `TaskDetailSheet`, hiển thị giữa phần Mô tả và Bình luận.
 - [x] **Accessibility Fix:** Thêm `SheetTitle` và `SheetDescription` ẩn để fix lỗi Radix UI.
 - [x] **Real-time updates:** Tự động load lại danh sách file sau khi upload/xóa mà không cần reload trang.

### 5.3. Chấm công (Log giờ) ✅

  - [x] **Modal Log Time:** Tạo Dialog cho phép nhập số giờ và ghi chú.
  - [x] **Logic:** Server Action update bảng `TimeLog` và tính lại `totalHours` của Task (nếu cần hiển thị).

### ✅ Checkpoint GĐ 5
- [x] Comment backend (Service + Actions) hoạt động
- [x] Comment UI component hoàn chỉnh
- [x] **Tích hợp comment vào Task Detail Sheet**
- [x] **All lint/type errors fixed**
- [x] **Client-Server boundary violation fixed**
- [x] **Real-time updates working**
- [x] **Comment flow tested successfully**
- [x] Upload file thành công, hiển thị attachment (GĐ 5.2)
- [x] Log time và hiển thị tổng giờ (GĐ 5.3)

-----

## Giai đoạn 6: Quản trị & Báo cáo

**Mục tiêu:** Quản trị hệ thống và xem dashboard tổng quan.

> [!NOTE]
> Cài thêm dependencies cho Charts:
> ```bash
> npm install recharts
> ```

### 6.1. Quản lý người dùng ✅

  - [x] **Service:** `src/server/services/user.service.ts` (Query users, departments, details).
  - [x] **Actions:** `src/actions/user.ts` (CRUD: createUser, updateUser, updateUserStatus, deleteUser).
  - [x] **Page Admin:** `src/app/(dashboard)/admin/users/page.tsx` & `page-client.tsx`.
  - [x] **Components:**
      - `UserList`: Bảng danh sách người dùng với stats, roles & status badges.
      - `CreateUserDialog`: Form tạo user mới với mật khẩu mặc định.
  - [x] **Chức năng:** List user, Tạo user mới, Set Role/Department, Đổi trạng thái, Xóa an toàn.
  - [x] **Security:** Kiểm tra quyền `ADMIN` ở cả tầng Server Service, Action và UI.
  - [x] **Data Integrity:** Cập nhật Prisma Schema (`onDelete: Cascade/SetNull`) để hỗ trợ xóa user có dữ liệu lịch sử.

### 6.2. Biểu đồ Dashboard ✅

  - [x] **Service:** `src/server/services/report.service.ts` (Query count task by status, workload by user).
  - [x] **UI:** Vẽ biểu đồ tròn (Task Status) và biểu đồ cột (Workload) tại trang chủ `src/app/(dashboard)/dashboard/page.tsx`.
  - [x] **Stats:** Hiển thị tổng số dự án, task và nhân sự thực tế.

### ✅ Checkpoint GĐ 6
- [x] Admin có thể quản lý users (Thêm, Sửa trạng thái, Xóa an toàn)
- [x] Dashboard hiển thị charts đúng data (Task distribution, User workload)
- [x] Non-admin không truy cập được trang quản trị users



-----

## Giai đoạn 7: Kiểm thử, Tối ưu & Triển khai (Production Readiness)

**Mục tiêu:** Đảm bảo hệ thống chạy ổn định, bảo mật và đạt hiệu suất cao nhất trước khi bàn giao.

### 7.1. Kiểm thử toàn diện (Testing)

- [ ] **Unit Testing (Vitest):**
  - [ ] Cấu hình môi trường test (`vitest.config.ts`, `src/test/setup.ts`).
  - [ ] Viết unit tests cho các Server Services quan trọng (Project, Task, Comment).
  - [ ] Test các hàm xử lý dữ liệu phức tạp (tính toán tiến độ, format thời gian).
- [ ] **E2E Testing (Playwright):**
  - [ ] Thiết lập Playwright và cấu hình Browser Context.
  - [ ] Test luồng nghiệp vụ chính: Đăng nhập -> Tạo Dự án -> Tạo Công việc -> Kéo thả Kanban.
  - [ ] Test phân quyền: Member không thể chỉnh sửa dự án của Member khác hoặc vào trang Admin.

### 7.2. Rà soát Bảo mật & Dữ liệu (Security & Data Integrity)

- [ ] **RBAC Audit:**
  - [ ] Rà soát tất cả Server Actions: Đảm bảo luôn check `auth()` và quyền hạn phù hợp.
  - [ ] Rà soát API Routes: Chặn truy cập trái phép bằng Middleware và logic trong code.
- [ ] **Input Validation:**
  - [ ] Kiểm tra lại tất cả Zod Schemas để tránh Injection hoặc dữ liệu rác.
  - [ ] Đảm bảo file upload được giới hạn dung lượng và đúng định dạng (Mime-type checking).
- [ ] **Prisma Review:**
  - [ ] Kiểm tra các quan hệ `onDelete`: Tránh mồ côi dữ liệu hoặc xóa nhầm dữ liệu quan trọng.
  - [ ] Đánh Index cho các cột thường xuyên tìm kiếm (`assigneeId`, `projectId`, `status`).

### 7.3. Tối ưu hóa Hiệu suất (Performance & UX)

- [ ] **Lighthouse Audit:**
  - [ ] Đạt điểm Performance > 90 trên cả Mobile và Desktop.
  - [ ] Tối ưu hóa Images bằng `next/image` và kích thước file đính kèm.
- [ ] **Frontend Optimization:**
  - [ ] Áp dụng Skeleton Loading cho tất cả các trang fetching data.
  - [ ] Lazy load các component nặng (Charts, Kanban Board) khi cần thiết.
  - [ ] Tránh N+1 query tại tầng Server bằng cách sử dụng `include` hợp lý trong Prisma.
- [ ] **SEO & Branding:**
  - [ ] Cài đặt Metadata động cho từng trang (Dynamic Title/Description).
  - [ ] Hoàn thiện Favicon, Social Open Graph images.

### 7.4. Triển khai & CI/CD (Deployment)

- [ ] **CI Pipeline (Github Actions):**
  - [ ] Tự động chạy `npm run lint` và `vitest` khi tạo Pull Request.
  - [ ] Tự động chạy `npm run build` để kiểm tra lỗi biên dịch.
- [ ] **Production Environment:**
  - [ ] Setup Production Database trên Supabase (Transaction mode).
  - [ ] Cấu hình Vercel: Environment variables, Custom domain, SSL.
  - [ ] Thiết lập Monitoring: Vercel Speed Insights, Sentry (nếu cần).

### ✅ Checkpoint GĐ 7 (Final Delivery)
- [ ] 100% Critical paths được cover bởi test
- [ ] Không còn lỗi Lint hoặc TypeScript
- [ ] Build Production thành công và chạy mượt mà trên môi trường thật
- [ ] Tài liệu hướng dẫn sử dụng/setup hoàn chỉnh

-----

## Mẹo thực hiện

1.  **Server Actions trước, UI sau:** Luôn viết hàm trong `src/actions/...` và test bằng console log hoặc script nhỏ trước khi gắn vào UI. Điều này giúp tách biệt logic và giao diện.

2.  **Type Safety:** Tận dụng tối đa `Prisma.ProjectGetPayload` hoặc `Prisma.TaskCreateInput` để không phải define lại type thủ công.

3.  **Shadcn UI:** Đừng sửa core component trong `components/ui` quá nhiều. Hãy wrap chúng lại hoặc custom thông qua `className`.

4.  **Lazy Install Dependencies:** Chỉ cài thư viện khi thực sự cần (VD: @dnd-kit khi làm Kanban, recharts khi làm Dashboard). Giảm complexity ban đầu.

5.  **Commit thường xuyên:** Mỗi checkpoint hoàn thành nên có 1 commit rõ ràng. Dễ rollback nếu có vấn đề.

6.  **Demo sớm:** Sau GĐ 4A đã có thể demo cho stakeholder với List View. Không cần đợi Kanban hoàn thiện.
