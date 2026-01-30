"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/app/hooks/useClickOutside";

import dynamic from "next/dynamic";

const LoginModal = dynamic(() => import("@/app/components/auth/LoginModal"), {
    ssr: false,
});

export default function UserDropdown() {
    const { user, isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close dropdown on click outside
    const closeDropdown = useCallback(() => setIsOpen(false), []);
    useClickOutside(dropdownRef, closeDropdown);

    const handleLogout = async () => {
        logout();
        setIsOpen(false);
        router.push("/");
    };

    const menuItems = [
        { label: "My Account", href: "/account", show: isAuthenticated },
        {
            label: "Admin Dashboard",
            href: "/admin",
            show: isAuthenticated && (user?.is_staff || user?.is_superuser),
        },
        { label: "Orders", href: "/account?tab=orders", show: isAuthenticated },
    ];

    return (
        <>
            <div
                className="relative h-full flex items-center justify-center"
                ref={dropdownRef}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 text-(--header-text) hover:scale-125 hover:text-black transition-all focus:outline-none"
                >
                    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.6667 14V12.6667C12.6667 11.9594 12.3858 11.2811 11.8857 10.781C11.3856 10.281 10.7073 10 10 10H6C5.29276 10 4.61448 10.281 4.11438 10.781C3.61429 11.2811 3.33333 11.9594 3.33333 12.6667V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 7.33333C9.47276 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667C5.33333 6.13943 6.52724 7.33333 8 7.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl shadow-black/5 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {isAuthenticated ? (
                            <>
                                <div className="px-6 py-4 border-b border-gray-50 mb-2">
                                    <p className="text-sm font-normal text-black font-istok uppercase tracking-[0.2em] truncate">
                                        {user?.username || "Account"}
                                    </p>
                                    <p className="text-[10px] font-light text-gray-400 font-istok uppercase tracking-wider truncate mt-1">
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="space-y-1 px-2">
                                    {menuItems.map(
                                        (item) =>
                                            item.show && (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="group flex items-center px-4 py-2.5 text-[12px] font-light text-gray-500 font-istok uppercase tracking-[0.2em] hover:text-black transition-all"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <div className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all mr-2" />
                                                    {item.label}
                                                </Link>
                                            ),
                                    )}
                                </div>

                                <div className="pt-2 mt-2 px-6">
                                    <button
                                        onClick={handleLogout}
                                        className="text-[11px] font-normal text-red-400 font-istok uppercase tracking-[0.25em] hover:text-red-600 transition-colors"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="px-6 py-4 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-istok font-light uppercase tracking-widest">Performance Portal</p>
                                    <h4 className="text-lg font-normal text-black font-istok uppercase tracking-tighter italic">Welcome back</h4>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsLoginModalOpen(true);
                                    }}
                                    className="w-full py-3.5 bg-black text-white rounded-full text-[12px] font-normal font-istok uppercase tracking-widest hover:bg-gray-800 transition-all transform hover:scale-[1.02]"
                                >
                                    Login
                                </button>

                                <div className="text-center pt-2">
                                    <Link
                                        href="/register"
                                        className="text-[11px] text-gray-500 font-istok font-light uppercase tracking-[0.2em] border-b border-transparent hover:border-gray-200 transition-all"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Create an account
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    );
}
