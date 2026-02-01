"use client";

import { useState, useRef, memo } from "react";
import Image from "next/image";
import { Product } from "@/app/types/product";
import { useCart } from "@/app/contexts/CartContext";
import { getImageUrl } from "@/app/lib/utils/image";

interface ProductActionsProps {
    product: Product;
    selectedColor?: number;
    setSelectedColor: (id: number | undefined) => void;
    selectedSize?: number;
    setSelectedSize: (id: number | undefined) => void;
    effectiveStock: number;
    onHoverColor?: (image: string | null) => void;
    onHoverColorEnd?: () => void;
}

function ProductActionsComponent({
    product,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    effectiveStock,
    onHoverColor,
    onHoverColorEnd,
}: ProductActionsProps) {
    const { addToCart, items } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    // Track previous selection to detect actual changes
    const previousSelectionRef = useRef<{ color?: number; size?: number }>({});

    // Derive unique colors and sizes from active variants only
    const variants = (product.variants || []).filter(
        (v) => v.is_active !== false,
    );

    // Calculate quantity already in cart for this specific variant
    const cartItem = items.find(
        (item) =>
            item.product.id === product.id &&
            item.color_id === selectedColor &&
            item.size_id === selectedSize,
    );
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    // Calculate remaining stock available to add
    const maxAvailable = Math.max(0, effectiveStock - quantityInCart);
    const isOutOfStock = maxAvailable <= 0;


    // Get unique colors with images - single iteration using Map
    const colorMap = new Map<number, { id: number; name: string | undefined; code: string | undefined; image: string | null | undefined }>();
    for (const v of variants) {
        if (v.color_name && !colorMap.has(v.color_id)) {
            const colorData = product.colors?.find(c => c.color_id === v.color_id && c.image);
            colorMap.set(v.color_id, {
                id: v.color_id,
                name: v.color_name,
                code: v.color_code,
                image: colorData?.image,
            });
        }
    }
    const colors = Array.from(colorMap.values());

    // Get unique sizes - single iteration using Map
    const sizeMap = new Map<number, { id: number; name: string | undefined; slug: string | undefined }>();
    for (const v of variants) {
        if (v.size_name && !sizeMap.has(v.size_id)) {
            sizeMap.set(v.size_id, {
                id: v.size_id,
                name: v.size_name,
                slug: v.size_slug,
            });
        }
    }
    const sizes = Array.from(sizeMap.values());

    const hasVariants = variants.length > 0;

    const isSelectionComplete = hasVariants
        ? !!selectedColor && !!selectedSize
        : true;

    const handleQuantityChange = (val: number) => {
        if (val < 1) return;
        if (val > quantity) {
            // Increasing: check max available (stock - cart)
            if (val <= maxAvailable) setQuantity(val);
        } else {
            // Decreasing: always allow
            setQuantity(val);
        }
    };

    const handleAddToCart = async () => {
        if (!isSelectionComplete) return;

        setIsAdding(true);
        await new Promise((resolve) => setTimeout(resolve, 400));
        const colorName = colors.find((c) => c.id === selectedColor)?.name;
        const sizeName = sizes.find((s) => s.id === selectedSize)?.name;
        addToCart(
            product,
            quantity,
            selectedColor,
            selectedSize,
            colorName,
            sizeName,
        );
        setIsAdding(false);
    };

    return (
        <div className="space-y-8 pt-8 border-t border-gray-100">
            {/* Variants Selection */}
            {hasVariants && (
                <div className="space-y-6">
                    {/* Colors */}
                    {colors.length > 0 && (
                        <div>
                            <span className="block font-istok text-xs font-bold text-black uppercase tracking-wider mb-3">
                                Color: {colors.find((c) => c.id === selectedColor)?.name}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color, index) => (
                                    <button
                                        key={color.id || `color-${index}`}
                                        onClick={() => {
                                            const prev = previousSelectionRef.current;
                                            if (prev.color !== color.id) {
                                                setSelectedColor(color.id);
                                                setQuantity(1);
                                                previousSelectionRef.current = {
                                                    ...prev,
                                                    color: color.id,
                                                };
                                            }
                                        }}
                                        onMouseEnter={() => onHoverColor?.(color.image || null)}
                                        onMouseLeave={() => onHoverColorEnd?.()}
                                        className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all overflow-hidden border shadow-sm
                      ${selectedColor === color.id
                                                ? "ring-2 ring-black ring-offset-2 scale-105 border-transparent shadow-md"
                                                : "hover:scale-110 ring-1 ring-transparent hover:ring-gray-300 ring-offset-1 border-gray-200"
                                            }
                    `}
                                        title={color.name}
                                    >
                                        {color.image ? (
                                            <div className="w-full h-full relative">
                                                <Image
                                                    src={getImageUrl(color.image)}
                                                    alt={color.name || "Color option"}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            </div>
                                        ) : color.code ? (
                                            <div
                                                className="w-full h-full"
                                                style={{ backgroundColor: color.code }}
                                            />
                                        ) : (
                                            <span className="font-istok text-[10px] font-bold">
                                                {color.name?.slice(0, 1)}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    {sizes.length > 0 && (
                        <div>
                            <span className="block font-istok text-xs font-bold text-black uppercase tracking-wider mb-3">
                                Size: {sizes.find((c) => c.id === selectedSize)?.name}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size, index) => {
                                    // Check availability for this size with selected color
                                    const available =
                                        !selectedColor ||
                                        variants.some(
                                            (v) =>
                                                v.color_id === selectedColor &&
                                                v.size_id === size.id &&
                                                v.stock > 0 &&
                                                v.is_active !== false,
                                        );

                                    return (
                                        <button
                                            key={size.id || `size-${index}`}
                                            onClick={() => {
                                                const prev = previousSelectionRef.current;
                                                if (prev.size !== size.id) {
                                                    setSelectedSize(size.id);
                                                    setQuantity(1);
                                                    previousSelectionRef.current = {
                                                        ...prev,
                                                        size: size.id,
                                                    };
                                                }
                                            }}
                                            disabled={!available}
                                            className={`
                        min-w-12 px-5 h-10 border font-istok text-xs font-bold uppercase tracking-wide transition-all rounded-full
                        ${selectedSize === size.id
                                                    ? "border-black bg-black text-white shadow-md transform scale-105"
                                                    : available
                                                        ? "border-gray-200 text-gray-900 hover:border-black hover:bg-white"
                                                        : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                                                }
                      `}
                                        >
                                            {size.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Desktop Layout */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center h-12 bg-white border border-gray-200 w-32 rounded-full shadow-sm">
                        <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1 || isOutOfStock || !isSelectionComplete}
                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all rounded-l-full"
                        >
                            −
                        </button>
                        <div className="flex-1 text-center font-istok font-bold text-sm text-gray-900 select-none">
                            {quantity}
                        </div>
                        <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={
                                quantity >= maxAvailable || isOutOfStock || !isSelectionComplete
                            }
                            className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-all rounded-r-full"
                        >
                            +
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAdding || !isSelectionComplete}
                        className={`
                flex-1 h-12 font-istok text-sm font-bold uppercase tracking-widest text-white transition-all duration-200 transform active:scale-[0.98] rounded-full
                flex items-center justify-center gap-2
                ${isOutOfStock || !isSelectionComplete
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                : "bg-[#0e4d80] hover:bg-[#0a3a60] hover:scale-[1.02] shadow-lg shadow-blue-900/20"
                            }
            `}
                    >
                        {isAdding ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <>
                                {isOutOfStock
                                    ? hasVariants && !isSelectionComplete
                                        ? "Select Options"
                                        : "Out of Stock"
                                    : !isSelectionComplete
                                        ? "Select Options"
                                        : "Add to Bag"}
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:hidden z-40 safe-area-bottom">
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding || !isSelectionComplete}
                    className={`
            w-full h-12 font-bold uppercase tracking-widest text-white
            flex items-center justify-center gap-2
            ${isOutOfStock || !isSelectionComplete
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-black active:scale-[0.98] transition-transform"
                        }
          `}
                >
                    {isOutOfStock
                        ? hasVariants && !isSelectionComplete
                            ? "Select Options"
                            : "Out of Stock"
                        : !isSelectionComplete
                            ? "Select Options"
                            : "Add to Bag"}
                </button>
            </div>
        </div>
    );
}

// Memoize with custom comparison to prevent re-renders from cart context changes
export default memo(ProductActionsComponent, (prevProps, nextProps) => {
    return (
        prevProps.product.id === nextProps.product.id &&
        prevProps.selectedColor === nextProps.selectedColor &&
        prevProps.selectedSize === nextProps.selectedSize &&
        prevProps.effectiveStock === nextProps.effectiveStock &&
        prevProps.setSelectedColor === nextProps.setSelectedColor &&
        prevProps.setSelectedSize === nextProps.setSelectedSize &&
        prevProps.onHoverColor === nextProps.onHoverColor &&
        prevProps.onHoverColorEnd === nextProps.onHoverColorEnd
    );
});
