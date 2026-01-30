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
  ChevronUp,
  Loader2,
  Link2,
  AlertTriangle,
  X,
  Upload,
  Package,
  Activity,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
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
      alert("Failed to delete product");
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
      alert("Failed to update status");
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
      alert("Failed to update variant status");
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
      alert("Failed to delete variant");
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
      alert("Failed to upload image");
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
      alert("Failed to update variant stock");
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
      alert("Failed to update product");
    } finally {
      setIsSavingProduct(false);
    }
  };

  return (
    <div className="pt-8 flex flex-col space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-koulen text-4xl tracking-wide text-[#0e4d80]">
            Products <span className="text-[#D2042D]">Manager</span>
          </h1>
          <p className="font-istok text-xs text-gray-500 uppercase tracking-[0.2em] mt-1 font-bold">
            Manage Products
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="font-istok text-[11px] uppercase tracking-widest font-bold px-6 py-3 bg-[#0e4d80] text-white hover:brightness-110 hover:shadow-xl hover:shadow-[#0e4d80]/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 rounded-full shadow-lg shadow-black/10"
        >
          + ADD PRODUCT
        </Link>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="card-sport p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-istok text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                Total Products
              </p>
              <p className="font-koulen text-2xl text-black tracking-wide">
                {stats.total_count}
              </p>
            </div>
            <div className="p-3 bg-[#0047AB]/10 rounded-sm">
              <Package className="w-5 h-5 text-[#0047AB]" />
            </div>
          </div>
        </div>

        <div className="card-sport p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-istok text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                Active Products
              </p>
              <p className="font-koulen text-2xl text-green-600 tracking-wide">
                {stats.active_count}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card-sport p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-istok text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                Low Stock
              </p>
              <p className="font-koulen text-2xl text-red-600 tracking-wide">
                {stats.low_stock_count}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card-sport p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-istok text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                Stock Value
              </p>
              <p className="font-koulen text-xl text-black tracking-wide truncate">
                ฿{Number(stats.total_value).toLocaleString("th-TH", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card-sport p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-istok text-[9px] text-gray-500 uppercase tracking-widest mb-1">
                Avg Price
              </p>
              <p className="font-koulen text-xl text-black tracking-wide truncate">
                ฿{Number(stats.avg_price).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card-sport overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100 table-fixed">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="w-10 px-4 py-4"></th>
              <th className="px-6 py-4 text-left font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                Visual
              </th>
              <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                  Product Details <SortIcon columnKey="name" sortConfig={sortConfig} />
                </div>
              </th>
              <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('price')}>
                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                  Price Point <SortIcon columnKey="price" sortConfig={sortConfig} />
                </div>
              </th>
              <th className="px-6 py-4 text-left cursor-pointer group hover:bg-gray-200 transition-colors" onClick={() => handleSort('is_active')}>
                <div className="flex items-center gap-2 font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                  Status <SortIcon columnKey="is_active" sortConfig={sortConfig} />
                </div>
              </th>
              <th className="px-6 py-4 text-left font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                Tags
              </th>
              <th className="px-6 py-4 text-right font-istok text-[10px] text-gray-500 uppercase tracking-widest">
                Control
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {products.map((product) => {
              const isExpanded = expandedProductIds.has(product.id);
              const hasVariants =
                product.variants && product.variants.length > 0;

              return (
                <React.Fragment key={product.id}>
                  <tr className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-6">
                      {hasVariants && (
                        <button
                          onClick={() => toggleProductExpansion(product.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="h-16 w-16 relative bg-white border border-gray-100 rounded-lg overflow-hidden p-1 shadow-inner">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={getImageUrl(
                              product.images[0],
                            )}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">
                            NO MEDIA
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-koulen text-lg text-black tracking-wider uppercase">
                        {product.name}
                      </div>
                      <div className="font-istok text-[9px] text-white uppercase tracking-widest mt-1 bg-gray-400/50 px-1 py-0.5 rounded-xs inline-block">
                        SKU: {product.id.toString().padStart(6, "0")}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      {product.discount && product.discount > 0 ? (
                        <div className="flex flex-col">
                          <span className="font-koulen text-black text-base">
                            ฿{Number(product.price).toFixed(2)}
                          </span>
                          <span className="font-istok text-red-500 text-[10px] line-through uppercase tracking-widest">
                            ฿
                            {Number(
                              product.originalPrice || product.price,
                            ).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-koulen text-black text-base">
                          ฿{Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        title={`Click to ${product.is_active ? "Archive" : "Activate"}`}
                        className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full border transition-all flex items-center gap-2 group/status shadow-xs hover:shadow-sm active:scale-95 ${product.is_active
                          ? "border-green-500/30 text-green-600 bg-green-500/5 hover:bg-green-500/10 hover:border-red-500/30"
                          : "border-red-500/30 text-red-600 bg-red-500/5 hover:bg-red-500/10 hover:border-green-500/30"
                          }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover/status:scale-110 ${product.is_active
                            ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)] group-hover/status:bg-red-500 group-hover/status:shadow-[0_0_5px_rgba(239,68,68,0.4)]"
                            : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.4)] group-hover/status:bg-green-500 group-hover/status:shadow-[0_0_5px_rgba(34,197,94,0.4)]"
                            }`}
                        ></div>
                        {product.is_active ? "Active" : "Archived"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 max-w-50">
                        {product.tags && product.tags.length > 0 ? (
                          product.tags.map((tag, idx) => {
                            // Deterministic color assignment based on tag string
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
                              .reduce(
                                (acc, char) =>
                                  char.charCodeAt(0) + ((acc << 5) - acc),
                                0,
                              );
                            const colorClass =
                              colors[Math.abs(hash) % colors.length];

                            return (
                              <span
                                key={`${product.id}-tag-${idx}`}
                                className={`px-1.5 py-0.5 font-istok text-[8px] rounded-xs uppercase tracking-widest font-bold border ${colorClass}`}
                              >
                                {tag}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-300 font-istok text-[8px] uppercase tracking-widest italic">
                            No tags
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-[#0047AB] hover:text-[#003380] font-bold uppercase text-xs tracking-wider"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="text-[#D2042D] hover:text-[#9e0322] font-bold uppercase text-xs tracking-wider ml-2"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Variant Sub-rows */}
                  {isExpanded &&
                    hasVariants &&
                    product.variants.map((variant) => (
                      <tr
                        key={`variant-${variant.id}`}
                        className="bg-gray-50/10 border-l-4 border-l-[#D2042D]/20 animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        <td className="px-4 py-4"></td>
                        <td className="px-6 py-4 pl-12">
                          <div
                            className="w-14 h-14 relative bg-white border border-gray-100 rounded-sm overflow-hidden p-0.5 shadow-sm group/vimg cursor-pointer transition-all hover:border-[#D2042D]/50"
                            onClick={() =>
                              document
                                .getElementById(`v-image-input-${variant.id}`)
                                ?.click()
                            }
                          >
                            {(() => {
                              const colorSpec = product.colors?.find(
                                (c) => c.color_id === variant.color_id,
                              );
                              const variantImage =
                                colorSpec?.image ||
                                (product.images && product.images[0]);
                              return (
                                <>
                                  <Image
                                    src={getImageUrl(variantImage)}
                                    alt={variant.color_name}
                                    fill
                                    className={`object-contain transition-opacity ${uploadingColorId === variant.color_id ? "opacity-30" : "group-hover/vimg:opacity-50"}`}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/vimg:opacity-100 transition-opacity">
                                    <Upload className="w-4 h-4 text-[#D2042D]" />
                                  </div>
                                  {uploadingColorId === variant.color_id && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Loader2 className="w-4 h-4 text-[#D2042D] animate-spin" />
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    id={`v-image-input-${variant.id}`}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file)
                                        handleVariantImageUpload(
                                          product.id,
                                          variant.color_id,
                                          file,
                                        );
                                    }}
                                  />
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center gap-2 font-istok text-[8px] text-white uppercase tracking-widest bg-gray-400/50 px-1.5 py-0.5 rounded-xs font-bold">
                                <span>Color: {variant.color_name}</span>
                                <div
                                  className="w-2 h-2 rounded-full border border-white/20 shadow-xs"
                                  style={{
                                    backgroundColor: variant.color_code,
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="font-istok text-[8px] text-white uppercase tracking-widest bg-[#D2042D]/40 px-1.5 py-0.5 rounded-xs inline-block font-bold w-fit">
                              Size: {variant.size_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center justify-center w-fit p-1.5 bg-[#0047AB]/5 rounded-xs border border-[#0047AB]/10 group/link shadow-xs transition-all hover:shadow-sm"
                            title="Price inherited from parent"
                          >
                            <Link2 className="w-4 h-4 text-[#0047AB]/50 group-hover/link:text-[#0047AB] transition-colors" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingVariantId === variant.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={variantStockValue}
                                onChange={(e) =>
                                  setVariantStockValue(
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="w-16 bg-white border border-gray-200 rounded-sm px-2 py-1 text-xs text-black outline-none focus:border-[#D2042D]"
                                min="0"
                              />
                              <button
                                onClick={() =>
                                  saveVariantStock(product.id, variant)
                                }
                                disabled={isUpdatingVariant}
                                className="text-[#D2042D] font-bold text-[10px] uppercase tracking-widest"
                              >
                                {isUpdatingVariant ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Set"
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 group/var">
                              <span
                                className={`font-koulen text-sm ${variant.stock < 5 ? "text-red-500" : "text-gray-400"}`}
                              >
                                {variant.stock}
                              </span>
                              <button
                                onClick={() =>
                                  startEditingVariantStock(variant)
                                }
                                className="opacity-0 group-hover/var:opacity-100 font-istok text-[9px] text-[#0047AB] uppercase tracking-widest transition-opacity"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleToggleVariantStatus(product.id, variant)
                            }
                            title={`Click to ${variant.is_active ? "Archive" : "Activate"}`}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all flex items-center gap-1.5 group/vstatus shadow-xs hover:shadow-sm active:scale-95 ${variant.is_active
                              ? "border-green-500/20 text-green-600/70 bg-green-500/5 hover:bg-green-500/10 hover:border-red-500/20"
                              : "border-red-500/20 text-red-600/70 bg-red-500/5 hover:bg-red-500/10 hover:border-green-500/20"
                              }`}
                          >
                            <div
                              className={`w-1 h-1 rounded-full transition-all duration-300 group-hover/vstatus:scale-110 ${variant.is_active
                                ? "bg-green-500/60 group-hover/vstatus:bg-red-500/60"
                                : "bg-red-500/60 group-hover/vstatus:bg-green-500/60"
                                }`}
                            ></div>
                            {variant.is_active ? "Active" : "Archived"}
                          </button>
                        </td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              handleDeleteVariant(product.id, variant)
                            }
                            className="font-istok text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-white px-4 py-3 sm:px-6 shadow-sm rounded-b-lg">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination.previous || isLoading}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination.next || isLoading}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 font-istok">
              Showing <span className="font-bold">{((page - 1) * PAGE_SIZE) + 1}</span> to <span className="font-bold">{Math.min(page * PAGE_SIZE, pagination.count)}</span> of{' '}
              <span className="font-bold">{pagination.count}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.previous || isLoading}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
              </button>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                Page {page}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.next || isLoading}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-koulen text-black tracking-tight uppercase">
                  Edit Product: {selectedProduct.name}
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-100 scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-koulen text-black tracking-tight uppercase mb-2">
                  Delete Product?
                </h3>
                <p className="text-gray-500 font-istok text-sm leading-relaxed mb-8">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-black text-xs uppercase tracking-widest bg-gray-100 px-1 py-0.5 rounded-xs">
                    &quot;{productToDelete.name}&quot;
                  </span>
                  ? This action cannot be undone and will remove all associated
                  variations.
                </p>

                <div className="flex w-full gap-3">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setProductToDelete(null);
                    }}
                    disabled={isDeleting}
                    className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-istok text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 px-4 bg-[#D2042D] hover:bg-black text-white font-istok text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-red-500/10 flex items-center justify-center disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirm Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variant Delete Confirmation Modal */}
      {isVariantDeleteModalOpen && variantToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-70 p-4 transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-100 scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-koulen text-black tracking-tight uppercase mb-2">
                  Delete Variant?
                </h3>
                <p className="text-gray-500 font-istok text-sm leading-relaxed mb-8">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-black text-xs uppercase tracking-widest bg-gray-100 px-1 py-0.5 rounded-xs">
                    &quot;
                    {
                      products.find((p) => p.id === variantToDelete?.productId)
                        ?.name
                    }{" "}
                    {variantToDelete.variant.color_name}{" "}
                    {variantToDelete.variant.size_name}&quot;
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex w-full gap-3">
                  <button
                    onClick={() => {
                      setIsVariantDeleteModalOpen(false);
                      setVariantToDelete(null);
                    }}
                    disabled={isDeletingVariant}
                    className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-istok text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteVariant}
                    disabled={isDeletingVariant}
                    className="flex-1 py-3 px-4 bg-[#D2042D] hover:bg-black text-white font-istok text-[11px] font-bold uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-red-500/10 flex items-center justify-center disabled:opacity-50"
                  >
                    {isDeletingVariant ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirm Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
