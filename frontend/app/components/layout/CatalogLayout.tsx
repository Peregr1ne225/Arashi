import { ReactNode } from "react";

interface CatalogLayoutProps {
    title?: string;
    description?: string;
    children: ReactNode;
    breadcrumb?: ReactNode;
    headerContent?: ReactNode;
}

export default function CatalogLayout({
    title,
    description,
    children,
    breadcrumb,
    headerContent,
}: CatalogLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-white">
            <main className="container mx-auto px-4 py-12">
                {/* Breadcrumb - Optional but typically present */}
                {breadcrumb && (
                    <div className="flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 pt-5 mb-8">
                        {breadcrumb}
                    </div>
                )}

                {/* Page Header */}
                {(title || description || headerContent) && (
                    <div className="mb-12 border-b border-white/10 pb-8">
                        {title && (
                            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white mb-4 drop-shadow-lg">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-xl text-accent font-bold uppercase tracking-wider max-w-2xl border-l-4 border-accent pl-4">
                                {description}
                            </p>
                        )}
                        {headerContent}
                    </div>
                )}

                {/* Main Content Area (Sidebar + Grid) */}
                {children}
            </main>
        </div>
    );
}
