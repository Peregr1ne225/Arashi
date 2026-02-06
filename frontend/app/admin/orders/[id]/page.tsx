"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { ordersApi } from "@/app/lib/api/orders";
import { Order } from "@/app/types/order";
import { getImageUrl } from "@/app/lib/utils/image";
import {
    ChevronLeft,
    Truck,
    User as UserIcon,
    MapPin,
    CreditCard,
    Package as PackageIcon,
    Calendar,
    Clock,
    Save,
} from "lucide-react";
import MessageModal from "@/app/components/ui/MessageModal";

// Unwrap params for server/client components
export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [status, setStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [orderId, setOrderId] = useState<string | null>(null);

    // Message Modal
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

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
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to load order.",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!order) return;
        setIsUpdating(true);
        try {
            await ordersApi.updateStatus(order.id, status);
            // If dragging number changed, update it too
            if (trackingNumber !== (order.tracking_number || "")) {
                const identifier = order.display_id || order.id;
                await ordersApi.updateTracking(identifier, trackingNumber);
            }
            fetchOrder(order.id.toString());
            // alert("Order updated successfully"); // Removed for cleaner UX
        } catch (error) {
            console.error("Failed to update status", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to update order status.",
                type: "error",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0e4d80]"></div>
            </div>
        );
    }

    if (!order) return null;

    const getStatusColor = (s: string) => {
        switch (s.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'processing': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col space-y-8 pb-12">
            {/* Header section - Hero Style */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-white rounded-[2.5rem] p-8 border border-blue-100 shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-full bg-blue-100/30 skew-x-[-20deg] translate-x-12 pointer-events-none" />

                <button
                    onClick={() => router.back()}
                    className="relative z-10 group flex items-center text-gray-400 hover:text-[#0e4d80] transition-colors mb-6"
                >
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-istok text-xs font-bold uppercase tracking-[0.2em]">Back to Orders</span>
                </button>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="px-4 py-1.5 rounded-full border border-blue-100 bg-white/80 backdrop-blur-sm shadow-sm inline-flex items-center gap-2 mb-4">
                            <span className="font-koulen text-[10px] text-[#0e4d80] uppercase tracking-[0.2em]">
                                Transaction Details
                            </span>
                        </div>
                        <div className="flex items-baseline gap-4 flex-wrap">
                            <h1 className="font-koulen text-5xl md:text-6xl tracking-tight text-[#0e4d80] leading-[0.9]">
                                Order <span className="text-gray-300">#{order.display_id || order.id}</span>
                            </h1>
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] border transform -translate-y-2 ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-6 mt-4 text-gray-500 font-istok text-xs uppercase tracking-wider font-bold">
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#0e4d80]/60" />
                                {formatDate(order.created_at)}
                            </span>
                            <span className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#0e4d80]/60" />
                                Total: <span className="text-[#0e4d80]">฿{order.total_amount.toLocaleString()}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Items & Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Order Items */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-blue-900/5 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 bg-[#0e4d80] flex items-center justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-full bg-white/10 skew-x-[-20deg] translate-x-8" />
                            <h2 className="font-koulen text-xl text-white uppercase tracking-wide flex items-center gap-2 relative z-10">
                                <PackageIcon className="w-5 h-5 text-white/70" />
                                Order Items
                            </h2>
                            <span className="font-istok text-[10px] font-bold text-white/80 uppercase tracking-widest relative z-10 bg-white/10 px-3 py-1 rounded-full">
                                {order.items.length} Item(s)
                            </span>
                        </div>
                        <ul className="divide-y divide-gray-50">
                            {order.items.map((item) => (
                                <li key={item.id} className="p-8 flex items-start sm:items-center gap-6 hover:bg-blue-50/20 transition-colors group">
                                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm group-hover:shadow-md transition-all">
                                        <Image
                                            src={getImageUrl(item.product.images?.[0])}
                                            alt={item.product.name}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-koulen text-xl text-[#0e4d80] uppercase tracking-wide truncate pr-4">
                                                {item.product.name}
                                            </h3>
                                            <div className="text-right">
                                                {/* Use historical original_price if available, otherwise fallback to current product price for old orders */}
                                                {(item.original_price || item.product.price) > item.price ? (
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] bg-[#D2042D] text-white px-2 py-0.5 rounded-full font-bold font-istok">
                                                                -{Math.round((((item.original_price || item.product.price) - item.price) / (item.original_price || item.product.price)) * 100)}%
                                                            </span>
                                                            <span className="font-istok text-xs text-gray-400 line-through decoration-red-500/50">
                                                                ฿{Number(item.original_price || item.product.price).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="font-bold font-istok text-lg text-[#D2042D]">
                                                            ฿{Number(item.price).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="font-bold font-istok text-lg text-black">
                                                        ฿{Number(item.price).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] text-gray-400 font-istok uppercase tracking-widest font-bold">
                                                    SKU: {item.product.id}
                                                </p>
                                                {(item.color_name || item.size_name) && (
                                                    <div className="flex gap-2">
                                                        {item.size_name && (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-[10px] font-bold font-istok text-gray-600 uppercase tracking-widest border border-gray-100">
                                                                Size: {item.size_name}
                                                            </span>
                                                        )}
                                                        {item.color_name && (
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-[10px] font-bold font-istok text-gray-600 uppercase tracking-widest border border-gray-100">
                                                                Color: {item.color_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-[#0e4d80] text-xs font-bold font-istok border border-blue-100">
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="bg-gray-50/50 px-8 py-8 border-t border-gray-100">
                            <div className="flex justify-between items-center text-xs font-istok uppercase tracking-[0.15em] text-gray-400 mb-3">
                                <span>Subtotal</span>
                                <span className="font-bold text-gray-600">฿{order.total_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-istok uppercase tracking-[0.15em] text-gray-400 mb-6">
                                <span>Shipping</span>
                                <span className="font-bold text-gray-600">฿0.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200/60">
                                <span className="font-koulen text-2xl text-black tracking-tight">Total Amount</span>
                                <span className="font-koulen text-4xl text-[#0e4d80]">฿{order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar Management */}
                <div className="space-y-6">

                    {/* Management Card */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-8">
                        <h2 className="font-koulen text-2xl text-[#0e4d80] uppercase tracking-wide mb-8 flex items-center gap-2 border-b border-gray-50 pb-4">
                            <Save className="w-5 h-5 text-[#0e4d80]/40" />
                            Management
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0e4d80] mb-3 ml-1">
                                    Order Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-gray-50/50 text-gray-800 border border-gray-100 rounded-2xl py-4 pl-5 pr-12 text-xs font-istok font-bold uppercase tracking-wide outline-none focus:ring-4 focus:ring-[#0e4d80]/10 focus:border-[#0e4d80] transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none p-1 bg-white rounded-full border border-gray-100 shadow-sm">
                                        <Clock className="w-3.5 h-3.5 text-[#0e4d80]" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0e4d80] mb-3 ml-1">
                                    Tracking Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter tracking ID..."
                                        className="w-full bg-gray-50/50 text-gray-800 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-xs font-istok font-bold outline-none focus:ring-4 focus:ring-[#0e4d80]/10 focus:border-[#0e4d80] transition-all placeholder:text-gray-300"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleStatusUpdate}
                                disabled={isUpdating || (status === order.status && trackingNumber === (order.tracking_number || ""))}
                                className="w-full py-4 bg-[#0e4d80] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#0b3d66] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        SAVING...
                                    </>
                                ) : (
                                    "UPDATE ORDER"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-8">
                        <h2 className="font-koulen text-2xl text-[#0e4d80] uppercase tracking-wide mb-8 flex items-center gap-2 border-b border-gray-50 pb-4">
                            <UserIcon className="w-5 h-5 text-[#0e4d80]/40" />
                            Customer
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-blue-50/50 rounded-2xl shrink-0 border border-blue-50 group-hover:border-blue-100 transition-colors">
                                    <UserIcon className="w-5 h-5 text-[#0e4d80]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Full Name</p>
                                    <p className="font-koulen text-lg text-black leading-none tracking-wide">{order.full_name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-blue-50/50 rounded-2xl shrink-0 border border-blue-50 group-hover:border-blue-100 transition-colors">
                                    <MapPin className="w-5 h-5 text-[#0e4d80]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Delivery Address</p>
                                    <p className="font-istok text-sm text-gray-700 leading-relaxed font-bold">
                                        {order.shipping_address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="p-3 bg-blue-50/50 rounded-2xl shrink-0 border border-blue-50 group-hover:border-blue-100 transition-colors">
                                    <CreditCard className="w-5 h-5 text-[#0e4d80]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Contact</p>
                                    <p className="font-istok text-sm text-gray-700 font-bold">{order.phone_number}</p>
                                </div>
                            </div>
                        </div>
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
