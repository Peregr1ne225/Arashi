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
        <div className="pt-4 space-y-8">
            {/* Hero Section */}
            <div className="relative bg-[#0e4d80] text-white overflow-hidden rounded-[2.5rem] shadow-2xl mb-8 mx-4 mt-2">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold font-istok uppercase tracking-widest mb-4 text-blue-100">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                Content Manager
                            </div>
                            <h1 className="text-5xl md:text-7xl font-koulen tracking-wider text-white drop-shadow-lg leading-none">
                                HERO <span className="text-blue-200">BANNERS</span>
                            </h1>
                            <p className="font-istok text-blue-100 text-sm md:text-base max-w-xl mt-4 leading-relaxed opacity-90">
                                Manage the main homepage visual experience. Upload high-quality banners and configure the welcoming text to engage visitors.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                                <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">Total Banners</p>
                                <p className="text-3xl font-koulen">{images.length}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                                <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-1">Active</p>
                                <p className="text-3xl font-koulen">{images.filter(img => img.is_active).length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Toolbar */}
            <div className="mx-4 flex justify-between items-center">
                <h2 className="font-koulen text-2xl text-[#0e4d80] uppercase tracking-wide">Configuration & Assets</h2>
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
                        className="flex items-center justify-center gap-2 cursor-pointer font-istok text-xs uppercase tracking-widest font-bold px-8 py-4 bg-[#0e4d80] text-white hover:bg-[#0b3d66] hover:shadow-xl hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 rounded-[1.25rem] shadow-lg shadow-black/5"
                    >
                        {isUploading ? (
                            <span className="animate-pulse">Uploading...</span>
                        ) : (
                            <>
                                <Plus size={18} />
                                <span>Add New Banner</span>
                            </>
                        )}
                    </label>
                </div>
            </div>

            {/* Text Configuration */}
            <div className="mx-4 bg-white rounded-[2.5rem] shadow-xl border border-gray-100/50 p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-8 border-b border-gray-100 gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 rounded-2xl bg-blue-50 text-[#0e4d80]">
                                <Upload size={24} />
                            </div>
                            <h2 className="font-koulen text-3xl text-[#0e4d80] uppercase tracking-wide">Text Configuration</h2>
                        </div>
                        <p className="font-istok text-gray-400 text-sm max-w-lg">Customize the headings and buttons displayed on the main hero banner.</p>
                    </div>
                    <button
                        onClick={handleContentSave}
                        disabled={isSavingContent}
                        className="px-8 py-3 bg-[#0e4d80] text-white rounded-xl font-bold font-istok uppercase tracking-wider text-xs hover:bg-[#0b3d66] hover:shadow-lg hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5 disabled:opacity-50 transition-all"
                    >
                        {isSavingContent ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0e4d80]" />
                            <h3 className="font-koulen text-xl text-gray-400 uppercase tracking-wide">Headings</h3>
                        </div>

                        <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#0e4d80] transition-colors">Small Top Text</label>
                            <input
                                type="text"
                                value={heroContent.smallText}
                                onChange={(e) => setHeroContent({ ...heroContent, smallText: e.target.value })}
                                className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-base font-medium focus:border-[#0e4d80] focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#0e4d80] transition-colors">Main Heading Line 1</label>
                            <input
                                type="text"
                                value={heroContent.headingLine1}
                                onChange={(e) => setHeroContent({ ...heroContent, headingLine1: e.target.value })}
                                className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-base font-medium focus:border-[#0e4d80] focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#0e4d80] transition-colors">Highlighted Text</label>
                            <input
                                type="text"
                                value={heroContent.headingHighlight}
                                onChange={(e) => setHeroContent({ ...heroContent, headingHighlight: e.target.value })}
                                className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-base font-medium focus:border-[#0e4d80] focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0e4d80]" />
                            <h3 className="font-koulen text-xl text-gray-400 uppercase tracking-wide">Call to Actions</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#0e4d80] transition-colors">Button 1 Text</label>
                                <input
                                    type="text"
                                    value={heroContent.button1Text}
                                    onChange={(e) => setHeroContent({ ...heroContent, button1Text: e.target.value })}
                                    className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-sm font-medium focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#0e4d80] transition-colors">Button 1 Link</label>
                                <input
                                    type="text"
                                    value={heroContent.button1Link}
                                    onChange={(e) => setHeroContent({ ...heroContent, button1Link: e.target.value })}
                                    className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-sm font-medium focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#0e4d80] transition-colors">Button 2 Text</label>
                                <input
                                    type="text"
                                    value={heroContent.button2Text}
                                    onChange={(e) => setHeroContent({ ...heroContent, button2Text: e.target.value })}
                                    className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-sm font-medium focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#0e4d80] transition-colors">Button 2 Link</label>
                                <input
                                    type="text"
                                    value={heroContent.button2Link}
                                    onChange={(e) => setHeroContent({ ...heroContent, button2Link: e.target.value })}
                                    className="w-full h-12 px-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 text-sm font-medium focus:border-[#0e4d80] focus:ring-0 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                {images.map((img) => (
                    <div key={img.id} className={`bg-white rounded-[2rem] border ${img.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'} shadow-sm overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-[#0e4d80]/5 hover:-translate-y-1`}>
                        <div className="relative aspect-video bg-gray-100 overflow-hidden">
                            <Image
                                src={img.image}
                                alt={img.title || "Hero Banner"}
                                fill
                                className={`object-cover transition-transform duration-700 group-hover:scale-105 ${!img.is_active && 'grayscale'}`}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <button
                                    onClick={() => handleDelete(img)}
                                    className="bg-white text-red-500 p-2.5 rounded-full shadow-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {!img.is_active && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="px-4 py-2 bg-black/50 text-white text-xs font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
                                        Inactive
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="flex items-end justify-between gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={img.order}
                                        onChange={(e) => handleOrderChange(img, parseInt(e.target.value) || 0)}
                                        className="w-20 h-10 px-3 text-sm font-bold text-center border-2 border-gray-100 bg-gray-50 rounded-xl focus:border-[#0e4d80] focus:ring-0 outline-none transition-all text-[#0e4d80]"
                                    />
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                                    <button
                                        onClick={() => handleToggleActive(img)}
                                        className={`h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all shadow-sm ${img.is_active
                                            ? 'bg-[#0e4d80] text-white border-[#0e4d80] hover:bg-[#0b3d66] hover:border-[#0b3d66]'
                                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-500'
                                            }`}
                                    >
                                        {img.is_active ? 'Active' : 'Hidden'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Upload Empty State / Placeholder */}
                <div className="relative group cursor-pointer h-full min-h-[300px]">
                    <input
                        type="file"
                        id="hero-upload-card"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="hero-upload-card"
                        className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 border-3 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50 hover:bg-blue-50/30 hover:border-[#0e4d80]/30 hover:text-[#0e4d80] transition-all duration-300 cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 text-gray-300 group-hover:text-[#0e4d80]">
                            {isUploading ? <Upload className="animate-bounce" size={24} /> : <Plus size={32} />}
                        </div>
                        <p className="font-koulen text-xl uppercase tracking-wide opacity-60 group-hover:opacity-100 transition-opacity">
                            {isUploading ? "Uploading..." : "Add New Banner"}
                        </p>
                        <p className="font-istok text-xs uppercase tracking-widest mt-2 opacity-40 group-hover:opacity-80 transition-opacity">
                            Drag & Drop or Click
                        </p>
                    </label>
                </div>
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
