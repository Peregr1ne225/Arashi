"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/contexts/CartContext";

function CheckoutSuccessContent() {
    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");
    const [cleared, setCleared] = useState(false);

    useEffect(() => {
        // Clear the cart on successful payment return
        if (!cleared) {
            clearCart();
            setCleared(true);
        }
    }, [clearCart, cleared]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-lg">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-black">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for your purchase. Your order is being processed.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href={orderId ? `/orders/${orderId}` : "/orders"}
                            className="block w-full py-3 px-4 bg-blue-600 text-white rounded-md text-center font-medium hover:bg-blue-700 transition"
                        >
                            {orderId ? "View Your Order" : "View My Orders"}
                        </Link>
                        <Link
                            href="/"
                            className="block w-full py-3 px-4 border border-gray-300 rounded-md text-center font-medium hover:bg-gray-50 transition"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
