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
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center pt-20 pb-20 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-white rounded-4xl shadow-lg p-10 text-center border border-gray-100">
                    <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-red-600"
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
                    <h1 className="text-3xl font-bold mb-4 text-black font-koulen uppercase tracking-wide">
                        Payment Cancelled
                    </h1>
                    <p className="text-gray-600 mb-8 font-istok text-lg">
                        Your items have been removed from the cart. You can reorder them below.
                    </p>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <button
                            onClick={handleReorder}
                            className="w-full py-4 px-6 bg-[#0e4d80] text-white rounded-full font-koulen uppercase tracking-widest text-lg hover:bg-[#0a3a60] transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                        >
                            Reorder Items
                        </button>
                        <Link
                            href="/"
                            className="block w-full py-4 px-6 border border-gray-300 text-black rounded-full font-koulen uppercase tracking-widest text-lg hover:bg-gray-50 transition-colors"
                        >
                            Continue Shopping
                        </Link>
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
