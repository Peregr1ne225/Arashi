"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { categoriesApi } from "@/app/lib/api/client";
import { Category } from "@/app/types/category";
import { getImageUrl } from "@/app/lib/utils/image";
import { revalidateCategories } from "@/app/lib/actions";
import CategoryForm from "@/app/components/admin/CategoryForm";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import { Search } from "lucide-react";
import { SortIcon } from "@/app/components/admin/SortIcon";

export default function AdminCategoriesPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Memoized filtered and sorted categories for the table
    const filteredAndSortedCategories = useMemo(() => {
        let result = [...categories];

        // Search filtering
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.slug.toLowerCase().includes(q) ||
                (c.parent_name && c.parent_name.toLowerCase().includes(q))
            );
        }

        // Sorting
        if (sortConfig) {
            const key = sortConfig.key as keyof Category;
            result.sort((a, b) => {
                const valA = a[key];
                const valB = b[key];

                if (valA === undefined || valB === undefined || valA === null || valB === null) {
                    if (valA === valB) return 0;
                    return valA === null || valA === undefined ? 1 : -1;
                }

                if (typeof valA === 'string' && typeof valB === 'string') {
                    const comparison = valA.localeCompare(valB);
                    return sortConfig.direction === 'asc' ? comparison : -comparison;
                }

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
                }

                return 0;
            });
        }

        return result;
    }, [categories, searchQuery, sortConfig]);

    // Memoized Top 5 Categories
    const topCategories = useMemo(() => {
        return [...categories]
            .sort((a, b) => (b.product_count || 0) - (a.product_count || 0))
            .slice(0, 5);
    }, [categories]);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await categoriesApi.getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
    };

    const handleOpenForm = (category: Category | null = null) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingCategory(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            if (editingCategory) {
                await categoriesApi.updateCategory(editingCategory.id, formData);
            } else {
                await categoriesApi.createCategory(formData);
            }
            await revalidateCategories();
            fetchAllData();
            handleCloseForm();
        } catch (error) {
            console.error("Failed to save category", error);
            alert("Failed to save category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await categoriesApi.deleteCategory(categoryToDelete.id);
            await revalidateCategories();
            fetchAllData();
            setCategoryToDelete(null);
        } catch (error) {
            console.error("Failed to delete category", error);
            alert("Failed to delete category");
        }
    };

    // Helper to get full path (client-side approximation using allCategories)
    const getCategoryPath = (cat: Category | null): string => {
        if (!cat) return "";
        let path = cat.name;
        let current = cat;
        let safety = 0;
        while (current.parent && safety < 100) {
            const parent = categories.find((c) => c.id === current.parent);
            if (parent) {
                path = `${parent.name} > ${path}`;
                current = parent;
            } else {
                break;
            }
            safety++;
        }
        return path;
    };

    if (loading || (isLoading && categories.length === 0)) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="pt-8 flex flex-col space-y-8 animate-in fade-in duration-500">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-8">
                <div>
                    <h2 className="font-koulen text-4xl tracking-wide text-[#0e4d80]">
                        Taxonomy <span className="text-[#0e4d80]/60">Manager</span>
                    </h2>
                    <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">
                        Manage Categories
                    </p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="font-istok text-[11px] uppercase tracking-widest font-bold px-8 py-3 bg-[#0e4d80] text-white hover:opacity-90 transition-all rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                    + New Category
                </button>
            </div>

            {/* Top 5 Categories */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {topCategories.map((category, index) => (
                    <div
                        key={category.id}
                        className="card-sport p-4 flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-2xl font-koulen text-[#0e4d80]">
                                #{index + 1}
                            </span>
                            {category.image && (
                                <div className="h-6 w-6 rounded border border-gray-200 overflow-hidden bg-gray-50">
                                    <Image
                                        src={getImageUrl(category.image)}
                                        alt={category.name}
                                        width={24}
                                        height={24}
                                        className="object-contain"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3
                                className="font-istok font-bold text-sm text-gray-900 truncate"
                                title={category.name}
                            >
                                {category.name}
                            </h3>
                            <p className="font-istok text-xs text-gray-500 uppercase tracking-wider mt-1">
                                {category.product_count || 0} Products
                            </p>
                        </div>
                        <div className="w-full bg-gray-100 h-1 mt-3 rounded-full overflow-hidden">
                            <div
                                className="bg-linear-to-r from-[#0e4d80] to-[#0a3a60] h-full rounded-full"
                                style={{
                                    width: `${Math.min(100, ((category.product_count || 0) / (topCategories[0]?.product_count || 1)) * 100)}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
                {topCategories.length === 0 && (
                    <div className="col-span-5 bg-gray-50 p-6 rounded-lg border border-gray-100 text-center text-gray-500 font-istok">
                        No categories available yet.
                    </div>
                )}
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0e4d80] focus:border-[#0047AB] sm:text-sm transition-all shadow-sm"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card-sport overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-white sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                Visual
                            </th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('name')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    Designation <SortIcon columnKey="name" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('product_count')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    Products <SortIcon columnKey="product_count" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('parent')}>
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    Hierarchy <SortIcon columnKey="parent" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                Control
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredAndSortedCategories.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-12 text-center text-gray-400 font-istok"
                                >
                                    No categories found matching your search.
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedCategories.map((category) => {
                                return (
                                    <tr
                                        key={category.id}
                                        className="hover:bg-gray-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-12 w-12 relative bg-white border border-gray-100 rounded-2xl overflow-hidden p-1 shadow-sm group-hover:border-[#0e4d80]/30 transition-all">
                                                {category.image ? (
                                                    <Image
                                                        src={getImageUrl(category.image)}
                                                        alt={category.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 font-bold uppercase tracking-wider">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-koulen text-lg text-black tracking-wide uppercase group-hover:text-[#0e4d80] transition-colors">
                                                    {category.name}
                                                </span>
                                                <span className="font-mono text-[10px] text-gray-400">
                                                    /{category.slug}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-istok">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${(category.product_count || 0) > 0
                                                    ? "bg-[#0e4d80]/5 text-[#0e4d80] border border-[#0e4d80]/10"
                                                    : "bg-gray-100 text-gray-400"
                                                    }`}
                                            >
                                                {category.product_count || 0} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {category.parent_name ? (
                                                <div className="flex flex-col">
                                                    <span className="font-istok text-[9px] text-gray-400 uppercase tracking-wider mb-1">
                                                        Child of
                                                    </span>
                                                    <span className="font-bold text-xs text-gray-700">
                                                        {category.parent_name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="font-istok text-[9px] text-gray-400 uppercase tracking-widest border border-gray-200 px-2 py-1 rounded bg-gray-50">
                                                    Top Level
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenForm(category)}
                                                    className="text-[#0e4d80] hover:text-[#0a3a60] font-bold uppercase text-xs tracking-wider"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(category)}
                                                    className="text-[#0e4d80]/50 hover:text-[#0e4d80] font-bold uppercase text-xs tracking-wider ml-2"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Category Form Modal */}
            {
                isFormOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <CategoryForm
                            key={editingCategory ? editingCategory.id : "create"}
                            initialData={editingCategory}
                            categories={categories} // Use all categories source
                            onSubmit={handleSubmit}
                            onCancel={handleCloseForm}
                            isLoading={isSubmitting}
                        />
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onCancel={() => setCategoryToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${getCategoryPath(categoryToDelete)}"? all related products will be affected.`}
                confirmText="Delete Category"
            />
        </div >
    );
}
