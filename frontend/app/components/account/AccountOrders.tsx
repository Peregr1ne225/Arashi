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
        return <div className="text-center py-10 text-gray-500">Loading orders...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-10 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                <p className="mt-1 text-gray-500 mb-6">Start shopping to see your orders here.</p>
                <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Order History</h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {orders.map((order) => (
                    <li key={order.id} className="bg-white">
                        <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => toggleOrder(order.id)}>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-blue-600 truncate">
                                    Order #{order.display_id || order.id}
                                </p>
                                <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                        <span className="truncate">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </p>
                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                        Items: {order.items.length}
                                    </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <div className="flex items-center">
                                        <p className="font-medium text-gray-900 mr-4">฿{Number(order.total_amount).toFixed(2)}</p>

                                        {/* Action Buttons for Compact View (Optional, but let's put them in expanded for clarity) */}
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handlePay(order.display_id || order.id); }}
                                                className="mr-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 sm:hidden"
                                            >
                                                Pay Now
                                            </button>
                                        )}

                                        {expandedOrderId === order.id ? <ChevronUp className="ml-2 h-5 w-5" /> : <ChevronDown className="ml-2 h-5 w-5" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedOrderId === order.id && (
                            <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-100">
                                <div className="flow-root">
                                    <ul className="-my-4 divide-y divide-gray-200">
                                        {order.items.map((item) => (
                                            <li key={item.id} className="py-4 flex">
                                                <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden relative">
                                                    {/* Using a placeholder if image is missing, assumes item.product structure */}
                                                    <Image
                                                        src={item.product.image || item.product.image_url || "/placeholder-product.svg"}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="ml-4 flex-1 flex flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                                            <h3>{item.product.name}</h3>
                                                            <p className="ml-4">฿{Number(item.price).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex items-end justify-between text-sm">
                                                        <p className="text-gray-500">Qty {item.quantity}</p>

                                                        {/* Rate Product Button */}
                                                        {(order.status === 'shipped' || order.status === 'delivered') && (
                                                            item.is_rated ? (
                                                                <span className="text-gray-400 font-medium flex items-center text-xs sm:text-sm">
                                                                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                                                                    Rated
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => handleRateProduct(item.product, order.id, e)}
                                                                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-xs sm:text-sm"
                                                                >
                                                                    <Star className="w-4 h-4 mr-1" />
                                                                    Rate Product
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-6 border-t border-gray-200 pt-4">
                                    <div className="text-sm text-gray-500 mb-4">
                                        <p><strong>Shipping Address:</strong> {order.shipping_address}</p>
                                        <p><strong>Phone:</strong> {order.phone_number}</p>
                                        {order.tracking_number && (
                                            <p className="mt-1">
                                                <strong>Tracking Number:</strong> <span className="text-blue-600 font-medium">{order.tracking_number}</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons Footer */}
                                    <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4 pt-4 border-t border-gray-200">
                                        {order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleCancelOrder(order.display_id || order.id)}
                                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 text-sm font-medium"
                                                >
                                                    Cancel Order
                                                </button>
                                                <button
                                                    onClick={() => handlePay(order.display_id || order.id)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                                >
                                                    Pay Now
                                                </button>
                                            </>
                                        )}

                                        {(order.status === 'cancelled' || order.status === 'delivered') && (
                                            <button
                                                onClick={() => handleReorder(order.display_id || order.id)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                            >
                                                Reorder Items
                                            </button>
                                        )}
                                        <Link
                                            href={`/orders/${order.display_id || order.id}`}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium text-center"
                                        >
                                            View Details
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
