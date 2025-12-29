"use client";

import { useState } from "react";
import Link from "next/link";
import { Category } from "@/app/types";

interface MobileCategoryMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileCategoryMenu({
  categories,
  isOpen,
  onClose,
}: MobileCategoryMenuProps) {
  // Filter to get only top-level categories
  const topLevelCategories = (categories || []).filter(
    (category) => category.parent === null,
  );
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 lg:hidden overflow-y-auto">
        <div className="p-4">
          {/* Close Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Categories</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Category List */}
          <nav>
            <ul className="space-y-2">
              {topLevelCategories.map((category) => (
                <li key={category.id} className="border-b border-gray-100">
                  {/* Top-level category with link to its own page */}
                  <div className="flex items-center justify-between py-3">
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-gray-700 hover:text-gray-900 font-medium"
                      onClick={onClose}
                    >
                      {category.name}
                    </Link>

                    {/* Expand button if category has children */}
                    {category.children && category.children.length > 0 && (
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 transform transition-transform ${expandedCategories.includes(category.id)
                              ? "rotate-90"
                              : ""
                            }`}
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
                    )}
                  </div>

                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && (
                    <ul
                      className={`pl-4 overflow-hidden transition-all duration-300 ${expandedCategories.includes(category.id)
                          ? "max-h-96"
                          : "max-h-0"
                        }`}
                    >
                      {category.children?.map((child) => (
                        <li
                          key={child.id}
                          className="py-2 border-b border-gray-50"
                        >
                          <Link
                            href={`/category/${child.slug}`}
                            className="text-gray-600 hover:text-gray-900 block"
                            onClick={onClose}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
