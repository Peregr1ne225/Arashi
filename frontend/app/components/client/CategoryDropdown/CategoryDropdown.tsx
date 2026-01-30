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
          className="fixed z-50 bg-white shadow-2xl shadow-black/5 border-t border-gray-100 flex flex-col md:flex-row overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 rounded-b-3xl"
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
            <div className="flex flex-row shrink-0 bg-white overflow-x-auto custom-scrollbar pl-8 py-8">
              {columns.length > 0 ? (
                columns.map((col, level) => (
                  <div
                    key={level}
                    className="flex flex-col w-72 overflow-y-auto border-r border-gray-50 last:border-0 px-2"
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
                          className="group flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer hover:bg-gray-50 mb-1"
                          onMouseEnter={() => handleItemHover(cat, level)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 relative overflow-hidden bg-gray-100 shrink-0 rounded-xl transition-all duration-300
                                ${isActive ? "ring-2 ring-black" : "group-hover:ring-1 group-hover:ring-gray-200"}
                            `}>
                              {cat.image ? (
                                <Image
                                  src={getImageUrl(cat.image)}
                                  alt={cat.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase text-gray-300 font-istok">
                                  {cat.name.substring(0, 2)}
                                </div>
                              )}
                            </div>
                            <span className={`text-[12px] font-istok uppercase tracking-[0.2em] transition-colors
                                ${isActive ? "font-normal text-black" : "font-light text-gray-500 group-hover:text-black"}
                            `}>
                              {cat.name}
                            </span>
                          </div>
                          {hasChildren && (
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 
                                ${isActive ? "bg-black opacity-100" : "bg-gray-300 opacity-0 group-hover:opacity-100"}
                            `} />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="p-12 text-gray-300 w-48 text-center font-istok font-light uppercase tracking-wider text-xs">
                  No items
                </div>
              )}
            </div>

            {/* Featured Image Area */}
            <div className="flex-1 min-w-[300px] relative bg-gray-50 overflow-hidden group m-4 rounded-2xl">
              {featuredCategory && (
                <>
                  <Image
                    src={getImageUrl(featuredCategory.image)}
                    alt={featuredCategory.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-12">
                    <div className="overflow-hidden mb-4">
                      <span className="inline-block px-4 py-1.5 bg-white/90 backdrop-blur-md text-black text-[10px] font-istok font-bold uppercase tracking-[0.3em] rounded-full translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                        Collection
                      </span>
                    </div>
                    <h2 className="text-5xl font-normal text-white font-istok uppercase tracking-tighter mb-6 max-w-lg drop-shadow-lg">
                      {featuredCategory.name}
                    </h2>
                    <Link
                      href={`/category/${featuredCategory.slug}`}
                      className="group/btn px-8 py-3 bg-white text-black rounded-full w-fit hover:bg-black hover:text-white transition-all duration-300"
                    >
                      <span className="font-istok font-normal uppercase tracking-[0.2em] text-[11px]">
                        Explore
                      </span>
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
