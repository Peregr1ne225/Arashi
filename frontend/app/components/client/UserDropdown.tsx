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
                    className="p-3 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all focus:outline-none"
                >
                    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.6667 14V12.6667C12.6667 11.9594 12.3858 11.2811 11.8857 10.781C11.3856 10.281 10.7073 10 10 10H6C5.29276 10 4.61448 10.281 4.11438 10.781C3.61429 11.2811 3.33333 11.9594 3.33333 12.6667V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 7.33333C9.47276 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667C5.33333 6.13943 6.52724 7.33333 8 7.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-gray-100 rounded-4xl shadow-2xl shadow-blue-900/10 py-6 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                        {isAuthenticated ? (
                            <>
                                <div className="px-8 py-2 border-b border-gray-50 mb-4 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0e4d80] font-bold font-body text-xs">
                                            {(user?.username || "A").substring(0, 1).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-[#0e4d80] font-body uppercase tracking-widest truncate">
                                                {user?.username || "Account"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-400 font-body uppercase tracking-wider truncate pl-11">
                                        {user?.email}
                                    </p>
                                </div>

                                <div className="space-y-1 px-4">
                                    {menuItems.map(
                                        (item) =>
                                            item.show && (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="group flex items-center px-4 py-3 text-[11px] font-bold text-gray-500 font-body uppercase tracking-[0.2em] hover:text-[#0e4d80] hover:bg-gray-50 rounded-xl transition-all"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <div className="w-1.5 h-1.5 bg-[#0e4d80] rounded-full opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all mr-3" />
                                                    {item.label}
                                                </Link>
                                            ),
                                    )}
                                </div>

                                <div className="pt-4 mt-4 px-8 border-t border-gray-50">
                                    <button
                                        onClick={handleLogout}
                                        className="text-[10px] font-bold text-red-400 font-body uppercase tracking-[0.2em] hover:text-red-600 transition-colors w-full text-left py-2 hover:bg-red-50 rounded-lg px-2 -mx-2"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="px-8 py-2 space-y-6">
                                <div className="space-y-2 text-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0e4d80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-body font-bold uppercase tracking-widest">Member Access</p>
                                    <h4 className="text-4xl text-[#0e4d80] font-display uppercase leading-none mt-1">Arashi</h4>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsLoginModalOpen(true);
                                    }}
                                    className="w-full py-4 bg-[#0e4d80] text-white rounded-full text-[11px] font-bold font-body uppercase tracking-[0.2em] hover:bg-[#0b3d66] hover:shadow-lg hover:shadow-blue-900/20 transition-all transform hover:-translate-y-0.5"
                                >
                                    Login / Sign Up
                                </button>

                                <div className="text-center pt-2">
                                    <Link
                                        href="/register"
                                        className="text-[11px] text-gray-500 font-body font-light uppercase tracking-[0.2em] border-b border-transparent hover:border-gray-200 transition-all"
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
