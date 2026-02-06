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
        <div className="min-h-screen bg-white pb-4 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="w-full p-4 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 left-0 w-1/3 h-full bg-blue-50/20 skew-x-20 -translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block mb-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="px-6 py-2 rounded-full border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0e4d80] animate-pulse"></div>
                            <span className="font-koulen text-[14px] text-[#0e4d80] uppercase tracking-[0.2em]">Account</span>
                        </div>
                    </div>
                    <h1 className="font-koulen text-[64px] md:text-[80px] leading-[0.9] text-[#0e4d80] mb-6 uppercase tracking-tighter animate-in zoom-in-95 duration-700">
                        My <span className="text-gray-300">Account</span>
                    </h1>
                    <p className="font-body text-gray-400 uppercase tracking-[0.4em] text-xs md:text-sm font-bold animate-in slide-in-from-bottom-5 duration-1000 delay-100">
                        Manage your profile & orders
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="sticky top-[72px] z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto no-scrollbar justify-center space-x-2 md:space-x-8 py-5">
                        {tabs.map((t) => (
                            <Link
                                key={t.id}
                                href={`/account?tab=${t.id}`}
                                className={`whitespace-nowrap font-koulen text-sm md:text-base uppercase tracking-widest px-8 py-3 rounded-full transition-all duration-300 relative group ${activeTab === t.id
                                    ? "text-[#0e4d80]"
                                    : "text-gray-400 hover:text-[#0e4d80]"
                                    }`}
                            >
                                {t.label}
                                {activeTab === t.id && (
                                    <div className="absolute inset-0 bg-[#0e4d80]/5 rounded-full -z-10 animate-in fade-in zoom-in-90" />
                                )}
                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#0e4d80] transition-all duration-300 ${activeTab === t.id ? "opacity-100 scale-100" : "opacity-0 scale-0 group-hover:opacity-40 group-hover:scale-100"}`} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4 max-w-5xl">
                <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-blue-900/5 p-8 border border-gray-100 relative overflow-hidden">
                    {/* Decorative Blobs */}
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none transition-all duration-1000"></div>
                    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#0e4d80]/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 animate-in fade-in duration-500 slide-in-from-bottom-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
