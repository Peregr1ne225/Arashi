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
    <div className="relative group overflow-hidden skew-box border-2 border-transparent hover:border-accent transition-all duration-300">
      <Link
        href={`/category/${category.slug || category.id || category.name?.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="aspect-square relative">
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
          <Image
            src={imgSrc}
            alt={category.name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            onError={() => setImgSrc("/placeholder-product.svg")}
          />
          <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
            <div className="text-center w-full">
              <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white mb-2 tracking-wider drop-shadow-md skew-box-reverse">
                {category.name}
              </h3>
              <div className="inline-block bg-accent text-black font-bold uppercase text-xs px-4 py-1 skew-box-reverse transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                Shop Now
              </div>
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
