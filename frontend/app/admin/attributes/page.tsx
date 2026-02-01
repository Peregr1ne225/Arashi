"use client";

import React, { useState, useEffect, useMemo } from "react";
import { attributesApi } from "@/app/lib/api/client";
import { Color, Size, Tag } from "@/app/types/attributes";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";
import ColorForm from "@/app/components/admin/ColorForm";
import SizeForm from "@/app/components/admin/SizeForm";
import TagForm from "@/app/components/admin/TagForm";
import { SortIcon } from "@/app/components/admin/SortIcon";

export default function AdminAttributesPage() {
    const [activeTab, setActiveTab] = useState<"colors" | "sizes" | "tags">("colors");
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);

    const [editingColor, setEditingColor] = useState<Color | null>(null);
    const [editingSize, setEditingSize] = useState<Size | null>(null);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    const [itemToDelete, setItemToDelete] = useState<{ type: "color" | "size" | "tag"; id: number; name: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Memoized sorted items for the active tab
    const sortedItems = useMemo(() => {
        let items: (Color | Size | Tag)[] = [];
        if (activeTab === 'colors') items = [...colors];
        else if (activeTab === 'sizes') items = [...sizes];
        else items = [...tags];

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
    }, [activeTab, colors, sizes, tags, sortConfig]);

    // Memoized Top 5 Stats
    const topItems = useMemo(() => {
        let items: (Color | Size | Tag)[] = [];
        if (activeTab === 'colors') items = colors;
        else if (activeTab === 'sizes') items = sizes;
        else items = tags;

        const statsItems = [...items].sort((a, b) => (b.product_count || 0) - (a.product_count || 0)).slice(0, 5);
        return statsItems.map(item => ({
            name: item.name,
            count: item.product_count || 0,
            code: 'code' in item ? (item as Color).code : undefined
        }));
    }, [activeTab, colors, sizes, tags]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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
    }, [fetchData]);



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
            alert("Failed to save color");
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
            alert("Failed to delete color");
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
            alert("Failed to save size");
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
            alert("Failed to delete size");
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
            alert("Failed to save tag");
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
            alert("Failed to delete tag");
        }
    };

    if (isLoading && topItems.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="pt-8 flex flex-col space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-koulen text-4xl tracking-wide text-[#0e4d80]">
                        Attributes <span className="text-[#0e4d80]/60">Manager</span>
                    </h1>
                    <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">
                        Manage Product Colors, Sizes & Tags
                    </p>
                </div>
                <div>
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
                        className="font-istok text-[11px] uppercase tracking-widest font-bold px-8 py-3 bg-[#0e4d80] text-white hover:opacity-90 transition-all rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        + New {activeTab === "colors" ? "Color" : activeTab === "sizes" ? "Size" : "Tag"}
                    </button>
                </div>
            </div>

            {/* Dashboard - Top 5 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {topItems.map((item, index) => (
                    <div key={index} className="card-sport p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-2xl font-koulen text-[#0e4d80]">#{index + 1}</span>
                            {item.code && (
                                <div className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: item.code }} />
                            )}
                        </div>
                        <div>
                            <h3 className="font-istok font-bold text-sm text-gray-900 truncate" title={item.name}>{item.name}</h3>
                            <p className="font-istok text-xs text-gray-500 uppercase tracking-wider mt-1">{item.count} Products</p>
                        </div>
                        <div className="w-full bg-gray-100 h-1 mt-3 rounded-full overflow-hidden">
                            <div
                                className="bg-linear-to-r from-[#0e4d80] to-[#0a3a60] h-full rounded-full"
                                style={{ width: `${Math.min(100, (item.count / (topItems[0]?.count || 1)) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
                {topItems.length === 0 && (
                    <div className="col-span-5 bg-gray-50 p-6 rounded-lg border border-gray-100 text-center text-gray-500 font-istok">
                        No usage data available yet.
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100">
                <nav className="-mb-px flex space-x-2 pb-4" aria-label="Tabs">
                    <button
                        onClick={() => { setActiveTab("colors"); setSortConfig(null); }}
                        className={`
                            whitespace-nowrap py-2 px-6 rounded-full font-bold text-xs uppercase tracking-[0.2em] font-istok transition-all
                            ${activeTab === "colors"
                                ? "bg-[#0e4d80] text-white shadow-md shadow-blue-900/10"
                                : "text-gray-400 hover:text-[#0e4d80] hover:bg-white"}
                        `}
                    >
                        Colors
                    </button>
                    <button
                        onClick={() => { setActiveTab("sizes"); setSortConfig(null); }}
                        className={`
                            whitespace-nowrap py-2 px-6 rounded-full font-bold text-xs uppercase tracking-[0.2em] font-istok transition-all
                            ${activeTab === "sizes"
                                ? "bg-[#0e4d80] text-white shadow-md shadow-blue-900/10"
                                : "text-gray-400 hover:text-[#0e4d80] hover:bg-white"}
                        `}
                    >
                        Sizes
                    </button>
                    <button
                        onClick={() => { setActiveTab("tags"); setSortConfig(null); }}
                        className={`
                            whitespace-nowrap py-2 px-6 rounded-full font-bold text-xs uppercase tracking-[0.2em] font-istok transition-all
                            ${activeTab === "tags"
                                ? "bg-[#0e4d80] text-white shadow-md shadow-blue-900/10"
                                : "text-gray-400 hover:text-[#0e4d80] hover:bg-white"}
                        `}
                    >
                        Tags
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            <div className="card-sport overflow-hidden bg-white">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-white sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                            <th
                                className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort(activeTab === "colors" ? "code" : "id")}
                            >
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    {activeTab === "colors" ? "Visual" : "ID"} <SortIcon columnKey={activeTab === "colors" ? "code" : "id"} sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort("name")}
                            >
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    Name <SortIcon columnKey="name" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort(activeTab === "colors" ? "code" : "slug")}
                            >
                                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    {activeTab === "colors" ? "Hex Code" : "Slug"} <SortIcon columnKey={activeTab === "colors" ? "code" : "slug"} sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 text-center cursor-pointer group hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort("product_count")}
                            >
                                <div className="flex items-center justify-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                    Usage <SortIcon columnKey="product_count" sortConfig={sortConfig} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right font-istok text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                Control
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {activeTab === "colors" ? (
                            (sortedItems as Color[]).map((color) => (
                                <tr key={color.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div
                                            className="h-8 w-8 rounded-full border border-gray-200 shadow-sm"
                                            style={{ backgroundColor: color.code }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-istok">
                                        {color.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {color.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-istok">
                                        {color.product_count || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingColor(color);
                                                    setIsColorModalOpen(true);
                                                }}
                                                className="text-[#0e4d80] hover:text-[#0a3a60] font-bold uppercase text-xs tracking-wider"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setItemToDelete({ type: "color", id: color.id, name: color.name })}
                                                className="text-[#0e4d80]/50 hover:text-[#0e4d80] font-bold uppercase text-xs tracking-wider ml-2"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : activeTab === "sizes" ? (
                            (sortedItems as Size[]).map((size) => (
                                <tr key={size.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        #{size.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-istok">
                                        {size.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {size.slug}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-istok">
                                        {size.product_count || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingSize(size as Size);
                                                    setIsSizeModalOpen(true);
                                                }}
                                                className="text-[#0e4d80] hover:text-[#0a3a60] font-bold uppercase text-xs tracking-wider"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setItemToDelete({ type: "size", id: size.id, name: size.name })}
                                                className="text-[#0e4d80]/50 hover:text-[#0e4d80] font-bold uppercase text-xs tracking-wider ml-2"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            (sortedItems as Tag[]).map((tag) => (
                                <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        #{tag.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-istok">
                                        {tag.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tag.slug}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-istok">
                                        {tag.product_count || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingTag(tag);
                                                    setIsTagModalOpen(true);
                                                }}
                                                className="text-[#0e4d80] hover:text-[#0a3a60] font-bold uppercase text-xs tracking-wider"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setItemToDelete({ type: "tag", id: tag.id, name: tag.name })}
                                                className="text-[#0e4d80]/50 hover:text-[#0e4d80] font-bold uppercase text-xs tracking-wider ml-2"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        {activeTab === "colors" && colors.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-istok">
                                    No colors found. Create one to get started.
                                </td>
                            </tr>
                        )}
                        {activeTab === "sizes" && sizes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-istok">
                                    No sizes found. Create one to get started.
                                </td>
                            </tr>
                        )}
                        {activeTab === "tags" && tags.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-istok">
                                    No tags found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {/* Color Modal */}
            {isColorModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
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

            {/* Size Modal */}
            {isSizeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
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

            {/* Tag Modal */}
            {isTagModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
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

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onCancel={() => setItemToDelete(null)}
                onConfirm={itemToDelete?.type === "color" ? handleDeleteColor : itemToDelete?.type === "size" ? handleDeleteSize : handleDeleteTag}
                title={`Delete ${itemToDelete?.type === "color" ? "Color" : itemToDelete?.type === "size" ? "Size" : "Tag"}`}
                message={`Are you sure you want to delete "${itemToDelete?.name}"?`}
                confirmText="Delete"
            />
        </div>
    );
}
