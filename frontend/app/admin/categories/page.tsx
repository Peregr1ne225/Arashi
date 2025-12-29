"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { categoriesApi } from "@/app/lib/api/client";
import { Category } from "@/app/types";
import { getImageUrl } from "@/app/lib/utils/image";
import { revalidateCategories } from "@/app/lib/actions";

export default function AdminCategoriesPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentId, setParentId] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
                router.push("/");
                return;
            }
            fetchCategories();
        }
    }, [isAuthenticated, loading, user, router]);

    const fetchCategories = async () => {
        try {
            const data = await categoriesApi.getCategories({ revalidate: 0 });
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (category: Category | null = null) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
            setDescription(category.description || "");
            setParentId(category.parent ? category.parent.toString() : "");
            setImagePreview(category.image ? getImageUrl(category.image) : null);
        } else {
            setEditingCategory(null);
            setName("");
            setDescription("");
            setParentId("");
            setImagePreview(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
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
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            if (parentId) {
                formData.append("parent", parentId);
            }
            if (imageFile) {
                formData.append("image", imageFile);
            }

            if (editingCategory) {
                const updated = await categoriesApi.updateCategory(editingCategory.id, formData);
                setCategories(categories.map(c => c.id === updated.id ? updated : c));
            } else {
                const created = await categoriesApi.createCategory(formData);
                setCategories([...categories, created]);
            }

            await revalidateCategories();
            setIsModalOpen(false);
            // Refresh to ensure full consistency (optional but recommended for hierachy)
            fetchCategories();
        } catch (error) {
            console.error("Failed to save category", error);
            alert("Failed to save category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure? Deleting a category will delete its image and might affect products.")) {
            try {
                await categoriesApi.deleteCategory(id);
                setCategories(categories.filter(c => c.id !== id));
                await revalidateCategories();
            } catch (error) {
                console.error("Failed to delete category", error);
                alert("Failed to delete category");
            }
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
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Category Management</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mt-1">Organize Team Divisions</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.3)] text-xs"
                >
                    + New Division
                </button>
            </div>

            <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-black/40">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Image</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Slug</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase italic tracking-widest text-accent">Parent</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase italic tracking-widest text-accent">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-white/5">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-10 w-10 relative bg-black/50 skew-box-sm border border-white/10 overflow-hidden">
                                            {category.image ? (
                                                <Image
                                                    src={getImageUrl(category.image)}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-600 text-[10px]">N/A</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold uppercase tracking-wide text-white group-hover:text-accent transition-colors">{category.name}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">{category.slug}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {category.parent ? <span className="bg-white/10 px-2 py-1 rounded-sm text-white">ID: {category.parent}</span> : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => handleOpenModal(category)}
                                                className="text-gray-400 hover:text-accent transition-colors"
                                            >
                                                <span className="sr-only">Edit</span>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-white/10 w-full max-w-lg skew-box shadow-2xl relative">
                        <div className="p-8">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6 border-b border-white/10 pb-4">
                                {editingCategory ? "Edit Division" : "New Division"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Cover Image</label>
                                    <div
                                        className="border-2 border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-accent transition-all cursor-pointer h-40 flex flex-col items-center justify-center group skew-box-sm relative overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <div className="relative h-full w-full">
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="bg-black/50 text-white px-2 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 group-hover:text-accent transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-white transition-colors">Select Visual //</span>
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

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none transition-all"
                                        placeholder="DIVISION NAME..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 bg-black border border-white/20 text-white placeholder-gray-600 focus:border-accent focus:ring-1 focus:ring-accent skew-box font-medium text-sm leading-relaxed outline-none transition-all resize-none"
                                        rows={3}
                                        placeholder="Brief description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Parent Division</label>
                                    <div className="relative">
                                        <select
                                            value={parentId}
                                            onChange={(e) => setParentId(e.target.value)}
                                            className="w-full px-4 py-3 bg-black border border-white/20 text-white focus:border-accent focus:ring-1 focus:ring-accent skew-box font-bold uppercase tracking-wide outline-none appearance-none transition-all custom-select"
                                        >
                                            <option value="">None (Top Level)</option>
                                            {categories
                                                .filter(c => c.id !== editingCategory?.id)
                                                .map((cat) => (
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

                                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors skew-box font-bold uppercase tracking-wider text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-2 bg-accent text-black font-black uppercase italic tracking-widest hover:bg-white hover:text-black transition-all skew-box shadow-[0_0_15px_rgba(204,255,0,0.4)] text-xs disabled:opacity-50"
                                    >
                                        {isSubmitting ? "SAVING..." : "SAVE"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
