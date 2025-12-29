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

    <div className="w-full lg:w-72 space-y-8">
      <div className="bg-neutral-900 border border-white/10 skew-box overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-accent hover:text-white transition-colors uppercase tracking-widest border border-accent px-2 py-1 transform -skew-x-12 hover:bg-accent hover:text-black"
          >
            Reset
          </button>
        </div>

        {/* Sort Options - Compact */}
        <div className="p-6 border-b border-white/10">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Sort by</label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="w-full pl-4 pr-10 py-3 text-sm bg-black border border-white/20 text-white font-bold uppercase tracking-wider focus:border-accent focus:ring-0 cursor-pointer appearance-none transition-all hover:border-white skew-box"
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="bestsellers">Bestsellers</option>
              <option value="rating">Rating</option>
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-accent">
              <svg className="h-4 w-4 transform skew-x-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="border-b border-white/10">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors group"
          >
            <span className="font-bold text-sm text-white uppercase tracking-wider">Category</span>
            <svg
              className={`w-4 h-4 text-gray-500 group-hover:text-accent transition-transform duration-200 ${openSections.categories ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${openSections.categories ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-6 pb-6 pt-2 space-y-2">
              {!currentCategory && (
                <label className={`flex items-center cursor-pointer group py-2 px-3 border border-transparent transition-all skew-box ${!filters.category ? 'bg-accent text-black border-accent' : 'hover:border-white/20 text-gray-400 hover:text-white'}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => handleFilterChange({ category: "" })}
                    className="hidden"
                  />
                  <span className="text-sm font-bold uppercase tracking-wide skew-box-reverse">All Categories</span>
                </label>
              )}

              {categoriesLoading ? (
                <div className="text-xs text-gray-500 px-2 py-2 uppercase tracking-widest">Loading data...</div>
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
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-white/5 transition-colors group"
          >
            <span className="font-bold text-sm text-white uppercase tracking-wider">Price Range</span>
            <svg
              className={`w-4 h-4 text-gray-500 group-hover:text-accent transition-transform duration-200 ${openSections.price ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${openSections.price ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-6 pb-8 pt-2">
              {/* Inputs */}
              <div className="flex items-center gap-2 mb-6">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent text-xs font-bold">฿</span>
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full pl-8 pr-2 py-2 text-sm bg-black border border-white/20 text-white font-bold focus:border-accent focus:ring-0 skew-box placeholder-gray-700"
                  />
                </div>
                <span className="text-gray-500 text-xs font-bold">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent text-xs font-bold">฿</span>
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                    placeholder="Max"
                    className="w-full pl-8 pr-2 py-2 text-sm bg-black border border-white/20 text-white font-bold focus:border-accent focus:ring-0 skew-box placeholder-gray-700"
                  />
                </div>
              </div>

              {/* Slider */}
              <div className="px-1 relative">
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
                  className="w-full h-2 bg-gray-800 rounded-none appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between mt-3 text-xs text-gray-500 font-bold tracking-widest uppercase">
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
