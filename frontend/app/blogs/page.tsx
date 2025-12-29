
import BlogFeed from "../components/blog/BlogFeed";
import { blogsApi } from "../lib/api/blogs";
import Link from "next/link";

export const metadata = {
    title: "Blog - KawJaw",
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
        <div className="min-h-screen bg-gray-50">
            <main className="container py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 pt-6">
                        Community Blog
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                        Share your thoughts, stories, and ideas with our community.
                        Every voice matters here.
                    </p>
                    <Link
                        href="/blogs/create"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Post
                    </Link>
                </div>

                {/* Error State */}
                {error && (
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-gray-600">{error}</p>
                    </div>
                )}

                {!error && (
                    <BlogFeed initialPosts={initialPosts} initialCount={initialCount} />
                )}
            </main>
        </div>
    );
}
