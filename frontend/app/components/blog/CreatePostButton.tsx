"use client";

import Link from "next/link";
import { PlusSquare } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";

export default function CreatePostButton() {
    const { isAuthenticated } = useAuth();

    return (
        <Link
            href={isAuthenticated ? "/blogs/create" : "/login"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0e4d80] text-white font-bold rounded-full hover:bg-blue-900 transition-all shadow-md shadow-blue-900/20 group uppercase tracking-wider text-xs font-istok"
        >
            <PlusSquare size={18} className="group-hover:scale-110 transition-transform" />
            <span>Create Post</span>
        </Link>
    );
}
