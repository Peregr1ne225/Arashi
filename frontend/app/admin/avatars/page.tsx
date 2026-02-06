"use client";

import { useState, useEffect, useCallback } from "react";
import { visualizationApi } from "@/app/lib/api/client";
import { Avatar, AvatarAsset } from "@/app/types/visualization";
import {
    Trash2,
    Plus,
    Package,
    Shirt,
    Box,
    Layers,
    UploadCloud,
    X,
    Scissors,
    AlertCircle,
    Monitor
} from "lucide-react";
import MessageModal from "@/app/components/ui/MessageModal";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";


function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function AdminAvatarsPage() {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

    // Modals
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: async () => { },
    });

    // Forms
    const [isCreatingAvatar, setIsCreatingAvatar] = useState(false);
    const [isAddingAsset, setIsAddingAsset] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);

    const fetchAvatars = useCallback(async () => {
        setLoading(true);
        try {
            const data = await visualizationApi.getAvatars();
            setAvatars(data);
            if (selectedAvatar) {
                // Refresh selection
                const updated = data.find(a => a.id === selectedAvatar.id);
                if (updated) setSelectedAvatar(updated);
                else setSelectedAvatar(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [selectedAvatar]);

    useEffect(() => {
        fetchAvatars();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCreateAvatar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploadLoading(true);
        const formData = new FormData(e.currentTarget);
        const file = formData.get("base_file") as File;

        if (file && !file.name.endsWith(".glb")) {
            setMessageModal({
                isOpen: true,
                title: "Invalid File",
                message: "Only .glb files are allowed for 3D models.",
                type: "error"
            });
            setUploadLoading(false);
            return;
        }

        try {
            await visualizationApi.createAvatar(formData);
            await fetchAvatars();
            setIsCreatingAvatar(false);
            setMessageModal({
                isOpen: true,
                title: "Success",
                message: "Avatar created successfully!",
                type: "success"
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to create avatar";
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: errorMessage,
                type: "error"
            });
        } finally {
            setUploadLoading(false);
        }
    };

    const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedAvatar) return;

        setUploadLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append("avatar", String(selectedAvatar.id));
        const file = formData.get("file") as File;

        if (file && !file.name.endsWith(".glb")) {
            setMessageModal({
                isOpen: true,
                title: "Invalid File",
                message: "Only .glb files are allowed for assets.",
                type: "error"
            });
            setUploadLoading(false);
            return;
        }

        try {
            await visualizationApi.createAvatarAsset(formData);
            await fetchAvatars();
            setIsAddingAsset(false);
            setMessageModal({
                isOpen: true,
                title: "Success",
                message: "Asset added successfully!",
                type: "success"
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add asset";
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: errorMessage,
                type: "error"
            });
        } finally {
            setUploadLoading(false);
        }
    };

    const promptDeleteAvatar = (avatar: Avatar) => {
        setDeleteModal({
            isOpen: true,
            title: "Delete Avatar",
            message: `Are you sure you want to delete "${avatar.name}"? This will vanish all associated files permanently.`,
            onConfirm: async () => {
                try {
                    await visualizationApi.deleteAvatar(avatar.slug);
                    await fetchAvatars();
                    if (selectedAvatar?.id === avatar.id) setSelectedAvatar(null);
                    setDeleteModal(prev => ({ ...prev, isOpen: false }));
                    setMessageModal({
                        isOpen: true,
                        title: "Success",
                        message: "Avatar deleted successfully.",
                        type: "success"
                    });
                } catch (error) {
                    console.error(error);
                    setMessageModal({
                        isOpen: true,
                        title: "Error",
                        message: "Failed to delete avatar.",
                        type: "error"
                    });
                }
            }
        });
    };

    const promptDeleteAsset = (asset: AvatarAsset) => {
        setDeleteModal({
            isOpen: true,
            title: "Delete Asset",
            message: `Are you sure you want to delete "${asset.name}"?`,
            onConfirm: async () => {
                try {
                    await visualizationApi.deleteAvatarAsset(asset.id);
                    await fetchAvatars();
                    setDeleteModal(prev => ({ ...prev, isOpen: false }));
                    setMessageModal({
                        isOpen: true,
                        title: "Success",
                        message: "Asset deleted successfully.",
                        type: "success"
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        });
    };

    if (loading && avatars.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-[#0e4d80] animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Box className="h-8 w-8 text-[#0e4d80]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFB] pb-20">
            {/* Hero Section */}
            <div className="relative bg-[#0e4d80] text-white overflow-hidden rounded-[2.5rem] shadow-2xl mb-12 mx-4 mt-4">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-istok uppercase tracking-wider">
                            <Monitor className="w-4 h-4" />
                            <span>Visualization Engine</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-koulen uppercase tracking-wide leading-tight">
                            3D <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Models</span>
                        </h1>
                        <p className="font-istok text-blue-100 text-lg max-w-xl">
                            Manage avatars and clothing assets for the configurator.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreatingAvatar(true)}
                        className="flex items-center gap-3 bg-white text-[#0e4d80] px-8 py-4 rounded-full font-koulen text-xl tracking-wide hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        <Plus className="w-6 h-6" />
                        Create New Avatar
                    </button>
                </div>
            </div>

            <div className="px-4 md:px-8 flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Column: List of Avatars */}
                <div className="w-full lg:w-1/3 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-koulen text-[#0e4d80] uppercase tracking-wide">Available Models</h2>
                        <span className="bg-[#0e4d80]/10 text-[#0e4d80] px-3 py-1 rounded-full text-xs font-bold font-istok">{avatars.length} Models</span>
                    </div>

                    <div className="space-y-4">
                        {avatars.map(avatar => (
                            <div
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar)}
                                className={cn(
                                    "group relative p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden",
                                    selectedAvatar?.id === avatar.id
                                        ? "bg-[#0e4d80] text-white border-[#0e4d80] shadow-xl scale-[1.02]"
                                        : "bg-white border-gray-100 text-gray-800 hover:border-gray-200 hover:shadow-lg hover:-translate-y-1"
                                )}
                            >
                                <div className="flex justify-between items-start z-10 relative">
                                    <div>
                                        <h3 className="text-2xl font-koulen tracking-wide">{avatar.name}</h3>
                                        <div className="flex items-center gap-2 mt-2 opacity-80">
                                            <Layers className="w-4 h-4" />
                                            <p className="text-xs font-istok uppercase tracking-wider font-bold">{avatar.assets.length} assets linked</p>
                                        </div>
                                    </div>
                                    <div className="relative w-12 h-12">
                                        <div className={cn(
                                            "absolute inset-0 rounded-2xl flex items-center justify-center transition-all duration-300",
                                            selectedAvatar?.id === avatar.id ? "bg-white/20" : "bg-gray-50",
                                            "group-hover:opacity-0 group-hover:scale-90"
                                        )}>
                                            <Package className={cn("w-6 h-6", selectedAvatar?.id === avatar.id ? "text-white" : "text-[#0e4d80]")} />
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); promptDeleteAvatar(avatar); }}
                                            className={cn(
                                                "absolute inset-0 flex items-center justify-center rounded-2xl transition-all duration-300 z-20",
                                                "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                                                selectedAvatar?.id === avatar.id
                                                    ? "bg-red-500/20 text-red-100 hover:bg-red-500/30"
                                                    : "bg-red-50 text-red-500 hover:bg-red-100"
                                            )}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Decorative BG */}
                                {selectedAvatar?.id === avatar.id && (
                                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                                )}
                            </div>
                        ))}

                        {avatars.length === 0 && (
                            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50">
                                <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-400 font-istok">No avatars found.</p>
                                <p className="text-gray-400 text-xs mt-2">Create one to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Selected Avatar Details */}
                <div className="w-full lg:w-2/3">
                    <>
                        {selectedAvatar ? (
                            <div
                                key={selectedAvatar.id}
                                className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 min-h-[600px] relative overflow-hidden animate-in fade-in slide-in-from-right-5 duration-300"
                            >
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-50 -z-10 pointer-events-none" />

                                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e4d80]/5 text-[#0e4d80] text-[10px] font-bold uppercase tracking-widest border border-[#0e4d80]/10 mb-3">
                                            <Package className="w-3 h-3" />
                                            Active Selection
                                        </div>
                                        <h2 className="text-5xl font-koulen text-[#0e4d80] uppercase tracking-wide leading-none">{selectedAvatar.name}</h2>
                                        <p className="text-gray-500 font-istok mt-2 max-w-md text-sm leading-relaxed">
                                            {selectedAvatar.description || "Manage assets associated with this avatar base model."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingAsset(true)}
                                        className="flex items-center gap-2 bg-[#0e4d80] text-white px-6 py-3 rounded-2xl font-bold font-istok uppercase tracking-wider text-xs hover:bg-[#0b3d66] transition-all shadow-lg hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5"
                                    >
                                        <Plus size={16} />
                                        Add Asset
                                    </button>
                                </div>

                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="font-koulen text-xl text-gray-400 uppercase tracking-wide flex items-center gap-2">
                                        <Scissors className="w-5 h-5" />
                                        Asset Inventory
                                    </h3>
                                    <div className="h-px flex-1 bg-gray-100 ml-6" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {selectedAvatar.assets.length === 0 && (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                                            <Layers className="w-16 h-16 mb-4 opacity-20" />
                                            <p className="font-istok text-lg font-bold">No assets uploaded yet</p>
                                            <p className="text-xs mt-2 max-w-xs mx-auto">Upload clothing items like shirts or pants to verify compatibility with this avatar.</p>
                                        </div>
                                    )}
                                    {selectedAvatar.assets.map((asset, idx) => (
                                        <div
                                            key={asset.id}
                                            className="group relative flex items-center gap-4 p-4 border border-gray-100 bg-white rounded-3xl hover:border-[#0e4d80]/20 hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                                            style={{ animationDelay: `${idx * 0.05}s` }}
                                        >
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                                                asset.type === 'shirt' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                            )}>
                                                <Shirt size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-koulen text-lg text-gray-800 truncate">{asset.name}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md w-fit mt-1">{asset.type}</div>
                                            </div>
                                            <button
                                                onClick={() => promptDeleteAsset(asset)}
                                                className="absolute top-2 right-2 p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50/50 animate-in fade-in slide-in-from-right-5 duration-300">
                                <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                                    <Box size={48} className="text-gray-300" />
                                </div>
                                <h3 className="font-koulen text-3xl text-gray-300 uppercase tracking-wide mb-2">Select a Model</h3>
                                <p className="font-istok text-sm max-w-xs text-center">Click on an avatar from the list to manage its assets and configuration.</p>
                            </div>
                        )}
                    </>
                </div>
            </div>

            {/* Create Avatar Modal - Styled */}
            {isCreatingAvatar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-[#FDFDFB] rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-koulen text-[#0e4d80] uppercase tracking-wide">Create Avatar</h2>
                            <button onClick={() => setIsCreatingAvatar(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAvatar} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold font-istok uppercase tracking-widest text-gray-500 mb-2">Avatar Name</label>
                                <input
                                    name="name"
                                    required
                                    className="w-full p-4 bg-white rounded-2xl border-2 border-gray-100 focus:border-[#0e4d80] focus:ring-0 outline-none font-istok transition-all"
                                    placeholder="e.g. Standard Male"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold font-istok uppercase tracking-widest text-gray-500 mb-2">Base Model (GLB)</label>
                                <div className="relative group cursor-pointer">
                                    <div className="absolute inset-0 bg-[#0e4d80]/5 rounded-2xl border-2 border-dashed border-[#0e4d80]/20 group-hover:border-[#0e4d80] transition-colors pointer-events-none" />
                                    <input
                                        type="file"
                                        name="base_file"
                                        required
                                        accept=".glb"
                                        className="relative z-10 w-full p-8 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:bg-[#0e4d80] file:text-white hover:file:bg-[#0b3d66] cursor-pointer"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-sm pointer-events-none">
                                        <UploadCloud className="w-5 h-5 text-[#0e4d80]" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wide flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Only .glb files supported
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsCreatingAvatar(false)} className="px-6 py-3 text-gray-500 font-bold font-istok uppercase tracking-wider text-xs hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={uploadLoading} className="px-8 py-3 bg-[#0e4d80] text-white rounded-xl font-bold font-istok uppercase tracking-wider text-xs hover:bg-[#0b3d66] disabled:opacity-50 shadow-lg hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5 transition-all">
                                    {uploadLoading ? "Processing..." : "Create Avatar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Asset Modal - Styled */}
            {isAddingAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-[#FDFDFB] rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-koulen text-[#0e4d80] uppercase tracking-wide">Add Asset</h2>
                            <button onClick={() => setIsAddingAsset(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddAsset} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold font-istok uppercase tracking-widest text-gray-500 mb-2">Asset Name</label>
                                <input
                                    name="name"
                                    required
                                    className="w-full p-4 bg-white rounded-2xl border-2 border-gray-100 focus:border-[#0e4d80] focus:ring-0 outline-none font-istok transition-all"
                                    placeholder="e.g. Graphic Tee Red"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold font-istok uppercase tracking-widest text-gray-500 mb-2">Type</label>
                                <div className="relative">
                                    <select name="type" className="w-full p-4 bg-white rounded-2xl border-2 border-gray-100 focus:border-[#0e4d80] focus:ring-0 outline-none font-istok transition-all appearance-none cursor-pointer">
                                        <option value="shirt">👕 Shirt / Top</option>
                                        <option value="pant">👖 Pant / Bottom</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        ▼
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold font-istok uppercase tracking-widest text-gray-500 mb-2">Asset Model (GLB)</label>
                                <div className="relative group cursor-pointer">
                                    <div className="absolute inset-0 bg-[#0e4d80]/5 rounded-2xl border-2 border-dashed border-[#0e4d80]/20 group-hover:border-[#0e4d80] transition-colors pointer-events-none" />
                                    <input
                                        type="file"
                                        name="file"
                                        required
                                        accept=".glb"
                                        className="relative z-10 w-full p-8 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:bg-[#0e4d80] file:text-white hover:file:bg-[#0b3d66] cursor-pointer"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-sm pointer-events-none">
                                        <UploadCloud className="w-5 h-5 text-[#0e4d80]" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wide flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Only .glb files supported
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsAddingAsset(false)} className="px-6 py-3 text-gray-500 font-bold font-istok uppercase tracking-wider text-xs hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={uploadLoading} className="px-8 py-3 bg-[#0e4d80] text-white rounded-xl font-bold font-istok uppercase tracking-wider text-xs hover:bg-[#0b3d66] disabled:opacity-50 shadow-lg hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5 transition-all">
                                    {uploadLoading ? "Uploading..." : "Add Asset"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <MessageModal
                isOpen={messageModal.isOpen}
                title={messageModal.title}
                message={messageModal.message}
                type={messageModal.type}
                onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                title={deleteModal.title}
                message={deleteModal.message}
                onConfirm={deleteModal.onConfirm}
                onCancel={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                variant="danger"
            />
        </div>
    );
}
