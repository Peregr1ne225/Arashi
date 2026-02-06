"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Product } from "@/app/types/product";
import { Category } from "@/app/types/category";
import { Color, Size, Tag } from "@/app/types/attributes";
import { getImageUrl } from "@/app/lib/utils/image";
import { X, Plus, Trash2, Box, Layers, Tag as TagIcon, UploadCloud, AlertCircle } from "lucide-react";
import MessageModal from "@/app/components/ui/MessageModal";

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
    "bg-blue-50 text-blue-700 border-blue-100",
    "bg-red-50 text-red-700 border-red-100",
    "bg-green-50 text-green-700 border-green-100",
    "bg-yellow-50 text-yellow-700 border-yellow-100",
    "bg-purple-50 text-purple-700 border-purple-100",
    "bg-pink-50 text-pink-700 border-pink-100",
    "bg-indigo-50 text-indigo-700 border-indigo-100",
    "bg-orange-50 text-orange-700 border-orange-100",
    "bg-teal-50 text-teal-700 border-teal-100",
    "bg-cyan-50 text-cyan-700 border-cyan-100",
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
      stock: v.stock,
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

  // Message Modal
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

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

  const handleColorImageChange = (
    colorId: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setColorImages((prev) => ({
        ...prev,
        [colorId]: file,
      }));
    }
  };

  // Variant Handlers
  const handleAddVariant = () => {
    if (!newVariantColor || !newVariantSize) {
      setMessageModal({
        isOpen: true,
        title: "Validation Error",
        message: "Please select both Color and Size.",
        type: "error",
      });
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
      setMessageModal({
        isOpen: true,
        title: "Duplicate Variant",
        message: "This variant already exists!",
        type: "error",
      });
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
      setMessageModal({
        isOpen: true,
        title: "Missing Fields",
        message: "Please fill in all required fields (Name, Price, Category).",
        type: "error",
      });
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
    const variantsPayload = variants.map((v) => ({
      color_id: v.color_id,
      size_id: v.size_id,
      stock: Number(v.stock),
      is_active: v.is_active,
    }));
    formData.append("variants", JSON.stringify(variantsPayload));

    // Tags (Serialize to JSON)
    formData.append("tags", JSON.stringify(tags));

    // Colors (Serialize to JSON)
    const colorsPayload = activeColors.map((c) => ({ color_id: c.id }));
    formData.append("colors_json", JSON.stringify(colorsPayload));

    // Color Images
    Object.entries(colorImages).forEach(([colorId, file]) => {
      formData.append(`color_image_${colorId}`, file);
    });

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 px-1">
      <MessageModal
        isOpen={messageModal.isOpen}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
      />

      {/* Basic Information Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-lg overflow-hidden relative">
        <div className="bg-linear-to-r from-[#0e4d80] to-[#0a3a60] px-10 py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-wide font-koulen relative z-10">
            <Box className="w-5 h-5 opacity-70" />
            Basic Information
          </h3>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest font-istok">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-2xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 outline-none transition-all py-4 px-5 font-bold text-gray-900 placeholder-gray-400 font-istok"
              placeholder="e.g. Minimalist Cotton T-Shirt"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest font-istok">
              Category *
            </label>
            <div className="relative">
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="block w-full rounded-2xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 outline-none transition-all py-4 px-5 font-bold text-gray-900 appearance-none font-istok cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>
          <div className="md:col-span-4">
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest font-istok">
              Description
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-2xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 outline-none transition-all py-4 px-5 font-medium text-gray-900 placeholder-gray-400 resize-none font-istok"
              placeholder="Describe the product details, features, and care instructions..."
            />
          </div>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-[#0e4d80] to-[#0a3a60] px-10 py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-wide font-koulen relative z-10">
            <TagIcon className="w-5 h-5 opacity-70" />
            Pricing Strategy
          </h3>
        </div>
        <div className="p-10 grid grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest font-istok">
              Base Price *
            </label>
            <div className="relative rounded-2xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <span className="text-gray-400 font-bold">฿</span>
              </div>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="block w-full rounded-2xl border-gray-200 bg-gray-50 pl-10 pr-5 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 outline-none transition-all py-4 font-bold text-gray-900 placeholder-gray-400 font-istok"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest font-istok">
              Discount (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="block w-full rounded-2xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 outline-none transition-all py-4 px-5 font-bold text-gray-900 placeholder-gray-400 font-istok"
                placeholder="0"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
                <span className="text-gray-400 font-bold">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-[#0e4d80] to-[#0a3a60] px-10 py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-wide font-koulen relative z-10">
            <UploadCloud className="w-5 h-5 opacity-70" />
            Visual Gallery
          </h3>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {existingImages.map((img, index) => (
              <div
                key={`existing-${index}`}
                className="relative aspect-square w-full border border-gray-100 rounded-3xl overflow-hidden group bg-gray-50 shadow-sm hover:shadow-md transition-all"
              >
                <Image
                  src={getImageUrl(img.url)}
                  alt={`Existing ${index}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {newPreviews.map((url, index) => (
              <div
                key={`new-${index}`}
                className="relative aspect-square w-full border-2 border-dashed border-[#0e4d80]/30 rounded-3xl overflow-hidden group bg-blue-50/20"
              >
                <Image
                  src={url}
                  alt={`New ${index}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg transition-all hover:bg-red-600 hover:scale-110"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-[#0e4d80]/80 text-white text-[9px] font-bold uppercase tracking-widest text-center py-1">New</div>
              </div>
            ))}

            <div
              className="aspect-square border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#0e4d80] transition-colors group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-[#0e4d80]/10 transition-colors">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#0e4d80] transition-colors" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#0e4d80] transition-colors">
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
          <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            First image will be the main product thumbnail
          </p>
        </div>
      </div>

      {/* Tags Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-lg relative overflow-visible">
        <div className="bg-linear-to-r from-[#0e4d80] to-[#0a3a60] px-10 py-6 rounded-t-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-wide font-koulen relative z-10">
            <Plus className="w-5 h-5 opacity-70" />
            Product Tags
          </h3>
        </div>

        <div className="p-10 flex flex-col space-y-4">
          <div className="relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
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
                  placeholder="Type to search or add new tag..."
                  className="block w-full rounded-2xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 outline-none transition-all py-4 px-5 font-bold text-gray-900 placeholder-gray-400 font-istok"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase tracking-wider hidden md:block">
                  Press Enter to Add
                </div>
              </div>
              <button
                type="button"
                onClick={addTagManually}
                className="bg-[#0e4d80] text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-lg hover:shadow-blue-900/10 hover:-translate-y-0.5 transition-all uppercase tracking-wider font-koulen"
              >
                Add
              </button>
            </div>

            {/* Tag Suggestions Dropdown */}
            {showTagSuggestions && filteredTags.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-2xl mt-2 shadow-2xl max-h-64 overflow-y-auto overflow-hidden p-2">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur
                      selectTag(tag.name);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-blue-50 rounded-xl text-sm font-bold text-gray-700 transition-colors flex items-center justify-between group font-istok"
                  >
                    <span className="group-hover:text-[#0e4d80] transition-colors">
                      {tag.name}
                    </span>
                    <Plus className="w-4 h-4 text-gray-300 group-hover:text-[#0e4d80] transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 min-h-[60px] p-5 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
            {tags.length === 0 && (
              <span className="text-gray-400 text-sm font-bold italic font-istok w-full text-center py-2 opacity-50">
                No tags added yet.
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-transform hover:scale-105 ${getTagColorClass(tag)}`}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-600 transition-colors bg-white/50 rounded-full p-0.5"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-lg overflow-hidden">
        <div className="bg-linear-to-r from-[#0e4d80] to-[#0a3a60] px-10 py-6 relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-wide font-koulen relative z-10">
            <Layers className="w-5 h-5 opacity-70" />
            Variants Configuration
          </h3>
          <span className="relative z-5 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/20">
            {variants.length} SKU{variants.length !== 1 && 's'}
          </span>
        </div>

        {/* Add Variant Form */}
        <div className="p-10 pb-0">
          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-8">
            <h5 className="text-xs font-bold text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest font-istok">
              <Plus size={14} /> Add New Variant Combination
            </h5>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest font-istok">
                  Color
                </label>
                <div className="relative">
                  <select
                    value={newVariantColor}
                    onChange={(e) => setNewVariantColor(e.target.value)}
                    className="block w-full rounded-2xl border-gray-200 bg-white shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 outline-none transition-all py-3 px-5 font-bold text-gray-900 appearance-none font-istok cursor-pointer"
                  >
                    <option value="">Select Color</option>
                    {availableColors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>

              </div>
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest font-istok">
                  Size
                </label>
                <div className="relative">
                  <select
                    value={newVariantSize}
                    onChange={(e) => setNewVariantSize(e.target.value)}
                    className="block w-full rounded-2xl border-gray-200 bg-white shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 outline-none transition-all py-3 px-5 font-bold text-gray-900 appearance-none font-istok cursor-pointer"
                  >
                    <option value="">Select Size</option>
                    {availableSizes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>
              <div className="w-full md:w-32">
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest font-istok">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={newVariantStock}
                  onChange={(e) => setNewVariantStock(e.target.value)}
                  className="block w-full rounded-2xl border-gray-200 bg-white shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 outline-none transition-all py-3 px-5 font-bold text-gray-900 text-center font-istok"
                />
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                disabled={!newVariantColor || !newVariantSize}
                className="w-full md:w-auto bg-[#0e4d80] text-white px-8 py-3 rounded-2xl text-[10px] font-bold hover:bg-[#0b3d66] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-900/10 uppercase tracking-[0.2em] font-istok h-[50px] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>
          </div>
        </div>

        {/* Variants Table */}
        <div className="pb-4">
          <div className="mx-4 md:mx-10 mb-10 overflow-hidden border border-gray-100 rounded-3xl">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok">
                    Color
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-istok">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {variants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center opacity-50">
                        <Box className="w-12 h-12 mb-2" />
                        <span className="font-bold font-istok text-sm">No variants added yet</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  variants.map((v, idx) => (
                    <tr
                      key={idx}
                      className="group hover:bg-blue-50/10 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full border border-gray-100 shadow-sm ring-2 ring-white"
                            style={{ backgroundColor: v.color_code }}
                          ></div>
                          <span className="text-sm font-bold text-gray-800 font-istok">
                            {v.color_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase font-istok">
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
                          className="w-24 rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 text-sm py-2 px-3 font-bold text-center outline-none transition-all font-istok"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            handleVariantChange(
                              idx,
                              "is_active",
                              !v.is_active,
                            )
                          }
                          className={`
                                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all
                                ${v.is_active
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                            }
                                `}
                        >
                          {v.is_active ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          )}
                          {v.is_active ? "Active" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Color Images Upload Section - Top Level Card */}
      {activeColors.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0e4d80] to-[#0a3a60] px-10 py-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <h3 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-wide font-koulen relative z-10">
              <UploadCloud className="w-5 h-5 opacity-70" />
              Color-Specific Images
            </h3>
          </div>

          <div className="p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {activeColors.map((color) => (
                <div key={color.id} className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full border border-gray-100 shadow-sm shrink-0" style={{ backgroundColor: color.code }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-istok truncate" title={color.name}>
                      {color.name}
                    </span>
                  </div>

                  <div className="relative aspect-square w-full border-2 border-dashed border-gray-200 rounded-3xl overflow-hidden hover:border-[#0e4d80] hover:bg-gray-50 transition-all group bg-gray-50/50">
                    {colorImages[color.id] ? (
                      <>
                        <Image
                          src={URL.createObjectURL(colorImages[color.id])}
                          alt={color.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = { ...colorImages };
                            delete newImages[color.id];
                            setColorImages(newImages);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-blue-50/30 transition-colors">
                        <UploadCloud className="w-6 h-6 text-gray-300 group-hover:text-[#0e4d80] transition-colors mb-2" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#0e4d80] transition-colors">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleColorImageChange(color.id, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Final Actions */}
      <div className="flex justify-end gap-4 pt-4 pb-12">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-4 px-10 border border-gray-200 rounded-full shadow-sm text-xs font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-[0.2em] font-istok transition-all hover:-translate-y-0.5"
        >
          Discard Changes
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#0e4d80] py-4 px-12 border border-transparent rounded-full shadow-xl text-xs font-bold text-white hover:bg-[#0b3d66] uppercase tracking-[0.2em] font-istok transition-all hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Save Product"}
        </button>
      </div>

    </form >
  );
}
