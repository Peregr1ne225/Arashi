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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Category Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    + Create New Category
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-10 w-10 relative bg-gray-100 rounded">
                                        {category.image && (
                                            <Image
                                                src={getImageUrl(category.image)}
                                                alt={category.name}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {category.parent ? `ID: ${category.parent}` : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(category)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">
                                {editingCategory ? "Edit Category" : "Create Category"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <div className="relative h-32 w-full">
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-sm">
                                                <p>Click to upload</p>
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Parent Category</label>
                                    <select
                                        value={parentId}
                                        onChange={(e) => setParentId(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    >
                                        <option value="">None (Top Level)</option>
                                        {categories
                                            .filter(c => c.id !== editingCategory?.id) // Prevent selecting self as parent
                                            .map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-600 py-2 px-4 rounded-md text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Saving..." : "Save"}
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
