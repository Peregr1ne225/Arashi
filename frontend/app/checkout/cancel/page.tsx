"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/app/contexts/CartContext";
import { ordersApi } from "@/app/lib/api/orders";
import MessageModal from "@/app/components/ui/MessageModal";

function CheckoutCancelContent() {
    const { clearCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get("order_id");
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

    // Message Modal
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const handleCancel = async () => {
            try {
                // 1. Clear cart (User requirement)
                clearCart();

                // 2. Cancel the specific order if ID is present
                if (orderIdParam) {
                    await ordersApi.cancelOrder(orderIdParam);
                    console.log(`Order ${orderIdParam} cancelled and stock restored.`);
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
                await ordersApi.reorder(orderIdParam);
                router.push("/cart");
            } else {
                // Fallback if no ID (should rely on URL)
                router.push("/cart");
            }
        } catch (error) {
            console.error("Error reordering:", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to reorder items.",
                type: "error",
            });
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-32 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="w-full py-4 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-red-50/30 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block mb-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="px-6 py-2 rounded-full border border-red-100 bg-white/80 backdrop-blur-sm shadow-sm flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="font-koulen text-[14px] text-red-600 uppercase tracking-[0.2em]">
                                Payment Issues
                            </span>
                        </div>
                    </div>
                    <h1 className="font-koulen text-[64px] md:text-[96px] leading-[0.9] text-red-600 mb-6 uppercase tracking-tighter animate-in zoom-in-95 duration-700">
                        Order <span className="text-gray-300">Cancelled</span>
                    </h1>
                </div>
            </div>

            {/* Main Content Card Container */}
            <div className="container mx-auto p-4 max-w-2xl">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-red-900/5 p-8 md:p-12 border border-gray-100 relative overflow-hidden text-center">
                    {/* Decorative Blobs */}
                    <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-red-50/40 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-red-50/20 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner animate-in zoom-in duration-500">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-red-500"
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

                        <p className="text-gray-500 mb-10 font-body text-lg max-w-md mx-auto leading-relaxed">
                            Your payment was not completed and items have been removed from your cart. Don&apos;t worry, you can easily reorder them below.
                        </p>

                        <div className="space-y-4 max-w-sm mx-auto">
                            <button
                                onClick={handleReorder}
                                className="w-full py-5 px-6 bg-red-600 text-white rounded-full font-koulen uppercase tracking-[0.2em] text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 group"
                            >
                                Reorder Items
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
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
            <MessageModal
                isOpen={messageModal.isOpen}
                title={messageModal.title}
                message={messageModal.message}
                type={messageModal.type}
                onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
            />
        </div>
    );
}

export default function CheckoutCancelPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        }>
            <CheckoutCancelContent />
        </Suspense>
    );
}
