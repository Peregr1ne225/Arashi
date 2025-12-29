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
        <Link href={`/blogs/${post.id}`} className="group block h-full">
            <article className="bg-neutral-900 border border-white/10 skew-box overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-accent hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] relative">
                {/* Image */}
                <div className="relative aspect-video bg-black/50 border-b border-white/10 overflow-hidden skew-box-sm m-2 mb-0">
                    {post.image ? (
                        <Image
                            src={getImageUrl(post.image)}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                            <span className="text-4xl opacity-20 filter grayscale">📝</span>
                        </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                    {/* Date Badge */}
                    <div className="absolute top-0 right-0 bg-accent text-black text-xs font-black uppercase tracking-wider px-3 py-1 skew-box-sm transform translate-x-1 -translate-y-1">
                        {formattedDate}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow relative z-10">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-white/10 border border-white/20 flex items-center justify-center text-accent text-xs font-black skew-box-sm">
                            {post.author_pseudonym.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">By <span className="text-white group-hover:text-accent transition-colors">{post.author_pseudonym}</span></p>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-3 line-clamp-2 group-hover:text-accent transition-colors leading-tight">
                        {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-400 line-clamp-3 mb-6 font-medium leading-relaxed">
                        {post.excerpt || post.content.substring(0, 150) + "..."}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post.comment_count} Comments
                        </span>
                        <span className="text-accent text-xs font-black uppercase italic tracking-widest group-hover:tracking-widest transition-all">
                            Read Full Post //
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
