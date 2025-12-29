"use client";

import Link from "next/link";
import { Category } from "@/app/types";
import CategoryDropdown from "@/app/components/client/CategoryDropdown/CategoryDropdown";

interface HeaderNavigationProps {
  categories: Category[];
}

export default function HeaderNavigation({
  categories,
}: HeaderNavigationProps) {
  // Filter categories to get only top-level categories (parent: null)
  const topLevelCategories = (categories || []).filter(
    (category) => category.parent === null,
  );

  return (
    <nav className="hidden lg:block border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="relative flex justify-center items-center">
          <ul className="flex items-center py-3 space-x-6 text-sm font-medium text-black overflow-visible">
            <li>
              <Link
                href="/sale"
                className="whitespace-nowrap text-red-600 hover:text-red-700"
              >
                Sale
              </Link>
            </li>
            <li>
              <Link
                href="/new"
                className="whitespace-nowrap hover:text-gray-700"
              >
                New Arrivals
              </Link>
            </li>
            {topLevelCategories.map((category) => (
              <li key={category.id}>
                <CategoryDropdown
                  categories={topLevelCategories}
                  navCategory={category}
                  isNavigationItem={true}
                />
              </li>
            ))}
          </ul>

          <div className="absolute right-0">
            <Link
              href="/blogs"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Blogs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
