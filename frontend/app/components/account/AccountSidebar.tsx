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
        <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* User Brief Info */}
            <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                        {user?.first_name?.[0] || user?.username?.[0] || "U"}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username}
                        </h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-2 space-y-1">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id || (item.id === "profile" && !activeTab);
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

                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors mt-4"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    );
}
