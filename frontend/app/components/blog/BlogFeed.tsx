"use client";

import { useState, useCallback } from "react";
import { BlogPost, BlogPostListResponse } from "@/app/types";
import { blogsApi } from "@/app/lib/api/blogs";
import PostCard from "./PostCard";
// import debounce from "lodash.debounce"; // If available, otherwise manual

interface BlogFeedProps {
    initialPosts: BlogPost[];
    initialCount?: number;
}

export default function BlogFeed({ initialPosts, initialCount = 0 }: BlogFeedProps) {
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialCount > initialPosts.length);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const loadPosts = async (currentPage: number, search: string, isNewSearch: boolean) => {
        setIsLoading(true);
        try {
            const data: BlogPostListResponse = await blogsApi.getPosts({
                page: currentPage,
                search: search,
                page_size: 9
            });

            const newPosts = data.results || [];

            if (isNewSearch) {
                setPosts(newPosts);
            } else {
                setPosts(prev => [...prev, ...newPosts]);
            }

            setHasMore(!!data.next);
        } catch (err) {
            console.error("Failed to load posts", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPosts(nextPage, searchQuery, false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadPosts(1, searchQuery, true);
    };

    return (
        <div className="space-y-8">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-3 pl-12 pr-28 rounded-full border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none shadow-sm"
                    />
                    <svg
                        className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors z-10 disabled:opacity-50"
                    >
                        {isLoading ? "..." : "Search"}
                    </button>
                </div>
            </form>

            {/* Posts Grid */}
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="text-gray-300 mb-6">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-500">Try adjusting your search terms.</p>
                </div>
            )}

            {/* Load More Button */}
            {hasMore && (
                <div className="text-center pt-8">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
