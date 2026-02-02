"use client";

import { useState, useCallback } from "react";
import { BlogPost, BlogPostListResponse } from "@/app/types/blog";
import { blogsApi } from "@/app/lib/api/blogs";
import PostCard from "./PostCard";
import { LayoutGrid } from "lucide-react";

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
    const [sortBy, setSortBy] = useState("-created_at");

    const loadPosts = useCallback(async (currentPage: number, search: string, sort: string, isNewSearch: boolean) => {
        setIsLoading(true);
        try {
            const data: BlogPostListResponse = await blogsApi.getPosts({
                page: currentPage,
                search: search,
                ordering: sort,
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
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPosts(nextPage, searchQuery, sortBy, false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadPosts(1, searchQuery, sortBy, true);
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        setPage(1);
        loadPosts(1, searchQuery, newSort, true);
    };


    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search Bar - More integrated */}
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="SEARCH THE COMMUNITY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-5 py-4 pl-12 rounded-2xl border border-gray-100 bg-white focus:border-[#33A0E5] focus:ring-4 focus:ring-blue-50 transition-all outline-none shadow-sm font-istok text-sm font-bold placeholder-gray-400"
                        />
                        <svg
                            className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#33A0E5] transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {isLoading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-[#33A0E5] border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </form>

                {/* Sort Dropdown */}
                <div className="sm:w-64">
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-white text-gray-600 focus:border-[#33A0E5] focus:ring-4 focus:ring-blue-50 transition-all outline-none shadow-sm font-istok text-sm font-bold appearance-none cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239CA3AF\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                    >
                        <option value="-created_at">NEWEST FIRST</option>
                        <option value="created_at">OLDEST FIRST</option>
                        <option value="-likes_count">MOST LIKED</option>
                        <option value="likes_count">LEAST LIKED</option>
                        <option value="-comment_count">MOST COMMENTED</option>
                        <option value="comment_count">LEAST COMMENTED</option>
                    </select>
                </div>
            </div>

            {/* Posts Grid */}
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                    <div className="text-gray-200 mb-4">
                        <LayoutGrid size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-istok uppercase tracking-wide">No posts found</h3>
                    <p className="text-gray-500 font-istok text-sm">TRY ADJUSTING YOUR SEARCH TERMS</p>
                </div>
            )}

            {/* Load More Button */}
            {hasMore && (
                <div className="text-center pb-10">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="px-10 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 font-istok uppercase tracking-widest text-xs"
                    >
                        {isLoading ? "Loading..." : "Load More Posts"}
                    </button>
                </div>
            )}
        </div>
    );
}
