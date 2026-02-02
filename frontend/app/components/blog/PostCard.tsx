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
        year: "numeric"
    });

    return (
        <article className="group bg-gray-50 rounded-3xl p-6 md:p-8 transition-all hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 border border-transparent hover:border-gray-100">
            <Link href={`/blogs/${post.id}`} className="flex flex-col md:flex-row gap-6 md:gap-8 cursor-pointer">
                {/* Text Content */}
                <div className="flex-1 min-w-0 flex flex-col h-full order-2 md:order-1">
                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs font-bold font-istok tracking-widest text-[#33A0E5] mb-3">
                        <span className="uppercase">{post.author_name}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-gray-400">{formattedDate}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 font-istok leading-tight mb-3 group-hover:text-[#0e4d80] transition-colors">
                        {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 leading-relaxed font-sans mb-6 line-clamp-3 md:line-clamp-2">
                        {post.excerpt || post.content}
                    </p>

                    {/* Interactions */}
                    <div className="mt-auto flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-red-500 transition-colors">
                            <Heart size={18} className={post.has_liked ? "fill-red-500 text-red-500" : ""} />
                            <span className="text-xs font-bold font-istok">{post.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#33A0E5] transition-colors">
                            <MessageCircle size={18} />
                            <span className="text-xs font-bold font-istok">{post.comment_count}</span>
                        </div>
                    </div>
                </div>

                {/* Optional Image Thumbnail */}
                {post.image && (
                    <div className="shrink-0 order-1 md:order-2">
                        <div className="relative w-full md:w-48 h-48 md:h-48 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <Image
                                src={getImageUrl(post.image)}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                    </div>
                )}
            </Link>
        </article>
    );
}
