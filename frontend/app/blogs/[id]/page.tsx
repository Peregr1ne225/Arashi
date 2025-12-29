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
        <div className="min-h-screen bg-background text-white">
            <main className="container py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-accent font-bold uppercase tracking-wider mb-8 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Playbook
                    </Link>

                    {/* Admin Actions (Client-side check) */}
                    <PostActions
                        postId={post.id}
                        authorUsername={post.author_username}
                    />

                    {/* Article */}
                    <article className="bg-neutral-900 border border-white/10 skew-box overflow-hidden mb-12 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        {/* Cover Image */}
                        {post.image && (
                            <div className="border-b border-white/10 relative">
                                <PostImage
                                    src={post.image}
                                    alt={post.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-50" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-8 md:p-12">
                            {/* Author Info */}
                            <div className="flex items-center gap-5 mb-8 border-b border-white/5 pb-8">
                                <div className={`w-14 h-14 bg-white/5 border border-white/20 flex items-center justify-center text-accent text-xl font-black skew-box-sm`}>
                                    {post.author_pseudonym.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold uppercase tracking-widest text-white text-lg">{post.author_pseudonym}</p>
                                    <p className="text-sm font-bold uppercase tracking-wider text-gray-500">{formattedDate}</p>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-10 leading-none">
                                {post.title}
                            </h1>

                            {/* Post Content */}
                            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-accent prose-blockquote:border-accent prose-blockquote:bg-white/5 prose-blockquote:skew-box-sm prose-blockquote:p-6 prose-blockquote:not-italic">
                                {post.content.split("\n").map((paragraph, idx) => (
                                    paragraph.trim() && (
                                        <p key={idx} className="mb-6">
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
                        postSlug={post.slug}
                        initialComments={post.comments || []}
                    />
                </div>
            </main>
        </div>
    );
}
