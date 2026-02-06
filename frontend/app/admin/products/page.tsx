"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { productsApi, categoriesApi, attributesApi } from "@/app/lib/api/client";
import { Product, ProductVariant } from "@/app/types/product";
import { Category } from "@/app/types/category";
import { Color, Size, Tag, } from "@/app/types/attributes";
import { getImageUrl } from "@/app/lib/utils/image";
import ProductForm from "@/app/components/admin/ProductForm";
import { revalidateProducts } from "@/app/lib/actions";
import {
  ChevronDown,
  Loader2,
  X,
  Upload,
  Package,
  Activity,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import MessageModal from "@/app/components/ui/MessageModal";
import { SortIcon } from "@/app/components/admin/SortIcon";

interface ProductStats {
  min_price: number;
  max_price: number;
  total_count: number;
  total_stock: number;
  total_value: number;
  avg_price: number;
  active_count: number;
  low_stock_count: number;
}

export default function AdminProductsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ next: string | null; previous: string | null; count: number }>({
    next: null,
    previous: null,
    count: 0
  });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const PAGE_SIZE = 50;

  // Edit/Stock State
  const [expandedProductIds, setExpandedProductIds] = useState<Set<number>>(
    new Set(),
  );

  // Variant Edit State
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [variantStockValue, setVariantStockValue] = useState<number>(0);
  const [isUpdatingVariant, setIsUpdatingVariant] = useState(false);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    undefined,
  );
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Variant Management State
  const [isVariantDeleteModalOpen, setIsVariantDeleteModalOpen] =
    useState(false);
  const [variantToDelete, setVariantToDelete] = useState<{
    productId: number;
    variant: ProductVariant;
  } | null>(null);
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);
  const [uploadingColorId, setUploadingColorId] = useState<number | null>(null);

  // Attribute State
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // Message Modal
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  // Dashboard Stats
  const [stats, setStats] = useState<ProductStats>({
    min_price: 0,
    max_price: 1000,
    total_count: 0,
    total_stock: 0,
    total_value: 0,
    avg_price: 0,
    active_count: 0,
    low_stock_count: 0,
  });

  const fetchData = React.useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page: currentPage, page_size: PAGE_SIZE };
      if (sortConfig) {
        let key = sortConfig.key;
        if (key === 'stock') key = 'total_stock_level';
        params.ordering = sortConfig.direction === 'desc' ? `-${key}` : key;
      }
      const [productsRes, statsRes] = await Promise.all([
        productsApi.getProducts(
          params,
          { revalidate: 0 },
        ),
        productsApi.getProductStats(params) // Fetch stats with same filters
      ]);
      setProducts(productsRes.results);
      setStats(statsRes);
      setPagination({
        next: productsRes.next,
        previous: productsRes.previous,
        count: productsRes.count
      });
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  }, [sortConfig]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || (!user?.is_staff && !user?.is_superuser)) {
        router.push("/");
        return;
      }
      fetchData(page);
    }
  }, [isAuthenticated, loading, user, router, page, fetchData]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const fetchAttributes = async () => {
    try {
      const [cats, colors, sizes, tags] = await Promise.all([
        categoriesApi.getCategories(),
        attributesApi.getColors(),
        attributesApi.getSizes(),
        attributesApi.getTags(),
      ]);
      setCategories(cats);
      setAvailableColors(colors);
      setAvailableSizes(sizes);
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to fetch attributes", error);
    }
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productsApi.deleteProduct(productToDelete.id);
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      await revalidateProducts();
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete product.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Toggle Logic
  const handleToggleStatus = async (product: Product) => {
    const newStatus = !product.is_active;
    try {
      // Optimistic update
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, is_active: newStatus } : p,
        ),
      );

      await productsApi.updateProduct(product.id, { is_active: newStatus });
      await revalidateProducts();
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert on failure
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, is_active: !newStatus } : p,
        ),
      );
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to update status.",
        type: "error",
      });
    }
  };
  const toggleProductExpansion = (productId: number) => {
    const newExpanded = new Set(expandedProductIds);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProductIds(newExpanded);
  };

  const handleToggleVariantStatus = async (
    productId: number,
    variant: ProductVariant,
  ) => {
    const newStatus = !variant.is_active;
    try {
      await productsApi.updateVariant(
        productId,
        variant.color_id,
        variant.size_id,
        {
          is_active: newStatus,
        },
      );

      // Refresh local state
      setProducts(
        products.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              variants: p.variants.map((v) =>
                v.id === variant.id ? { ...v, is_active: newStatus } : v,
              ),
            };
          }
          return p;
        }),
      );
      await revalidateProducts();
    } catch (error) {
      console.error("Failed to update variant status", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to update variant status.",
        type: "error",
      });
    }
  };

  const handleDeleteVariant = (productId: number, variant: ProductVariant) => {
    setVariantToDelete({ productId, variant });
    setIsVariantDeleteModalOpen(true);
  };

  const confirmDeleteVariant = async () => {
    if (!variantToDelete) return;
    setIsDeletingVariant(true);
    try {
      await productsApi.deleteVariant(
        variantToDelete.productId,
        variantToDelete.variant.color_id,
        variantToDelete.variant.size_id,
      );

      // Update local state
      setProducts(
        products.map((p) => {
          if (p.id === variantToDelete.productId) {
            return {
              ...p,
              variants: p.variants.filter(
                (v) => v.id !== variantToDelete.variant.id,
              ),
            };
          }
          return p;
        }),
      );

      await revalidateProducts();
      setIsVariantDeleteModalOpen(false);
      setVariantToDelete(null);
    } catch (error) {
      console.error("Failed to delete variant", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to delete variant.",
        type: "error",
      });
    } finally {
      setIsDeletingVariant(false);
    }
  };

  const handleVariantImageUpload = async (
    productId: number,
    colorId: number,
    file: File,
  ) => {
    setUploadingColorId(colorId);
    try {
      await productsApi.updateColorImage(productId, colorId, file);
      // Re-fetch product data to get new image URLs
      await fetchData(page);
      await revalidateProducts();
    } catch (error) {
      console.error("Failed to upload image", error);
      setMessageModal({
        isOpen: true,
        title: "Upload Error",
        message: "Failed to upload image.",
        type: "error",
      });
    } finally {
      setUploadingColorId(null);
    }
  };

  const startEditingVariantStock = (variant: ProductVariant) => {
    setEditingVariantId(variant.id);
    setVariantStockValue(variant.stock);
  };

  const saveVariantStock = async (
    productId: number,
    variant: ProductVariant,
  ) => {
    setIsUpdatingVariant(true);
    try {
      await productsApi.updateVariant(
        productId,
        variant.color_id,
        variant.size_id,
        {
          stock: variantStockValue,
        },
      );
      setEditingVariantId(null);
      fetchData(page);
      await revalidateProducts();
    } catch (error) {
      console.error("Failed to update variant stock", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to update variant stock.",
        type: "error",
      });
    } finally {
      setIsUpdatingVariant(false);
    }
  };
  const openEditModal = async (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);

    // Lazy load attributes if we don't have them yet
    if (categories.length === 0 || availableColors.length === 0) {
      await fetchAttributes();
    }
  };

  const closeEditModal = () => {
    setSelectedProduct(undefined);
    setIsEditModalOpen(false);
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!selectedProduct) return;
    setIsSavingProduct(true);
    try {
      const updatedProduct = await productsApi.updateProduct(
        selectedProduct.id,
        formData,
      );

      // Update the product in the local list
      setProducts(
        products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
      );
      await revalidateProducts();
      closeEditModal();
    } catch (error) {
      console.error("Failed to update product", error);
      setMessageModal({
        isOpen: true,
        title: "Error",
        message: "Failed to update product.",
        type: "error",
      });
    } finally {
      setIsSavingProduct(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8 pb-20">
      {/* Header section - Hero Style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-white rounded-[2.5rem] p-8 border border-blue-100 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-full bg-blue-100/30 skew-x-[-20deg] translate-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="px-4 py-1.5 rounded-full border border-blue-100 bg-white/80 backdrop-blur-sm shadow-sm inline-flex items-center gap-2 mb-4">
              <span className="font-koulen text-[10px] text-[#0e4d80] uppercase tracking-[0.2em]">
                Inventory Control
              </span>
            </div>
            <h1 className="font-koulen text-5xl md:text-6xl tracking-tight text-[#0e4d80] leading-[0.9]">
              Products <span className="text-gray-300">Manager</span>
            </h1>
            <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-2 font-bold ml-1">
              Manage Catalog & Stock
            </p>
          </div>
          <Link
            href="/admin/products/create"
            className="font-istok text-[11px] uppercase tracking-widest font-bold px-8 py-4 bg-[#0e4d80] text-white hover:bg-[#0c3b60] hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 rounded-full shadow-md flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            ADD PRODUCT
          </Link>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[
          { label: "Total Products", value: stats.total_count, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active", value: stats.active_count, icon: Activity, color: "text-green-600", bg: "bg-green-50" },
          { label: "Low Stock", value: stats.low_stock_count, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Stock Value", value: `฿${Number(stats.total_value).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Avg Price", value: `฿${Number(stats.avg_price).toFixed(0)}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-900/5 border border-gray-100 hover:border-gray-200 transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <p className="font-istok text-[10px] uppercase tracking-widest text-gray-400 font-bold">{stat.label}</p>
              <div className={`p-2.5 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <h3 className={`font-koulen text-3xl tracking-tight leading-none ${stat.color === 'text-black' ? 'text-gray-900' : stat.color}`}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 min-h-[400px]">
            <Loader2 className="w-12 h-12 text-[#0e4d80] animate-spin mb-4" />
            <p className="font-koulen text-xl text-gray-300 tracking-widest animate-pulse">Loading Inventory...</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0e4d80]"></span>
                <h3 className="font-koulen text-lg text-gray-500 uppercase tracking-wide">Catalog Overview</h3>
              </div>
              <div className="font-istok text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                {products.length} Items Found
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white">
                  <tr>
                    <th className="w-12 px-6 py-5"></th>
                    <th className="px-6 py-5 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Visual</th>
                    <th
                      className="px-6 py-5 text-left cursor-pointer group hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2 font-koulen text-xs text-gray-400 uppercase tracking-wider font-light group-hover:text-[#0e4d80]">
                        Details <SortIcon columnKey="name" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th
                      className="px-6 py-5 text-left cursor-pointer group hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center gap-2 font-koulen text-xs text-gray-400 uppercase tracking-wider font-light group-hover:text-[#0e4d80]">
                        Price <SortIcon columnKey="price" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th
                      className="px-6 py-5 text-left cursor-pointer group hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('is_active')}
                    >
                      <div className="flex items-center gap-2 font-koulen text-xs text-gray-400 uppercase tracking-wider font-light group-hover:text-[#0e4d80]">
                        Status <SortIcon columnKey="is_active" sortConfig={sortConfig} />
                      </div>
                    </th>
                    <th className="px-6 py-5 text-left font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Tags</th>
                    <th className="px-6 py-5 text-right font-koulen text-xs text-gray-400 uppercase tracking-wider font-light">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {products.map((product) => {
                    const isExpanded = expandedProductIds.has(product.id);
                    const hasVariants = product.variants && product.variants.length > 0;

                    return (
                      <React.Fragment key={product.id}>
                        <tr className={`hover:bg-blue-50/20 transition-colors group ${isExpanded ? 'bg-gray-50/50' : ''}`}>
                          <td className="px-6 py-5">
                            {hasVariants && (
                              <button
                                onClick={() => toggleProductExpansion(product.id)}
                                className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-[#0e4d80] text-white rotate-180' : 'bg-gray-100 text-gray-400 hover:bg-[#0e4d80] hover:text-white'}`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="h-16 w-16 relative bg-white border border-gray-100 rounded-xl overflow-hidden p-1 shadow-sm group-hover:shadow-md transition-shadow">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={getImageUrl(product.images[0])}
                                  alt={product.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[8px] text-gray-300 font-bold">NO IMG</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div>
                              <div className="font-koulen text-lg text-[#0e4d80] tracking-wide uppercase group-hover:text-blue-600 transition-colors">
                                {product.name}
                              </div>
                              <div className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 border border-gray-200 mt-1">
                                <span className="font-istok text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                                  SKU: {product.id.toString().padStart(6, "0")}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            {product.discount && product.discount > 0 ? (
                              <div className="flex flex-col">
                                <span className="font-koulen text-xl text-black">
                                  ฿{Number(product.price).toFixed(0)}
                                </span>
                                <span className="font-istok text-[#D2042D] text-[10px] line-through uppercase tracking-widest font-bold opacity-60">
                                  ฿{Number(product.originalPrice || product.price).toFixed(0)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-koulen text-xl text-black">
                                ฿{Number(product.price).toFixed(0)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStatus(product)}
                              className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full border transition-all flex items-center gap-2 group/status shadow-sm active:scale-95 w-fit ${product.is_active
                                ? "border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-300"
                                : "border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
                                }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${product.is_active ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
                              {product.is_active ? "Active" : "Hidden"}
                            </button>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                              {product.tags && product.tags.length > 0 ? (
                                product.tags.map((tag, idx) => (
                                  <span
                                    key={`${product.id}-tag-${idx}`}
                                    className="px-2 py-0.5 font-istok text-[8px] rounded-md uppercase tracking-widest font-bold border border-blue-100 bg-blue-50 text-blue-600"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-300 font-istok text-[9px] uppercase tracking-widest italic">No tags</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => openEditModal(product)}
                                className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#0e4d80] bg-blue-50 border border-blue-100 hover:bg-[#0e4d80] hover:text-white transition-all shadow-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
                                className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Variant Sub-rows */}
                        {isExpanded && hasVariants && (
                          <tr className="bg-gray-50/50 border-t border-gray-100">
                            <td colSpan={7} className="px-6 py-6 p-0">
                              <div className="pl-14 grid gap-3">
                                <div className="font-istok text-[9px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-1 pl-2 border-l-2 border-[#0e4d80]">Product Variants</div>
                                {product.variants.map((variant) => (
                                  <div
                                    key={`variant-${variant.id}`}
                                    className="flex items-center gap-6 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors mx-2"
                                  >
                                    {/* Variant Image */}
                                    <div className="relative group/vimg cursor-pointer w-12 h-12 shrink-0">
                                      <div
                                        className="w-12 h-12 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                                        onClick={() => document.getElementById(`v-image-input-${variant.id}`)?.click()}
                                      >
                                        {(() => {
                                          const colorSpec = product.colors?.find(c => c.color_id === variant.color_id);
                                          const variantImage = colorSpec?.image || (product.images && product.images[0]);
                                          return (
                                            <>
                                              <Image
                                                src={getImageUrl(variantImage)}
                                                alt={variant.color_name}
                                                fill
                                                className={`object-contain transition-opacity ${uploadingColorId === variant.color_id ? "opacity-30" : "group-hover/vimg:opacity-50"}`}
                                              />
                                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/vimg:opacity-100 transition-opacity bg-black/5">
                                                <Upload className="w-4 h-4 text-[#0e4d80]" />
                                              </div>
                                              {uploadingColorId === variant.color_id && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                  <Loader2 className="w-4 h-4 text-[#0e4d80] animate-spin" />
                                                </div>
                                              )}
                                              <input
                                                type="file"
                                                id={`v-image-input-${variant.id}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) handleVariantImageUpload(product.id, variant.color_id, file);
                                                }}
                                              />
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    {/* Variant Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-gray-400 font-istok uppercase tracking-wider font-bold">Details</span>
                                        <div className="flex gap-2">
                                          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-[9px] font-bold text-gray-600 uppercase tracking-wider border border-gray-200">
                                            <div className="w-2 h-2 rounded-full border border-gray-300" style={{ backgroundColor: variant.color_code }}></div>
                                            {variant.color_name}
                                          </div>
                                          <div className="px-2 py-1 bg-gray-100 rounded text-[9px] font-bold text-gray-600 uppercase tracking-wider border border-gray-200">
                                            Size: {variant.size_name}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="h-8 w-px bg-gray-100 mx-2"></div>

                                      {/* Stock Control */}
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-gray-400 font-istok uppercase tracking-wider font-bold">Stock Level</span>
                                        <div className="flex items-center gap-2">
                                          {editingVariantId === variant.id ? (
                                            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                              <input
                                                type="number"
                                                value={variantStockValue}
                                                onChange={(e) => setVariantStockValue(parseInt(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 bg-white border border-[#0e4d80] rounded text-sm font-bold text-[#0e4d80] focus:outline-none"
                                                autoFocus
                                              />
                                              <button
                                                onClick={() => saveVariantStock(product.id, variant)}
                                                disabled={isUpdatingVariant}
                                                className="p-1 bg-[#0e4d80] text-white rounded hover:bg-[#0a3557] transition-colors"
                                              >
                                                {isUpdatingVariant ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3 rotate-90" />}
                                              </button>
                                              <button
                                                onClick={() => setEditingVariantId(null)}
                                                className="p-1 bg-gray-200 text-gray-500 rounded hover:bg-gray-300 transition-colors"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </div>
                                          ) : (
                                            <div
                                              className="group/stock flex items-center gap-2 cursor-pointer"
                                              onClick={() => startEditingVariantStock(variant)}
                                            >
                                              <span className={`font-koulen text-lg ${variant.stock < 10 ? "text-red-500" : "text-gray-700"} group-hover/stock:text-[#0e4d80] transition-colors`}>
                                                {variant.stock}
                                              </span>
                                              <div className="opacity-0 group-hover/stock:opacity-100 transition-opacity">
                                                <div className="p-1 bg-gray-100 rounded text-gray-400">
                                                  <Activity className="w-3 h-3" />
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Variant Actions */}
                                    <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
                                      <button
                                        onClick={() => handleToggleVariantStatus(product.id, variant)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${variant.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        title={variant.is_active ? "Active" : "Inactive"}
                                      >
                                        <div className={`w-2 h-2 rounded-full ${variant.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteVariant(product.id, variant)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                                        title="Delete Variant"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination Stats */}
            {!isLoading && products.length > 0 && (
              <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 font-istok uppercase tracking-widest font-bold">
                  Displaying Page <span className="text-[#0e4d80] text-sm mx-1">{page}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!pagination.previous}
                    className="px-4 py-2 flex items-center gap-2 rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0e4d80] hover:text-[#0e4d80] hover:shadow-md transition-all font-istok text-[10px] font-bold uppercase tracking-widest"
                  >
                    <ChevronDown className="w-3 h-3 rotate-90" /> Prev
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!pagination.next}
                    className="px-4 py-2 flex items-center gap-2 rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0e4d80] hover:text-[#0e4d80] hover:shadow-md transition-all font-istok text-[10px] font-bold uppercase tracking-widest"
                  >
                    Next <ChevronDown className="w-3 h-3 -rotate-90" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals placed here */}
      {selectedProduct && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isEditModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="bg-[#FDFDFB] rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl scale-100 transition-transform duration-300 transform no-scrollbar">
            <div className="flex justify-between items-center p-8 border-b border-gray-100 sticky top-0 bg-[#FDFDFB] z-10">
              <div>
                <h2 className="font-koulen text-3xl text-[#0e4d80] uppercase tracking-wide">Edit Product</h2>
                <p className="font-istok text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">
                  ID: #{selectedProduct.id}
                </p>
              </div>
              <button onClick={closeEditModal} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-8">
              <ProductForm
                key={selectedProduct.id}
                initialData={selectedProduct}
                categories={categories}
                availableColors={availableColors}
                availableSizes={availableSizes}
                availableTags={availableTags}
                onSubmit={handleUpdateProduct}
                onCancel={closeEditModal}
                isLoading={isSavingProduct}
              />
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <MessageModal
          isOpen={isDeleteModalOpen}
          title="Confirm Delete"
          message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
          type="error"
          onClose={() => setIsDeleteModalOpen(false)}
          actions={
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2 rounded-full border border-gray-200 font-istok text-xs font-bold uppercase tracking-widest hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-6 py-2 rounded-full bg-red-600 text-white font-istok text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                Delete Forever
              </button>
            </div>
          }
        />
      )}

      {isVariantDeleteModalOpen && (
        <MessageModal
          isOpen={isVariantDeleteModalOpen}
          title="Delete Variant"
          message={`Are you sure you want to delete this variant? This will remove specific stock data.`}
          type="error"
          onClose={() => setIsVariantDeleteModalOpen(false)}
          actions={
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsVariantDeleteModalOpen(false)}
                className="px-6 py-2 rounded-full border border-gray-200 font-istok text-xs font-bold uppercase tracking-widest hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteVariant}
                disabled={isDeletingVariant}
                className="px-6 py-2 rounded-full bg-red-600 text-white font-istok text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingVariant && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          }
        />
      )}

      {messageModal.isOpen && !isDeleteModalOpen && !isVariantDeleteModalOpen && (
        <MessageModal
          isOpen={messageModal.isOpen}
          title={messageModal.title}
          message={messageModal.message}
          type={messageModal.type}
          onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
        />
      )}
    </div>
  );
}
