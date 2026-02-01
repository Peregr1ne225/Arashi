"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the account page's orders tab
        router.replace("/account?tab=orders");
    }, [router]);

    return (
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
    );
}
