"use client";

import { useState } from "react";
import { BlogComment } from "@/app/types/blog";
import { useAuth } from "@/app/contexts/AuthContext";
import { getImageUrl } from "@/app/lib/utils/image";
import { blogsApi } from "@/app/lib/api/blogs";
import NextImage from "next/image";

interface CommentItemProps {
    comment: BlogComment;
    onDelete: (id: number) => void;
    onImageClick: (imageUrl: string) => void;
}

export default function CommentItem({ comment, onDelete, onImageClick }: CommentItemProps) {
    const { user, isAuthenticated } = useAuth();
    const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
    const [hasLiked, setHasLiked] = useState(comment.has_liked || false);
    const [loading, setLoading] = useState(false);

    const formattedDate = new Date(comment.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    // Generate a consistent color based on the pseudonym
    const getAvatarColor = (name: string) => {
        const colors = [
            "from-purple-500 to-pink-500",
            "from-blue-500 to-cyan-500",
            "from-green-500 to-emerald-500",
            "from-orange-500 to-amber-500",
            "from-red-500 to-rose-500",
            "from-indigo-500 to-violet-500",
            "from-teal-500 to-green-500",
            "from-pink-500 to-rose-500",
        ];
        const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    const canDelete = comment.can_delete || (user && (
        user.username === comment.author_username ||
        user.username === comment.post_author_username
    ));

    const handleLike = async () => {
        if (!isAuthenticated) return;
        if (loading) return;

        try {
            setLoading(true);
            const result = await blogsApi.likeComment(comment.id);
            setHasLiked(result.has_liked);
            setLikesCount(result.likes_count);
        } catch (error) {
            console.error("Failed to like comment:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-5 p-0 bg-transparent rounded-lg group transition-colors relative">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(comment.author_name)} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}>
                {comment.author_name.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-8 border-b border-gray-100 last:border-0 relative">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 font-istok uppercase tracking-tight text-sm">{comment.author_name}</span>
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-istok">{formattedDate}</span>
                    </div>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                            title="Delete comment"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
                <p className="text-gray-800 leading-relaxed text-base font-sans mb-4">{comment.content}</p>

                {/* Comment Stats */}
                <div className="flex items-center gap-4 mb-4 relative">
                    <button
                        onClick={handleLike}
                        disabled={loading}
                        className={`flex items-center gap-1.5 transition-colors ${hasLiked ? "text-red-500" : "text-gray-400"} hover:text-red-500 group`}
                    >
                        <svg className="w-3.5 h-3.5" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-[10px] font-bold font-istok uppercase tracking-widest">{likesCount}</span>
                    </button>
                </div>

                {comment.image && (
                    <div className="mt-2 relative h-64 w-full max-w-md">
                        <NextImage
                            src={getImageUrl(comment.image)}
                            alt="Comment attachment"
                            fill
                            className="rounded-lg border border-gray-200 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => comment.image && onImageClick(getImageUrl(comment.image))}
                        />
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.2s ease forwards;
                }
            `}</style>
        </div>
    );
}
