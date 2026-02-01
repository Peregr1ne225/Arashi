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
      <div className="flex justify-between items-end">
        <div>
          <button
            onClick={() => router.back()}
            className="font-istok text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-[#0e4d80] mb-6 flex items-center transition-colors font-bold"
          >
            ← Back to Products
          </button>
          <h2 className="font-koulen text-4xl text-[#0e4d80] uppercase tracking-wide">
            New <span className="text-[#0e4d80]/60">Product</span>
          </h2>
          <div className="h-1 w-12 bg-[#0e4d80]/20 mt-2 rounded-full"></div>
        </div>
        <Link
          href="/admin/categories"
          className="font-istok text-[10px] uppercase tracking-[0.2em] bg-white border border-gray-100 hover:border-[#0e4d80] hover:text-[#0e4d80] px-6 py-3 rounded-full font-bold text-gray-400 transition-all shadow-sm shadow-blue-900/5"
        >
          Categories
        </Link>
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
