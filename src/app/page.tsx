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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      {/* Logo / Title */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          🚀 NovaWork Hub
        </h1>
        <p className="text-xl text-slate-600 max-w-md">
          Hệ thống quản lý dự án và công việc nội bộ doanh nghiệp
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {session?.user ? (
          // Đã đăng nhập → Hiển thị nút vào Dashboard
          <div className="flex flex-col items-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-white/80">
            <div className="text-slate-600 pb-4">
              <span>Xin chào, </span>
              <span className="text-slate-800 font-semibold">
                {session.user.name || session.user.email}
              </span>
            </div>
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
                Vào Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          // Chưa đăng nhập → Hiển thị nút Login
          <>
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                Đăng ký
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 hover:-translate-y-1 group">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Quản lý Dự án</h3>
          <p className="text-slate-600 text-sm">
            Theo dõi tiến độ, deadline và trạng thái các dự án
          </p>
        </div>
        <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300 hover:-translate-y-1 group">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">✅</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Quản lý Task</h3>
          <p className="text-slate-600 text-sm">
            Phân công, tracking công việc với Kanban board
          </p>
        </div>
        <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 hover:-translate-y-1 group">
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">👥</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Cộng tác Team</h3>
          <p className="text-slate-600 text-sm">
            Comment, mention, thông báo realtime
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-slate-500 text-sm">
        NovaWork Hub © 2024 - Quản lý công việc hiệu quả
      </div>
    </div>
  );
}
