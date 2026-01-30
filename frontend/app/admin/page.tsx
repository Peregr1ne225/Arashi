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
        <div className="pt-8 flex flex-col space-y-10 pb-20">
            {/* Header section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="font-koulen text-4xl tracking-wide text-[#0e4d80]">
                        Management <span className="text-[#D2042D]">Dashboard</span>
                    </h1>
                    <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">
                        Real-time system metrics
                    </p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-istok uppercase tracking-widest hover:border-[#D2042D] transition-colors"
                >
                    Refresh Data
                </button>
            </div>

            {/* Stats Overview - KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="card-sport p-6 group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="font-istok text-[10px] uppercase tracking-widest text-gray-400">Total Revenue</p>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="font-koulen text-3xl text-blue-600 tracking-tight">
                        ฿{Number(orderStats?.total_revenue || 0).toLocaleString()}
                    </h3>
                    <p className="font-istok text-[9px] uppercase tracking-widest text-gray-500 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">From {orderStats?.total_orders || 0} orders</span>
                    </p>
                </div>

                {/* Active Orders */}
                <div className="card-sport p-6 group border-l-4 border-l-[#D2042D]/20">
                    <div className="flex justify-between items-start mb-4">
                        <p className="font-istok text-[10px] uppercase tracking-widest text-gray-400">Active Orders</p>
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShoppingCart className="w-5 h-5 text-[#D2042D]" />
                        </div>
                    </div>
                    <h3 className="font-koulen text-3xl text-[#D2042D] tracking-tight">{activeOrders}</h3>
                    <p className="font-istok text-[9px] uppercase tracking-widest text-gray-500 mt-2">
                        {orderStats?.status_counts?.pending || 0} Pending · {orderStats?.status_counts?.processing || 0} Processing
                    </p>
                </div>

                {/* Total Products */}
                <div className="card-sport p-6 group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="font-istok text-[10px] uppercase tracking-widest text-gray-400">Total Products</p>
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package className="w-5 h-5 text-gray-600" />
                        </div>
                    </div>
                    <h3 className="font-koulen text-3xl text-gray-900 tracking-tight">{productStats?.total_count || 0}</h3>
                    <p className="font-istok text-[9px] uppercase tracking-widest text-gray-500 mt-2 flex items-center gap-1">
                        {(productStats?.low_stock_count || 0) > 0 ? (
                            <>
                                <AlertTriangle className="w-3 h-3 text-orange-500" />
                                <span className="text-orange-500">{productStats?.low_stock_count} Low stock</span>
                            </>
                        ) : (
                            <span className="text-green-500">All stocked</span>
                        )}
                    </p>
                </div>

                {/* Total Users */}
                <div className="card-sport p-6 group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="font-istok text-[10px] uppercase tracking-widest text-gray-400">Total Users</p>
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <h3 className="font-koulen text-3xl text-green-600 tracking-tight">{userStats?.total_users || 0}</h3>
                    <p className="font-istok text-[9px] uppercase tracking-widest text-gray-500 mt-2">
                        {userStats?.admin_users || 0} Admins · {userStats?.active_users || 0} Active
                    </p>
                </div>
            </div>

            {/* Second Row: Order Status & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Status Distribution */}
                <div className="lg:col-span-2 card-sport p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="font-koulen text-xl text-black uppercase tracking-tight">Order Status Distribution</h2>
                            <div className="h-0.5 w-8 bg-[#D2042D] mt-1"></div>
                        </div>
                        <Link href="/admin/orders" className="font-istok text-[10px] text-gray-400 uppercase tracking-widest hover:text-black transition-colors flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Donut Chart + Legend Layout */}
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Donut Chart */}
                        <div className="relative">
                            {orderStats?.total_orders && orderStats.total_orders > 0 ? (
                                <>
                                    <div
                                        className="w-48 h-48 rounded-full relative"
                                        style={{
                                            background: (() => {
                                                const total = orderStats.total_orders;
                                                const pending = orderStats.status_counts?.pending || 0;
                                                const processing = orderStats.status_counts?.processing || 0;
                                                const shipped = orderStats.status_counts?.shipped || 0;
                                                const delivered = orderStats.status_counts?.delivered || 0;
                                                const cancelled = orderStats.status_counts?.cancelled || 0;

                                                let cumulative = 0;
                                                const segments: string[] = [];

                                                if (pending > 0) {
                                                    const start = cumulative;
                                                    cumulative += (pending / total) * 100;
                                                    segments.push(`#facc15 ${start}% ${cumulative}%`);
                                                }
                                                if (processing > 0) {
                                                    const start = cumulative;
                                                    cumulative += (processing / total) * 100;
                                                    segments.push(`#60a5fa ${start}% ${cumulative}%`);
                                                }
                                                if (shipped > 0) {
                                                    const start = cumulative;
                                                    cumulative += (shipped / total) * 100;
                                                    segments.push(`#c084fc ${start}% ${cumulative}%`);
                                                }
                                                if (delivered > 0) {
                                                    const start = cumulative;
                                                    cumulative += (delivered / total) * 100;
                                                    segments.push(`#4ade80 ${start}% ${cumulative}%`);
                                                }
                                                if (cancelled > 0) {
                                                    const start = cumulative;
                                                    cumulative += (cancelled / total) * 100;
                                                    segments.push(`#f87171 ${start}% ${cumulative}%`);
                                                }

                                                return `conic-gradient(${segments.join(", ")})`;
                                            })(),
                                        }}
                                    >
                                        {/* Inner circle for donut effect */}
                                        <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                            <span className="font-koulen text-3xl text-black">{orderStats.total_orders}</span>
                                            <span className="font-istok text-[9px] text-gray-400 uppercase tracking-widest">Total Orders</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="font-istok text-sm text-gray-400">No orders yet</span>
                                </div>
                            )}
                        </div>

                        {/* Status Legend - Vertical */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                        className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                                    >
                                        <div className={`w-10 h-10 ${status.color} rounded-full flex items-center justify-center`}>
                                            <status.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline">
                                                <span className="font-istok text-xs uppercase tracking-widest text-gray-500">{status.label}</span>
                                                <span className={`font-koulen text-lg ${status.textColor}`}>{status.count}</span>
                                            </div>
                                            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${status.color} transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="font-istok text-[9px] text-gray-400 mt-0.5">{percentage}% of total</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Low Stock Products */}
                <div className="card-sport p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="font-koulen text-xl text-black uppercase tracking-tight">Low Stock Alert</h2>
                            <div className="h-0.5 w-8 bg-orange-500 mt-1"></div>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>

                    {lowStockProducts.length > 0 ? (
                        <div className="space-y-4 max-h-[280px] overflow-y-auto per-2 pr-2">
                            {lowStockProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/admin/products/${product.id}/edit`}
                                    className="flex items-center gap-3 p-3 bg-orange-50/50 border border-orange-100 rounded-lg hover:border-orange-300 transition-colors group"
                                >
                                    <div className="relative w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                        <Image
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-0.5"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-istok text-xs font-bold text-black truncate group-hover:text-[#D2042D] transition-colors">
                                            {product.name}
                                        </p>
                                        <p className="font-istok text-[10px] text-orange-600 uppercase tracking-widest">
                                            {product.stock} in stock
                                        </p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#D2042D] transition-colors" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
                            <p className="font-istok text-sm text-gray-500">All products are well-stocked!</p>
                        </div>
                    )}

                    <Link
                        href="/admin/products"
                        className="block w-full mt-6 py-3 border border-gray-100 font-istok text-[10px] font-bold uppercase tracking-widest hover:border-black transition-all text-center rounded-lg"
                    >
                        Manage Inventory
                    </Link>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="card-sport overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="font-koulen text-xl text-black uppercase tracking-tight">Recent Orders</h2>
                        <p className="font-istok text-[10px] text-gray-400 uppercase tracking-widest mt-1">Latest transactions</p>
                    </div>
                    <Link href="/admin/orders" className="font-istok text-[10px] text-gray-400 uppercase tracking-widest hover:text-black transition-colors flex items-center gap-1">
                        View All <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Order ID</th>
                            <th className="px-6 py-3 text-left font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Customer</th>
                            <th className="px-6 py-3 text-left font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Status</th>
                            <th className="px-6 py-3 text-left font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Date</th>
                            <th className="px-6 py-3 text-right font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => router.push(`/admin/orders/${order.display_id || order.id}`)}>
                                    <td className="px-6 py-4 font-istok text-xs text-black font-bold">#{order.display_id || order.id}</td>
                                    <td className="px-6 py-4 font-istok text-xs text-gray-600">{order.full_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 border rounded-full font-istok text-[9px] uppercase tracking-widest font-bold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-istok text-xs text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right font-koulen text-sm text-black">฿{Number(order.total_amount).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center font-istok text-gray-400 text-sm">
                                    No orders yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div >
        </div >
    );
}
