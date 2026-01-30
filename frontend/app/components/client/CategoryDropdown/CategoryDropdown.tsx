"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/app/types/category";
import { getImageUrl } from "@/app/lib/utils/image";

interface CategoryDropdownProps {
  categories: Category[]; // The list to display in root column (ALL top level)
  navCategory?: Category; // The specific category for the button label (if acting as nav item)
}

export default function CategoryDropdown({
  categories,
  navCategory,
}: CategoryDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // activePath tracks the IDs of the selected categories at each level: [rootId, childId, grandchildId]
  const [activePath, setActivePath] = useState<number[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleWrapperMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleButtonMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleCreateMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
      setActivePath([]); // Reset selection on close
      setHoveredCategory(null);
    }, 200);
  };

  // Logic to build columns based on activePath
  const getColumns = () => {
    const columns: { items: Category[]; basePath: string }[] = [];

    // Level 0: Always show full list of 'categories' (the roots)
    const rootList = categories;
    if (rootList.length === 0) return [];

    columns.push({ items: rootList, basePath: "" });

    // Subsequent levels
    let currentList = rootList;
    const currentBasePathSegments: string[] = [];

    for (let i = 0; i < activePath.length; i++) {
      const activeId = activePath[i];
      const activeCategory = currentList.find((c) => c.id === activeId);

      if (activeCategory) {
        currentBasePathSegments.push(activeCategory.slug);

        if (activeCategory.children && activeCategory.children.length > 0) {
          columns.push({
            items: activeCategory.children,
            basePath: currentBasePathSegments.join("/"),
          });
          currentList = activeCategory.children;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return columns;
  };

  const columns = getColumns();

  // Helper to handle item hover
  const handleItemHover = (category: Category, level: number) => {
    setHoveredCategory(category);
    const newPath = activePath.slice(0, level);
    newPath.push(category.id);
    setActivePath(newPath);
  };

  // Determine button label
  const buttonLabel = navCategory ? navCategory.name : "Collections";

  const featuredCategory =
    hoveredCategory || (categories.length > 0 ? categories[0] : null);

  // Mobile Accordion Item Component
  const MobileCategoryItem = ({
    category,
    depth = 0,
    parentPath = "",
  }: {
    category: Category;
    depth?: number;
    parentPath?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    // Construct full path for this category
    const currentPath = parentPath
      ? `${parentPath}/${category.slug}`
      : category.slug;

    return (
      <div className="border-b border-gray-100 last:border-0">
        <div
          className={`flex items-center justify-between hover:bg-brand-gradient group transition-colors pr-2 ${isOpen ? "bg-gray-50" : ""}`}
        >
          <Link
            href={`/category/${currentPath}`}
            className="flex-1 py-4 px-4 flex items-center gap-3"
            style={{ paddingLeft: `${depth * 1 + 1}rem` }}
          >
            <span className="text-sm font-bold text-gray-800 font-istok uppercase tracking-wider group-hover:text-white transition-colors">
              {category.name}
            </span>
          </Link>

          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-2 text-gray-400 group-hover:text-white focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="bg-gray-50">
            {category.children!.map((child) => (
              <MobileCategoryItem
                key={child.id}
                category={child}
                depth={depth + 1}
                parentPath={currentPath}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className="relative"
        onMouseEnter={handleWrapperMouseEnter}
        onMouseLeave={handleCreateMouseLeave}
      >
        <button
          ref={buttonRef}
          className="font-istok text-[16px] text-(--header-text) hover:scale-105 hover:text-black transition-all inline-block font-normal"
          onMouseEnter={handleButtonMouseEnter}
        >
          <span>{buttonLabel}</span>
        </button>
      </div>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 bg-white shadow-2xl border-t border-gray-200 flex flex-col md:flex-row overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
          style={{
            left: 0,
            top: `var(--header-height)`,
            width: "100vw",
            maxHeight: "calc(100vh - var(--header-height) - 1rem)"
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsDropdownOpen(true);
          }}
          onMouseLeave={handleCreateMouseLeave}
        >
          {/* Desktop Mega Menu */}
          <div className="hidden md:flex flex-row h-[500px] max-h-full w-full">
            {/* Navigation Columns area */}
            <div className="flex flex-row shrink-0 bg-white overflow-x-auto custom-scrollbar">
              {columns.length > 0 ? (
                columns.map((col, level) => (
                  <div
                    key={level}
                    className="flex flex-col w-72 overflow-y-auto border-r border-gray-100 last:border-0"
                  >
                    {col.items.map((cat) => {
                      const isActive = activePath[level] === cat.id;
                      const hasChildren = cat.children && cat.children.length > 0;
                      const itemPath = col.basePath
                        ? `${col.basePath}/${cat.slug}`
                        : cat.slug;

                      return (
                        <Link
                          key={cat.id}
                          href={`/category/${itemPath}`}
                          className={`group px-6 py-4 flex items-center justify-between transition-all cursor-pointer border-b border-gray-50 last:border-0
                              ${isActive ? "bg-black text-white" : "hover:bg-gray-50 text-gray-900"}
                          `}
                          onMouseEnter={() => handleItemHover(cat, level)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 relative overflow-hidden bg-gray-100 shrink-0 border border-gray-200 transition-transform duration-300 group-hover:scale-110
                                ${isActive ? "border-white/20" : ""}
                            `}>
                              {cat.image ? (
                                <Image
                                  src={getImageUrl(cat.image)}
                                  alt={cat.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-gray-400">
                                  {cat.name.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <span className={`text-sm font-black font-istok uppercase tracking-tight
                                ${isActive ? "text-white" : "text-gray-900"}
                            `}>
                              {cat.name}
                            </span>
                          </div>
                          {hasChildren && (
                            <span className={`text-xs transition-transform duration-300 group-hover:translate-x-1 ${isActive ? "text-white/50" : "text-gray-300"}`}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="p-12 text-gray-400 w-48 text-center font-istok font-bold uppercase tracking-wider">
                  No items
                </div>
              )}
            </div>

            {/* Featured Image Area */}
            <div className="flex-1 min-w-[300px] relative bg-gray-100 overflow-hidden group">
              {featuredCategory && (
                <>
                  <Image
                    src={getImageUrl(featuredCategory.image)}
                    alt={featuredCategory.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-16">
                    <div className="overflow-hidden mb-4">
                      <span className="inline-block px-4 py-1.5 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        Exercise // Ready
                      </span>
                    </div>
                    <h2 className="text-7xl font-black text-white font-koulen uppercase tracking-tighter leading-[0.85] mb-6 max-w-lg">
                      {featuredCategory.name}
                    </h2>
                    <Link
                      href={`/category/${featuredCategory.slug}`}
                      className="group/btn flex items-center gap-3 w-fit"
                    >
                      <span className="text-white font-istok font-black uppercase tracking-[0.2em] text-xs">
                        Explore Collection
                      </span>
                      <div className="w-12 h-[2px] bg-white transform origin-left transition-transform duration-500 group-hover/btn:scale-x-150" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Accordion View */}
          <div className="md:hidden w-full max-h-[70vh] overflow-y-auto bg-white">
            <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-black text-black uppercase tracking-[0.2em]">Navigation</span>
              <button
                onClick={handleCreateMouseLeave}
                className="p-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="pb-8">
              {categories.map((cat) => (
                <MobileCategoryItem key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
