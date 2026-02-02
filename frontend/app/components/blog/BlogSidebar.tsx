"use client";

import Link from "next/link";
import { UserCircle, PlusSquare } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

export default function BlogSidebar() {
    const { user, isAuthenticated } = useAuth();

    const initials = user?.username
        ? user.username.substring(0, 2).toUpperCase()
        : "??";

    return (
        <div className="space-y-6 sticky top-24">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-[#33A0E5] to-blue-600 flex items-center justify-center text-white text-3xl font-bold font-istok shadow-lg">
                        {initials}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-istok">
                    {user?.username || "Guest User"}
                </h3>
                <p className="text-sm text-gray-500 font-istok uppercase tracking-widest mt-1">
                    Community Member
                </p>

                <div className="mt-8 flex flex-col gap-3">
                    <Link
                        href={isAuthenticated ? "/account" : "/login"}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group"
                    >
                        <UserCircle size={22} className="text-[#33A0E5] group-hover:scale-110 transition-transform" />
                        <span className="font-istok uppercase tracking-wider text-sm">Account</span>
                    </Link>
                    <Link
                        href={isAuthenticated ? "/blogs/create" : "/login"}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-[#33A0E5] text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-md shadow-blue-100 group"
                    >
                        <PlusSquare size={22} className="group-hover:scale-110 transition-transform" />
                        <span className="font-istok uppercase tracking-wider text-sm">Create Post</span>
                    </Link>
                </div>
            </div>

            {/* User Details Panel - Replaces Explore Panel */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-xs font-bold text-red-500 font-istok uppercase tracking-widest mb-6">
                    Community Stats
                </p>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 font-istok">
                        Join the conversation and ask questions with the community!
                    </p>
                </div>
            </div>
        </div>
    );
}
