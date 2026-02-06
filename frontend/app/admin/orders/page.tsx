"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { ordersApi } from "@/app/lib/api/orders";
import { Order } from "@/app/types/order";
import { Loader2, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

// Simple debounce utility to avoid external dependency
function debounce<A extends unknown[]>(func: (...args: A) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: A) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

interface FetchOrdersParams {
    mode: string;
    page: number;
    page_size: number;
    ordering: string;
    search?: string;
    status?: string;
}

export default function AdminOrdersPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Server-side pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const itemsPerPage = 20;

    const fetchOrders = useCallback(async (currentPage: number, search: string, status: string) => {
        setIsLoading(true);
        try {
            const params: FetchOrdersParams = {
                mode: 'admin',
                page: currentPage,
                page_size: itemsPerPage,
                ordering: "-created_at"
            };

            if (search) {
                params.search = search;
            }

            if (status !== 'all') {
                params.status = status;
            }

            const response = await ordersApi.getOrders(params);
            setOrders(response.results || []);
            setTotalOrders(response.count);
            setTotalPages(Math.ceil(response.count / itemsPerPage));
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounced search handler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetch = useCallback(
        debounce((query: string, status: string, page: number) => {
            fetchOrders(page, query, status);
        }, 500),
        []
    );

    // Initial load & Auth check
    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            // Trigger initial fetch
            fetchOrders(page, searchQuery, statusFilter);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, loading, user, router]);

    // Handle Search Input Change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setPage(1); // Reset to page 1 on search
        debouncedFetch(query, statusFilter, 1);
    };

    // Handle Status Change
    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        setPage(1); // Reset to page 1 on filter change
        fetchOrders(1, searchQuery, status);
    };

    // Handle Page Change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchOrders(newPage, searchQuery, statusFilter);
        }
    };

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
        <div className="flex flex-col space-y-8 pb-8">
            {/* Header section - Hero Style */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-white rounded-[2.5rem] p-8 border border-blue-100 shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-full bg-blue-100/30 skew-x-[-20deg] translate-x-12 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="px-4 py-1.5 rounded-full border border-blue-100 bg-white/80 backdrop-blur-sm shadow-sm inline-flex items-center gap-2 mb-4">
                            <span className="font-koulen text-[10px] text-[#0e4d80] uppercase tracking-[0.2em]">
                                Transaction Management
                            </span>
                        </div>
                        <h1 className="font-koulen text-5xl md:text-6xl tracking-tight text-[#0e4d80] leading-[0.9]">
                            Orders <span className="text-gray-300">Manager</span>
                        </h1>
                        <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-2 font-bold ml-1">
                            Track & Fulfillment Center
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="relative w-full lg:w-96 p-2">
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-full text-sm font-istok font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#0e4d80] focus:ring-4 focus:ring-blue-50/50 transition-all shadow-inner"
                    />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto p-2 no-scrollbar">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap shadow-sm hover:shadow-md active:scale-95 ${statusFilter === status
                                ? 'bg-[#0e4d80] text-white border-[#0e4d80] shadow-blue-900/20'
                                : 'bg-white text-gray-400 border-gray-100 hover:border-[#0e4d80] hover:text-[#0e4d80]'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center flex-1 min-h-[400px]">
                        <Loader2 className="w-12 h-12 text-[#0e4d80] animate-spin mb-4" />
                        <p className="font-koulen text-xl text-gray-300 tracking-widest animate-pulse">Loading Orders...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto flex-1">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-6 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Order ID</th>
                                        <th className="px-8 py-6 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Date</th>
                                        <th className="px-8 py-6 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Customer</th>
                                        <th className="px-8 py-6 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Status</th>
                                        <th className="px-8 py-6 text-right font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Total</th>
                                        <th className="px-8 py-6 text-right font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 bg-white">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-50">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <Search className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <p className="font-koulen text-xl text-gray-400">No orders found</p>
                                                    <p className="font-istok text-xs text-gray-400">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                            >
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <span className="font-istok text-sm font-bold text-[#0e4d80] group-hover:underline decoration-blue-200 underline-offset-4">
                                                        #{order.display_id || order.id}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-istok text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-istok mt-0.5">
                                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-white shadow-sm flex items-center justify-center text-[#0e4d80] font-koulen text-lg">
                                                            {order.full_name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-istok text-sm font-bold text-gray-900 group-hover:text-[#0e4d80] transition-colors">{order.full_name || 'Guest'}</span>
                                                            <span className="text-[10px] text-gray-400 font-istok">{order.phone_number}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm inline-flex items-center gap-2 ${getStatusColor(order.status)} bg-opacity-10`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(order.status).replace('text-', 'bg-').split(' ')[1]}`}></span>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap text-right">
                                                    <span className="font-koulen text-xl text-black tracking-tight">
                                                        ฿{Number(order.total_amount).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 whitespace-nowrap text-right">
                                                    <div className="flex justify-end relative z-10">
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-[#0e4d80] hover:border-[#0e4d80] hover:shadow-md transition-all shadow-sm group/btn"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Stats */}
                        {!isLoading && orders.length > 0 && (
                            <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                <p className="text-[10px] text-gray-400 font-istok uppercase tracking-widest font-bold">
                                    Showing <span className="text-gray-700">{(page - 1) * itemsPerPage + 1}</span> - <span className="text-gray-700">{Math.min(page * itemsPerPage, totalOrders)}</span> of <span className="text-[#0e4d80]">{totalOrders}</span> orders
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0e4d80] hover:text-[#0e4d80] hover:shadow-md transition-all disabled:hover:shadow-none disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages}
                                        className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0e4d80] hover:text-[#0e4d80] hover:shadow-md transition-all disabled:hover:shadow-none disabled:hover:border-gray-200 disabled:hover:text-gray-500"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
