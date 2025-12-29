"use client";

import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
            }
        }
    }, [isAuthenticated, loading, user, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user?.is_staff && !user?.is_superuser) return null;

    const sections = [
        {
            title: "Product Management",
            description: "Add, edit, and update products. Manage inventory and pricing.",
            href: "/admin/products",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            color: "bg-blue-50 border-blue-200 hover:border-blue-400",
        },
        {
            title: "Category Management",
            description: "Organize products into categories and subcategories.",
            href: "/admin/categories",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            ),
            color: "bg-green-50 border-green-200 hover:border-green-400",
        },
        {
            title: "Order Management",
            description: "View and process customer orders. Update shipping status.",
            href: "/admin/orders",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            color: "bg-purple-50 border-purple-200 hover:border-purple-400",
        },
        // Placeholder for future sections
        {
            title: "Users (Coming Soon)",
            description: "Manage customer accounts and staff permissions.",
            href: "#",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: "bg-gray-50 border-gray-200 grayscale cursor-not-allowed",
        },
    ];

    return (
        <main className="container mx-auto px-4 py-12 flex-1">
            <div className="mb-12 border-b border-white/10 pb-8">
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white mb-2">
                    Locker Room // <span className="text-accent">Admin</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-wider">
                    Welcome back, Coach {user?.username}. Manage the team assets.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sections.map((section) => (
                    <Link
                        key={section.title}
                        href={section.href}
                        className={`block p-8 border border-white/10 bg-neutral-900 skew-box group relative overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-[0_0_20px_rgba(204,255,0,0.2)] ${section.href === '#' ? 'opacity-50 grayscale cursor-not-allowed pointer-events-none' : ''}`}
                    >
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />

                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div className="p-4 bg-black border border-white/20 skew-box-sm text-accent group-hover:bg-accent group-hover:text-black transition-colors">
                                {section.icon}
                            </div>
                            <span className="text-xs font-black uppercase italic tracking-widest text-white/30 group-hover:text-accent transition-colors">
                                Access //
                            </span>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4 group-hover:text-accent transition-colors">
                                {section.title}
                            </h2>
                            <p className="text-gray-400 font-medium text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                                {section.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
