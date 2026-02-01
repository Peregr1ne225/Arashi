"use client";

import { useState, useEffect, useCallback } from "react";
import { visualizationApi } from "@/app/lib/api/client";
import { Avatar, AvatarAsset } from "@/app/types/visualization";
import { Trash2, Plus, Package, Shirt } from "lucide-react";
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
                } catch (error) {
                    console.error(error);
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
                } catch (error) {
                    console.error(error);
                }
            }
        });
    };

    if (loading && avatars.length === 0) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-10 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black font-koulen text-neutral-900 tracking-tighter">
                    3D Configurator Manager
                </h1>
                <button
                    onClick={() => setIsCreatingAvatar(true)}
                    className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus size={20} />
                    New Avatar
                </button>
            </div>

            <div className="flex gap-8 items-start">
                {/* List of Avatars */}
                <div className="w-1/3 space-y-4">
                    <h2 className="text-xl font-bold mb-4 font-koulen uppercase tracking-wide text-neutral-500">Avatars</h2>
                    {avatars.map(avatar => (
                        <div
                            key={avatar.id}
                            onClick={() => setSelectedAvatar(avatar)}
                            className={cn(
                                "group relative p-6 bg-white rounded-3xl border-2 transition-all cursor-pointer hover:shadow-lg",
                                selectedAvatar?.id === avatar.id
                                    ? "border-neutral-900 shadow-md scale-[1.02]"
                                    : "border-transparent hover:border-neutral-200"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold font-koulen">{avatar.name}</h3>
                                    <p className="text-sm text-neutral-500 font-istok mt-1">{avatar.assets.length} assets</p>
                                </div>
                                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                                    <Package size={20} />
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); promptDeleteAvatar(avatar); }}
                                className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Selected Avatar Details */}
                <div className="w-2/3">
                    {selectedAvatar ? (
                        <div className="bg-white p-8 rounded-[40px] shadow-sm min-h-[500px]">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-koulen uppercase">{selectedAvatar.name}</h2>
                                    <p className="text-neutral-500">{selectedAvatar.description || "No description provided"}</p>
                                </div>
                                <button
                                    onClick={() => setIsAddingAsset(true)}
                                    className="flex items-center gap-2 border-2 border-neutral-900 text-neutral-900 px-5 py-2 rounded-full font-bold hover:bg-neutral-900 hover:text-white transition-all"
                                >
                                    <Plus size={18} />
                                    Add Asset
                                </button>
                            </div>

                            <h3 className="font-bold text-neutral-400 uppercase tracking-widest text-sm mb-4">Assets Inventory</h3>

                            <div className="grid grid-cols-2 gap-4">
                                {selectedAvatar.assets.length === 0 && (
                                    <div className="col-span-2 py-12 text-center text-neutral-400 border-2 border-dashed border-neutral-100 rounded-2xl">
                                        No assets uploaded yet.
                                    </div>
                                )}
                                {selectedAvatar.assets.map(asset => (
                                    <div key={asset.id} className="flex items-center gap-4 p-4 border border-neutral-100 rounded-2xl hover:border-neutral-200 transition-colors group">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center",
                                            asset.type === 'shirt' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                                        )}>
                                            <Shirt size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold">{asset.name}</div>
                                            <div className="text-xs text-neutral-500 uppercase">{asset.type}</div>
                                        </div>
                                        <button
                                            onClick={() => promptDeleteAsset(asset)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] text-neutral-400 border-2 border-dashed border-neutral-200 rounded-[40px]">
                            <Package size={48} className="mb-4 opacity-50" />
                            <p>Select an avatar to manage assets</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Avatar Modal */}
            {isCreatingAvatar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold font-koulen mb-6">Create New Avatar</h2>
                        <form onSubmit={handleCreateAvatar} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Name</label>
                                <input name="name" required className="w-full p-3 bg-neutral-50 rounded-xl border border-neutral-200" placeholder="e.g. Standard Female" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Base Model (GLB)</label>
                                <input type="file" name="base_file" required accept=".glb" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-700" />
                                <p className="text-xs text-red-500 mt-1">Only .glb files allowed</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsCreatingAvatar(false)} className="px-4 py-2 text-neutral-500 font-bold">Cancel</button>
                                <button type="submit" disabled={uploadLoading} className="px-6 py-2 bg-neutral-900 text-white rounded-full font-bold hover:bg-neutral-800 disabled:opacity-50">
                                    {uploadLoading ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Asset Modal */}
            {isAddingAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold font-koulen mb-6">Add Asset</h2>
                        <form onSubmit={handleAddAsset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Name</label>
                                <input name="name" required className="w-full p-3 bg-neutral-50 rounded-xl border border-neutral-200" placeholder="e.g. Red Shirt" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Type</label>
                                <select name="type" className="w-full p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                                    <option value="shirt">Shirt</option>
                                    <option value="pant">Pant</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Asset Model (GLB)</label>
                                <input type="file" name="file" required accept=".glb" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-700" />
                                <p className="text-xs text-red-500 mt-1">Only .glb files allowed</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsAddingAsset(false)} className="px-4 py-2 text-neutral-500 font-bold">Cancel</button>
                                <button type="submit" disabled={uploadLoading} className="px-6 py-2 bg-neutral-900 text-white rounded-full font-bold hover:bg-neutral-800 disabled:opacity-50">
                                    {uploadLoading ? "Uploading..." : "Upload"}
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
            />
        </div>
    );
}
