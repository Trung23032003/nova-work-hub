/**
 * Mapping các enum values sang display text và màu sắc
 * 
 * Đây là pattern quan trọng: thay vì hardcode text/màu trong component,
 * ta tập trung tại đây để:
 * 1. Dễ dàng thay đổi
 * 2. Hỗ trợ đa ngôn ngữ sau này
 * 3. Nhất quán trong toàn ứng dụng
 */

// User Roles
export const USER_ROLE_LABELS = {
    ADMIN: "Quản trị viên",
    PM: "Quản lý dự án",
    MEMBER: "Thành viên",
    VIEWER: "Người xem",
} as const;

export const USER_ROLE_COLORS = {
    ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    PM: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    MEMBER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
} as const;

// Project Status
export const PROJECT_STATUS_LABELS = {
    PLANNING: "Đang lên kế hoạch",
    IN_PROGRESS: "Đang thực hiện",
    ON_HOLD: "Tạm dừng",
    DONE: "Hoàn thành",
    CANCELED: "Đã hủy",
} as const;

export const PROJECT_STATUS_COLORS = {
    PLANNING: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    ON_HOLD: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    DONE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    CANCELED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;

// Task Status
export const TASK_STATUS_LABELS = {
    TODO: "Cần làm",
    IN_PROGRESS: "Đang làm",
    REVIEW: "Đang review",
    DONE: "Hoàn thành",
} as const;

export const TASK_STATUS_COLORS = {
    TODO: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
    IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    REVIEW: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    DONE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
} as const;

// Priority
export const PRIORITY_LABELS = {
    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao",
    CRITICAL: "Khẩn cấp",
} as const;

export const PRIORITY_COLORS = {
    LOW: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
    MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
} as const;
