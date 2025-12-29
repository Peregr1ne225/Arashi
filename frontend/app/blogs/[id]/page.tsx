import { notFound } from "next/navigation";

import CommentSection from "../../components/blog/CommentSection";
import { blogsApi } from "../../lib/api/blogs";
import PostImage from "../../components/blog/PostImage";
import Link from "next/link";
import PostActions from "../../components/blog/PostActions";

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
    const getAvatarColor = (name: string) => {
        const colors = [
            "from-purple-500 to-pink-500",
            "from-blue-500 to-cyan-500",
            "from-green-500 to-emerald-500",
            "from-orange-500 to-amber-500",
            "from-red-500 to-rose-500",
            "from-indigo-500 to-violet-500",
        ];
        const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="container py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors pt-6"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Blog
                    </Link>

                    {/* Admin Actions (Client-side check) */}
                    <PostActions
                        postId={post.id}
                        authorUsername={post.author_username}
                    />

                    {/* Article */}
                    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                        {/* Cover Image */}
                        {post.image && (
                            <PostImage
                                src={post.image}
                                alt={post.title}
                            />
                        )}

                        {/* Content */}
                        <div className="p-8">
                            {/* Author Info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(post.author_pseudonym)} flex items-center justify-center text-white text-lg font-bold`}>
                                    {post.author_pseudonym.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{post.author_pseudonym}</p>
                                    <p className="text-sm text-gray-500">{formattedDate}</p>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                                {post.title}
                            </h1>

                            {/* Post Content */}
                            <div className="prose prose-lg max-w-none">
                                {post.content.split("\n").map((paragraph, idx) => (
                                    paragraph.trim() && (
                                        <p key={idx} className="text-gray-700 leading-relaxed mb-4">
                                            {paragraph}
                                        </p>
                                    )
                                ))}
                            </div>
                        </div>
                    </article>

                    {/* Comments Section */}
                    <CommentSection
                        postId={post.id}
                        // We keep postSlug for compatibility or remove it if updated context allows, 
                        // but component still accepts it. Wait, CommentSection accepts postSlug but I should check if I need it.
                        // I updated CommentSection to use postId for connection. 
                        // Let's pass slug just in case, but connection uses ID.
                        postSlug={post.slug}
                        initialComments={post.comments || []}
                    />
                </div>
            </main>

        </div>
    );
}
