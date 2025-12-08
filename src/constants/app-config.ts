/**
 * Cấu hình chung của ứng dụng
 * 
 * Tập trung các thông tin cố định để dễ thay đổi sau này
 */

export const APP_CONFIG = {
    name: "NovaWork Hub",
    description: "Hệ thống quản lý công việc nội bộ doanh nghiệp",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    // Metadata cho SEO
    meta: {
        title: "NovaWork Hub - Quản lý Dự án & Công việc",
        description: "Nền tảng quản lý dự án, task và cộng tác dành cho doanh nghiệp",
        keywords: ["quản lý dự án", "task management", "kanban", "enterprise"],
    },
} as const;

// Các route paths để tránh hardcode strings
export const ROUTES = {
    home: "/",
    login: "/login",
    dashboard: "/dashboard",
    projects: "/projects",
    tasks: "/tasks",
    calendar: "/calendar",
    reports: "/reports",
    admin: {
        users: "/admin/users",
        settings: "/admin/settings",
    },
} as const;
