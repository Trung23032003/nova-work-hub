/**
 * ============================================================================
 * SIDEBAR CONTEXT - NOVAWORK HUB
 * ============================================================================
 * 
 * Context để quản lý trạng thái ẩn/hiện của Sidebar
 * Cho phép các component khác (Header, Layout) biết sidebar đang mở hay đóng
 * 
 * ============================================================================
 */

"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    /** Sidebar đang mở (expanded) hay đóng (collapsed) */
    isOpen: boolean;
    /** Hàm toggle mở/đóng sidebar */
    toggle: () => void;
    /** Hàm set trực tiếp trạng thái */
    setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * Hook để sử dụng sidebar context
 */
export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider");
    }
    return context;
}

/**
 * Provider component - wrap layout để các children có thể access sidebar state
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
    // Mặc định sidebar mở
    const [isOpen, setIsOpen] = useState(true);

    // Đọc trạng thái từ localStorage khi mount (nếu có)
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-open");
        if (saved !== null) {
            setIsOpen(saved === "true");
        }
    }, []);

    // Lưu vào localStorage khi thay đổi
    useEffect(() => {
        localStorage.setItem("sidebar-open", String(isOpen));
    }, [isOpen]);

    const toggle = () => setIsOpen((prev) => !prev);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, setIsOpen }}>
            {children}
        </SidebarContext.Provider>
    );
}
