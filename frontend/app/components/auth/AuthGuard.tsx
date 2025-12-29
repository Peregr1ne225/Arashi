"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                // Not logged in
                if (requireAdmin) {
                    // Critical: Admin route unauthorized -> Home (No redirect loop, No Login Page)
                    router.replace("/");
                } else {
                    // Regular route -> Login Page with redirect back
                    router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                }
            } else {
                // Logged in check for admin
                if (requireAdmin && !user?.is_staff && !user?.is_superuser) {
                    // Not an admin -> Home
                    router.replace("/");
                }
            }
        }
    }, [isAuthenticated, loading, router, user, requireAdmin, pathname]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    // Only render children if authorized
    if (!isAuthenticated) return null;
    if (requireAdmin && (!user?.is_staff && !user?.is_superuser)) return null;

    return <>{children}</>;
}
