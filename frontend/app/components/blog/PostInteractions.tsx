"use client";

import { useState, useEffect } from "react";
import { blogsApi } from "@/app/lib/api/blogs";
import { useAuth } from "@/app/contexts/AuthContext";
import PostActions from "@/app/components/blog/PostActions";

interface PostInteractionsProps {
    postId: number;
    initialLikesCount: number;
    initialHasLiked: boolean;
    commentCount: number;
    authorUsername: string;
}

export default function PostInteractions({
    postId,
    initialLikesCount,
    initialHasLiked,
    commentCount,
    authorUsername,
}: PostInteractionsProps) {
    const { isAuthenticated } = useAuth();
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [hasLiked, setHasLiked] = useState(initialHasLiked);
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleLike = async () => {
        if (!isAuthenticated) {
            // Usually login modal would open
            return;
        }

        if (loading) return;

        try {
            setLoading(true);
            const result = await blogsApi.likePost(postId);
            setHasLiked(result.has_liked);
            setLikesCount(result.likes_count);
        } catch (error) {
            console.error("Failed to like post:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-8 py-2 relative">
            {/* Like Button */}
            <div className="flex items-center gap-2 group cursor-pointer" onClick={handleLike}>
                <button
                    disabled={loading}
                    className={`transition-all duration-300 p-2 rounded-full group-hover:bg-red-50 ${hasLiked ? "text-red-500 scale-110" : "text-gray-400 group-hover:text-red-500"}`}
                >
                    <svg
                        className="w-7 h-7"
                        fill={hasLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </button>
                <span className={`text-xs font-bold font-istok transition-colors ${hasLiked ? "text-red-500" : "text-gray-400 group-hover:text-red-500"}`}>
                    {likesCount}
                </span>
            </div>

            {/* Comment Count */}
            <div className="flex items-center gap-2 group cursor-default">
                <div className="text-gray-400 group-hover:text-[#0e4d80] transition-colors p-2 rounded-full group-hover:bg-blue-50">
                    <svg
                        className="w-7 h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-[#0e4d80] font-istok transition-colors">
                    {commentCount}
                </span>
            </div>

            <div className="flex-1" />

            {/* Actions (Delete, etc) - Client only to prevent hydration mismatch */}
            {isMounted && (
                <PostActions
                    postId={postId}
                    authorUsername={authorUsername}
                    variant="icon"
                />
            )}


        </div>
    );
}
