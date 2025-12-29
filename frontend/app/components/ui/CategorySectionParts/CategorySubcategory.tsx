"use client";

import Link from "next/link";
import { Category } from "@/app/types";

interface CategorySubcategoryProps {
  categories: Category[];
}

export default function CategorySubcategory({
  categories,
}: CategorySubcategoryProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3 text-black">
              {category.name}
            </h3>
            <ul className="space-y-2">
              {category.children.slice(0, 5).map((subcategory, index) => (
                <li key={subcategory.id || index}>
                  <Link
                    href={`/category/${subcategory.slug || subcategory.id}`}
                    className="text-black hover:text-gray-700 flex justify-between items-center py-1 text-sm"
                  >
                    <span>{subcategory.name}</span>
                  </Link>
                </li>
              ))}
              {category.children.length > 5 && (
                <li>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-black hover:text-gray-700 text-sm font-medium py-1 inline-block"
                  >
                    View All ({category.children.length})
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
