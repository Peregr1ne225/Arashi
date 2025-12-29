"use client";

import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/app/types";
import { getImageUrl } from "@/app/lib/utils/image";

interface PostCardProps {
    post: BlogPost;
}

export default function PostCard({ post }: PostCardProps) {
    const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Link href={`/blogs/${post.id}`}>
            <article className="group bg-white rounded-xl overflow-hidden card-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {post.image ? (
                        <Image
                            src={getImageUrl(post.image)}
                            alt={post.title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-6xl opacity-20">📝</div>
                        </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Author & Date */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                            {post.author_pseudonym.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">{post.author_pseudonym}</p>
                            <p className="text-xs text-gray-500">{formattedDate}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {post.excerpt || post.content.substring(0, 150) + "..."}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comment_count} comments
                        </span>
                        <span className="text-purple-600 text-sm font-medium group-hover:underline">
                            Read more →
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
