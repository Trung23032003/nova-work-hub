/**
 * ============================================================================
 * MENU CONFIGURATION - NOVAWORK HUB
 * ============================================================================
 * 
 * File cấu hình menu cho Sidebar
 * Sử dụng Lucide React icons
 * 
 * CÁC MENU ITEM:
 * - mainMenuItems: Menu chính (tất cả users đều thấy)
 * - adminMenuItems: Menu quản trị (một số chỉ Admin mới thấy)
 * 
 * ============================================================================
 */

import {
    Home,
    FolderKanban,
    CheckSquare,
    Users,
    Settings,
    Shield,
    type LucideIcon,
} from "lucide-react";

/**
 * Interface cho mỗi menu item
 */
export interface MenuItem {
    /** Tiêu đề hiển thị */
    title: string;
    /** Đường dẫn URL */
    href: string;
    /** Lucide icon component */
    icon: LucideIcon;
    /** Nếu true, chỉ ADMIN mới thấy menu này */
    adminOnly?: boolean;
}

/**
 * Menu chính - Hiển thị cho tất cả users đã đăng nhập
 */
export const mainMenuItems: MenuItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home
    },
    {
        title: "Dự án",
        href: "/projects",
        icon: FolderKanban
    },
    {
        title: "Công việc",
        href: "/tasks",
        icon: CheckSquare
    },
    {
        title: "Nhân sự",
        href: "/users",
        icon: Users
    },
];

/**
 * Menu quản trị - Một số mục chỉ Admin mới thấy
 */
export const adminMenuItems: MenuItem[] = [
    {
        title: "Quản trị",
        href: "/admin",
        icon: Shield,
        adminOnly: true  // Chỉ Admin mới thấy
    },
    {
        title: "Cài đặt",
        href: "/settings",
        icon: Settings
        // Không có adminOnly -> tất cả user đều thấy
    },
];
