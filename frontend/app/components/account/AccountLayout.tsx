"use client";

import Link from "next/link";

interface AccountLayoutProps {
    children: React.ReactNode;
    activeTab: string;
}

export default function AccountLayout({ children, activeTab }: AccountLayoutProps) {
    const tabs = [
        { id: "profile", label: "Profile" },
        { id: "orders", label: "Orders" },
        { id: "addresses", label: "Addresses" },
    ];

    return (
        <div className="min-h-screen bg-[#FDFDFB] pb-20">
            {/* Hero Header */}
            <div className="w-full pt-20 pb-10 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="font-koulen text-[40px] md:text-[56px] text-[#0e4d80] leading-none mb-2">
                        My Account
                    </h1>
                    <p className="font-istok text-gray-400 uppercase tracking-[0.2em] text-sm font-bold">
                        Manage your profile & orders
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-0 z-20 bg-[#FDFDFB]/90 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto no-scrollbar justify-center space-x-4 py-6">
                        {tabs.map((t) => (
                            <Link
                                key={t.id}
                                href={`/account?tab=${t.id}`}
                                className={`whitespace-nowrap font-istok text-sm uppercase tracking-widest font-bold px-8 py-3 rounded-full transition-all duration-300 ${activeTab === t.id
                                    ? "bg-[#e0f2fe] text-[#0e4d80] shadow-sm"
                                    : "bg-transparent text-gray-400 hover:text-[#0e4d80] hover:bg-gray-50"
                                    }`}
                            >
                                {t.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-4xl shadow-xl shadow-blue-900/5 p-8 md:p-12 border border-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
