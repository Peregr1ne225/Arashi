"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ordersApi } from "@/app/lib/api/orders";
import { Order } from "@/app/types/order";
import { useAuth } from "@/app/hooks/useAuth";
import { getImageUrl } from "@/app/lib/utils/image";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import MessageModal from "@/app/components/ui/MessageModal";

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);

    // Message Modal
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/orders/${params.id}`);
        }
    }, [isAuthenticated, params.id, router]);

    useEffect(() => {
        if (!params.id) return;

        const fetchOrder = async () => {
            try {
                // Use ID as string (display_id)
                const orderId = params.id as string;
                const data = await ordersApi.getOrder(orderId);
                setOrder(data);
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "processing":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "shipped":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "delivered":
                return "bg-green-100 text-green-800 border-green-200";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center font-istok">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4 font-koulen uppercase tracking-wide">
                        Order Not Found
                    </h1>
                    <p className="text-red-500 mb-6 font-bold">{error}</p>
                    <Link
                        href="/account?tab=orders"
                        className="text-gray-600 hover:text-black underline"
                    >
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-8 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="w-full py-4 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/30 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto text-center relative z-10">
                    <div className="inline-block mb-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="px-6 py-2 rounded-full border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0e4d80] animate-pulse"></div>
                            <span className="font-koulen text-[14px] text-[#0e4d80] uppercase tracking-[0.2em]">
                                Order #{order.display_id || order.id}
                            </span>
                        </div>
                    </div>
                    <h1 className="font-koulen text-[64px] md:text-[96px] leading-[0.9] text-[#0e4d80] mb-6 uppercase tracking-tighter animate-in zoom-in-95 duration-700">
                        Order <span className="text-gray-300">Details</span>
                    </h1>

                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest font-istok border bg-white ${getStatusColor(order.status)}`}>
                        <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : order.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`} />
                        Status: {order.status}
                    </div>
                </div>
            </div>

            {/* Main Content Card Container */}
            <div className="container mx-auto p-4 max-w-[1600px]">
                <div className="mb-8 pl-4">
                    <Link
                        href="/account?tab=orders"
                        className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#0e4d80] font-body transition-colors group"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Orders
                    </Link>
                </div>

                <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-blue-900/5 p-8 border border-gray-100 relative overflow-hidden">
                    {/* Decorative Blobs */}
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#0e4d80]/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Left Column: Items */}
                            <div className="lg:col-span-8 space-y-10">
                                {/* Order Info */}
                                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pb-8 border-b border-gray-100">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="w-10 h-10 rounded-full bg-[#0e4d80] text-white flex items-center justify-center text-lg font-koulen shadow-lg shadow-blue-900/20">
                                                1
                                            </span>
                                            <h2 className="text-2xl font-koulen text-[#0e4d80] uppercase tracking-wide">
                                                Order Items
                                            </h2>
                                        </div>
                                        <p className="text-xs font-istok font-bold text-gray-400 uppercase tracking-widest pl-14">
                                            Placed on {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="font-koulen text-xl text-gray-400">
                                        {order.items.length} Items
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-6">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="group relative bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex gap-6 items-center">
                                                <div className="relative w-24 aspect-[3/4] shrink-0 bg-[#f4f4f5] rounded-2xl overflow-hidden border border-gray-100/50 shadow-sm">
                                                    <Image
                                                        src={getImageUrl(item.product.images?.[0])}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 py-2">
                                                    <h3 className="font-koulen text-xl text-[#0e4d80] uppercase tracking-wide truncate mb-2">
                                                        {item.product.name}
                                                    </h3>
                                                    {(item.color_name || item.size_name) && (
                                                        <div className="flex gap-2 mb-3">
                                                            {item.color_name && (
                                                                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-500 font-bold uppercase tracking-wider border border-gray-100">
                                                                    {item.color_name}
                                                                </span>
                                                            )}
                                                            {item.size_name && (
                                                                <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-500 font-bold uppercase tracking-wider border border-gray-100">
                                                                    {item.size_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="text-xs font-istok font-bold text-gray-400 uppercase tracking-widest">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right pr-4">
                                                    {(item.original_price || item.product.price) > item.price ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-koulen text-2xl text-[#0e4d80] tracking-wide">
                                                                ฿{Number(item.price).toFixed(2)}
                                                            </span>
                                                            <span className="text-xs text-red-400 line-through font-body font-bold">
                                                                ฿{Number(item.original_price || item.product.price).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-koulen text-2xl text-[#0e4d80] tracking-wide">
                                                            ฿{Number(item.price).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Sidebar: Shipping & Actions */}
                            <div className="lg:col-span-4 space-y-8 sticky top-4 h-fit">
                                <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-blue-900/5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="w-10 h-10 rounded-full bg-[#0e4d80] text-white flex items-center justify-center text-lg font-koulen shadow-lg shadow-blue-900/20">
                                            2
                                        </span>
                                        <h2 className="text-2xl font-koulen text-[#0e4d80] uppercase tracking-wide">
                                            Summary
                                        </h2>
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-istok">
                                                    Recipient
                                                </label>
                                                <p className="font-koulen text-[#0e4d80] text-lg tracking-wide uppercase">
                                                    {order.full_name}
                                                </p>
                                                <p className="font-istok text-gray-500 text-xs font-bold mt-1">
                                                    {order.phone_number}
                                                </p>
                                            </div>
                                            <div className="h-px bg-gray-200/50 w-full" />
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-istok">
                                                    Delivery Address
                                                </label>
                                                <p className="font-body text-gray-600 text-sm leading-relaxed text-pretty font-medium">
                                                    {order.shipping_address}
                                                </p>
                                            </div>
                                            {order.tracking_number && (
                                                <>
                                                    <div className="h-px bg-gray-200/50 w-full" />
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-istok">
                                                            Tracking Number
                                                        </label>
                                                        <p className="text-[#0e4d80] font-bold text-sm font-mono bg-blue-50 inline-block px-3 py-1 rounded-lg border border-blue-100">
                                                            {order.tracking_number}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex justify-between items-end">
                                                <span className="font-koulen text-xl text-gray-400 uppercase tracking-wide">Total Amount</span>
                                                <span className="font-koulen text-4xl text-[#0e4d80] leading-none">฿{Number(order.total_amount).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-3 pt-4">
                                            {order.status === "pending" && (
                                                <button
                                                    onClick={() => setCancelModalOpen(true)}
                                                    className="w-full py-4 px-6 bg-white border-2 border-red-100 text-red-500 rounded-full hover:bg-red-50 hover:border-red-200 font-koulen uppercase tracking-[0.2em] text-sm transition-all shadow-sm hover:shadow-md"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}

                                            {(order.status === "cancelled" ||
                                                order.status === "delivered" ||
                                                order.status === "shipped") && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                setLoading(true);
                                                                await ordersApi.reorder(order.display_id || order.id);
                                                                router.push("/cart");
                                                            } catch (err) {
                                                                const message =
                                                                    err instanceof Error
                                                                        ? err.message
                                                                        : "Failed to reorder";
                                                                setMessageModal({
                                                                    isOpen: true,
                                                                    title: "Order Error",
                                                                    message,
                                                                    type: "error",
                                                                });
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                        className="w-full py-5 px-6 bg-[#0e4d80] text-white rounded-full font-koulen uppercase tracking-[0.2em] text-lg hover:bg-[#0a3a60] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 group"
                                                    >
                                                        Reorder Items
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={cancelModalOpen}
                title="Cancel Order"
                message="Are you sure you want to cancel this order? This action cannot be undone."
                confirmText="Yes, Cancel Order"
                cancelText="No, Keep Order"
                onConfirm={async () => {
                    if (!order) return;
                    try {
                        setLoading(true);
                        await ordersApi.cancelOrder(order.display_id || order.id);
                        const updated = await ordersApi.getOrder(
                            order.display_id || order.id,
                        );
                        setOrder(updated);
                        setCancelModalOpen(false);
                    } catch (err) {
                        const message =
                            err instanceof Error ? err.message : "Failed to cancel order";
                        setMessageModal({
                            isOpen: true,
                            title: "Cancel Failed",
                            message,
                            type: "error",
                        });
                        setCancelModalOpen(false);
                    } finally {
                        setLoading(false);
                    }
                }}
                onCancel={() => setCancelModalOpen(false)}
                isLoading={loading}
            />
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
