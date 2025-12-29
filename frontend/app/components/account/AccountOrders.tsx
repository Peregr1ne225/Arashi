"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { ordersApi, Order } from "@/app/lib/api/orders";
import { Package, ChevronDown, ChevronUp, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReviewModal from "../product/ReviewModal";
import { Product } from "@/app/types";

export default function AccountOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<number | null>(null);

    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await ordersApi.getOrders();
            setOrders(response.results);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "bg-green-100 text-green-800";
            case "shipped": return "bg-blue-100 text-blue-800";
            case "processing": return "bg-blue-100 text-blue-800";
            case "cancelled": return "bg-red-100 text-red-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleRateProduct = (product: any, orderId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProduct(product);
        setSelectedOrderForReview(orderId);
        setReviewModalOpen(true);
    };

    const handleCancelOrder = async (orderId: string | number) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        try {
            setLoading(true);
            await ordersApi.cancelOrder(orderId);
            await fetchOrders();
        } catch (err: any) {
            alert(err.message || "Failed to cancel order");
            setLoading(false);
        }
    };

    const handleReorder = async (orderId: string | number) => {
        try {
            setLoading(true);
            await ordersApi.reorder(orderId);
            router.push("/cart");
        } catch (err: any) {
            alert(err.message || "Failed to reorder");
            setLoading(false);
        }
    };

    const handlePay = async (orderId: string | number) => {
        try {
            setLoading(true);
            const { checkout_url } = await ordersApi.payOrder(orderId);
            window.location.href = checkout_url;
        } catch (err: any) {
            alert(err.message || "Failed to initiate payment");
            setLoading(false);
        }
    };


    if (loading) {
        return <div className="text-center py-20 text-accent font-bold uppercase tracking-widest animate-pulse">Loading Match History...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="bg-neutral-900 border border-white/10 skew-box p-16 text-center">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">No Match History</h3>
                <p className="font-bold uppercase tracking-wide text-gray-500 mb-8">Start your season by adding gear to your locker.</p>
                <Link
                    href="/"
                    className="btn-primary inline-flex items-center px-8 py-3"
                >
                    Go to Catalog //
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden">
            <div className="px-6 py-6 border-b border-white/10 bg-black/20">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Match History</h3>
            </div>
            <ul className="divide-y divide-white/5">
                {orders.map((order) => (
                    <li key={order.id} className="bg-neutral-900 transition-colors">
                        <div className="px-6 py-6 hover:bg-white/5 cursor-pointer transition-colors group" onClick={() => toggleOrder(order.id)}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`px-2 py-0.5 text-xs font-black uppercase tracking-wider skew-box border ${order.status === 'delivered' ? 'bg-accent text-black border-accent' : order.status === 'cancelled' ? 'bg-red-900/50 text-red-500 border-red-500' : 'bg-gray-800 text-gray-300 border-gray-600'}`}>
                                            {order.status}
                                        </span>
                                        <p className="text-lg font-black uppercase italic tracking-tighter text-white group-hover:text-accent transition-colors">
                                            Order #{order.display_id || order.id}
                                        </p>
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()} // {order.items.length} Items
                                    </p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                    <p className="font-black text-xl italic tracking-tighter text-white">฿{Number(order.total_amount).toFixed(2)}</p>

                                    {/* Action Buttons for Compact View */}
                                    <div className="flex items-center gap-3">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePay(order.display_id || order.id); }}
                                                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-500 skew-box sm:hidden"
                                            >
                                                Pay
                                            </button>
                                        )}
                                        {expandedOrderId === order.id ? <ChevronUp className="h-5 w-5 text-accent" /> : <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-white" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedOrderId === order.id && (
                            <div className="px-6 py-6 bg-black/50 border-t border-white/10 shadow-inner">
                                <div className="flow-root">
                                    <ul className="-my-4 divide-y divide-white/10">
                                        {order.items.map((item) => (
                                            <li key={item.id} className="py-6 flex gap-4">
                                                <div className="flex-shrink-0 w-20 h-20 bg-neutral-900 border border-white/10 overflow-hidden relative skew-box-sm">
                                                    <Image
                                                        src={item.product.image || item.product.image_url || "/placeholder-product.svg"}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover opacity-80"
                                                    />
                                                </div>
                                                <div className="ml-4 flex-1 flex flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-white">
                                                            <h3 className="font-bold uppercase italic tracking-wide text-lg">{item.product.name}</h3>
                                                            <p className="font-bold text-accent">฿{Number(item.price).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex items-end justify-between text-sm mt-2">
                                                        <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Qty {item.quantity}</p>

                                                        {/* Rate Product Button */}
                                                        {(order.status === 'shipped' || order.status === 'delivered') && (
                                                            item.is_rated ? (
                                                                <span className="text-accent font-bold uppercase tracking-wider flex items-center text-xs">
                                                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                                                    Rated
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => handleRateProduct(item.product, order.id, e)}
                                                                    className="text-gray-400 hover:text-white font-bold uppercase tracking-wider flex items-center text-xs transition-colors"
                                                                >
                                                                    <Star className="w-3 h-3 mr-1" />
                                                                    Rate Gear
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8 border-t border-dashed border-white/20 pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-400 mb-6 font-mono uppercase">
                                        <div>
                                            <p className="text-xs font-bold text-gray-600 mb-1">Shipping Address</p>
                                            <p className="text-white">{order.shipping_address}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-600 mb-1">Contact</p>
                                            <p className="text-white">{order.phone_number}</p>
                                        </div>
                                        {order.tracking_number && (
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-bold text-gray-600 mb-1">Tracking Number</p>
                                                <span className="text-accent font-bold tracking-widest">{order.tracking_number}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons Footer */}
                                    <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-white/10">
                                        {order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleCancelOrder(order.display_id || order.id)}
                                                    className="px-6 py-3 border border-red-900/50 text-red-500 hover:bg-red-900/20 font-bold uppercase tracking-widest text-xs skew-box transition-colors"
                                                >
                                                    Cancel Order
                                                </button>
                                                <button
                                                    onClick={() => handlePay(order.display_id || order.id)}
                                                    className="px-6 py-3 bg-accent text-black hover:bg-white hover:text-black font-black uppercase italic tracking-wider text-sm skew-box transition-colors"
                                                >
                                                    Pay Now //
                                                </button>
                                            </>
                                        )}

                                        {(order.status === 'cancelled' || order.status === 'delivered') && (
                                            <button
                                                onClick={() => handleReorder(order.display_id || order.id)}
                                                className="px-6 py-3 border border-white/20 text-white hover:border-accent hover:text-accent font-bold uppercase tracking-widest text-xs skew-box transition-colors"
                                            >
                                                Reorder Gear
                                            </button>
                                        )}
                                        <Link
                                            href={`/orders/${order.display_id || order.id}`}
                                            className="px-6 py-3 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white font-bold uppercase tracking-widest text-xs skew-box transition-colors text-center"
                                        >
                                            View Receipt
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {selectedProduct && selectedOrderForReview && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    product={selectedProduct}
                    orderId={selectedOrderForReview}
                    onSuccess={() => {
                        // Optional: Refresh orders or show toast
                        // For now just close
                    }}
                />
            )}
        </div>
    );
}
