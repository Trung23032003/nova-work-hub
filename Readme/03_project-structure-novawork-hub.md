# Cấu trúc dự án NovaWork Hub (Updated)

Dự án NovaWork Hub sử dụng Next.js (App Router). Cấu trúc này tối ưu hóa cho việc tách biệt Server Actions, tái sử dụng Type và quản lý Providers tập trung.

---

## 1. Thư mục gốc

- `src/` (Source code chính)
  - `actions/`
  - `app/`
  - `components/`
  - `constants/`
  - `hooks/`
  - `lib/`
  - `providers/`
  - `server/`
  - `types/`
- `prisma/`
- `public/`
- `middleware.ts` (File middleware gốc)
- `.env.example`

---

## 2. `src/app` – Routes

### 2.1. Layout & Root

- `src/app/layout.tsx` (Root Layout - Import font, global CSS)
- `src/app/globals.css`
- `src/app/page.tsx` (Redirect to Dashboard or Landing)

### 2.2. Nhóm Auth `(auth)`
*Dùng group route để tách biệt layout login với layout dashboard.*

- `src/app/(auth)/layout.tsx` (Layout căn giữa, background đơn giản)
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/error/page.tsx`

### 2.3. Nhóm Ứng dụng `(dashboard)`
*Layout chính có Sidebar, Navbar.*

- `src/app/(dashboard)/layout.tsx` (App Shell Provider)
- `src/app/(dashboard)/page.tsx` (Dashboard tổng quan)

**Projects Module:**
- `src/app/(dashboard)/projects/page.tsx` (List)
- `src/app/(dashboard)/projects/[projectId]/layout.tsx` (Layout riêng cho detail project: Tab navigation)
- `src/app/(dashboard)/projects/[projectId]/page.tsx` (Overview)
- `src/app/(dashboard)/projects/[projectId]/tasks/page.tsx` (Task view trong project)
- `src/app/(dashboard)/projects/[projectId]/settings/page.tsx`

**Global Modules:**
- `src/app/(dashboard)/tasks/page.tsx` (My Tasks)
- `src/app/(dashboard)/calendar/page.tsx`
- `src/app/(dashboard)/reports/page.tsx`
- `src/app/(dashboard)/knowledge-base/page.tsx`

**Admin Module:**
- `src/app/(dashboard)/admin/users/page.tsx`
- `src/app/(dashboard)/admin/settings/page.tsx`

### 2.4. API Routes
*Chỉ dùng cho các tác vụ đặc thù, còn lại ưu tiên Server Actions.*

- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/upload/route.ts` (Endpoint upload file)
- `src/app/api/webhooks/route.ts` (Nếu tích hợp bên thứ 3)

---

## 3. `src/actions` – Server Actions
*Chứa các hàm mutation gọi trực tiếp từ Form Client. Luôn trả về Promise.*

- `src/actions/auth.ts` (Login, Logout)
- `src/actions/project.ts` (createProject, updateProjectStatus...)
- `src/actions/task.ts` (createTask, moveTask, addComment...)
- `src/actions/user.ts` (updateProfile...)

---

## 4. `src/components` – UI Library

### 4.1. `ui` (Base Components - Shadcn)
- `src/components/ui/button.tsx`, `input.tsx`, `dialog.tsx`...
- `src/components/ui/data-table/` (Cấu hình Table nâng cao: sort, filter)
- `src/components/ui/date-picker.tsx`
- `src/components/ui/editor.tsx` (Rich Text Editor wrapper)

### 4.2. `layout`
- `src/components/layout/main-sidebar.tsx`
- `src/components/layout/user-nav.tsx` (Dropdown avatar user)
- `src/components/layout/mode-toggle.tsx` (Dark/Light switch)

### 4.3. `features` (Domain Components)
*Tổ chức theo tính năng để dễ tìm kiếm.*

- `src/components/features/projects/`
  - `project-card.tsx`
  - `project-form.tsx`
- `src/components/features/tasks/`
  - `task-kanban-board.tsx`
  - `task-item.tsx`
  - `task-detail-sheet.tsx` (Drawer xem nhanh task)
  - `task-comment-section.tsx`
- `src/components/features/reports/`
  - `overview-chart.tsx`

---

## 5. `src/server` – Data Access Layer
*Chứa logic truy vấn DB thuần túy, tái sử dụng cho cả API và Actions.*

- `src/server/db.ts` (Prisma instance)
- `src/server/services/project.service.ts`
- `src/server/services/task.service.ts`
- `src/server/services/report.service.ts`

---

## 6. `src/lib` & `src/constants`

- `src/lib/utils.ts` (cn helper)
- `src/lib/auth.ts` (Auth options config)
- `src/lib/zod-schemas.ts` (Tập hợp toàn bộ schema validation)
- `src/constants/app-config.ts` (Tên app, mô tả)
- `src/constants/menus.ts` (Cấu hình sidebar items)
- `src/constants/enums.ts` (Mapping status sang màu sắc, label tiếng Việt)

---

## 7. `src/types`
*Định nghĩa Type/Interface dùng chung (không phụ thuộc Prisma).*

- `src/types/next-auth.d.ts` (Extend session type)
- `src/types/api.ts` (Format response chuẩn: success, data, error)
- `src/types/nav.ts` (Type cho menu navigation)

---

## 8. `src/providers`
*Các Wrapper Client Component.*

- `src/providers/query-provider.tsx` (TanStack Query)
- `src/providers/theme-provider.tsx` (Next Themes)
- `src/providers/auth-provider.tsx` (SessionProvider)
- `src/providers/toast-provider.tsx` (Toaster)
- `src/providers/modal-provider.tsx` (Quản lý các modal global nếu cần)

---

## 9. Prisma & Middleware

- `prisma/schema.prisma`
- `middleware.ts`:
  - Check session.
  - Redirect user chưa login về `/login`.
  - Redirect user đã login nhưng vào `/login` về `/dashboard`.