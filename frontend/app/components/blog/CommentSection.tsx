"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import NextImage from "next/image";
import { BlogComment } from "@/app/types/blog";
import { blogsApi, getCommentsWebSocketUrl } from "@/app/lib/api/blogs";
import { useAuth } from "@/app/contexts/AuthContext";
import CommentItem from "@/app/components/blog/CommentItem";
import Link from "next/link";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";

interface CommentSectionProps {
    postId: number;
    initialComments?: BlogComment[];
    children?: React.ReactNode;
}

export default function CommentSection({ postId, initialComments = [], children }: CommentSectionProps) {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState<BlogComment[]>(initialComments);
    const [nextPage, setNextPage] = useState<number | null>(null);
    const [totalCount, setTotalCount] = useState(initialComments.length);
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [connected, setConnected] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

    const [sortBy, setSortBy] = useState("-created_at");

    // Fetch comments on mount to ensure freshness (client-side)
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await blogsApi.getComments(postId, 1, sortBy);
                setComments(response.results);
                setTotalCount(response.count);
                if (response.next) {
                    setNextPage(2);
                } else {
                    setNextPage(null);
                }
            } catch (err) {
                console.error("Failed to fetch fresh comments:", err);
            }
        };

        fetchComments();
    }, [postId, sortBy]);

    const loadMoreComments = async () => {
        if (!nextPage || loadingMore) return;
        setLoadingMore(true);
        try {
            const response = await blogsApi.getComments(postId, nextPage, sortBy);
            // Append older comments to the end of the array (visually top)
            setComments((prev) => [...prev, ...response.results]);
            if (response.next) {
                setNextPage(nextPage + 1);
            } else {
                setNextPage(null);
            }
        } catch (err) {
            console.error("Failed to load more comments:", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        // Effect will trigger reload
        setComments([]);
        setNextPage(null);
    };

    // Connect to WebSocket for real-time updates
    useEffect(() => {
        // Only connect strictly for "Newest First" to avoid confusion when sorted otherwise
        if (sortBy !== "-created_at") {
            setConnected(false);
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            return;
        }

        // Close existing if any (shouldn't happen often due to deps)
        if (wsRef.current) wsRef.current.close();

        const wsUrl = getCommentsWebSocketUrl(postId);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // The broadcast type is "comment_message" (based on views.py) 
                // but some consumers might use "new_comment". Let's check consumers.py soon.
                // Based on views.py: channel_layer.group_send(..., {"type": "comment_message", "comment": data})
                if ((data.type === "new_comment" || data.type === "comment_message") && data.comment) {
                    setComments((prev) => {
                        if (prev.some(c => c.id === data.comment.id)) return prev;
                        // Prepend to top of array (visually bottom)
                        return [data.comment, ...prev];
                    });
                    setTotalCount(prev => prev + 1);
                    // Scroll to bottom
                    setTimeout(() => {
                        if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                        }
                    }, 100);
                }
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);

        return () => ws.close();
    }, [postId, sortBy]);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = useCallback(() => {
        setImage(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [previewUrl]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newComment.trim() && !image) return;
        if (!isAuthenticated) {
            setError("Please log in to comment");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const comment = await blogsApi.createComment(postId, newComment.trim(), image || undefined);

            // Prepend to top of array (visually bottom)
            setComments((prev) => {
                if (prev.some(c => c.id === comment.id)) return prev;
                return [comment, ...prev];
            });
            setTotalCount(prev => prev + 1);

            setNewComment("");
            removeImage();

            // Scroll to bottom after state update is processed
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                }
            }, 100);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to post comment");
        } finally {
            setLoading(false);
        }
    }, [newComment, image, isAuthenticated, postId, removeImage]);

    const handleDeleteComment = (commentId: number) => {
        setCommentToDelete(commentId);
    };

    const confirmDelete = async () => {
        if (!commentToDelete) return;

        try {
            await blogsApi.deleteComment(commentToDelete);
            setComments((prev) => prev.filter((c) => c.id !== commentToDelete));
            setTotalCount(prev => prev - 1);
        } catch (err) {
            console.error("Failed to delete comment:", err);
            setError("Failed to delete comment");
        } finally {
            setCommentToDelete(null);
        }
    };

    return (
        <div className="flex flex-col bg-white">
            {/* Comment Form - Top Input */}
            <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50/50 shadow-inner mb-8">
                {isAuthenticated ? (
                    <form onSubmit={handleSubmit} className="relative">
                        {error && (
                            <div className="mb-3 text-red-600 text-[10px] bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-2">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {user?.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1">
                                <div className="group bg-gray-50 rounded-2xl p-2 border-l-4 border-transparent focus-within:border-l-[#33A0E5] focus-within:bg-white focus-within:shadow-md transition-all duration-300 ease-in-out">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        rows={2}
                                        className="w-full bg-transparent border-none focus:ring-0 focus:outline-none py-0 text-gray-800 placeholder-gray-400 resize-none text-sm leading-relaxed translate-y-px"
                                    />

                                    {/* Image Preview */}
                                    {previewUrl && (
                                        <div className="mt-2 relative inline-block">
                                            <NextImage
                                                src={previewUrl || ""}
                                                alt="Preview"
                                                width={60}
                                                height={60}
                                                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-1.5 -right-1.5 bg-white text-gray-400 hover:text-red-500 rounded-full p-0.5 shadow-sm border border-gray-100 transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageSelect}
                                                accept="image/*"
                                                className="hidden"
                                                id="comment-image-upload"
                                            />
                                            <label
                                                htmlFor="comment-image-upload"
                                                className="cursor-pointer text-gray-400 hover:text-gray-900 transition-colors group"
                                                title="Attach image"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || (!newComment.trim() && !image)}
                                            className="text-black text-xs font-bold uppercase tracking-wider hover:text-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-istok"
                                        >
                                            {loading ? "..." : "Post"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center">
                        <Link
                            href={`/login?redirect=/blogs/${postId}`}
                            className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-istok"
                        >
                            Log In to Comment
                        </Link>
                    </div>
                )}
            </div>

            {/* Discussion Header with Stats */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-4 gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="text-sm font-bold text-gray-900 font-istok uppercase tracking-widest">
                        Discussion
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-istok">
                        <span>{totalCount} Total</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="pl-3 pr-8 py-1.5 rounded-lg border border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-600 focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all outline-none font-istok uppercase tracking-wider appearance-none cursor-pointer hover:border-gray-200"
                        >
                            <option value="-created_at">Newest First</option>
                            <option value="created_at">Oldest First</option>
                            <option value="-likes_count">Most Liked</option>
                            <option value="likes_count">Least Liked</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {connected && (
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                            LIVE
                        </span>
                    )}
                </div>
            </div>

            {/* Comments List - Standard Flow */}
            <div className="space-y-6 mb-10">
                {/* Visual Children (e.g. pinned content) */}
                {children && <div className="mb-6">{children}</div>}

                {comments.length === 0 && !loadingMore && (
                    <div className="text-center py-12">
                        <div className="text-3xl mb-2 opacity-10">💬</div>
                        <p className="text-gray-400 text-sm font-medium">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                )}

                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onDelete={handleDeleteComment}
                        onImageClick={setSelectedImage}
                    />
                ))}

                {/* Load More Button - Bottom of list */}
                {nextPage && (
                    <div className="flex justify-center py-8">
                        <button
                            onClick={loadMoreComments}
                            disabled={loadingMore}
                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-100 text-[10px] font-bold text-gray-400 hover:text-black hover:border-gray-200 transition-all uppercase tracking-widest disabled:opacity-50"
                        >
                            {loadingMore ? (
                                <div className="w-3 h-3 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                            ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                            {loadingMore ? "Loading..." : "Load Older Comments"}
                        </button>
                    </div>
                )}
            </div>

            {/* Image Zoom Modal */}
            {
                selectedImage && (
                    <div
                        className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all animate-in fade-in"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="relative w-full h-[85vh]">
                                <NextImage
                                    src={selectedImage || ""}
                                    alt="Full size"
                                    fill
                                    className="object-contain rounded-lg shadow-2xl"
                                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            <ConfirmationModal
                isOpen={!!commentToDelete}
                onCancel={() => setCommentToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div >
    );
}
