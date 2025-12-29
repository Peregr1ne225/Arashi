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
        <div className="bg-white shadow rounded-lg overflow-hidden sticky top-24">
            <div className="p-6 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900 text-lg">
                    Company Info
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Learn more about us and our policies.
                </p>
            </div>

            <nav className="p-2 space-y-1">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id || (item.id === "about" && !activeTab);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${isActive
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
