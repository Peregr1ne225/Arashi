"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { productsApi, categoriesApi, attributesApi } from "@/app/lib/api/client";
import { Category } from "@/app/types/category";
import { Color, Size, Tag } from "@/app/types/attributes";
import { revalidateProducts } from "@/app/lib/actions";
import ProductForm from "@/app/components/admin/ProductForm";

import Link from "next/link";
import MessageModal from "@/app/components/ui/MessageModal";

export default function CreateProductPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Message Modal
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
        router.push("/");
        return;
      }
      fetchData();
    }
  }, [isAuthenticated, loading, user, router]);

  const fetchData = async () => {
    try {
      const [cats, cols, szs, tgs] = await Promise.all([
        categoriesApi.getCategories({}, { revalidate: 0 }),
        attributesApi.getColors(),
        attributesApi.getSizes(),
        attributesApi.getTags()
      ]);
      setCategories(cats);
      setColors(cols);
      setSizes(szs);
      setTags(tgs);
    } catch (error) {
      console.error("Failed to fetch form data", error);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await productsApi.createProduct(formData);
      await revalidateProducts();
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product - Full error:", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to create product.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-blue-50 to-white border border-blue-100/50 shadow-sm p-12 mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0e4d80]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 mb-6 px-5 py-2.5 bg-white rounded-full border border-gray-100 shadow-sm text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#0e4d80] hover:border-blue-100 transition-all hover:-translate-y-0.5"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to Products
            </button>
            <h1 className="font-koulen text-5xl text-[#0e4d80] uppercase tracking-wide leading-none mb-2">
              Create New <span className="text-[#0e4d80]/40">Product</span>
            </h1>
            <p className="font-istok text-gray-400 text-sm font-bold tracking-wider max-w-xl">
              Add a new item to your catalog. Configure variants, pricing strategies, and visual assets.
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-8 py-4 bg-white rounded-full shadow-lg shadow-blue-900/5 border border-gray-100 group hover:border-[#0e4d80]/30 transition-all hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-[#0e4d80] transition-colors">
                <span className="text-[#0e4d80] group-hover:text-white font-koulen text-lg pt-0.5">C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#0e4d80] transition-colors">Manage</span>
                <span className="font-koulen text-xl text-[#0e4d80] leading-none">Categories</span>
              </div>
            </Link>

            <Link
              href="/admin/attributes"
              className="flex items-center gap-3 px-8 py-4 bg-white rounded-full shadow-lg shadow-blue-900/5 border border-gray-100 group hover:border-[#0e4d80]/30 transition-all hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-[#0e4d80] transition-colors">
                <span className="text-purple-600 group-hover:text-white font-koulen text-lg pt-0.5">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-[#0e4d80] transition-colors">Manage</span>
                <span className="font-koulen text-xl text-[#0e4d80] leading-none">Variants</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full">
        <ProductForm
          categories={categories}
          availableColors={colors}
          availableSizes={sizes}
          availableTags={tags}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
        <MessageModal
          isOpen={messageModal.isOpen}
          title={messageModal.title}
          message={messageModal.message}
          type={messageModal.type}
          onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
        />
      </div>
    </div>
  );
}
