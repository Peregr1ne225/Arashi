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

export default function CreateProductPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

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
      alert("Failed to create product");
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
            className="font-istok text-[10px] uppercase tracking-widest text-gray-400 hover:text-black mb-4 flex items-center"
          >
            ← Back to Products
          </button>
          <h2 className="font-koulen text-[28px] text-black uppercase tracking-tight">Create New Product</h2>
          <div className="h-0.5 w-8 bg-[#D2042D]"></div>
        </div>
        <Link
          href="/admin/categories"
          className="font-istok text-[10px] uppercase tracking-widest bg-white border border-gray-200 hover:border-[#D2042D] hover:text-[#D2042D] px-4 py-2 rounded-sm font-bold text-gray-600 transition-all shadow-sm"
        >
          Manage Categories
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
      </div>
    </div>
  );
}
