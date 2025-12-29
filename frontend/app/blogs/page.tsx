
import BlogFeed from "../components/blog/BlogFeed";
import { blogsApi } from "../lib/api/blogs";
import Link from "next/link";

export const metadata = {
    title: "Blog - Arashi",
    description: "Read the latest posts from our community",
};

import { BlogPost } from "../types";

export default async function BlogsPage() {
    let initialPosts: BlogPost[] = [];
    let initialCount = 0;
    let error = null;

    try {
        const data = await blogsApi.getPosts({ page: 1, page_size: 9 });
        initialPosts = data.results;
        initialCount = data.count;
    } catch (err) {
        error = "Failed to load blog posts";
        console.error(err);
    }

    return (
        <div className="min-h-screen bg-background text-white">
            <main className="container py-12">
                {/* Hero Section */}
                <div className="text-center mb-16 border-b border-white/10 pb-12">
                    <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white mb-6 drop-shadow-lg">
                        Team Talk
                    </h1>
                    <p className="text-xl font-bold uppercase tracking-wider text-gray-400 max-w-2xl mx-auto mb-8">
                        Share your game plans, stories, and strategies with the squad.
                        <br />
                        <span className="text-accent">Every voice strengthens the team.</span>
                    </p>
                    <Link
                        href="/blogs/create"
                        className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg skew-box transform hover:-translate-y-1 transition-transform"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
                        </svg>
                        Draft New Post //
                    </Link>
                </div>

                {/* Error State */}
                {error && (
                    <div className="text-center py-16 bg-red-900/10 border border-red-900/50 skew-box mb-8">
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-red-400 font-bold uppercase tracking-wider">{error}</p>
                    </div>
                )}

                {!error && (
                    <BlogFeed initialPosts={initialPosts} initialCount={initialCount} />
                )}
            </main>
        </div>
    );
}
