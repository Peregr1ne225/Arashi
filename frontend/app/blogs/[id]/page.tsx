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
            title: `${post.title} - KawJaw Blog`,
            description: post.content.substring(0, 160),
        };
    } catch {
        return {
            title: "Post Not Found - KawJaw Blog",
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
        <div className="h-screen overflow-hidden bg-gray-50/50 flex flex-col">

            <main className="flex-1 flex flex-col min-h-0 p-4 md:p-10 lg:p-12">
                <div className="max-w-6xl mx-auto w-full h-full flex flex-col min-h-0">
                    {/* Navigation Actions */}
                    <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                        <Link
                            href="/blogs"
                            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-istok"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                            </svg>
                            Feed
                        </Link>
                    </div>

                    {/* Social Post "Split Card" */}
                    <div className="flex-1 min-h-0 bg-white border border-gray-100 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2">

                        {/* LEFT COLUMN: Header + Media + Post Info */}
                        <div className="flex flex-col border-r border-gray-100 bg-white overflow-hidden h-full">
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full bg-linear-to-br ${getAvatarColor(post.author_name)} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                                        {post.author_name?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 font-istok tracking-tight leading-tight">
                                            {post.author_name || "Anonymous"}
                                        </span>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-istok">
                                            {formattedDate}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Flexible Media Part - Shrinks to fit */}
                            <div className="flex-1 relative bg-black min-h-0 overflow-hidden">
                                {post.image ? (
                                    <PostImage
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                        <span className="text-6xl opacity-20">📝</span>
                                    </div>
                                )}
                            </div>

                            {/* Static Info Part - Determined height */}
                            <div className="p-6 shrink-0 bg-white border-t border-gray-50">
                                <h1 className="text-lg font-bold text-gray-900 mb-3 font-istok tracking-tight leading-snug">
                                    {post.title}
                                </h1>
                                <div className="text-sm text-gray-700 leading-relaxed font-sans whitespace-pre-wrap mb-6 line-clamp-6 md:line-clamp-none">
                                    {post.content}
                                </div>

                                {/* Interaction icons with Stats */}
                                <PostInteractions
                                    postId={post.id}
                                    initialLikesCount={post.likes_count}
                                    initialHasLiked={post.has_liked || false}
                                    commentCount={post.comment_count}
                                    authorUsername={post.author_username}
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Comments Only - Scrollable */}
                        <div className="flex flex-col bg-white h-full overflow-hidden">
                            <CommentSection
                                postId={post.id}
                                initialComments={post.comments || []}
                            />
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
