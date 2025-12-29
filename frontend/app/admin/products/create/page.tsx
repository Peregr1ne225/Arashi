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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Create Product</h1>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Add New Gear to Inventory</p>
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
                                {imagePreview ? (
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={imagePreview}
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
                            <div className="flex gap-4">
                                <div className="relative flex-1">
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
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-4 bg-white/5 border border-white/20 text-accent font-black uppercase italic tracking-widest hover:bg-accent hover:text-black transition-all skew-box shadow-[0_0_10px_rgba(204,255,0,0.2)] whitespace-nowrap"
                                >
                                    + New
                                </button>
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
                                {isSubmitting ? "CREATING..." : "CREATE PRODUCT"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Category Creation Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-neutral-900 border border-white/10 w-full max-w-lg skew-box shadow-2xl relative p-8">
                            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Create Division</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handleCreateCategory} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none transition-all"
                                        placeholder="DIVISION NAME..."
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Parent Division (Optional)</label>
                                    <div className="relative">
                                        <select
                                            value={newCatParent}
                                            onChange={(e) => setNewCatParent(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none appearance-none transition-all custom-select"
                                        >
                                            <option value="">None (Top Level)</option>
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
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Division Image (Optional)</label>
                                    <div
                                        className="border-2 border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-accent transition-all cursor-pointer h-32 flex flex-col items-center justify-center group skew-box-sm relative overflow-hidden"
                                        onClick={() => catFileInputRef.current?.click()}
                                    >
                                        {newCatImagePreview ? (
                                            <div className="relative h-full w-full">
                                                <Image
                                                    src={newCatImagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="bg-black/50 text-white px-2 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Change</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 group-hover:text-accent transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-white transition-colors">Select Visual</span>
                                            </>
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
                                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors skew-box font-bold uppercase tracking-wider text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreatingCat}
                                        className="px-8 py-2 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.4)] text-xs disabled:opacity-50"
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
