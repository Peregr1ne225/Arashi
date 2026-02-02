"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/app/types/blog";
import { getImageUrl } from "@/app/lib/utils/image";
import { Heart, MessageCircle } from "lucide-react";

interface PostCardProps {
    post: BlogPost;
}

export default function PostCard({ post }: PostCardProps) {
    const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    // Get initials for avatar
    const initials = post.author_name
        ? post.author_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : "??";

    return (
        <article className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col max-w-md mx-auto w-full">
            {/* Post Header */}
            <div className="p-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#33A0E5] to-blue-600 flex items-center justify-center text-white text-xs font-bold font-istok">
                        {initials}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 font-istok leading-tight">
                            {post.author_name}
                        </p>
                        <p className="text-[10px] text-gray-500 font-istok uppercase tracking-wider">
                            {formattedDate}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Link (Image & Text) */}
            <Link href={`/blogs/${post.id}`} className="block group">
                {/* Post Image */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden border-y border-gray-50">
                    {post.image ? (
                        <Image
                            src={getImageUrl(post.image)}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                            <span className="text-4xl opacity-20">📝</span>
                        </div>
                    )}
                </div>

                {/* Interaction Bar (Visual only, clicks go to detail) */}
                <div className="px-4 py-3 flex items-center gap-4">
                    <button className={`flex items-center gap-1.5 transition-colors ${post.has_liked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}>
                        <Heart size={24} fill={post.has_liked ? "currentColor" : "none"} strokeWidth={2} />
                        {post.likes_count > 0 && <span className="text-sm font-bold font-istok">{post.likes_count}</span>}
                    </button>
                    <div className="flex items-center gap-1.5 text-gray-700 hover:text-[#33A0E5] transition-colors">
                        <MessageCircle size={24} strokeWidth={2} />
                        {post.comment_count > 0 && <span className="text-sm font-bold font-istok">{post.comment_count}</span>}
                    </div>
                </div>

                {/* Caption Area */}
                <div className="px-4 pb-5 space-y-2">
                    <h2 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#33A0E5] transition-colors font-istok uppercase tracking-wide">
                        {post.title}
                    </h2>
                    <div className="text-sm text-gray-800 leading-relaxed font-['Inter',sans-serif]">
                        <span className="font-bold mr-2 text-gray-900 font-istok">Author: </span>
                        <span className="text-gray-600">
                            {post.excerpt || (post.content && post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content) || ""}
                        </span>
                    </div>
                    {post.content && post.content.length > 100 && (
                        <span className="text-xs font-bold text-[#33A0E5] hover:underline transition-all">
                            View full story
                        </span>
                    )}
                </div>
            </Link>
        </article>
    );
}
