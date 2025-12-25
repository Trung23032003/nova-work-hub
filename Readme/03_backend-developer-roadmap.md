# Lộ trình Backend Developer cho Fresher

> **Mục tiêu**: Tài liệu này cung cấp lộ trình học tập chi tiết và các kiến thức cốt lõi mà một Backend Developer fresher cần nắm vững để làm việc hiệu quả trong dự án NovaWork Hub.

---

## 📋 Mục lục

1. [Tổng quan về Backend Development](#1-tổng-quan-về-backend-development)
2. [Kiến thức nền tảng bắt buộc](#2-kiến-thức-nền-tảng-bắt-buộc)
3. [Kiến thức chuyên sâu cho dự án](#3-kiến-thức-chuyên-sâu-cho-dự-án)
4. [Tài nguyên học tập](#4-tài-nguyên-học-tập)

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

### 2.3. Git & Version Control

**Git** là hệ thống quản lý phiên bản (Version Control System - VCS) **phổ biến nhất thế giới**. Đây là công cụ **bắt buộc** mà mọi developer phải biết.

**Tại sao cần Git?**
- 📝 **Lưu lịch sử thay đổi**: Biết ai đã thay đổi gì, khi nào
- 🔄 **Quay lại phiên bản cũ**: Nếu code bị hỏng, có thể rollback
- 👥 **Làm việc nhóm**: Nhiều người có thể code cùng lúc mà không xung đột
- 🌿 **Branching**: Phát triển tính năng mới mà không ảnh hưởng code chính

---

#### 2.3.1. Các khái niệm cốt lõi

**📁 Repository (Repo)**
```
┌─────────────────┐                    ┌─────────────────┐
│  Local Repo     │     push/pull      │  Remote Repo    │
│  (Máy của bạn)  │ ◄────────────────► │  (GitHub)       │
└─────────────────┘                    └─────────────────┘

• Local Repository: Repo trên máy tính của bạn
• Remote Repository: Repo trên server (GitHub, GitLab, Bitbucket)
```

**🌿 Branch (Nhánh)**
```
                    feature/login
                   ┌──────────────────────────┐
                  ╱                            ╲
main ────●────●────●────●────────────────●────●────●────►
                                         │
                                   merge feature

• Main/Master: Branch chính, chứa code ổn định
• Feature branch: Branch để phát triển tính năng mới
• Hotfix branch: Branch để sửa lỗi khẩn cấp
```

**🔄 Staging Area (Index)**
```
┌─────────────────┐    git add    ┌─────────────────┐   git commit   ┌─────────────────┐
│ Working         │ ────────────► │ Staging Area    │ ─────────────► │ Repository      │
│ Directory       │               │ (Index)         │                │ (.git)          │
│                 │               │                 │                │                 │
│ Các file đang   │               │ Các thay đổi    │                │ Lịch sử các     │
│ làm việc        │               │ chuẩn bị commit │                │ commits         │
└─────────────────┘               └─────────────────┘                └─────────────────┘
```

**📦 Commit**
- Là một "snapshot" (ảnh chụp) của code tại một thời điểm
- Mỗi commit có:
  - **Hash ID**: Định danh duy nhất (vd: `a1b2c3d4`)
  - **Message**: Mô tả thay đổi
  - **Author**: Người tạo commit
  - **Timestamp**: Thời gian tạo

---

#### 2.3.2. Các lệnh Git cơ bản

**🚀 Khởi tạo & Clone**

```bash
# Khởi tạo repo mới
git init

# Clone repo từ remote
git clone <repo-url>
git clone https://github.com/username/project.git

# Clone và đặt tên thư mục khác
git clone <repo-url> my-folder
```

**🌿 Làm việc với Branch**

```bash
# Xem tất cả branches
git branch              # Branches local
git branch -a           # Tất cả branches (cả remote)

# Tạo branch mới
git branch feature/login

# Tạo và chuyển sang branch mới (cách nhanh)
git checkout -b feature/login
# Hoặc (Git 2.23+)
git switch -c feature/login

# Chuyển sang branch khác
git checkout main
git switch main

# Xóa branch
git branch -d feature/login        # Xóa branch đã merge
git branch -D feature/login        # Xóa branch chưa merge (force)
```

**📝 Stage & Commit**

```bash
# Xem trạng thái
git status

# Xem thay đổi
git diff                           # Thay đổi chưa stage
git diff --staged                  # Thay đổi đã stage

# Stage thay đổi
git add file.txt                   # Stage 1 file
git add .                          # Stage tất cả
git add -p                         # Stage từng phần (interactive)

# Unstage
git reset HEAD file.txt            # Unstage 1 file
git restore --staged file.txt      # Cách mới (Git 2.23+)

# Commit
git commit -m "feat: add login feature"

# Commit với message nhiều dòng
git commit -m "feat: add login feature" -m "- Add login form" -m "- Add validation"

# Sửa commit cuối (chưa push)
git commit --amend -m "feat: updated message"
```

**🔄 Đồng bộ với Remote**

```bash
# Thêm remote
git remote add origin https://github.com/username/project.git

# Xem remotes
git remote -v

# Lấy thay đổi từ remote (không merge)
git fetch origin

# Lấy và merge thay đổi từ remote
git pull origin main

# Push lên remote
git push origin feature/login

# Push branch mới lần đầu
git push -u origin feature/login   # -u = set upstream
```

---

#### 2.3.3. Merge & Rebase

```bash
# Merge branch vào branch hiện tại
git checkout main
git merge feature/login

# Rebase (làm lại lịch sử commit)
git checkout feature/login
git rebase main
```

**Merge vs Rebase:**

```
MERGE: Giữ nguyên lịch sử, tạo merge commit
       main: ──A──B──C────────M──
                    ╲        ╱
       feature:      D──E──F

REBASE: Làm phẳng lịch sử, replay commits
       main:    ──A──B──C──D'──E'──F'──
       (feature được "di chuyển" lên đầu main)
```

| Tiêu chí | Merge | Rebase |
|----------|-------|--------|
| **Lịch sử** | Giữ nguyên, có merge commit | Làm phẳng, sạch sẽ hơn |
| **An toàn** | An toàn hơn | Có thể gây conflict phức tạp |
| **Khi nào dùng** | Merge feature vào main | Update feature với main mới nhất |
| **Public branch** | ✅ Dùng được | ⚠️ Không nên (rewrite history) |

---

#### 2.3.4. Hoàn tác thay đổi

```bash
# Hoàn tác thay đổi chưa stage
git checkout -- file.txt           # Cách cũ
git restore file.txt               # Cách mới (Git 2.23+)

# Hoàn tác commit cuối (giữ thay đổi trong staging)
git reset --soft HEAD~1

# Hoàn tác commit cuối (giữ thay đổi trong working dir)
git reset --mixed HEAD~1           # Mặc định

# Hoàn tác commit cuối (XÓA thay đổi)
git reset --hard HEAD~1            # ⚠️ NGUY HIỂM!

# Tạo commit đảo ngược (an toàn hơn reset)
git revert <commit-hash>
```

**So sánh Reset modes:**

| Mode | Staging Area | Working Directory | Khi nào dùng |
|------|--------------|-------------------|--------------|
| `--soft` | Giữ nguyên | Giữ nguyên | Muốn sửa commit message |
| `--mixed` | Reset | Giữ nguyên | Muốn unstage và sửa lại |
| `--hard` | Reset | Reset | Muốn xóa hoàn toàn ⚠️ |

---

#### 2.3.5. Xem lịch sử

```bash
# Xem lịch sử commits
git log

# Xem ngắn gọn (1 dòng mỗi commit)
git log --oneline

# Xem với graph (visualize branches)
git log --oneline --graph --all

# Xem n commits gần nhất
git log -n 5

# Xem commits của 1 file
git log --follow file.txt

# Xem ai sửa từng dòng (blame)
git blame file.txt

# Xem thay đổi của 1 commit
git show <commit-hash>
```

---

#### 2.3.6. Quy ước Commit Message (Conventional Commits)

**Format chuẩn:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Các loại Type:**

| Type | Mục đích | Ví dụ |
|------|----------|-------|
| `feat` | Thêm tính năng mới | `feat: add user registration` |
| `fix` | Sửa lỗi | `fix: resolve login crash on iOS` |
| `docs` | Cập nhật tài liệu | `docs: update API documentation` |
| `style` | Format code (không đổi logic) | `style: format with prettier` |
| `refactor` | Tái cấu trúc code | `refactor: extract validation logic` |
| `test` | Thêm/sửa tests | `test: add unit tests for auth` |
| `chore` | Công việc khác | `chore: update dependencies` |
| `perf` | Cải thiện performance | `perf: optimize database queries` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |

**Ví dụ commit message:**

```bash
# ✅ Tốt
git commit -m "feat(auth): add Google OAuth login"
git commit -m "fix(api): handle null response from server"
git commit -m "docs: add installation guide to README"

# ❌ Xấu - Không rõ ràng
git commit -m "fix bug"
git commit -m "update"
git commit -m "asdfasdf"
```

---

#### 2.3.7. Git Workflow trong dự án

**GitHub Flow (Workflow đơn giản, phổ biến):**

```
main     ────●────●────●────●────●────●────────►
              ↖        ↗         ↖       ↗
feature        ──●──●──           ──●──●──
                  PR                 PR
```

**Workflow thực tế trong NovaWork Hub:**

```bash
# 1. Lấy code mới nhất
git checkout main
git pull origin main

# 2. Tạo branch mới cho feature/fix
git checkout -b feature/add-task-api

# 3. Code và commit (nhiều lần)
git add .
git commit -m "feat(task): add create task API"
git commit -m "feat(task): add validation"

# 4. Push lên remote
git push -u origin feature/add-task-api

# 5. Tạo Pull Request trên GitHub
#    - Mô tả thay đổi
#    - Request review từ team members

# 6. Sau khi PR được approve và merge
git checkout main
git pull origin main

# 7. Xóa branch local (dọn dẹp)
git branch -d feature/add-task-api
```

---

#### 2.3.8. Xử lý Conflict

Khi 2 người cùng sửa 1 file, Git không biết chọn phiên bản nào → **Conflict**

```
<<<<<<< HEAD
const greeting = "Hello World";     ← Code của bạn (current)
=======
const greeting = "Hi There";        ← Code của người khác (incoming)
>>>>>>> feature/other-branch
```

**Cách xử lý:**

```bash
# 1. Khi merge/pull báo conflict
git merge feature/login
# Auto-merging file.js
# CONFLICT (content): Merge conflict in file.js

# 2. Mở file conflict, quyết định giữ code nào
#    - Giữ code của bạn
#    - Giữ code incoming
#    - Kết hợp cả 2

# 3. Xóa các markers (<<<<<<<, =======, >>>>>>>)

# 4. Stage file đã sửa
git add file.js

# 5. Hoàn tất merge
git commit -m "fix: resolve merge conflict in file.js"
```

**Tips tránh conflict:**
- Pull main thường xuyên vào feature branch
- Chia nhỏ task, commit thường xuyên
- Communicate với team khi sửa cùng file

---

#### 📝 Bài tập thực hành Git

**Bài 1: Workflow cơ bản**
```bash
# TODO: Thực hành các bước sau:
# 1. Clone repo của bạn về máy
# 2. Tạo branch feature/practice
# 3. Tạo file mới, commit
# 4. Push lên remote
# 5. Quay về main, xóa branch local
```

**Bài 2: Xử lý conflict**
```bash
# TODO: Tạo conflict và xử lý:
# 1. Tạo 2 branches từ main
# 2. Ở cả 2 branch, sửa cùng 1 dòng trong cùng 1 file
# 3. Merge branch 1 vào main
# 4. Merge branch 2 vào main (sẽ conflict)
# 5. Xử lý conflict
```

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 1</strong></summary>

```bash
# 1. Clone repo
git clone https://github.com/your-username/nova-work-hub.git
cd nova-work-hub

# 2. Tạo branch
git checkout -b feature/practice

# 3. Tạo file và commit
echo "# Practice" > practice.md
git add practice.md
git commit -m "docs: add practice file"

# 4. Push lên remote
git push -u origin feature/practice

# 5. Quay về main và xóa branch
git checkout main
git branch -d feature/practice
git push origin --delete feature/practice  # Xóa remote branch
```

</details>

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 2</strong></summary>

```bash
# 1. Tạo 2 branches
git checkout main
git checkout -b branch-a
git checkout main
git checkout -b branch-b

# 2. Sửa file ở branch-a
git checkout branch-a
echo "Line from branch A" > test.txt
git add test.txt
git commit -m "feat: add from branch A"

# Sửa file ở branch-b
git checkout branch-b
echo "Line from branch B" > test.txt
git add test.txt
git commit -m "feat: add from branch B"

# 3. Merge branch-a vào main (OK)
git checkout main
git merge branch-a
# Fast-forward, no conflict

# 4. Merge branch-b vào main (CONFLICT!)
git merge branch-b
# CONFLICT (add/add): Merge conflict in test.txt

# 5. Xử lý conflict
# Mở test.txt, sẽ thấy:
# <<<<<<< HEAD
# Line from branch A
# =======
# Line from branch B
# >>>>>>> branch-b

# Sửa thành:
# Line from branch A
# Line from branch B

git add test.txt
git commit -m "fix: resolve conflict between branch A and B"
```

</details>

---

## 3. Kiến thức chuyên sâu cho dự án

### 3.1. Prisma ORM (⭐⭐⭐⭐⭐)

**Prisma** là một **ORM (Object-Relational Mapping)** hiện đại cho Node.js và TypeScript. Nó là **cầu nối** giữa code TypeScript và cơ sở dữ liệu, đây là công cụ **quan trọng nhất** cho Backend.

```
┌─────────────────────────────────────────────────────────────┐
│                     TypeScript Code                         │
│         prisma.user.findMany({ where: { role: "ADMIN" } })  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼ Prisma Client
┌─────────────────────────────────────────────────────────────┐
│                      Prisma ORM                             │
│     Tự động chuyển đổi sang SQL query                       │
│     SELECT * FROM users WHERE role = 'ADMIN'                │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                             │
│                    (Database)                               │
└─────────────────────────────────────────────────────────────┘
```

**Tại sao dùng Prisma?**

| Lợi ích | Mô tả |
|---------|-------|
| **Type-safe** | TypeScript types được tự động generate từ schema |
| **Auto-complete** | IDE hiểu và gợi ý fields, methods |
| **Không cần viết SQL** | Dùng API thân thiện thay vì raw SQL |
| **Migrations** | Quản lý thay đổi database dễ dàng |
| **Relations** | Xử lý quan hệ giữa các bảng đơn giản |

**3 thành phần chính của Prisma:**

```
┌─────────────────────────────────────────────────────────────┐
│                     PRISMA ECOSYSTEM                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Prisma Schema  │  Prisma Client  │  Prisma CLI             │
│                 │                 │                         │
│  📄 Định nghĩa  │  🔌 API để      │  ⚙️ Công cụ command    │
│  cấu trúc DB    │  query database │  line                   │
│                 │                 │                         │
│  schema.prisma  │  @prisma/client │  npx prisma ...         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

---

#### 3.1.1. Prisma Schema

File `prisma/schema.prisma` là **trái tim** của Prisma - định nghĩa toàn bộ cấu trúc database:

```prisma
// ═══════════════════════════════════════════════════════════
// 1. DATASOURCE - Kết nối database
// ═══════════════════════════════════════════════════════════
datasource db {
  provider = "postgresql"           // Loại DB: postgresql, mysql, sqlite
  url      = env("DATABASE_URL")    // Connection string từ .env
}

// ═══════════════════════════════════════════════════════════
// 2. GENERATOR - Generate Prisma Client
// ═══════════════════════════════════════════════════════════
generator client {
  provider = "prisma-client-js"     // Generate JavaScript client
}

// ═══════════════════════════════════════════════════════════
// 3. MODELS - Định nghĩa các bảng
// ═══════════════════════════════════════════════════════════
model User {
  // Các fields
  id        String   @id @default(cuid())   // Primary key
  email     String   @unique                 // Unique constraint
  name      String
  password  String
  role      Role     @default(MEMBER)        // Enum với default
  avatar    String?                          // Optional (nullable)
  createdAt DateTime @default(now())         // Auto timestamp
  updatedAt DateTime @updatedAt              // Auto update timestamp

  // Relations
  projects  ProjectMember[]                  // One-to-Many
  tasks     Task[]
  comments  Comment[]

  @@map("users")                             // Tên bảng trong DB
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

// ═══════════════════════════════════════════════════════════
// 4. ENUMS - Giá trị cố định
// ═══════════════════════════════════════════════════════════
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

**Các Attributes quan trọng:**

| Attribute | Ý nghĩa | Ví dụ |
|-----------|---------|-------|
| `@id` | Primary Key | `id String @id` |
| `@default()` | Giá trị mặc định | `@default(cuid())`, `@default(now())` |
| `@unique` | Unique constraint | `email String @unique` |
| `@updatedAt` | Tự động cập nhật timestamp | `updatedAt DateTime @updatedAt` |
| `?` | Optional (nullable) | `avatar String?` |
| `@@map()` | Đặt tên bảng trong DB | `@@map("users")` |
| `@@unique()` | Composite unique | `@@unique([email, projectId])` |
| `@@index()` | Tạo index | `@@index([email])` |

**Các kiểu dữ liệu:**

| Prisma Type | PostgreSQL | TypeScript |
|-------------|------------|------------|
| `String` | TEXT, VARCHAR | `string` |
| `Int` | INTEGER | `number` |
| `Float` | DOUBLE PRECISION | `number` |
| `Boolean` | BOOLEAN | `boolean` |
| `DateTime` | TIMESTAMP | `Date` |
| `Json` | JSONB | `object` |

---

#### 3.1.2. Relations - Quan hệ giữa các Models

**One-to-One (1-1):**
```prisma
model User {
  id      String   @id @default(cuid())
  profile Profile?                        // Optional 1-1
}

model Profile {
  id     String @id @default(cuid())
  bio    String
  userId String @unique                   // FK + UNIQUE = 1-1
  user   User   @relation(fields: [userId], references: [id])
}
```

**One-to-Many (1-n):**
```prisma
model Project {
  id    String @id @default(cuid())
  title String
  tasks Task[]                            // Một project có nhiều tasks
}

model Task {
  id        String  @id @default(cuid())
  title     String
  projectId String                        // Foreign Key
  project   Project @relation(fields: [projectId], references: [id])
}
```

**Many-to-Many (n-n) - Explicit (Khuyến nghị):**
```prisma
model User {
  id       String          @id @default(cuid())
  projects ProjectMember[]
}

model Project {
  id      String          @id @default(cuid())
  members ProjectMember[]
}

// Bảng trung gian - có thể thêm thông tin về relation
model ProjectMember {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  role      String                         // Thêm thông tin về relation
  joinedAt  DateTime @default(now())
  
  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id])
  
  @@unique([userId, projectId])            // 1 user chỉ join 1 project 1 lần
}
```

---

#### 3.1.3. Prisma Client - Khởi tạo

**Best practice - Singleton pattern (tránh tạo nhiều connections):**

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

#### 3.1.4. CRUD Operations

**CREATE - Tạo mới:**

```typescript
// Tạo 1 record
const user = await prisma.user.create({
  data: {
    email: "trung@email.com",
    name: "Trung Đặng",
    password: await bcrypt.hash("123456", 12),
  },
});

// Tạo kèm relations (nested create)
const project = await prisma.project.create({
  data: {
    title: "NovaWork Hub",
    members: {
      create: [
        { userId: "user-1", role: "OWNER" },
        { userId: "user-2", role: "MEMBER" },
      ],
    },
  },
  include: {
    members: true,
  },
});

// Tạo nhiều records cùng lúc
const users = await prisma.user.createMany({
  data: [
    { email: "a@mail.com", name: "A", password: "..." },
    { email: "b@mail.com", name: "B", password: "..." },
  ],
  skipDuplicates: true,  // Bỏ qua nếu đã tồn tại
});
```

**READ - Đọc dữ liệu:**

```typescript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// findUnique - Tìm 1 record theo unique field
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const user = await prisma.user.findUnique({
  where: { id: "user-123" },
});

const userByEmail = await prisma.user.findUnique({
  where: { email: "trung@email.com" },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// findFirst - Tìm 1 record đầu tiên match điều kiện
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const admin = await prisma.user.findFirst({
  where: { role: "ADMIN" },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// findMany - Tìm nhiều records
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const users = await prisma.user.findMany({
  where: { role: "MEMBER" },
  orderBy: { createdAt: "desc" },
  take: 10,   // LIMIT
  skip: 0,    // OFFSET (pagination)
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// select - Chỉ lấy một số fields (giảm data transfer)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const userPreview = await prisma.user.findUnique({
  where: { id: "user-123" },
  select: {
    id: true,
    name: true,
    avatar: true,
    // Không lấy password, email
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// include - Lấy kèm relations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const userWithProjects = await prisma.user.findUnique({
  where: { id: "user-123" },
  include: {
    projects: {
      include: {
        project: true,
      },
    },
    tasks: {
      where: { status: "IN_PROGRESS" },
      orderBy: { createdAt: "desc" },
    },
  },
});
```

**WHERE Conditions - Điều kiện lọc:**

```typescript
const users = await prisma.user.findMany({
  where: {
    // Equals
    role: "ADMIN",
    
    // Not equals
    role: { not: "ADMIN" },
    
    // In array
    role: { in: ["ADMIN", "PM"] },
    
    // String contains
    email: { contains: "gmail" },
    
    // String starts/ends with
    name: { startsWith: "Trung" },
    
    // Comparison (gt, gte, lt, lte)
    age: { gte: 18 },     // >= 18
    
    // Date comparison
    createdAt: { gte: new Date("2024-01-01") },
    
    // Null check
    avatar: null,         // IS NULL
    avatar: { not: null }, // IS NOT NULL
    
    // OR condition
    OR: [
      { role: "ADMIN" },
      { role: "PM" },
    ],
    
    // AND condition (mặc định)
    AND: [
      { role: "MEMBER" },
      { email: { contains: "@company.com" } },
    ],
  },
});
```

**UPDATE - Cập nhật:**

```typescript
// Update 1 record
const user = await prisma.user.update({
  where: { id: "user-123" },
  data: { name: "New Name", role: "PM" },
});

// Update nhiều records
const count = await prisma.user.updateMany({
  where: { role: "MEMBER" },
  data: { role: "PM" },
});
// count = { count: 5 } // Số records đã update

// Update với increment/decrement
const post = await prisma.post.update({
  where: { id: "post-123" },
  data: {
    viewCount: { increment: 1 },
  },
});
```

**DELETE - Xóa:**

```typescript
// Xóa 1 record
await prisma.user.delete({
  where: { id: "user-123" },
});

// Xóa nhiều records
const count = await prisma.user.deleteMany({
  where: { role: "MEMBER" },
});
```

**UPSERT - Tạo hoặc cập nhật:**

```typescript
// Nếu chưa có → create, đã có → update
const user = await prisma.user.upsert({
  where: { email: "trung@email.com" },
  create: {
    email: "trung@email.com",
    name: "Trung",
    password: "...",
  },
  update: {
    name: "Trung Updated",
  },
});
```

---

#### 3.1.5. Aggregations - Tính toán

```typescript
// Count
const userCount = await prisma.user.count({
  where: { role: "ADMIN" },
});

// Aggregate (sum, avg, min, max)
const stats = await prisma.task.aggregate({
  _count: true,
  _avg: { priority: true },
  _sum: { estimatedHours: true },
});

// Group by
const tasksByStatus = await prisma.task.groupBy({
  by: ["status"],
  _count: true,
  orderBy: { _count: { status: "desc" } },
});
// [{ status: "TODO", _count: 10 }, { status: "DONE", _count: 5 }]
```

---

#### 3.1.6. Prisma Migrations

**Migrations** là cách quản lý thay đổi cấu trúc database theo thời gian:

```
Schema thay đổi          Migration được tạo         Database được update
     │                         │                          │
     ▼                         ▼                          ▼
┌─────────┐    prisma     ┌──────────────┐    prisma   ┌──────────┐
│ schema  │ ────────────► │ migrations/  │ ──────────► │ Database │
│.prisma  │  migrate dev  │ 2024_01_01/  │  migrate    │ PostgreSQL
│         │               │ migration.sql│  deploy     │          │
└─────────┘               └──────────────┘             └──────────┘
```

**Các lệnh Migration:**

```bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Development - Tạo và apply migration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
npx prisma migrate dev --name add_user_avatar
# 1. So sánh schema với database
# 2. Tạo migration SQL
# 3. Apply migration
# 4. Generate Prisma Client

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Production - Chỉ apply migration (không tạo mới)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
npx prisma migrate deploy

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Reset database (XÓA TOÀN BỘ DỮ LIỆU!)
# ⚠️ Chỉ dùng trong development!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
npx prisma migrate reset
```

**Các CLI commands khác:**

```bash
# Generate Prisma Client (sau khi sửa schema)
npx prisma generate

# Mở Prisma Studio (GUI xem database)
npx prisma studio

# Push schema trực tiếp (không tạo migration - chỉ prototype)
npx prisma db push

# Validate schema
npx prisma validate

# Format schema file
npx prisma format
```

---

#### 3.1.7. Best Practices

**1. Xử lý lỗi đúng cách:**
```typescript
import { Prisma } from "@prisma/client";

try {
  await prisma.user.create({ data: { email: "trung@email.com", ... } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      // Unique constraint violation
      throw new Error("Email đã tồn tại");
    }
    if (error.code === "P2025") {
      // Record not found
      throw new Error("Không tìm thấy record");
    }
  }
  throw error;
}
```

**2. Transaction - Đảm bảo tính toàn vẹn:**
```typescript
// Nếu 1 operation fail → rollback tất cả
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { ... } });
  const profile = await tx.profile.create({ 
    data: { userId: user.id, ... } 
  });
  return { user, profile };
});
```

**3. Pagination helper:**
```typescript
async function getPaginatedUsers(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);
  
  return {
    data: users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

---

#### 📝 Bài tập thực hành Prisma

**Bài 1: Tạo Prisma Schema**
```prisma
// TODO: Tạo schema cho Blog với:
// - Model Post (id, title, content, published, authorId, createdAt)
// - Model Author (id, name, email, posts)
// - Quan hệ: 1 Author có nhiều Posts
```

**Bài 2: Viết CRUD Operations**
```typescript
// TODO: Viết các hàm sau:
// - createPost(title, content, authorId)
// - getPublishedPosts(page, pageSize)
// - updatePost(id, data)
// - deletePost(id)
```

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 1</strong></summary>

```prisma
model Author {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  
  posts     Post[]                        // One-to-Many
  
  @@map("authors")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  authorId  String                        // Foreign Key
  author    Author   @relation(fields: [authorId], references: [id])
  
  @@map("posts")
}
```

</details>

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 2</strong></summary>

```typescript
import { prisma } from "@/lib/prisma";

// CREATE
async function createPost(title: string, content: string, authorId: string) {
  return prisma.post.create({
    data: { title, content, authorId },
    include: { author: true },
  });
}

// READ with pagination
async function getPublishedPosts(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  
  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: { published: true },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.post.count({ where: { published: true } }),
  ]);
  
  return { posts, total, totalPages: Math.ceil(total / pageSize) };
}

// UPDATE
async function updatePost(id: string, data: { title?: string; content?: string; published?: boolean }) {
  return prisma.post.update({
    where: { id },
    data,
  });
}

// DELETE
async function deletePost(id: string) {
  return prisma.post.delete({
    where: { id },
  });
}
```

</details>

---

### 3.2. Server Actions (Next.js 15)

**Server Actions** là tính năng mạnh mẽ trong Next.js 15, cho phép gọi hàm server **trực tiếp từ client** mà không cần tạo API Routes.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CÁCH TRUYỀN THỐNG (API Routes)               │
│                                                                     │
│   Client Component              API Route              Database     │
│   ┌─────────────┐    fetch()   ┌─────────────┐        ┌────────┐   │
│   │   Form      │ ──────────►  │ /api/users  │ ─────► │ Prisma │   │
│   │   Submit    │              │ POST handler│        │        │   │
│   └─────────────┘ ◄──────────  └─────────────┘ ◄───── └────────┘   │
│                     JSON                                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        SERVER ACTIONS (Mới)                         │
│                                                                     │
│   Client Component                                     Database     │
│   ┌─────────────┐              ┌─────────────┐        ┌────────┐   │
│   │   Form      │  direct call │ createUser()│        │ Prisma │   │
│   │   Submit    │ ───────────► │ "use server"│ ─────► │        │   │
│   └─────────────┘ ◄─────────── └─────────────┘ ◄───── └────────┘   │
│                     result                                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Tại sao dùng Server Actions?**

| Lợi ích | Mô tả |
|---------|-------|
| **Đơn giản hơn** | Không cần tạo API routes, fetch, xử lý response |
| **Type-safe** | TypeScript types tự động được infer giữa client và server |
| **Progressive Enhancement** | Form vẫn hoạt động khi JavaScript bị tắt |
| **Tích hợp với React** | Dùng trực tiếp trong form action, useTransition |
| **Bảo mật** | Server code không bao giờ được gửi đến client |
| **Caching** | Tích hợp với Next.js caching (revalidatePath, revalidateTag) |

**Khi nào dùng Server Actions vs API Routes?**

| Tình huống | Dùng |
|------------|------|
| Form submission (CRUD) | ✅ Server Actions |
| Mutations (tạo, sửa, xóa) | ✅ Server Actions |
| Cần gọi từ mobile app | ❌ API Routes |
| Webhook từ service bên ngoài | ❌ API Routes |
| Public API cho third-party | ❌ API Routes |

---

#### 3.2.1. Cấu trúc thư mục

```
src/
├── actions/                      # Thư mục chứa tất cả Server Actions
│   ├── user.actions.ts           # Actions liên quan đến User
│   ├── project.actions.ts        # Actions liên quan đến Project
│   ├── task.actions.ts           # Actions liên quan đến Task
│   └── auth.actions.ts           # Actions liên quan đến Auth
├── lib/
│   ├── prisma.ts                 # Prisma client
│   └── auth.ts                   # Auth config
└── app/
    └── ...
```

---

#### 3.2.2. Cú pháp cơ bản

**Cách 1: Trong file riêng (khuyến nghị)**

```typescript
// src/actions/user.actions.ts
"use server";  // ← Directive BẮT BUỘC ở đầu file

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createUser(data: { name: string; email: string }) {
  // Code chạy trên server
  const user = await prisma.user.create({ data });
  
  revalidatePath("/users");
  return user;
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
}
```

**Cách 2: Trong Server Component**

```typescript
// app/users/page.tsx (Server Component)
export default async function UsersPage() {
  
  // Định nghĩa action trực tiếp trong component
  async function addUser(formData: FormData) {
    "use server";  // ← Directive trong function
    
    const name = formData.get("name") as string;
    await prisma.user.create({ data: { name } });
    revalidatePath("/users");
  }
  
  return (
    <form action={addUser}>
      <input name="name" />
      <button type="submit">Add</button>
    </form>
  );
}
```

---

#### 3.2.3. Gọi Server Action từ Client

**Cách 1: Trong form action (đơn giản nhất)**

```typescript
import { createUser } from "@/actions/user.actions";

// Server Action được gọi tự động khi submit form
<form action={createUser}>
  <input name="name" />
  <input name="email" type="email" />
  <button type="submit">Create User</button>
</form>
```

**Cách 2: Với useTransition (hiển thị loading state)**

```typescript
"use client";
import { useTransition } from "react";
import { createUser } from "@/actions/user.actions";

function CreateUserButton() {
  const [isPending, startTransition] = useTransition();
  
  async function handleClick() {
    startTransition(async () => {
      const result = await createUser({ 
        name: "Trung", 
        email: "trung@email.com" 
      });
      
      if (result.success) {
        toast.success("Tạo user thành công!");
      } else {
        toast.error(result.error);
      }
    });
  }
  
  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? "Đang tạo..." : "Tạo User"}
    </button>
  );
}
```

**Cách 3: Với useActionState (React 19 / Next.js 15)**

```typescript
"use client";
import { useActionState } from "react";
import { createUser } from "@/actions/user.actions";

function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null);
  
  return (
    <form action={formAction}>
      <input name="name" placeholder="Tên" />
      <input name="email" type="email" placeholder="Email" />
      
      {/* Hiển thị lỗi nếu có */}
      {state?.error && <p className="text-red-500">{state.error}</p>}
      
      <button disabled={isPending}>
        {isPending ? "Đang tạo..." : "Tạo User"}
      </button>
    </form>
  );
}
```

---

#### 3.2.4. Pattern chuẩn cho Server Actions

**Return Type thống nhất:**

```typescript
// Định nghĩa type cho tất cả actions
type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

**Cấu trúc Action hoàn chỉnh:**

```typescript
// src/actions/user.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. SCHEMA VALIDATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CreateUserSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(["ADMIN", "PM", "MEMBER"]).default("MEMBER"),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. RESULT TYPE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. ACTION FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function createUser(
  input: CreateUserInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // STEP 1: Authentication - Kiểm tra đăng nhập
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    // STEP 2: Authorization - Kiểm tra quyền
    if (session.user.role !== "ADMIN") {
      return { success: false, error: "Bạn không có quyền thực hiện" };
    }

    // STEP 3: Validation - Kiểm tra dữ liệu
    const validatedData = CreateUserSchema.safeParse(input);
    if (!validatedData.success) {
      return { 
        success: false, 
        error: validatedData.error.errors[0].message 
      };
    }

    // STEP 4: Business Logic - Kiểm tra email đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.data.email },
    });
    if (existingUser) {
      return { success: false, error: "Email đã được sử dụng" };
    }

    // STEP 5: Hash password
    const hashedPassword = await bcrypt.hash(
      validatedData.data.password, 
      12
    );

    // STEP 6: Database Operation
    const user = await prisma.user.create({
      data: {
        ...validatedData.data,
        password: hashedPassword,
      },
    });

    // STEP 7: Cache Revalidation
    revalidatePath("/admin/users");

    // STEP 8: Return Success
    return { success: true, data: { id: user.id } };
    
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
}
```

---

#### 3.2.5. Các patterns thường dùng

**Pattern 1: Action với ID (bind)**

```typescript
// Actions cần tham số cố định
"use server";

export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { success: true };
}

// Client - bind tham số vào action
import { deleteUser } from "@/actions/user.actions";

function DeleteButton({ userId }: { userId: string }) {
  const deleteUserWithId = deleteUser.bind(null, userId);
  
  return (
    <form action={deleteUserWithId}>
      <button type="submit" className="text-red-500">
        Xóa
      </button>
    </form>
  );
}
```

**Pattern 2: Form với FormData**

```typescript
// Action nhận FormData trực tiếp
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  
  if (!title || title.length < 3) {
    return { success: false, error: "Tiêu đề quá ngắn" };
  }
  
  const post = await prisma.post.create({
    data: { title, content },
  });
  
  revalidatePath("/posts");
  return { success: true, data: { id: post.id } };
}

// Client
<form action={createPost}>
  <input name="title" placeholder="Tiêu đề" required />
  <textarea name="content" placeholder="Nội dung" />
  <button type="submit">Tạo bài viết</button>
</form>
```

**Pattern 3: Redirect sau action**

```typescript
"use server";
import { redirect } from "next/navigation";

export async function createProject(data: ProjectInput) {
  const project = await prisma.project.create({ data });
  
  revalidatePath("/projects");
  
  // Redirect đến trang chi tiết
  redirect(`/projects/${project.id}`);
  // ⚠️ Không return gì sau redirect
}
```

---

#### 3.2.6. Cache Revalidation

**revalidatePath - Revalidate theo path:**

```typescript
"use server";
import { revalidatePath } from "next/cache";

export async function createUser(data: UserInput) {
  await prisma.user.create({ data });
  
  // Revalidate 1 path cụ thể
  revalidatePath("/users");
  
  // Revalidate với layout
  revalidatePath("/users", "layout");
  
  // Revalidate dynamic route
  revalidatePath("/users/[id]", "page");
}
```

**revalidateTag - Revalidate theo tag:**

```typescript
"use server";
import { revalidateTag } from "next/cache";

export async function createUser(data: UserInput) {
  await prisma.user.create({ data });
  
  // Revalidate tất cả data có tag "users"
  revalidateTag("users");
}
```

---

#### 3.2.7. Error Handling

```typescript
"use server";
import { Prisma } from "@prisma/client";

export async function createUser(
  input: CreateUserInput
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate
    const validatedData = CreateUserSchema.safeParse(input);
    if (!validatedData.success) {
      return { 
        success: false, 
        error: validatedData.error.errors[0].message,
      };
    }
    
    // Create
    const user = await prisma.user.create({ 
      data: validatedData.data 
    });
    
    return { success: true, data: { id: user.id } };
    
  } catch (error) {
    // Xử lý lỗi Prisma cụ thể
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Email đã tồn tại" };
      }
      if (error.code === "P2025") {
        return { success: false, error: "Không tìm thấy record" };
      }
    }
    
    // Log lỗi không mong muốn
    console.error("Unexpected error:", error);
    
    // Return lỗi chung (không expose chi tiết cho client)
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
}
```

---

#### 📝 Bài tập thực hành Server Actions

**Bài 1: Tạo CRUD Actions cho Task**
```typescript
// TODO: Tạo các actions sau:
// - createTask(title, description, projectId)
// - updateTask(id, data)
// - deleteTask(id)
// - toggleTaskStatus(id)
```

**Bài 2: Tạo Form với validation**
```typescript
// TODO: Tạo form tạo Project với:
// - Validation: title min 3 ký tự
// - Hiển thị loading state
// - Hiển thị error message
// - Redirect về /projects sau khi tạo thành công
```

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 1</strong></summary>

```typescript
// src/actions/task.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

// CREATE
const CreateTaskSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  projectId: z.string().cuid(),
});

export async function createTask(
  input: z.infer<typeof CreateTaskSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    const validatedData = CreateTaskSchema.safeParse(input);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.errors[0].message };
    }

    const task = await prisma.task.create({
      data: {
        ...validatedData.data,
        status: "TODO",
        assigneeId: session.user.id,
      },
    });

    revalidatePath(`/projects/${input.projectId}`);
    return { success: true, data: { id: task.id } };
  } catch (error) {
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
}

// UPDATE
export async function updateTask(
  id: string,
  data: { title?: string; description?: string; status?: string }
): Promise<ActionResult> {
  try {
    const task = await prisma.task.update({
      where: { id },
      data,
    });
    
    revalidatePath(`/projects/${task.projectId}`);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
}

// DELETE
export async function deleteTask(id: string): Promise<ActionResult> {
  try {
    const task = await prisma.task.delete({ where: { id } });
    
    revalidatePath(`/projects/${task.projectId}`);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
}

// TOGGLE STATUS
export async function toggleTaskStatus(id: string): Promise<ActionResult> {
  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return { success: false, error: "Task không tồn tại" };
    }

    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    
    await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath(`/projects/${task.projectId}`);
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
}
```

</details>

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 2</strong></summary>

```typescript
// src/actions/project.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateProjectSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
  description: z.string().optional(),
});

type ActionResult = 
  | { success: true; data: { id: string } }
  | { success: false; error: string };

export async function createProject(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Chưa đăng nhập" };
  }

  const input = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
  };

  const validatedData = CreateProjectSchema.safeParse(input);
  if (!validatedData.success) {
    return { 
      success: false, 
      error: validatedData.error.errors[0].message 
    };
  }

  const project = await prisma.project.create({
    data: validatedData.data,
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}
```

```typescript
// app/projects/new/page.tsx
"use client";

import { useActionState } from "react";
import { createProject } from "@/actions/project.actions";

export default function NewProjectPage() {
  const [state, formAction, isPending] = useActionState(createProject, null);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tạo Project mới</h1>
      
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block mb-1">Tiêu đề</label>
          <input 
            name="title" 
            className="w-full border p-2 rounded"
            placeholder="Nhập tiêu đề project"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Mô tả</label>
          <textarea 
            name="description"
            className="w-full border p-2 rounded"
            placeholder="Nhập mô tả (không bắt buộc)"
          />
        </div>
        
        {state?.error && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            {state.error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {isPending ? "Đang tạo..." : "Tạo Project"}
        </button>
      </form>
    </div>
  );
}
```

</details>

---

### 3.3. Zod Validation

**Zod** là thư viện **validation schema-first** cho TypeScript. Nó cho phép bạn định nghĩa **schema** (cấu trúc dữ liệu) và tự động **validate** + **generate types**.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ZOD WORKFLOW                                │
│                                                                     │
│   1. Định nghĩa Schema          2. TypeScript Type        3. Validate
│   ┌─────────────────┐          ┌─────────────────┐      ┌──────────┐
│   │ z.object({      │   infer  │ type User = {   │      │ schema   │
│   │   name: z.      │ ──────►  │   name: string  │      │.safeParse│
│   │     string()    │          │ }               │      │ (data)   │
│   │ })              │          │                 │      │          │
│   └─────────────────┘          └─────────────────┘      └──────────┘
│         Schema                     TypeScript                Input
│         (Runtime)                  (Compile-time)          Validation
└─────────────────────────────────────────────────────────────────────┘
```

**Tại sao dùng Zod?**

| Lợi ích | Mô tả |
|---------|-------|
| **Type-safe** | TypeScript types tự động được infer từ schema |
| **Runtime validation** | Validate dữ liệu khi chạy (không chỉ compile-time) |
| **Zero dependencies** | Không phụ thuộc thư viện khác |
| **Tích hợp hoàn hảo** | Works great với Next.js, React Hook Form, tRPC |
| **Schema composition** | Dễ dàng kết hợp, extend, modify schemas |

---

#### 3.3.1. Primitive Types - Các kiểu cơ bản

```typescript
import { z } from "zod";

// String
const nameSchema = z.string();
nameSchema.parse("Trung");        // ✅ "Trung"
nameSchema.parse(123);            // ❌ Throws error

// Number
const ageSchema = z.number();
ageSchema.parse(25);              // ✅ 25
ageSchema.parse("25");            // ❌ Throws error

// Boolean
const isActiveSchema = z.boolean();

// Date
const dateSchema = z.date();

// Literal - giá trị cố định
const adminSchema = z.literal("ADMIN");
adminSchema.parse("ADMIN");       // ✅
adminSchema.parse("USER");        // ❌

// Enum
const roleSchema = z.enum(["ADMIN", "PM", "MEMBER"]);
```

---

#### 3.3.2. String Validators

```typescript
import { z } from "zod";

const emailSchema = z.string()
  .email("Email không hợp lệ")
  .min(5, "Email phải có ít nhất 5 ký tự")
  .max(100, "Email không được quá 100 ký tự");

const passwordSchema = z.string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .max(100)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Mật khẩu phải có chữ hoa, chữ thường và số"
  );

const urlSchema = z.string().url("URL không hợp lệ");
const uuidSchema = z.string().uuid("UUID không hợp lệ");
const cuidSchema = z.string().cuid("CUID không hợp lệ");

// Các validators khác
z.string().startsWith("https://");
z.string().endsWith(".com");
z.string().includes("@");
z.string().trim();                        // Loại bỏ whitespace
z.string().toLowerCase();
z.string().toUpperCase();
```

---

#### 3.3.3. Number Validators

```typescript
import { z } from "zod";

const ageSchema = z.number()
  .int("Tuổi phải là số nguyên")
  .positive("Tuổi phải là số dương")
  .min(18, "Phải từ 18 tuổi trở lên")
  .max(120, "Tuổi không hợp lệ");

const priceSchema = z.number()
  .nonnegative("Giá không được âm")    // >= 0
  .multipleOf(1000, "Giá phải là bội số của 1000");

// Coerce - Tự động chuyển đổi string thành number
const coercedNumber = z.coerce.number();
coercedNumber.parse("42");              // ✅ 42 (number)
coercedNumber.parse("abc");             // ❌ NaN → Error
```

---

#### 3.3.4. Object Schema

```typescript
import { z } from "zod";

// Định nghĩa Object schema
const UserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().optional(),           // Optional field
  role: z.enum(["ADMIN", "PM", "MEMBER"]),
  createdAt: z.date().default(() => new Date()),
});

// ⭐ Infer TypeScript type từ schema
type User = z.infer<typeof UserSchema>;
// → {
//     id: string;
//     name: string;
//     email: string;
//     age?: number | undefined;
//     role: "ADMIN" | "PM" | "MEMBER";
//     createdAt: Date;
//   }

// Sử dụng
const user = UserSchema.parse({
  id: "clx123abc",
  name: "Trung",
  email: "trung@email.com",
  role: "ADMIN",
});
```

---

#### 3.3.5. Schema Modifiers

```typescript
import { z } from "zod";

// Optional - có thể undefined
const optionalString = z.string().optional();
// type: string | undefined

// Nullable - có thể null  
const nullableString = z.string().nullable();
// type: string | null

// Default - giá trị mặc định
const defaultString = z.string().default("Guest");
// parse(undefined) → "Guest"

// Array
const stringArray = z.array(z.string());
const numbersArray = z.array(z.number()).min(1).max(10);

// Object utilities
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

// Partial - tất cả fields thành optional
const PartialUser = UserSchema.partial();
// type: { name?: string; email?: string; password?: string }

// Pick - chỉ lấy một số fields
const LoginSchema = UserSchema.pick({ email: true, password: true });
// type: { email: string; password: string }

// Omit - loại bỏ một số fields
const PublicUser = UserSchema.omit({ password: true });
// type: { name: string; email: string }

// Extend - mở rộng schema
const CreateUserSchema = UserSchema.extend({
  confirmPassword: z.string(),
});
```

---

#### 3.3.6. Transform & Refine

```typescript
import { z } from "zod";

// Transform - biến đổi dữ liệu sau khi validate
const DateFromString = z.string()
  .transform((str) => new Date(str));
// Input: string → Output: Date

const SlugSchema = z.string()
  .transform((str) => str.toLowerCase().replace(/\s+/g, "-"));
// "Hello World" → "hello-world"

// Refine - validation custom
const PasswordSchema = z.string()
  .min(8)
  .refine(
    (password) => /[A-Z]/.test(password),
    { message: "Phải có ít nhất 1 chữ hoa" }
  )
  .refine(
    (password) => /[0-9]/.test(password),
    { message: "Phải có ít nhất 1 số" }
  );

// SuperRefine - validation object với nhiều fields
const RegisterSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    });
  }
});
```

---

#### 3.3.7. Validation Methods

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

const input = { name: "T", email: "invalid" };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// parse() - Throws error nếu invalid
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
try {
  const user = UserSchema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// safeParse() - Không throw, trả về result (KHUYẾN NGHỊ)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const result = UserSchema.safeParse(input);

if (result.success) {
  // result.data có type User
  console.log(result.data);
} else {
  // result.error có type ZodError
  console.log(result.error.errors);
  // [
  //   { path: ["name"], message: "String must contain at least 2 character(s)" },
  //   { path: ["email"], message: "Invalid email" }
  // ]
}
```

---

#### 3.3.8. Tích hợp với Server Actions

```typescript
// src/actions/user.actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

// 1. Định nghĩa Schema
const CreateUserSchema = z.object({
  name: z.string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(50, "Tên không được quá 50 ký tự"),
  email: z.string()
    .email("Email không hợp lệ")
    .toLowerCase(),  // Tự động chuyển thành lowercase
  password: z.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  role: z.enum(["ADMIN", "PM", "MEMBER"]).default("MEMBER"),
});

// 2. Infer type
type CreateUserInput = z.infer<typeof CreateUserSchema>;

// 3. Action với validation
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; field?: string };

export async function createUser(
  input: CreateUserInput
): Promise<ActionResult<{ id: string }>> {
  // Validate với safeParse
  const validated = CreateUserSchema.safeParse(input);
  
  if (!validated.success) {
    const firstError = validated.error.errors[0];
    return {
      success: false,
      error: firstError.message,
      field: firstError.path[0] as string,
    };
  }
  
  // validated.data đã được type-safe và transform
  const user = await prisma.user.create({
    data: validated.data,
  });
  
  return { success: true, data: { id: user.id } };
}
```

---

#### 3.3.9. Tích hợp với React Hook Form

```bash
# Cài đặt thêm resolver
npm install @hookform/resolvers
```

```typescript
// components/RegisterForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema
const RegisterSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterInput = z.infer<typeof RegisterSchema>;

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),  // ← Tích hợp Zod
  });
  
  async function onSubmit(data: RegisterInput) {
    // data đã được validate
    console.log(data);
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input {...register("name")} placeholder="Tên" className="w-full p-2 border rounded" />
        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
      </div>
      
      <div>
        <input {...register("email")} type="email" placeholder="Email" className="w-full p-2 border rounded" />
        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
      </div>
      
      <div>
        <input {...register("password")} type="password" placeholder="Mật khẩu" className="w-full p-2 border rounded" />
        {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
      </div>
      
      <div>
        <input {...register("confirmPassword")} type="password" placeholder="Xác nhận mật khẩu" className="w-full p-2 border rounded" />
        {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 text-white p-2 rounded">
        {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
      </button>
    </form>
  );
}
```

---

#### 📝 Bài tập thực hành Zod

**Bài 1: Tạo Schema cho Project**
```typescript
// TODO: Tạo CreateProjectSchema với:
// - title: string, min 3, max 100
// - description: string optional
// - startDate: string transform thành Date
// - members: array of cuid, min 1 member
```

**Bài 2: Validation với refine**
```typescript
// TODO: Tạo DateRangeSchema với:
// - startDate: Date
// - endDate: Date  
// - Refine: endDate phải sau startDate
```

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 1</strong></summary>

```typescript
import { z } from "zod";

const CreateProjectSchema = z.object({
  title: z.string()
    .min(3, "Tiêu đề phải có ít nhất 3 ký tự")
    .max(100, "Tiêu đề không được quá 100 ký tự"),
  
  description: z.string().optional(),
  
  startDate: z.string()
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Ngày không hợp lệ",
    }),
  
  members: z.array(z.string().cuid())
    .min(1, "Cần ít nhất 1 thành viên"),
});

type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
// {
//   title: string;
//   description?: string | undefined;
//   startDate: Date;
//   members: string[];
// }
```

</details>

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 2</strong></summary>

```typescript
import { z } from "zod";

const DateRangeSchema = z.object({
  startDate: z.coerce.date(),  // Tự động chuyển string thành Date
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],  // Lỗi sẽ hiển thị ở field endDate
  }
);

// Sử dụng
const result = DateRangeSchema.safeParse({
  startDate: "2024-01-15",
  endDate: "2024-01-10",  // ❌ Trước startDate
});

if (!result.success) {
  console.log(result.error.errors[0].message);
  // "Ngày kết thúc phải sau ngày bắt đầu"
}
```

</details>

---

### 3.4. Authentication & Authorization với Auth.js v5

**Authentication** (Xác thực) là một trong những kiến thức **quan trọng nhất** cho Backend Developer. Phần này sẽ giải thích chi tiết các khái niệm và cách triển khai trong dự án NovaWork Hub.

---

#### 3.4.1. Các khái niệm cơ bản

**🔐 Authentication vs Authorization**

| Khái niệm | Câu hỏi | Ví dụ |
|-----------|---------|-------|
| **Authentication** (Xác thực) | "Bạn là ai?" | Đăng nhập bằng email/password |
| **Authorization** (Phân quyền) | "Bạn được phép làm gì?" | ADMIN có thể xóa user, MEMBER thì không |

```
              Authentication Flow
┌──────────┐    "Tôi là Trung"    ┌──────────┐
│  Client  │ ──────────────────▶  │  Server  │
│ (Browser)│                      │          │
│          │  ✅ "Đúng rồi!"      │  Kiểm tra│
│          │ ◀──────────────────  │  danh tính│
└──────────┘                      └──────────┘
```

---

#### 3.4.2. Session vs Token - Hai cách lưu trạng thái đăng nhập

**🍪 Session-based Authentication**

```
              Session-based Flow
┌──────────┐                        ┌──────────┐
│  Client  │  1. Login (user/pass)  │  Server  │
│          │ ─────────────────────▶ │          │
│          │                        │  Tạo     │
│          │  2. Set-Cookie:        │  Session │
│          │     sessionId=abc123   │  ID lưu  │
│          │ ◀───────────────────── │  vào DB  │
│          │                        │          │
│  Cookie  │  3. Request kèm cookie │          │
│  lưu     │ ─────────────────────▶ │  Kiểm    │
│  session │                        │  tra DB  │
│  ID      │  4. Response           │          │
│          │ ◀───────────────────── │          │
└──────────┘                        └──────────┘
```

**Đặc điểm Session:**
- **Session ID** lưu trong **cookie** của browser
- Server phải **lưu session vào database/memory**
- Phù hợp với **web truyền thống**
- **Auth.js sử dụng cách này mặc định**

**🎫 Token-based Authentication (JWT)**

```
              Token-based Flow (JWT)
┌──────────┐                        ┌──────────┐
│  Client  │  1. Login (user/pass)  │  Server  │
│          │ ─────────────────────▶ │          │
│          │                        │  Tạo JWT │
│          │  2. Token: eyJhbGci... │  (không  │
│          │ ◀───────────────────── │  lưu DB) │
│          │                        │          │
│  Lưu     │  3. Request kèm token  │          │
│  Token   │     Authorization:     │  Giải mã │
│  ở local │     Bearer eyJhbGci... │  Token   │
│          │ ─────────────────────▶ │  để xác  │
│          │                        │  thực    │
│          │  4. Response           │          │
│          │ ◀───────────────────── │          │
└──────────┘                        └──────────┘
```

**Đặc điểm Token:**
- Token lưu ở **client** (localStorage, cookie, memory)
- Server **không cần lưu state** (stateless)
- Phù hợp với **API, Mobile app, Microservices**

**So sánh Session vs Token:**

| Tiêu chí | Session | Token (JWT) |
|----------|---------|-------------|
| **Lưu trữ** | Server (DB/Redis) | Client (localStorage/cookie) |
| **Stateful/Stateless** | Stateful | Stateless |
| **Khả năng mở rộng** | Khó (cần sync session) | Dễ (không cần sync) |
| **Bảo mật** | Tốt hơn (có thể revoke) | Khó revoke trước hạn |
| **Phù hợp với** | Web truyền thống | API, Mobile, Microservices |
| **Auth.js** | ✅ Mặc định | ✅ Hỗ trợ |

---

#### 3.4.3. JWT (JSON Web Token) là gì?

JWT là một **chuỗi mã hóa** chứa thông tin user, có thể được **xác minh** mà không cần tra cứu database.

**Cấu trúc JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRydW5nIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
       │                                      │                                │
   ┌───▼───┐                           ┌──────▼──────┐                  ┌───────▼───────┐
   │HEADER │                           │   PAYLOAD   │                  │   SIGNATURE   │
   │{      │                           │{            │                  │HMACSHA256(    │
   │ "alg":│                           │ "sub":"123",│                  │  header +     │
   │ "HS256│                           │ "name":"Trung"│                │  payload,     │
   │ "typ":│                           │ "role":"ADMIN"│                │  secret_key   │
   │ "JWT" │                           │ "exp":16234..│                 │)              │
   │}      │                           │}            │                  │               │
   └───────┘                           └─────────────┘                  └───────────────┘
   Thuật toán                          Dữ liệu user                     Chữ ký xác thực
```

**JWT Payload thường chứa:**
```typescript
{
  "sub": "user-123",           // Subject - ID của user
  "name": "Trung Đặng",        // Tên user
  "email": "trung@email.com",  // Email
  "role": "ADMIN",             // Vai trò
  "iat": 1703500000,           // Issued At - thời điểm tạo
  "exp": 1703586400            // Expiration - hết hạn
}
```

---

#### 3.4.4. Đăng ký (Register)

**Flow đăng ký user mới:**

```typescript
// src/actions/auth.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// 1. Schema validation
const RegisterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
});

export async function register(input: z.infer<typeof RegisterSchema>) {
  try {
    // 2. Validate input
    const validatedData = RegisterSchema.safeParse(input);
    if (!validatedData.success) {
      return { success: false, error: validatedData.error.errors[0].message };
    }

    const { email, password, name } = validatedData.data;

    // 3. Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Email đã được sử dụng" };
    }

    // 4. Hash password (KHÔNG BAO GIỜ lưu password gốc!)
    const hashedPassword = await bcrypt.hash(password, 12);
    // 12 = salt rounds - số vòng mã hóa, càng cao càng an toàn nhưng chậm hơn

    // 5. Tạo user trong database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "MEMBER", // Role mặc định
      },
    });

    // 6. (Optional) Gửi email xác thực
    // await sendVerificationEmail(user.email);

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
}
```

**⚠️ Lưu ý quan trọng về Password:**
- **KHÔNG BAO GIỜ** lưu password dạng plain text
- **LUÔN** sử dụng hashing algorithm như **bcrypt**, **argon2**
- **Salt rounds** từ 10-12 là phù hợp cho hầu hết ứng dụng

---

#### 3.4.5. Đăng nhập thường (Credentials)

**Flow đăng nhập với email/password:**

```typescript
// src/actions/auth.actions.ts
"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function login(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Email hoặc mật khẩu không đúng" };
        default:
          return { success: false, error: "Đã có lỗi xảy ra" };
      }
    }
    throw error; // Re-throw để Next.js xử lý redirect
  }
}
```

---

#### 3.4.6. Đăng nhập bằng Google (OAuth)

**OAuth 2.0** = Cho phép đăng nhập thông qua bên thứ 3 (Google, Facebook, GitHub...)

```
                    OAuth Flow (Đăng nhập Google)
    
┌──────────┐        ┌──────────┐        ┌──────────┐
│   User   │        │  Your    │        │  Google  │
│ (Browser)│        │  Server  │        │  Server  │
└────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │
     │ 1. Click "Login   │                   │
     │    with Google"   │                   │
     │──────────────────▷│                   │
     │                   │                   │
     │ 2. Redirect to    │                   │
     │    Google login   │                   │
     │◁──────────────────│                   │
     │                   │                   │
     │ 3. User đăng nhập │                   │
     │    và cho phép    │                   │
     │──────────────────────────────────────▷│
     │                   │                   │
     │ 4. Redirect về    │                   │
     │    app với code   │                   │
     │◁──────────────────────────────────────│
     │                   │                   │
     │ 5. Gửi code       │                   │
     │──────────────────▷│                   │
     │                   │ 6. Đổi code lấy   │
     │                   │    access token   │
     │                   │──────────────────▷│
     │                   │                   │
     │                   │ 7. Trả về user    │
     │                   │    info           │
     │                   │◁──────────────────│
     │                   │                   │
     │ 8. Tạo session,   │                   │
     │    trả về user    │                   │
     │◁──────────────────│                   │
```

**Cấu hình Google Provider trong Auth.js:**

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // 🌐 Provider 1: Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // 🔑 Provider 2: Email/Password
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
    // Thêm thông tin vào JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
      }
      
      // Xử lý khi đăng nhập bằng OAuth
      if (account?.provider === "google") {
        // Tìm hoặc tạo user từ Google account
        const existingUser = await prisma.user.findUnique({
          where: { email: token.email! },
        });
        
        if (!existingUser) {
          // Tạo user mới nếu chưa tồn tại
          const newUser = await prisma.user.create({
            data: {
              email: token.email!,
              name: token.name!,
              avatar: token.picture,
              role: "MEMBER",
              // Không cần password cho OAuth users
            },
          });
          token.role = newUser.role;
          token.sub = newUser.id;
        } else {
          token.role = existingUser.role;
          token.sub = existingUser.id;
        }
      }
      
      return token;
    },
    
    // Thêm thông tin vào session
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
    error: "/login", // Redirect về login nếu có lỗi
  },
});
```

**Cấu hình Google OAuth:**

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** > **Credentials**
4. Tạo **OAuth 2.0 Client ID**
5. Thêm Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy `Client ID` và `Client Secret` vào file `.env`:

```env
# .env.local
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

#### 3.4.7. Middleware bảo vệ Routes

```typescript
// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Routes công khai - ai cũng truy cập được
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

  // ❌ Chưa đăng nhập mà truy cập protected route
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // ❌ Không phải admin mà truy cập admin route
  if (isAdminRoute && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // ✅ Cho phép truy cập
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

#### 3.4.8. Sử dụng Session trong Components

**Trong Server Component:**
```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

**Trong Client Component:**
```typescript
// components/UserMenu.tsx
"use client";

import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <a href="/login">Đăng nhập</a>;
  }
  
  return (
    <div>
      <span>{session.user.name}</span>
      <button onClick={() => signOut()}>Đăng xuất</button>
    </div>
  );
}
```

---

#### 📝 Bài tập thực hành Authentication

**Bài 1: Implement Register Form**
```typescript
// TODO: Tạo form đăng ký với các fields:
// - Email (validate format)
// - Password (validate min 6 ký tự)
// - Confirm Password (validate khớp với password)
// - Name (validate min 2 ký tự)
```

**Bài 2: Implement Role-based UI**
```typescript
// TODO: Hiển thị/ẩn các elements dựa trên role:
// - ADMIN: Thấy tất cả menu items
// - PM: Không thấy menu "Quản lý Users"
// - MEMBER: Chỉ thấy menu "Dashboard" và "Tasks"
```

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 1</strong></summary>

```typescript
// components/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "@/actions/auth.actions";

const RegisterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterInput = z.infer<typeof RegisterSchema>;

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setError(null);

    const result = await registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (!result.success) {
      setError(result.error);
    } else {
      // Redirect to login page
      window.location.href = "/login?registered=true";
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <div className="error">{error}</div>}
      
      <input {...register("name")} placeholder="Tên" />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register("email")} type="email" placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register("password")} type="password" placeholder="Mật khẩu" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <input {...register("confirmPassword")} type="password" placeholder="Xác nhận mật khẩu" />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Đang xử lý..." : "Đăng ký"}
      </button>
    </form>
  );
}
```

</details>

<details>
<summary><strong>🔑 Bấm để xem lời giải Bài 2</strong></summary>

```typescript
// components/Navigation.tsx
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

type MenuItem = {
  label: string;
  href: string;
  roles: string[]; // Roles được phép truy cập
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", roles: ["ADMIN", "PM", "MEMBER"] },
  { label: "Projects", href: "/projects", roles: ["ADMIN", "PM"] },
  { label: "Tasks", href: "/tasks", roles: ["ADMIN", "PM", "MEMBER"] },
  { label: "Team", href: "/team", roles: ["ADMIN", "PM"] },
  { label: "Quản lý Users", href: "/admin/users", roles: ["ADMIN"] },
  { label: "Cài đặt hệ thống", href: "/admin/settings", roles: ["ADMIN"] },
];

export function Navigation() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "MEMBER";

  // Lọc menu items dựa trên role
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <nav>
      <ul>
        {visibleMenuItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Component để kiểm tra quyền
export function RoleGate({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null; // Không hiển thị gì
  }

  return <>{children}</>;
}

// Sử dụng RoleGate
function AdminPanel() {
  return (
    <RoleGate allowedRoles={["ADMIN"]}>
      <div>Chỉ ADMIN mới thấy panel này</div>
    </RoleGate>
  );
}
```

</details>

---

## 4. Tài nguyên học tập

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
