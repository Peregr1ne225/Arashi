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
        <main className="container mx-auto px-4 py-8 flex-1 relative">
            <div className="flex justify-between items-center mb-6 pt-6">
                <h1 className="text-2xl font-bold">Manage Orders</h1>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Order ID
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Customer
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Date
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Total
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Status
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Tracking
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{order.display_id || order.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="font-medium text-gray-900">{order.full_name}</div>
                                    <div className="text-xs text-gray-400">User ID: {order.user}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ฿{order.total_amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleEditStatusClick(order)}
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full hover:opacity-80 transition-opacity ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                        onClick={() => handleEditClick(order)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 group"
                                    >
                                        {order.tracking_number ? (
                                            <span>{order.tracking_number}</span>
                                        ) : (
                                            <span className="italic text-gray-400 group-hover:text-blue-600">Add Tracking</span>
                                        )}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/admin/orders/${order.display_id || order.id}`}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Tracking Modal */}
            {editingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Edit Tracking Number
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">
                                Order: <span className="font-medium text-gray-900">#{editingOrder.display_id || editingOrder.id}</span>
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tracking Number
                            </label>
                            <input
                                type="text"
                                value={newTrackingNumber}
                                onChange={(e) => setNewTrackingNumber(e.target.value)}
                                placeholder="Enter tracking number"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTracking}
                                disabled={isSaving}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {editingStatusOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Update Status
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">
                                Order: <span className="font-medium text-gray-900">#{editingStatusOrder.display_id || editingStatusOrder.id}</span>
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={isSaving}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveStatus}
                                disabled={isSaving}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isSaving ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
