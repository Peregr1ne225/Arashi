"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cmsApi, HeroImage } from "@/app/lib/api/client";
import { Trash2, Upload, Plus } from "lucide-react";
import DeleteHeroModal from "@/app/components/admin/hero/DeleteHeroModal";

export default function AdminHeroPage() {
    const [images, setImages] = useState<HeroImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<HeroImage | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const data = await cmsApi.getHeroImages(false); // Fetch all (admin)
            // Sort by order
            setImages(data.sort((a, b) => a.order - b.order));
        } catch (error) {
            console.error("Failed to load hero images:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", e.target.files[0]);
        // Default order to end of list
        const maxOrder = images.length > 0 ? Math.max(...images.map(i => i.order)) : -1;
        formData.append("order", String(maxOrder + 1));
        formData.append("is_active", "true");

        try {
            await cmsApi.uploadHeroImage(formData);
            await fetchImages();
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
            e.target.value = ""; // Reset input
        }
    };

    const handleDelete = (image: HeroImage) => {
        setImageToDelete(image);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;

        setIsDeleting(true);
        try {
            await cmsApi.deleteHeroImage(imageToDelete.id);
            setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
            setIsDeleteModalOpen(false);
            setImageToDelete(null);
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete image");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleActive = async (image: HeroImage) => {
        try {
            await cmsApi.updateHeroImage(image.id, { is_active: !image.is_active });
            setImages(prev => prev.map(img => img.id === image.id ? { ...img, is_active: !img.is_active } : img));
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const handleOrderChange = async (image: HeroImage, newOrder: number) => {
        try {
            await cmsApi.updateHeroImage(image.id, { order: newOrder });
            // Ideally we'd re-fetch or re-sort locally
            fetchImages();
        } catch (error) {
            console.error("Reorder failed:", error);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-koulen text-4xl tracking-wide text-[#0e4d80]">
                        Hero <span className="text-[#D2042D]">Manager</span>
                    </h1>
                    <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">
                        Manage Hero Section Images
                    </p>
                </div>
                <div className="relative">
                    <input
                        type="file"
                        id="hero-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="hero-upload"
                        className="flex items-center justify-center gap-2 cursor-pointer font-istok text-[11px] uppercase tracking-widest font-bold px-6 py-3 bg-linear-to-b from-[#0e4d80] to-[#D2042D] text-white hover:brightness-110 hover:shadow-xl hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 rounded-full shadow-lg shadow-black/10"
                    >
                        {isUploading ? (
                            <span className="animate-pulse">Uploading...</span>
                        ) : (
                            <>
                                <Plus size={18} />
                                <span>Add Image</span>
                            </>
                        )}
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((img) => (
                    <div key={img.id} className={`bg-white rounded-2xl border ${img.is_active ? 'border-gray-200' : 'border-gray-200 opacity-75'} shadow-sm overflow-hidden group`}>
                        <div className="relative aspect-video bg-gray-100">
                            <Image
                                src={img.image}
                                alt={img.title || "Hero Banner"}
                                fill
                                className={`object-cover ${!img.is_active && 'grayscale'}`}
                            />
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(img)}
                                    className="bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors cursor-pointer"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Order</label>
                                    <input
                                        type="number"
                                        value={img.order}
                                        onChange={(e) => handleOrderChange(img, parseInt(e.target.value) || 0)}
                                        className="w-16 h-8 text-sm font-bold text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Status</label>
                                    <button
                                        onClick={() => handleToggleActive(img)}
                                        className={`h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${img.is_active
                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        {img.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {images.length === 0 && !isLoading && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <Upload size={48} className="mb-4 opacity-50" />
                        <p className="font-semibold">No hero images found.</p>
                        <p className="text-sm">Upload an image to get started.</p>
                    </div>
                )}
            </div>

            <DeleteHeroModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                imageTitle={imageToDelete?.title}
            />
        </div>
    );
}
