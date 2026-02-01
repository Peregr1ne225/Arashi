"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { ordersApi } from "@/app/lib/api/orders";
import { Order } from "@/app/types/order";
import { Package, ChevronDown, ChevronUp, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ReviewProduct } from "@/app/types/review";
import { getImageUrl } from "@/app/lib/utils/image";

const ReviewModal = dynamic(() => import("@/app/components/product/ReviewModal"), {
    ssr: false,
});
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";

export default function AccountOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ReviewProduct | null>(
        null,
    );
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<
        number | null
    >(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<string | number | null>(
        null,
    );

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
            case "delivered":
                return "bg-green-50 text-green-700 border border-green-100";
            case "shipped":
                return "bg-blue-50 text-blue-700 border border-blue-100";
            case "processing":
                return "bg-indigo-50 text-indigo-700 border border-indigo-100";
            case "cancelled":
                return "bg-red-50 text-[#D2042D] border border-red-100";
            case "pending":
                return "bg-amber-50 text-amber-700 border border-amber-100";
            default:
                return "bg-gray-50 text-gray-600 border border-gray-100";
        }
    };

    const handleRateProduct = (
        product: ReviewProduct,
        orderId: number,
        e: React.MouseEvent,
    ) => {
        e.stopPropagation();
        setSelectedProduct(product);
        setSelectedOrderForReview(orderId);
        setReviewModalOpen(true);
    };

    const handleCancelOrder = (orderId: string | number) => {
        setOrderToCancel(orderId);
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!orderToCancel) return;

        try {
            setLoading(true);
            await ordersApi.cancelOrder(orderToCancel);
            await fetchOrders();
            setCancelModalOpen(false);
            setOrderToCancel(null);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to cancel order";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const handleReorder = async (orderId: string | number) => {
        try {
            setLoading(true);
            await ordersApi.reorder(orderId);
            router.push("/cart");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to reorder";
            alert(message);
            setLoading(false);
        }
    };

    const handlePay = async (orderId: string | number) => {
        try {
            setLoading(true);
            const { checkout_url } = await ordersApi.payOrder(orderId);
            window.location.href = checkout_url;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to initiate payment";
            alert(message);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20 font-istok uppercase tracking-[0.2em] text-gray-400 font-bold">
                Loading orders...
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fadeIn">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="font-koulen text-2xl text-[#0e4d80] mb-2 leading-none">
                    No orders yet
                </h3>
                <p className="font-istok text-sm text-gray-400 uppercase tracking-widest mb-8 font-bold">
                    Start shopping to see your orders here
                </p>
                <Link
                    href="/"
                    className="inline-flex h-12 items-center justify-center px-8 rounded-full bg-[#0e4d80] text-white font-istok text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#0b3d66] hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-gray-100 pb-4">
                <h3 className="font-koulen text-3xl text-[#0e4d80] leading-none">
                    Order History
                </h3>
            </div>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                    >
                        <div
                            className="px-8 py-6 flex flex-col md:flex-row justify-between items-center cursor-pointer bg-white group-hover:bg-gray-50/50 transition-colors"
                            onClick={() => toggleOrder(order.id)}
                        >
                            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                                <span className="font-istok font-bold uppercase tracking-[0.15em] text-lg text-gray-900">
                                    Order #{order.display_id || order.id}
                                </span>
                                <span
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}
                                >
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mt-4 md:mt-0">
                                <span className="font-istok text-gray-400 text-sm font-bold tracking-widest">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                                <span className="font-istok font-bold text-lg text-[#0e4d80]">
                                    ฿{Number(order.total_amount).toFixed(2)}
                                </span>
                                {expandedOrderId === order.id ? (
                                    <ChevronUp className="w-5 h-5 text-[#0e4d80]" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-300 group-hover:text-[#0e4d80]" />
                                )}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedOrderId === order.id && (
                            <div className="px-8 py-8 bg-gray-50/50 border-t border-gray-100">
                                <div className="flow-root mb-8">
                                    <ul className="-my-6 divide-y divide-gray-100">
                                        {order.items.map((item) => (
                                            <li key={item.id} className="py-6 flex">
                                                <div className="shrink-0 w-20 h-20 border border-gray-100 rounded-2xl overflow-hidden relative bg-white shadow-sm">
                                                    <Image
                                                        src={getImageUrl(
                                                            (item.product.images && item.product.images[0]) ||
                                                            "/placeholder-product.svg",
                                                        )}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="ml-6 flex-1 flex flex-col justify-center">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-istok font-bold uppercase tracking-widest text-sm md:text-base text-gray-900">
                                                                {item.product.name}
                                                            </h3>
                                                            {item.color_name && item.size_name && (
                                                                <div className="font-istok text-gray-400 text-xs font-bold uppercase tracking-wider space-y-0.5 mt-1">
                                                                    <p>Color: {item.color_name}</p>
                                                                    <p>Size: {item.size_name}</p>
                                                                </div>
                                                            )}
                                                            <p className="font-istok text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">
                                                                Qty: {item.quantity}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            {(item.original_price || item.product.price) >
                                                                item.price ? (
                                                                <div className="flex flex-col items-end">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] bg-[#D2042D] text-white px-1.5 py-0.5 rounded-sm font-bold font-istok">
                                                                            -
                                                                            {Math.round(
                                                                                (((item.original_price ||
                                                                                    item.product.price) -
                                                                                    item.price) /
                                                                                    (item.original_price ||
                                                                                        item.product.price)) *
                                                                                100,
                                                                            )}
                                                                            %
                                                                        </span>
                                                                        <span className="font-istok text-xs text-gray-300 line-through font-bold">
                                                                            ฿
                                                                            {Number(
                                                                                item.original_price ||
                                                                                item.product.price,
                                                                            ).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="font-istok font-bold text-[#D2042D]">
                                                                        ฿{Number(item.price).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="font-istok font-bold text-gray-900">
                                                                    ฿{Number(item.price).toFixed(2)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex justify-end">
                                                        {(order.status === "shipped" ||
                                                            order.status === "delivered") &&
                                                            (item.is_rated ? (
                                                                <span className="text-gray-300 font-istok uppercase tracking-wider text-xs font-bold flex items-center">
                                                                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                                                                    Rated
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) =>
                                                                        handleRateProduct(item.product, order.id, e)
                                                                    }
                                                                    className="text-[#0e4d80] hover:text-[#0b3d66] font-istok uppercase tracking-wider font-bold text-xs flex items-center border-b-2 border-transparent hover:border-[#0e4d80] pb-0.5 transition-all cursor-pointer"
                                                                >
                                                                    <Star className="w-4 h-4 mr-1" />
                                                                    Rate Product
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-gray-200/50">
                                    <div className="text-xs font-istok font-bold uppercase tracking-wider text-gray-500 space-y-2">
                                        <p>
                                            <strong className="text-gray-900">
                                                Shipping:
                                            </strong>{" "}
                                            <span className="text-gray-400">{order.shipping_address}</span>
                                        </p>
                                        <p>
                                            <strong className="text-gray-900">Phone:</strong>{" "}
                                            <span className="text-gray-400">{order.phone_number}</span>
                                        </p>
                                        {order.tracking_number && (
                                            <p>
                                                <strong className="text-gray-900">
                                                    Tracking:
                                                </strong>{" "}
                                                <span className="text-[#0e4d80]">{order.tracking_number}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        {order.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleCancelOrder(order.display_id || order.id)
                                                    }
                                                    className="flex-1 md:flex-none px-6 h-10 border border-red-100 text-[#D2042D] rounded-full hover:bg-red-50 font-istok uppercase tracking-[0.15em] font-bold text-xs transition-colors cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handlePay(order.display_id || order.id)
                                                    }
                                                    className="flex-1 md:flex-none px-6 h-10 bg-[#0e4d80] text-white rounded-full hover:bg-[#0b3d66] font-istok uppercase tracking-[0.15em] font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20"
                                                >
                                                    Pay Now
                                                </button>
                                            </>
                                        )}
                                        {(order.status === "cancelled" ||
                                            order.status === "delivered") && (
                                                <button
                                                    onClick={() =>
                                                        handleReorder(order.display_id || order.id)
                                                    }
                                                    className="flex-1 md:flex-none px-6 h-10 bg-[#0e4d80] text-white rounded-full hover:bg-[#0b3d66] font-istok uppercase tracking-[0.15em] font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20"
                                                >
                                                    Reorder
                                                </button>
                                            )}
                                        <Link
                                            href={`/orders/${order.display_id || order.id}`}
                                            className="flex-1 md:flex-none px-6 h-10 border border-gray-200 text-gray-500 rounded-full hover:border-[#0e4d80] hover:text-[#0e4d80] font-istok uppercase tracking-[0.15em] font-bold text-xs text-center transition-colors bg-white cursor-pointer flex items-center justify-center"
                                        >
                                            Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {selectedProduct && selectedOrderForReview && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    product={selectedProduct}
                    orderId={selectedOrderForReview}
                    onSuccess={() => { }}
                />
            )}

            <ConfirmationModal
                isOpen={cancelModalOpen}
                title="Cancel Order"
                message="Are you sure you want to cancel this order? This action cannot be undone."
                confirmText="Yes, Cancel Order"
                cancelText="No, Keep Order"
                onConfirm={handleConfirmCancel}
                onCancel={() => setCancelModalOpen(false)}
                isLoading={loading}
            />
        </div>
    );
}
