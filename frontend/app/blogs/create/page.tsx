"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PostForm from "@/app/components/blog/PostForm";
import { useAuth } from "@/app/contexts/AuthContext";

export default function CreateBlogPage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login?redirect=/blogs/create");
        }
    }, [isAuthenticated, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main className="container py-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
                            <div className="space-y-4">
                                <div className="h-12 bg-gray-200 rounded" />
                                <div className="h-64 bg-gray-200 rounded" />
                                <div className="h-32 bg-gray-200 rounded" />
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
        <div className="min-h-screen bg-gray-50">
            <main className="container py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors pt-6"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Blog
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Create New Post
                        </h1>
                        <p className="text-gray-600">
                            Share your thoughts with the community. Your post will be published with a random pseudonym for privacy.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <PostForm />
                    </div>
                </div>
            </main>
        </div>
    );
}

