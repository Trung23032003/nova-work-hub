/**
 * ============================================================================
 * HOMEPAGE / LANDING PAGE - NOVAWORK HUB
 * ============================================================================
 * 
 * Trang chủ public - hiển thị cho mọi user (kể cả chưa đăng nhập)
 * 
 * ============================================================================
 */

import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  // Kiểm tra user đã đăng nhập chưa
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
      {/* Logo / Title */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-black mb-4">
          🚀 NovaWork Hub
        </h1>
        <p className="text-xl text-black max-w-md">
          Hệ thống quản lý dự án và công việc nội bộ doanh nghiệp
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {session?.user ? (
          // Đã đăng nhập → Hiển thị nút vào Dashboard
          <>
            
            <div className="flex flex-col items-center">
              <div className="text-black pb-4">
              <span>Xin chào,</span>
              <span className="text-black font-medium">
                {session.user.name || session.user.email}
              </span>
            </div>
            <div className="pt-4">
              <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Vào Dashboard
              </Button>
            </Link>
            </div>
            </div>
          </>
        ) : (
          // Chưa đăng nhập → Hiển thị nút Login
          <>
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-slate-600 text-black hover:bg-slate-800">
                Đăng ký
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="p-6 bg-white rounded-lg border border-slate-700">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-black mb-2">Quản lý Dự án</h3>
          <p className="text-black text-sm">
            Theo dõi tiến độ, deadline và trạng thái các dự án
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-slate-700">
          <div className="text-3xl mb-3">✅</div>
          <h3 className="text-lg font-semibold text-black mb-2">Quản lý Task</h3>
          <p className="text-black text-sm">
            Phân công, tracking công việc với Kanban board
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg border border-slate-700">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="text-lg font-semibold text-black mb-2">Cộng tác Team</h3>
          <p className="text-black text-sm">
            Comment, mention, thông báo realtime
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-black text-sm">
        NovaWork Hub © 2024 - Quản lý công việc hiệu quả
      </div>
    </div>
  );
}
