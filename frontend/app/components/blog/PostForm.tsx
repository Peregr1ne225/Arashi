"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import { blogsApi } from "@/app/lib/api/blogs";
import { revalidateBlogs } from "@/app/actions/blog";

interface PostFormProps {
    onSuccess?: (slug: string) => void;
}

export default function PostForm({ onSuccess }: PostFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Initialize isMounted correctly with useEffect to prevent hydration mismatches
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (imagePreview && !imagePreview.startsWith("http")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file size (e.g., 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size should be less than 5MB");
                return;
            }

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (imagePreview && !imagePreview.startsWith("http")) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setError("Title and content are required");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const post = await blogsApi.createPost({
                title: title.trim(),
                content: content.trim(),
                image: imageFile || undefined,
            });

            await revalidateBlogs();

            if (onSuccess) {
                onSuccess(String(post.id));
            } else {
                router.push(`/blogs/${post.id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    // Prevent hydration issues by not rendering interactive parts until mounted
    if (!isMounted)
        return <div className="min-h-150 animate-pulse bg-gray-50 rounded-xl" />;

    return (
        <div className="space-y-10">
            <section className="border-t pt-10">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 font-['Istok_Web']">
                        {error}
                    </div>
                )}
                <h2 className="text-xl font-bold text-black mb-6 font-['Istok_Web']">
                    Create Post
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column: Image Upload */}
                    <div className="space-y-6">
                        <label className="block text-sm text-black mb-2 font-['Istok_Web'] font-bold uppercase tracking-wider">
                            Cover Image
                        </label>

                        {/* Image Preview Box */}
                        <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors aspect-video flex flex-col items-center justify-center overflow-hidden bg-gray-50 relative group">
                            {imagePreview ? (
                                <div className="relative w-full h-full">
                                    <NextImage
                                        src={imagePreview}
                                        alt="Cover Preview"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg z-10 opacity-0 group-hover:opacity-100"
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
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 w-full h-full justify-center">
                                    <div className="text-gray-300">
                                        <svg
                                            className="w-16 h-16 mx-auto"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="space-y-4 text-center">
                                        <p className="text-gray-500 font-['Istok_Web'] text-sm">
                                            Upload a cover image for your post
                                        </p>
                                        <label className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer inline-flex items-center gap-2 uppercase tracking-wider text-sm shadow-sm">
                                            <span>Choose File</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-400">
                                            PNG, JPG up to 5MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Inputs */}
                    <div className="flex flex-col h-full">
                        {/* Title Input */}
                        <div className="mb-6">
                            <label className="block text-sm text-black mb-2 font-['Istok_Web'] font-bold uppercase tracking-wider">
                                Post Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="ENTER A TITLE..."
                                className="w-full px-4 py-4 bg-[#D9D9D9] text-black rounded-xl placeholder-gray-500 font-['Istok_Web'] font-bold"
                                required
                            />
                        </div>

                        {/* Content Input */}
                        <div className="flex-1 min-h-75 flex flex-col">
                            <label className="block text-sm text-black mb-2 font-['Istok_Web'] font-bold uppercase tracking-wider">
                                Post Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="WRITE YOUR STORY HERE..."
                                className="flex-1 w-full px-4 py-4 bg-[#D9D9D9] text-black rounded-xl placeholder-gray-500 resize-none font-['Istok_Web']"
                                required
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 9: Publish Button */}
            <div className="flex justify-end gap-4 py-6 border-t font-['Istok_Web']">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-bold uppercase tracking-wider"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                    disabled={
                        loading ||
                        !title.trim() ||
                        !content.trim()
                    }
                    className="px-8 py-3 bg-[#33A0E5] text-white font-bold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                    {loading ? (
                        <>
                            <svg
                                className="animate-spin w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Publishing...
                        </>
                    ) : (
                        "Publish Post"
                    )}
                </button>
            </div>
        </div>
    );
}
