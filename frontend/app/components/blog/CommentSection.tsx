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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                    Comments ({comments.length})
                </h3>
                {connected && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Live
                    </span>
                )}
            </div>

            {/* Comments List */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                {comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        No comments yet. Be the first to comment!
                    </p>
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
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                {isAuthenticated ? (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {user?.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 space-y-2">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                                />

                                {/* Image Preview */}
                                {previewUrl && (
                                    <div className="relative inline-block">
                                        <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded-lg border border-gray-200" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                                    className="cursor-pointer text-gray-500 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50 inline-flex items-center"
                                    title="Attach image"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (!newComment.trim() && !image)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    "Post"
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-600 mb-3">You need to log in to comment</p>
                        <Link
                            href={`/login?redirect=/blogs/${postId}`}
                            className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                        >
                            Log In to Comment
                        </Link>
                    </div>
                )}
            </div>

            {/* Image Zoom Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all animate-in fade-in"
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
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
