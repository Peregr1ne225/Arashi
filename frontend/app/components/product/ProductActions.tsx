"use client";

import { useState } from "react";
import { Product } from "@/app/types";
import { useCart } from "@/app/contexts/CartContext";

interface ProductActionsProps {
    product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleQuantityChange = (val: number) => {
        if (val >= 1 && val <= product.stock) {
            setQuantity(val);
        }
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        // Simulate slight delay for instant feedback feel
        await new Promise(resolve => setTimeout(resolve, 400));
        addToCart(product, quantity);
        setIsAdding(false);
    };

    const isOutOfStock = product.stock <= 0;

    return (
        <div className="space-y-6 pt-6 border-t border-gray-100">

            {/* Desktop Layout */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center h-14 bg-white rounded-xl border border-gray-200 w-full sm:w-auto min-w-[140px] shadow-sm">
                    <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors text-xl font-medium active:bg-gray-50 rounded-l-xl"
                    >
                        −
                    </button>
                    <div className="flex-1 text-center font-semibold text-gray-900 select-none">
                        {quantity}
                    </div>
                    <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock || isOutOfStock}
                        className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors text-xl font-medium active:bg-gray-50 rounded-r-xl"
                    >
                        +
                    </button>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`
            flex-1 h-14 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform active:scale-[0.98]
            flex items-center justify-center gap-2
            ${isOutOfStock
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-black hover:bg-gray-900 shadow-xl'
                        }
          `}
                >
                    {isAdding ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <>
                            {isOutOfStock ? (
                                "Coming Soon"
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                        </>
                    )}
                </button>
            </div>

            {/* Mobile Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:hidden z-40 safe-area-bottom">
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`
            w-full h-12 rounded-lg font-bold text-white 
            flex items-center justify-center gap-2
            ${isOutOfStock
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-black active:scale-[0.98] transition-transform'
                        }
          `}
                >
                    {isOutOfStock ? "Coming Soon" : "Add to Cart"}
                </button>
            </div>
        </div>
    );
}
