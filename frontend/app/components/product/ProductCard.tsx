"use client";

import { memo, useState } from "react";
import { ProductCardData } from "@/app/types/product";
import ProductImage from "./ProductCardParts/ProductImage";
import ProductInfo from "./ProductCardParts/ProductInfo";
import ProductOptions from "./ProductCardParts/ProductOptions";

interface ProductCardProps {
  product: ProductCardData;
}

// Using React.memo to prevent unnecessary re-renders
const ProductCard = memo<ProductCardProps>(({ product }) => {
  // Convert API data to match component expectations
  // Convert API data to match component expectations
  // product.images is already prepared by mapProducts
  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder-product.svg"];

  // Use the UI properties from Product type with defaults if not provided
  const isNew = product.isNew || false;
  const isBestseller = product.isBestseller || false;
  const discount = product.discount || 0;
  const originalPrice = product.originalPrice;
  const reviewCount = product.reviewCount || 0;
  const rating = product.rating || 0;
  // Derive colors from variants to ensure they match available stock/options
  // Use product.colors only for looking up images associated with those colors
  const colors = (() => {
    if (!product.variants) return product.colors || [];

    const uniqueColorsMap = new Map();

    product.variants
      .filter(variant => variant.is_active !== false)
      .forEach(variant => {
        if (!uniqueColorsMap.has(variant.color_id)) {
          // Try to find matching color details (like image) from the defined product.colors
          // Match by ID as backend now correctly sends color_id
          const existingColor = product.colors?.find(c => c.color_id === variant.color_id);

          uniqueColorsMap.set(variant.color_id, {
            id: existingColor?.id || variant.color_id, // Use existing ID if available, else variant color_id
            color_id: variant.color_id,
            color_name: variant.color_name || existingColor?.color_name,
            color_code: variant.color_code || existingColor?.color_code,
            image: existingColor?.image || null
          });
        }
      });

    return Array.from(uniqueColorsMap.values());
  })();

  // State for hover preview image
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div className="card-sport group relative flex flex-col h-full">
      {/* Product Images */}
      <div className="relative overflow-hidden w-full bg-[#f4f4f5]">
        <ProductImage
          productId={product.id}
          images={images}
          isNew={isNew}
          isBestseller={isBestseller}
          discount={discount}
          previewImage={previewImage}
        />

        {/* Product Options overlaid or below? Arashi design usually clean. 
            Options often slide up or appear. Keeping structure but passing control to parts. */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <ProductOptions
            product={product}
          />
        </div>
      </div>

      {/* Product Details - Below image */}
      <div className="pt-4 px-5 pb-5">
        <ProductInfo
          productId={product.id}
          name={product.name}
          rating={rating}
          reviewCount={reviewCount}
          price={Number(product.price)}
          originalPrice={originalPrice}
          colors={colors}
          onColorHover={setPreviewImage}
          onColorLeave={() => setPreviewImage(null)}
        />
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
