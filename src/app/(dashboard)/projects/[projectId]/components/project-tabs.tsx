"use client";

/**
 * PROJECT TABS NAVIGATION
 * 
 * Tab navigation cho project detail pages:
 * - Overview
 * - Tasks
 * - Members
 * - Settings
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ListTodo,
    Users,
    Settings
} from "lucide-react";

// ============================================
// TAB CONFIG
// ============================================

interface TabItem {
    name: string;
    href: string;
    icon: React.ReactNode;
}

function getTabs(projectId: string): TabItem[] {
    return [
        {
            name: "Tổng quan",
            href: `/projects/${projectId}`,
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            name: "Công việc",
            href: `/projects/${projectId}/tasks`,
            icon: <ListTodo className="h-4 w-4" />,
        },
        {
            name: "Thành viên",
            href: `/projects/${projectId}/members`,
            icon: <Users className="h-4 w-4" />,
        },
        {
            name: "Cài đặt",
            href: `/projects/${projectId}/settings`,
            icon: <Settings className="h-4 w-4" />,
        },
    ];
}

// ============================================
// COMPONENT
// ============================================

interface ProjectTabsProps {
    projectId: string;
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
    const pathname = usePathname();
    const tabs = getTabs(projectId);

    // Determine active tab
    const isActive = (href: string) => {
        // Exact match for overview
        if (href === `/projects/${projectId}`) {
            return pathname === href;
        }
        // Prefix match for other tabs
        return pathname.startsWith(href);
    };

    return (
        <div className="border-b">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                            isActive(tab.href)
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                        )}
                    >
                        {tab.icon}
                        {tab.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
