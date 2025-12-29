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
    const [price, setPrice] = useState(
        (initialData?.originalPrice ?? initialData?.price)?.toString() || ""
    );
    const [discount, setDiscount] = useState(initialData?.discount?.toString() || "");
    const [stock, setStock] = useState(initialData?.stock.toString() || "");
    const [categoryId, setCategoryId] = useState(
        initialData?.category_id?.toString() ||
        (initialData?.category?.id?.toString() || "")
    ); // Handle both flat ID and nested object

    // Image State
    // Format: { id?: number, url: string }
    const [existingImages, setExistingImages] = useState<{ id?: number; url: string }[]>(
        initialData?.images_data?.map(img => ({ id: img.id, url: img.image })) ||
        (initialData?.images?.map(url => ({ url })) || []) ||
        (initialData?.image ? [{ url: initialData.image }] : [])
    );
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    // Sync with initialData changes
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            // Use originalPrice (base price) if available, otherwise use price
            const basePrice = initialData.originalPrice !== undefined
                ? initialData.originalPrice
                : initialData.price;
            setPrice(basePrice.toString());
            setDiscount(initialData.discount ? initialData.discount.toString() : "");
            setStock(initialData.stock.toString());
            setCategoryId(
                initialData.category_id?.toString() ||
                (initialData.category?.id?.toString() || "")
            );
            setExistingImages(
                initialData.images_data?.map(img => ({ id: img.id, url: img.image })) ||
                (initialData?.images?.map(url => ({ url })) || []) ||
                (initialData?.image ? [{ url: initialData.image }] : [])
            );
            setDeletedImageIds([]);
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
            setDeletedImageIds([]);
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

    // Remove existing image
    const removeExistingImage = (index: number) => {
        const image = existingImages[index];
        if (image.id) {
            setDeletedImageIds(prev => [...prev, image.id!]);
        }
        setExistingImages(prev => prev.filter((_, i) => i !== index));
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

        // Append deleted image IDs
        deletedImageIds.forEach((id) => {
            formData.append("deleted_image_ids", id.toString());
        });

        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-neutral-900 border border-white/10 p-6 md:p-8 skew-box shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            {/* Image Upload */}
            <div className="border-b border-white/10 pb-8">
                <label className="block text-sm font-black uppercase italic tracking-widest text-accent mb-4">
                    Product Visuals //
                </label>

                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Existing Images */}
                    {existingImages.map((img, index) => (
                        <div key={`existing-${img.url || index}`} className="relative h-32 w-full border border-white/20 skew-box-sm overflow-hidden group">
                            <Image
                                src={getImageUrl(img.url)}
                                alt={`Existing ${index}`}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold uppercase tracking-wider">Existing</span>
                            </div>
                            {img.id && (
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(index)}
                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 hover:bg-red-700 transition-colors z-10 skew-box-sm opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}

                    {/* New Previews */}
                    {newPreviews.map((url, index) => (
                        <div key={`new-${index}`} className="relative h-32 w-full border border-accent skew-box-sm overflow-hidden group">
                            <Image
                                src={url}
                                alt={`New ${index}`}
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 hover:bg-red-700 transition-colors z-10 skew-box-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    {/* Upload Button */}
                    <div
                        className="border-2 border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-accent transition-all cursor-pointer h-32 flex flex-col items-center justify-center group skew-box-sm"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 group-hover:text-accent transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-white transition-colors">Add Image //</span>
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

            {/* Main Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Product Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/20 text-white placeholder-gray-600 focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none transition-all"
                        placeholder="ENTER PRODUCT NAME..."
                    />
                </div>

                {/* Category */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Category *
                    </label>
                    <div className="relative">
                        <select
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none appearance-none transition-all custom-select"
                        >
                            <option value="">Select Category...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-accent">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing & Logic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Price (฿) *
                    </label>
                    <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none transition-all"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Discount (%)</label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none transition-all"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Stock Level
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none transition-all"
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Description
                </label>
                <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/20 text-white placeholder-gray-600 focus:border-accent focus:ring-1 focus:ring-accent skew-box font-medium text-sm leading-relaxed outline-none transition-all resize-none"
                    placeholder="Describe the gear specs..."
                />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-3 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors skew-box font-bold uppercase tracking-wider text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-10 py-3 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "SAVING..." : "SAVE GEAR //"}
                </button>
            </div>
        </form>
    );
}
