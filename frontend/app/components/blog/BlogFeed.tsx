"use client";

import { useState, useCallback } from "react";
import { BlogPost, BlogPostListResponse } from "@/app/types/blog";
import { blogsApi } from "@/app/lib/api/blogs";
import PostCard from "./PostCard";
import { LayoutGrid, User } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

interface BlogFeedProps {
    initialPosts: BlogPost[];
    initialCount?: number;
}

export default function BlogFeed({ initialPosts, initialCount = 0 }: BlogFeedProps) {
    const { user, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialCount > initialPosts.length);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("-created_at");
    const [showMyPosts, setShowMyPosts] = useState(false);

    const loadPosts = useCallback(async (currentPage: number, search: string, sort: string, myPosts: boolean, isNewSearch: boolean) => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                search: search,
                ordering: sort,
                page_size: 9,
                author: myPosts && user?.username ? user.username : undefined
            };

            const data: BlogPostListResponse = await blogsApi.getPosts(params);

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
    }, [user?.username]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPosts(nextPage, searchQuery, sortBy, showMyPosts, false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadPosts(1, searchQuery, sortBy, showMyPosts, true);
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        setPage(1);
        loadPosts(1, searchQuery, newSort, showMyPosts, true);
    };

    const toggleMyPosts = () => {
        if (!isAuthenticated) return;
        const newShowMyPosts = !showMyPosts;
        setShowMyPosts(newShowMyPosts);
        setPage(1);
        loadPosts(1, searchQuery, sortBy, newShowMyPosts, true);
    };


    return (
        <div className="space-y-6">

            <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
                {/* Search Bar - Premium Pill */}
                <form onSubmit={handleSearch} className="flex-1 w-full relative z-20">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-100/20 rounded-full blur-xl group-hover:bg-blue-100/40 transition-all opacity-0 group-hover:opacity-100" />
                        <input
                            type="text"
                            placeholder="SEARCH STORIES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative z-10 w-full px-8 py-5 pl-14 rounded-full border-2 border-white bg-white/80 backdrop-blur-md shadow-xl shadow-blue-900/5 text-[#0e4d80] focus:border-[#0e4d80] focus:ring-0 focus:scale-[1.01] transition-all outline-none font-istok text-sm font-bold placeholder-gray-400 uppercase tracking-wider"
                        />
                        <svg
                            className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 -translate-y-1/2 group-focus-within:text-[#0e4d80] transition-colors z-20"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {isLoading && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20">
                                <div className="w-5 h-5 border-3 border-[#0e4d80] border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </form>

                {/* Controls Group */}
                <div className="flex gap-4 w-full md:w-auto">
                    {/* My Posts Filter Button */}
                    {isAuthenticated && (
                        <div className="relative z-20">
                            <button
                                onClick={toggleMyPosts}
                                className={`h-full px-6 py-5 rounded-full border-2 transition-all font-bold font-istok uppercase tracking-wider text-xs flex items-center gap-2 shadow-xl shadow-blue-900/5 whitespace-nowrap ${showMyPosts
                                    ? "bg-[#0e4d80] border-[#0e4d80] text-white"
                                    : "bg-white/80 border-white text-[#0e4d80] hover:border-[#0e4d80]"
                                    }`}
                            >
                                <User size={16} />
                                <span>My Posts</span>
                            </button>
                        </div>
                    )}

                    {/* Sort Dropdown - Premium Pill */}
                    <div className="w-full md:w-72 relative z-20">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-100/20 rounded-full blur-xl group-hover:bg-blue-100/40 transition-all opacity-0 group-hover:opacity-100" />
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="relative z-10 w-full px-8 py-5 rounded-full border-2 border-white bg-white/80 backdrop-blur-md shadow-xl shadow-blue-900/5 text-[#0e4d80] focus:border-[#0e4d80] focus:ring-0 focus:scale-[1.01] transition-all outline-none font-istok text-sm font-bold appearance-none cursor-pointer uppercase tracking-wider"
                            >
                                <option value="-created_at">Newest First</option>
                                <option value="created_at">Oldest First</option>
                                <option value="-likes_count">Most Liked</option>
                                <option value="likes_count">Least Liked</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#0e4d80] z-20">
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            {posts.length > 0 ? (
                <div className="flex flex-col gap-8 pb-10">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white shadow-xl shadow-blue-900/5">
                    <div className="text-gray-200 mb-6">
                        <LayoutGrid size={80} className="mx-auto opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0e4d80] mb-2 font-koulen uppercase tracking-wide">No stories found</h3>
                    <p className="text-gray-500 font-istok text-sm font-bold tracking-widest uppercase">Try adjusting your search terms</p>
                </div>
            )}

            {/* Load More Button */}
            {hasMore && (
                <div className="text-center pb-10">
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="px-12 py-5 bg-white border-2 border-white text-[#0e4d80] font-bold rounded-full hover:border-[#0e4d80] hover:bg-[#0e4d80] hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50 font-istok uppercase tracking-[0.2em] text-xs"
                    >
                        {isLoading ? "Loading..." : "Load More Stories"}
                    </button>
                </div>
            )}
        </div>
    );
}
