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
    Save
} from "lucide-react";

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
            alert("Failed to update order status");
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
        <div className="flex flex-col space-y-8 pb-12 pt-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center text-gray-400 hover:text-[#0e4d80] transition-colors mb-4"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-istok text-xs font-bold uppercase tracking-[0.2em]">Back to Orders</span>
                    </button>

                    <div className="flex items-baseline gap-4 flex-wrap">
                        <h1 className="font-koulen text-5xl text-black uppercase tracking-tight">
                            Order #{order.display_id || order.id}
                        </h1>
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] border ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-6 mt-2 text-gray-500 font-istok text-xs uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(order.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5" />
                            Total: ฿{order.total_amount.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Primary Action Button (Update) is in the sidebar for context, but we could put global actions here */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Items & Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Order Items */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="font-koulen text-xl text-[#0e4d80] uppercase tracking-wide flex items-center gap-2">
                                <PackageIcon className="w-5 h-5 text-[#D2042D]" />
                                Order Items
                            </h2>
                            <span className="font-istok text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {order.items.length} Item(s)
                            </span>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <li key={item.id} className="p-6 flex items-start sm:items-center gap-4 hover:bg-gray-50/80 transition-colors">
                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white">
                                        <Image
                                            src={getImageUrl(item.product.images?.[0])}
                                            alt={item.product.name}
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-koulen text-lg text-black uppercase tracking-wide truncate pr-4">
                                                {item.product.name}
                                            </h3>
                                            <div className="text-right">
                                                {/* Use historical original_price if available, otherwise fallback to current product price for old orders */}
                                                {(item.original_price || item.product.price) > item.price ? (
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] bg-[#D2042D] text-white px-1.5 py-0.5 rounded-sm font-bold font-istok">
                                                                -{Math.round((((item.original_price || item.product.price) - item.price) / (item.original_price || item.product.price)) * 100)}%
                                                            </span>
                                                            <span className="font-istok text-xs text-gray-400 line-through decoration-red-500/50">
                                                                ฿{Number(item.original_price || item.product.price).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="font-bold font-istok text-sm text-[#D2042D]">
                                                            ฿{Number(item.price).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="font-bold font-istok text-sm text-black">
                                                        ฿{Number(item.price).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400 font-istok uppercase tracking-wider">
                                                    ID: {item.product.id}
                                                </p>
                                                {(item.color_name || item.size_name) && (
                                                    <div className="flex gap-2 mt-1">
                                                        {item.size_name && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-gray-100 text-[10px] font-bold font-istok text-gray-600 uppercase tracking-widest border border-gray-200">
                                                                Size: {item.size_name}
                                                            </span>
                                                        )}
                                                        {item.color_name && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-gray-100 text-[10px] font-bold font-istok text-gray-600 uppercase tracking-widest border border-gray-200">
                                                                Color: {item.color_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-bold font-istok text-gray-600">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="bg-gray-50 px-6 py-6 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm font-istok uppercase tracking-wider text-gray-500 mb-2">
                                <span>Subtotal</span>
                                <span>฿{order.total_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-istok uppercase tracking-wider text-gray-500 mb-4">
                                <span>Shipping</span>
                                <span>฿0.00</span>
                                {/* Assuming free shipping or handled elsewhere for now */}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <span className="font-koulen text-xl text-black">Total</span>
                                <span className="font-koulen text-3xl text-[#D2042D]">฿{order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar Management */}
                <div className="space-y-6">

                    {/* Management Card */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-8">
                        <h2 className="font-koulen text-lg text-black uppercase tracking-wide mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Save className="w-5 h-5 text-[#0e4d80]" />
                            Order Management
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0e4d80] mb-2">
                                    Order Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-md py-2.5 pl-3 pr-10 text-xs font-istok font-bold uppercase tracking-wide outline-none focus:ring-2 focus:ring-[#0e4d80]/20 focus:border-[#0e4d80] transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0e4d80] mb-2">
                                    Tracking Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter tracking ID..."
                                        className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-md py-2.5 pl-9 pr-3 text-xs font-istok font-medium outline-none focus:ring-2 focus:ring-[#0e4d80]/20 focus:border-[#0e4d80] transition-colors placeholder:text-gray-400"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Truck className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleStatusUpdate}
                                disabled={isUpdating || (status === order.status && trackingNumber === (order.tracking_number || ""))}
                                className="w-full py-3 bg-[#0e4d80] text-white rounded-md text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#0b3d66] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 mt-2"
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Update Order"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        <h2 className="font-koulen text-lg text-black uppercase tracking-wide mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <UserIcon className="w-5 h-5 text-[#D2042D]" />
                            Customer Profile
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-full shrink-0">
                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Full Name</p>
                                    <p className="font-koulen text-lg text-black leading-none tracking-wide">{order.full_name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-full shrink-0">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Delivery Address</p>
                                    <p className="font-istok text-sm text-gray-700 leading-relaxed font-medium">
                                        {order.shipping_address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-full shrink-0">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Contact</p>
                                    <p className="font-istok text-sm text-gray-700 font-bold">{order.phone_number}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
