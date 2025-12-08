import { z } from "zod";

/**
 * ZOD VALIDATION SCHEMAS
 * 
 * Giải thích về Zod:
 * - Zod là thư viện validation schema-first
 * - Định nghĩa schema 1 lần, dùng cho:
 *   1. Form validation (client-side)
 *   2. Server Action validation (server-side)
 *   3. Tự động infer TypeScript types
 * 
 * Pattern: SchemaName + Schema suffix
 * Type inference: z.infer<typeof SchemaName>
 */

// ============================================
// AUTH SCHEMAS
// ============================================

export const LoginSchema = z.object({
    email: z
        .string()
        .min(1, "Email là bắt buộc")
        .email("Email không hợp lệ"),
    password: z
        .string()
        .min(1, "Mật khẩu là bắt buộc")
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// ============================================
// PROJECT SCHEMAS
// ============================================

export const CreateProjectSchema = z.object({
    name: z
        .string()
        .min(1, "Tên dự án là bắt buộc")
        .max(200, "Tên dự án không quá 200 ký tự"),
    code: z
        .string()
        .min(1, "Mã dự án là bắt buộc")
        .max(20, "Mã dự án không quá 20 ký tự")
        .regex(/^[A-Z0-9-]+$/, "Mã dự án chỉ chứa chữ IN HOA, số và dấu -"),
    description: z.string().optional(),
    clientName: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    startDate: z.coerce.date().optional(), // coerce: tự động convert string -> Date
    dueDate: z.coerce.date().optional(),
    pmId: z.string().min(1, "Người quản lý dự án là bắt buộc"),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
    id: z.string().min(1),
    status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "DONE", "CANCELED"]).optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// ============================================
// TASK SCHEMAS
// ============================================

export const CreateTaskSchema = z.object({
    title: z
        .string()
        .min(1, "Tiêu đề task là bắt buộc")
        .max(500, "Tiêu đề không quá 500 ký tự"),
    description: z.string().optional(),
    projectId: z.string().min(1, "Dự án là bắt buộc"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).default("TODO"),
    assigneeId: z.string().optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
    estimateHours: z.coerce.number().min(0).optional(),
    type: z.string().optional(), // bug, feature, etc.
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
    id: z.string().min(1),
    position: z.number().optional(), // Cho Kanban drag-drop
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// ============================================
// USER SCHEMAS
// ============================================

export const UpdateProfileSchema = z.object({
    name: z.string().min(1, "Tên là bắt buộc").max(100),
    image: z.string().url().optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const CreateUserSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    name: z.string().min(1, "Tên là bắt buộc"),
    password: z
        .string()
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
        .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số"),
    role: z.enum(["ADMIN", "PM", "MEMBER", "VIEWER"]).default("MEMBER"),
    departmentId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// ============================================
// COMMENT & TIME LOG SCHEMAS
// ============================================

export const AddCommentSchema = z.object({
    taskId: z.string().min(1),
    content: z.string().min(1, "Nội dung comment là bắt buộc"),
});

export type AddCommentInput = z.infer<typeof AddCommentSchema>;

export const LogTimeSchema = z.object({
    taskId: z.string().min(1),
    hours: z.coerce.number().min(0.25, "Tối thiểu 15 phút").max(24, "Tối đa 24 giờ"),
    date: z.coerce.date().default(() => new Date()),
    note: z.string().optional(),
});

export type LogTimeInput = z.infer<typeof LogTimeSchema>;
