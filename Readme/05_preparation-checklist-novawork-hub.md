# Danh sách chuẩn bị triển khai NovaWork Hub (Optimized Checklist)

Tài liệu này liệt kê toàn diện các tài nguyên, tài khoản dịch vụ, cấu hình môi trường và quy trình DevOps cần thiết trước khi bắt đầu code.

---

## 1. Hạ tầng & Dịch vụ (Infrastructure)

### 1.1. Database (Supabase - Postgres)
*Lưu ý: Next.js Server Components tạo nhiều kết nối ngắn hạn, bắt buộc dùng Connection Pooling.*

- [ ] **Tạo Supabase Project:**
  - Region: Singapore (hoặc Tokyo/Mumbai tùy vị trí khách hàng).
  - Copy các Key: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

- [ ] **Lấy Connection Strings (Quan trọng):**
  - Vào *Settings > Database > Connection pooling*.
  - **`DATABASE_URL` (Transaction Mode - Port 6543):** Dùng cho ứng dụng chạy chính (Prisma Client). Giúp tránh lỗi "Too many connections".
  - **`DIRECT_URL` (Session Mode - Port 5432):** Dùng cho Prisma Migration (lệnh `prisma migrate`).

### 1.2. Authentication (Auth.js v5)
- [ ] **Google Cloud Console:**
  - Tạo Credentials (OAuth Client ID).
  - **Authorized Javascript Origins:** `http://localhost:3000` (Local) và `https://your-domain.vercel.app` (Production).
  - **Authorized redirect URI:**
    - Local: `http://localhost:3000/api/auth/callback/google`
    - Prod: `https://your-domain.vercel.app/api/auth/callback/google`
  - Lấy `AUTH_GOOGLE_ID` và `AUTH_GOOGLE_SECRET`.

- [ ] **Auth Secret:**
  - Chạy lệnh: `openssl rand -base64 33` -> Lưu làm `AUTH_SECRET`.

### 1.3. Object Storage (File đính kèm)
*Khuyên dùng Supabase Storage cho đồng bộ, hoặc AWS S3/R2 nếu muốn tách biệt.*

- [ ] **Nếu dùng Supabase Storage:**
  - Tạo bucket: `novawork-uploads`.
  - Config Policy (RLS): Public Read (để xem ảnh), Authenticated Upload (để user up file).

- [ ] **Nếu dùng R2/S3:**
  - Lấy `Access Key`, `Secret Key`, `Bucket Name`, `Region`, `Endpoint`.

### 1.4. Email & Monitoring (Tiện ích mở rộng)
- [ ] **Email (Resend):**
  - Đăng ký tài khoản, verify domain công ty.
  - Lấy API Key.
- [ ] **Monitoring (Sentry):** *Bắt buộc cho Production.*
  - Tạo project Next.js trong Sentry.
  - Lấy `SENTRY_AUTH_TOKEN` và `SENTRY_DSN` để bắt lỗi frontend/backend.

---

## 2. Cấu hình Biến môi trường (.env)

Tạo file `.env` (Local) và chuẩn bị add vào **Vercel Project Settings** (Production).

```bash
# --- APP CORE ---
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Đổi thành domain thật khi deploy
NODE_ENV="development"

# --- DATABASE (Supabase Pooling) ---
# Kết nối qua Transaction Pooler (Port 6543) - Dùng cho App
DATABASE_URL="postgres://[user]:[password]@[aws-0-ap-southeast-1.pooler.supabase.com:6543/](https://aws-0-ap-southeast-1.pooler.supabase.com:6543/)[db_name]?pgbouncer=true"

# Kết nối trực tiếp (Port 5432) - Dùng cho Migration
DIRECT_URL="postgres://[user]:[password]@aws-0-ap-southeast-1.supabase.co:5432/[db_name]"

# --- AUTHENTICATION (Auth.js) ---
AUTH_SECRET="<generated-secret-string>"
AUTH_URL="http://localhost:3000" # Vercel tự động set cái này, nhưng local cần khai báo

# Google OAuth
AUTH_GOOGLE_ID="<client-id>"
AUTH_GOOGLE_SECRET="<client-secret>"

# --- STORAGE (Supabase) ---
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
# SUPABASE_SERVICE_ROLE_KEY="..." # Chỉ dùng nếu cần admin rights phía server

# --- EMAIL ---
RESEND_API_KEY="re_..."
EMAIL_FROM="NovaWork <system@yourdomain.com>"

# --- MONITORING (Optional but Recommended) ---
# SENTRY_DSN="..."
````

-----

## 3\. Quy trình DevOps & Deployment

### 3.1. Git & Quality Control (Husky)

Cấu hình để chặn commit lỗi.

  - [ ] Cài đặt Husky + Lint-staged.
  - [ ] Rule:
      - `pre-commit`: Chạy `eslint` và `prettier`.
      - `commit-msg`: Chạy `commitlint` (đảm bảo format: `feat: add task`).

### 3.2. Deployment (Vercel)

  - [ ] Đăng ký tài khoản Vercel (kết nối GitHub).
  - [ ] Tạo Project mới -\> Import repo `novawork-hub`.
  - [ ] **Environment Variables:** Copy toàn bộ nội dung `.env` (trừ các biến local) vào phần Settings của Vercel.
  - [ ] **Build Command:** Mặc định của Next.js (`next build`).

-----

## 4\. Tài nguyên Giao diện (Design Assets)

  - [ ] **Logo:** 2 phiên bản (Full có chữ & Icon).
  - [ ] **Open Graph:** Ảnh cover mặc định khi share link dự án (Size 1200x630).
  - [ ] **Color Palette (Tailwind):**
      - Xác định màu Primary (VD: Blue-600) cho Light Mode.
      - Xác định màu Primary cho Dark Mode (thường nhạt hơn, VD: Blue-500).

-----

## 5\. Dữ liệu khởi tạo (Seed Data)

Chuẩn bị file `prisma/seed.ts` để tạo dữ liệu mẫu cho môi trường Dev.

  - [ ] **System Roles:** Admin, PM, Member.
  - [ ] **Master Data:**
      - Phòng ban (Departments).
      - Loại dự án (Project Types).
  - [ ] **Dummy Data (Chỉ dùng cho Local Dev):**
      - Tạo script để fake 5 users, 2 dự án, 10 tasks để test giao diện Kanban/List ngay khi code xong.

-----

## 6\. Kế hoạch thực hiện (Step-by-Step)

1.  **Khởi tạo:** `npx create-next-app@latest novawork-hub --typescript --tailwind --eslint`
2.  **Cài đặt thư viện:**
      - Core: `pnpm add next-auth@beta @prisma/client @tanstack/react-query zustand date-fns lucide-react clsx tailwind-merge`
      - UI: `npx shadcn-ui@latest init` (Sau đó add button, input, sheet...)
      - Dev: `pnpm add -D prisma husky @commitlint/config-conventional @commitlint/cli`
3.  **Database:**
      - Copy schema vào `prisma/schema.prisma`.
      - Chạy `npx prisma migrate dev --name init`.
4.  **Development:** Bắt đầu code từ Layout -\> Auth -\> Dashboard -\> Project -\> Task.
