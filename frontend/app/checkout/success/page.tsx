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
        <div className="min-h-screen bg-white pb-32 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="w-full py-4 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-green-50/30 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block mb-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="px-6 py-2 rounded-full border border-green-100 bg-white/80 backdrop-blur-sm shadow-sm flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-koulen text-[14px] text-green-600 uppercase tracking-[0.2em]">
                                Order Confirmed
                            </span>
                        </div>
                    </div>
                    <h1 className="font-koulen text-[64px] md:text-[96px] leading-[0.9] text-green-700 mb-6 uppercase tracking-tighter animate-in zoom-in-95 duration-700">
                        Payment <span className="text-gray-300">Success</span>
                    </h1>
                </div>
            </div>

            {/* Main Content Card Container */}
            <div className="container mx-auto p-4 max-w-2xl">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-green-900/5 p-8 md:p-12 border border-gray-100 relative overflow-hidden text-center">
                    {/* Decorative Blobs */}
                    <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-green-50/40 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-green-50/20 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sql animate-in zoom-in duration-500 delay-100">
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

                        <p className="text-gray-500 mb-10 font-body text-lg max-w-md mx-auto leading-relaxed">
                            Thank you for your purchase! Your order {orderId && <span className="font-bold text-green-700">#{orderId}</span>} is being processed and will be shipped soon.
                        </p>

                        <div className="space-y-4 max-w-sm mx-auto">
                            <Link
                                href={orderId ? `/orders/${orderId}` : "/account"}
                                className="block w-full py-5 px-6 bg-[#0e4d80] text-white rounded-full font-koulen uppercase tracking-[0.2em] text-lg hover:bg-[#0a3a60] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            >
                                {orderId ? "View Your Order" : "View My Orders"}
                            </Link>
                            <Link
                                href="/"
                                className="block w-full py-5 px-6 border border-gray-200 text-gray-400 rounded-full font-koulen uppercase tracking-[0.2em] text-lg hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all"
                            >
                                Continue Shopping
                            </Link>
                        </div>
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
