import { notFound } from "next/navigation";

import CommentSection from "@/app/components/blog/CommentSection";
import { blogsApi } from "@/app/lib/api/blogs";
import PostImage from "@/app/components/blog/PostImage";
import Link from "next/link";
import PostInteractions from "@/app/components/blog/PostInteractions";

interface BlogPostPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
    const { id } = await params;
    try {
        const post = await blogsApi.getPost(id);
        return {
            title: `${post.title} - Arashi Blog`,
            description: post.content.substring(0, 160),
        };
    } catch {
        return {
            title: "Post Not Found - Arashi Blog",
        };
    }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { id } = await params;

    let post;
    try {
        const result = await blogsApi.getPost(id);
        post = result;
    } catch {
        notFound();
    }

    const formattedDate = new Date(post.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Generate avatar color based on pseudonym
    const getAvatarColor = (name?: string) => {
        const colors = [
            "from-purple-500 to-pink-500",
            "from-blue-500 to-cyan-500",
            "from-green-500 to-emerald-500",
            "from-orange-500 to-amber-500",
            "from-red-500 to-rose-500",
            "from-indigo-500 to-violet-500",
        ];
        if (!name) return colors[0];
        const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    return (
        <div className="min-h-screen bg-[#FDFDFB] pb-20 pt-24 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Navigation Actions */}
                <div className="flex items-center justify-between mb-8 relative px-4 md:px-0">
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#0e4d80] transition-colors uppercase tracking-widest font-istok p-2 -ml-2 rounded-full hover:bg-gray-100/50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Feed
                    </Link>
                </div>

                {/* Post Content & Comments in one scrolling flow */}
                <article className="bg-white rounded-4xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden mb-12">


                    <div className="p-8 md:p-12 lg:p-16">
                        {/* Meta */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-12 h-12 rounded-full bg-linear-to-br ${getAvatarColor(post.author_name)} flex items-center justify-center text-white text-sm font-bold shadow-sm ring-4 ring-gray-50`}>
                                {post.author_name?.charAt(0) || "?"}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold font-istok leading-none mb-1 text-[13px] uppercase tracking-widest text-[#33A0E5]">
                                    {post.author_name || "Anonymous"}
                                </span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest font-istok">
                                    {formattedDate}
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 font-istok tracking-tight leading-[1.1]">
                            {post.title}
                        </h1>

                        {/* Content */}
                        <div className="prose prose-blue max-w-none mb-12">
                            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-sans whitespace-pre-wrap">
                                {post.content}
                            </p>
                        </div>

                        {/* Media (Moved below text) */}
                        {post.image && (
                            <div className="w-full aspect-square relative bg-gray-100 rounded-3xl overflow-hidden mb-12 shadow-sm max-w-md mx-auto">
                                <PostImage
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full"
                                />
                            </div>
                        )}

                        {/* Interactions */}
                        <div className="mb-12">
                            <PostInteractions
                                postId={post.id}
                                initialLikesCount={post.likes_count}
                                initialHasLiked={post.has_liked || false}
                                commentCount={post.comment_count}
                                authorUsername={post.author_username}
                            />
                        </div>

                        {/* Comments Section integrated into the flow */}
                        <div className="border-t border-gray-100 pt-12 mt-12">
                            <CommentSection
                                postId={post.id}
                                initialComments={post.comments || []}
                            />
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}
