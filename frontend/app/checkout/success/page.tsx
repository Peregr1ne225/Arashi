"use client";

import { useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/contexts/CartContext";

function CheckoutSuccessContent() {
    const { clearCart } = useCart();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");
    const hasCleared = useRef(false);

    useEffect(() => {
        // Clear the cart on successful payment return
        if (!hasCleared.current) {
            clearCart();
            hasCleared.current = true;
        }
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center pt-20 pb-20 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-white rounded-4xl shadow-lg p-10 text-center border border-gray-100">
                    <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-green-600"
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
                    <h1 className="text-3xl font-bold mb-4 text-black font-koulen uppercase tracking-wide">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600 mb-8 font-istok text-lg">
                        Thank you for your purchase. Your order {orderId && <span className="font-bold text-black">#{orderId}</span>} is now being processed.
                    </p>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <Link
                            href={orderId ? `/orders/${orderId}` : "/account"}
                            className="block w-full py-4 px-6 bg-[#0e4d80] text-white rounded-full font-koulen uppercase tracking-widest text-lg hover:bg-[#0a3a60] transition-all shadow-md hover:shadow-lg"
                        >
                            {orderId ? "View Your Order" : "View My Orders"}
                        </Link>
                        <Link
                            href="/"
                            className="block w-full py-4 px-6 border border-gray-300 text-black rounded-full font-koulen uppercase tracking-widest text-lg hover:bg-gray-50 transition-colors"
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
            <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
