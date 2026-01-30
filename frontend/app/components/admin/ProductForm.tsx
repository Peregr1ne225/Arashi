"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Product } from "@/app/types/product";
import { Category } from "@/app/types/category";
import { Color, Size, Tag } from "@/app/types/attributes";
import { getImageUrl } from "@/app/lib/utils/image";
import { X, Plus, Trash2 } from "lucide-react";

interface ProductFormProps {
    initialData?: Product;
    categories: Category[];
    availableColors?: Color[];
    availableSizes?: Size[];
    availableTags?: Tag[];
    onSubmit: (formData: FormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

// Helper for deterministic tag colors (matching AdminProductsPage)
const getTagColorClass = (tag: string) => {
    const colors = [
        "bg-blue-100 text-blue-700 border-blue-200",
        "bg-red-100 text-red-700 border-red-200",
        "bg-green-100 text-green-700 border-green-200",
        "bg-yellow-100 text-yellow-700 border-yellow-200",
        "bg-purple-100 text-purple-700 border-purple-200",
        "bg-pink-100 text-pink-700 border-pink-200",
        "bg-indigo-100 text-indigo-700 border-indigo-200",
        "bg-orange-100 text-orange-700 border-orange-200",
        "bg-teal-100 text-teal-700 border-teal-200",
        "bg-cyan-100 text-cyan-700 border-cyan-200",
    ];
    const hash = tag
        .split("")
        .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    return colors[Math.abs(hash) % colors.length];
};

export default function ProductForm({
    initialData,
    categories,
    availableColors = [],
    availableSizes = [],
    availableTags = [],
    onSubmit,
    onCancel,
    isLoading = false,
}: ProductFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(
        initialData?.description || "",
    );
    const [price, setPrice] = useState(
        (initialData?.originalPrice ?? initialData?.price)?.toString() || "",
    );
    const [discount, setDiscount] = useState(
        initialData?.discount?.toString() || "",
    );
    const [categoryId, setCategoryId] = useState(
        initialData?.category_id?.toString() ||
        initialData?.category?.id?.toString() ||
        "",
    );

    // Variants State
    // We map initial variants to a shape we can edit.
    // For new variants, 'id' might be explicitly undefined or negative to distinguish.
    // However, since backend deletes all & recreates, IDs are less critical for persistence but useful for keys.
    // Local interface for form variants which might be new (temp ID)
    interface FormVariant {
        id: number;
        color_id: number;
        color_name: string;
        color_code: string;
        size_id: number;
        size_name: string;
        stock: number;
        is_active: boolean;
    }

    const [variants, setVariants] = useState<FormVariant[]>(
        initialData?.variants?.map((v) => ({
            ...v,
            stock: v.stock, // ensure number
        })) || [],
    );
    const [newVariantColor, setNewVariantColor] = useState("");
    const [newVariantSize, setNewVariantSize] = useState("");
    const [newVariantStock, setNewVariantStock] = useState("0");

    // Tags State
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);

    // Filter available tags: exclude already selected ones and match input
    const filteredTags = availableTags
        .filter((t) => !tags.includes(t.name))
        .filter((t) => t.name.toLowerCase().includes(tagInput.toLowerCase()));

    // Color Images State
    const [colorImages, setColorImages] = useState<Record<number, File>>({});

    // Derived unique colors from current variants
    const activeColorIds = Array.from(new Set(variants.map((v) => v.color_id)));
    const activeColors = activeColorIds
        .map((id) => {
            const variant = variants.find((v) => v.color_id === id);
            return variant
                ? {
                    id: variant.color_id,
                    name: variant.color_name,
                    code: variant.color_code,
                }
                : null;
        })
        .filter((c): c is { id: number; name: string; code: string } => c !== null);

    // Image State
    const [existingImages, setExistingImages] = useState<
        { id: number; url: string }[]
    >(
        initialData?.product_images?.map((img) => ({
            id: img.id,
            url: img.image,
        })) || [],
    );
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    // Sync with initialData changes - REMOVED because we use key={id} in parent
    // causing re-mount on change.

    // Image Handlers
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileList = Array.from(files);
            setNewFiles((prev) => [...prev, ...fileList]);
            const previews = fileList.map((file) => URL.createObjectURL(file));
            setNewPreviews((prev) => [...prev, ...previews]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setNewPreviews((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const removeExistingImage = (index: number) => {
        const imageToRemove = existingImages[index];
        if (imageToRemove.id !== -1) {
            setDeletedImageIds((prev) => [...prev, imageToRemove.id]);
        }
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Variant Handlers
    const handleAddVariant = () => {
        if (!newVariantColor || !newVariantSize) {
            alert("Please select both Color and Size");
            return;
        }

        const colorObj = availableColors.find(
            (c) => c.id.toString() === newVariantColor,
        );
        const sizeObj = availableSizes.find(
            (s) => s.id.toString() === newVariantSize,
        );

        if (!colorObj || !sizeObj) return;

        // Check for duplicates
        const exists = variants.some(
            (v) => v.color_id === colorObj.id && v.size_id === sizeObj.id,
        );
        if (exists) {
            alert("This variant already exists!");
            return;
        }

        const newVariant = {
            id: -Date.now(), // Temporary ID
            color_id: colorObj.id,
            color_name: colorObj.name,
            color_code: colorObj.code,
            size_id: sizeObj.id,
            size_name: sizeObj.name,
            stock: parseInt(newVariantStock) || 0,
            is_active: true,
        };

        setVariants([...variants, newVariant]);

        // Reset inputs
        setNewVariantColor("");
        setNewVariantSize("");
        setNewVariantStock("0");
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (
        index: number,
        field: keyof FormVariant,
        value: string | number | boolean,
    ) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    // Tag Handlers
    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = tagInput.trim();
            if (val) {
                // Split by comma to handle multiple tags
                const newTags = val
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t && !tags.includes(t));
                if (newTags.length > 0) {
                    setTags([...tags, ...newTags]);
                    setTagInput("");
                    setShowTagSuggestions(false);
                }
            }
        }
    };

    const selectTag = (tagName: string) => {
        if (!tags.includes(tagName)) {
            setTags([...tags, tagName]);
            setTagInput("");
            setShowTagSuggestions(false);
        }
    };

    // Allow adding by clicking button too
    const addTagManually = () => {
        const val = tagInput.trim();
        if (val) {
            const newTags = val
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t && !tags.includes(t));
            if (newTags.length > 0) {
                setTags([...tags, ...newTags]);
                setTagInput("");
            }
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price || !categoryId) {
            alert("Please fill in all required fields (Name, Price, Category)");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("discount", discount);
        formData.append("category_id", categoryId);

        // Images
        newFiles.forEach((file) => formData.append("uploaded_images", file));
        deletedImageIds.forEach((id) =>
            formData.append("deleted_image_ids", id.toString()),
        );

        // Variants (Serialize to JSON)
        // Ensure we send strict numbers for IDs
        const variantsPayload = variants.map((v) => ({
            color_id: v.color_id,
            size_id: v.size_id,
            stock: Number(v.stock),
            is_active: v.is_active,
        }));
        formData.append("variants", JSON.stringify(variantsPayload));

        // Tags (Serialize to JSON)
        formData.append("tags", JSON.stringify(tags));

        // Colors (Serialize to JSON) - vital for syncing ProductColors
        const colorsPayload = activeColors.map((c) => ({ color_id: c.id }));
        formData.append("colors_json", JSON.stringify(colorsPayload));

        // Color Images
        Object.entries(colorImages).forEach(([colorId, file]) => {
            formData.append(`color_image_${colorId}`, file);
        });

        if (!isDirty && initialData) {
            return;
        }

        await onSubmit(formData);
    };

    // Check if form is dirty (has changes)
    const isDirty = (() => {
        if (!initialData) return true;

        // Basic fields
        const initPrice =
            (initialData.originalPrice ?? initialData.price)?.toString() || "";
        const initDiscount = initialData.discount?.toString() || "";
        const initCatId =
            initialData.category_id?.toString() ||
            initialData.category?.id?.toString() ||
            "";

        if (name !== initialData.name) return true;
        if (description !== initialData.description) return true;
        if (price !== initPrice) return true;
        if (discount !== initDiscount) return true;
        if (categoryId !== initCatId) return true;

        // Tags
        const sortedTags = [...tags].sort();
        const initTags = [...(initialData.tags || [])].sort();
        if (JSON.stringify(sortedTags) !== JSON.stringify(initTags)) return true;

        // Images
        if (newFiles.length > 0) return true;
        if (deletedImageIds.length > 0) return true;

        // Color Images
        if (Object.keys(colorImages).length > 0) return true;

        // Variants
        const currentVars = variants
            .map((v) => ({
                color_id: v.color_id,
                size_id: v.size_id,
                stock: Number(v.stock),
                is_active: v.is_active,
            }))
            .sort((a, b) => a.color_id - b.color_id || a.size_id - b.size_id); // Sort for consistency

        const initVars = (initialData.variants || [])
            .map((v) => ({
                color_id: v.color_id,
                size_id: v.size_id,
                stock: Number(v.stock),
                is_active: v.is_active,
            }))
            .sort((a, b) => a.color_id - b.color_id || a.size_id - b.size_id);

        if (JSON.stringify(currentVars) !== JSON.stringify(initVars)) return true;

        return false;
    })();

    return (
        <form onSubmit={handleSubmit} className="space-y-8 px-1">
            {/* Basic Information Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-linear-to-r from-[#0047AB] to-[#D2042D] px-6 py-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        Basic Information
                    </h3>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            Product Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full rounded-lg border-gray-400 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] sm:text-sm py-2.5 px-4 font-medium text-gray-900 placeholder-gray-400"
                            placeholder="e.g. Minimalist Cotton T-Shirt"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            Category
                        </label>
                        <select
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="block w-full rounded-lg border-gray-400 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] text-base py-3 px-4 font-medium text-gray-900"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="block w-full rounded-lg border-gray-400 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] sm:text-sm py-2.5 px-4 resize-none font-medium text-gray-900 placeholder-gray-400"
                            placeholder="Product description..."
                        />
                    </div>
                </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-linear-to-r from-[#0047AB] to-[#D2042D] px-6 py-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        Pricing & Inventory
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            Price
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm font-bold">฿</span>
                            </div>
                            <input
                                type="number"
                                required
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="block w-full rounded-lg border-gray-400 bg-gray-50 pl-8 pr-4 shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] sm:text-sm py-2.5 font-medium text-gray-900 placeholder-gray-400"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                            Discount (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="block w-full rounded-lg border-gray-400 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] sm:text-sm py-2.5 px-4 font-medium text-gray-900 placeholder-gray-400"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            {/* Media Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-linear-to-r from-[#0047AB] to-[#D2042D] px-6 py-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        Media Gallery
                    </h3>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {existingImages.map((img, index) => (
                        <div
                            key={`existing-${index}`}
                            className="relative aspect-square w-full border rounded-lg overflow-hidden group bg-gray-50"
                        >
                            <Image
                                src={getImageUrl(img.url)}
                                alt={`Existing ${index}`}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                            <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {newPreviews.map((url, index) => (
                        <div
                            key={`new-${index}`}
                            className="relative aspect-square w-full border-2 border-blue-500/20 rounded-lg overflow-hidden group bg-gray-50"
                        >
                            <Image
                                src={url}
                                alt={`New ${index}`}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                            <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-transform transform scale-90 group-hover:scale-100"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    <div
                        className="aspect-square border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-500 transition-all text-gray-500 hover:text-blue-600"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Plus className="w-8 h-8 mb-1" />
                        <span className="text-xs font-bold uppercase tracking-wide">
                            Add Image
                        </span>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>
            </div>

            {/* Tags Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-linear-to-r from-[#0047AB] to-[#D2042D] px-6 py-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        Search Tags
                    </h3>
                </div>

                <div className="p-6 flex flex-col space-y-3">
                    <div className="relative">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => {
                                    setTagInput(e.target.value);
                                    setShowTagSuggestions(true);
                                }}
                                onFocus={() => setShowTagSuggestions(true)}
                                onBlur={() =>
                                    setTimeout(() => setShowTagSuggestions(false), 200)
                                }
                                onKeyDown={handleAddTag}
                                placeholder="Type tag and press Enter"
                                className="block flex-1 rounded-lg border-gray-400 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] sm:text-sm py-2.5 px-4 font-medium"
                            />
                            <button
                                type="button"
                                onClick={addTagManually}
                                className="bg-linear-to-b from-[#0e4d80] to-[#D2042D] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-opacity uppercase tracking-wide"
                            >
                                Add
                            </button>
                        </div>

                        {/* Tag Suggestions Dropdown */}
                        {showTagSuggestions && filteredTags.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto ring-1 ring-black ring-opacity-5">
                                {filteredTags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent blur
                                            selectTag(tag.name);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 text-base text-gray-700 transition-colors flex items-center justify-between group"
                                    >
                                        <span className="font-medium">{tag.name}</span>
                                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-black" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-11 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                        {tags.length === 0 && (
                            <span className="text-gray-400 text-sm italic font-medium">
                                No tags added yet.
                            </span>
                        )}
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${getTagColorClass(tag)}`}
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-red-700 hover:scale-110 transition-transform"
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Variants Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-linear-to-r from-[#0047AB] to-[#D2042D] px-6 py-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        Product Variants
                        <span className="text-xs font-bold text-[#0047AB] ml-2 py-0.5 px-2 bg-white rounded-full">
                            {variants.length} items
                        </span>
                    </h3>
                </div>

                {/* Variants Table */}
                <div className="p-6">
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm mb-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Color
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {variants.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-gray-400 text-sm font-medium"
                                        >
                                            No variants added yet. Use the form below to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    variants.map((v, idx) => (
                                        <tr
                                            key={idx}
                                            className="group hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded-full border border-gray-300 shadow-sm ring-1 ring-black ring-opacity-10"
                                                        style={{ backgroundColor: v.color_code }}
                                                    ></div>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {v.color_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200 uppercase">
                                                    {v.size_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={v.stock}
                                                    onChange={(e) =>
                                                        handleVariantChange(
                                                            idx,
                                                            "stock",
                                                            parseInt(e.target.value) || 0,
                                                        )
                                                    }
                                                    className="w-24 rounded-lg border-gray-300 shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] text-sm py-1.5 font-medium"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleVariantChange(idx, "is_active", !v.is_active)
                                                    }
                                                    className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1 w-fit transition-colors uppercase tracking-wide ${v.is_active
                                                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${v.is_active ? "bg-green-500" : "bg-red-500"}`}
                                                    ></span>
                                                    {v.is_active ? "Active" : "Archived"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariant(idx)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Add Variant Form */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                            <Plus size={16} /> Add New Variant
                        </h5>
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-35">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                    Color
                                </label>
                                <select
                                    value={newVariantColor}
                                    onChange={(e) => setNewVariantColor(e.target.value)}
                                    className="block w-full rounded-lg border-gray-400 bg-white shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] text-base py-3 px-4 font-medium"
                                >
                                    <option value="">Select Color</option>
                                    {availableColors.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="min-w-30">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                    Size
                                </label>
                                <select
                                    value={newVariantSize}
                                    onChange={(e) => setNewVariantSize(e.target.value)}
                                    className="block w-full rounded-lg border-gray-400 bg-white shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] text-base py-3 px-4 font-medium"
                                >
                                    <option value="">Select Size</option>
                                    {availableSizes.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newVariantStock}
                                    onChange={(e) => setNewVariantStock(e.target.value)}
                                    className="block w-full rounded-lg border-gray-400 bg-white shadow-sm focus:border-[#0e4d80] focus:ring-[#0e4d80] text-sm py-2.5 px-4 font-medium"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddVariant}
                                disabled={!newVariantColor || !newVariantSize}
                                className="bg-linear-to-b from-[#0e4d80] to-[#D2042D] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-md uppercase tracking-wide"
                            >
                                Add Variant
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Color Images Section (Only if we have active colors) */}
            {activeColors.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-linear-to-r from-[#0047AB] to-[#D2042D] px-6 py-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                            Variant Images
                        </h3>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeColors.map((color) => {
                            // Check for existing image in initialData
                            const existingColorImg = initialData?.colors?.find(
                                (c) => c.color_id === color.id,
                            )?.image;
                            const newFile = colorImages[color.id];

                            return (
                                <div
                                    key={color.id}
                                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex items-start gap-4 hover:border-blue-500 transition-colors"
                                >
                                    <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-lg shrink-0 relative overflow-hidden flex items-center justify-center">
                                        {newFile ? (
                                            <Image
                                                src={URL.createObjectURL(newFile)}
                                                alt="New"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : existingColorImg ? (
                                            <Image
                                                src={getImageUrl(existingColorImg)}
                                                alt="Existing"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-[10px] text-gray-300 text-center px-1 font-medium">
                                                No Image
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm ring-1 ring-black ring-opacity-10"
                                                style={{ backgroundColor: color.code }}
                                            ></div>
                                            <span className="text-sm font-bold text-gray-900 truncate">
                                                {color.name}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                id={`color-img-${color.id}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setColorImages((prev) => ({
                                                            ...prev,
                                                            [color.id]: e.target.files![0],
                                                        }));
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={`color-img-${color.id}`}
                                                className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-bold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors uppercase tracking-wide"
                                            >
                                                {newFile
                                                    ? "Change File"
                                                    : existingColorImg
                                                        ? "Replace File"
                                                        : "Upload File"}
                                            </label>

                                            {existingColorImg && !newFile && (
                                                <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                    <span>Image Set</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Bottom Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-white py-2.5 px-6 border border-gray-300 rounded shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider font-istok"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading || (!!initialData && !isDirty)}
                    className="inline-flex justify-center py-2.5 px-8 border border-transparent shadow-lg text-sm font-bold rounded text-white bg-linear-to-b from-[#0047AB] to-[#D2042D] hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-istok transform transition-transform hover:scale-105"
                >
                    {isLoading
                        ? "Saving..."
                        : initialData
                            ? "Save Changes"
                            : "Create Product"}
                </button>
            </div>
        </form>
    );
}
