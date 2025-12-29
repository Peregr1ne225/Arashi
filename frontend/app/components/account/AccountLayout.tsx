"use client";

import AccountSidebar from "./AccountSidebar";

interface AccountLayoutProps {
    children: React.ReactNode;
    activeTab: string;
}

export default function AccountLayout({ children, activeTab }: AccountLayoutProps) {
    return (
        <div className="min-h-screen bg-background py-16 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12 border-b border-white/10 pb-6 flex items-end justify-between">
                    <div>
                        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
                            My Locker
                        </h1>
                        <p className="mt-2 text-sm font-bold uppercase tracking-widest text-accent">
                            Manage your gear, stats, and settings.
                        </p>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    {/* Sidebar */}
                    <div className="lg:col-span-3 mb-8 lg:mb-0">
                        <AccountSidebar activeTab={activeTab} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
