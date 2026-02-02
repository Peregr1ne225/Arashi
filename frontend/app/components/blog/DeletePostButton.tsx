"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { blogsApi } from "@/app/lib/api/blogs";

import { revalidateBlogs } from "@/app/actions/blog";

import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import MessageModal from "@/app/components/ui/MessageModal";

interface DeletePostButtonProps {
    postId: number | string;
    variant?: "default" | "icon";
}

export default function DeletePostButton({
    postId,
    variant = "default",
}: DeletePostButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Message Modal State
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

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
            setMessageModal({
                isOpen: true,
                title: "Delete Failed",
                message: "Failed to delete post. Please try again.",
                type: "error",
            });
        } finally {
            setShowConfirm(false);
        }
    };

    return (
        <>
            {variant === "icon" ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete Post"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </button>
            ) : (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                    <span className="font-medium">Delete Post</span>
                </button>
            )}

            <ConfirmationModal
                isOpen={showConfirm}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Keep Post"
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
                isLoading={isDeleting}
                variant="danger"
            />
            <MessageModal
                isOpen={messageModal.isOpen}
                title={messageModal.title}
                message={messageModal.message}
                type={messageModal.type}
                onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
            />
        </>
    );
}
