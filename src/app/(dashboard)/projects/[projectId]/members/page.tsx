/**
 * PROJECT MEMBERS PAGE
 * 
 * URL: /projects/[projectId]/members
 * Quản lý thành viên dự án
 */

import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Plus, UserMinus, Crown } from "lucide-react";
import { getProjectById } from "@/server/services/project.service";

interface ProjectMembersPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function ProjectMembersPage({ params }: ProjectMembersPageProps) {
    const { projectId } = await params;

    const project = await getProjectById(projectId);

    if (!project) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Thành viên</h2>
                    <p className="text-sm text-muted-foreground">
                        {project.members.length} người tham gia dự án
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm thành viên
                </Button>
            </div>

            {/* Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách thành viên</CardTitle>
                    <CardDescription>
                        Các thành viên tham gia dự án và vai trò của họ
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {project.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        {member.user.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={member.user.image}
                                                alt={member.user.name || ""}
                                            />
                                        ) : (
                                            <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-sm font-medium">
                                                {member.user.name?.charAt(0) || "?"}
                                            </div>
                                        )}
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {member.user.name || "Chưa đặt tên"}
                                            </span>
                                            {member.role === "PM" && (
                                                <Crown className="h-4 w-4 text-yellow-500" />
                                            )}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {member.user.email}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Badge variant={member.role === "PM" ? "default" : "secondary"}>
                                        {member.role === "PM" ? "Project Manager" : member.role}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Tham gia {new Date(member.joinedAt).toLocaleDateString("vi-VN")}
                                    </span>
                                    {member.role !== "PM" && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <UserMinus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {project.members.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            Chưa có thành viên nào
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
