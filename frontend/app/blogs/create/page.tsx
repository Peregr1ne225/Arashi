"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PostForm from "@/app/components/blog/PostForm";
import { useAuth } from "@/app/contexts/AuthContext";


export default function CreateBlogPage() {
    const router = useRouter();
    const { isAuthenticated, loading, user } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login?redirect=/blogs/create");
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <main className="container py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
                            <div className="space-y-6">
                                <div className="h-12 bg-gray-200 rounded" />
                                <div className="h-48 bg-gray-200 rounded" />
                                <div className="h-64 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            <main className="container py-8">
                <div className="max-w-6xl mx-auto pb-8">
                    {/* Back Link */}
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors pt-6"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Blog
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-black mb-3 font-['Istok_Web']">
                            Create a New Post
                        </h1>
                        <p className="text-gray-600 max-w-xl mx-auto font-['Istok_Web']">
                            Write your blog post and upload a cover image.
                        </p>
                        {user?.username && (
                            <p className="text-sm text-[#33A0E5] mt-2 font-['Istok_Web']">
                                Posting as: <span className="font-semibold">{user.username}</span>
                            </p>
                        )}
                    </div>

                    {/* Post Form */}
                    <PostForm />
                </div>
            </main>
        </div>
    );
}
