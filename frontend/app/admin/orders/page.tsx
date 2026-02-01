"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { ordersApi } from "@/app/lib/api/orders";
import { Order } from "@/app/types/order";
import { Loader2, Search, Eye, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function AdminOrdersPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Pagination (Simple client-side for now or API based if available)
    // Assuming API returns all for now strictly based on time constraints, 
    // but ideally we'd use server-side pagination.
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            // mode: 'admin' ensures we get all orders
            const response = await ordersApi.getOrders({ mode: 'admin' });
            const results = response.results || [];

            // Sort by created_at desc
            const sorted = results.sort((a: Order, b: Order) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setOrders(sorted);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            fetchOrders();
        }
    }, [isAuthenticated, loading, user, router]);

    // Filtering
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            String(order.display_id || order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const displayedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const getStatusColor = (s: string) => {
        switch (s.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'processing': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="pt-8 flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-koulen text-4xl tracking-wide text-[#0e4d80]">
                        Orders <span className="text-[#0e4d80]/60">Manager</span>
                    </h1>
                    <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">
                        Track & Manage Orders
                    </p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-4xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search by ID, Customer Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-istok focus:outline-none focus:border-[#0e4d80] transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === status
                                ? 'bg-[#0e4d80] text-white border-[#0e4d80]'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-[#0e4d80] hover:text-[#0e4d80]'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="card-sport overflow-hidden bg-white min-h-[500px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <Loader2 className="w-8 h-8 text-[#0e4d80] animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-left font-istok text-[10px] text-gray-500 uppercase tracking-widest font-bold">Order ID</th>
                                    <th className="px-6 py-5 text-left font-istok text-[10px] text-gray-500 uppercase tracking-widest font-bold">Date</th>
                                    <th className="px-6 py-5 text-left font-istok text-[10px] text-gray-500 uppercase tracking-widest font-bold">Customer</th>
                                    <th className="px-6 py-5 text-left font-istok text-[10px] text-gray-500 uppercase tracking-widest font-bold">Status</th>
                                    <th className="px-6 py-5 text-right font-istok text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total</th>
                                    <th className="px-6 py-5 text-right font-istok text-[10px] text-gray-500 uppercase tracking-widest font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {displayedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-istok text-sm">
                                            No orders found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-koulen text-lg text-[#0e4d80]">
                                                    #{order.display_id || order.id}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="font-istok text-xs font-bold uppercase tracking-wider">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 pl-5.5 font-istok">
                                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#0e4d80] font-bold text-xs">
                                                        {order.full_name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-istok text-sm font-bold text-gray-900">{order.full_name || 'Guest'}</span>
                                                        <span className="text-[10px] text-gray-400">{order.phone_number}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="font-koulen text-lg text-black">
                                                    ฿{Number(order.total_amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-400 hover:text-[#0e4d80] hover:border-[#0e4d80] hover:bg-white transition-all shadow-sm"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Stats */}
                {!isLoading && displayedOrders.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-istok uppercase tracking-wider">
                            Showing <span className="font-bold text-gray-900">{(page - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-gray-900">{filteredOrders.length}</span> orders
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-50 hover:border-[#0e4d80] hover:text-[#0e4d80] transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-50 hover:border-[#0e4d80] hover:text-[#0e4d80] transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
