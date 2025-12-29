"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { productsApi, categoriesApi } from "@/app/lib/api/client";
import { Category } from "@/app/types";
import { revalidateCategories, revalidateProducts } from "@/app/lib/actions";

export default function CreateProductPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const catFileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [stock, setStock] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCatName, setNewCatName] = useState("");
    const [newCatParent, setNewCatParent] = useState("");
    const [newCatImage, setNewCatImage] = useState<File | null>(null);
    const [newCatImagePreview, setNewCatImagePreview] = useState<string | null>(null);
    const [isCreatingCat, setIsCreatingCat] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            fetchCategories(true);
        }
    }, [isAuthenticated, loading, user, router]);

    const fetchCategories = async (forceFresh = false) => {
        try {
            const config = forceFresh ? { revalidate: 0 } : {};
            const response = await categoriesApi.getCategories(config);
            setCategories(response);
        } catch (error) {
            console.error("Failed to fetch categories", error);
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

    const handleCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewCatImage(file);
            const url = URL.createObjectURL(file);
            setNewCatImagePreview(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !categoryId) {
            alert("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("discount", discount);
            formData.append("stock", stock || "0");
            formData.append("category_id", categoryId);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            await productsApi.createProduct(formData);
            await revalidateProducts();
            router.push("/admin/products");
        } catch (error) {
            console.error("Failed to create product", error);
            alert("Failed to create product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName) return;

        setIsCreatingCat(true);
        try {
            const formData = new FormData();
            formData.append("name", newCatName);
            if (newCatParent) {
                formData.append("parent", newCatParent);
            }
            if (newCatImage) {
                formData.append("image", newCatImage);
            }

            const newCategory = await categoriesApi.createCategory(formData);

            // Optimistically update local state immediately
            setCategories((prev) => [...prev, newCategory]);
            setCategoryId(newCategory.id.toString());

            // Trigger global revalidation in background
            await revalidateCategories();

            // Still fetch fresh to be safe (optional, but good for consistency)
            fetchCategories(true);

            // Close modal and reset
            setIsModalOpen(false);
            setNewCatName("");
            setNewCatParent("");
            setNewCatImage(null);
            setNewCatImagePreview(null);
        } catch (error) {
            console.error("Failed to create category", error);
            alert("Failed to create category");
        } finally {
            setIsCreatingCat(false);
        }
    };

    if (loading) return null;

    return (
        <>
            <main className="container mx-auto px-4 py-8 flex-1">
                <h1 className="text-2xl font-bold mb-6">Create New Product</h1>

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
                                {imagePreview ? (
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={imagePreview}
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
                            <div className="flex space-x-2">
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
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-1 bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 whitespace-nowrap"
                                >
                                    + New
                                </button>
                            </div>
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
                                {isSubmitting ? "Creating..." : "Create Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Category Creation Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                            <h2 className="text-xl font-bold mb-4">Create New Category</h2>
                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Parent (Optional)</label>
                                    <select
                                        value={newCatParent}
                                        onChange={(e) => setNewCatParent(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center cursor-pointer hover:bg-gray-50"
                                        onClick={() => catFileInputRef.current?.click()}
                                    >
                                        {newCatImagePreview ? (
                                            <div className="relative h-24 w-full">
                                                <Image
                                                    src={newCatImagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-xs py-2">
                                                <p>Click to upload image</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={catFileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleCatImageChange}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingCat}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isCreatingCat ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </>
    );
}
