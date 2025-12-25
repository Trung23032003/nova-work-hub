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

#### 📗 Lời giải bài tập

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 1</strong></summary>

```typescript
// Bước 1: Định nghĩa các Union Types cho status và priority
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

// Bước 2: Tạo interface Task
interface Task {
  readonly id: string;        // readonly - không thể thay đổi sau khi tạo
  title: string;
  description?: string;       // optional - có dấu ?
  status: TaskStatus;         // dùng union type đã định nghĩa
  priority: TaskPriority;
  assigneeId?: string;        // optional
  createdAt: Date;
  updatedAt: Date;
}

// Ví dụ sử dụng:
const task: Task = {
  id: "task-001",
  title: "Học TypeScript",
  status: "IN_PROGRESS",
  priority: "HIGH",
  createdAt: new Date(),
  updatedAt: new Date(),
  // description và assigneeId không bắt buộc
};

// ❌ Lỗi vì id là readonly
task.id = "new-id"; // Cannot assign to 'id' because it is a read-only property

// ❌ Lỗi vì status không hợp lệ
const badTask: Task = {
  ...task,
  status: "PENDING", // Type '"PENDING"' is not assignable to type 'TaskStatus'
};
```

**Giải thích:**
- `readonly` đảm bảo `id` không bị thay đổi sau khi task được tạo
- `?` cho phép field là optional (có thể không truyền)
- Union types (`"TODO" | "IN_PROGRESS" | "DONE"`) giới hạn giá trị hợp lệ

</details>

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 2</strong></summary>

```typescript
// Cách 1: Generic với constraint inline
function findById<T extends { id: string }>(
  items: T[], 
  id: string
): T | undefined {
  return items.find((item) => item.id === id);
}

// Cách 2: Định nghĩa interface riêng cho constraint (dễ tái sử dụng)
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

// Ví dụ sử dụng:
interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

const users: User[] = [
  { id: "u1", name: "Trung", email: "trung@mail.com" },
  { id: "u2", name: "An", email: "an@mail.com" },
];

const products: Product[] = [
  { id: "p1", name: "Laptop", price: 1000 },
  { id: "p2", name: "Mouse", price: 50 },
];

// ✅ Hoạt động với User
const user = findById(users, "u1");
// TypeScript biết user có kiểu User | undefined
console.log(user?.name); // "Trung"

// ✅ Hoạt động với Product
const product = findById(products, "p2");
// TypeScript biết product có kiểu Product | undefined
console.log(product?.price); // 50

// ❌ Lỗi với array không có id
const numbers = [1, 2, 3];
findById(numbers, "1"); 
// Error: Type 'number' does not satisfy the constraint '{ id: string }'
```

**Giải thích:**
- `T extends { id: string }` yêu cầu T phải có property `id` kiểu string
- Hàm trả về `T | undefined` vì có thể không tìm thấy
- TypeScript tự động suy luận kiểu T dựa vào argument truyền vào

</details>

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 3</strong></summary>

```typescript
// Interface Task từ Bài 1
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
  readonly id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CreateTaskInput: Không có id, createdAt, updatedAt
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;

// Tương đương với:
// {
//   title: string;
//   description?: string;
//   status: TaskStatus;
//   priority: TaskPriority;
//   assigneeId?: string;
// }

// Ví dụ sử dụng:
const newTask: CreateTaskInput = {
  title: "Hoàn thành báo cáo",
  status: "TODO",
  priority: "HIGH",
  // Không cần id, createdAt, updatedAt - server sẽ tự tạo
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UpdateTaskInput: Tất cả optional, nhưng phải có id
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type UpdateTaskInput = Partial<Omit<Task, "id" | "createdAt">> & {
  id: string; // id bắt buộc
};

// Cách khác dùng Pick + Partial:
type UpdateTaskInput2 = Pick<Task, "id"> & 
  Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>;

// Tương đương với:
// {
//   id: string;           // bắt buộc
//   title?: string;       // optional
//   description?: string; // optional
//   status?: TaskStatus;  // optional
//   priority?: TaskPriority; // optional
//   assigneeId?: string;  // optional
//   updatedAt?: Date;     // optional
// }

// Ví dụ sử dụng:
const updateData: UpdateTaskInput = {
  id: "task-001",         // bắt buộc - để biết update task nào
  status: "DONE",         // chỉ update status
  // Các field khác không cần
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TaskPreview: Chỉ có id, title, status
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type TaskPreview = Pick<Task, "id" | "title" | "status">;

// Tương đương với:
// {
//   id: string;        // readonly bị mất khi dùng Pick
//   title: string;
//   status: TaskStatus;
// }

// Ví dụ sử dụng - hiển thị danh sách task:
const taskList: TaskPreview[] = [
  { id: "t1", title: "Task 1", status: "TODO" },
  { id: "t2", title: "Task 2", status: "IN_PROGRESS" },
  { id: "t3", title: "Task 3", status: "DONE" },
];

// Render danh sách - chỉ cần 3 fields để hiển thị
taskList.forEach((task) => {
  console.log(`[${task.status}] ${task.title}`);
});
```

**Giải thích:**
- `Omit<T, K>`: Loại bỏ các keys K khỏi type T
- `Partial<T>`: Biến tất cả fields thành optional
- `Pick<T, K>`: Chỉ lấy các keys K từ type T
- `A & B`: Intersection - kết hợp cả A và B (phải thỏa mãn cả hai)

**Khi nào dùng cái nào:**
| Use Case | Utility Type |
|----------|--------------|
| Tạo mới (CREATE) | `Omit` - loại bỏ id, timestamps |
| Cập nhật (UPDATE) | `Partial` + `Omit` - tất cả optional trừ id |
| Xem danh sách | `Pick` - chỉ lấy fields cần hiển thị |

</details>

---

### 2.2. SQL & Cơ sở dữ liệu quan hệ

**SQL (Structured Query Language)** là ngôn ngữ chuẩn để làm việc với cơ sở dữ liệu quan hệ (Relational Database). Đây là kiến thức **nền tảng bắt buộc** cho mọi Backend Developer.

---

#### 2.2.1. Các khái niệm cốt lõi

| Khái niệm | Mô tả | Ví dụ |
|-----------|-------|-------|
| **Table** | Bảng chứa dữ liệu | `users`, `projects`, `tasks` |
| **Column** | Cột/thuộc tính của bảng | `id`, `email`, `name` |
| **Row** | Một bản ghi/record | Một user cụ thể |
| **Primary Key (PK)** | Khóa chính, định danh duy nhất | `id` |
| **Foreign Key (FK)** | Khóa ngoại, liên kết bảng | `project_id` trong bảng `tasks` |
| **Index** | Đánh chỉ mục để truy vấn nhanh | Index trên `email` |

**📊 Table (Bảng)**
- Là nơi **lưu trữ dữ liệu** có cấu trúc
- Mỗi bảng đại diện cho một **thực thể** (entity) trong hệ thống
```
Bảng users     → Lưu thông tin người dùng
Bảng projects  → Lưu thông tin dự án
Bảng tasks     → Lưu thông tin công việc
```

**📋 Column (Cột)**
- Là **thuộc tính/trường dữ liệu** của bảng
- Mỗi column có một **kiểu dữ liệu** cụ thể (string, number, date, etc.)
```
Bảng users có các columns:
├── id       (string - định danh)
├── email    (string - email)
├── name     (string - tên)
└── role     (string - vai trò)
```

**📝 Row (Hàng/Bản ghi)**
- Là **một record cụ thể** trong bảng
- Mỗi row chứa dữ liệu cho tất cả các columns
```
| id      | email           | name   | role   |
|---------|-----------------|--------|--------|
| u-001   | trung@mail.com  | Trung  | ADMIN  |  ← Đây là 1 row
| u-002   | an@mail.com     | An     | MEMBER | ← Đây là 1 row khác
```

**🔑 Primary Key (PK) - Khóa chính**
- Là **định danh duy nhất** cho mỗi row trong bảng
- **Không được trùng lặp** và **không được NULL**
- Thường dùng: `id`, `uuid`, `cuid`

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,  -- ← Khóa chính
  email VARCHAR(255),
  name VARCHAR(100)
);
```

**🔗 Foreign Key (FK) - Khóa ngoại**
- Là **liên kết giữa 2 bảng**
- FK trong bảng này **tham chiếu đến PK** của bảng kia
- Đảm bảo **tính toàn vẹn dữ liệu** (referential integrity)

```
Bảng tasks:
| id    | title        | project_id  |
|-------|--------------|-------------|
| t-001 | Code API     | p-001       | ← project_id là FK, tham chiếu đến projects.id
| t-002 | Write docs   | p-001       |

Bảng projects:
| id    | title       |
|-------|-------------|
| p-001 | NovaWorkHub | ← PK của bảng projects
```

**📇 Index (Chỉ mục)**
- **Tăng tốc độ truy vấn** dữ liệu
- Giống như mục lục của sách - giúp tìm kiếm nhanh hơn
- Nên đặt index trên các columns **hay được tìm kiếm/filter**

```sql
-- Tìm user bằng email rất thường xuyên → Tạo index
CREATE INDEX idx_users_email ON users(email);

-- Sau đó truy vấn này sẽ nhanh hơn nhiều:
SELECT * FROM users WHERE email = 'trung@mail.com';
```

---

#### 2.2.2. Các loại quan hệ (Relationships)

**🔹 ONE-TO-ONE (1-1) - Một-Một**
```
User ──────── Profile
```
- **Một user** có **đúng một profile**
- **Một profile** thuộc về **đúng một user**
- **Ví dụ thực tế:** Mỗi user có 1 profile chứa thông tin chi tiết (bio, avatar, social links...)

```sql
-- Bảng users
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE
);

-- Bảng profiles (FK user_id là UNIQUE để đảm bảo 1-1)
CREATE TABLE profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE,  -- ← UNIQUE đảm bảo 1-1
  bio TEXT,
  avatar VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**🔹 ONE-TO-MANY (1-n) - Một-Nhiều**
```
Project ──────< Tasks
```
- **Một project** có **nhiều tasks**
- **Một task** thuộc về **đúng một project**
- **Quan hệ phổ biến nhất** trong thực tế

```sql
-- Bảng projects
CREATE TABLE projects (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255)
);

-- Bảng tasks (FK project_id không cần UNIQUE)
CREATE TABLE tasks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255),
  project_id VARCHAR(36),  -- ← Nhiều tasks có thể cùng project_id
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

**🔹 MANY-TO-MANY (n-n) - Nhiều-Nhiều**
```
Users >────────< Projects
```
- **Một user** tham gia **nhiều projects**
- **Một project** có **nhiều users**
- Cần **bảng trung gian** (junction table) để liên kết

```sql
-- Bảng trung gian project_members
CREATE TABLE project_members (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  project_id VARCHAR(36),
  role VARCHAR(50),  -- Có thể thêm thông tin về quan hệ
  joined_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  
  -- Đảm bảo 1 user chỉ join 1 project 1 lần
  UNIQUE (user_id, project_id)
);
```

---

#### 2.2.3. Các câu lệnh SQL cơ bản (CRUD)

**📖 SELECT - Lấy dữ liệu (Read)**

```sql
-- Lấy TẤT CẢ columns, TẤT CẢ rows
SELECT * FROM users;

-- Lấy CHỈ ĐỊNH columns
SELECT id, name, email FROM users;

-- Lấy với ĐIỀU KIỆN
SELECT * FROM users WHERE role = 'ADMIN';

-- Lấy với SẮP XẾP và GIỚI HẠN
SELECT id, name, email 
FROM users 
ORDER BY created_at DESC  -- Mới nhất trước
LIMIT 10;                  -- Chỉ lấy 10 records
```

**✏️ INSERT - Thêm dữ liệu (Create)**

```sql
-- Thêm 1 record mới
INSERT INTO users (id, name, email, role) 
VALUES ('uuid-123', 'Trung', 'trung@email.com', 'MEMBER');

-- Thêm nhiều records cùng lúc
INSERT INTO users (id, name, email, role) VALUES 
  ('uuid-124', 'An', 'an@email.com', 'MEMBER'),
  ('uuid-125', 'Bình', 'binh@email.com', 'PM');
```

**🔄 UPDATE - Cập nhật dữ liệu**

```sql
-- Cập nhật role của user có id cụ thể
UPDATE users 
SET role = 'PM' 
WHERE id = 'uuid-123';

-- Cập nhật nhiều fields
UPDATE users 
SET role = 'ADMIN', updated_at = NOW() 
WHERE email = 'trung@email.com';

-- ⚠️ NGUY HIỂM: Không có WHERE sẽ update TẤT CẢ records!
UPDATE users SET role = 'ADMIN';  -- Tất cả users thành ADMIN!
```

**🗑️ DELETE - Xóa dữ liệu**

```sql
-- Xóa user có id cụ thể
DELETE FROM users WHERE id = 'uuid-123';

-- ⚠️ NGUY HIỂM: Không có WHERE sẽ xóa TẤT CẢ records!
DELETE FROM users;  -- Xóa hết tất cả users!
```

---

#### 2.2.4. JOIN - Kết hợp bảng

**JOIN** được sử dụng để kết hợp dữ liệu từ nhiều bảng dựa trên quan hệ giữa chúng.

```sql
-- Lấy tên user và title project mà họ tham gia
SELECT u.name, p.title 
FROM users u
JOIN project_members pm ON u.id = pm.user_id
JOIN projects p ON pm.project_id = p.id;

-- Kết quả:
-- | name   | title        |
-- |--------|--------------|
-- | Trung  | NovaWorkHub  |
-- | An     | NovaWorkHub  |
-- | Trung  | ProjectXYZ   |
```

**Các loại JOIN:**

| Loại JOIN | Mô tả |
|-----------|-------|
| `INNER JOIN` | Chỉ lấy records có match ở **CẢ HAI** bảng |
| `LEFT JOIN` | Lấy **TẤT CẢ** từ bảng trái, match từ bảng phải (NULL nếu không có) |
| `RIGHT JOIN` | Lấy **TẤT CẢ** từ bảng phải, match từ bảng trái (NULL nếu không có) |
| `FULL JOIN` | Lấy **TẤT CẢ** từ cả hai bảng |

```sql
-- LEFT JOIN: Lấy tất cả users, kể cả những người chưa join project nào
SELECT u.name, p.title 
FROM users u
LEFT JOIN project_members pm ON u.id = pm.user_id
LEFT JOIN projects p ON pm.project_id = p.id;

-- Kết quả:
-- | name   | title        |
-- |--------|--------------|
-- | Trung  | NovaWorkHub  |
-- | An     | NovaWorkHub  |
-- | Bình   | NULL         | ← Bình chưa join project nào
```

---

#### 2.2.5. Ứng dụng trong NovaWork Hub

Trong dự án **NovaWork Hub**, bạn sẽ làm việc với các bảng như:

```
📊 Database Schema:
├── users          (id, email, name, password, role, avatar)
├── projects       (id, title, description, status, start_date, end_date)
├── project_members(id, user_id, project_id, role, joined_at)  ← Bảng trung gian
├── tasks          (id, title, description, status, priority, project_id, assignee_id)
└── comments       (id, content, task_id, user_id, created_at)

Quan hệ:
• users 1-n project_members n-1 projects  (Many-to-Many qua bảng trung gian)
• projects 1-n tasks
• tasks 1-n comments
• users 1-n comments
```

---

#### 📝 Bài tập thực hành SQL

**Bài 1: Viết câu SELECT**
```sql
-- TODO: Viết câu truy vấn để:
-- 1. Lấy tất cả users có role là 'PM'
-- 2. Lấy 5 projects mới nhất
-- 3. Đếm số lượng tasks theo từng status
```

**Bài 2: Viết câu JOIN**
```sql
-- TODO: Viết câu truy vấn để:
-- 1. Lấy danh sách tasks kèm tên project và tên người được assign
-- 2. Lấy số lượng thành viên của mỗi project
```

<details>
<summary><strong>🔑 Bấm để xem lời giải</strong></summary>

```sql
-- Bài 1.1: Users có role là PM
SELECT * FROM users WHERE role = 'PM';

-- Bài 1.2: 5 projects mới nhất
SELECT * FROM projects ORDER BY created_at DESC LIMIT 5;

-- Bài 1.3: Đếm tasks theo status
SELECT status, COUNT(*) as count 
FROM tasks 
GROUP BY status;

-- Bài 2.1: Tasks kèm project và assignee
SELECT 
  t.id,
  t.title as task_title,
  p.title as project_title,
  u.name as assignee_name
FROM tasks t
JOIN projects p ON t.project_id = p.id
LEFT JOIN users u ON t.assignee_id = u.id;

-- Bài 2.2: Số thành viên mỗi project
SELECT 
  p.title,
  COUNT(pm.user_id) as member_count
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id
GROUP BY p.id, p.title;
```

</details>

---

#### ⏱️ Thời gian học: **1 tuần**

Trong tuần này, bạn nên:
- **Ngày 1-2:** Học các khái niệm cơ bản (Table, Column, Row, Keys, Index)
- **Ngày 3-4:** Thực hành CRUD (SELECT, INSERT, UPDATE, DELETE)
- **Ngày 5-6:** Học về Relationships và JOIN
- **Ngày 7:** Thực hành kết hợp với công cụ visual (MySQL Workbench, pgAdmin, DBeaver)

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
