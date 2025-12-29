"use client";

import { memo } from "react";
import { Product } from "@/app/types";
import ProductImage from "./ProductCardParts/ProductImage";
import ProductInfo from "./ProductCardParts/ProductInfo";
import ProductOptions from "./ProductCardParts/ProductOptions";
import { getImageUrl } from "@/app/lib/utils/image";

interface ProductCardProps {
  product: Product;
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
  const colors = product.colors || [];

  return (
    <div className="group relative card-sport h-full flex flex-col overflow-hidden">
      {/* Product Images */}
      <ProductImage
        productId={product.id}
        images={images}
        isNew={isNew}
        isBestseller={isBestseller}
        discount={discount}
      />

      {/* Product Details */}
      <ProductInfo
        productId={product.id}
        name={product.name}
        rating={rating}
        reviewCount={reviewCount}
        price={Number(product.price)}
        originalPrice={originalPrice}
      />

      {/* Product Options */}
      <div className="mt-auto">
        <ProductOptions
          colors={colors}
          price={Number(product.price)}
          originalPrice={originalPrice}
          product={product}
        />
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
