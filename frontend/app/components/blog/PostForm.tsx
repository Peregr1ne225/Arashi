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
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Image Upload */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0e4d80]" />
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cover Image</label>
                    </div>

                    {/* Image Preview Box */}
                    <div className="w-full border-2 border-dashed border-gray-200 rounded-[2rem] p-4 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 aspect-video flex flex-col items-center justify-center overflow-hidden bg-gray-50/50 relative group cursor-pointer h-[320px]">
                        {imagePreview ? (
                            <div className="relative w-full h-full">
                                <NextImage
                                    src={imagePreview}
                                    alt="Cover Preview"
                                    fill
                                    className="object-cover rounded-[1.5rem]"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-[1.5rem]" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-4 right-4 bg-white text-red-500 rounded-full p-3 hover:bg-red-50 transition-all shadow-lg z-10 opacity-0 group-hover:opacity-100 hover:scale-110"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center gap-4 w-full h-full justify-centercursor-pointer w-full h-full justify-center">
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:text-[#0e4d80] group-hover:scale-110 transition-all duration-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-[#0e4d80] font-koulen text-xl uppercase tracking-wide">Upload Cover</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Right Column: Inputs */}
                <div className="flex flex-col h-full space-y-6">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0e4d80]" />
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Post Title</label>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a captivating title..."
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 focus:bg-white focus:border-[#0e4d80] focus:ring-0 transition-all font-istok font-bold text-lg placeholder-gray-400"
                            required
                        />
                    </div>

                    {/* Content Input */}
                    <div className="flex-1 flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0e4d80]" />
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Post Content</label>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your story here..."
                            className="flex-1 w-full px-6 py-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] text-gray-800 focus:bg-white focus:border-[#0e4d80] focus:ring-0 transition-all font-istok text-base leading-relaxed placeholder-gray-400 resize-none min-h-[300px]"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                {error && (
                    <div className="text-red-500 text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        {error}
                    </div>
                )}
                {!error && <div />} {/* Spacer */}

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-4 text-gray-500 font-bold font-istok uppercase tracking-wider text-xs hover:bg-gray-50 rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                        disabled={loading || !title.trim() || !content.trim()}
                        className="px-10 py-4 bg-[#0e4d80] text-white rounded-full font-bold font-istok uppercase tracking-wider text-xs hover:bg-[#0b3d66] hover:shadow-lg hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            "Publish Post"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
