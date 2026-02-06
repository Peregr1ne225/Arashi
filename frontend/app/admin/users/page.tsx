"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { usersApi } from "@/app/lib/api/client";
import { User } from "@/app/types/user";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import MessageModal from "@/app/components/ui/MessageModal";
import {
    Search,
    Shield,
    User as UserIcon,
    Ban,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MoreHorizontal,
    Crown,
    Mail,
    Calendar,
    Filter
} from "lucide-react";
import { SortIcon } from "@/app/components/admin/SortIcon";
// Removed framer-motion import

interface UserStats {
    total_users: number;
    active_users: number;
    admin_users: number;
    superuser_users: number;
}

export default function AdminUsersPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Data State
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<{ next: string | null; previous: string | null; count: number }>({
        next: null,
        previous: null,
        count: 0
    });
    const PAGE_SIZE = 50;

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Stats State
    const [stats, setStats] = useState<UserStats>({
        total_users: 0,
        active_users: 0,
        admin_users: 0,
        superuser_users: 0,
    });

    // Modal State
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [roleConfirmation, setRoleConfirmation] = useState<{
        user: User;
        targetRole: 'user' | 'admin' | 'superuser';
        currentRole: 'user' | 'admin' | 'superuser';
    } | null>(null);
    const [statusConfirmation, setStatusConfirmation] = useState<{ user: User } | null>(null);

    // Message Modal
    const [messageModal, setMessageModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info";
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });


    // Filter State
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            let ordering = "";
            if (sortConfig) {
                ordering = sortConfig.direction === 'desc' ? `-${sortConfig.key}` : sortConfig.key;
            }

            const params: {
                search: string;
                page: number;
                page_size: number;
                ordering: string;
                is_staff?: boolean;
                is_active?: boolean;
            } = {
                search: debouncedSearchQuery,
                page,
                page_size: PAGE_SIZE,
                ordering
            };

            if (roleFilter !== 'all') {
                params.is_staff = roleFilter === 'admin';
            }
            if (statusFilter !== 'all') {
                params.is_active = statusFilter === 'active';
            }

            const response = await usersApi.getUsers(params);

            if ('results' in response && Array.isArray(response.results)) {
                setUsers(response.results);
                setPagination({
                    next: response.next,
                    previous: response.previous,
                    count: response.count
                });
            } else if (Array.isArray(response)) {
                setUsers(response as User[]);
                setPagination({
                    next: null,
                    previous: null,
                    count: (response as User[]).length
                });
            }

            try {
                const statsData = await usersApi.getStats();
                setStats(statsData);
            } catch (error) {
                console.error("Failed to fetch user stats", error);
            }

        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, sortConfig, debouncedSearchQuery, roleFilter, statusFilter]);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            fetchAllData();
        }
    }, [isAuthenticated, loading, user, router, fetchAllData]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setPage(1);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setOpenActionMenuId(null);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await usersApi.deleteUser(userToDelete.id);
            await fetchAllData();
            setUserToDelete(null);
        } catch (error) {
            console.error("Failed to delete user", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to delete user.",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRoleSelection = (user: User, targetRole: 'user' | 'admin' | 'superuser') => {
        const currentRole = user.is_superuser ? 'superuser' : user.is_staff ? 'admin' : 'user';
        if (currentRole === targetRole) return;
        setRoleConfirmation({ user, targetRole, currentRole });
        setOpenActionMenuId(null);
    };

    const confirmRoleChange = async () => {
        if (!roleConfirmation) return;

        setIsToggling(true);
        try {
            const { user, targetRole } = roleConfirmation;

            if (targetRole === 'user') {
                if (user.is_superuser) await usersApi.removeSuperuser(user.id);
                if (user.is_staff) await usersApi.removeAdmin(user.id);
            } else if (targetRole === 'admin') {
                if (user.is_superuser) await usersApi.removeSuperuser(user.id);
                if (!user.is_staff) await usersApi.makeAdmin(user.id);
            } else if (targetRole === 'superuser') {
                if (!user.is_superuser) await usersApi.makeSuperuser(user.id);
            }

            await fetchAllData();
            const statsData = await usersApi.getStats();
            setStats(statsData);

        } catch (error) {
            console.error("Failed to update user role", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to update user role.",
                type: "error",
            });
        } finally {
            setIsToggling(false);
            setRoleConfirmation(null);
        }
    };

    const confirmStatusChange = async () => {
        if (!statusConfirmation) return;
        setIsToggling(true);
        try {
            await usersApi.toggleUserStatus(statusConfirmation.user.id, !statusConfirmation.user.is_active);
            await fetchAllData();
            const statsData = await usersApi.getStats();
            setStats(statsData);
        } catch (e) {
            console.error("Failed", e);
        } finally {
            setIsToggling(false);
            setStatusConfirmation(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading || (isLoading && users.length === 0)) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-[#0e4d80] animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <UserIcon className="h-8 w-8 text-[#0e4d80]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFB] pb-20">
            {/* Hero Section */}
            <div className="relative bg-[#0e4d80] text-white overflow-hidden rounded-[2.5rem] shadow-2xl mb-12 mx-4 mt-4">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-istok uppercase tracking-wider">
                            <Shield className="w-4 h-4" />
                            <span>System Administration</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-koulen uppercase tracking-wide leading-tight">
                            User <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Management</span>
                        </h1>
                        <p className="font-istok text-blue-100 text-lg max-w-xl">
                            Oversee user accounts, roles, and access permissions.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full md:w-auto">
                        <div
                            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl"
                        >
                            <div className="text-3xl font-koulen">{stats.total_users}</div>
                            <div className="text-xs font-istok uppercase tracking-wider opacity-80">Total Users</div>
                        </div>
                        <div
                            className="bg-green-500/20 backdrop-blur-md border border-green-400/30 p-4 rounded-3xl"
                        >
                            <div className="text-3xl font-koulen text-green-300">{stats.active_users}</div>
                            <div className="text-xs font-istok uppercase tracking-wider opacity-80 text-green-100">Active</div>
                        </div>
                        <div
                            className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 p-4 rounded-3xl"
                        >
                            <div className="text-3xl font-koulen text-blue-300">{stats.admin_users}</div>
                            <div className="text-xs font-istok uppercase tracking-wider opacity-80 text-blue-100">Admins</div>
                        </div>
                        <div
                            className="bg-purple-500/20 backdrop-blur-md border border-purple-400/30 p-4 rounded-3xl"
                        >
                            <div className="text-3xl font-koulen text-purple-300">{stats.superuser_users}</div>
                            <div className="text-xs font-istok uppercase tracking-wider opacity-80 text-purple-100">Superusers</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 md:px-8 space-y-6">

                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 sticky top-4 z-20">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#0e4d80] transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#0e4d80] focus:ring-0 sm:text-sm transition-all font-istok font-bold text-[#0e4d80]"
                            placeholder="SEARCH USERS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {isLoading && (
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <Loader2 className="w-4 h-4 animate-spin text-[#0e4d80]" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 relative">
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`p-3 rounded-2xl flex items-center gap-2 transition-all border ${isFilterOpen || roleFilter !== 'all' || statusFilter !== 'all' ? 'bg-[#0e4d80] text-white border-[#0e4d80]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                            >
                                <Filter className="w-5 h-5" />
                                {(roleFilter !== 'all' || statusFilter !== 'all') && (
                                    <span className="bg-white text-[#0e4d80] text-[10px] font-bold px-1.5 rounded-full">
                                        {(roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
                                    </span>
                                )}
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-30 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-koulen text-[#0e4d80] text-sm uppercase tracking-wide mb-2">Role</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setRoleFilter('all')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-istok transition-colors ${roleFilter === 'all' ? 'bg-[#0e4d80] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    All
                                                </button>
                                                <button
                                                    onClick={() => setRoleFilter('admin')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-istok transition-colors ${roleFilter === 'admin' ? 'bg-[#0e4d80] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    Admin
                                                </button>
                                                <button
                                                    onClick={() => setRoleFilter('user')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-istok transition-colors ${roleFilter === 'user' ? 'bg-[#0e4d80] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    User
                                                </button>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-100" />

                                        <div>
                                            <h4 className="font-koulen text-[#0e4d80] text-sm uppercase tracking-wide mb-2">Status</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setStatusFilter('all')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-istok transition-colors ${statusFilter === 'all' ? 'bg-[#0e4d80] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    All
                                                </button>
                                                <button
                                                    onClick={() => setStatusFilter('active')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-istok transition-colors ${statusFilter === 'active' ? 'bg-[#0e4d80] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    Active
                                                </button>
                                                <button
                                                    onClick={() => setStatusFilter('inactive')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-istok transition-colors ${statusFilter === 'inactive' ? 'bg-[#0e4d80] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    Inactive
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={() => {
                                                    setRoleFilter('all');
                                                    setStatusFilter('all');
                                                    setIsFilterOpen(false);
                                                }}
                                                className="w-full py-2 rounded-xl text-xs font-bold font-istok text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>

                                    {/* Close backdrop */}
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsFilterOpen(false)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Users Table */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-5 text-left">
                                        <button
                                            onClick={() => handleSort('username')}
                                            className="group flex items-center gap-2 font-koulen text-gray-400 uppercase tracking-wider text-lg hover:text-[#0e4d80] transition-colors"
                                        >
                                            User
                                            <SortIcon columnKey="username" sortConfig={sortConfig} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-left">
                                        <button
                                            onClick={() => handleSort('email')}
                                            className="group flex items-center gap-2 font-koulen text-gray-400 uppercase tracking-wider text-lg hover:text-[#0e4d80] transition-colors"
                                        >
                                            Contact
                                            <SortIcon columnKey="email" sortConfig={sortConfig} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-left font-koulen text-gray-400 uppercase tracking-wider text-lg">
                                        Role
                                    </th>
                                    <th className="px-6 py-5 text-center font-koulen text-gray-400 uppercase tracking-wider text-lg">
                                        Status
                                    </th>
                                    <th className="px-6 py-5 text-right font-koulen text-gray-400 uppercase tracking-wider text-lg">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <UserIcon className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="font-istok text-lg">No users found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((targetUser) => {
                                        const isSelf = targetUser.id === user?.id;
                                        return (
                                            <tr
                                                key={targetUser.id}
                                                className="group hover:bg-blue-50/30 transition-colors"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[#0e4d80] font-koulen text-lg shadow-inner">
                                                            {targetUser.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-koulen text-xl text-[#0e4d80] leading-none mb-1 group-hover:translate-x-1 transition-transform">
                                                                {targetUser.username}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-istok font-bold text-gray-400 uppercase tracking-wider">
                                                                <Calendar className="w-3 h-3" />
                                                                {targetUser.date_joined ? formatDate(targetUser.date_joined) : 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 font-istok font-bold text-gray-700">
                                                            <Mail className="w-3 h-3 text-gray-400" />
                                                            {targetUser.email}
                                                        </div>
                                                        <span className="text-xs font-istok text-gray-400 pl-5">
                                                            {targetUser.first_name} {targetUser.last_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex gap-2">
                                                        {targetUser.is_superuser && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-200 shadow-sm">
                                                                <Crown className="w-3 h-3" /> Superuser
                                                            </span>
                                                        )}
                                                        {targetUser.is_staff && !targetUser.is_superuser && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-[#0e4d80] border border-blue-200 shadow-sm">
                                                                <Shield className="w-3 h-3" /> Admin
                                                            </span>
                                                        )}
                                                        {!targetUser.is_staff && !targetUser.is_superuser && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
                                                                User
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <button
                                                        onClick={() => !isSelf && setStatusConfirmation({ user: targetUser })}
                                                        disabled={isToggling || isSelf}
                                                        className={`
                                                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300
                                                            ${targetUser.is_active
                                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:shadow-md'
                                                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:shadow-md'}
                                                             ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}
                                                        `}
                                                    >
                                                        {targetUser.is_active ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3" />
                                                                <span>Active</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Ban className="w-3 h-3" />
                                                                <span>Inactive</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-5 text-right relative">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setOpenActionMenuId(openActionMenuId === targetUser.id ? null : targetUser.id)}
                                                            className={`p-2 rounded-full transition-all ${openActionMenuId === targetUser.id ? 'bg-[#0e4d80] text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-[#0e4d80]'}`}
                                                        >
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>

                                                        {/* Actions Dropdown */}
                                                        {openActionMenuId === targetUser.id && (
                                                            <div className="absolute right-12 top-1/2 -translate-y-1/2 z-50 min-w-[160px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-left animate-scaleIn origin-right">
                                                                <div className="p-1">
                                                                    {!isSelf && (
                                                                        <>
                                                                            <div className="px-3 py-2 text-[10px] font-istok font-bold text-gray-400 uppercase tracking-widest">
                                                                                Change Role
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleRoleSelection(targetUser, 'user')}
                                                                                disabled={!targetUser.is_staff && !targetUser.is_superuser}
                                                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-2"
                                                                            >
                                                                                <span>User</span>
                                                                                {!targetUser.is_staff && !targetUser.is_superuser && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRoleSelection(targetUser, 'admin')}
                                                                                disabled={targetUser.is_staff && !targetUser.is_superuser}
                                                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-2"
                                                                            >
                                                                                <span>Admin</span>
                                                                                {targetUser.is_staff && !targetUser.is_superuser && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRoleSelection(targetUser, 'superuser')}
                                                                                disabled={!user?.is_superuser || targetUser.is_superuser}
                                                                                className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-2"
                                                                            >
                                                                                <span>Superuser</span>
                                                                                {targetUser.is_superuser && <CheckCircle className="w-3 h-3 text-purple-500" />}
                                                                            </button>
                                                                            <div className="h-px bg-gray-100 my-1" />
                                                                            <button
                                                                                onClick={() => handleDeleteClick(targetUser)}
                                                                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold"
                                                                            >
                                                                                Delete User
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination - Pastel Sport Style */}
                {pagination.count > 0 && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <div className="text-xs font-istok font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
                            Showing <span className="text-[#0e4d80]">{((page - 1) * PAGE_SIZE) + 1}</span> to <span className="text-[#0e4d80]">{Math.min(page * PAGE_SIZE, pagination.count)}</span> of{' '}
                            <span className="text-[#0e4d80]">{pagination.count}</span> results
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={!pagination.previous}
                                className="p-2 rounded-full bg-gray-50 text-[#0e4d80] disabled:opacity-30 hover:bg-[#0e4d80] hover:text-white transition-all disabled:hover:bg-gray-50 disabled:hover:text-[#0e4d80]"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="px-4 py-2 rounded-2xl bg-[#0e4d80]/5 text-[#0e4d80] font-koulen text-lg min-w-[3rem] text-center">
                                {page}
                            </span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!pagination.next}
                                className="p-2 rounded-full bg-gray-50 text-[#0e4d80] disabled:opacity-30 hover:bg-[#0e4d80] hover:text-white transition-all disabled:hover:bg-gray-50 disabled:hover:text-[#0e4d80]"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={!!userToDelete}
                onCancel={() => setUserToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete user "${userToDelete?.username || ''}"? This action cannot be undone.`}
                confirmText="Delete User"
                isLoading={isDeleting}
                variant="danger"
            />
            {roleConfirmation && (
                <ConfirmationModal
                    isOpen={true}
                    onCancel={() => setRoleConfirmation(null)}
                    onConfirm={confirmRoleChange}
                    title="Change User Role"
                    message={
                        roleConfirmation.targetRole === 'admin'
                            ? `Are you sure you want to promote "${roleConfirmation.user.username}" to ADMIN? They will have access to the dashboard.`
                            : roleConfirmation.targetRole === 'superuser'
                                ? `Are you sure you want to promote "${roleConfirmation.user.username}" to SUPERUSER? They will have full control.`
                                : `Are you sure you want to demote "${roleConfirmation.user.username}" to USER? They will lose admin access.`
                    }
                    confirmText="Change Role"
                    variant={roleConfirmation.targetRole === 'user' ? "danger" : "default"}
                />
            )}
            {statusConfirmation && (
                <ConfirmationModal
                    isOpen={true}
                    onCancel={() => setStatusConfirmation(null)}
                    onConfirm={confirmStatusChange}
                    title={statusConfirmation.user.is_active ? "Deactivate User" : "Activate User"}
                    message={
                        statusConfirmation.user.is_active
                            ? `Are you sure you want to deactivate "${statusConfirmation.user.username}"? They will not be able to login.`
                            : `Are you sure you want to activate "${statusConfirmation.user.username}"?`
                    }
                    confirmText={statusConfirmation.user.is_active ? "Deactivate" : "Activate"}
                    variant={statusConfirmation.user.is_active ? "danger" : "default"}
                />
            )}
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
