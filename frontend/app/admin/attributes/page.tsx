"use client";

import React, { useState, useEffect, useMemo } from "react";
import { attributesApi } from "@/app/lib/api/client";
import { Color, Size, Tag } from "@/app/types/attributes";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import ColorForm from "@/app/components/admin/ColorForm";
import SizeForm from "@/app/components/admin/SizeForm";
import TagForm from "@/app/components/admin/TagForm";
import MessageModal from "@/app/components/ui/MessageModal";
import { Plus, Search, Palette, Ruler, Tag as TagIcon, ArrowUpDown, Trash2, Edit2 } from "lucide-react";

export default function AdminAttributesPage() {
    const [activeTab, setActiveTab] = useState<"colors" | "sizes" | "tags">("colors");
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal States
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);

    const [editingColor, setEditingColor] = useState<Color | null>(null);
    const [editingSize, setEditingSize] = useState<Size | null>(null);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    const [itemToDelete, setItemToDelete] = useState<{ type: "color" | "size" | "tag"; id: number; name: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Message Modal
    const [messageModal, setMessageModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Fetch Data
    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'colors') {
                const items = await attributesApi.getColors();
                setColors(items);
            } else if (activeTab === 'sizes') {
                const items = await attributesApi.getSizes();
                setSizes(items);
            } else {
                const items = await attributesApi.getTags();
                setTags(items);
            }
        } catch (error) {
            console.error("Failed to fetch attributes:", error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
        setSearchQuery(""); // Reset search on tab change
        setSortConfig(null); // Reset sort on tab change
    }, [fetchData]);


    // Memoized sorted and filtered items
    const processedItems = useMemo(() => {
        let items: (Color | Size | Tag)[] = [];
        if (activeTab === 'colors') items = [...colors];
        else if (activeTab === 'sizes') items = [...sizes];
        else items = [...tags];

        // Filter
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(lowerQ) ||
                ('slug' in item && (item as Size | Tag).slug.toLowerCase().includes(lowerQ)) ||
                ('code' in item && (item as Color).code.toLowerCase().includes(lowerQ))
            );
        }

        // Sort
        if (sortConfig) {
            items.sort((a, b) => {
                const key = sortConfig.key as keyof (Color | Size | Tag);
                const valA = a[key];
                const valB = b[key];
                if (valA === undefined || valB === undefined) return 0;

                if (typeof valA === 'string' && typeof valB === 'string') {
                    const comparison = valA.localeCompare(valB);
                    return sortConfig.direction === 'asc' ? comparison : -comparison;
                }

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
                }

                return 0;
            });
        }
        return items;
    }, [activeTab, colors, sizes, tags, sortConfig, searchQuery]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // --- Color Handlers ---
    const handleSaveColor = async (data: { name: string; code: string }) => {
        setIsSaving(true);
        try {
            if (editingColor) {
                await attributesApi.updateColor(editingColor.id, data);
            } else {
                await attributesApi.createColor(data);
            }
            await fetchData();
            setIsColorModalOpen(false);
            setEditingColor(null);
        } catch (error) {
            console.error("Failed to save color:", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to save color.",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteColor = async () => {
        if (!itemToDelete || itemToDelete.type !== "color") return;
        try {
            await attributesApi.deleteColor(itemToDelete.id);
            await fetchData();
            setItemToDelete(null);
        } catch (error) {
            console.error("Failed to delete color:", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to delete color.",
                type: "error",
            });
        }
    };

    // --- Size Handlers ---
    const handleSaveSize = async (data: { name: string; slug: string }) => {
        setIsSaving(true);
        try {
            if (editingSize) {
                await attributesApi.updateSize(editingSize.id, data);
            } else {
                await attributesApi.createSize(data);
            }
            await fetchData();
            setIsSizeModalOpen(false);
            setEditingSize(null);
        } catch (error) {
            console.error("Failed to save size:", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to save size.",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSize = async () => {
        if (!itemToDelete || itemToDelete.type !== "size") return;
        try {
            await attributesApi.deleteSize(itemToDelete.id);
            await fetchData();
            setItemToDelete(null);
        } catch (error) {
            console.error("Failed to delete size:", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to delete size.",
                type: "error",
            });
        }
    };

    // --- Tag Handlers ---
    const handleSaveTag = async (data: { name: string; slug: string }) => {
        setIsSaving(true);
        try {
            if (editingTag) {
                await attributesApi.updateTag(editingTag.id, data);
            } else {
                await attributesApi.createTag(data);
            }
            await fetchData();
            setIsTagModalOpen(false);
            setEditingTag(null);
        } catch (error) {
            console.error("Failed to save tag:", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to save tag.",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTag = async () => {
        if (!itemToDelete || itemToDelete.type !== "tag") return;
        try {
            await attributesApi.deleteTag(itemToDelete.id);
            await fetchData();
            setItemToDelete(null);
        } catch (error) {
            console.error("Failed to delete tag:", error);
            setMessageModal({
                isOpen: true,
                title: "Error",
                message: "Failed to delete tag.",
                type: "error",
            });
        }
    };

    // Loading State
    if (isLoading && colors.length === 0 && sizes.length === 0 && tags.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-[#0e4d80] animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Palette className="h-8 w-8 text-[#0e4d80]" />
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
                            <Palette className="w-4 h-4" />
                            <span>Product Attributes</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-koulen tracking-wider text-white drop-shadow-lg">
                            ATTRIBUTE <span className="text-blue-200">MANAGER</span>
                        </h1>
                        <p className="font-istok text-blue-100 text-lg max-w-xl mx-auto md:mx-0">
                            Manage standard product attributes including colors, sizes, and tags for consistent cataloging.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                            <div className="text-3xl font-koulen text-white">{colors.length}</div>
                            <div className="text-[10px] font-istok uppercase tracking-wider text-blue-200">Colors</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                            <div className="text-3xl font-koulen text-white">{sizes.length}</div>
                            <div className="text-[10px] font-istok uppercase tracking-wider text-blue-200">Sizes</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
                            <div className="text-3xl font-koulen text-white">{tags.length}</div>
                            <div className="text-[10px] font-istok uppercase tracking-wider text-blue-200">Tags</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-4">

                {/* Tabs & Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-white p-2 rounded-3xl shadow-lg border border-gray-100">
                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-50 rounded-2xl w-full md:w-auto">
                        <button
                            onClick={() => { setActiveTab("colors"); setSearchQuery(""); }}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-koulen uppercase tracking-wide text-sm transition-all ${activeTab === "colors"
                                ? "bg-[#0e4d80] text-white shadow-md"
                                : "text-gray-500 hover:bg-gray-200/50"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Palette className="w-4 h-4" />
                                <span>Colors</span>
                            </div>
                        </button>
                        <button
                            onClick={() => { setActiveTab("sizes"); setSearchQuery(""); }}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-koulen uppercase tracking-wide text-sm transition-all ${activeTab === "sizes"
                                ? "bg-[#0e4d80] text-white shadow-md"
                                : "text-gray-500 hover:bg-gray-200/50"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Ruler className="w-4 h-4" />
                                <span>Sizes</span>
                            </div>
                        </button>
                        <button
                            onClick={() => { setActiveTab("tags"); setSearchQuery(""); }}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-koulen uppercase tracking-wide text-sm transition-all ${activeTab === "tags"
                                ? "bg-[#0e4d80] text-white shadow-md"
                                : "text-gray-500 hover:bg-gray-200/50"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <TagIcon className="w-4 h-4" />
                                <span>Tags</span>
                            </div>
                        </button>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto px-2 md:px-0">
                        {/* Search */}
                        <div className="relative flex-1 md:flex-none md:w-64 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#0e4d80] transition-colors" />
                            <input
                                type="text"
                                className="w-full bg-gray-50 border-none rounded-xl py-3 pl-10 pr-4 font-istok text-sm focus:ring-2 focus:ring-[#0e4d80]/20 text-gray-700 placeholder:text-gray-400 transition-all group-hover:bg-gray-100/80"
                                placeholder={`Search ${activeTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={() => {
                                if (activeTab === "colors") {
                                    setEditingColor(null);
                                    setIsColorModalOpen(true);
                                } else if (activeTab === "sizes") {
                                    setEditingSize(null);
                                    setIsSizeModalOpen(true);
                                } else {
                                    setEditingTag(null);
                                    setIsTagModalOpen(true);
                                }
                            }}
                            className="flex items-center gap-2 bg-[#0e4d80] text-white px-6 py-3 rounded-xl font-koulen uppercase tracking-wide text-sm hover:bg-[#0b3d66] transition-all shadow-lg hover:shadow-blue-900/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New {activeTab === "colors" ? "Color" : activeTab === "sizes" ? "Size" : "Tag"}</span>
                        </button>
                    </div>
                </div>

                {/* Content Table */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-left">
                                        <button
                                            className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok hover:text-[#0e4d80] transition-colors"
                                            onClick={() => handleSort('id')}
                                        >
                                            ID <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-left">
                                        <button
                                            className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok hover:text-[#0e4d80] transition-colors"
                                            onClick={() => handleSort('name')}
                                        >
                                            Name <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-left">
                                        <button
                                            className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok hover:text-[#0e4d80] transition-colors"
                                            onClick={() => handleSort(activeTab === 'colors' ? 'code' : 'slug')}
                                        >
                                            {activeTab === 'colors' ? 'Hex Code' : 'Slug'} <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-center">
                                        <button
                                            className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok hover:text-[#0e4d80] transition-colors w-full"
                                            onClick={() => handleSort('product_count')}
                                        >
                                            Usage <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {processedItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="group hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-gray-400">#{item.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {activeTab === 'colors' && 'code' in item && (
                                                    <div
                                                        className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                                                        style={{ backgroundColor: (item as Color).code }}
                                                    />
                                                )}
                                                <span className="font-istok font-bold text-gray-900">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {activeTab === 'colors' && 'code' in item ? (
                                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg w-fit">
                                                    <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: (item as Color).code }}></div>
                                                    <span className="font-mono text-xs text-gray-600 uppercase">{(item as Color).code}</span>
                                                </div>
                                            ) : (
                                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-mono text-gray-600">
                                                    {'slug' in item ? (item as Size | Tag).slug : '-'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                                                {item.product_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        if (activeTab === "colors") {
                                                            setEditingColor(item as Color);
                                                            setIsColorModalOpen(true);
                                                        } else if (activeTab === "sizes") {
                                                            setEditingSize(item as Size);
                                                            setIsSizeModalOpen(true);
                                                        } else {
                                                            setEditingTag(item as Tag);
                                                            setIsTagModalOpen(true);
                                                        }
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-[#0e4d80] hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setItemToDelete({
                                                        type: activeTab === 'colors' ? 'color' : activeTab === 'sizes' ? 'size' : 'tag',
                                                        id: item.id,
                                                        name: item.name
                                                    })}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {processedItems.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-istok">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-gray-50 rounded-full">
                                                    <Search className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-sm font-medium">No items found.</p>
                                                {searchQuery && (
                                                    <button
                                                        onClick={() => setSearchQuery("")}
                                                        className="text-xs text-[#0e4d80] font-bold hover:underline"
                                                    >
                                                        Clear search
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isColorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="animate-in zoom-in-95 duration-200">
                        <ColorForm
                            initialData={editingColor}
                            onSubmit={handleSaveColor}
                            onCancel={() => {
                                setIsColorModalOpen(false);
                                setEditingColor(null);
                            }}
                            isLoading={isSaving}
                        />
                    </div>
                </div>
            )}

            {isSizeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="animate-in zoom-in-95 duration-200">
                        <SizeForm
                            initialData={editingSize}
                            onSubmit={handleSaveSize}
                            onCancel={() => {
                                setIsSizeModalOpen(false);
                                setEditingSize(null);
                            }}
                            isLoading={isSaving}
                        />
                    </div>
                </div>
            )}

            {isTagModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="animate-in zoom-in-95 duration-200">
                        <TagForm
                            initialData={editingTag}
                            onSubmit={handleSaveTag}
                            onCancel={() => {
                                setIsTagModalOpen(false);
                                setEditingTag(null);
                            }}
                            isLoading={isSaving}
                        />
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onCancel={() => setItemToDelete(null)}
                onConfirm={itemToDelete?.type === "color" ? handleDeleteColor : itemToDelete?.type === "size" ? handleDeleteSize : handleDeleteTag}
                title={`Delete ${itemToDelete?.type === "color" ? "Color" : itemToDelete?.type === "size" ? "Size" : "Tag"}`}
                message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
                confirmText="Delete"
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
