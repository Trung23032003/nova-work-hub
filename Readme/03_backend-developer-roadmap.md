# Lộ trình Backend Developer cho Fresher

> **Mục tiêu**: Tài liệu này cung cấp lộ trình học tập chi tiết và các kiến thức cốt lõi mà một Backend Developer fresher cần nắm vững để làm việc hiệu quả trong dự án NovaWork Hub.

---

## 📋 Mục lục

1. [Tổng quan về Backend Development](#1-tổng-quan-về-backend-development)
2. [Kiến thức nền tảng bắt buộc](#2-kiến-thức-nền-tảng-bắt-buộc)
3. [Kiến thức chuyên sâu cho dự án](#3-kiến-thức-chuyên-sâu-cho-dự-án)
4. [Lộ trình học tập 3 tháng](#4-lộ-trình-học-tập-3-tháng)
5. [Tài nguyên học tập](#5-tài-nguyên-học-tập)
6. [Checklist đánh giá năng lực](#6-checklist-đánh-giá-năng-lực)

---

## 1. Tổng quan về Backend Development

### Backend Developer làm gì?

Backend Developer chịu trách nhiệm xây dựng và duy trì **phần "sau hậu trường"** của ứng dụng:

| Nhiệm vụ | Mô tả |
|----------|-------|
| **Xử lý Logic nghiệp vụ** | Viết code xử lý các yêu cầu từ client (tạo user, xử lý đơn hàng, tính toán...) |
| **Quản lý Database** | Thiết kế, truy vấn, và tối ưu cơ sở dữ liệu |
| **Xác thực & Phân quyền** | Đảm bảo chỉ người dùng hợp lệ mới truy cập được tài nguyên |
| **Xây dựng API** | Tạo các endpoint để Frontend giao tiếp với Backend |
| **Bảo mật** | Bảo vệ dữ liệu và ngăn chặn các cuộc tấn công |

### Stack công nghệ trong dự án NovaWork Hub

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│              Next.js 15 (React + TypeScript)                │
└─────────────────────────┬───────────────────────────────────┘
                          │ Server Actions / API Routes
┌─────────────────────────▼───────────────────────────────────┐
│                        BACKEND                               │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│   │ Auth.js v5  │  │ Server Logic │  │  Zod Validation │   │
│   │ (Xác thực)  │  │ (Nghiệp vụ)  │  │  (Kiểm tra DL)  │   │
│   └─────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ Prisma ORM
┌─────────────────────────▼───────────────────────────────────┐
│                       DATABASE                               │
│                PostgreSQL (Supabase)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Kiến thức nền tảng bắt buộc

### 2.1. TypeScript (⭐⭐⭐⭐⭐ Quan trọng nhất)

TypeScript là ngôn ngữ chính của dự án. Bạn **PHẢI** nắm vững trước khi học các phần khác.

> 💡 **Tại sao TypeScript quan trọng?** TypeScript bổ sung **type annotations** (chú thích kiểu) vào JavaScript để giúp bạn phát hiện lỗi **trước khi chạy code**, không phải lúc production đang chạy!

---

#### 2.1.1. Basic Types - Các kiểu dữ liệu cơ bản

```typescript
// ❌ JavaScript thuần - không biết biến này chứa gì
let name = "Trung";
name = 123; // JavaScript cho phép, nhưng đây là bug tiềm ẩn!

// ✅ TypeScript - khai báo rõ ràng kiểu dữ liệu
let name: string = "Trung";
name = 123; // ❌ LỖI! TypeScript báo ngay: Type 'number' is not assignable to type 'string'
```

**Các kiểu cơ bản bạn sẽ dùng hàng ngày:**

| Kiểu | Mô tả | Ví dụ |
|------|-------|-------|
| `string` | Chuỗi văn bản | `"Hello"`, `'World'`, `` `Template` `` |
| `number` | Số (integer + float) | `42`, `3.14`, `-100` |
| `boolean` | Đúng/Sai | `true`, `false` |
| `null` | Giá trị rỗng có chủ đích | `null` |
| `undefined` | Chưa được gán giá trị | `undefined` |
| `any` | Bất kỳ kiểu nào (⚠️ **tránh dùng**) | Mọi thứ |

```typescript
// Khai báo biến với type
let userName: string = "Trung";
let userAge: number = 22;
let isActive: boolean = true;
let avatar: string | null = null; // có thể là string HOẶC null

// Array - Mảng
let scores: number[] = [85, 90, 78];
let names: string[] = ["An", "Bình", "Châu"];

// Cách viết khác cho array (Generic syntax)
let scores2: Array<number> = [85, 90, 78];
```

---

#### 2.1.2. Interface - Định nghĩa "hình dạng" của Object

**Interface** giống như một "bản thiết kế" mô tả object phải có những thuộc tính gì.

**Tại sao cần Interface?**

```typescript
// ❌ Không dùng interface - dễ sai sót
function createUser(user) {
  // Không biết user có những field gì
  // Dễ gõ sai tên field mà không biết
  console.log(user.nmae); // Gõ sai "name" thành "nmae" - không có lỗi!
}

// ✅ Dùng interface - an toàn hơn nhiều
interface User {
  id: string;
  name: string;
  email: string;
}

function createUser(user: User) {
  console.log(user.nmae); // ❌ LỖI NGAY! Property 'nmae' does not exist on type 'User'
  console.log(user.name); // ✅ OK
}
```

**Cách viết Interface:**

```typescript
// Interface cơ bản
interface User {
  id: string;
  name: string;
  email: string;
}

// Optional property - dùng dấu ? (có thể có hoặc không)
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;  // avatar có thể có hoặc không
  bio?: string;     // bio cũng optional
}

// Readonly property - không thể thay đổi sau khi tạo
interface User {
  readonly id: string; // Không thể gán lại id
  name: string;
  email: string;
}

const user: User = { id: "123", name: "Trung", email: "trung@email.com" };
user.id = "456";              // ❌ LỖI! Cannot assign to 'id' because it is a read-only property
user.name = "Trung Updated";  // ✅ OK, name không readonly
```

**Nested Interface (Interface lồng nhau):**

```typescript
// Địa chỉ là một object riêng
interface Address {
  street: string;
  city: string;
  country: string;
}

// User có chứa Address
interface User {
  id: string;
  name: string;
  email: string;
  address: Address; // Nested interface
}

// Sử dụng
const user: User = {
  id: "1",
  name: "Trung",
  email: "trung@email.com",
  address: {
    street: "123 Nguyễn Huệ",
    city: "TP.HCM",
    country: "Việt Nam",
  },
};
```

---

#### 2.1.3. Type Aliases - Đặt tên cho kiểu dữ liệu

**Type** giống interface nhưng linh hoạt hơn, có thể đặt tên cho bất kỳ kiểu nào.

```typescript
// Type cho giá trị đơn giản
type UserId = string;
type Age = number;

// Type cho Union (nhiều lựa chọn) - RẤT HAY DÙNG!
type UserRole = "ADMIN" | "PM" | "MEMBER";
type Status = "pending" | "approved" | "rejected";

// Sử dụng
let myRole: UserRole = "ADMIN";     // ✅ OK
myRole = "SUPER_ADMIN";             // ❌ LỖI! Type '"SUPER_ADMIN"' is not assignable to type 'UserRole'

// Type cho Object (giống interface)
type User = {
  id: UserId;       // Dùng type alias khác
  name: string;
  role: UserRole;   // Dùng union type
};
```

**Interface vs Type - Khi nào dùng cái nào?**

| Tình huống | Dùng | Lý do |
|------------|------|-------|
| Định nghĩa object shape | `interface` | Dễ extend, convention phổ biến |
| Union types (`"A" \| "B" \| "C"`) | `type` | Interface không hỗ trợ |
| Primitive alias (`type ID = string`) | `type` | Interface không hỗ trợ |
| Extend/mở rộng | Cả hai đều được | - |

```typescript
// Extend Interface
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

// Extend Type (dùng &)
type Animal = {
  name: string;
};
type Dog = Animal & {
  breed: string;
};
```

---

#### 2.1.4. Generics - "Template" cho Types

**Generics** cho phép bạn viết code **tái sử dụng** với nhiều kiểu dữ liệu khác nhau. Đây là khái niệm **RẤT QUAN TRỌNG** vì Prisma sử dụng Generics rất nhiều.

**Vấn đề không có Generics:**

```typescript
// ❌ Phải viết nhiều hàm cho từng kiểu - lặp lại code!
function getFirstNumber(arr: number[]): number | undefined {
  return arr[0];
}

function getFirstString(arr: string[]): string | undefined {
  return arr[0];
}

function getFirstUser(arr: User[]): User | undefined {
  return arr[0];
}

// 😤 Logic giống nhau mà phải viết 3 lần!
```

**Giải pháp với Generics:**

```typescript
// ✅ Một hàm duy nhất, hoạt động với MỌI kiểu
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// T là "placeholder" - sẽ được thay thế khi gọi hàm

// Sử dụng - chỉ định T là gì
const firstNumber = getFirst<number>([1, 2, 3]);     // T = number → trả về number | undefined
const firstString = getFirst<string>(["a", "b"]);   // T = string → trả về string | undefined
const firstUser = getFirst<User>(users);            // T = User → trả về User | undefined

// TypeScript tự suy luận kiểu (không cần viết <number>)
const firstNumber2 = getFirst([1, 2, 3]); // TypeScript tự hiểu T = number
```

**Generics trong thực tế - Prisma:**

```typescript
// Prisma dùng Generics rất nhiều!
// Khi bạn viết:
const user = await prisma.user.findUnique({
  where: { id: "123" },
});
// → TypeScript tự biết `user` có kiểu `User | null`

// Với include:
const userWithProjects = await prisma.user.findUnique({
  where: { id: "123" },
  include: { projects: true },
});
// → TypeScript tự biết `userWithProjects` có cả `projects` array!
// → Đây là sức mạnh của Generics!
```

**Generic với Constraints (giới hạn):**

```typescript
// T phải có property "id" - nếu không sẽ báo lỗi
function getItemById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

// Hoạt động với bất kỳ object nào có "id"
interface User { id: string; name: string; }
interface Product { id: string; price: number; }

const user = getItemById(users, "user-1");       // ✅ OK - User có id
const product = getItemById(products, "prod-1"); // ✅ OK - Product có id
const number = getItemById([1, 2, 3], "1");      // ❌ LỖI! number không có property "id"
```

---

#### 2.1.5. Utility Types - "Công cụ" biến đổi Types

TypeScript cung cấp sẵn các utility types giúp bạn tạo types mới từ types có sẵn. Đây là những "công cụ" bạn sẽ dùng **HÀNG NGÀY**.

**`Partial<T>` - Tất cả fields thành optional**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Khi UPDATE, không cần gửi tất cả fields
type UpdateUserInput = Partial<User>;
// → Tương đương với:
// {
//   id?: string;
//   name?: string;
//   email?: string;
//   role?: string;
// }

function updateUser(id: string, data: Partial<User>) {
  // Chỉ cần gửi những field muốn update
}

updateUser("123", { name: "New Name" }); // ✅ OK, chỉ update name
updateUser("123", { role: "ADMIN" });    // ✅ OK, chỉ update role
```

**`Omit<T, Keys>` - Bỏ đi một số fields**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;  // ⚠️ Không muốn trả về password!
  createdAt: Date;
}

// Type cho response - không có password
type UserResponse = Omit<User, "password">;
// → Tương đương:
// {
//   id: string;
//   name: string;
//   email: string;
//   createdAt: Date;
// }

// Type không có id và timestamps (dùng khi CREATE)
type CreateUserInput = Omit<User, "id" | "createdAt">;
```

**`Pick<T, Keys>` - Chỉ lấy một số fields**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  avatar: string;
  bio: string;
  createdAt: Date;
}

// Chỉ cần email và password cho login
type LoginCredentials = Pick<User, "email" | "password">;
// → Tương đương:
// {
//   email: string;
//   password: string;
// }

// Profile preview chỉ cần một số thông tin
type UserPreview = Pick<User, "id" | "name" | "avatar">;
```

**`Required<T>` - Tất cả fields thành bắt buộc**

```typescript
interface Config {
  apiUrl?: string;
  timeout?: number;
  retries?: number;
}

// Đảm bảo tất cả config đều được set
type FullConfig = Required<Config>;
// → Tất cả fields không còn optional
```

---

#### 2.1.6. Union Types & Type Guards

**Union Types - "Hoặc này, hoặc kia"**

```typescript
// Biến có thể là string HOẶC number
let id: string | number;
id = "abc";   // ✅ OK
id = 123;     // ✅ OK
id = true;    // ❌ LỖI!

// Pattern rất phổ biến cho API response
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

function fetchUser(id: string): Result<User> {
  try {
    // ... fetch user
    return { success: true, data: user };
  } catch (err) {
    return { success: false, error: "User not found" };
  }
}

// Xử lý kết quả - TypeScript hiểu từng case!
const result = fetchUser("123");
if (result.success) {
  // TypeScript biết result.data tồn tại và có kiểu User
  console.log(result.data.name);
} else {
  // TypeScript biết result.error tồn tại
  console.log(result.error);
}
```

**Type Guards - Kiểm tra kiểu tại runtime**

```typescript
// typeof guard - kiểm tra kiểu primitive
function process(value: string | number) {
  if (typeof value === "string") {
    // → TypeScript biết value là string ở đây
    console.log(value.toUpperCase());
  } else {
    // → TypeScript biết value là number ở đây
    console.log(value.toFixed(2));
  }
}

// "in" guard - kiểm tra property có tồn tại không
interface Dog {
  bark(): void;
}

interface Cat {
  meow(): void;
}

function makeSound(animal: Dog | Cat) {
  if ("bark" in animal) {
    animal.bark(); // → TypeScript biết là Dog
  } else {
    animal.meow(); // → TypeScript biết là Cat
  }
}
```

---

#### 📝 Bài tập thực hành TypeScript

Để nắm vững các khái niệm trên, hãy thử làm các bài tập sau:

**Bài 1: Tạo Interface cho Task Management**
```typescript
// TODO: Tạo interface Task với các fields:
// - id: string (readonly)
// - title: string
// - description: string (optional)
// - status: "TODO" | "IN_PROGRESS" | "DONE"
// - priority: "LOW" | "MEDIUM" | "HIGH"
// - assigneeId: string (optional)
// - createdAt: Date
// - updatedAt: Date
```

**Bài 2: Viết Generic Function**
```typescript
// TODO: Viết hàm findById<T> tìm item trong array theo id
// Hint: T phải có property "id"
```

**Bài 3: Dùng Utility Types**
```typescript
// TODO: Từ interface Task ở Bài 1, tạo:
// - CreateTaskInput (không có id, createdAt, updatedAt)
// - UpdateTaskInput (tất cả optional trừ id)
// - TaskPreview (chỉ có id, title, status)
```

---

#### Thời gian học: **1-2 tuần**

#### ✅ Checklist kiểm tra kiến thức:
- [ ] Hiểu sự khác nhau giữa `interface` và `type`
- [ ] Biết khi nào dùng optional `?` và readonly
- [ ] Viết được hàm với Generics `<T>`
- [ ] Thành thạo Utility Types: `Partial`, `Omit`, `Pick`, `Required`
- [ ] Hiểu Union Types (`A | B`) và biết cách dùng Type Guards
- [ ] Có thể đọc hiểu các type phức tạp trong Prisma

---

### 2.2. SQL & Cơ sở dữ liệu quan hệ

#### Các khái niệm cốt lõi:

| Khái niệm | Mô tả | Ví dụ |
|-----------|-------|-------|
| **Table** | Bảng chứa dữ liệu | `users`, `projects`, `tasks` |
| **Column** | Cột/thuộc tính của bảng | `id`, `email`, `name` |
| **Row** | Một bản ghi/record | Một user cụ thể |
| **Primary Key (PK)** | Khóa chính, định danh duy nhất | `id` |
| **Foreign Key (FK)** | Khóa ngoại, liên kết bảng | `project_id` trong bảng `tasks` |
| **Index** | Đánh chỉ mục để truy vấn nhanh | Index trên `email` |

#### Các loại quan hệ (Relationships):

```
1. ONE-TO-ONE (1-1)
   User ──────── Profile
   Một user có một profile

2. ONE-TO-MANY (1-n)
   Project ──────< Tasks
   Một project có nhiều tasks

3. MANY-TO-MANY (n-n)
   Users >────────< Projects
   Một user tham gia nhiều projects
   Một project có nhiều users
```

#### Các câu lệnh SQL cơ bản cần biết:

```sql
-- SELECT: Lấy dữ liệu
SELECT * FROM users WHERE role = 'ADMIN';
SELECT id, name, email FROM users ORDER BY created_at DESC LIMIT 10;

-- INSERT: Thêm dữ liệu
INSERT INTO users (id, name, email, role) 
VALUES ('uuid-123', 'Trung', 'trung@email.com', 'MEMBER');

-- UPDATE: Cập nhật dữ liệu
UPDATE users SET role = 'PM' WHERE id = 'uuid-123';

-- DELETE: Xóa dữ liệu
DELETE FROM users WHERE id = 'uuid-123';

-- JOIN: Kết hợp bảng
SELECT u.name, p.title 
FROM users u
JOIN project_members pm ON u.id = pm.user_id
JOIN projects p ON pm.project_id = p.id;
```

#### Thời gian học: **1 tuần**

---

### 2.3. Git & Version Control

```bash
# Các lệnh cần thuộc lòng
git clone <repo-url>          # Clone repo về máy
git checkout -b feature/xyz   # Tạo branch mới
git add .                     # Stage tất cả thay đổi
git commit -m "feat: add..."  # Commit với message
git push origin feature/xyz   # Push lên remote
git pull origin main          # Lấy code mới nhất
git merge main                # Merge branch main vào branch hiện tại
git rebase main               # Rebase branch hiện tại lên main
```

#### Quy ước Commit Message:
```
feat: thêm tính năng mới
fix: sửa lỗi
refactor: tái cấu trúc code
docs: cập nhật tài liệu
test: thêm/sửa test
chore: công việc khác (config, dependencies)
```

---

## 3. Kiến thức chuyên sâu cho dự án

### 3.1. Prisma ORM (⭐⭐⭐⭐⭐)

Prisma là cầu nối giữa TypeScript và PostgreSQL. Đây là công cụ **quan trọng nhất** cho Backend.

#### 3.1.1. Prisma Schema

File `prisma/schema.prisma` định nghĩa cấu trúc database:

```prisma
// Cấu hình datasource
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Cấu hình generator
generator client {
  provider = "prisma-client-js"
}

// Model User
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(MEMBER)
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  projects  ProjectMember[]
  tasks     Task[]
  comments  Comment[]

  @@map("users") // Tên bảng trong DB
}

// Model Project
model Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      ProjectStatus @default(ACTIVE)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  members     ProjectMember[]
  tasks       Task[]

  @@map("projects")
}

// Enum
enum Role {
  ADMIN
  PM
  MEMBER
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}
```

#### 3.1.2. Prisma Client - CRUD Operations

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE - Tạo mới
const newUser = await prisma.user.create({
  data: {
    email: "trung@email.com",
    name: "Trung Dang",
    password: hashedPassword,
    role: "MEMBER",
  },
});

// READ - Đọc dữ liệu
// Lấy một user
const user = await prisma.user.findUnique({
  where: { id: "user-id" },
});

// Lấy user kèm relations
const userWithProjects = await prisma.user.findUnique({
  where: { id: "user-id" },
  include: {
    projects: {
      include: {
        project: true,
      },
    },
  },
});

// Lấy nhiều users với filter
const admins = await prisma.user.findMany({
  where: { role: "ADMIN" },
  orderBy: { createdAt: "desc" },
  take: 10, // LIMIT 10
  skip: 0,  // OFFSET 0
});

// UPDATE - Cập nhật
const updatedUser = await prisma.user.update({
  where: { id: "user-id" },
  data: { role: "PM" },
});

// DELETE - Xóa
await prisma.user.delete({
  where: { id: "user-id" },
});

// UPSERT - Tạo nếu chưa có, cập nhật nếu đã tồn tại
const user = await prisma.user.upsert({
  where: { email: "trung@email.com" },
  update: { name: "Trung Updated" },
  create: {
    email: "trung@email.com",
    name: "Trung",
    password: hashedPassword,
  },
});
```

#### 3.1.3. Prisma Migrations

```bash
# Tạo migration mới sau khi thay đổi schema
npx prisma migrate dev --name add_user_avatar

# Áp dụng migration cho production
npx prisma migrate deploy

# Reset database (XÓA TOÀN BỘ DỮ LIỆU)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Mở Prisma Studio để xem database
npx prisma studio
```

#### Thời gian học: **2 tuần**

---

### 3.2. Server Actions (Next.js 15)

Server Actions thay thế API Routes truyền thống, cho phép gọi hàm server trực tiếp từ client.

#### Cấu trúc thư mục:
```
src/
├── actions/
│   ├── user.actions.ts
│   ├── project.actions.ts
│   └── task.actions.ts
```

#### Ví dụ Server Action:

```typescript
// src/actions/user.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema validation với Zod
const CreateUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(["ADMIN", "PM", "MEMBER"]).default("MEMBER"),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Return type cho action
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function createUser(
  input: CreateUserInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // 1. Kiểm tra authentication
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    // 2. Kiểm tra authorization
    if (session.user.role !== "ADMIN") {
      return { success: false, error: "Bạn không có quyền tạo user" };
    }

    // 3. Validate input
    const validatedData = CreateUserSchema.safeParse(input);
    if (!validatedData.success) {
      return { 
        success: false, 
        error: validatedData.error.errors[0].message 
      };
    }

    // 4. Kiểm tra email đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.data.email },
    });
    if (existingUser) {
      return { success: false, error: "Email đã được sử dụng" };
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(validatedData.data.password, 12);

    // 6. Tạo user
    const user = await prisma.user.create({
      data: {
        ...validatedData.data,
        password: hashedPassword,
      },
    });

    // 7. Revalidate cache
    revalidatePath("/admin/users");

    return { success: true, data: { id: user.id } };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
}
```

#### Gọi Server Action từ Client:

```typescript
// src/app/admin/users/create/page.tsx
"use client";

import { createUser } from "@/actions/user.actions";
import { useTransition } from "react";

export default function CreateUserPage() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createUser({
        email: formData.get("email") as string,
        name: formData.get("name") as string,
        password: formData.get("password") as string,
        role: "MEMBER",
      });

      if (result.success) {
        toast.success("Tạo user thành công!");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? "Đang tạo..." : "Tạo User"}
      </button>
    </form>
  );
}
```

#### Thời gian học: **1 tuần**

---

### 3.3. Zod Validation

Zod là thư viện validation type-safe, tích hợp hoàn hảo với TypeScript.

```typescript
import { z } from "zod";

// Schema cơ bản
const UserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(2).max(50),
  age: z.number().int().positive().optional(),
  role: z.enum(["ADMIN", "PM", "MEMBER"]),
});

// Infer TypeScript type từ schema
type User = z.infer<typeof UserSchema>;

// Validate dữ liệu
const result = UserSchema.safeParse(inputData);
if (result.success) {
  // result.data có type User
  console.log(result.data);
} else {
  // result.error chứa thông tin lỗi
  console.log(result.error.errors);
}

// Schema nâng cao
const CreateProjectSchema = z.object({
  title: z.string()
    .min(3, "Tiêu đề phải có ít nhất 3 ký tự")
    .max(100, "Tiêu đề không được quá 100 ký tự"),
  
  description: z.string().optional(),
  
  startDate: z.string()
    .transform((str) => new Date(str))
    .refine((date) => date > new Date(), {
      message: "Ngày bắt đầu phải lớn hơn ngày hiện tại",
    }),
  
  members: z.array(z.string().cuid()).min(1, "Cần ít nhất 1 thành viên"),
});

// Schema với điều kiện
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().default(false),
});
```

#### Thời gian học: **3 ngày**

---

### 3.4. Authentication với Auth.js v5

#### Cấu hình Auth.js:

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
```

#### Middleware bảo vệ routes:

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Routes công khai
  const publicRoutes = ["/login", "/register", "/"];
  
  // Routes cần đăng nhập
  const protectedRoutes = ["/dashboard", "/projects", "/tasks"];
  
  // Routes chỉ dành cho admin
  const adminRoutes = ["/admin"];

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Chưa đăng nhập mà truy cập protected route
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Không phải admin mà truy cập admin route
  if (isAdminRoute && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

#### Thời gian học: **1 tuần**

---

## 4. Lộ trình học tập 3 tháng

### 📅 Tháng 1: Xây dựng nền tảng

| Tuần | Nội dung | Output |
|------|----------|--------|
| **Tuần 1** | TypeScript cơ bản đến nâng cao | Hoàn thành các bài tập TypeScript trên TypeScript Playground |
| **Tuần 2** | SQL & PostgreSQL | Viết được các câu query CRUD, JOIN |
| **Tuần 3** | Prisma Schema & Migrations | Tự thiết kế schema cho một app đơn giản |
| **Tuần 4** | Prisma Client CRUD | Viết được tất cả các loại query với Prisma |

### 📅 Tháng 2: Xây dựng ứng dụng

| Tuần | Nội dung | Output |
|------|----------|--------|
| **Tuần 5** | Next.js App Router basics | Hiểu cấu trúc folder, Server vs Client Components |
| **Tuần 6** | Server Actions + Zod | Viết được các action CRUD với validation |
| **Tuần 7** | Auth.js + Middleware | Implement authentication flow hoàn chỉnh |
| **Tuần 8** | Mini Project #1 | Xây dựng app Todo với Auth + CRUD |

### 📅 Tháng 3: Nâng cao & Thực chiến

| Tuần | Nội dung | Output |
|------|----------|--------|
| **Tuần 9** | Error Handling & Logging | Implement error boundary, logging system |
| **Tuần 10** | Testing với Vitest | Viết unit test cho Server Actions |
| **Tuần 11** | Performance & Caching | Hiểu về revalidation, ISR, caching strategies |
| **Tuần 12** | Mini Project #2 | Xây dựng app quản lý task với nhiều user |

---

## 5. Tài nguyên học tập

### 📚 Tài liệu chính thức (Miễn phí)
| Công nghệ | Link | Ghi chú |
|-----------|------|---------|
| TypeScript | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) | Đọc Handbook |
| Prisma | [prisma.io/docs](https://www.prisma.io/docs/) | Đọc Getting Started + Concepts |
| Next.js | [nextjs.org/docs](https://nextjs.org/docs) | Focus vào App Router |
| Auth.js | [authjs.dev](https://authjs.dev/) | Đọc phần Getting Started |
| Zod | [zod.dev](https://zod.dev/) | Đọc README là đủ |

### 🎥 Video Courses (Khuyến nghị)
| Khóa học | Nền tảng | Nội dung |
|----------|----------|----------|
| **The Net Ninja - Next.js 14** | YouTube | Miễn phí, cơ bản |
| **Prisma Course** | YouTube (Web Dev Simplified) | Prisma từ A-Z |
| **TypeScript Full Course** | YouTube (Dave Gray) | TypeScript chi tiết |

### 🛠️ Tools cần cài đặt
```bash
# IDE
VS Code (bắt buộc)

# Extensions VS Code quan trọng
- Prisma
- ESLint
- Prettier
- TypeScript Importer
- GitLens

# Database GUI
- DBeaver hoặc TablePlus
- Prisma Studio (npx prisma studio)

# API Testing
- Postman hoặc Thunder Client (VS Code extension)
```

---

## 6. Checklist đánh giá năng lực

### Level 1: Beginner (Sau 1 tháng)
- [ ] Viết được TypeScript với Interface, Types, Generics
- [ ] Viết được SQL query cơ bản (SELECT, INSERT, UPDATE, DELETE, JOIN)
- [ ] Tạo được Prisma schema và chạy migration
- [ ] Thực hiện được CRUD với Prisma Client

### Level 2: Intermediate (Sau 2 tháng)
- [ ] Phân biệt được Server Components vs Client Components
- [ ] Viết được Server Actions với Zod validation
- [ ] Implement được authentication với Auth.js
- [ ] Bảo vệ routes với middleware
- [ ] Xử lý được errors và edge cases

### Level 3: Advanced (Sau 3 tháng)
- [ ] Tối ưu được query với Prisma (select, include, pagination)
- [ ] Implement được RBAC (Role-Based Access Control)
- [ ] Viết được unit tests với Vitest
- [ ] Hiểu và áp dụng được caching strategies
- [ ] Debug và fix được production issues

---

## 💡 Mẹo để tiến bộ nhanh

### 1. Học qua dự án thực tế
> Đừng chỉ đọc docs, hãy code song song. Mỗi khái niệm học được, hãy viết code thử ngay.

### 2. Đọc code của người khác
> Clone các repo open-source dùng Next.js + Prisma để học cách organize code.

### 3. Debug là bạn
> Khi gặp lỗi, đừng copy paste từ StackOverflow ngay. Hãy đọc error message, hiểu nguyên nhân.

### 4. Type Safety là ưu tiên
> Đừng bao giờ dùng `any`. Nếu TypeScript báo lỗi, hãy fix type thay vì bypass.

### 5. Commit thường xuyên
> Mỗi tính năng nhỏ hoàn thành, hãy commit. Điều này giúp bạn track được tiến độ và rollback khi cần.

---

## 📞 Hỗ trợ

Khi gặp khó khăn, hãy:
1. Đọc lại docs chính thức
2. Search trên StackOverflow / GitHub Issues
3. Hỏi trong team chat
4. Đọc file `Readme/07_implementation-plan-novawork-hub.md` để hiểu context dự án

---

> **Lưu ý cuối**: Đây là lộ trình gợi ý. Tùy vào nền tảng và tốc độ học của bạn, thời gian có thể ngắn hơn hoặc dài hơn. Điều quan trọng là **hiểu sâu** chứ không phải học nhanh.

*Cập nhật lần cuối: 24/12/2024*
