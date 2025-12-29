"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ordersApi, Order, OrderItem } from "@/app/lib/api/orders";
import { useAuth } from "@/app/hooks/useAuth";

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Function to get image URL
    const getImageUrl = (url: string | null) => {
        if (!url) return "/placeholder-product.svg";

        // Fix for Docker environment: replace internal hostname with localhost
        if (url.includes("http://backend:8000")) {
            return url.replace("http://backend:8000", "http://localhost:8000");
        }

        if (url.startsWith("http")) return url;

        // If it's a relative path from Django, prepend the backend URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        return `${baseUrl}${url}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "processing": return "bg-blue-100 text-blue-800";
            case "shipped": return "bg-purple-100 text-purple-800";
            case "delivered": return "bg-green-100 text-green-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 opacity-50">Order Not Found</h1>
                    <p className="text-red-500 mb-4">{error}</p>
                    <Link href="/account?tab=orders" className="text-blue-600 hover:underline">
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-6">
                    <Link href="/account?tab=orders" className="text-gray-500 hover:text-gray-900 flex items-center gap-2">
                        ← Back to Orders
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order #{order.display_id || order.id}</h1>
                            <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Items Column */}
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item) => (
                                    <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                                        <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                            <Image
                                                src={getImageUrl(item.product.image || item.product.image_url)}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                                            <p className="text-sm text-gray-500">{item.product.description}</p>
                                            <div className="mt-1 flex justify-between items-center">
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                <p className="font-medium text-gray-900">฿{Number(item.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span>฿{Number(order.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-4">Shipping Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-500 block">Name</span>
                                        <span className="text-gray-900 font-medium">{order.full_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">Phone</span>
                                        <span className="text-gray-900 font-medium">{order.phone_number}</span>
                                    </div>
                                    {order.tracking_number && (
                                        <div>
                                            <span className="text-gray-500 block">Tracking Number</span>
                                            <span className="text-gray-900 font-medium text-blue-600">
                                                {order.tracking_number}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500 block">Address</span>
                                        <span className="text-gray-900 font-medium text-pretty">{order.shipping_address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                {order.status === "pending" && (
                                    <button
                                        onClick={async () => {
                                            if (confirm("Are you sure you want to cancel this order?")) {
                                                try {
                                                    setLoading(true);
                                                    await ordersApi.cancelOrder(order.display_id || order.id);
                                                    // Refresh
                                                    const updated = await ordersApi.getOrder(order.display_id || order.id);
                                                    setOrder(updated);
                                                } catch (e) {
                                                    alert("Failed to cancel");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                        className="w-full py-3 px-4 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
                                    >
                                        Cancel Order
                                    </button>
                                )}

                                {(order.status === "cancelled" || order.status === "delivered") && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                await ordersApi.reorder(order.display_id || order.id);
                                                router.push("/cart");
                                            } catch (err: any) {
                                                alert(err.message || "Failed to reorder");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                                    >
                                        Reorder Items
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
