"use client";

import { Product } from "@/app/types/product";

interface ProductInfoProps {
    product: Product;
    variantStock?: number;
}

export default function ProductInfo({ product, variantStock }: ProductInfoProps) {
    const displayPrice = product.price;
    const originalPrice = product.originalPrice;
    const hasDiscount = !!originalPrice;

    // Use variant stock if provided (even if 0), otherwise fallback to product global stock
    const currentStock = variantStock !== undefined ? variantStock : product.stock;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4 border-b border-gray-100 pb-6">
                <div className="flex flex-col gap-1">
                    <span className="font-istok text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {product.category?.name} / {product.subcategory || "Outerwear"}
                    </span>
                    <h1 className="font-koulen text-4xl md:text-5xl tracking-wide text-black uppercase leading-[1.1]">
                        {product.name}
                    </h1>
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {product.tags.map((tag, idx) => (
                                <span key={idx} className="font-istok text-[11px] font-bold uppercase tracking-wider text-gray-500 border border-gray-200 px-3 py-1 rounded-full bg-white">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rating */}
                {(product.rating || 0) > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center text-black">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    className={`w-3.5 h-3.5 ${(product.rating || 0) >= star ? "fill-current" : "text-gray-200 fill-current"}`}
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="font-istok text-xs font-bold text-gray-500 underline decoration-gray-300 underline-offset-2">
                            {product.reviewCount || 0} REVIEWS
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    {hasDiscount ? (
                        <>
                            <span className="font-istok text-lg font-bold text-gray-400 line-through decoration-gray-400">
                                ฿{originalPrice?.toLocaleString()}
                            </span>
                            <span className="font-koulen text-3xl text-[#0e4d80]">
                                ฿{displayPrice.toLocaleString()}
                            </span>
                        </>
                    ) : (
                        <span className="font-koulen text-3xl text-black">
                            ฿{displayPrice.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                    <p className="italic text-gray-400">No description available for this product.</p>
                )}
            </div>

            {/* Availability Badge */}
            <div className="flex items-center gap-2 pt-2">
                <div className={`w-2.5 h-2.5 rounded-full ring-4 ${currentStock > 0 ? 'bg-green-500 ring-green-50' : 'bg-red-500 ring-red-50'}`} />
                <span className={`text-base font-medium ${currentStock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {currentStock > 0 ? `In Stock (${currentStock} available)` : 'Out of Stock'}
                </span>
            </div>
        </div>
    );
}
