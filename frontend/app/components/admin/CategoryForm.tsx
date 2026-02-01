import { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { Category } from "@/app/types/category";
import { getImageUrl } from "@/app/lib/utils/image";

interface CategoryFormProps {
    initialData?: Category | null;
    categories: Category[];
    onSubmit: (formData: FormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function CategoryForm({
    initialData,
    categories,
    onSubmit,
    onCancel,
    isLoading = false
}: CategoryFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [parentId, setParentId] = useState<string>(initialData?.parent ? initialData.parent.toString() : "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image ? getImageUrl(initialData.image) : null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isEditMode = !!initialData;



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const handleClearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        if (parentId) {
            formData.append("parent", parentId);
        }
        if (imageFile) {
            formData.append("image", imageFile);
        }
        await onSubmit(formData);
    };

    // Filter out self and children from parent options to prevent cycles
    const availableParents = categories.filter(c => {
        if (!initialData) return true;
        // Don't show self
        if (c.id === initialData.id) return false;
        // TODO: ideally recursively check if 'c' is a descendant of initialData
        return true;
    });

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-4xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
            {/* Header */}
            <div className="bg-linear-to-r from-[#0e4d80] to-[#0a3a60] px-8 py-5 flex items-center justify-between shrink-0">
                <h2 className="font-koulen text-2xl text-white tracking-widest uppercase">
                    {isEditMode ? "Edit Category" : "Build Category"}
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Image */}
                    <div className="md:col-span-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                            Visual Avatar
                        </label>
                        <div
                            className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-[#0e4d80] transition-all group relative overflow-hidden bg-gray-50/50"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <>
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-contain p-2"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-xs font-bold uppercase tracking-widest">Change Image</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-400 group-hover:text-[#0e4d80] transition-colors">
                                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Add Brand Icon</p>
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
                        {imagePreview && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearImage();
                                }}
                                className="mt-2 w-full text-[10px] text-red-500 font-bold uppercase tracking-widest hover:text-red-700"
                            >
                                Remove Image
                            </button>
                        )}
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-2 space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                                Designation *
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="E.g. Performance Wear"
                                className="block w-full rounded-2xl border-gray-100 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 sm:text-sm py-3 px-4 font-medium bg-gray-50 border outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* Slug (Read-only for now, or could be editable) */}
                        {isEditMode && initialData?.slug && (
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                    Path Identifier (URL)
                                </label>
                                <div className="py-3 px-4 bg-gray-100/50 rounded-2xl border border-gray-100 text-gray-400 text-[11px] font-mono tracking-wider">
                                    /{initialData.slug}
                                </div>
                            </div>
                        )}

                        {/* Parent Category */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                                Hierarchy Layer
                            </label>
                            <div className="relative">
                                <select
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value)}
                                    className="block w-full rounded-2xl border-gray-100 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 text-sm py-3 px-4 font-medium bg-white border appearance-none outline-none transition-all"
                                >
                                    <option value="">Master Category (Top Level)</option>
                                    {availableParents.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center px-2 text-gray-400">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                                Narrative Info
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="block w-full rounded-2xl border-gray-100 shadow-sm focus:border-[#0e4d80] focus:ring-4 focus:ring-[#0e4d80]/5 sm:text-sm py-3 px-4 font-medium bg-gray-50 border outline-none transition-all placeholder:text-gray-400"
                                placeholder="Details about this segment..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-3 border border-gray-200 text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-white hover:border-gray-300 transition-all shadow-sm"
                >
                    Discard
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-10 py-3 bg-[#0e4d80] text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-[#0b3d66] transition-all shadow-lg hover:shadow-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "SAVING..." : (isEditMode ? "UPDATE CATEGORY" : "SAVE CATEGORY")}
                </button>
            </div>
        </form>
    );
}
