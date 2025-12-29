"use client";

import Link from "next/link";
import { Info, FileText, Shield } from "lucide-react";

interface AboutSidebarProps {
    activeTab: string;
}

export default function AboutSidebar({ activeTab }: AboutSidebarProps) {
    const menuItems = [
        { id: "about", label: "About Us", icon: Info, href: "/about?tab=about" },
        { id: "terms", label: "Terms of Service", icon: FileText, href: "/about?tab=terms" },
        { id: "policy", label: "Privacy Policy", icon: Shield, href: "/about?tab=policy" },
    ];

    return (
        <div className="bg-neutral-900 border border-white/10 skew-box shadow-[0_0_20px_rgba(0,0,0,0.3)] sticky top-24 overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-black/40">
                <h3 className="font-black text-white text-xl uppercase italic tracking-tighter">
                    Company Info
                </h3>
                <p className="text-xs text-accent font-bold uppercase tracking-wider mt-1">
                    System Data
                </p>
            </div>

            <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id || (item.id === "about" && !activeTab);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 skew-box-sm transition-all duration-300 group border-l-4 ${isActive
                                ? "bg-accent text-black border-white shadow-[0_0_15px_rgba(204,255,0,0.4)]"
                                : "bg-black/40 text-gray-400 border-transparent hover:bg-white/5 hover:text-white hover:border-accent"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-black" : "text-gray-500 group-hover:text-accent transition-colors"}`} />
                            <span className="font-bold uppercase tracking-wide text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
