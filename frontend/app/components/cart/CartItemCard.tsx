"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductCardData } from "@/app/types/product";
import { getImageUrl } from "@/app/lib/utils/image";

interface CartItemCardProps {
    id: number;
    product: ProductCardData;
    quantity: number;
    price: number;
    category: string;
    color?: string;
    size?: string;
    colorId?: number;
    sizeId?: number;
    onUpdateQuantity: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
    variant?: "default" | "compact";
}

export default function CartItemCard({
    id,
    product,
    quantity,
    price,
    category,
    color,
    size,
    colorId,
    sizeId,
    onUpdateQuantity,
    onRemove,
    variant = "default",
}: CartItemCardProps) {

    const isCompact = variant === "compact";

    // Calculate effective stock based on variant
    const effectiveStock = (() => {
        if (colorId || sizeId) {
            const variant = product.variants?.find(v =>
                (!colorId || v.color_id === colorId) &&
                (!sizeId || v.size_id === sizeId)
            );
            if (variant) {
                // If variant is found but archived, effective stock is 0
                return (variant.is_active !== false) ? variant.stock : 0;
            }
        }
        return product.stock;
    })();

    return (
        <div className={`relative group flex ${isCompact ? "gap-4 p-4 rounded-3xl" : "flex-col sm:flex-row gap-6 p-5 rounded-3xl"} bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md`}>
            {/* Main Card (Product Info) */}
            <div className={`flex ${isCompact ? "gap-4 w-full" : "flex-1 gap-5"}`}>
                <div className={`relative ${isCompact ? "w-24 rounded-2xl" : "w-28 rounded-2xl"} aspect-3/4 bg-[#f4f4f5] overflow-hidden shrink-0`}>
                    <Image
                        src={getImageUrl(product.images?.[0] || "/placeholder-product.svg")}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Details Info */}
                <div className="flex flex-col grow justify-between py-1 min-w-0">
                    <div>
                        <div className="flex justify-between items-start">
                            <Link
                                href={`/product/${product.id}`}
                                className={`block font-koulen uppercase tracking-wide text-black hover:text-[#0e4d80] transition-colors mb-1 line-clamp-2 leading-tight ${isCompact ? "text-lg pr-2" : "text-xl pr-4"}`}
                            >
                                {product.name}
                            </Link>
                            <button
                                onClick={() => onRemove(id)}
                                className={`flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 ${isCompact ? "w-6 h-6 -mr-1 -mt-1" : "w-8 h-8 -mr-2 -mt-2"}`}
                                title="Remove item"
                            >
                                <svg width={isCompact ? "16" : "18"} height={isCompact ? "16" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <p className="font-istok text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                            {category}
                        </p>

                        {/* Variant Info */}
                        {(color || size) && (
                            <div className={`flex flex-wrap gap-2 mb-2 ${isCompact ? "text-xs text-gray-500 font-medium" : "mb-4"}`}>
                                {isCompact ? (
                                    // Compact text-only variant info to save space
                                    <>
                                        {color && <span>Color: {color}</span>}
                                        {size && <span>Size: {size}</span>}
                                    </>
                                ) : (
                                    // Default chip style variant info
                                    <>
                                        {color && (
                                            <div className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 flex items-center gap-2">
                                                <span className="text-[10px] font-istok font-bold text-gray-400 uppercase tracking-wider">Color</span>
                                                <span className="text-xs font-istok font-bold text-black uppercase tracking-wide">{color}</span>
                                            </div>
                                        )}
                                        {size && (
                                            <div className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 flex items-center gap-2">
                                                <span className="text-[10px] font-istok font-bold text-gray-400 uppercase tracking-wider">Size</span>
                                                <span className="text-xs font-istok font-bold text-black uppercase tracking-wide">{size}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {effectiveStock <= 0 && (
                            <p className="text-xs text-red-500 font-bold uppercase tracking-wider mb-2">
                                {(() => {
                                    const variant = product.variants?.find(v =>
                                        (!colorId || v.color_id === colorId) &&
                                        (!sizeId || v.size_id === sizeId)
                                    );
                                    return (variant && variant.is_active === false) ? "Unavailable" : "Out of Stock";
                                })()}
                            </p>
                        )}

                    </div>

                    {/* Footer Row: Quantity & Price */}
                    <div className="flex justify-between items-end mt-auto pt-2">
                        {/* Quantity Stepper */}
                        <div className={`flex items-center bg-white rounded-full border border-gray-200 shadow-sm overflow-hidden ${isCompact ? "h-8" : "h-9"}`}>
                            <button
                                onClick={() => onUpdateQuantity(id, quantity - 1)}
                                className={`${isCompact ? "w-8" : "w-9"} h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-colors`}
                            >
                                -
                            </button>
                            <div className={`text-center font-istok font-bold text-black ${isCompact ? "min-w-6 text-xs" : "min-w-8 text-sm"}`}>
                                {quantity}
                            </div>
                            <button
                                onClick={() => onUpdateQuantity(id, quantity + 1)}
                                disabled={quantity >= effectiveStock}
                                className={`${isCompact ? "w-8" : "w-9"} h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent`}
                            >
                                +
                            </button>
                        </div>
                        <div className="text-right">
                            {product.discount && product.discount > 0 ? (
                                <div className="flex flex-col items-end">
                                    <span className={`font-koulen text-[#0e4d80] tracking-wide ${isCompact ? "text-lg" : "text-xl"}`}>฿{price.toFixed(2)}</span>
                                    <span className="font-istok text-xs text-gray-400 line-through font-bold">
                                        ฿{Number(product.originalPrice || product.price).toFixed(2)}
                                    </span>
                                </div>
                            ) : (
                                <p className={`font-koulen text-black tracking-wide ${isCompact ? "text-lg" : "text-xl"}`}>
                                    ฿{price.toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
