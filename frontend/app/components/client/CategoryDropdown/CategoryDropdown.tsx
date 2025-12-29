"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/app/types";
import { getImageUrl } from "@/app/lib/utils/image";

interface CategoryDropdownProps {
  categories: Category[]; // The list to display in root column (ALL top level)
  navCategory?: Category; // The specific category for the button label (if acting as nav item)
  isNavigationItem?: boolean;
}

export default function CategoryDropdown({
  categories,
  navCategory,
  isNavigationItem = false,
}: CategoryDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
  });
  // activePath tracks the IDs of the selected categories at each level: [rootId, childId, grandchildId]
  const [activePath, setActivePath] = useState<number[]>([]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleWrapperMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleButtonMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        left: rect.left,
        top: rect.bottom,
        width: rect.width,
      });
    }
    setIsDropdownOpen(true);
  };

  const handleCreateMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
      setActivePath([]); // Reset selection on close
    }, 200);
  };

  // Logic to build columns based on activePath
  const getColumns = () => {
    const columns = [];

    // Level 0: Always show full list of 'categories' (the roots)
    // This satisfies "show all of top node in that not just selected top node"
    const rootList = categories;

    if (rootList.length === 0) return [];

    columns.push(rootList);

    // Subsequent levels
    let currentList = rootList;
    for (let i = 0; i < activePath.length; i++) {
      const activeId = activePath[i];
      const activeCategory = currentList.find(c => c.id === activeId);

      if (activeCategory && activeCategory.children && activeCategory.children.length > 0) {
        columns.push(activeCategory.children);
        currentList = activeCategory.children;
      } else {
        break;
      }
    }
    return columns;
  };

  const columns = getColumns();

  // Helper to handle item hover
  const handleItemHover = (categoryId: number, level: number) => {
    const newPath = activePath.slice(0, level);
    newPath.push(categoryId);
    setActivePath(newPath);
  };

  // Determine button label
  const buttonLabel = navCategory ? navCategory.name : "Categories";

  // Mobile Accordion Item Component
  const MobileCategoryItem = ({ category, depth = 0 }: { category: Category, depth?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div className="border-b border-gray-50 last:border-0">
        <div className="flex items-center justify-between hover:bg-gray-50 pr-2">
          <Link
            href={`/category/${category.slug}`}
            className="flex-1 py-3 px-4 flex items-center gap-3"
            style={{ paddingLeft: `${depth * 1 + 1}rem` }}
          >
            <div className="w-8 h-8 relative rounded bg-gray-100 overflow-hidden shrink-0">
              {category.image ? (
                <Image src={getImageUrl(category.image)} alt={category.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Img</div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-800">{category.name}</span>
          </Link>

          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="bg-gray-50">
            {category.children!.map(child => (
              <MobileCategoryItem key={child.id} category={child} depth={depth + 1} />
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
          className={`flex items-center text-sm font-medium focus:outline-none py-1 ${isNavigationItem
              ? "text-foreground hover:text-accent"
              : "text-black hover:text-gray-700"
            }`}
          onMouseEnter={handleButtonMouseEnter}
        >
          <span>
            {buttonLabel}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ml-1 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
          </svg>
        </button>
      </div>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-50 bg-white shadow-xl rounded-md border border-gray-100 flex flex-col md:flex-row overflow-hidden"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            top: `${buttonPosition.top}px`,
            minWidth: columns.length > 0 ? "220px" : "auto",
            maxWidth: "90vw",
            width: "max-content", // Allow it to shrink on desktop, but control on mobile via max-width
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsDropdownOpen(true);
          }}
          onMouseLeave={handleCreateMouseLeave}
        >
          {/* Desktop Cascading Menu */}
          <div className="hidden md:flex flex-row max-h-[500px]">
            {columns.length > 0 ? (
              columns.map((colCategories, level) => (
                <div
                  key={level}
                  className={`flex flex-col w-56 overflow-y-auto border-r border-gray-100 last:border-0 ${level > 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                >
                  {colCategories.map((cat) => {
                    const isActive = activePath[level] === cat.id;
                    const hasChildren = cat.children && cat.children.length > 0;

                    return (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className={`px-4 py-3 flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${isActive ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                        onMouseEnter={() => handleItemHover(cat.id, level)}
                      >
                        <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-200 shrink-0">
                          {cat.image ? (
                            <Image
                              src={getImageUrl(cat.image)}
                              alt={cat.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 w-full justify-center">
                          <span className="text-sm font-medium text-gray-900 text-center line-clamp-2 leading-tight">
                            {cat.name}
                          </span>
                          {hasChildren && <span className="text-gray-400">›</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500 w-48 text-center">No categories</div>
            )}
          </div>

          {/* Mobile Accordion View */}
          <div className="md:hidden w-[85vw] max-h-[60vh] overflow-y-auto bg-white">
            <div className="p-2 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Browse Categories
            </div>
            {categories.map(cat => (
              <MobileCategoryItem key={cat.id} category={cat} />
            ))}
            {categories.length === 0 && <div className="p-4 text-center text-gray-500">No categories</div>}
          </div>
        </div>
      )}
    </>
  );
}
