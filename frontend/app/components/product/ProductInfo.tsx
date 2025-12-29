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
            <div className="space-y-6 border-b border-white/10 pb-8">
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white drop-shadow-md leading-none">
                    {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                className={`w-5 h-5 clip-corner ${(product.rating || 0) >= star
                                    ? "text-accent fill-current"
                                    : "text-neutral-800 fill-current"
                                    }`}
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        {product.rating || 0} // {product.reviewCount || 0} REVIEWS
                    </span>
                </div>

                <div className="flex items-baseline gap-4">
                    {hasDiscount ? (
                        <>
                            <span className="text-5xl font-black text-white italic tracking-tighter text-outline-sm">
                                ฿{displayPrice.toLocaleString()}
                            </span>
                            <span className="text-2xl text-gray-600 line-through decoration-accent decoration-2 font-bold rotate-[-6deg]">
                                ฿{originalPrice?.toLocaleString()}
                            </span>
                            <span className="px-3 py-1 bg-accent/20 text-accent text-sm font-black tracking-widest uppercase border border-accent/50 transform -skew-x-12">
                                Save {product.discount}%
                            </span>
                        </>
                    ) : (
                        <span className="text-5xl font-black text-white italic tracking-tighter">
                            ฿{displayPrice.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="prose prose-invert prose-lg max-w-none text-gray-400 leading-relaxed font-medium">
                {product.description ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                    <p className="italic text-gray-500">No description available.</p>
                )}
            </div>

            {/* Availability Badge */}
            <div className="flex items-center gap-3 pt-2">
                <div className={`w-3 h-3 transform skew-x-12 border ${product.stock > 0 ? 'bg-accent border-accent shadow-[0_0_10px_rgba(204,255,0,0.5)]' : 'bg-red-600 border-red-600'}`} />
                <span className={`text-base font-black uppercase tracking-wider ${product.stock > 0 ? 'text-white' : 'text-red-500'}`}>
                    {product.stock > 0 ? `In Stock / ${product.stock} Units` : 'Out of Stock'}
                </span>
            </div>
        </div>
    );
}
