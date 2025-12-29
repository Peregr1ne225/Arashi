"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Product, Category } from "@/app/types";
import { getImageUrl } from "@/app/lib/utils/image";

interface ProductFormProps {
    initialData?: Product;
    categories: Category[];
    onSubmit: (formData: FormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ProductForm({
    initialData,
    categories,
    onSubmit,
    onCancel,
    isLoading = false,
}: ProductFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price.toString() || "");
    const [discount, setDiscount] = useState(initialData?.discount?.toString() || "");
    const [stock, setStock] = useState(initialData?.stock.toString() || "");
    const [categoryId, setCategoryId] = useState(
        initialData?.category_id?.toString() ||
        (initialData?.category?.id?.toString() || "")
    ); // Handle both flat ID and nested object

    // Image State
    const [existingImages, setExistingImages] = useState<string[]>(
        initialData?.images || (initialData?.image ? [initialData.image] : [])
    );
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    // Sync with initialData changes
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            setPrice(initialData.price.toString());
            setDiscount(initialData.discount ? initialData.discount.toString() : "");
            setStock(initialData.stock.toString());
            setCategoryId(
                initialData.category_id?.toString() ||
                (initialData.category?.id?.toString() || "")
            );
            setExistingImages(initialData.images || (initialData.image ? [initialData.image] : []));
            setNewFiles([]);
            setNewPreviews([]);
        } else {
            // Reset
            setName("");
            setDescription("");
            setPrice("");
            setDiscount("");
            setStock("");
            setCategoryId("");
            setExistingImages([]);
            setNewFiles([]);
            setNewPreviews([]);
        }
    }, [initialData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileList = Array.from(files);
            setNewFiles((prev) => [...prev, ...fileList]);

            // Create previews
            const previews = fileList.map(file => URL.createObjectURL(file));
            setNewPreviews((prev) => [...prev, ...previews]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
        setNewPreviews(prev => {
            // Revoke URL to avoid memory leak
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    // Note: We don't implement removing existing images (from backend) in this form yet
    // because API requires a separate endpoint or complex logic (delete vs update).
    // For now, only adding new images is supported.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !categoryId) {
            alert("Please fill in all required fields (Name, Price, Category)");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("discount", discount);
        formData.append("stock", stock);
        formData.append("category_id", categoryId);

        // Append new images
        newFiles.forEach((file) => {
            formData.append("uploaded_images", file);
        });

        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                </label>

                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Existing Images */}
                    {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative h-32 w-full border rounded role-img">
                            <Image
                                src={getImageUrl(url)}
                                alt={`Existing ${index}`}
                                fill
                                className="object-cover rounded"
                            />
                        </div>
                    ))}

                    {/* New Previews */}
                    {newPreviews.map((url, index) => (
                        <div key={`new-${index}`} className="relative h-32 w-full border rounded border-blue-500">
                            <Image
                                src={url}
                                alt={`New ${index}`}
                                fill
                                className="object-cover rounded"
                            />
                            <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                            >
                                X
                            </button>
                        </div>
                    ))}

                    {/* Upload Button */}
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 h-32"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-gray-500 mt-2">Add Images</span>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Product Name *
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                    Category *
                </label>
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
                    <label className="block text-sm font-medium text-gray-700">
                        Price *
                    </label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                            ฿
                        </span>
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
                    <label className="block text-sm font-medium text-gray-700">
                        Stock
                    </label>
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
                <label className="block text-sm font-medium text-gray-700">
                    Description
                </label>
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
                    onClick={onCancel}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
