"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { productsApi, categoriesApi } from "@/app/lib/api/client";
import { Product, Category } from "@/app/types";
import { getImageUrl } from "@/app/lib/utils/image";
import ProductForm from "@/app/components/admin/ProductForm";
import { revalidateProducts } from "@/app/lib/actions";

export default function AdminProductsPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 20;

    // Edit/Stock State
    const [editingStockId, setEditingStockId] = useState<number | null>(null);
    const [stockValue, setStockValue] = useState<number>(0);
    const [isUpdatingStock, setIsUpdatingStock] = useState(false);

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
    const [isSavingProduct, setIsSavingProduct] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            fetchData(page);
        }
    }, [isAuthenticated, loading, user, router, page]);

    const fetchData = async (currentPage: number) => {
        setIsLoading(true);
        try {
            const [productsRes] = await Promise.all([
                productsApi.getProducts({ page: currentPage, page_size: PAGE_SIZE }, { revalidate: 0 }),
            ]);
            setProducts(productsRes.results);
            setTotalPages(Math.ceil(productsRes.count / PAGE_SIZE));
            // Categories will be loaded lazily when needed (edit modal)
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await productsApi.deleteProduct(id);
                setProducts(products.filter((p) => p.id !== id));
                await revalidateProducts();
            } catch (error) {
                console.error("Failed to delete product", error);
                alert("Failed to delete product");
            }
        }
    };

    // Status Toggle Logic
    const handleToggleStatus = async (product: Product) => {
        const newStatus = !product.is_active;
        try {
            // Optimistic update
            setProducts(
                products.map((p) => (p.id === product.id ? { ...p, is_active: newStatus } : p))
            );

            await productsApi.updateProduct(product.id, { is_active: newStatus });
            await revalidateProducts();
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on failure
            setProducts(
                products.map((p) => (p.id === product.id ? { ...p, is_active: !newStatus } : p))
            );
            alert("Failed to update status");
        }
    };
    const startEditingStock = (product: Product) => {
        setEditingStockId(product.id);
        setStockValue(product.stock);
    };

    const saveStock = async (id: number) => {
        setIsUpdatingStock(true);
        try {
            await productsApi.updateProduct(id, { stock: stockValue });
            setProducts(
                products.map((p) => (p.id === id ? { ...p, stock: stockValue } : p))
            );
            await revalidateProducts();
            setEditingStockId(null);
        } catch (error) {
            console.error("Failed to update stock", error);
            alert("Failed to update stock");
        } finally {
            setIsUpdatingStock(false);
        }
    };

    // Modal Logic
    const openEditModal = async (product: Product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);

        // Lazy load categories if we don't have them yet
        if (categories.length === 0) {
            try {
                const freshCategories = await categoriesApi.getCategories({ revalidate: 0 });
                setCategories(freshCategories);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        }
    };

    const closeEditModal = () => {
        setSelectedProduct(undefined);
        setIsEditModalOpen(false);
    };

    const handleUpdateProduct = async (formData: FormData) => {
        if (!selectedProduct) return;
        setIsSavingProduct(true);
        try {
            const updatedProduct = await productsApi.updateProduct(
                selectedProduct.id,
                formData
            );

            // Update the product in the local list
            setProducts(
                products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
            );
            await revalidateProducts();
            closeEditModal();
        } catch (error) {
            console.error("Failed to update product", error);
            alert("Failed to update product");
        } finally {
            setIsSavingProduct(false);
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
        <main className="container mx-auto px-4 py-8 flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Product Management</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Manage Team Assets & Gear</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Link
                        href="/admin/categories"
                        className="px-6 py-3 bg-neutral-900 border border-white/20 text-white hover:bg-white/10 transition-colors skew-box font-bold uppercase tracking-wider text-xs text-center"
                    >
                        Manage Categories
                    </Link>
                    <Link
                        href="/admin/products/create"
                        className="px-6 py-3 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.3)] text-xs text-center"
                    >
                        + Create New Gear
                    </Link>
                </div>
            </div>

            <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-black/40">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">
                                    Visual
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">
                                    Product Name
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">
                                    Price
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">
                                    Discount
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">
                                    Stock
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase italic tracking-widest text-accent">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-white/5">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-12 w-12 relative skew-box-sm overflow-hidden border border-white/10 group-hover:border-accent/50 transition-colors">
                                            <Image
                                                src={getImageUrl(product.image || product.image_url)}
                                                alt={product.name}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold uppercase tracking-wide text-white group-hover:text-accent transition-colors">
                                            {product.name}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono mt-1">
                                            ID: {product.id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {product.discount && product.discount > 0 ? (
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold">
                                                    ฿{(Number(product.price) * (1 - product.discount / 100)).toFixed(2)}
                                                </span>
                                                <span className="text-gray-500 text-xs line-through decoration-red-500">
                                                    ฿{Number(product.price).toFixed(2)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-white font-bold">
                                                ฿{Number(product.price).toFixed(2)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {product.discount ? (
                                            <span className="text-black bg-accent px-2 py-0.5 text-xs font-black uppercase italic tracking-wider skew-box-sm inline-block">
                                                -{product.discount}%
                                            </span>
                                        ) : (
                                            <span className="text-gray-600 font-mono">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {editingStockId === product.id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    value={stockValue}
                                                    onChange={(e) =>
                                                        setStockValue(parseInt(e.target.value) || 0)
                                                    }
                                                    className="w-20 bg-black border border-accent text-white px-2 py-1 text-xs skew-box-sm outline-none"
                                                    min="0"
                                                />
                                                <button
                                                    onClick={() => saveStock(product.id)}
                                                    disabled={isUpdatingStock}
                                                    className="text-accent hover:text-white transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => setEditingStockId(null)}
                                                    className="text-red-500 hover:text-white transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <span className={`font-mono font-bold ${product.stock < 10 ? 'text-red-500' : 'text-white'}`}>{product.stock}</span>
                                                <button
                                                    onClick={() => startEditingStock(product)}
                                                    className="text-gray-600 hover:text-accent group-hover:visible invisible transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(product)}
                                            className={`px-3 py-1 flex items-center justify-center text-[10px] font-black uppercase italic tracking-widest w-24 skew-box-sm transition-all border ${product.is_active
                                                ? "bg-green-900/20 text-green-500 border-green-500/50 hover:bg-green-500 hover:text-black"
                                                : "bg-red-900/20 text-red-500 border-red-500/50 hover:bg-red-500 hover:text-white"
                                                }`}
                                        >
                                            {product.is_active ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="text-gray-400 hover:text-accent transition-colors"
                                            >
                                                <span className="sr-only">Edit</span>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <span className="sr-only">Delete</span>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-8 border-t border-white/10 pt-6">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Showing page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                        className="px-6 py-2 border border-white/20 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed skew-box transition-colors"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                        className="px-6 py-2 border border-white/20 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed skew-box transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Edit Product Modal */}
            {
                isEditModalOpen && selectedProduct && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-transparent w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar">
                            <div className="p-1">
                                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                                        Edit Gear // <span className="text-accent">{selectedProduct.name}</span>
                                    </h2>
                                    <button
                                        onClick={closeEditModal}
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <ProductForm
                                    initialData={selectedProduct}
                                    categories={categories}
                                    onSubmit={handleUpdateProduct}
                                    onCancel={closeEditModal}
                                    isLoading={isSavingProduct}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
        </main >
    );
}
