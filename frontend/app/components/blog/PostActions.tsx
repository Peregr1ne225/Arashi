"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import DeletePostButton from "./DeletePostButton";

interface PostActionsProps {
    postId: number;
    authorUsername: string;
}

export default function PostActions({ postId, authorUsername }: PostActionsProps) {
    const { user } = useAuth();

    // Check if the verified user is the author
    const isOwner = user?.username === authorUsername;

    if (!isOwner) {
        return null;
    }

    return (
        <div className="float-right">
            <DeletePostButton postId={postId} />
        </div>
    );
}
