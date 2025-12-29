"use client";

import { BlogComment } from "@/app/types";
import { useAuth } from "@/app/contexts/AuthContext";
import { getImageUrl } from "@/app/lib/utils/image";

interface CommentItemProps {
    comment: BlogComment;
    onDelete: (id: number) => void;
    onImageClick: (imageUrl: string) => void;
}

export default function CommentItem({ comment, onDelete, onImageClick }: CommentItemProps) {
    const { user } = useAuth();

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

    return (
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors relative">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(comment.author_pseudonym)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                {comment.author_pseudonym.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{comment.author_pseudonym}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{formattedDate}</span>
                    </div>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete comment"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
                {comment.image && (
                    <div className="mt-2">
                        <img
                            src={getImageUrl(comment.image)}
                            alt="Comment attachment"
                            className="max-h-64 rounded-lg border border-gray-200 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            // Optional: Add simple lightbox or zoom on click if needed
                            onClick={() => comment.image && onImageClick(getImageUrl(comment.image))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
