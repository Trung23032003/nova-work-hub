# Hướng dẫn Thiết kế UI/UX - NovaWork Hub (Figma Guide)

Tài liệu này định hướng cấu trúc layout, hệ thống thành phần (components) và các màn hình chức năng chính để Designer thực hiện trên Figma. Thiết kế này được tối ưu hóa cho **Shadcn UI** và **Tailwind CSS**.

---

## 1. Thiết lập Design System (Foundation)

*Mục tiêu: Đảm bảo thiết kế đồng bộ với thư viện UI sẽ sử dụng khi code.*

### 1.1. Grid & Layout
* **Desktop Frame:** 1440px (Chuẩn thiết kế Web App).
* **Grid System:** 12 cột (Columns), Gutter 24px, Margin 40px.
* **Sidebar Width:** Cố định `256px` (tương đương `w-64` trong Tailwind).
* **Header Height:** Cố định `64px` (`h-16`).
* **Spacing Base:** 4px (Theo chuẩn Tailwind: 4, 8, 12, 16, 24, 32...).

### 1.2. Typography (Font Family: Inter)
*Sử dụng thang đo chuẩn của Tailwind.*

* **Display/H1:** 30px / Bold (text-3xl) - *Tiêu đề trang*.
* **H2:** 24px / Semibold (text-2xl) - *Tiêu đề section*.
* **H3:** 20px / Semibold (text-xl) - *Tiêu đề Card/Modal*.
* **Body:** 14px / Regular (text-sm) - *Size chữ mặc định của Shadcn*.
* **Small/Caption:** 12px / Medium (text-xs) - *Metadata, ngày tháng*.

### 1.3. Color Palette (Slate & Blue)
* **Primary:** Blue-600 (`#2563EB`) - *Button chính, Active state*.
* **Background:**
    * Page: Slate-50 (`#F8FAFC`) - *Màu nền tổng thể*.
    * Surface: White (`#FFFFFF`) - *Nền của Card, Sidebar*.
* **Text:**
    * Primary: Slate-900 (`#0F172A`).
    * Muted: Slate-500 (`#64748B`).
* **Border:** Slate-200 (`#E2E8F0`).
* **Status (Semantic):**
    * Done/Success: Green-500.
    * Warning/Review: Amber-500.
    * Error/Bug: Red-500.

---

## 2. Bố cục Layout Tổng quát (App Shell)

Hệ thống sử dụng **Sidebar Layout** cố định bên trái.

### 2.1. Sidebar (Left - Width: 256px)
Bố cục dọc, nền trắng, border phải:
1.  **Brand Logo:** Logo NovaWork + Tên App (Cao 64px, căn giữa dọc).
2.  **Main Navigation (Menu):**
    * Dashboard (Icon: Home).
    * Projects (Icon: Folder).
    * Tasks (Icon: CheckSquare) - "My Tasks".
    * Calendar (Icon: Calendar).
    * Knowledge Base (Icon: BookOpen).
    * Internal Forms (Icon: FileText).
3.  **System Group:** (Phân cách bằng đường kẻ mờ)
    * Admin Settings (Icon: Settings).
    * Users (Icon: Users).
4.  **User Profile (Footer):**
    * Avatar + Tên + Email (Click mở menu Logout).

### 2.2. Header (Top - Height: 64px)
Nằm bên phải Sidebar, nền trắng, border dưới:
1.  **Left Area:**
    * **Sidebar Toggle:** (Chỉ hiện ở Mobile).
    * **Breadcrumbs:** VD: `Projects > Website E-commerce > Tasks`.
2.  **Right Area:**
    * **Global Search:** Input field "Search..." (Cmd+K).
    * **Theme Toggle:** Icon Sun/Moon.
    * **Notifications:** Icon Chuông (Có chấm đỏ).

### 2.3. Main Content Area
* **Padding:** `p-6` (24px) hoặc `p-8` (32px).
* **Background:** Slate-50.
* **Scroll:** Nội dung cuộn độc lập với Sidebar.

---

## 3. Các Màn hình Chức năng Chính (Key Screens)

### 3.1. Dashboard (Tổng quan)
Hiển thị dạng **Grid Widgets**.
* **Row 1 (Stats Cards):** 4 thẻ số liệu (Total Projects, Tasks Due, Hours Logged, Forms Pending).
* **Row 2 (Charts):**
    * Left (2/3): Biểu đồ cột (Workload tuần này).
    * Right (1/3): Biểu đồ tròn (Trạng thái Task).
* **Row 3 (Lists):**
    * Recent Projects (List đơn giản).
    * My Overdue Tasks (Task quá hạn của tôi - Highlight đỏ).

### 3.2. Projects List (Danh sách dự án)
* **Header:** Title "Projects" + Button "New Project" (Primary).
* **Toolbar:** Search input + Filter (Status, PM) + Sort + View Switcher (Grid/Table).
* **Grid View:** Card dự án hiển thị Tên, Client, Progress Bar, Avatar Members, Status Badge.
* **Table View:** Các cột (Name, Code, Status, PM, Due Date, Budget).

### 3.3. Project Detail (Chi tiết dự án)
Sử dụng Layout **Tabs Navigation**.
* **Header:** Tên dự án to, Breadcrumb, Status Badge, Project Members.
* **Tabs Menu:**
    1.  **Overview:** Description, Tiến độ chung, Milestone.
    2.  **Tasks:** (Chuyển sang màn hình Kanban/List).
    3.  **Files:** Grid các file đính kèm.
    4.  **Members:** Danh sách thành viên & Role.
    5.  **Settings:** (Chỉ hiện cho PM/Admin) Sửa tên, Archive.

### 3.4. Task Board (Kanban View)
* **Layout:** Cuộn ngang (Horizontal Scroll).
* **Columns:** Todo, In Progress, Review, Done. (Header cột có đếm số task).
* **Task Card (Component):**
    * Header: Tags (Bug/Feature).
    * Body: Title (Text).
    * Footer: Avatar Assignee, Icon Priority (Mũi tên lên/xuống), Due Date (Màu đỏ nếu trễ), Mã Task (VD: PRJ-12).

### 3.5. Task Detail (Slide-over Sheet)
*Lưu ý: Thiết kế dạng Drawer trượt từ phải sang, không phải trang mới.*
* **Header:** Mã Task, Nút Close (X), Nút Share/Menu (...)
* **Main Content (Left):**
    * Title (Input lớn).
    * Description (Rich Text Editor).
    * Checklist (Subtasks): Checkbox + Tên.
    * Attachments: Khu vực upload file.
    * Comments: Tab lịch sử hoạt động và ô nhập bình luận.
* **Sidebar Properties (Right):**
    * Status (Select).
    * Priority (Select).
    * Assignee (User Select).
    * Start/Due Date (Date Picker).
    * Time Tracking (Số giờ đã log + Nút Log Time).

### 3.6. Admin & Users
* **User List:** DataTable có các cột: Name (kèm Avatar), Email, Role (Badge), Status, Actions (Edit/Delete).
* **Add User Modal:** Popup form nhập thông tin cơ bản.

---

## 4. Components Checklist (Assets cần vẽ)

Designer cần tạo các Master Components này trước để reuse (dựa trên Shadcn UI):

1.  **Buttons:**
    * Primary (Blue background).
    * Secondary (White background, Gray border).
    * Ghost (Hover only).
    * Destructive (Red background).
2.  **Inputs:** Default, Error state, Disabled, With Icon.
3.  **Avatars:** Circle, có ảnh hoặc Initials (VD: "ND").
4.  **Badges/Tags:** Bo góc tròn, màu nền nhạt + chữ đậm (Dùng cho Status, Priority).
5.  **Task Card:** States: Default, Hover, Dragging (đang kéo).
6.  **Dialog/Modal:** Overlay đen mờ (opacity 50%), Box trắng căn giữa.
7.  **Sheet/Drawer:** Panel trắng trượt từ phải sang, full height, có shadow.

---

## 5. Lưu ý quan trọng cho Designer

1.  **Icons:** Sử dụng bộ **Lucide Icons** (có plugin trên Figma) để đồng bộ với Code.
2.  **Empty States:** Luôn thiết kế trạng thái khi chưa có dữ liệu (VD: Project list trống, chưa có Task nào).
3.  **Responsive:** Ưu tiên Desktop, nhưng cần Mockup Mobile cho Navigation (Hamburger menu) và chuyển Table thành Card view.
4.  **Auto Layout:** Sử dụng Auto Layout trong Figma để mô phỏng Flexbox của CSS, giúp Developer dễ inspect thông số padding/gap.