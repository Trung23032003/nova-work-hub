import { LucideIcon } from "lucide-react";

/**
 * Types cho Navigation/Menu
 * 
 * Sử dụng cho Sidebar và các menu dropdown
 */

export type NavItem = {
    title: string;
    href: string;
    icon?: LucideIcon;
    disabled?: boolean;
    external?: boolean;
    badge?: string; // Hiển thị badge (VD: "New", số lượng)
    // Role-based access
    roles?: ("ADMIN" | "PM" | "MEMBER" | "VIEWER")[];
};

export type NavGroup = {
    title: string;
    items: NavItem[];
};

export type SidebarNavConfig = NavGroup[];
