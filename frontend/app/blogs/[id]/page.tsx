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
        <div className="min-h-screen bg-[#FDFDFB] py-4 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Navigation Actions */}
                <div className="mb-10 px-2">
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-[#0e4d80] transition-colors font-bold font-istok uppercase tracking-widest text-xs group"
                    >
                        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:border-[#0e4d80] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        Back to Feed
                    </Link>
                </div>

                {/* Post Content & Comments in one scrolling flow */}
                <article className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 overflow-hidden mb-12 relative">
                    {/* Decorative Orb */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="p-4 relative z-10">
                        {/* Meta Header */}
                        <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-8">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full bg-linear-to-br ${getAvatarColor(post.author_name)} flex items-center justify-center text-white text-lg font-bold shadow-md ring-4 ring-gray-50`}>
                                    {post.author_name?.charAt(0) || "?"}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold font-istok leading-none mb-1.5 text-sm uppercase tracking-widest text-[#0e4d80]">
                                        {post.author_name || "Anonymous"}
                                    </span>
                                    <span className="text-xs text-gray-400 uppercase tracking-widest font-istok flex items-center gap-2">
                                        <span>{formattedDate}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                        <span>Community Story</span>
                                    </span>
                                </div>
                            </div>

                            {/* Interactions Top (Optional, maybe just share button?) */}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-10 font-koulen tracking-wide leading-[0.95] text-balance">
                            {post.title}
                        </h1>

                        {/* Content */}
                        <div className="prose prose-lg prose-slate max-w-none mb-4 font-istok prose-headings:font-koulen prose-headings:tracking-wide prose-p:leading-8 prose-p:text-gray-600 prose-a:text-[#0e4d80]">
                            <p className="whitespace-pre-wrap">
                                {post.content}
                            </p>
                        </div>

                        {/* Media */}
                        {post.image && (
                            <div className="w-full aspect-video relative bg-gray-50 rounded-[2rem] overflow-hidden mb-4 shadow-lg border border-gray-100 group">
                                <PostImage
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        )}

                        {/* Interactions */}
                        <div className="mb-4 flex justify-center">
                            <div className="bg-gray-50/80 backdrop-blur-sm px-8 py-4 rounded-full border border-gray-100 shadow-sm">
                                <PostInteractions
                                    postId={post.id}
                                    initialLikesCount={post.likes_count}
                                    initialHasLiked={post.has_liked || false}
                                    commentCount={post.comment_count}
                                    authorUsername={post.author_username}
                                />
                            </div>
                        </div>

                        {/* Comments Section integrated into the flow */}
                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="font-koulen text-3xl text-[#0e4d80] mb-8 flex items-center gap-3">
                                Discussion
                                <span className="text-gray-300 text-xl font-sans">({post.comment_count})</span>
                            </h3>
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
