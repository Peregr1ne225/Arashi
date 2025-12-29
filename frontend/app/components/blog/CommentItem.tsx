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
        <div className="flex gap-4 p-5 bg-black/40 border border-white/10 skew-box relative group hover:border-white/20 transition-all">
            {/* Avatar */}
            <div className={`w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center text-accent font-black skew-box-sm flex-shrink-0`}>
                {comment.author_pseudonym.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <span className="font-bold uppercase tracking-wider text-white text-sm">{comment.author_pseudonym}</span>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 skew-box-sm text-gray-400 font-mono">{formattedDate}</span>
                    </div>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete comment"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
                <p className="text-gray-300 whitespace-pre-wrap break-words text-sm leading-relaxed font-medium">{comment.content}</p>
                {comment.image && (
                    <div className="mt-3">
                        <img
                            src={getImageUrl(comment.image)}
                            alt="Comment attachment"
                            className="max-h-64 border border-white/20 object-cover cursor-pointer hover:opacity-80 transition-opacity skew-box-sm"
                            // Optional: Add simple lightbox or zoom on click if needed
                            onClick={() => comment.image && onImageClick(getImageUrl(comment.image))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
