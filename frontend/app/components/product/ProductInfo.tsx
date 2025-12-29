"use client";

import { Product } from "@/app/types";

interface ProductInfoProps {
    product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const displayPrice = product.price;
    const originalPrice = product.originalPrice;
    const hasDiscount = !!originalPrice;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4 border-b border-gray-100 pb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                    {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                className={`w-5 h-5 ${(product.rating || 0) >= star
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300 fill-current"
                                    }`}
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                        {product.rating || 0} ({product.reviewCount || 0} reviews)
                    </span>
                </div>

                <div className="flex items-baseline gap-3">
                    {hasDiscount ? (
                        <>
                            <span className="text-3xl font-bold text-gray-900">
                                ฿{displayPrice.toLocaleString()}
                            </span>
                            <span className="text-lg text-gray-500 line-through decoration-gray-400">
                                ฿{originalPrice?.toLocaleString()}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-bold tracking-wide uppercase">
                                Save {product.discount}%
                            </span>
                        </>
                    ) : (
                        <span className="text-3xl font-bold text-gray-900">
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
                <div className={`w-2.5 h-2.5 rounded-full ring-4 ${product.stock > 0 ? 'bg-green-500 ring-green-50' : 'bg-red-500 ring-red-50'}`} />
                <span className={`text-base font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
            </div>
        </div>
    );
}
