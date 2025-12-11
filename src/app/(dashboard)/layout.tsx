/**
 * ============================================================================
 * DASHBOARD LAYOUT - NOVAWORK HUB
 * ============================================================================
 * 
 * Layout chung cho tất cả các trang protected trong app
 * 
 * CẤU TRÚC:
 * ┌──────────────────────────────────────────────────────────┐
 * │  Sidebar (fixed)  │         Header (sticky)              │
 * │                   ├────────────────────────────────────────
 * │   - Logo          │                                      │
 * │   - Navigation    │         Main Content Area            │
 * │                   │         (children)                   │
 * │                   │                                      │
 * │                   │                                      │
 * └──────────────────────────────────────────────────────────┘
 * 
 * ROUTE GROUP (dashboard):
 * - Folder tên (dashboard) với dấu ngoặc đơn = Route Group
 * - Route Group KHÔNG ảnh hưởng đến URL
 * - Tất cả pages trong folder này sẽ dùng layout này
 * - Ví dụ: 
 *   + src/app/(dashboard)/page.tsx → URL: /
 *   + src/app/(dashboard)/projects/page.tsx → URL: /projects
 * 
 * SIDEBAR PROVIDER:
 * - Wrap layout với SidebarProvider để quản lý trạng thái ẩn/hiện sidebar
 * - Các component con (Sidebar, Header) có thể access state qua useSidebar()
 * 
 * ============================================================================
 */

import { MainSidebar } from "@/components/layout/main-sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/contexts/sidebar-context";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background">
                {/* ------------------------------------------ */}
                {/* SIDEBAR - Fixed bên trái                  */}
                {/* ------------------------------------------ */}
                <MainSidebar />

                {/* ------------------------------------------ */}
                {/* MAIN AREA - Header + Content              */}
                {/* ------------------------------------------ */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header - Sticky top */}
                    <Header />

                    {/* Main Content Area */}
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
