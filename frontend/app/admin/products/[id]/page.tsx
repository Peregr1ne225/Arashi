"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { productsApi, categoriesApi } from "@/app/lib/api/client";
import { Product, Category } from "@/app/types";
import { getImageUrl } from "@/app/lib/utils/image";

// Unwrap params for server/client components
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [productId, setProductId] = useState<number | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [stock, setStock] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Unwrap params
        params.then((p) => setProductId(parseInt(p.id)));
    }, [params]);

    useEffect(() => {
        if (!loading && productId) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            fetchData(productId);
        }
    }, [isAuthenticated, loading, user, router, productId]);

    const fetchData = async (id: number) => {
        try {
            const [product, cats] = await Promise.all([
                productsApi.getProduct(id),
                categoriesApi.getCategories(),
            ]);

            setName(product.name);
            setDescription(product.description);
            setPrice(product.price.toString());
            setDiscount(product.discount ? product.discount.toString() : "");
            setStock(product.stock.toString());
            // Handle category ID: product.category might be object or ID. 
            // types/index.ts says product.category is Category object, category_id is number.
            // But API response might vary. Let's safe check.
            if (product.category_id) setCategoryId(product.category_id.toString());
            else if (product.category && typeof product.category === 'object') setCategoryId(product.category.id.toString());

            setCurrentImageUrl(product.image || product.image_url || null);
            setCategories(cats); // cats is Category[] array directly
        } catch (error) {
            console.error("Failed to fetch data", error);
            alert("Failed to load product");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId) return;

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("discount", discount);
            formData.append("stock", stock);
            formData.append("category_id", categoryId);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            await productsApi.updateProduct(productId, formData);
            router.push("/admin/products");
        } catch (error) {
            console.error("Failed to update product", error);
            alert("Failed to update product");
        } finally {
            setIsSubmitting(false);
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
            <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

            <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Image
                        </label>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview || currentImageUrl ? (
                                <div className="relative h-48 w-full">
                                    <Image
                                        src={imagePreview || getImageUrl(currentImageUrl)}
                                        alt="Preview"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <p>Click to upload image</p>
                                    <p className="text-xs mt-1">JPG, PNG up to 5MB</p>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category *</label>
                        <select
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price, Discount & Stock */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price *</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">฿</span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                            <div className="relative mt-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 pr-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                />
                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
