# Cấu trúc Database (Prisma Schema) cho NovaWork Hub

Tài liệu này mô tả chi tiết mô hình dữ liệu (Schema) sử dụng **Prisma ORM**. Cấu trúc này đã được tối ưu cho:
- **Auth.js (NextAuth v5)**: Tích hợp sẵn bảng Account/Session.
- **Kanban Performance**: Hỗ trợ sắp xếp task.
- **S3 Storage**: Quản lý file key.
- **Filtering**: Indexing các trường quan trọng.

---

## 1. Enums (Định nghĩa kiểu dữ liệu liệt kê)

Giúp đảm bảo tính nhất quán dữ liệu ngay từ cấp database (PostgreSQL).

```prisma
// Vai trò người dùng
enum UserRole {
  ADMIN
  PM
  MEMBER
  VIEWER
}

// Trạng thái tài khoản
enum UserStatus {
  ACTIVE
  INACTIVE
  LOCKED
}

// Trạng thái dự án
enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  ON_HOLD
  DONE
  CANCELED
}

// Độ ưu tiên (Dùng chung cho Project & Task)
enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

// Trạng thái Task
enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  // Có thể thêm REOPEN nếu cần
}

// Loại form nội bộ
enum FormType {
  LEAVE_REQUEST      // Xin nghỉ
  EQUIPMENT_REQUEST  // Cấp thiết bị
  FEEDBACK           // Góp ý
  BUG_INTERNAL       // Báo lỗi hệ thống
  OTHER
}

// Trạng thái Form
enum FormStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELED
}
````

-----

## 2\. Nhóm Auth & User (Tương thích Auth.js)

```prisma
model User {
  id            String    @id @default(cuid()) // Dùng CUID thân thiện hơn UUID
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?   // Avatar URL
  password      String?   // Hash password (null nếu dùng OAuth)
  
  role          UserRole   @default(MEMBER)
  status        UserStatus @default(ACTIVE)
  
  // Quan hệ
  departmentId  String?
  department    Department? @relation(fields: [departmentId], references: [id])
  
  accounts      Account[]
  sessions      Session[]
  
  // Quan hệ nghiệp vụ
  managedProjects Project[]     @relation("ProjectManager")
  assignedTasks   Task[]        @relation("TaskAssignee")
  reportedTasks   Task[]        @relation("TaskReporter")
  comments        Comment[]
  timeLogs        TimeLog[]
  formsRequested  InternalForm[] @relation("FormRequester")
  formsApproved   InternalForm[] @relation("FormApprover")
  articles        KnowledgeArticle[]
  notifications   Notification[]
  auditLogs       AuditLog[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users") // Tên bảng trong DB là số nhiều
}

model Department {
  id          String   @id @default(cuid())
  name        String
  code        String   @unique // VD: DEV, MKT, HR
  description String?
  
  users       User[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("departments")
}

// Bảng cần thiết cho Auth.js (OAuth Google/GitHub)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
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
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

-----

## 3\. Nhóm Project & Task (Core Business)

```prisma
model Project {
  id          String        @id @default(cuid())
  name        String
  code        String        @unique // VD: PRJ-001
  slug        String?       @unique // VD: du-an-website-thuong-mai
  description String?       @db.Text
  clientName  String?
  
  status      ProjectStatus @default(PLANNING)
  priority    Priority      @default(MEDIUM)
  
  startDate   DateTime?
  dueDate     DateTime?
  completedAt DateTime?
  budget      Decimal?      @db.Decimal(10, 2)

  // Người quản lý (PM)
  pmId        String
  pm          User          @relation("ProjectManager", fields: [pmId], references: [id])

  tasks       Task[]
  attachments Attachment[]
  
  // Nếu cần quản lý member chi tiết hơn (nhiều role trong project), 
  // dùng bảng trung gian ProjectMember. Ở đây demo đơn giản hóa.
  members     ProjectMember[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([status])
  @@index([pmId])
  @@map("projects")
}

model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  role      String   @default("MEMBER") // Có thể chuyển thành Enum nếu cứng

  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  joinedAt  DateTime @default(now())

  @@unique([projectId, userId]) // Một user chỉ join project 1 lần
  @@map("project_members")
}

model Task {
  id            String      @id @default(cuid())
  title         String
  description   String?     @db.Text // Hỗ trợ HTML/Markdown dài
  
  status        TaskStatus  @default(TODO)
  priority      Priority    @default(MEDIUM)
  type          String?     // bug, feature, meeting... (Nên dùng Enum nếu ít thay đổi)
  
  // Logic Kanban
  position      Float       @default(0) // Dùng số thực để dễ chèn giữa (lexorank)

  startDate     DateTime?
  dueDate       DateTime?
  estimateHours Float?      @default(0)
  
  // Quan hệ
  projectId     String
  project       Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  assigneeId    String?
  assignee      User?       @relation("TaskAssignee", fields: [assigneeId], references: [id])
  
  reporterId    String
  reporter      User        @relation("TaskReporter", fields: [reporterId], references: [id])

  subtasks      TaskChecklistItem[]
  comments      Comment[]
  timeLogs      TimeLog[]
  attachments   Attachment[]

  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([projectId, status]) // Tối ưu filter board
  @@index([assigneeId])
  @@map("tasks")
}

model TaskChecklistItem {
  id        String   @id @default(cuid())
  title     String
  isDone    Boolean  @default(false)
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@map("task_checklist_items")
}
```

-----

## 4\. Nhóm Tương tác & Time Tracking

```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("comments")
}

model TimeLog {
  id        String   @id @default(cuid())
  hours     Float    // Số giờ log (VD: 1.5)
  date      DateTime @default(now()) // Ngày thực hiện
  note      String?  @db.Text
  
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, date]) // Tối ưu report timesheet
  @@map("time_logs")
}
```

-----

## 5\. Nhóm Tiện ích (Forms, Files, Knowledge)

```prisma
model InternalForm {
  id          String     @id @default(cuid())
  type        FormType
  title       String
  description String     @db.Text
  status      FormStatus @default(PENDING)
  
  reason      String?    // Lý do duyệt/từ chối
  
  requesterId String
  requester   User       @relation("FormRequester", fields: [requesterId], references: [id])
  
  approverId  String?
  approver    User?      @relation("FormApprover", fields: [approverId], references: [id])

  attachments Attachment[]

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("internal_forms")
}

model Attachment {
  id          String   @id @default(cuid())
  fileName    String
  fileUrl     String   // Public URL để hiển thị
  fileKey     String   // S3 Key để xóa/quản lý
  fileType    String?  // MIME type
  fileSize    Int?     // Bytes

  // Polymorphic relations (Optional relations)
  taskId         String?
  task           Task?         @relation(fields: [taskId], references: [id], onDelete: SetNull)
  
  projectId      String?
  project        Project?      @relation(fields: [projectId], references: [id], onDelete: SetNull)
  
  internalFormId String?
  internalForm   InternalForm? @relation(fields: [internalFormId], references: [id], onDelete: SetNull)
  
  uploaderId     String? // Có thể thêm relation tới User nếu cần track ai up

  createdAt      DateTime @default(now())

  @@map("attachments")
}

model KnowledgeArticle {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String   @db.Text
  isPublic  Boolean  @default(false) // Công khai cho toàn cty hay nháp
  tags      String[] // Prisma hỗ trợ mảng string (trên Postgres)

  authorId  String
  author    User     @relation(fields: [authorId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("knowledge_articles")
}

model Notification {
  id        String   @id @default(cuid())
  type      String   // ASSIGNED, MENTIONED, DEADLINE...
  title     String
  message   String?
  isRead    Boolean  @default(false)
  link      String?  // Link click vào để chuyển trang
  
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  
  @@index([userId, isRead])
  @@map("notifications")
}

model AuditLog {
  id         String   @id @default(cuid())
  action     String   // CREATE, UPDATE, DELETE
  entity     String   // TASK, PROJECT
  entityId   String
  details    Json?    // Lưu thay đổi: { old: "A", new: "B" }
  
  actorId    String
  actor      User     @relation(fields: [actorId], references: [id])

  createdAt  DateTime @default(now())

  @@map("audit_logs")
}
```

## 6\. Lưu ý khi triển khai

1.  **CUID vs UUID:** Sử dụng `cuid()` làm ID mặc định vì chúng ngắn gọn hơn UUID, URL-safe và có tính thứ tự thời gian (tốt cho indexing database).
2.  **`@db.Text`:** Các trường mô tả, content bài viết bắt buộc dùng `@db.Text` để không bị giới hạn 191 ký tự (mặc định của varchar trong một số DB engine).
3.  **Quan hệ Cascade:** Chú ý `onDelete: Cascade`. Ví dụ: Khi xóa Project thì xóa hết Task. Khi xóa Task thì xóa hết Comment/Checklist. Điều này giúp database sạch sẽ, không rác.
4.  **JSON Type:** PostgreSQL hỗ trợ tốt kiểu JSON (dùng trong AuditLog hoặc Settings), nhưng nếu dùng MySQL/SQLite thì cần cân nhắc chuyển sang String.

<!-- end list -->

```
```