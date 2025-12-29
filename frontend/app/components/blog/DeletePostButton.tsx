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
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Are you sure?</span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="font-medium">Delete Post</span>
        </button>
    );
}
