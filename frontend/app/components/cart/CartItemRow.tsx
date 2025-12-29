"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/app/types";
import { getImageUrl } from "@/app/lib/utils/image";

interface CartItemRowProps {
    id: number;
    product: Product;
    quantity: number;
    price: number;
    onUpdateQuantity: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
}

export default function CartItemRow({
    id,
    product,
    quantity,
    price,
    onUpdateQuantity,
    onRemove,
}: CartItemRowProps) {
    // Calculate displaying price (total for this line item)
    const totalLinePrice = price * quantity;
    const isDiscounted = product.discount && product.discount > 0;

    return (
        <div
            className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
        >
            {/* Image */}
            <div className="relative w-full sm:w-28 aspect-square flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <Image
                    src={getImageUrl(product.image || product.image_url)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">

                    {/* Info */}
                    <div className="space-y-1">
                        <Link
                            href={`/product/${product.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                            {product.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                            {product.category?.name || "Uncategorized"}
                            {/* Add placeholders for color/size if available in the future */}
                        </p>
                    </div>

                    {/* Price (Mobile: Hidden, Desktop: Shown here for better layout, or kept standard) */}
                    <div className="text-left sm:text-right">
                        {isDiscounted ? (
                            <div className="flex flex-col items-start sm:items-end">
                                <span className="font-bold text-lg text-red-600">฿{price.toFixed(2)}</span>
                                <span className="text-sm text-gray-400 line-through">฿{Number(product.originalPrice || product.price).toFixed(2)}</span>
                            </div>
                        ) : (
                            <span className="font-bold text-lg text-gray-900">฿{price.toFixed(2)}</span>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-4">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50">
                            <button
                                onClick={() => onUpdateQuantity(id, quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded-l-lg transition-colors"
                                aria-label="Decrease quantity"
                            >
                                -
                            </button>
                            <div className="w-10 text-center text-sm font-medium text-gray-900 tabular-nums">
                                {quantity}
                            </div>
                            <button
                                onClick={() => onUpdateQuantity(id, quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded-r-lg transition-colors"
                                aria-label="Increase quantity"
                                disabled={quantity >= product.stock}
                            >
                                +
                            </button>
                        </div>

                        {/* Stock Warning */}
                        {product.stock <= 5 && (
                            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                Only {product.stock} left
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => onRemove(id)}
                        className="text-sm font-medium text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 group/btn"
                    >
                        <span className="hidden sm:inline opacity-0 group-hover/btn:opacity-100 transition-opacity -translate-x-2 group-hover/btn:translate-x-0">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
