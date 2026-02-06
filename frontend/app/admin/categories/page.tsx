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
import MessageModal from "@/app/components/ui/MessageModal";
import { SortIcon } from "@/app/components/admin/SortIcon";
import {
    Search,
    Layers,
    Plus,
    Edit2,
    Trash2,
    FolderTree,
    Package,
    ChevronRight,
    Filter
} from "lucide-react";

export default function AdminCategoriesPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'toplevel'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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

        // Type filtering
        if (filterType === 'toplevel') {
            result = result.filter(c => !c.parent);
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
    }, [categories, searchQuery, sortConfig, filterType]);

    // Memoized Top 5 Categories
    const topCategories = useMemo(() => {
        return [...categories]
            .sort((a, b) => (b.product_count || 0) - (a.product_count || 0))
            .slice(0, 4);
    }, [categories]);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

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
            setMessageModal({
                isOpen: true,
                title: "Success",
                message: editingCategory ? "Category updated successfully." : "Category created successfully.",
                type: "success"
            });
        } catch (error) {
            console.error("Failed to save category", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to save category.",
                type: "error",
            });
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
            setMessageModal({
                isOpen: true,
                title: "Success",
                message: "Category deleted successfully.",
                type: "success"
            });
        } catch (error) {
            console.error("Failed to delete category", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to delete category.",
                type: "error",
            });
        }
    };

    // Helper to get full path
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
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-[#0e4d80] animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Layers className="h-8 w-8 text-[#0e4d80]" />
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
                            <FolderTree className="w-4 h-4" />
                            <span>Catalog Structure</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-koulen uppercase tracking-wide leading-tight">
                            Category <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Manager</span>
                        </h1>
                        <p className="font-istok text-blue-100 text-lg max-w-xl">
                            Organize your product catalog with a flexible hierarchy.
                        </p>
                    </div>

                    {/* Quick Stats - Top Categories */}
                    <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                        {topCategories.map((cat) => (
                            <div
                                key={cat.id}
                                className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center gap-3 min-w-[160px]"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center p-1 shadow-sm shrink-0">
                                    {cat.image ? (
                                        <Image
                                            src={getImageUrl(cat.image)}
                                            alt={cat.name}
                                            width={24}
                                            height={24}
                                            className="object-contain w-full h-full"
                                        />
                                    ) : (
                                        <Layers className="w-5 h-5 text-[#0e4d80]" />
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-koulen text-lg truncate w-full">{cat.name}</div>
                                    <div className="text-[10px] uppercase font-istok opacity-80">{cat.product_count} Products</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 md:px-8 space-y-6">

                {/* Visual Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 sticky top-4 z-20">
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#0e4d80] transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#0e4d80] focus:ring-0 sm:text-sm transition-all font-istok font-bold text-[#0e4d80]"
                            placeholder="SEARCH CATEGORIES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`p-3 rounded-2xl flex items-center gap-2 transition-all border ${isFilterOpen || filterType !== 'all' ? 'bg-[#0e4d80] text-white border-[#0e4d80]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                            >
                                <Filter className="w-5 h-5" />
                                {filterType !== 'all' && (
                                    <span className="bg-white text-[#0e4d80] text-[10px] font-bold px-1.5 rounded-full">
                                        1
                                    </span>
                                )}
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-30 animate-in fade-in zoom-in-95 duration-200">
                                    <h4 className="font-koulen text-[#0e4d80] text-sm uppercase tracking-wide mb-2">Hierarchy Level</h4>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => setFilterType('all')}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold font-istok transition-colors text-left ${filterType === 'all' ? 'bg-[#0e4d80] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            All Categories
                                        </button>
                                        <button
                                            onClick={() => setFilterType('toplevel')}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold font-istok transition-colors text-left ${filterType === 'toplevel' ? 'bg-[#0e4d80] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            Top Level Only
                                        </button>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => {
                                                setFilterType('all');
                                                setIsFilterOpen(false);
                                            }}
                                            className="w-full py-2 rounded-xl text-xs font-bold font-istok text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            Clear Filter
                                        </button>
                                    </div>
                                    {/* Close backdrop */}
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsFilterOpen(false)} />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => handleOpenForm()}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0e4d80] text-white px-6 py-3 rounded-2xl font-istok font-bold uppercase tracking-widest text-xs hover:bg-[#0b3d66] transition-all shadow-lg hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Category</span>
                        </button>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-6 py-5 text-left font-koulen text-gray-400 uppercase tracking-wider text-lg">
                                        Visual
                                    </th>
                                    <th className="px-6 py-5 text-left">
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="group flex items-center gap-2 font-koulen text-gray-400 uppercase tracking-wider text-lg hover:text-[#0e4d80] transition-colors"
                                        >
                                            Designation
                                            <SortIcon columnKey="name" sortConfig={sortConfig} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-left">
                                        <button
                                            onClick={() => handleSort('product_count')}
                                            className="group flex items-center gap-2 font-koulen text-gray-400 uppercase tracking-wider text-lg hover:text-[#0e4d80] transition-colors"
                                        >
                                            Products
                                            <SortIcon columnKey="product_count" sortConfig={sortConfig} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-left">
                                        <button
                                            onClick={() => handleSort('parent')}
                                            className="group flex items-center gap-2 font-koulen text-gray-400 uppercase tracking-wider text-lg hover:text-[#0e4d80] transition-colors"
                                        >
                                            Hierarchy
                                            <SortIcon columnKey="parent" sortConfig={sortConfig} />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-right font-koulen text-gray-400 uppercase tracking-wider text-lg">
                                        Control
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAndSortedCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Layers className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="font-istok text-lg">No categories found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedCategories.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="group hover:bg-blue-50/30 transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="h-16 w-16 relative bg-white border border-gray-100 rounded-2xl overflow-hidden p-2 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                    {category.image ? (
                                                        <Image
                                                            src={getImageUrl(category.image)}
                                                            alt={category.name}
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <Layers className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-koulen text-xl text-[#0e4d80] uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                                                        {category.name}
                                                    </span>
                                                    <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-1">
                                                        /{category.slug}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-gray-300" />
                                                    <span className="font-istok font-bold text-gray-700">
                                                        {category.product_count || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-400 lowercase">items</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {category.parent_name ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl w-fit border border-gray-100">
                                                        <ChevronRight className="w-3 h-3 text-gray-400" />
                                                        <span className="font-bold text-gray-700">{category.parent_name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#0e4d80]/5 text-[#0e4d80] text-[10px] uppercase font-bold tracking-wider border border-[#0e4d80]/10">
                                                        Top Level
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleOpenForm(category)}
                                                        className="p-2 text-[#0e4d80] hover:bg-[#0e4d80]/10 rounded-xl transition-colors"
                                                        title="Edit Category"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(category)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Category Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleCloseForm}
                    />
                    <div className="relative z-10 w-full max-w-2xl">
                        <CategoryForm
                            key={editingCategory ? editingCategory.id : "create"}
                            initialData={editingCategory}
                            categories={categories}
                            onSubmit={handleSubmit}
                            onCancel={handleCloseForm}
                            isLoading={isSubmitting}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onCancel={() => setCategoryToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${getCategoryPath(categoryToDelete)}"? all related products will be affected.`}
                confirmText="Delete Category"
                variant="danger"
            />

            <MessageModal
                isOpen={messageModal.isOpen}
                title={messageModal.title}
                message={messageModal.message}
                type={messageModal.type}
                onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
            />
        </div >
    );
}
