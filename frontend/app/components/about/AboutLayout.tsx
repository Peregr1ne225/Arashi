"use client";

import AboutSidebar from "./AboutSidebar";

interface AboutLayoutProps {
    children: React.ReactNode;
    activeTab: string;
}

export default function AboutLayout({ children, activeTab }: AboutLayoutProps) {
    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="mb-12 border-b border-white/10 pb-8">
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white mb-2">
                        About <span className="text-accent">Company</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">
                        Mission Protocol // Terms // Directives
                    </p>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-3 mb-8 lg:mb-0">
                        <AboutSidebar activeTab={activeTab} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <div className="bg-neutral-900 border border-white/10 skew-box shadow-[0_0_30px_rgba(0,0,0,0.3)] p-8 min-h-[500px] text-white">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
