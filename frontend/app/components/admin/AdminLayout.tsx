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
            <div className="bg-[#FDFDFB] h-[calc(100vh-3.75rem)] flex flex-col lg:flex-row w-full overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-72 shrink-0 bg-white lg:sticky lg:top-0 lg:h-full lg:overflow-y-auto border-r border-gray-100 p-6 space-y-8 group scrollbar-hide">
                    <div>
                        <h1 className="font-koulen text-4xl tracking-tight text-[#0e4d80] flex items-center gap-2">
                            ADMIN <span className="text-[#0e4d80]/60">PANEL</span>
                        </h1>
                        <p className="font-istok text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold mt-2">
                            Core Control System
                        </p>
                    </div>

                    <nav className="flex flex-col space-y-2">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`
                                        flex items-center space-x-4 px-4 py-4 rounded-full transition-all duration-300 group
                                        ${active
                                            ? "bg-[#e0f2fe] text-[#0e4d80] shadow-sm translate-x-2 font-bold"
                                            : "text-gray-400 hover:text-[#0e4d80] hover:bg-gray-50 hover:translate-x-1"
                                        }
                                    `}
                                >
                                    <Icon
                                        className={`w-5 h-5 ${active ? "text-[#0e4d80]" : "text-gray-400 group-hover:text-[#0e4d80]"}`}
                                    />
                                    <span className="font-istok text-[12px] uppercase tracking-[0.2em]">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-white px-6 lg:px-8 pb-8 overflow-auto">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
