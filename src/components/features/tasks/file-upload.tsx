/**
 * FILE UPLOAD COMPONENT
 * 
 * Kéo thả hoặc chọn file để upload
 * Features:
 * - Drag and drop
 * - File validation (type, size)
 * - Upload progress
 * - File preview
 */

"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface UploadedFile {
    fileName: string;
    fileUrl: string;
    fileKey: string;
    fileType: string;
    fileSize: number;
}

interface FileUploadProps {
    onUploadComplete: (file: UploadedFile) => void;
    accept?: string;
    maxSizeMB?: number;
    disabled?: boolean;
}

export function FileUpload({
    onUploadComplete,
    accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip",
    maxSizeMB = 10,
    disabled = false,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const validateFile = useCallback((file: File): string | null => {
        // Check file size
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            return `File quá lớn (tối đa ${maxSizeMB}MB)`;
        }

        // Check file type
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'application/zip',
        ];

        if (!allowedTypes.includes(file.type)) {
            return "Định dạng file không được hỗ trợ";
        }

        return null;
    }, [maxSizeMB]);

    const uploadFile = useCallback(async (file: File) => {
        // Validate
        const error = validateFile(file);
        if (error) {
            toast.error(error);
            return;
        }

        setIsUploading(true);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Upload to API
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            // Success
            toast.success("Upload thành công");
            onUploadComplete(result.data);

        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : "Lỗi khi upload file");
        } finally {
            setIsUploading(false);
        }
    }, [validateFile, onUploadComplete]);

    // Drag handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            uploadFile(files[0]); // Upload first file only
        }
    }, [disabled, uploadFile]);

    // File input handler
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
        // Reset input
        e.target.value = '';
    }, [uploadFile]);

    return (
        <div
            className={`
                relative border-2 border-dashed rounded-lg p-6 transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                disabled={disabled || isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center justify-center gap-2 text-center">
                {isUploading ? (
                    <>
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">
                            Đang upload...
                        </p>
                    </>
                ) : (
                    <>
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                Kéo thả file vào đây hoặc click để chọn
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Hỗ trợ: Ảnh, PDF, DOC, XLS, TXT, ZIP (tối đa {maxSizeMB}MB)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * ATTACHMENT LIST COMPONENT
 * 
 * Hiển thị danh sách files đã upload với preview và delete
 */

interface AttachmentItemProps {
    attachment: {
        id: string;
        fileName: string;
        fileUrl: string;
        fileType: string | null;
        fileSize: number | null;
    };
    onDelete?: (id: string) => void;
    canDelete?: boolean;
}

export function AttachmentItem({ attachment, onDelete, canDelete = false }: AttachmentItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(attachment.id);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isImage = attachment.fileType?.startsWith('image/');

    return (
        <a
            href={attachment.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
        >
            {/* Icon or Preview */}
            <div className="flex-shrink-0">
                {isImage ? (
                    <img
                        src={attachment.fileUrl}
                        alt={attachment.fileName}
                        className="w-10 h-10 object-cover rounded"
                    />
                ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                    {attachment.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                    {attachment.fileSize ? formatFileSize(attachment.fileSize) : 'Unknown size'}
                </p>
            </div>

            {/* Delete Button */}
            {canDelete && onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <X className="h-4 w-4" />
                    )}
                </Button>
            )}
        </a>
    );
}
