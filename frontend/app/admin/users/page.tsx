"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { usersApi } from "@/app/lib/api/client";
import { User } from "@/app/types/user";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import MessageModal from "@/app/components/ui/MessageModal";
import { Search, Shield, User as UserIcon, Ban, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SortIcon } from "@/app/components/admin/SortIcon";

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

    // Pagination State
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<{ next: string | null; previous: string | null; count: number }>({
        next: null,
        previous: null,
        count: 0
    });
    const PAGE_SIZE = 50;

    // Debounced search (simplistic approach for now)
    // Debounced search (simplistic approach for now)
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search change
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
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Prepare sort string for backend
            let ordering = "";
            if (sortConfig) {
                ordering = sortConfig.direction === 'desc' ? `-${sortConfig.key}` : sortConfig.key;
            }

            const response = await usersApi.getUsers({
                search: debouncedSearchQuery,
                page,
                page_size: PAGE_SIZE,
                ordering
            });

            // Handle both paginated and non-paginated responses (for backward compatibility if needed)
            if ('results' in response && Array.isArray(response.results)) {
                setUsers(response.results);
                setPagination({
                    next: response.next,
                    previous: response.previous,
                    count: response.count
                });
            } else if (Array.isArray(response)) {
                // Fallback if backend response is not paginated (though client wrapper should handle this)
                setUsers(response as User[]);
                setPagination({
                    next: null,
                    previous: null,
                    count: (response as User[]).length
                });
            }

            // Fetch stats (only on initial load or relevant changes if needed, but for now simple)
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
    }, [page, sortConfig, debouncedSearchQuery]); // Add dependencies needed for fetching

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            fetchAllData();
        }
    }, [isAuthenticated, loading, user, router, fetchAllData]); // Keep fetchAllData in dep array, but be careful of loops (useCallback handles it)

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        // Fetch directly called by useEffect when sortConfig changes, but we might want to reset page
        setPage(1);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
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
        // Determine current role
        const currentRole = user.is_superuser ? 'superuser' : user.is_staff ? 'admin' : 'user';

        if (currentRole === targetRole) return; // No change

        setRoleConfirmation({ user, targetRole, currentRole });
    };

    const confirmRoleChange = async () => {
        if (!roleConfirmation) return;

        setIsToggling(true);
        try {
            const { user, targetRole } = roleConfirmation;

            // Execute role change logic
            if (targetRole === 'user') {
                // Demote to User
                if (user.is_superuser) await usersApi.removeSuperuser(user.id);
                if (user.is_staff) await usersApi.removeAdmin(user.id);
            } else if (targetRole === 'admin') {
                // Promote/Demote to Admin
                if (user.is_superuser) await usersApi.removeSuperuser(user.id);
                if (!user.is_staff) await usersApi.makeAdmin(user.id);
            } else if (targetRole === 'superuser') {
                // Promote to Superuser
                if (!user.is_superuser) await usersApi.makeSuperuser(user.id);
                // Ideally makeSuperuser handles is_staff=True in backend, but let's trust the API for now.
            }

            // Refresh data
            await fetchAllData();
            // Refresh stats
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
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="pt-8 flex flex-col space-y-8">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="font-koulen text-4xl tracking-wide text-[#0e4d80]">
                        Users <span className="text-[#0e4d80]/60">Management</span>
                    </h1>
                    <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">
                        Manage System Users
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card-sport p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <UserIcon className="h-6 w-6 text-[#0e4d80]" />
                        <span className="text-2xl font-koulen text-[#0e4d80]">
                            {stats.total_users}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-istok font-bold text-sm text-gray-900">
                            Total Users
                        </h3>
                        <p className="font-istok text-xs text-gray-500 uppercase tracking-wider mt-1">
                            Registered accounts
                        </p>
                    </div>
                    <div className="w-full bg-gray-100 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-[#0e4d80] h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                </div>

                <div className="card-sport p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <span className="text-2xl font-koulen text-green-600">
                            {stats.active_users}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-istok font-bold text-sm text-gray-900">
                            Active Users
                        </h3>
                        <p className="font-istok text-xs text-gray-500 uppercase tracking-wider mt-1">
                            Currently active
                        </p>
                    </div>
                    <div className="w-full bg-gray-100 h-1 mt-3 rounded-full overflow-hidden">
                        <div
                            className="bg-green-600 h-full rounded-full"
                            style={{
                                width: `${stats.total_users > 0 ? (stats.active_users / stats.total_users) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="card-sport p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <Shield className="h-6 w-6 text-[#0e4d80]" />
                        <span className="text-2xl font-koulen text-[#0e4d80]">
                            {stats.admin_users}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-istok font-bold text-sm text-gray-900">
                            Admin Users
                        </h3>
                        <p className="font-istok text-xs text-gray-500 uppercase tracking-wider mt-1">
                            Staff members
                        </p>
                    </div>
                    <div className="w-full bg-gray-100 h-1 mt-3 rounded-full overflow-hidden">
                        <div
                            className="bg-[#0e4d80] h-full rounded-full"
                            style={{
                                width: `${stats.total_users > 0 ? (stats.admin_users / stats.total_users) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="card-sport p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <UserIcon className="h-6 w-6 text-purple-600" />
                        <span className="text-2xl font-koulen text-purple-600">
                            {stats.superuser_users}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-istok font-bold text-sm text-gray-900">
                            Superusers
                        </h3>
                        <p className="font-istok text-xs text-gray-500 uppercase tracking-wider mt-1">
                            Full access
                        </p>
                    </div>
                    <div className="w-full bg-gray-100 h-1 mt-3 rounded-full overflow-hidden">
                        <div
                            className="bg-purple-600 h-full rounded-full"
                            style={{
                                width: `${stats.total_users > 0 ? (stats.superuser_users / stats.total_users) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0e4d80] focus:border-[#0e4d80] sm:text-sm transition-all"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
            </div>

            {/* Table */}
            <div className="card-sport overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100 table-fixed relative">
                    <thead className="bg-white sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                            <th className="w-16 px-4 py-4 text-center font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                                ID
                            </th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('username')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                                    User <SortIcon columnKey="username" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('email')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                                    Contact <SortIcon columnKey="email" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-center font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                                Role
                            </th>
                            <th className="px-6 py-4 text-center font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                                Status
                            </th>
                            <th className="px-6 py-4 text-right font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {users.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-12 text-center text-gray-400 font-istok"
                                >
                                    No users found matching your search.
                                </td>
                            </tr>
                        ) : (
                            users.map((targetUser) => {
                                const isSelf = targetUser.id === user?.id;
                                return (
                                    <tr
                                        key={targetUser.id}
                                        className="hover:bg-gray-50/80 transition-colors group"
                                    >
                                        <td className="px-4 py-4 text-center font-mono text-xs text-gray-500">
                                            {targetUser.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-koulen text-lg text-black tracking-wide uppercase group-hover:text-[#0e4d80] transition-colors">
                                                    {targetUser.username}
                                                </span>
                                                <span className="font-istok text-xs text-gray-400">
                                                    Joined: {targetUser.date_joined ? formatDate(targetUser.date_joined) : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-istok text-sm text-gray-900">
                                                    {targetUser.email}
                                                </span>
                                                <span className="font-istok text-xs text-gray-400">
                                                    {targetUser.first_name} {targetUser.last_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap text-center">
                                            <div className="flex bg-gray-100 rounded-lg p-1 gap-1 w-fit mx-auto">
                                                <button
                                                    onClick={() => !isSelf && handleRoleSelection(targetUser, 'user')}
                                                    disabled={isToggling || isSelf}
                                                    className={`
                                px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all duration-200
                                ${!targetUser.is_staff && !targetUser.is_superuser
                                                            ? 'bg-white text-gray-800 shadow-sm'
                                                            : 'text-gray-400 hover:text-gray-600'}
                            `}
                                                >
                                                    User
                                                </button>
                                                <button
                                                    onClick={() => !isSelf && handleRoleSelection(targetUser, 'admin')}
                                                    disabled={isToggling || isSelf}
                                                    className={`
                                px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all duration-200
                                ${targetUser.is_staff && !targetUser.is_superuser
                                                            ? 'bg-white text-[#0e4d80] shadow-sm'
                                                            : 'text-gray-400 hover:text-[#0e4d80]'}
                            `}
                                                >
                                                    Admin
                                                </button>
                                                <button
                                                    onClick={() => !isSelf && handleRoleSelection(targetUser, 'superuser')}
                                                    disabled={isToggling || isSelf || !user?.is_superuser}
                                                    className={`
                                px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all duration-200 flex items-center gap-1
                                ${targetUser.is_superuser
                                                            ? 'bg-white text-purple-600 shadow-sm'
                                                            : 'text-gray-400 hover:text-purple-600'}
                                ${!user?.is_superuser ? 'opacity-30 cursor-not-allowed' : ''}
                            `}
                                                >
                                                    Super
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => !isSelf && setStatusConfirmation({ user: targetUser })}
                                                disabled={isToggling || isSelf}
                                                className={`
                            inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200
                            ${targetUser.is_active
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}
                             ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                                                title={isSelf ? "You cannot deactivate yourself" : targetUser.is_active ? "Deactivate User" : "Activate User"}
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
                                        <td className="px-6 py-6 whitespace-nowrap text-right">
                                            {!isSelf && (
                                                <button
                                                    onClick={() => handleDeleteClick(targetUser)}
                                                    disabled={isDeleting}
                                                    className="text-[#0e4d80] hover:text-[#0a3a60] font-bold uppercase text-xs tracking-wider cursor-pointer disabled:opacity-50"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                            {isSelf && (
                                                <span className="font-istok text-[9px] text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-1 rounded bg-gray-50">
                                                    Current User
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.count > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={!pagination.previous}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={!pagination.next}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 font-istok">
                                Showing <span className="font-medium">{((page - 1) * PAGE_SIZE) + 1}</span> to <span className="font-medium">{Math.min(page * PAGE_SIZE, pagination.count)}</span> of{' '}
                                <span className="font-medium">{pagination.count}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.previous}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!pagination.next}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!userToDelete}
                onCancel={() => setUserToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete user "${userToDelete?.username || ''}"? This action cannot be undone.`}
                confirmText="Delete User"
                isLoading={isDeleting}
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
