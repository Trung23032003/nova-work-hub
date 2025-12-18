/**
 * FILE UPLOAD API ROUTE
 * 
 * Xử lý upload file lên server
 * POST /api/upload
 * 
 * Body: FormData with 'file' field
 * Response: { success: true, data: { fileName, fileUrl, fileKey, fileType, fileSize } }
 * 
 * NOTE: Implementation này sử dụng local filesystem.
 * Trong production, thay thế bằng:
 * - AWS S3
 * - Supabase Storage
 * - Cloudinary
 * - UploadThing
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { auth } from "@/lib/auth";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
];

export async function POST(request: NextRequest) {
    try {
        // 1. Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        // 3. Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: "File quá lớn (tối đa 10MB)" },
                { status: 400 }
            );
        }

        // 4. Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: "Định dạng file không được hỗ trợ" },
                { status: 400 }
            );
        }

        // 5. Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(file.name);
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, '_');
        const uniqueFileName = `${baseName}_${timestamp}_${randomString}${ext}`;

        // 6. Create upload directory if not exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // 7. Write file to disk
        const filePath = path.join(uploadDir, uniqueFileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // 8. Return file info
        const fileUrl = `/uploads/${uniqueFileName}`;
        const fileKey = uniqueFileName; // For deletion later

        return NextResponse.json({
            success: true,
            data: {
                fileName: file.name,
                fileUrl,
                fileKey,
                fileType: file.type,
                fileSize: file.size,
            },
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: "Lỗi khi upload file" },
            { status: 500 }
        );
    }
}
