import { ReactNode } from "react";

interface CatalogLayoutProps {
    title?: string;
    children: ReactNode;
    breadcrumb?: ReactNode;
    headerContent?: ReactNode;
    sidebar?: ReactNode;
}

export default function CatalogLayout({
    title,
    children,
    breadcrumb,
    headerContent,
    sidebar,
}: CatalogLayoutProps) {
    return (
        <div className="min-h-screen bg-white">
            <div className="flex w-full">
                {/* Sidebar Column - Only renders if sidebar prop is provided */}
                {sidebar && (
                    <aside className="hidden lg:block w-80 shrink-0 border-r border-gray-100">
                        <div className="sticky top-0 h-screen overflow-y-auto no-scrollbar p-6 flex flex-col justify-center">
                            {sidebar}
                        </div>
                    </aside>
                )}

                {/* Main Content Column */}
                <main className="flex-1 w-full px-6 py-8 min-w-0">
                    {/* Breadcrumb - Optional but typically present */}
                    {breadcrumb && (
                        <div className="flex items-center text-sm text-gray-600 pt-1 mb-6">
                            {breadcrumb}
                        </div>
                    )}

                    {/* Page Header - Left Aligned */}
                    {(title || headerContent) && (
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
                                <div>
                                    {title && (
                                        <h1 className="font-istok text-[32px] md:text-[42px] font-bold leading-tight text-black uppercase tracking-wide">
                                            {title}
                                        </h1>
                                    )}
                                </div>
                            </div>

                            {/* Search Bar / Header Content Row */}
                            {headerContent && (
                                <div className="flex flex-col md:flex-row md:items-center justify-start gap-4 mt-4">
                                    <div className="w-full md:w-auto">
                                        {headerContent}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Content Area (Sidebar + Grid) */}
                    {children}
                </main>
            </div>
        </div>
    );
}
