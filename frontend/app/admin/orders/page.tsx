"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { ordersApi } from "@/app/lib/api/orders";
import { Order } from "@/app/types/order";
import { getImageUrl } from "@/app/lib/utils/image";
import {
    Search,
    Truck,
    Package,
    CheckCircle2,
    Clock,
    ExternalLink,
    ClipboardList,
    TrendingUp,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { SortIcon } from "@/app/components/admin/SortIcon";

export default function AdminOrdersPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedOrderIds, setExpandedOrderIds] = useState<Set<number>>(new Set());
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [pagination, setPagination] = useState<{ next: string | null; previous: string | null; count: number }>({
        next: null,
        previous: null,
        count: 0
    });
    const [stats, setStats] = useState({
        total_orders: 0,
        total_revenue: 0,
        status_counts: {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        }
    });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        // Map frontend keys to backend keys if necessary
        const ordering = direction === 'desc' ? `-${key}` : key;
        fetchOrders(ordering, searchQuery);
    };

    // Trigger search when query changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (sortConfig) {
                const ordering = sortConfig.direction === 'desc' ? `-${sortConfig.key}` : sortConfig.key;
                fetchOrders(ordering, searchQuery);
            } else {
                fetchOrders(undefined, searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, sortConfig]);

    const filteredOrders = orders; // API does filtering
    const sortedOrders = orders;   // API does sorting

    // Modal States
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

    const fetchOrders = async (ordering?: string, search?: string, page: number = 1) => {
        setIsLoading(true);
        try {
            const params: { mode: string; ordering?: string; search?: string; page?: number } = { mode: "admin" };
            if (ordering) params.ordering = ordering;
            if (search) params.search = search;
            if (page > 1) params.page = page;

            const response = await ordersApi.getOrders(params);
            setOrders(response.results);
            setPagination({
                next: response.next,
                previous: response.previous,
                count: response.count
            });
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await ordersApi.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch order stats", error);
        }
    };

    // Initial load
    useEffect(() => {
        if (!loading && isAuthenticated) {
            fetchStats();
            // fetchOrders is called by the other useEffect when user changes
        }
    }, [loading, isAuthenticated]);

    const [currentPage, setCurrentPage] = useState(1);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        const ordering = sortConfig ? (sortConfig.direction === 'desc' ? `-${sortConfig.key}` : sortConfig.key) : undefined;
        fetchOrders(ordering, searchQuery, newPage);
    };

    const toggleOrderExpansion = (orderId: number) => {
        const newExpanded = new Set(expandedOrderIds);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrderIds(newExpanded);
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
            setOrders(orders.map(o => (o.id === updatedOrder.id) ? updatedOrder : o));
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
            const updatedOrder = await ordersApi.updateStatus(editingStatusOrder.id, newStatus);
            setOrders(orders.map(o => (o.id === updatedOrder.id) ? updatedOrder : o));
            handleCloseModal();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2042D]"></div>
            </div>
        );
    }

    return (
        <div className="pt-8 flex flex-col space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-koulen text-4xl tracking-wide text-[#0e4d80]">
                        Order <span className="text-[#D2042D]">Manager</span>
                    </h1>
                    <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">
                        Oversee Logistics & Revenue
                    </p>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 border border-gray-100 rounded-sm shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-istok text-[10px] text-gray-500 uppercase tracking-widest font-bold">Live Portal Status</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                </div>
            </div>

            {/* Dashboard Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="card-sport p-5 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                            <ClipboardList className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Overall</span>
                    </div>
                    <div className="font-koulen text-2xl text-[#0e4d80]">{stats.total_orders}</div>
                    <div className="font-istok text-[10px] text-gray-400 uppercase tracking-widest mt-1">Total Registry</div>
                </div>

                <div className="card-sport p-5 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-yellow-50 rounded-full group-hover:bg-yellow-100 transition-colors">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Awaiting</span>
                    </div>
                    <div className="font-koulen text-2xl text-yellow-600">{stats.status_counts.pending}</div>
                    <div className="font-istok text-[10px] text-gray-400 uppercase tracking-widest mt-1">Pending Action</div>
                </div>

                <div className="card-sport p-5 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors">
                            <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">In Layout</span>
                    </div>
                    <div className="font-koulen text-2xl text-purple-600">{stats.status_counts.processing}</div>
                    <div className="font-istok text-[10px] text-gray-400 uppercase tracking-widest mt-1">Processing</div>
                </div>

                <div className="card-sport p-5 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                            <Truck className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Fulfilled</span>
                    </div>
                    <div className="font-koulen text-2xl text-green-600">{stats.status_counts.shipped + stats.status_counts.delivered}</div>
                    <div className="font-istok text-[10px] text-gray-400 uppercase tracking-widest mt-1">Dispatched</div>
                </div>

                <div className="card-sport p-5 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors">
                            <TrendingUp className="w-5 h-5 text-[#D2042D]" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Valuation</span>
                    </div>
                    <div className="font-koulen text-2xl text-[#D2042D]">฿{stats.total_revenue.toLocaleString()}</div>
                    <div className="font-istok text-[10px] text-gray-400 uppercase tracking-widest mt-1">Total Revenue</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID or Customer Name..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md font-istok text-xs focus:ring-1 focus:ring-[#0e4d80] outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Showing {filteredOrders.length} Results
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="card-sport overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="w-10 px-4 py-4"></th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('id')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    Registry ID <SortIcon columnKey="id" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('full_name')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    Customer Profile <SortIcon columnKey="full_name" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('created_at')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    Timestamp <SortIcon columnKey="created_at" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('total_amount')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    Valuation <SortIcon columnKey="total_amount" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('status')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    System Status <SortIcon columnKey="status" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Logistic ID</th>
                            <th className="px-6 py-4 text-right font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {sortedOrders.length > 0 ? sortedOrders.map((order) => {
                            const isExpanded = expandedOrderIds.has(order.id);
                            return (
                                <React.Fragment key={order.id}>
                                    <tr className={`hover:bg-gray-50/80 transition-colors group ${isExpanded ? 'bg-gray-50/40' : ''}`}>
                                        <td className="px-4 py-6">
                                            <button
                                                onClick={() => toggleOrderExpansion(order.id)}
                                                className="p-1.5 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm transition-all text-gray-400 hover:text-[#0e4d80]"
                                            >
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-6 border-l-2 border-transparent group-hover:border-l-[#0e4d80]">
                                            <div className="font-koulen text-base text-black tracking-widest">#{order.display_id || order.id}</div>
                                            <div className="text-[8px] text-gray-400 font-mono mt-0.5 uppercase">Internal Ref: {order.id}</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#0e4d80] text-xs">
                                                    {order.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-istok text-xs font-bold text-black uppercase tracking-wide">{order.full_name}</div>
                                                    <div className="font-istok text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Contact: {order.phone_number || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="font-istok text-xs text-gray-500 uppercase tracking-widest">
                                                {new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div className="text-[8px] text-gray-400 mt-0.5 font-bold uppercase tracking-tighter">
                                                {new Date(order.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="font-koulen text-base text-[#D2042D]">฿{order.total_amount.toLocaleString()}</div>
                                            <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{order.items.length} Items</div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <button
                                                onClick={() => handleEditStatusClick(order)}
                                                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-full border shadow-xs hover:shadow-sm active:scale-95 transition-all flex items-center gap-2 group/btn ${order.status === 'delivered' ? 'border-green-500/30 text-green-600 bg-green-50' :
                                                    order.status === 'cancelled' ? 'border-red-500/30 text-red-500 bg-red-50' :
                                                        order.status === 'shipped' ? 'border-blue-500/30 text-blue-600 bg-blue-50' :
                                                            'border-orange-500/30 text-orange-600 bg-orange-50'
                                                    }`}
                                            >
                                                <div className={`w-1 h-1 rounded-full ${order.status === 'delivered' ? 'bg-green-500' :
                                                    order.status === 'cancelled' ? 'bg-red-500' :
                                                        order.status === 'shipped' ? 'bg-blue-500' :
                                                            'bg-orange-500 animate-pulse'
                                                    }`} />
                                                {order.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div
                                                onClick={() => handleEditClick(order)}
                                                className="cursor-pointer group/track"
                                            >
                                                {order.tracking_number ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-black bg-gray-50 px-2 py-1 rounded-full border border-gray-100 font-mono text-[10px] font-bold group-hover/track:border-[#0e4d80] transition-colors">{order.tracking_number}</span>
                                                        <Truck size={12} className="text-gray-400 group-hover/track:text-[#0e4d80] transition-colors" />
                                                    </div>
                                                ) : (
                                                    <span className="font-istok text-[10px] font-bold text-gray-300 italic group-hover/track:text-[#0e4d80] transition-colors uppercase tracking-widest">+ Assign Logistics</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <Link
                                                href={`/admin/orders/${order.display_id || order.id}`}
                                                className="inline-flex items-center gap-2 font-istok text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#D2042D] transition-colors group/inspect"
                                            >
                                                Inspect <ExternalLink size={12} className="group-hover/inspect:translate-x-0.5 group-hover/inspect:-translate-y-0.5 transition-transform" />
                                            </Link>
                                        </td>
                                    </tr>

                                    {/* Expandable Order Items */}
                                    {isExpanded && (
                                        <tr className="bg-gray-50/50 border-l-4 border-l-[#0e4d80]/20 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <td colSpan={8} className="px-6 py-4">
                                                <div className="bg-white rounded border border-gray-100 shadow-inner overflow-hidden">
                                                    <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">MANIFEST CONTENT</span>
                                                        <span className="text-[9px] font-bold text-[#0e4d80] uppercase tracking-widest">{order.items.length} LINE ITEMS</span>
                                                    </div>
                                                    <div className="divide-y divide-gray-50">
                                                        {order.items.map((item, idx) => {
                                                            const isDiscounted = item.product.price > item.price;
                                                            return (
                                                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="relative w-12 h-12 bg-white rounded border border-gray-100 overflow-hidden shrink-0">
                                                                            {item.product.images && item.product.images.length > 0 ? (
                                                                                <Image
                                                                                    src={getImageUrl(item.product.images[0])}
                                                                                    alt={item.product.name}
                                                                                    fill
                                                                                    className="object-contain p-1"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 font-bold">NO IMG</div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="font-koulen text-sm text-black tracking-wide uppercase">{item.product.name}</div>
                                                                                {isDiscounted && (
                                                                                    <span className="text-[8px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-xs uppercase tracking-tighter animate-pulse">
                                                                                        Save ฿{(item.product.price - item.price).toLocaleString()}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                {item.color_name && (
                                                                                    <span className="text-[8px] font-bold text-white bg-gray-400 px-1.5 py-0.5 rounded-xs uppercase tracking-tighter">COLOR: {item.color_name}</span>
                                                                                )}
                                                                                {item.size_name && (
                                                                                    <span className="text-[8px] font-bold text-white bg-[#D2042D]/60 px-1.5 py-0.5 rounded-xs uppercase tracking-tighter">SIZE: {item.size_name}</span>
                                                                                )}
                                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1.5 py-0.5 border border-gray-100 rounded-xs">QTY: {item.quantity}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="flex flex-col items-end">
                                                                            {isDiscounted && (
                                                                                <div className="text-[10px] text-gray-400 font-bold line-through decoration-red-500/50 decoration-1">
                                                                                    ฿{(item.product.price * item.quantity).toLocaleString()}
                                                                                </div>
                                                                            )}
                                                                            <div className={`font-koulen text-sm ${isDiscounted ? 'text-[#D2042D]' : 'text-black'}`}>
                                                                                ฿{(item.price * item.quantity).toLocaleString()}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                                            {isDiscounted ? (
                                                                                <span>
                                                                                    <span className="line-through decoration-gray-300">฿{item.product.price.toLocaleString()}</span>
                                                                                    <span className="mx-1 text-gray-300">→</span>
                                                                                    <span className="text-[#D2042D]">฿{item.price.toLocaleString()}</span>
                                                                                </span>
                                                                            ) : (
                                                                                <span>฿{item.price.toLocaleString()}</span>
                                                                            )} PER UNIT
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="bg-gray-50/30 px-4 py-3 border-t border-gray-100">
                                                        <div className="flex justify-end">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <div className="flex items-center gap-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                                    <span>Subtotal ({order.items.length} Items)</span>
                                                                    <span>฿{order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}</span>
                                                                </div>
                                                                {(order.items.reduce((acc, item) => acc + ((item.product.price - item.price) * item.quantity), 0) > 0) && (
                                                                    <div className="flex items-center gap-4 text-[9px] text-green-600 font-bold uppercase tracking-widest">
                                                                        <span>Total Savings</span>
                                                                        <span>-฿{order.items.reduce((acc, item) => acc + ((item.product.price - item.price) * item.quantity), 0).toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {(Number(order.total_amount) - order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)) > 0 && (
                                                                    <div className="flex items-center gap-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                                        <span>Logistics & Handling</span>
                                                                        <span>฿{(Number(order.total_amount) - order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)).toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-4 mt-1 border-t border-gray-200 pt-1">
                                                                    <span className="text-[10px] font-bold text-[#0e4d80] uppercase tracking-widest">Total Valuation</span>
                                                                    <span className="font-koulen text-xl text-[#D2042D]">฿{Number(order.total_amount).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {order.shipping_address && (
                                                            <div className="mt-4 pt-3 border-t border-gray-200/60">
                                                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shipping Destination</div>
                                                                <div className="text-sm text-gray-600 font-istok">{order.shipping_address}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        }) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <Package size={48} className="mb-3 opacity-20" />
                                        <p className="font-istok text-sm uppercase tracking-widest">No matching order entries found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-3 sm:px-6 shadow-sm rounded-b-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.previous}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.next}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700 font-istok">
                            Showing <span className="font-bold">{((currentPage - 1) * 50) + 1}</span> to <span className="font-bold">{Math.min(currentPage * 50, pagination.count)}</span> of{' '}
                            <span className="font-bold">{pagination.count}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.previous}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                Page {currentPage}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.next}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Tracking Modal */}
            {editingOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-[#0e4d80] font-koulen text-xl tracking-wide uppercase">Assign Logistics ID</h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Order Identification</label>
                                <div className="font-koulen text-lg text-black bg-gray-50 px-3 py-2 border border-gray-100 rounded">
                                    #{editingOrder.display_id || editingOrder.id}
                                </div>
                            </div>
                            <div className="mb-8">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    value={newTrackingNumber}
                                    onChange={(e) => setNewTrackingNumber(e.target.value)}
                                    placeholder="e.g. TH-ORD-0982-11"
                                    className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-[#0e4d80]/20 focus:border-[#0e4d80] outline-none transition-all"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-100 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTracking}
                                    disabled={isSaving}
                                    className="px-8 py-2.5 bg-[#0e4d80] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#0b3d66] disabled:opacity-50 transition-colors shadow-lg shadow-[#0e4d80]/20"
                                >
                                    {isSaving ? "Synchronizing..." : "Update Logistics"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {editingStatusOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h3 className="text-[#0e4d80] font-koulen text-xl tracking-wide uppercase">Modify System Status</h3>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 text-center">
                                <div className="inline-block p-4 bg-gray-50 rounded-full mb-3">
                                    <ClipboardList size={32} className="text-[#0e4d80]" />
                                </div>
                                <div className="font-istok text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Target Registry</div>
                                <div className="font-koulen text-2xl text-black">#{editingStatusOrder.display_id || editingStatusOrder.id}</div>
                            </div>
                            <div className="mb-8">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Target Status Level</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setNewStatus(s)}
                                            className={`w-full px-4 py-3 rounded border text-left font-istok text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-between ${newStatus === s
                                                ? 'bg-[#0e4d80] text-white border-[#0e4d80] shadow-md shadow-[#0e4d80]/10 translate-x-1'
                                                : 'bg-white text-gray-600 border-gray-100 hover:border-[#0e4d80]/50 hover:bg-gray-50'
                                                }`}
                                        >
                                            {s}
                                            {newStatus === s && <CheckCircle2 size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveStatus}
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-[#D2042D] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#b50327] disabled:opacity-50 transition-colors shadow-lg shadow-[#D2042D]/20"
                                >
                                    {isSaving ? "Updating Status..." : "Confirm Update"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
