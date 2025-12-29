"use client";

import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { User, Package, MapPin, LogOut } from "lucide-react";

interface AccountSidebarProps {
    activeTab: string;
}

export default function AccountSidebar({ activeTab }: AccountSidebarProps) {
    const { logout, user } = useAuth();

    const menuItems = [
        { id: "profile", label: "My Profile", icon: User, href: "/account?tab=profile" },
        { id: "orders", label: "My Orders", icon: Package, href: "/account?tab=orders" },
        { id: "addresses", label: "Addresses", icon: MapPin, href: "/account?tab=addresses" },
    ];

    return (
        <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden sticky top-24">
            {/* User Brief Info */}
            <div className="p-6 border-b border-white/10 bg-black/40">
                <div className="flex items-center space-x-4">
                    <div className="h-14 w-14 bg-accent/20 border border-accent flex items-center justify-center text-accent font-black text-2xl skew-box-sm">
                        {user?.first_name?.[0] || user?.username?.[0] || "U"}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold uppercase italic tracking-tighter text-white text-lg truncate">
                            {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username}
                        </h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-2">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id || (item.id === "profile" && !activeTab);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 transition-all skew-box ${isActive
                                ? "bg-accent text-black font-black uppercase italic tracking-wide border border-transparent shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                                : "text-gray-400 hover:text-white hover:bg-white/5 font-bold uppercase tracking-wider border border-transparent hover:border-white/10"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-black" : "text-gray-500 group-hover:text-white"}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}

                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:text-red-400 hover:bg-red-900/20 transition-all mt-6 skew-box border border-transparent hover:border-red-500/30 font-bold uppercase tracking-wider"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
}
