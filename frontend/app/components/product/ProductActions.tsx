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
        <div className="space-y-6 pt-8 border-t border-white/10">

            {/* Desktop Layout */}
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Quantity Selector */}
                <div className="flex items-center h-16 bg-black border border-white/20 w-full sm:w-auto min-w-[160px] skew-box">
                    <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="w-14 h-full flex items-center justify-center text-gray-400 hover:text-accent disabled:opacity-30 transition-colors text-2xl font-black active:bg-white/10"
                    >
                        −
                    </button>
                    <div className="flex-1 text-center font-black text-white text-xl select-none">
                        {quantity}
                    </div>
                    <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock || isOutOfStock}
                        className="w-14 h-full flex items-center justify-center text-gray-400 hover:text-accent disabled:opacity-30 transition-colors text-2xl font-black active:bg-white/10"
                    >
                        +
                    </button>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`
            flex-1 h-16 font-black uppercase italic tracking-tighter text-xl text-black shadow-lg transition-all duration-300 transform skew-box
            flex items-center justify-center gap-3
            ${isOutOfStock
                            ? 'bg-neutral-800 text-gray-500 cursor-not-allowed shadow-none border border-white/10'
                            : 'bg-accent hover:bg-white hover:text-black border border-transparent hover:border-accent hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]'
                        }
          `}
                >
                    {isAdding ? (
                        <svg className="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <>
                            {isOutOfStock ? (
                                "Out of Stock"
                            ) : (
                                <>
                                    <span className="mr-1 text-2xl">+</span>
                                    Add to Locker
                                </>
                            )}
                        </>
                    )}
                </button>
            </div>

            {/* Mobile Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-accent shadow-[0_-5px_20px_rgba(0,0,0,0.5)] md:hidden z-40 safe-area-bottom">
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`
            w-full h-14 font-black uppercase italic tracking-tighter text-lg text-black
            flex items-center justify-center gap-2 skew-box
            ${isOutOfStock
                            ? 'bg-neutral-700 text-gray-500 cursor-not-allowed'
                            : 'bg-accent active:scale-[0.98] transition-transform'
                        }
          `}
                >
                    {isOutOfStock ? "Out of Stock" : "Add to Locker"}
                </button>
            </div>
        </div>
    );
}
