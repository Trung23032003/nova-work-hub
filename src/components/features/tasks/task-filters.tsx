"use client";

/**
 * TASK FILTERS COMPONENT
 * 
 * Bộ lọc cho danh sách tasks.
 * Features:
 * - Filter by status
 * - Filter by priority
 * - Filter by assignee
 * - Search by title
 */

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Priority, TaskStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export interface TaskFiltersValue {
    status?: TaskStatus;
    priority?: Priority;
    assigneeId?: string;
    search?: string;
}

interface AssigneeOption {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

interface TaskFiltersProps {
    value: TaskFiltersValue;
    onChange: (value: TaskFiltersValue) => void;
    assignees?: AssigneeOption[];
    taskCounts?: Record<TaskStatus, number>;
}

// ============================================
// CONSTANTS
// ============================================

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "TODO", label: "Chờ làm" },
    { value: "IN_PROGRESS", label: "Đang làm" },
    { value: "REVIEW", label: "Đang review" },
    { value: "DONE", label: "Hoàn thành" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
    { value: "LOW", label: "Thấp" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HIGH", label: "Cao" },
    { value: "CRITICAL", label: "Khẩn cấp" },
];

// ============================================
// COMPONENT
// ============================================

export function TaskFilters({
    value,
    onChange,
    assignees = [],
    taskCounts,
}: TaskFiltersProps) {
    const [searchInput, setSearchInput] = useState(value.search || "");

    // Count active filters
    const activeFiltersCount = [
        value.status,
        value.priority,
        value.assigneeId,
        value.search,
    ].filter(Boolean).length;

    // Handle search
    const handleSearch = () => {
        onChange({ ...value, search: searchInput || undefined });
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // Clear all filters
    const handleClearAll = () => {
        setSearchInput("");
        onChange({});
    };

    // Clear single filter
    const handleClearFilter = (key: keyof TaskFiltersValue) => {
        const newValue = { ...value };
        delete newValue[key];
        if (key === "search") setSearchInput("");
        onChange(newValue);
    };

    return (
        <div className="space-y-3">
            {/* Main filters row */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm task..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="pl-9"
                    />
                </div>

                {/* Status filter */}
                <Select
                    value={value.status || "all"}
                    onValueChange={(v) =>
                        onChange({
                            ...value,
                            status: v === "all" ? undefined : (v as TaskStatus),
                        })
                    }
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center justify-between w-full">
                                    <span>{option.label}</span>
                                    {taskCounts && (
                                        <Badge variant="secondary" className="ml-2">
                                            {taskCounts[option.value] || 0}
                                        </Badge>
                                    )}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Priority filter */}
                <Select
                    value={value.priority || "all"}
                    onValueChange={(v) =>
                        onChange({
                            ...value,
                            priority: v === "all" ? undefined : (v as Priority),
                        })
                    }
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {PRIORITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Assignee filter */}
                {assignees.length > 0 && (
                    <Select
                        value={value.assigneeId || "all"}
                        onValueChange={(v) =>
                            onChange({
                                ...value,
                                assigneeId: v === "all" ? undefined : v,
                            })
                        }
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Người thực hiện" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {assignees.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.name || user.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Clear all button */}
                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="text-muted-foreground"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Xóa bộ lọc
                    </Button>
                )}
            </div>

            {/* Active filters badges */}
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Đang lọc:</span>

                    {value.status && (
                        <Badge variant="secondary" className="gap-1">
                            {STATUS_OPTIONS.find((o) => o.value === value.status)?.label}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleClearFilter("status")}
                            />
                        </Badge>
                    )}

                    {value.priority && (
                        <Badge variant="secondary" className="gap-1">
                            {PRIORITY_OPTIONS.find((o) => o.value === value.priority)?.label}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleClearFilter("priority")}
                            />
                        </Badge>
                    )}

                    {value.assigneeId && (
                        <Badge variant="secondary" className="gap-1">
                            {assignees.find((u) => u.id === value.assigneeId)?.name || "User"}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleClearFilter("assigneeId")}
                            />
                        </Badge>
                    )}

                    {value.search && (
                        <Badge variant="secondary" className="gap-1">
                            &quot;{value.search}&quot;
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleClearFilter("search")}
                            />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
