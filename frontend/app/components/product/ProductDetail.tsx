"use client";

import { useState, useEffect, useRef, useMemo, memo } from "react";
import { Product } from "@/app/types/product";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductActions from "./ProductActions";

interface ProductDetailProps {
  product: Product;
}

function ProductDetailComponent({ product }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState<number | undefined>();
  const [selectedSize, setSelectedSize] = useState<number | undefined>();
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const variants = useMemo(
    () => (product.variants || []).filter((v) => v.is_active !== false),
    [product.variants],
  );
  const hasVariants = variants.length > 0;

  // Track which product we've initialized state for
  const initializedProductIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Skip if we've already initialized for this product
    if (initializedProductIdRef.current === product.id) {
      return;
    }

    // Only set state if variants exist
    if (hasVariants) {
      // Use queueMicrotask to defer setState until after the effect completes
      // This avoids the cascading render warning
      queueMicrotask(() => {
        // Try to find the first in-stock variant
        const firstInStock = variants.find((v) => v.stock > 0);
        if (firstInStock) {
          setSelectedColor(firstInStock.color_id);
          setSelectedSize(firstInStock.size_id);
        } else if (variants[0]) {
          // Or just the first one if all OOS
          setSelectedColor(variants[0].color_id);
          setSelectedSize(variants[0].size_id);
        }
      });
    }

    // Mark this product as initialized
    initializedProductIdRef.current = product.id;
  }, [product.id, hasVariants, variants]);

  // Determine current variant
  const currentVariant = variants.find(
    (v) => v.color_id === selectedColor && v.size_id === selectedSize,
  );

  // Calculate effective stock
  const effectiveStock = hasVariants
    ? currentVariant
      ? currentVariant.stock
      : 0
    : product.stock;

  // Handle color hover to show preview
  const handleColorHover = (image: string | null) => {
    setHoveredImage(image);
  };

  const handleColorHoverEnd = () => {
    setHoveredImage(null);
  };

  return (
    <>
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
        {/* Left Column: Gallery (Sticky on Desktop) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <ProductGallery
            images={product.images}
            name={product.name}
            previewImage={hoveredImage}
          />
        </div>

        {/* Right Column: Info & Actions */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center">
          <div className="lg:sticky lg:top-24 space-y-8">
            <ProductInfo product={product} variantStock={effectiveStock} />
            <ProductActions
              product={product}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              effectiveStock={effectiveStock}
              onHoverColor={handleColorHover}
              onHoverColorEnd={handleColorHoverEnd}
            />
          </div>
        </div>
      </div>

      {/* Mobile Spacer for fixed bottom bar */}
      <div className="h-20 md:hidden" />
    </>
  );
}

// Memoize by product.id to prevent re-renders when product object reference changes but ID is same
export default memo(ProductDetailComponent, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});
