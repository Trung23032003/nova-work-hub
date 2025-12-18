/**
 * ============================================================================
 * ADMIN USERS MANAGEMENT PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang quản lý người dùng dành cho Admin
 * URL: /admin/users
 * 
 * ============================================================================
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUsers, getDepartments } from "@/server/services/user.service";
import { AdminUsersPageClient } from "./page-client";

export const metadata = {
    title: "Quản lý người dùng | Admin | NovaWork Hub",
    description: "Quản lý nhân sự và phân quyền hệ thống",
};

export default async function AdminUsersPage() {
    const session = await auth();

    // Protection check
    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Fetch data
    const [{ users }, departments] = await Promise.all([
        getUsers({ pageSize: 100 }), // Get all for client-side filtering initially
        getDepartments(),
    ]);

    return (
        <AdminUsersPageClient
            initialUsers={users}
            departments={departments}
            currentUserId={session.user.id}
        />
    );
}
