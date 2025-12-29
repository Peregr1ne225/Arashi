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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Edit Product</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Update Gear Specifications</p>
                </div>
            </div>

            <div className="bg-neutral-900 border border-white/10 skew-box shadow-[0_0_30px_rgba(0,0,0,0.3)] p-8 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                            Product Visual
                        </label>
                        <div
                            className="border-2 border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-accent transition-all cursor-pointer h-64 flex flex-col items-center justify-center group skew-box-sm relative overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview || currentImageUrl ? (
                                <div className="relative h-full w-full">
                                    <Image
                                        src={imagePreview || getImageUrl(currentImageUrl)}
                                        alt="Preview"
                                        fill
                                        className="object-contain p-4"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
                                        <span className="bg-accent text-black px-3 py-1 text-xs font-black uppercase italic tracking-widest skew-box-sm">Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 group-hover:text-accent transition-colors mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div className="text-gray-500 text-center font-bold uppercase tracking-wide group-hover:text-white transition-colors">
                                        <p className="text-sm">Upload Visual</p>
                                        <p className="text-[10px] text-gray-600 mt-1">JPG, PNG up to 5MB</p>
                                    </div>
                                </>
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
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Product Name <span className="text-accent">*</span></label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none transition-all placeholder-gray-700"
                            placeholder="ENTER PRODUCT NAME..."
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Category <span className="text-accent">*</span></label>
                        <div className="relative">
                            <select
                                required
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none appearance-none transition-all custom-select"
                            >
                                <option value="">Select Division...</option>
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

                    {/* Price, Discount & Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Price <span className="text-accent">*</span></label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-accent font-bold">฿</span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-mono font-bold outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Discount (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="w-full pl-4 pr-8 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-mono font-bold outline-none transition-all"
                                    placeholder="0"
                                />
                                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 font-bold">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Stock</label>
                            <input
                                type="number"
                                min="0"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-mono font-bold outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</label>
                        <textarea
                            rows={6}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/20 text-white placeholder-gray-600 focus:border-accent focus:ring-1 focus:ring-accent skew-box font-medium text-sm leading-relaxed outline-none transition-all resize-none"
                            placeholder="Enter detailed product specifications..."
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors skew-box font-bold uppercase tracking-wider text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.4)] text-xs disabled:opacity-50"
                        >
                            {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
