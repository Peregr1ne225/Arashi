"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { ordersApi } from "@/app/lib/api/orders";
import { Order } from "@/app/types/order";
import { Package, ChevronDown, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ReviewProduct } from "@/app/types/review";
import { getImageUrl } from "@/app/lib/utils/image";

const ReviewModal = dynamic(() => import("@/app/components/product/ReviewModal"), {
    ssr: false,
});
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import MessageModal from "@/app/components/ui/MessageModal";

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

    // Message Modal
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

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
                return "bg-blue-50 text-[#0e4d80] border border-blue-100";
            case "processing":
                return "bg-indigo-50 text-indigo-700 border border-indigo-100";
            case "cancelled":
                return "bg-gray-100 text-gray-500 border border-gray-200";
            case "pending":
                return "bg-amber-50 text-amber-700 border border-amber-100";
            default:
                return "bg-gray-50 text-gray-400 border border-gray-100";
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
    };

    const handleReorder = async (orderId: string | number) => {
        try {
            setLoading(true);
            await ordersApi.reorder(orderId);
            router.push("/cart");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to reorder";
            setMessageModal({
                isOpen: true,
                title: "Reorder Failed",
                message,
                type: "error",
            });
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
            setMessageModal({
                isOpen: true,
                title: "Payment Error",
                message,
                type: "error",
            });
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-gray-100 border-t-[#0e4d80] rounded-full animate-spin"></div>
                <p className="font-koulen text-lg uppercase tracking-widest text-gray-300">Loading orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-blue-900/5 animate-in fade-in duration-700">
                <div className="bg-blue-50/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Package className="h-10 w-10 text-[#0e4d80]/40" />
                </div>
                <h3 className="font-koulen text-[40px] text-[#0e4d80] mb-4 uppercase tracking-tighter leading-none">
                    No orders <span className="text-gray-200">yet.</span>
                </h3>
                <p className="font-body text-xs text-gray-400 uppercase tracking-widest mb-10 font-bold">
                    Start shopping to see your orders here
                </p>
                <Link
                    href="/"
                    className="inline-flex h-14 items-center justify-center px-12 rounded-full bg-[#0e4d80] text-white font-koulen text-lg uppercase tracking-widest hover:bg-[#0b3d66] hover:shadow-2xl hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 slide-in-from-bottom-4">
            <div className="border-b border-gray-100 pb-6 mb-8 mt-4">
                <h3 className="font-koulen text-[40px] text-[#0e4d80] leading-[0.85] uppercase tracking-tighter">
                    Order <span className="text-gray-300">History.</span>
                </h3>
            </div>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 group"
                    >
                        <div
                            className="px-10 py-8 flex flex-col md:flex-row justify-between items-center cursor-pointer bg-white group-hover:bg-gray-50/30 transition-all duration-300"
                            onClick={() => toggleOrder(order.id)}
                        >
                            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                <span className="font-koulen text-2xl tracking-widest text-[#0e4d80]">
                                    ORDER #{order.display_id || order.id}
                                </span>
                                <span
                                    className={`px-6 py-2 rounded-full text-[10px] font-koulen uppercase tracking-[0.2em] shadow-sm border ${getStatusColor(order.status)}`}
                                >
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 mt-6 md:mt-0">
                                <span className="font-body text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="font-koulen text-2xl text-[#0e4d80]">
                                    ฿{Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${expandedOrderId === order.id ? "bg-[#0e4d80] text-white rotate-180 shadow-lg shadow-blue-900/20" : "bg-gray-50 text-gray-300 group-hover:bg-blue-50 group-hover:text-[#0e4d80]"}`}>
                                    <ChevronDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedOrderId === order.id && (
                            <div className="px-10 py-10 bg-gray-50/20 border-t border-gray-100 animate-in slide-in-from-top-4 duration-500">
                                <div className="flow-root mb-10">
                                    <ul className="-my-8 divide-y divide-gray-100">
                                        {order.items.map((item) => (
                                            <li key={item.id} className="py-8 flex items-center">
                                                <div className="shrink-0 w-24 h-24 border border-gray-100 rounded-[2rem] overflow-hidden relative bg-white shadow-sm ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all">
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
                                                <div className="ml-8 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-koulen text-xl tracking-wide text-[#0e4d80] uppercase">
                                                                {item.product.name}
                                                            </h3>
                                                            {item.color_name && item.size_name && (
                                                                <div className="font-body text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-3">
                                                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.color_name}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.size_name}</span>
                                                                </div>
                                                            )}
                                                            <p className="font-body text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                                                                Quantity: {item.quantity}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            {(item.original_price || item.product.price) >
                                                                item.price ? (
                                                                <div className="flex flex-col items-end">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-[10px] bg-[#0e4d80] text-white px-2 py-0.5 rounded-full font-koulen tracking-widest">
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
                                                                        <span className="font-body text-xs text-gray-200 line-through font-bold">
                                                                            ฿
                                                                            {Number(
                                                                                item.original_price ||
                                                                                item.product.price,
                                                                            ).toFixed(2)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="font-koulen text-xl text-[#0e4d80] mt-1">
                                                                        ฿{Number(item.price).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="font-koulen text-xl text-gray-900">
                                                                    ฿{Number(item.price).toFixed(2)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex justify-end">
                                                        {(order.status === "shipped" ||
                                                            order.status === "delivered") &&
                                                            (item.is_rated ? (
                                                                <span className="text-gray-300 font-koulen uppercase tracking-widest text-[11px] flex items-center bg-gray-50 px-4 py-1.5 rounded-full">
                                                                    <Star className="w-3.5 h-3.5 mr-2 text-yellow-400 fill-current" />
                                                                    Rated
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) =>
                                                                        handleRateProduct(item.product, order.id, e)
                                                                    }
                                                                    className="text-[#0e4d80] hover:text-[#0b3d66] font-koulen uppercase tracking-widest text-xs flex items-center bg-blue-50 px-6 py-2 rounded-full hover:bg-blue-100 transition-all duration-300"
                                                                >
                                                                    <Star className="w-3.5 h-3.5 mr-2" />
                                                                    Rate Product
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pt-8 border-t border-gray-100">
                                    <div className="font-koulen text-[11px] uppercase tracking-widest text-gray-400 space-y-3">
                                        <p className="flex items-center gap-4">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[9px] font-bold">DESTINATION</span>
                                            <span className="text-gray-500 font-body text-xs font-bold">{order.shipping_address}</span>
                                        </p>
                                        <p className="flex items-center gap-4">
                                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[9px] font-bold">CONTACT</span>
                                            <span className="text-gray-500 font-body text-xs font-bold">{order.phone_number}</span>
                                        </p>
                                        {order.tracking_number && (
                                            <p className="flex items-center gap-4">
                                                <span className="bg-[#0e4d80]/10 text-[#0e4d80] px-3 py-1 rounded-full text-[9px] font-bold">TRACKING</span>
                                                <span className="text-[#0e4d80] font-body text-xs font-bold">{order.tracking_number}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-4 w-full md:w-auto">
                                        {order.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleCancelOrder(order.display_id || order.id)
                                                    }
                                                    className="flex-1 md:flex-none px-8 h-12 border-2 border-gray-100 text-gray-400 rounded-full hover:bg-gray-50 hover:text-gray-600 font-koulen uppercase tracking-widest text-sm transition-all duration-300"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handlePay(order.display_id || order.id)
                                                    }
                                                    className="flex-1 md:flex-none px-10 h-12 bg-[#0e4d80] text-white rounded-full hover:bg-[#0b3d66] font-koulen uppercase tracking-widest text-sm transition-all duration-300 shadow-lg shadow-blue-900/10 hover:shadow-blue-900/30 hover:-translate-y-0.5"
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
                                                    className="flex-1 md:flex-none px-10 h-12 bg-[#0e4d80] text-white rounded-full hover:bg-[#0b3d66] font-koulen uppercase tracking-widest text-sm transition-all duration-300 shadow-lg shadow-blue-900/10 hover:shadow-blue-900/30 hover:-translate-y-0.5"
                                                >
                                                    Reorder
                                                </button>
                                            )}
                                        <Link
                                            href={`/orders/${order.display_id || order.id}`}
                                            className="flex-1 md:flex-none px-8 h-12 border-2 border-gray-100 text-gray-400 rounded-full hover:border-[#0e4d80] hover:text-[#0e4d80] font-koulen uppercase tracking-widest text-sm text-center transition-all bg-white flex items-center justify-center hover:bg-blue-50/30"
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
