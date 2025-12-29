"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

import LoginModal from "@/app/components/auth/LoginModal";

export default function UserDropdown() {
    const { user, isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
        router.push("/");
    };

    const menuItems = [
        { label: "My Profile", href: "/account", show: isAuthenticated },
        { label: "Mission Control", href: "/admin", show: isAuthenticated && (user?.is_staff || user?.is_superuser) },
        { label: "Match History", href: "/account?tab=orders", show: isAuthenticated },
    ];

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center text-white hover:text-accent focus:outline-none transition-colors p-2 skew-box hover:bg-white/10"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-white/20 skew-box shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden">
                        {isAuthenticated ? (
                            <>
                                <div className="px-6 py-4 border-b border-white/10 bg-black/40">
                                    <p className="text-sm font-black uppercase italic tracking-wider text-white truncate">
                                        {user?.username || "Operative"}
                                    </p>
                                    <p className="text-xs font-medium text-gray-400 truncate tracking-wide">
                                        {user?.email || "operative@arashi.com"}
                                    </p>
                                </div>

                                <div className="py-2">
                                    {menuItems.map(
                                        (item) =>
                                            item.show && (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="block px-6 py-3 text-sm font-bold uppercase tracking-wider text-gray-300 hover:text-accent hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-accent"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {item.label}
                                                </Link>
                                            )
                                    )}
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-6 py-4 text-sm font-black uppercase italic tracking-widest text-red-500 hover:bg-red-900/10 hover:text-red-400 border-t border-white/10 transition-colors"
                                >
                                    Log Out //
                                </button>
                            </>
                        ) : (
                            <div className="p-4 space-y-3">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsLoginModalOpen(true);
                                    }}
                                    className="block w-full text-center px-4 py-3 bg-accent text-black font-black uppercase italic tracking-tighter skew-box hover:bg-white transition-all shadow-[0_0_10px_rgba(204,255,0,0.2)]"
                                >
                                    Sign In
                                </button>
                                <Link
                                    href="/register"
                                    className="block w-full text-center px-4 py-3 border border-white/20 text-white font-bold uppercase tracking-widest text-xs skew-box hover:border-accent hover:text-accent transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Join The Squad
                                </Link>
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
