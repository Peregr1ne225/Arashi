"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BlogComment } from "@/app/types";
import { blogsApi, getCommentsWebSocketUrl } from "@/app/lib/api/blogs";
import { useAuth } from "@/app/contexts/AuthContext";
import CommentItem from "./CommentItem";
import Link from "next/link";

interface CommentSectionProps {
    postId: number;
    postSlug: string;
    initialComments?: BlogComment[];
}

export default function CommentSection({ postId, postSlug, initialComments = [] }: CommentSectionProps) {
    const { user, isAuthenticated } = useAuth();
    const [comments, setComments] = useState<BlogComment[]>(initialComments);
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    const [connected, setConnected] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch comments on mount to ensure freshness (client-side)
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const fetchedComments = await blogsApi.getComments(postId);
                setComments(fetchedComments);
            } catch (err) {
                console.error("Failed to fetch fresh comments:", err);
            }
        };

        fetchComments();
    }, [postId]);

    // Connect to WebSocket for real-time updates - Use postId for ID-based routing
    useEffect(() => {
        // We use postId (number) for the WebSocket channel now, matching backend routing
        const wsUrl = getCommentsWebSocketUrl(postId);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "new_comment" && data.comment) {
                    setComments((prev) => {
                        if (prev.some(c => c.id === data.comment.id)) return prev;
                        return [...prev, data.comment];
                    });
                    // Scroll to bottom when new comment arrives
                    setTimeout(() => {
                        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                }
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        ws.onclose = () => {
            setConnected(false);
            console.log("WebSocket disconnected");
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setConnected(false);
        };

        return () => {
            ws.close();
        };
    }, [postId]); // Depend on postId, not postSlug

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

    const removeImage = () => {
        setImage(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

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
            // Using REST API for robust image handling
            const comment = await blogsApi.createComment(postId, newComment.trim(), image || undefined);

            // Optimistic update
            setComments((prev) => {
                if (prev.some(c => c.id === comment.id)) return prev;
                return [...prev, comment];
            });

            setNewComment("");
            removeImage();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to post comment");
        } finally {
            setLoading(false);
        }
    }, [newComment, image, isAuthenticated, postId]);

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            await blogsApi.deleteComment(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (err) {
            console.error("Failed to delete comment:", err);
            setError("Failed to delete comment");
        }
    };

    return (
        <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                    Locker Room Talk ({comments.length})
                </h3>
                {connected && (
                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent">
                        <span className="w-2 h-2 bg-accent rounded-none skew-box-sm animate-pulse shadow-[0_0_5px_rgba(204,255,0,0.8)]" />
                        Live Feed
                    </span>
                )}
            </div>

            {/* Comments List */}
            <div className="max-h-[500px] overflow-y-auto p-6 space-y-4 no-scrollbar">
                {comments.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 bg-white/5 skew-box">
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">
                            No plays called yet. Start the strategy discussion!
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onDelete={handleDeleteComment}
                            onImageClick={setSelectedImage}
                        />
                    ))
                )}
                <div ref={commentsEndRef} />
            </div>

            {/* Comment Form */}
            <div className="p-6 border-t border-white/10 bg-black/30">
                {isAuthenticated ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-red-500 text-xs font-bold uppercase tracking-wider bg-red-900/10 border border-red-900/50 px-3 py-2 skew-box">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center text-accent font-black skew-box-sm flex-shrink-0">
                                {user?.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 space-y-3">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="CALL THE NEXT PLAY..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-black border border-white/20 rounded-none text-white placeholder-gray-600 focus:border-accent focus:ring-1 focus:ring-accent skew-box font-medium uppercase tracking-wide text-sm resize-none transition-all"
                                />

                                {/* Image Preview */}
                                {previewUrl && (
                                    <div className="relative inline-block mt-2">
                                        <img src={previewUrl} alt="Preview" className="h-24 w-auto border border-white/20 skew-box-sm" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white p-1 hover:bg-red-700 skew-box-sm shadow-lg transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pl-14">
                            {/* Image Upload Button */}
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
                                    className="cursor-pointer text-gray-500 hover:text-accent transition-colors p-2 inline-flex items-center group"
                                    title="Attach image"
                                >
                                    <svg className="w-5 h-5 group-hover:drop-shadow-[0_0_5px_rgba(204,255,0,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (!newComment.trim() && !image)}
                                className="px-6 py-2 bg-accent text-black font-black uppercase italic tracking-widest text-xs hover:bg-white hover:text-black transition-all skew-box disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    "Post Comment //"
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6 border border-dashed border-white/10 bg-white/5 skew-box">
                        <p className="text-gray-400 mb-4 font-bold uppercase tracking-wider text-xs">Join the locker room discussion</p>
                        <Link
                            href={`/login?redirect=/blogs/${postId}`}
                            className="inline-block px-5 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-accent transition-colors skew-box"
                        >
                            Log In to Comment
                        </Link>
                    </div>
                )}
            </div>

            {/* Image Zoom Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all animate-in fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-accent transition-colors p-2"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[85vh] object-contain border border-white/20 skew-box shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
