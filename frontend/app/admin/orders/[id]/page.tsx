"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { ordersApi, Order } from "@/app/lib/api/orders";
import { getImageUrl } from "@/app/lib/utils/image";

// Unwrap params for server/client components
export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [status, setStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [orderId, setOrderId] = useState<string | null>(null); // Use string for display_id

    useEffect(() => {
        // Unwrap params
        params.then((p) => setOrderId(p.id));
    }, [params]);

    useEffect(() => {
        if (!loading && orderId) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            fetchOrder(orderId);
        }
    }, [isAuthenticated, loading, user, router, orderId]);

    const fetchOrder = async (id: string) => {
        try {
            const data = await ordersApi.getOrder(id, { mode: "admin" });
            setOrder(data);
            setStatus(data.status);
            setTrackingNumber(data.tracking_number || "");
        } catch (error) {
            console.error("Failed to fetch order", error);
            alert("Failed to load order");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!order) return;
        setIsUpdating(true);
        try {
            const updatedOrder = await ordersApi.updateStatus(order.id, status);
            setOrder(updatedOrder);
            alert("Order status updated successfully");
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update order status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleTrackingUpdate = async () => {
        if (!order) return;
        setIsUpdating(true);
        try {
            const updatedOrder = await ordersApi.updateTracking(order.id, trackingNumber); // Use internal ID for update? IDK, API uses lookup from viewset which supports both. Safest to use ID if we have it, but display_id works too. Let's use display_id if available to match viewset. Actually viewset lookup works for both.
            // Wait, updateTracking uses `orders/{id}/tracking/`. If lookup_field is display_id, URL should use display_id. 
            // The API function accepts id or string. Let's pass order.display_id || order.id
            const identifier = order.display_id || order.id;
            const res = await ordersApi.updateTracking(identifier, trackingNumber);
            setOrder(res);
            alert("Tracking number updated successfully");
        } catch (error) {
            console.error("Failed to update tracking", error);
            alert("Failed to update tracking number");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <main className="container mx-auto px-4 py-8 flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Order <span className="text-accent">#{order.display_id || order.id}</span></h1>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Manage Order Fulfillment & Details</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors skew-box font-bold uppercase tracking-wider text-xs flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="m15 18-6-6 6-6" /></svg>
                    Back to Orders
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Order Items */}
                    <div className="bg-neutral-900 border border-white/10 skew-box shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-white/10 bg-black/20">
                            <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">Order Manifest</h2>
                        </div>
                        <ul className="divide-y divide-white/10">
                            {order.items.map((item) => (
                                <li key={item.id} className="p-8 flex items-center hover:bg-white/5 transition-colors group">
                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden border border-white/20 skew-box-sm">
                                        <Image
                                            src={getImageUrl(item.product.image_url)}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="ml-6 flex-1 flex flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-bold text-white uppercase tracking-wide">
                                                <h3>{item.product.name}</h3>
                                                <p className="ml-4 font-mono text-accent">฿{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-end justify-between text-sm mt-2">
                                            <p className="text-gray-400 font-mono">QTY: <span className="text-white font-bold">{item.quantity}</span></p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="px-8 py-6 border-t border-white/10 bg-black/40">
                            <div className="flex justify-between items-center">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total Amount</p>
                                <p className="text-2xl font-black italic tracking-tighter text-accent">฿{order.total_amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Status Management */}
                    <div className="bg-neutral-900 border border-white/10 skew-box shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6">
                        <h2 className="text-sm font-black uppercase italic tracking-widest text-white mb-6 border-b border-white/10 pb-2">Status Control</h2>
                        <div className="space-y-4">
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none appearance-none transition-all custom-select text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-accent">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={isUpdating || status === order.status}
                                className="w-full px-4 py-3 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.4)] text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? "UPDATING..." : "UPDATE STATUS"}
                            </button>
                        </div>
                    </div>

                    {/* Tracking Number Management */}
                    <div className="bg-neutral-900 border border-white/10 skew-box shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6">
                        <h2 className="text-sm font-black uppercase italic tracking-widest text-white mb-6 border-b border-white/10 pb-2">Tracking Info</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="ENTER TRACKING ID"
                                className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none transition-all placeholder-gray-700 text-sm"
                            />
                            <button
                                onClick={handleTrackingUpdate}
                                disabled={isUpdating || trackingNumber === (order.tracking_number || "")}
                                className="w-full px-4 py-3 bg-transparent border border-white/20 text-white font-black uppercase italic tracking-widest hover:bg-white/5 hover:border-accent hover:text-accent transition-all skew-box text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? "UPDATING..." : "UPDATE TRACKING"}
                            </button>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-neutral-900 border border-white/10 skew-box shadow-[0_0_20px_rgba(0,0,0,0.3)] p-6">
                        <h2 className="text-sm font-black uppercase italic tracking-widest text-white mb-6 border-b border-white/10 pb-2">Customer Profile</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</dt>
                                <dd className="text-sm text-white font-bold tracking-wide">{order.full_name}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Phone</dt>
                                <dd className="text-sm text-white font-mono">{order.phone_number}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Shipping Address</dt>
                                <dd className="text-sm text-white font-medium leading-relaxed opacity-80">{order.shipping_address}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </main>
    );
}
