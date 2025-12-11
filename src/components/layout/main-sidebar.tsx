/**
 * ============================================================================
 * MAIN SIDEBAR COMPONENT - NOVAWORK HUB
 * ============================================================================
 * 
 * Sidebar chính hiển thị navigation menu
 * 
 * TÍNH NĂNG:
 * - Hiển thị menu theo role của user
 * - Highlight active menu item
 * - Responsive: Scroll nếu menu dài
 * - Collapse/Expand: Nút ẩn/hiện sidebar bên cạnh logo
 * 
 * ============================================================================
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { mainMenuItems, adminMenuItems } from "@/constants/menus";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar-context";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Icon component cho nút toggle sidebar
 * - Hình chữ nhật chia 2 phần
 * - isOpen=true: phần tối lớn hơn (sidebar mở)
 * - isOpen=false: phần trắng lớn hơn (sidebar đóng)
 */
function SidebarToggleIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <div className="w-5 h-4 flex border border-current rounded-sm overflow-hidden">
            {/* Phần bên trái (sidebar) */}
            <div
                className={cn(
                    "h-full transition-all duration-300",
                    isOpen
                        ? "w-[60%] bg-current"  // Mở: phần tối lớn hơn
                        : "w-[30%] bg-current"  // Đóng: phần tối nhỏ hơn
                )}
            />
            {/* Phần bên phải (content area) */}
            <div
                className={cn(
                    "h-full transition-all duration-300",
                    isOpen
                        ? "w-[40%]"  // Mở: phần trắng nhỏ hơn
                        : "w-[70%]"  // Đóng: phần trắng lớn hơn
                )}
            />
        </div>
    );
}

export function MainSidebar() {
    // =========================================================================
    // HOOKS
    // =========================================================================

    const pathname = usePathname();
    const { data: session } = useSession();
    const { isOpen, toggle } = useSidebar();
    const isAdmin = session?.user?.role === "ADMIN";

    // =========================================================================
    // BUILD MENU ITEMS
    // =========================================================================

    const allMenuItems = isAdmin
        ? [...mainMenuItems, ...adminMenuItems]
        : [...mainMenuItems, ...adminMenuItems.filter((item) => !item.adminOnly)];

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "border-r bg-card h-screen sticky top-0 transition-all duration-300 flex flex-col",
                    isOpen ? "w-64" : "w-16"
                )}
            >
                {/* ------------------------------------------ */}
                {/* HEADER: LOGO + TOGGLE BUTTON              */}
                {/* ------------------------------------------ */}
                <div className="h-16 border-b flex items-center justify-between px-3">
                    {/* Logo */}
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex items-center gap-2 overflow-hidden",
                            !isOpen && "justify-center w-full"
                        )}
                    >
                        <span className="text-2xl flex-shrink-0">🚀</span>
                        {isOpen && (
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
                                NovaWork
                            </h1>
                        )}
                    </Link>

                    {/* Toggle Button - Chỉ hiển thị khi sidebar mở */}
                    {isOpen && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggle}
                                    className="h-8 w-8 flex-shrink-0"
                                >
                                    <SidebarToggleIcon isOpen={isOpen} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                Thu gọn sidebar
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Toggle Button khi collapsed - ở dưới logo */}
                {!isOpen && (
                    <div className="flex justify-center py-2 border-b">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggle}
                                    className="h-8 w-8"
                                >
                                    <SidebarToggleIcon isOpen={isOpen} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                Mở rộng sidebar
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}

                {/* ------------------------------------------ */}
                {/* NAVIGATION MENU                           */}
                {/* ------------------------------------------ */}
                <ScrollArea className="flex-1">
                    <nav className={cn("py-4 space-y-1", isOpen ? "px-3" : "px-2")}>
                        {allMenuItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href));

                            const menuLink = (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        !isOpen && "justify-center px-2",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    {isOpen && <span>{item.title}</span>}
                                </Link>
                            );

                            if (!isOpen) {
                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>
                                            {menuLink}
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="font-medium">
                                            {item.title}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return menuLink;
                        })}
                    </nav>
                </ScrollArea>
            </aside>
        </TooltipProvider>
    );
}
