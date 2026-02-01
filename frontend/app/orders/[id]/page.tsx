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

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);

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
        <div className="min-h-screen bg-[#FDFDFB] pb-20">
            {/* Hero Header */}
            <div className="w-full pt-20 pb-10 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="font-koulen text-[40px] md:text-[56px] text-[#0e4d80] leading-none mb-2">
                        Order Details
                    </h1>
                    <p className="font-istok text-gray-400 uppercase tracking-[0.2em] text-sm font-bold">
                        #{order.display_id || order.id} • {order.status}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8">
                    <Link
                        href="/account?tab=orders"
                        className="text-gray-400 hover:text-[#0e4d80] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest font-istok"
                    >
                        ← Back to Orders
                    </Link>
                </div>

                <div className="bg-white rounded-4xl shadow-xl shadow-blue-900/5 p-8 md:p-12 border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Column: Items */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Order Info */}
                            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 pb-8 border-b border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-koulen text-[#0e4d80] leading-none mb-2">
                                        Order #{order.display_id || order.id}
                                    </h2>
                                    <p className="text-xs font-istok font-bold text-gray-400 uppercase tracking-widest">
                                        Placed on {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest font-istok border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <h3 className="text-lg font-koulen text-[#0e4d80] mb-6">
                                    Items ({order.items.length})
                                </h3>
                                <div className="space-y-8">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-6">
                                            <div className="relative w-24 h-32 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                                                <Image
                                                    src={getImageUrl(item.product.images?.[0])}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h3 className="font-koulen text-xl text-[#0e4d80] leading-tight mb-1">
                                                        {item.product.name}
                                                    </h3>
                                                    {item.color_name && item.size_name && (
                                                        <div className="flex gap-3 text-[10px] font-istok font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                            <span>Color: {item.color_name}</span>
                                                            <span>Size: {item.size_name}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    <p className="text-xs font-istok font-bold text-gray-400 uppercase tracking-widest">
                                                        Qty: {item.quantity}
                                                    </p>
                                                    <div className="text-right">
                                                        {(item.original_price || item.product.price) > item.price ? (
                                                            <div className="flex flex-col items-end">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] bg-[#D2042D]/10 text-[#D2042D] px-1.5 py-0.5 rounded-sm font-bold font-istok">
                                                                        -{Math.round((((item.original_price || item.product.price) - item.price) / (item.original_price || item.product.price)) * 100)}%
                                                                    </span>
                                                                    <span className="font-koulen text-xs text-gray-300 line-through decoration-gray-300">
                                                                        ฿{Number(item.original_price || item.product.price).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <p className="font-koulen text-xl text-[#D2042D]">
                                                                    ฿{Number(item.price).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="font-koulen text-xl text-[#0e4d80]">
                                                                ฿{Number(item.price).toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="pt-8 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="font-koulen text-xl text-[#0e4d80]">Total Amount</span>
                                    <span className="font-koulen text-3xl text-[#0e4d80]">฿{Number(order.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar: Shipping & Actions */}
                        <div className="space-y-8">
                            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                                <h3 className="text-lg font-koulen text-[#0e4d80] mb-6">
                                    Shipping Details
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-istok">
                                            Recipient
                                        </label>
                                        <p className="font-istok font-bold text-[#0e4d80] text-sm uppercase">
                                            {order.full_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-istok">
                                            Contact
                                        </label>
                                        <p className="font-istok font-bold text-gray-600 text-sm">
                                            {order.phone_number}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-istok">
                                            Delivery Address
                                        </label>
                                        <p className="font-istok text-gray-600 text-sm leading-relaxed text-pretty">
                                            {order.shipping_address}
                                        </p>
                                    </div>
                                    {order.tracking_number && (
                                        <div className="pt-4 border-t border-gray-200/50">
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-istok">
                                                Tracking Number
                                            </label>
                                            <p className="text-[#0e4d80] font-bold text-sm font-mono bg-blue-100/50 inline-block px-3 py-1 rounded-lg">
                                                {order.tracking_number}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                {order.status === "pending" && (
                                    <button
                                        onClick={() => setCancelModalOpen(true)}
                                        className="w-full py-4 px-6 bg-white border border-red-100 text-[#D2042D] rounded-full hover:bg-red-50 font-istok font-bold uppercase tracking-widest text-xs transition-colors shadow-sm"
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
                                                    alert(message);
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="w-full py-4 px-6 bg-[#0e4d80] text-white rounded-full hover:bg-[#0b3d66] font-istok font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:-translate-y-0.5"
                                        >
                                            Reorder Items
                                        </button>
                                    )}

                                <Link
                                    href="/account?tab=orders"
                                    className="block w-full py-4 px-6 text-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-700 font-istok font-bold uppercase tracking-widest text-xs transition-colors"
                                >
                                    Return to Orders
                                </Link>
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
                        alert(message);
                    } finally {
                        setLoading(false);
                    }
                }}
                onCancel={() => setCancelModalOpen(false)}
                isLoading={loading}
            />
        </div>
    );
}
