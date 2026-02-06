"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/app/components/auth/AuthGuard";
import {
    LayoutDashboard,
    Package,
    ListTree,
    ShoppingCart,
    Image as ImageIcon,
    SlidersHorizontal,
    User as UserIcon,
    Box,
} from "lucide-react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();

    const navItems = [
        {
            id: "dashboard",
            label: "Overview",
            href: "/admin",
            icon: LayoutDashboard,
        },
        {
            id: "orders",
            label: "Orders",
            href: "/admin/orders",
            icon: ShoppingCart,
        },
        {
            id: "products",
            label: "Products",
            href: "/admin/products",
            icon: Package,
        },
        {
            id: "categories",
            label: "Categories",
            href: "/admin/categories",
            icon: ListTree,
        },
        {
            id: "attributes",
            label: "Attributes",
            href: "/admin/attributes",
            icon: SlidersHorizontal,
        },
        {
            id: "avatars",
            label: "3D Avatars",
            href: "/admin/avatars",
            icon: Box,
        },
        { id: "hero", label: "Hero", href: "/admin/hero", icon: ImageIcon },
        { id: "users", label: "Users", href: "/admin/users", icon: UserIcon },
    ];

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(href);
    };

    return (
        <AuthGuard requireAdmin={true}>
            <div className="bg-[#FDFDFB] min-h-screen flex flex-col lg:flex-row w-full">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-72 shrink-0 lg:h-[calc(100vh-5rem)] lg:sticky lg:top-20 p-4 lg:p-6 overflow-y-auto scrollbar-hide z-40">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 h-full flex flex-col p-6">
                        <div className="mb-8 px-2">
                            <h1 className="font-koulen text-3xl tracking-tight text-[#0e4d80] flex items-center gap-2">
                                ADMIN <span className="text-[#0e4d80]/60">PANEL</span>
                            </h1>
                            <p className="font-istok text-[9px] text-gray-400 uppercase tracking-[0.3em] font-bold mt-2 pl-1">
                                Core Control System
                            </p>
                        </div>

                        <nav className="flex flex-col space-y-2 flex-1">
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`
                                            flex items-center space-x-4 px-5 py-4 rounded-full transition-all duration-300 group
                                            ${active
                                                ? "bg-[#0e4d80] text-white shadow-lg shadow-blue-900/20 translate-x-1"
                                                : "text-gray-400 hover:text-[#0e4d80] hover:bg-blue-50/50 hover:translate-x-1"
                                            }
                                        `}
                                    >
                                        <Icon
                                            className={`w-5 h-5 ${active ? "text-white" : "text-gray-400 group-hover:text-[#0e4d80]"}`}
                                        />
                                        <span className="font-istok text-[11px] font-bold uppercase tracking-[0.2em]">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-auto pt-6 border-t border-gray-50">
                            <Link href="/" className="flex items-center gap-3 px-5 py-3 rounded-full text-gray-400 hover:text-[#0e4d80] hover:bg-gray-50 transition-colors group">
                                <span className="font-koulen text-sm uppercase tracking-wider">Exit to Shop</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 px-4 lg:px-6 lg:py-6 h-auto">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
