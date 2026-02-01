"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cmsApi, HeroImage } from "@/app/lib/api/client";
import { Trash2, Upload, Plus } from "lucide-react";
import DeleteHeroModal from "@/app/components/admin/hero/DeleteHeroModal";
import MessageModal from "@/app/components/ui/MessageModal";

export default function AdminHeroPage() {
    const [images, setImages] = useState<HeroImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<HeroImage | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Content State
    const [isSavingContent, setIsSavingContent] = useState(false);
    const [heroContent, setHeroContent] = useState({
        smallText: "NEW COLLECTION 2026",
        headingLine1: "CHASE THE",
        headingHighlight: "UNSEEN",
        button1Text: "Go To Shop",
        button1Link: "/products",
        button2Text: "View New",
        button2Link: "/new",
    });

    // Message Modal State
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

    useEffect(() => {
        fetchImages();
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const data = await cmsApi.getSiteContent("homepage_hero");
            if (data && data.content) {
                setHeroContent((prev) => ({ ...prev, ...data.content }));
            }
        } catch (error) {
            console.error("Failed to fetch hero content:", error);
        }
    };

    const handleContentSave = async () => {
        setIsSavingContent(true);
        try {
            await cmsApi.updateSiteContent("homepage_hero", heroContent);
            setMessageModal({
                isOpen: true,
                title: "Success",
                message: "Hero content updated successfully!",
                type: "success",
            });
        } catch (error) {
            console.error("Failed to save content", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to save content. Please try again.",
                type: "error",
            });
        } finally {
            setIsSavingContent(false);
        }
    };

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
            setMessageModal({
                isOpen: true,
                title: "Success",
                message: "Image uploaded successfully!",
                type: "success",
            });
        } catch (error) {
            console.error("Upload failed:", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to upload image.",
                type: "error",
            });
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
            setMessageModal({
                isOpen: true,
                title: "Deleted",
                message: "Hero image deleted successfully.",
                type: "success",
            });
        } catch (error) {
            console.error("Delete failed:", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to delete image.",
                type: "error",
            });
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
                        Hero <span className="text-[#0e4d80]/60">Manager</span>
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
                        className="flex items-center justify-center gap-2 cursor-pointer font-istok text-[11px] uppercase tracking-widest font-bold px-8 py-3 bg-[#0e4d80] text-white hover:brightness-110 hover:shadow-xl hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 rounded-full shadow-lg shadow-black/10"
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

            {/* Hero Text Configuration */}
            <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-koulen text-2xl text-[#0e4d80]">Text Configuration</h2>
                    <button
                        onClick={handleContentSave}
                        disabled={isSavingContent}
                        className="px-6 py-2 bg-[#0e4d80] text-white rounded-full font-istok text-xs font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                        {isSavingContent ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wide">Headings</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Small Top Text</label>
                            <input
                                type="text"
                                value={heroContent.smallText}
                                onChange={(e) => setHeroContent({ ...heroContent, smallText: e.target.value })}
                                className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Main Heading Line 1</label>
                            <input
                                type="text"
                                value={heroContent.headingLine1}
                                onChange={(e) => setHeroContent({ ...heroContent, headingLine1: e.target.value })}
                                className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Highlighted Text</label>
                            <input
                                type="text"
                                value={heroContent.headingHighlight}
                                onChange={(e) => setHeroContent({ ...heroContent, headingHighlight: e.target.value })}
                                className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wide">Buttons</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Button 1 Text</label>
                                <input
                                    type="text"
                                    value={heroContent.button1Text}
                                    onChange={(e) => setHeroContent({ ...heroContent, button1Text: e.target.value })}
                                    className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Button 1 Link</label>
                                <input
                                    type="text"
                                    value={heroContent.button1Link}
                                    onChange={(e) => setHeroContent({ ...heroContent, button1Link: e.target.value })}
                                    className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Button 2 Text</label>
                                <input
                                    type="text"
                                    value={heroContent.button2Text}
                                    onChange={(e) => setHeroContent({ ...heroContent, button2Text: e.target.value })}
                                    className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Button 2 Link</label>
                                <input
                                    type="text"
                                    value={heroContent.button2Link}
                                    onChange={(e) => setHeroContent({ ...heroContent, button2Link: e.target.value })}
                                    className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((img) => (
                    <div key={img.id} className={`bg-white rounded-4xl border ${img.is_active ? 'border-gray-100' : 'border-gray-100 opacity-75'} shadow-sm overflow-hidden group transition-all hover:shadow-md`}>
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
                                        className="w-16 h-10 text-sm font-bold text-center border border-gray-100 bg-gray-50 rounded-2xl focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Status</label>
                                    <button
                                        onClick={() => handleToggleActive(img)}
                                        className={`h-10 px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border transition-all ${img.is_active
                                            ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                                            : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'
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
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-4xl bg-gray-50/50">
                        <Upload size={48} className="mb-4 text-[#0e4d80]/20" />
                        <p className="font-koulen text-xl text-gray-500 uppercase tracking-wide">No hero banners found</p>
                        <p className="font-istok text-xs uppercase tracking-widest mt-1">Upload an image to get started</p>
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

            <MessageModal
                isOpen={messageModal.isOpen}
                title={messageModal.title}
                message={messageModal.message}
                type={messageModal.type}
                onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
            />
        </div>
    );
}
