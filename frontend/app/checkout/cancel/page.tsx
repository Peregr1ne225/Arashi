"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/app/contexts/CartContext";
import { ordersApi } from "@/app/lib/api/orders";

function CheckoutCancelContent() {
    const { clearCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get("order_id");
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const handleCancel = async () => {
            try {
                // 1. Clear cart (User requirement)
                clearCart();

                // 2. Cancel the specific order if ID is present
                if (orderIdParam) {
                    const orderId = parseInt(orderIdParam);
                    await ordersApi.cancelOrder(orderId);
                    console.log(`Order ${orderId} cancelled and stock restored.`);
                }
            } catch (error) {
                console.error("Error cancelling order:", error);
            } finally {
                setLoading(false);
            }
        };

        handleCancel();
    }, [clearCart, orderIdParam]);

    const handleReorder = async () => {
        try {
            setLoading(true);
            if (orderIdParam) {
                const orderId = parseInt(orderIdParam);
                await ordersApi.reorder(orderId);
                router.push("/cart");
            } else {
                // Fallback if no ID (should rely on URL)
                router.push("/cart");
            }
        } catch (error) {
            console.error("Error reordering:", error);
            alert("Failed to reorder items.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Cancelling order...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-lg">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-black">
                        Payment Cancelled
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Your items have been removed from the cart. You can reorder them below.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={handleReorder}
                            className="block w-full py-3 px-4 bg-blue-600 text-white rounded-md text-center font-medium hover:bg-blue-700 transition"
                        >
                            Reorder Items
                        </button>
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

export default function CheckoutCancelPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Loading...</p>
            </div>
        }>
            <CheckoutCancelContent />
        </Suspense>
    );
}
