"use client";

import Link from "next/link";
import { Category } from "@/app/types/category";
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
    <nav className="hidden lg:block">
      <div className="container mx-auto px-4">
        <ul className="flex items-center justify-start space-x-2">
          <li>
            <CategoryDropdown categories={topLevelCategories} />
          </li>
          <li>
            <Link
              href="/new"
              className="font-istok text-[12px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-[#0e4d80] px-6 py-3 rounded-full hover:bg-gray-50 transition-all inline-block"
            >
              New Arrivals
            </Link>
          </li>
          <li>
            <Link
              href="/blogs"
              className="font-istok text-[12px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-[#0e4d80] px-6 py-3 rounded-full hover:bg-gray-50 transition-all inline-block"
            >
              Comunity
            </Link>
          </li>
          <li>
            <Link
              href="/model"
              className="font-istok text-[12px] uppercase tracking-[0.2em] font-bold text-gray-500 hover:text-[#0e4d80] px-6 py-3 rounded-full hover:bg-gray-50 transition-all inline-block"
            >
              Model
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
