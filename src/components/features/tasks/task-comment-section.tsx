"use client";

/**
 * TASK COMMENT SECTION COMPONENT
 * 
 * Section hiển thị comments của task với:
 * - Danh sách comments (newest first)
 * - Form thêm comment mới
 * - Edit/Delete cho comment của mình
 */

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageSquare, Send, Trash2, Edit, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { addComment, updateComment, deleteComment } from "@/actions/comment";
import type { CommentListItem } from "@/server/services/comment.service";

// ============================================
// TYPES
// ============================================

interface TaskCommentSectionProps {
    taskId: string;
    comments: CommentListItem[];
    currentUserId: string;
    currentUserRole: string;
    onCommentAdded?: () => void;
}

// ============================================
// HELPERS
// ============================================

function getInitials(name: string | null | undefined): string {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ============================================
// COMPONENT
// ============================================

export function TaskCommentSection({
    taskId,
    comments,
    currentUserId,
    currentUserRole,
    onCommentAdded,
}: TaskCommentSectionProps) {
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Handle add comment
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await addComment({
                taskId,
                content: newComment.trim(),
            });

            if (result.success) {
                toast.success(result.message);
                setNewComment("");
                onCommentAdded?.();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle start edit
    const handleStartEdit = (comment: CommentListItem) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent("");
    };

    // Handle save edit
    const handleSaveEdit = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            const result = await updateComment({
                commentId,
                content: editContent.trim(),
            });

            if (result.success) {
                toast.success(result.message);
                setEditingId(null);
                setEditContent("");
                onCommentAdded?.();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        }
    };

    // Handle delete comment
    const handleDeleteComment = async () => {
        if (!deletingId) return;

        try {
            const result = await deleteComment(deletingId);

            if (result.success) {
                toast.success(result.message);
                setShowDeleteDialog(false);
                setDeletingId(null);
                onCommentAdded?.();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        }
    };

    // Handle key press in textarea
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleAddComment();
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">
                    Bình luận ({comments.length})
                </Label>
            </div>

            {/* Add Comment Form */}
            <div className="space-y-3">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Thêm bình luận... (Ctrl+Enter để gửi)"
                    className="min-h-[80px] resize-none"
                    disabled={isSubmitting}
                />
                <div className="flex justify-end">
                    <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isSubmitting}
                        size="sm"
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Gửi
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Comments List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        Chưa có bình luận nào. Hãy là người đầu tiên!
                    </div>
                ) : (
                    comments.map((comment) => {
                        const isAuthor = comment.author.id === currentUserId;
                        const canDelete = isAuthor || currentUserRole === "ADMIN";
                        const isEditing = editingId === comment.id;

                        return (
                            <div key={comment.id} className="flex gap-3 group">
                                {/* Avatar */}
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.author.image || undefined} />
                                    <AvatarFallback className="text-xs">
                                        {getInitials(comment.author.name)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1 space-y-1">
                                    {/* Author & Time */}
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                            {comment.author.name || comment.author.email}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), {
                                                addSuffix: true,
                                                locale: vi,
                                            })}
                                        </span>
                                        {comment.updatedAt > comment.createdAt && (
                                            <span className="text-xs text-muted-foreground italic">
                                                (đã chỉnh sửa)
                                            </span>
                                        )}
                                    </div>

                                    {/* Comment Content or Edit Form */}
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="min-h-[60px] text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Hủy
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSaveEdit(comment.id)}
                                                    disabled={!editContent.trim()}
                                                >
                                                    Lưu
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {comment.content}
                                            </p>

                                            {/* Actions */}
                                            {(isAuthor || canDelete) && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isAuthor && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={() => handleStartEdit(comment)}
                                                        >
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Sửa
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                setDeletingId(comment.id);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3 mr-1" />
                                                            Xóa
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa bình luận?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa bình luận này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingId(null)}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteComment}>
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
