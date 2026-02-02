"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import DeletePostButton from "@/app/components/blog/DeletePostButton";

interface PostActionsProps {
    postId: number;
    authorUsername: string;
    variant?: "default" | "icon";
}

export default function PostActions({
    postId,
    authorUsername,
    variant = "default",
}: PostActionsProps) {
    const { user } = useAuth();

    // Check if the verified user is the author
    const isOwner = user?.username === authorUsername;

    if (!isOwner) {
        return null;
    }

    return (
        <div className={variant === "icon" ? "" : "float-right"}>
            <DeletePostButton postId={postId} variant={variant} />
        </div>
    );
}
