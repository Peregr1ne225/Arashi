"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { blogsApi } from "@/app/lib/api/blogs";

import { revalidateBlogs } from "@/app/actions/blog";

interface DeletePostButtonProps {
    postId: number | string;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await blogsApi.deletePost(postId);
            await revalidateBlogs();
            router.push("/blogs");
            router.refresh();
        } catch (error) {
            console.error("Failed to delete post:", error);
            setIsDeleting(false);
            alert("Failed to delete post. Please try again.");
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-3 bg-neutral-900 border border-white/10 p-2 skew-box">
                <span className="text-xs font-bold uppercase tracking-widest text-red-500 animate-pulse">Confirm Delete?</span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-1 bg-red-600 text-white text-xs font-black uppercase italic tracking-widest hover:bg-red-700 transition-colors skew-box-sm disabled:opacity-50"
                >
                    {isDeleting ? "..." : "YES"}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="px-4 py-1 bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors skew-box-sm"
                >
                    NO
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors px-4 py-2 border border-red-900/30 hover:border-red-500/50 bg-red-900/10 skew-box group"
        >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="font-bold uppercase tracking-wider text-xs">Delete Strategy</span>
        </button>
    );
}
