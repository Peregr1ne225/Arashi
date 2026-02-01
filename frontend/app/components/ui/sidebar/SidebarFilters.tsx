"use client";

import { useState, useEffect, useMemo, useRef } from "react";

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
  categories?: Category[]; // Passed from server
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
  categories: initialCategories = [],
  maxPrice = 1000,
}: SidebarFiltersProps) {
  // Determine the effective max price limit
  const limitMax = maxPrice > 0 ? maxPrice : 1000;

  // Initialize filters once, handling the "unlimited" case for maxPrice
  const [filters, setFilters] = useState(() => {
    const init = {
      ...initialFilters,
      category: initialFilters.category || currentCategory,
    };
    // If maxPrice is 0 or sliderMax, treat it as the limit
    if (init.maxPrice === 0 || init.maxPrice >= limitMax) {
      init.maxPrice = limitMax;
    }
    return init;
  });

  // Track the initial state we last synced with to detect external changes (URL/Navigation)
  const [lastInitialFilters, setLastInitialFilters] = useState(initialFilters);
  const [lastCurrentCategory, setLastCurrentCategory] =
    useState(currentCategory);
  const [lastLimitMax, setLastLimitMax] = useState(limitMax);

  // Synchronously adjust internal filters if Source of Truth (Props/URL) changes
  if (
    initialFilters !== lastInitialFilters ||
    currentCategory !== lastCurrentCategory ||
    limitMax !== lastLimitMax
  ) {
    setLastInitialFilters(initialFilters);
    setLastCurrentCategory(currentCategory);
    setLastLimitMax(limitMax);

    setFilters((prev) => {
      const nextCategory = initialFilters.category || currentCategory;
      const nextMax =
        initialFilters.maxPrice === 0 || initialFilters.maxPrice >= limitMax
          ? limitMax
          : initialFilters.maxPrice;

      // Only update if there's an actual meaningful change
      if (
        prev.category !== nextCategory ||
        prev.sortBy !== initialFilters.sortBy ||
        prev.minPrice !== initialFilters.minPrice ||
        prev.maxPrice !== nextMax
      ) {
        return {
          ...initialFilters,
          category: nextCategory,
          maxPrice: nextMax,
        };
      }
      return prev;
    });
  }

  const hasMounted = useRef(false);
  useEffect(() => {
    hasMounted.current = true;
  }, []);
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

  // useMemo for category tree to avoid double render
  // useMemo will re-run only when dependencies change
  const categories = useMemo(() => {
    if (initialCategories.length === 0) return [];

    // We must clone the raw categories because buildCategoryTree mutates objects (children array)
    const clonedCategories = initialCategories.map((c) => ({
      ...c,
      children: [],
    }));
    return buildCategoryTree(clonedCategories);
  }, [initialCategories]);

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

  // Consolidated debounced update for Parent Component
  useEffect(() => {
    if (!hasMounted.current) return;

    const timer = setTimeout(() => {
      const { minPrice, maxPrice, sortBy, category } = filters;
      const {
        minPrice: initialMin,
        maxPrice: initialMax,
        sortBy: initialSort,
        category: initialCat,
      } = initialFilters;

      const isMinChanged = minPrice !== initialMin;
      const isMaxChanged =
        initialMax === 0
          ? maxPrice !== limitMax && maxPrice !== 0
          : maxPrice !== initialMax;
      const isSortChanged = sortBy !== initialSort;
      const isCatChanged = category !== initialCat;

      if (isMinChanged || isMaxChanged || isSortChanged || isCatChanged) {
        // Notify Parent to fetch (No URL sync as requested)
        onFiltersChange(filters);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [filters, initialFilters, limitMax, onFiltersChange, currentCategory]);
  // State for expanded parent categories
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(),
  );

  const toggleCategory = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories((prev) => {
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
  const renderCategories = (
    categories: Category[],
    level = 0,
    parentPath = "",
  ) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const currentPath = parentPath
        ? `${parentPath}/${category.slug}`
        : category.slug;

      return (
        <div key={category.id}>
          <div
            className={`flex items-center group py-1 transition-all`}
            style={{ marginLeft: `${level * 16}px` }}
          >
            {/* Toggle Button for Parents */}
            {hasChildren ? (
              <button
                onClick={(e) => toggleCategory(category.id, e)}
                className="p-1 mr-1 hover:bg-black/5 rounded text-gray-500 hover:text-black"
              >
                <svg
                  className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <span className="w-5 mr-1"></span> // Spacer
            )}

            <label className="flex-1 flex items-center cursor-pointer">
              <div
                className={`w-4 h-4 mr-3 border rounded-none flex items-center justify-center transition-colors ${filters.category === currentPath ? "border-black bg-black" : "border-gray-300 group-hover:border-black"}`}
              >
                {filters.category === currentPath && (
                  <div className="w-2 h-2 bg-white" />
                )}
              </div>
              <input
                type="radio"
                name="category"
                checked={filters.category === currentPath}
                onChange={() => handleFilterChange({ category: currentPath })}
                className="hidden"
              />
              <span
                className={`text-sm font-istok font-bold ${filters.category === currentPath ? "text-black" : "text-gray-500 group-hover:text-black"}`}
              >
                {category.name}
              </span>
            </label>
          </div>

          {/* Children Container */}
          {hasChildren && isExpanded && (
            <div className="transition-all duration-200">
              {renderCategories(category.children!, level + 1, currentPath)}
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
  const toggleSection = (section: "categories" | "price") => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-transparent">
        {/* Header */}
        <div className="pb-4 border-b border-black/10 flex justify-between items-center mb-6">
          <h3 className="font-koulen text-[24px] uppercase tracking-wide text-black">
            Filters
          </h3>
          <button
            onClick={clearFilters}
            className="text-xs font-istok font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-wider underline decoration-1 underline-offset-2"
          >
            Reset All
          </button>
        </div>

        {/* Sort Options - Compact */}
        <div className="mb-8">
          <label className="text-[14px] font-koulen text-black uppercase tracking-wide mb-3 block">
            Sort by
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="w-full pl-0 pr-8 py-2 text-base font-istok bg-transparent border-b border-gray-200 rounded-none focus:border-black focus:ring-0 cursor-pointer appearance-none transition-all hover:border-gray-400 text-gray-700 font-bold"
            >
              <option value="featured">Featured</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="bestsellers">Bestsellers</option>
              <option value="rating">Rating</option>
            </select>
            {/* Custom Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-black">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-8 border-b border-black/10 pb-6">
          <button
            onClick={() => toggleSection("categories")}
            className="w-full flex justify-between items-center group mb-4"
          >
            <span className="font-koulen text-[18px] text-black">Category</span>
            <svg
              className={`w-4 h-4 text-black transition-transform duration-200 ${openSections.categories ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${openSections.categories ? "max-h-500 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="space-y-1">
              {!currentCategory && (
                <label
                  className={`flex items-center cursor-pointer group py-1 transition-all`}
                >
                  <div
                    className={`w-4 h-4 mr-3 border rounded-none flex items-center justify-center transition-colors ${!filters.category ? "border-black bg-black" : "border-gray-300 group-hover:border-black"}`}
                  >
                    {!filters.category && <div className="w-2 h-2 bg-white" />}
                  </div>
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category}
                    onChange={() => handleFilterChange({ category: "" })}
                    className="hidden"
                  />
                  <span
                    className={`text-sm font-istok font-bold ${!filters.category ? "text-black" : "text-gray-500 group-hover:text-black"}`}
                  >
                    All Categories
                  </span>
                </label>
              )}

              {renderCategories(categories)}
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div>
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex justify-between items-center group mb-4"
          >
            <span className="font-koulen text-[18px] text-black">
              Price Range
            </span>
            <svg
              className={`w-4 h-4 text-black transition-transform duration-200 ${openSections.price ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${openSections.price ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="pt-1">
              {/* Inputs */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-istok">
                    ฿
                  </span>
                  <input
                    type="number"
                    value={filters.minPrice || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minPrice: Number(e.target.value),
                      })
                    }
                    placeholder="Min"
                    className="w-full pl-8 pr-3 py-2 text-sm font-istok font-bold border border-gray-200 rounded-full focus:border-black focus:ring-0 placeholder:text-gray-300 bg-gray-50 transition-colors"
                  />
                </div>
                <span className="text-gray-400 text-xs">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-istok">
                    ฿
                  </span>
                  <input
                    type="number"
                    value={filters.maxPrice || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxPrice: Number(e.target.value),
                      })
                    }
                    placeholder="Max"
                    className="w-full pl-8 pr-3 py-2 text-sm font-istok font-bold border border-gray-200 rounded-full focus:border-black focus:ring-0 placeholder:text-gray-300 bg-gray-50 transition-colors"
                  />
                </div>
              </div>

              {/* Dual Slider */}
              <div className="relative h-2 rounded-full bg-gray-200 mt-6 mb-8 mx-1">
                {/* Track Highlight */}
                <div
                  className="absolute h-full bg-black rounded-full z-10"
                  style={{
                    left: `${(filters.minPrice / limitMax) * 100}%`,
                    right: `${100 - (filters.maxPrice / limitMax) * 100}%`,
                  }}
                />

                {/* Min Thumb Input */}
                <input
                  type="range"
                  min="0"
                  max={limitMax}
                  step="1"
                  value={filters.minPrice}
                  onChange={(e) => {
                    const val = Math.min(
                      Number(e.target.value),
                      filters.maxPrice - 1,
                    );
                    setFilters({ ...filters, minPrice: val });
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-20 slider-thumb cursor-pointer"
                />

                {/* Max Thumb Input */}
                <input
                  type="range"
                  min="0"
                  max={limitMax}
                  step="1"
                  value={filters.maxPrice}
                  onChange={(e) => {
                    const val = Math.max(
                      Number(e.target.value),
                      filters.minPrice + 1,
                    );
                    setFilters({ ...filters, maxPrice: val });
                  }}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-20 slider-thumb cursor-pointer"
                />

                {/* Legend */}
                <div className="flex justify-between mt-4 text-xs text-gray-400 font-istok font-bold tracking-wide">
                  <span>0</span>
                  <span>{limitMax}</span>
                </div>
              </div>

              <style>{`
                .slider-thumb::-webkit-slider-thumb {
                    pointer-events: auto;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: black;
                    border: 2px solid white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                }
                .slider-thumb::-moz-range-thumb {
                    pointer-events: auto;
                    width: 16px;
                    height: 16px;
                    background: black;
                    border: 2px solid white;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
