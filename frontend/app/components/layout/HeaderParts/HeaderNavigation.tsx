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
        <ul className="flex items-center justify-start space-x-8">
          <li>
            <CategoryDropdown categories={topLevelCategories} />
          </li>
          <li>
            <Link
              href="/new"
              className="font-istok text-[16px] text-(--header-text) hover:scale-105 hover:text-black transition-all inline-block font-normal"
            >
              New Arrivals
            </Link>
          </li>
          <li>
            <Link
              href="/model"
              className="font-istok text-[16px] text-(--header-text) hover:scale-105 hover:text-black transition-all inline-block font-normal"
            >
              Model
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
