import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole, UserStatus, ProjectStatus, Priority, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * SEED SCRIPT - Tạo dữ liệu mẫu cho development
 * 
 * Chạy bằng lệnh: npx prisma db seed
 * 
 * Script này tạo:
 * 1. Các phòng ban (Departments)
 * 2. Users (Admin + Members)
 * 3. Project mẫu với Tasks
 */

// Prisma 7: Sử dụng driver adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Bắt đầu seed database...\n");

    // =====================================================
    // 1. TẠO PHÒNG BAN (DEPARTMENTS)
    // =====================================================
    console.log("📂 Tạo phòng ban...");

    const departments = await Promise.all([
        prisma.department.upsert({
            where: { code: "DEV" },
            update: {},
            create: {
                code: "DEV",
                name: "Phòng Phát triển",
                description: "Phát triển sản phẩm và dịch vụ công nghệ",
            },
        }),
        prisma.department.upsert({
            where: { code: "MKT" },
            update: {},
            create: {
                code: "MKT",
                name: "Phòng Marketing",
                description: "Tiếp thị và truyền thông",
            },
        }),
        prisma.department.upsert({
            where: { code: "HR" },
            update: {},
            create: {
                code: "HR",
                name: "Phòng Nhân sự",
                description: "Quản lý nhân sự và tuyển dụng",
            },
        }),
        prisma.department.upsert({
            where: { code: "FIN" },
            update: {},
            create: {
                code: "FIN",
                name: "Phòng Tài chính",
                description: "Quản lý tài chính và kế toán",
            },
        }),
    ]);

    console.log(`   ✅ Đã tạo ${departments.length} phòng ban\n`);

    // =====================================================
    // 2. TẠO USERS
    // =====================================================
    console.log("👥 Tạo users...");

    // Hash password (trong thực tế nên dùng env variable)
    const hashedPassword = await bcrypt.hash("Password@123", 10);

    // Admin user
    const admin = await prisma.user.upsert({
        where: { email: "admin@novawork.local" },
        update: {},
        create: {
            email: "admin@novawork.local",
            name: "Admin NovaWork",
            password: hashedPassword,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            departmentId: departments[0].id, // DEV department
            emailVerified: new Date(),
        },
    });
    console.log(`   ✅ Admin: ${admin.email}`);

    // PM user
    const pm = await prisma.user.upsert({
        where: { email: "pm@novawork.local" },
        update: {},
        create: {
            email: "pm@novawork.local",
            name: "Nguyễn Văn PM",
            password: hashedPassword,
            role: UserRole.PM,
            status: UserStatus.ACTIVE,
            departmentId: departments[0].id,
            emailVerified: new Date(),
        },
    });
    console.log(`   ✅ PM: ${pm.email}`);

    // Member users
    const member1 = await prisma.user.upsert({
        where: { email: "member1@novawork.local" },
        update: {},
        create: {
            email: "member1@novawork.local",
            name: "Trần Thị Member",
            password: hashedPassword,
            role: UserRole.MEMBER,
            status: UserStatus.ACTIVE,
            departmentId: departments[0].id,
            emailVerified: new Date(),
        },
    });
    console.log(`   ✅ Member: ${member1.email}`);

    const member2 = await prisma.user.upsert({
        where: { email: "member2@novawork.local" },
        update: {},
        create: {
            email: "member2@novawork.local",
            name: "Lê Văn Dev",
            password: hashedPassword,
            role: UserRole.MEMBER,
            status: UserStatus.ACTIVE,
            departmentId: departments[0].id,
            emailVerified: new Date(),
        },
    });
    console.log(`   ✅ Member: ${member2.email}\n`);

    // =====================================================
    // 3. TẠO PROJECT MẪU
    // =====================================================
    console.log("📁 Tạo project mẫu...");

    const project = await prisma.project.upsert({
        where: { code: "PRJ-001" },
        update: {},
        create: {
            code: "PRJ-001",
            name: "Website Thương mại điện tử",
            slug: "website-thuong-mai-dien-tu",
            description: "Xây dựng website bán hàng online với đầy đủ tính năng: giỏ hàng, thanh toán, quản lý đơn hàng.",
            clientName: "Công ty ABC",
            status: ProjectStatus.IN_PROGRESS,
            priority: Priority.HIGH,
            startDate: new Date(),
            dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
            pmId: pm.id,
        },
    });
    console.log(`   ✅ Project: ${project.name}`);

    // Thêm members vào project
    await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: project.id, userId: member1.id } },
        update: {},
        create: {
            projectId: project.id,
            userId: member1.id,
            role: "MEMBER",
        },
    });

    await prisma.projectMember.upsert({
        where: { projectId_userId: { projectId: project.id, userId: member2.id } },
        update: {},
        create: {
            projectId: project.id,
            userId: member2.id,
            role: "MEMBER",
        },
    });
    console.log(`   ✅ Đã thêm 2 members vào project\n`);

    // =====================================================
    // 4. TẠO TASKS MẪU
    // =====================================================
    console.log("📋 Tạo tasks mẫu...");

    const tasks = await Promise.all([
        prisma.task.upsert({
            where: { id: "task-seed-001" },
            update: {},
            create: {
                id: "task-seed-001",
                title: "Thiết kế UI/UX trang chủ",
                description: "Thiết kế giao diện người dùng cho trang chủ website",
                status: TaskStatus.DONE,
                priority: Priority.HIGH,
                position: 1,
                projectId: project.id,
                reporterId: pm.id,
                assigneeId: member1.id,
                estimateHours: 16,
            },
        }),
        prisma.task.upsert({
            where: { id: "task-seed-002" },
            update: {},
            create: {
                id: "task-seed-002",
                title: "Phát triển trang sản phẩm",
                description: "Code frontend và backend cho trang danh sách sản phẩm",
                status: TaskStatus.IN_PROGRESS,
                priority: Priority.HIGH,
                position: 2,
                projectId: project.id,
                reporterId: pm.id,
                assigneeId: member2.id,
                estimateHours: 24,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
            },
        }),
        prisma.task.upsert({
            where: { id: "task-seed-003" },
            update: {},
            create: {
                id: "task-seed-003",
                title: "Tích hợp cổng thanh toán",
                description: "Tích hợp VNPay và MoMo cho thanh toán online",
                status: TaskStatus.TODO,
                priority: Priority.MEDIUM,
                position: 3,
                projectId: project.id,
                reporterId: pm.id,
                assigneeId: null,
                estimateHours: 32,
            },
        }),
        prisma.task.upsert({
            where: { id: "task-seed-004" },
            update: {},
            create: {
                id: "task-seed-004",
                title: "Review code module giỏ hàng",
                description: "Review và approve code cho module giỏ hàng",
                status: TaskStatus.REVIEW,
                priority: Priority.MEDIUM,
                position: 4,
                projectId: project.id,
                reporterId: member2.id,
                assigneeId: pm.id,
                estimateHours: 4,
            },
        }),
        prisma.task.upsert({
            where: { id: "task-seed-005" },
            update: {},
            create: {
                id: "task-seed-005",
                title: "Tối ưu hiệu suất trang chủ",
                description: "Giảm thời gian load, lazy loading images, optimize CSS/JS",
                status: TaskStatus.TODO,
                priority: Priority.LOW,
                position: 5,
                projectId: project.id,
                reporterId: pm.id,
                assigneeId: member1.id,
                estimateHours: 8,
            },
        }),
    ]);

    console.log(`   ✅ Đã tạo ${tasks.length} tasks\n`);

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log("🎉 Seed hoàn tất!");
    console.log("═══════════════════════════════════════");
    console.log("📊 Tổng kết:");
    console.log(`   • ${departments.length} phòng ban`);
    console.log(`   • 4 users (1 Admin, 1 PM, 2 Members)`);
    console.log(`   • 1 project`);
    console.log(`   • ${tasks.length} tasks`);
    console.log("═══════════════════════════════════════");
    console.log("\n🔐 Thông tin đăng nhập:");
    console.log("   Email: admin@novawork.local");
    console.log("   Password: Password@123");
}

main()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (e) => {
        console.error("❌ Lỗi khi seed:", e);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
