"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Category } from "@/app/types";
import { getImageUrl } from "@/app/lib/utils/image";

interface CategoryGridProps {
  categories: Category[];
}

// ...

const CategoryCard = ({ category }: { category: Category }) => {
  const [imgSrc, setImgSrc] = useState<string>(
    category.image ? getImageUrl(category.image) : "/placeholder-product.svg"
  );

  return (
    <div className="relative group overflow-hidden rounded-lg">
      <Link
        href={`/category/${category.slug || category.id || category.name?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="aspect-square relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
          <Image
            src={imgSrc}
            alt={category.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            onError={() => setImgSrc("/placeholder-product.svg")}
          />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                {category.name}
              </h3>
              <p className="text-sm">Shop Now →</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {categories.map((category, index) => (
        <div key={category.id} className={index >= 4 ? "hidden md:block" : ""}>
          <CategoryCard category={category} />
        </div>
      ))}
    </div>
  );
}
