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
        <div className="space-y-12">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-16">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="SEARCH THE PLAYBOOK..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-4 pl-14 pr-32 bg-neutral-900 border border-white/20 text-white placeholder-gray-600 font-bold uppercase tracking-wider focus:border-accent focus:ring-0 transition-all outline-none skew-box"
                    />
                    <svg
                        className="w-6 h-6 text-gray-500 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-accent transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-accent text-black text-xs font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-colors z-10 disabled:opacity-50 skew-box-sm"
                    >
                        {isLoading ? "..." : "Find"}
                    </button>
                </div>
            </form>

            {/* Posts Grid */}
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-neutral-900/50 border border-white/10 skew-box">
                    <div className="text-gray-600 mb-6">
                        <svg className="w-20 h-20 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">No plays found</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-wider">Try adjusting your search terms.</p>
                </div>
            )}

            {/* Load More Button */}
            {hasMore && (
                <div className="text-center pt-12">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="btn-secondary inline-flex items-center gap-3 px-10 py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                Scouting...
                            </>
                        ) : (
                            "Load More Plays"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
