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
            <div className="flex items-center justify-between mb-6 pt-6">
                <h1 className="text-2xl font-bold">Order #{order.display_id || order.id}</h1>
                <button
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-900"
                >
                    &larr; Back to Orders
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <li key={item.id} className="p-6 flex items-center">
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <Image
                                            src={getImageUrl(item.product.image_url)}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover object-center"
                                        />
                                    </div>
                                    <div className="ml-4 flex-1 flex flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3>{item.product.name}</h3>
                                                <p className="ml-4">฿{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-end justify-between text-sm">
                                            <p className="text-gray-500">Qty {item.quantity}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex justify-between text-base font-medium text-gray-900">
                                <p>Total Amount</p>
                                <p>฿{order.total_amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Management */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status</h2>
                        <div className="space-y-4">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={isUpdating || status === order.status}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                            >
                                {isUpdating ? "Updating..." : "Update Status"}
                            </button>
                        </div>
                    </div>

                    {/* Tracking Number Management */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Tracking Number</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="Enter tracking number"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            />
                            <button
                                onClick={handleTrackingUpdate}
                                disabled={isUpdating || trackingNumber === (order.tracking_number || "")}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                            >
                                {isUpdating ? "Updating..." : "Update Tracking"}
                            </button>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h2>
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                <dd className="text-sm text-gray-900">{order.full_name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                <dd className="text-sm text-gray-900">{order.phone_number}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                                <dd className="text-sm text-gray-900">{order.shipping_address}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </main>
    );
}
