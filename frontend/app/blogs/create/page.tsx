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
        <div className="min-h-screen bg-background text-white">
            <main className="container py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-accent font-bold uppercase tracking-wider mb-8 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Playbook
                    </Link>

                    <div className="mb-10 border-b border-white/10 pb-8">
                        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white mb-4">
                            Draft Strategy //
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">
                            Share your thoughts with the community. Privacy guaranteed via random pseudonym assignment.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-neutral-900 border border-white/10 skew-box p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <PostForm />
                    </div>
                </div>
            </main>
        </div>
    );
}

