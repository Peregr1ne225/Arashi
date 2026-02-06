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
        <div className="min-h-screen bg-[#FDFDFB] py-4 px-4">
            <main className="container mx-auto max-w-5xl">
                {/* Back Link */}
                <Link
                    href="/blogs"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-[#0e4d80] mb-8 transition-colors font-bold font-istok uppercase tracking-widest text-xs group"
                >
                    <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100 group-hover:border-[#0e4d80] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    Back to Feed
                </Link>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100">
                    {/* Header Section */}
                    <div className="bg-[#0e4d80] text-white p-10 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold font-istok uppercase tracking-widest mb-4 text-blue-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Creator Tools
                            </div>
                            <h1 className="font-koulen text-5xl md:text-6xl tracking-wider mb-4 leading-none">
                                WRITING <span className="text-blue-200">STUDIO</span>
                            </h1>
                            <p className="font-istok text-blue-100/80 max-w-xl text-lg">
                                Share your thoughts, styles, and stories with the community.
                            </p>
                            {user?.username && (
                                <div className="mt-6 inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/10">
                                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="text-xs text-blue-100 font-istok">
                                        Posting as <span className="text-white font-bold">{user.username}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="p-8 md:p-12">
                        <PostForm />
                    </div>
                </div>
            </main>
        </div>
    );
}
