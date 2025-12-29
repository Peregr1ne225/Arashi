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
            className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-neutral-900 border border-white/10 skew-box hover:border-accent/50 transition-colors"
        >
            {/* Image */}
            <div className="relative w-full sm:w-28 aspect-square flex-shrink-0 bg-black border border-white/10 overflow-hidden">
                <Image
                    src={getImageUrl(product.image || product.image_url)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">

                    {/* Info */}
                    <div className="space-y-1">
                        <Link
                            href={`/product/${product.id}`}
                            className="text-2xl font-black uppercase italic tracking-tighter text-white hover:text-accent transition-colors line-clamp-1"
                        >
                            {product.name}
                        </Link>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            {product.category?.name || "Equipment"}
                        </p>
                    </div>

                    {/* Price */}
                    <div className="text-left sm:text-right">
                        {isDiscounted ? (
                            <div className="flex flex-col items-start sm:items-end">
                                <span className="font-black text-xl text-accent italic tracking-tighter">฿{price.toFixed(2)}</span>
                                <span className="text-sm text-gray-600 line-through font-bold">฿{Number(product.originalPrice || product.price).toFixed(2)}</span>
                            </div>
                        ) : (
                            <span className="font-black text-xl text-white italic tracking-tighter">฿{price.toFixed(2)}</span>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-6 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-4">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-white/20 bg-black skew-box-sm">
                            <button
                                onClick={() => onUpdateQuantity(id, quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-bold text-lg"
                                aria-label="Decrease quantity"
                            >
                                -
                            </button>
                            <div className="w-10 text-center text-sm font-black text-white tabular-nums">
                                {quantity}
                            </div>
                            <button
                                onClick={() => onUpdateQuantity(id, quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-bold text-lg"
                                aria-label="Increase quantity"
                                disabled={quantity >= product.stock}
                            >
                                +
                            </button>
                        </div>

                        {/* Stock Warning */}
                        {product.stock <= 5 && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-900/50 px-2 py-1 bg-red-900/10">
                                Low Stock: {product.stock}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => onRemove(id)}
                        className="text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1 group/btn"
                    >
                        <span className="hidden sm:inline opacity-0 group-hover/btn:opacity-100 transition-opacity -translate-x-2 group-hover/btn:translate-x-0">Discard</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
