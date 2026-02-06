"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ordersApi } from "@/app/lib/api/orders";
import { Order, OrderStats } from "@/app/types/order";
import { productsApi, usersApi } from "@/app/lib/api/client";
import { getImageUrl } from "@/app/lib/utils/image";
import Image from "next/image";
import Link from "next/link";
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    AlertTriangle,
    TrendingUp,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    ArrowRight,
} from "lucide-react";

interface ProductStats {
    min_price: number;
    max_price: number;
    total_count: number;
    total_stock: number;
    total_value: number;
    avg_price: number;
    active_count: number;
    low_stock_count: number;
    category_ids?: number[];
}

interface UserStats {
    total_users: number;
    active_users: number;
    admin_users: number;
    superuser_users: number;
}

interface LowStockProduct {
    id: number;
    name: string;
    stock: number;
    image: string | null;
}

export default function AdminDashboard() {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
    const [productStats, setProductStats] = useState<ProductStats | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [orderStatsRes, productStatsRes, userStatsRes, ordersRes, lowStockRes] =
                await Promise.all([
                    ordersApi.getStats(),
                    productsApi.getProductStats({}),
                    usersApi.getStats(),
                    ordersApi.getOrders({ ordering: "-created_at", page_size: 5 }),
                    productsApi.getLowStock(),
                ]);

            setOrderStats(orderStatsRes);
            setProductStats(productStatsRes);
            setUserStats(userStatsRes);
            setRecentOrders(ordersRes.results);
            setLowStockProducts(lowStockRes);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
            } else {
                fetchDashboardData();
            }
        }
    }, [isAuthenticated, authLoading, user, router, fetchDashboardData]);

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D2042D]"></div>
            </div>
        );
    }

    if (!user?.is_staff && !user?.is_superuser) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "bg-green-100 text-green-800 border-green-200";
            case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
            case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
            case "cancelled": return "bg-red-100 text-red-800 border-red-200";
            case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const activeOrders = (orderStats?.status_counts?.processing || 0) + (orderStats?.status_counts?.shipped || 0);

    return (
        <div className="flex flex-col space-y-10 pb-20">
            {/* Header section - Hero Style */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-white rounded-[2.5rem] p-10 border border-blue-100 shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-full bg-blue-100/30 skew-x-[-20deg] translate-x-12 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="px-4 py-1.5 rounded-full border border-blue-100 bg-white/80 backdrop-blur-sm shadow-sm inline-flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#0e4d80] animate-pulse"></div>
                            <span className="font-koulen text-[10px] text-[#0e4d80] uppercase tracking-[0.2em]">
                                Live Overview
                            </span>
                        </div>
                        <h1 className="font-koulen text-5xl md:text-6xl tracking-tight text-[#0e4d80] leading-[0.9]">
                            Management <span className="text-gray-300">Dashboard</span>
                        </h1>
                        <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-2 font-bold ml-1">
                            Real-time system metrics & analytics
                        </p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="px-6 py-3 bg-white border border-gray-200 rounded-full text-[10px] font-bold font-istok uppercase tracking-widest hover:border-[#0e4d80] hover:text-[#0e4d80] hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* Stats Overview - KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-blue-900/5 border border-gray-100 group hover:border-blue-200 transition-colors relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-6 relative">
                        <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-100 border border-green-200">
                            <span className="font-istok text-[9px] font-bold uppercase tracking-widest text-green-700 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12%
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <p className="font-istok text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Revenue</p>
                        <h3 className="font-koulen text-4xl text-[#0e4d80] tracking-tight leading-none mb-1">
                            ฿{Number(orderStats?.total_revenue || 0).toLocaleString()}
                        </h3>
                        <p className="font-istok text-[10px] text-gray-400">
                            From <span className="font-bold text-gray-600">{orderStats?.total_orders || 0}</span> orders
                        </p>
                    </div>
                </div>

                {/* Active Orders */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-blue-900/5 border border-gray-100 group hover:border-red-200 transition-colors relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-6 relative">
                        <div className="p-3 bg-red-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <ShoppingCart className="w-5 h-5 text-[#D2042D]" />
                        </div>
                    </div>
                    <div className="relative">
                        <p className="font-istok text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Active Orders</p>
                        <h3 className="font-koulen text-4xl text-[#D2042D] tracking-tight leading-none mb-1">
                            {activeOrders}
                        </h3>
                        <p className="font-istok text-[10px] text-gray-400">
                            {orderStats?.status_counts?.processing || 0} Processing · {orderStats?.status_counts?.shipped || 0} Shipped
                        </p>
                    </div>
                </div>

                {/* Total Products */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-blue-900/5 border border-gray-100 group hover:border-gray-300 transition-colors relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gray-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-6 relative">
                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        {(productStats?.low_stock_count || 0) > 0 && (
                            <div className="px-3 py-1 rounded-full bg-orange-100 border border-orange-200">
                                <span className="font-istok text-[9px] font-bold uppercase tracking-widest text-orange-700 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Alert
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <p className="font-istok text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Inventory</p>
                        <h3 className="font-koulen text-4xl text-gray-900 tracking-tight leading-none mb-1">
                            {productStats?.total_count || 0}
                        </h3>
                        <p className="font-istok text-[10px] text-gray-400">
                            {(productStats?.low_stock_count || 0) > 0
                                ? <span className="text-orange-600 font-bold">{productStats?.low_stock_count} Low Stock Items</span>
                                : <span className="text-green-600 font-bold">All Stocked</span>
                            }
                        </p>
                    </div>
                </div>

                {/* Total Users */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-blue-900/5 border border-gray-100 group hover:border-green-200 transition-colors relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-6 relative">
                        <div className="p-3 bg-green-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="relative">
                        <p className="font-istok text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Customers</p>
                        <h3 className="font-koulen text-4xl text-green-600 tracking-tight leading-none mb-1">
                            {userStats?.total_users || 0}
                        </h3>
                        <p className="font-istok text-[10px] text-gray-400">
                            <span className="font-bold text-gray-600">{userStats?.active_users || 0}</span> Active Users
                        </p>
                    </div>
                </div>
            </div>

            {/* Second Row: Order Status & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Status Distribution */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 shadow-xl shadow-blue-900/5 border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="font-koulen text-2xl text-[#0e4d80] uppercase tracking-tight">Order Distribution</h2>
                            <div className="h-1 w-12 bg-[#D2042D] mt-2 rounded-full"></div>
                        </div>
                        <Link href="/admin/orders" className="px-4 py-2 rounded-full border border-gray-100 bg-gray-50 font-istok text-[10px] text-gray-500 uppercase tracking-widest font-bold hover:bg-white hover:border-gray-300 hover:text-[#0e4d80] transition-colors flex items-center gap-2">
                            View All Orders <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Donut Chart + Legend Layout */}
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        {/* Donut Chart */}
                        <div className="relative shrink-0">
                            {orderStats?.total_orders && orderStats.total_orders > 0 ? (
                                <>
                                    <div
                                        className="w-56 h-56 rounded-full relative shadow-inner"
                                        style={{
                                            background: (() => {
                                                const total = orderStats.total_orders;
                                                const counts = orderStats.status_counts || {};

                                                let cumulative = 0;
                                                const segments: string[] = [];

                                                // Function to add segment
                                                const addSegment = (count: number, color: string) => {
                                                    if (!count) return;
                                                    const start = cumulative;
                                                    cumulative += (count / total) * 100;
                                                    segments.push(`${color} ${start}% ${cumulative}%`);
                                                };

                                                addSegment(counts.pending || 0, '#facc15');   // Yellow
                                                addSegment(counts.processing || 0, '#60a5fa'); // Blue
                                                addSegment(counts.shipped || 0, '#c084fc');    // Purple
                                                addSegment(counts.delivered || 0, '#4ade80');  // Green
                                                addSegment(counts.cancelled || 0, '#f87171');  // Red

                                                return `conic-gradient(${segments.join(", ")})`;
                                            })(),
                                        }}
                                    >
                                        {/* Inner circle for donut effect */}
                                        <div className="absolute inset-8 bg-white rounded-full flex flex-col items-center justify-center shadow-lg shadow-gray-200/50">
                                            <span className="font-koulen text-4xl text-[#0e4d80]">{orderStats.total_orders}</span>
                                            <span className="font-istok text-[9px] text-gray-400 uppercase tracking-widest font-bold">Total Orders</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-56 h-56 rounded-full bg-gray-50 flex items-center justify-center border-4 border-gray-100 border-dashed">
                                    <span className="font-istok text-xs font-bold text-gray-300 uppercase tracking-widest">No Data</span>
                                </div>
                            )}
                        </div>

                        {/* Status Legend - Vertical */}
                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: "Pending", count: orderStats?.status_counts?.pending || 0, color: "bg-yellow-400", textColor: "text-yellow-600", icon: Clock },
                                { label: "Processing", count: orderStats?.status_counts?.processing || 0, color: "bg-blue-400", textColor: "text-blue-600", icon: Package },
                                { label: "Shipped", count: orderStats?.status_counts?.shipped || 0, color: "bg-purple-400", textColor: "text-purple-600", icon: Truck },
                                { label: "Delivered", count: orderStats?.status_counts?.delivered || 0, color: "bg-green-400", textColor: "text-green-600", icon: CheckCircle },
                                { label: "Cancelled", count: orderStats?.status_counts?.cancelled || 0, color: "bg-red-400", textColor: "text-red-600", icon: XCircle },
                            ].map((status) => {
                                const percentage = orderStats?.total_orders
                                    ? Math.round((status.count / orderStats.total_orders) * 100)
                                    : 0;
                                return (
                                    <div
                                        key={status.label}
                                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group"
                                    >
                                        <div className={`w-10 h-10 ${status.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                            <status.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="font-istok text-[10px] uppercase tracking-widest font-bold text-gray-500">{status.label}</span>
                                                <span className={`font-koulen text-lg ${status.textColor}`}>{status.count}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${status.color} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Low Stock Products */}
                <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-blue-900/5 border border-gray-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="font-koulen text-xl text-[#0e4d80] uppercase tracking-tight">Low Stock Alert</h2>
                            <div className="h-1 w-8 bg-orange-400 mt-2 rounded-full"></div>
                        </div>
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center animate-pulse">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 relative">
                        {lowStockProducts.length > 0 ? (
                            <div className="absolute inset-0 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                {lowStockProducts.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/admin/products/${product.id}/edit`}
                                        className="flex items-center gap-3 p-3 bg-orange-50/30 border border-orange-100/50 rounded-2xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
                                    >
                                        <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                                            <Image
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-1"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-istok text-xs font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                                                {product.name}
                                            </p>
                                            <p className="font-istok text-[10px] text-orange-500 uppercase tracking-widest font-bold mt-0.5">
                                                Only {product.stock} Left
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <p className="font-koulen text-lg text-gray-400">All Good!</p>
                                <p className="font-istok text-xs text-gray-400 mt-1">Inventory levels are healthy.</p>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/admin/products"
                        className="block w-full mt-6 py-4 border border-gray-200 font-istok text-[10px] font-bold uppercase tracking-widest hover:border-[#0e4d80] hover:bg-[#0e4d80] hover:text-white transition-all text-center rounded-2xl shadow-sm hover:shadow-lg"
                    >
                        Manage Inventory
                    </Link>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-[3rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/30">
                    <div>
                        <h2 className="font-koulen text-2xl text-[#0e4d80] uppercase tracking-tight">Recent Transactions</h2>
                        <p className="font-istok text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">Latest customer orders</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-y border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Order ID</th>
                                <th className="px-8 py-5 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Customer</th>
                                <th className="px-8 py-5 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Status</th>
                                <th className="px-8 py-5 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Date</th>
                                <th className="px-8 py-5 text-right font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                                        onClick={() => router.push(`/admin/orders/${order.display_id || order.id}`)}
                                    >
                                        <td className="px-8 py-6 font-istok text-xs font-bold text-[#0e4d80] group-hover:underline decoration-blue-200 underline-offset-4">
                                            #{order.display_id || order.id}
                                        </td>
                                        <td className="px-8 py-6 font-istok text-xs font-bold text-gray-700">
                                            {order.full_name}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-full font-istok text-[9px] uppercase tracking-widest font-bold border shadow-sm ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-istok text-xs text-gray-500 font-medium">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="font-koulen text-lg text-black">
                                                ฿{Number(order.total_amount).toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center font-istok text-gray-400 text-sm">
                                        No recent orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
