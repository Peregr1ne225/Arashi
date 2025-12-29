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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Product Management</h1>
                <div className="flex space-x-4">
                    <Link
                        href="/admin/categories"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Manage Categories
                    </Link>
                    <Link
                        href="/admin/products/create"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        + Create New Product
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Image
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Discount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-12 w-12 relative">
                                        <Image
                                            src={getImageUrl(product.image || product.image_url)}
                                            alt={product.name}
                                            fill
                                            sizes="48px"
                                            className="object-cover rounded"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {product.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        ID: {product.id}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.discount && product.discount > 0 ? (
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">
                                                ฿{(Number(product.price) * (1 - product.discount / 100)).toFixed(2)}
                                            </span>
                                            <span className="text-gray-500 text-xs line-through">
                                                ฿{Number(product.price).toFixed(2)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-900">
                                            ฿{Number(product.price).toFixed(2)}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.discount ? (
                                        <span className="text-red-600 font-medium">-{product.discount}%</span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {editingStockId === product.id ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                value={stockValue}
                                                onChange={(e) =>
                                                    setStockValue(parseInt(e.target.value) || 0)
                                                }
                                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                                min="0"
                                            />
                                            <button
                                                onClick={() => saveStock(product.id)}
                                                disabled={isUpdatingStock}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingStockId(null)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <span>{product.stock}</span>
                                            <button
                                                onClick={() => startEditingStock(product)}
                                                className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 px-2 py-0.5 rounded"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleStatus(product)}
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity ${product.is_active
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                            }`}
                                    >
                                        {product.is_active ? "Active" : "Inactive"}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                    Showing page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                        className="px-4 py-2 border rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                        className="px-4 py-2 border rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Edit Product Modal */}
            {
                isEditModalOpen && selectedProduct && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Edit Product: {selectedProduct.name}</h2>
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
