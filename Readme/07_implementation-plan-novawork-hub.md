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
- ✅ Giao diện dark mode đẹp mắt
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
- ✅ Giao diện dark mode đẹp mắt
- ✅ Hiển thị tên app và mô tả
- ✅ Kiểm tra trạng thái đăng nhập
- ✅ **Chưa login:** Hiển thị nút "Đăng nhập" + "Đăng ký"
- ✅ **Đã login:** Hiển thị nút "Vào Dashboard" + tên user
- ✅ Hiển thị features của app (Quản lý Dự án, Task, Cộng tác)

**Lưu ý về Route:**
- Trang `/` nằm trong `publicRoutes` của middleware → **Không yêu cầu đăng nhập**
- User chưa login vẫn xem được homepage

---

### 2.5. Dashboard Layout (Frontend)

#### Bước 1: Tạo Menu Config

**File `src/constants/menus.ts`:**
```typescript
import {
    Home,
    FolderKanban,
    CheckSquare,
    Users,
    Settings,
    Shield,
    type LucideIcon,
} from "lucide-react";

export interface MenuItem {
    title: string;
    href: string;
    icon: LucideIcon;
    adminOnly?: boolean;
}

export const mainMenuItems: MenuItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Dự án", href: "/projects", icon: FolderKanban },
    { title: "Công việc", href: "/tasks", icon: CheckSquare },
    { title: "Nhân sự", href: "/users", icon: Users },
];

export const adminMenuItems: MenuItem[] = [
    { title: "Quản trị", href: "/admin", icon: Shield, adminOnly: true },
    { title: "Cài đặt", href: "/settings", icon: Settings },
];
```

---

#### Bước 2: Tạo Sidebar Component

**File `src/components/layout/main-sidebar.tsx`:**
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { mainMenuItems, adminMenuItems } from "@/constants/menus";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MainSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN";

    const allMenuItems = isAdmin
        ? [...mainMenuItems, ...adminMenuItems]
        : [...mainMenuItems, ...adminMenuItems.filter((item) => !item.adminOnly)];

    return (
        <aside className="w-64 border-r bg-card h-screen sticky top-0">
            <div className="p-4 border-b">
                <h1 className="text-xl font-bold">NovaWork Hub</h1>
            </div>
            <ScrollArea className="h-[calc(100vh-65px)]">
                <nav className="p-4 space-y-1">
                    {allMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </ScrollArea>
        </aside>
    );
}
```

---

#### Bước 3: Tạo Header Component

**File `src/components/layout/header.tsx`:**
```tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const { data: session } = useSession();
    const { setTheme, theme } = useTheme();

    return (
        <header className="h-16 border-b bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between h-full px-6">
                <div>{/* Breadcrumb hoặc title sẽ thêm sau */}</div>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        {session?.user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline">
                                    {session?.user?.name || "User"}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Hồ sơ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
```

---

#### Bước 4: Tạo Dashboard Layout

**File `src/app/(dashboard)/layout.tsx`:**
```tsx
import { MainSidebar } from "@/components/layout/main-sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <MainSidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
```

---

#### Bước 5: Tạo trang Dashboard

**File `src/app/(dashboard)/page.tsx`:**
```tsx
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
    const session = await auth();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">
                Xin chào, {session?.user?.name || "User"}! 👋
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Dự án đang hoạt động
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">--</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Công việc của tôi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">--</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Hoàn thành hôm nay
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">--</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Quá hạn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-destructive">--</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
```

---

### 2.6. Checklist thực hiện

  - [ ] **Cài dependencies:** `@auth/prisma-adapter`, `next-themes`
  - [ ] **Config Auth:** Tạo `src/lib/auth.ts` với CredentialsProvider và GoogleProvider
  - [ ] **API Route:** Tạo `src/app/api/auth/[...nextauth]/route.ts`
  - [ ] **Type definitions:** Tạo `src/types/next-auth.d.ts` mở rộng types
  - [ ] **Middleware:** Tạo `middleware.ts` để bảo vệ routes
  - [ ] **Providers Wrapper:** Tạo `src/providers/app-provider.tsx`
  - [ ] **Root Layout:** Cập nhật `src/app/layout.tsx` với AppProvider
  - [ ] **Login Page:** Tạo `src/app/login/page.tsx`
  - [ ] **Menu Config:** Tạo `src/constants/menus.ts`
  - [ ] **Sidebar:** Tạo `src/components/layout/main-sidebar.tsx`
  - [ ] **Header:** Tạo `src/components/layout/header.tsx`
  - [ ] **Dashboard Layout:** Tạo `src/app/(dashboard)/layout.tsx`
  - [ ] **Dashboard Page:** Tạo `src/app/(dashboard)/page.tsx`

---

### ✅ Checkpoint GĐ 2

| Task | Status |
|------|--------|
| `@auth/prisma-adapter` cài đặt | ⬜ |
| Auth config with Prisma 7 Driver Adapter | ⬜ |
| Login/Logout hoạt động (Credentials) | ⬜ |
| Google OAuth hoạt động (optional) | ⬜ |
| Middleware bảo vệ `/dashboard` | ⬜ |
| Sidebar hiển thị đúng menu theo role | ⬜ |
| Theme toggle (dark/light) | ⬜ |
| `npm run build` passed | ⬜ |

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
