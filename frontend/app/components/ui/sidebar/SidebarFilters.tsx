"use client";

import { useState, useEffect } from "react";
import { categoriesApi } from "@/app/lib/api/client";

// Define the category interface
interface Category {
  id: number;
  name: string;
  slug: string;
  parent?: number | null;
  children?: Category[];
}

interface SidebarFiltersProps {
  onFiltersChange: (filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
    sortBy: string;
  }) => void;
  initialFilters?: {
    category: string;
    minPrice: number;
    maxPrice: number;
    sortBy: string;
  };
  currentCategory?: string; // For highlighting the current category
  availableCategoryIds?: number[]; // For filtering displayed categories
  maxPrice?: number; // Dynamic max price limit
}

export default function SidebarFilters({
  onFiltersChange,
  initialFilters = {
    category: "",
    minPrice: 0,
    maxPrice: 0,
    sortBy: "featured",
  },
  currentCategory = "",
  availableCategoryIds,
  maxPrice = 1000,
}: SidebarFiltersProps) {
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Use passed maxPrice if valid, else default
  const limitMax = maxPrice > 0 ? maxPrice : 1000;

  const [filters, setFilters] = useState({
    ...initialFilters,
    category: initialFilters.category || currentCategory, // Prefer initialFilter, then prop
    maxPrice: (initialFilters.maxPrice > 0 && initialFilters.maxPrice < limitMax) ? initialFilters.maxPrice : limitMax
  });

  // Helper to build category tree
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap: { [key: number]: Category } = {};
    const roots: Category[] = [];

    // First pass: create map and initialize children
    categories.forEach((cat) => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });

    // Second pass: build tree
    categories.forEach((cat) => {
      if (cat.parent) {
        const parent = categoryMap[cat.parent];
        if (parent) {
          parent.children?.push(categoryMap[cat.id]);
        }
      } else {
        roots.push(categoryMap[cat.id]);
      }
    });

    return roots;
  };



  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const flatCategories = await categoriesApi.getCategories();
        setRawCategories(flatCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Re-build tree when rawCategories, currentCategory, or availableCategoryIds changes
  useEffect(() => {
    if (rawCategories.length === 0) return;

    // We must clone the raw categories because buildCategoryTree mutates objects (children array)
    // A clean clone ensures we don't accumulate duplicates in children arrays on re-renders
    const clonedCategories = rawCategories.map(c => ({ ...c, children: [] }));
    const tree = buildCategoryTree(clonedCategories);
    setCategories(tree);
  }, [rawCategories, currentCategory, availableCategoryIds]);

  // Update parent component when filters change
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Trigger callback immediately
    onFiltersChange(updatedFilters);
  };

  // Clear all filters except current category
  const clearFilters = () => {
    const defaultFilters = {
      category: currentCategory, // Keep current category
      minPrice: 0,
      maxPrice: limitMax,
      sortBy: "featured",
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  // Update URL when filters change
  useEffect(() => {
    // Skip initial render sync if needed, but for now allow it or simple wait for mount
    const url = new URL(window.location.href);

    // Only update URL parameters if they differ from defaults
    if (filters.minPrice > 0) {
      url.searchParams.set("minPrice", filters.minPrice.toString());
    } else {
      url.searchParams.delete("minPrice");
    }

    if (filters.maxPrice < limitMax) {
      url.searchParams.set("maxPrice", filters.maxPrice.toString());
    } else {
      url.searchParams.delete("maxPrice");
    }

    if (filters.sortBy !== "featured") {
      url.searchParams.set("sortBy", filters.sortBy);
    } else {
      url.searchParams.delete("sortBy");
    }

    window.history.replaceState(null, "", url.pathname + url.search);
  }, [filters, limitMax]);

  // State for expanded parent categories
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleCategory = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Function to render categories recursively if they have children
  const renderCategories = (categories: Category[], level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);

      return (
        <div key={category.id}>
          <div
            className={`flex items-center group py-1.5 px-2 rounded-md transition-all ${filters.category === category.slug ? 'bg-black text-white shadow-sm' : 'hover:bg-gray-100 text-gray-600'}`}
            style={{ marginLeft: `${level * 16}px` }}
          >
            {/* Toggle Button for Parents */}
            {hasChildren ? (
              <button
                onClick={(e) => toggleCategory(category.id, e)}
                className="p-1 mr-1 hover:bg-black/10 rounded"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <span className="w-5 mr-1"></span> // Spacer
            )}

            <label className="flex-1 flex items-center cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === category.slug}
                onChange={() => handleFilterChange({ category: category.slug })}
                className="hidden"
              />
              <span className="text-sm font-medium">{category.name}</span>
            </label>
          </div>

          {/* Children Container */}
          {hasChildren && isExpanded && (
            <div className="transition-all duration-200">
              {renderCategories(category.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
  });

  // Toggle section helper
  const toggleSection = (section: 'categories' | 'price') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Debounced input handler for manual price typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.minPrice !== initialFilters.minPrice || filters.maxPrice !== initialFilters.maxPrice) {
        // Only trigger if changed from props/initial, to avoid loops
        onFiltersChange(filters);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [filters.minPrice, filters.maxPrice]);


  return (

    <div className="w-full lg:w-64 space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wide"
          >
            Reset All
          </button>
        </div>

        {/* Sort Options - Compact */}
        <div className="p-4 border-b border-gray-100">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Sort by</label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="w-full pl-3 pr-8 py-2 text-sm bg-gray-50 border-gray-200 rounded-md focus:border-black focus:ring-0 cursor-pointer appearance-none transition-all hover:bg-white hover:border-gray-300"
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="bestsellers">Bestsellers</option>
              <option value="rating">Rating</option>
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-sm text-gray-900">Category</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openSections.categories ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${openSections.categories ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-4 pb-4 pt-1 space-y-1">
              {!currentCategory && (
                <label className={`flex items-center cursor-pointer group py-1.5 px-2 rounded-md transition-all ${!filters.category ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => handleFilterChange({ category: "" })}
                    className="hidden"
                  />
                  <span className="text-sm font-medium">All Categories</span>
                </label>
              )}

              {categoriesLoading ? (
                <div className="text-xs text-gray-400 px-2 py-2">Loading...</div>
              ) : (
                renderCategories(categories)
              )}
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-sm text-gray-900">Price Range</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openSections.price ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${openSections.price ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-4 pb-6 pt-1">
              {/* Inputs */}
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">฿</span>
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                    placeholder="Min"
                    className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:border-black focus:ring-0"
                  />
                </div>
                <span className="text-gray-400 text-xs">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">฿</span>
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                    placeholder="Max"
                    className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:border-black focus:ring-0"
                  />
                </div>
              </div>

              {/* Slider */}
              <div className="px-1">
                <input
                  type="range"
                  min="0"
                  max={limitMax}
                  step="10"
                  value={filters.maxPrice}
                  onChange={(e) => {
                    setFilters({ ...filters, maxPrice: Number(e.target.value) });
                  }}
                  onMouseUp={() => onFiltersChange(filters)}
                  onTouchEnd={() => onFiltersChange(filters)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium tracking-wide">
                  <span>0</span>
                  <span>{limitMax}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
