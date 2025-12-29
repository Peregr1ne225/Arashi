"use client";

import AboutSidebar from "./AboutSidebar";

interface AboutLayoutProps {
    children: React.ReactNode;
    activeTab: string;
}

export default function AboutLayout({ children, activeTab }: AboutLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">About Company</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Everything you need to know about our mission, terms, and privacy.
                    </p>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-3 mb-6 lg:mb-0">
                        <AboutSidebar activeTab={activeTab} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9">
                        <div className="bg-white shadow rounded-lg p-6 min-h-[500px]">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
