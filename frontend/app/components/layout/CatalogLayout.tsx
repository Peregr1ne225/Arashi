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
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-8">
                {/* Breadcrumb - Optional but typically present */}
                {breadcrumb && (
                    <div className="flex items-center text-sm text-gray-600 pt-5 mb-6">
                        {breadcrumb}
                    </div>
                )}

                {/* Page Header */}
                {(title || description || headerContent) && (
                    <div className="mb-8">
                        {title && (
                            <h1 className="text-3xl font-bold mb-4 text-black">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-gray-600 mb-4">{description}</p>
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
