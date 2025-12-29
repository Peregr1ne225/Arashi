"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { ordersApi, Order } from "@/app/lib/api/orders";

export default function AdminOrdersPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [newTrackingNumber, setNewTrackingNumber] = useState("");
    const [editingStatusOrder, setEditingStatusOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            fetchOrders();
        }
    }, [isAuthenticated, loading, user, router]);

    const fetchOrders = async () => {
        try {
            const response = await ordersApi.getOrders({ mode: "admin" });
            setOrders(response.results);
        } catch (error) {
            console.error("Failed to fetch orders", error);
            alert("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (order: Order) => {
        setEditingOrder(order);
        setNewTrackingNumber(order.tracking_number || "");
    };

    const handleEditStatusClick = (order: Order) => {
        setEditingStatusOrder(order);
        setNewStatus(order.status);
    };

    const handleCloseModal = () => {
        setEditingOrder(null);
        setNewTrackingNumber("");
        setEditingStatusOrder(null);
        setNewStatus("");
    };

    const handleSaveTracking = async () => {
        if (!editingOrder) return;
        setIsSaving(true);
        try {
            const updatedOrder = await ordersApi.updateTracking(
                editingOrder.display_id || editingOrder.id,
                newTrackingNumber
            );

            // Update local state
            setOrders(orders.map(o =>
                (o.id === updatedOrder.id) ? updatedOrder : o
            ));

            handleCloseModal();
        } catch (error) {
            console.error("Failed to update tracking", error);
            alert("Failed to update tracking number");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveStatus = async () => {
        if (!editingStatusOrder) return;
        setIsSaving(true);
        try {
            const updatedOrder = await ordersApi.updateStatus(
                editingStatusOrder.id, // updateStatus likely uses ID, let's verify if it supports display_id if we want consistency, but ID matches current usage in detail page
                newStatus
            );

            // Update local state
            setOrders(orders.map(o =>
                (o.id === updatedOrder.id) ? updatedOrder : o
            ));

            handleCloseModal();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "processing":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "delivered":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8 flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Order Operations</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Manage Logistics & Tracking</p>
                </div>
            </div>

            <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-black/40">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Order ID</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Customer</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Date</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Total</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Status</th>
                                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Tracking</th>
                                <th scope="col" className="px-6 py-4 text-right text-[10px] font-black uppercase italic tracking-widest text-accent">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-white/5">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold uppercase tracking-wide text-white">
                                        <span className="font-mono text-accent">#</span>{order.display_id || order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <div className="font-bold uppercase tracking-wide text-white group-hover:text-accent transition-colors">{order.full_name}</div>
                                        <div className="text-[10px] font-mono text-gray-500">ID: {order.user}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium uppercase tracking-wider text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black italic tracking-wide text-white">
                                        ฿{order.total_amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleEditStatusClick(order)}
                                            className={`px-3 py-1 text-[10px] font-black uppercase italic tracking-wider skew-box-sm hover:opacity-80 transition-opacity ${order.status === 'delivered' ? 'bg-accent/20 text-accent border border-accent/20' :
                                                    order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                                        order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                                                            order.status === 'cancelled' ? 'bg-red-500/20 text-red-500 border border-red-500/20' :
                                                                'bg-white/10 text-gray-400 border border-white/10'
                                                }`}
                                        >
                                            {order.status}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => handleEditClick(order)}
                                            className="text-gray-400 hover:text-accent flex items-center gap-2 group/btn transition-colors"
                                        >
                                            {order.tracking_number ? (
                                                <span className="font-mono text-xs text-white group-hover/btn:text-accent">{order.tracking_number}</span>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 group-hover/btn:opacity-100">Add Tracking //</span>
                                            )}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" className="opacity-0 group-hover/btn:opacity-100 transition-opacity"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/admin/orders/${order.display_id || order.id}`}
                                            className="text-gray-400 hover:text-accent text-xs font-bold uppercase tracking-wider transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-bold uppercase tracking-widest">
                                        No active orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Tracking Modal */}
            {editingOrder && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-white/10 w-full max-w-md skew-box shadow-2xl relative p-8">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                                Logistics Update
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                            </button>
                        </div>
                        <div className="mb-6 space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                Order ref: <span className="text-accent font-mono ml-1">#{editingOrder.display_id || editingOrder.id}</span>
                            </p>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Tracking Number
                                </label>
                                <input
                                    type="text"
                                    value={newTrackingNumber}
                                    onChange={(e) => setNewTrackingNumber(e.target.value)}
                                    placeholder="ENTER TRACKING ID..."
                                    className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-mono uppercase tracking-wide outline-none transition-all placeholder-gray-700"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                className="px-6 py-2 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors skew-box font-bold uppercase tracking-wider text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTracking}
                                disabled={isSaving}
                                className="px-8 py-2 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.4)] text-xs disabled:opacity-50"
                            >
                                {isSaving ? "SAVING..." : "CONFIRM"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {editingStatusOrder && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-white/10 w-full max-w-md skew-box shadow-2xl relative p-8">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                                Update Status
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                            </button>
                        </div>
                        <div className="mb-6 space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                Order ref: <span className="text-accent font-mono ml-1">#{editingStatusOrder.display_id || editingStatusOrder.id}</span>
                            </p>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                    Current Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none appearance-none transition-all custom-select"
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
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                className="px-6 py-2 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors skew-box font-bold uppercase tracking-wider text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveStatus}
                                disabled={isSaving}
                                className="px-8 py-2 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.4)] text-xs disabled:opacity-50"
                            >
                                {isSaving ? "UPDATING..." : "UPDATE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
