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
└── .env                   # Environment variables (git ignored)
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

### 2.2. Cấu hình Auth.js v5 (Backend)

#### Bước 1: Tạo file cấu hình Auth

**File `src/lib/auth.ts`:**
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db"; // Sử dụng Prisma Client singleton từ GĐ 1

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma), // Prisma 7 compatible
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
});
```

> [!NOTE]
> **Giải thích cấu hình:**
> - `PrismaAdapter(prisma)`: Nhận Prisma Client từ `src/server/db.ts` đã được khởi tạo với Driver Adapter
> - `session: { strategy: "jwt" }`: Dùng JWT thay vì database sessions (nhanh hơn)
> - `callbacks`: Thêm `id` và `role` vào session để kiểm tra quyền

---

#### Bước 2: Tạo API Route

**File `src/app/api/auth/[...nextauth]/route.ts`:**
```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

---

#### Bước 3: Mở rộng TypeScript types

**File `src/types/next-auth.d.ts`:**
```typescript
import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role?: string;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            role?: string;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: string;
    }
}
```

---

#### Bước 4: Tạo Middleware bảo vệ route

**File `middleware.ts` (root folder):**
```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Những route cần login
    const protectedRoutes = ["/dashboard", "/projects", "/admin"];
    const isProtectedRoute = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );

    // Redirect về login nếu chưa đăng nhập
    if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Redirect về dashboard nếu đã login mà vào trang login
    if (isLoggedIn && nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

#### Bước 5: Cập nhật `.env`

Thêm các biến môi trường cho Google OAuth:
```env
# ===========================================
# AUTHENTICATION (Auth.js v5)
# ===========================================
AUTH_SECRET="your-random-secret-key-32-chars-min"
AUTH_URL="http://localhost:3000"

# Google OAuth (optional - bỏ qua nếu chỉ dùng Credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

> 💡 **Tạo Google OAuth credentials:**
> 1. Vào https://console.cloud.google.com/apis/credentials
> 2. Tạo OAuth 2.0 Client IDs
> 3. Thêm Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

---

### 2.3. Global Providers

#### Bước 1: Tạo Providers Wrapper

**File `src/providers/app-provider.tsx`:**
```tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                    },
                },
            })
    );

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster richColors position="bottom-right" />
                </ThemeProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
```

---

#### Bước 2: Cập nhật Root Layout

**File `src/app/layout.tsx`:**
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/providers/app-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NovaWork Hub",
    description: "Quản lý công việc hiệu quả",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={inter.className}>
                <AppProvider>{children}</AppProvider>
            </body>
        </html>
    );
}
```

---

### 2.4. Trang Login

**File `src/app/login/page.tsx`:**
```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            toast.error("Email hoặc mật khẩu không đúng!");
        } else {
            toast.success("Đăng nhập thành công!");
            router.push("/dashboard");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">NovaWork Hub</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Hoặc
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    >
                        Đăng nhập với Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
```

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
