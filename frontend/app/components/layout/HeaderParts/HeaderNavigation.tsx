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
    <nav className="hidden lg:block py-2">
      <div className="container mx-auto px-4">
        <div className="relative flex justify-center items-center">
          <ul className="flex items-center space-x-8 text-lg font-bold uppercase tracking-wider overflow-visible">
            <li>
              <Link
                href="/sale"
                className="whitespace-nowrap text-accent hover:text-white transition-colors skew-box inline-block"
              >
                Sale
              </Link>
            </li>
            <li>
              <Link
                href="/new"
                className="whitespace-nowrap text-foreground hover:text-accent transition-colors skew-box inline-block"
              >
                New Arrivals
              </Link>
            </li>
            {topLevelCategories.map((category) => (
              <li key={category.id} className="skew-box">
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
              href="/model"
              className="btn-secondary text-sm"
            >
              <span>Model</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
