"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus } from "lucide-react";
import NextImage from "next/image";
import { getImageUrl } from "@/app/lib/utils/image";
import { ProductCardData } from "@/app/types/product";
import { useCart } from "@/app/contexts/CartContext";

interface QuickAddModalProps {
    product: ProductCardData;
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickAddModal({
    product,
    isOpen,
    onClose,
}: QuickAddModalProps) {
    const { addToCart, openCart } = useCart();
    const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
    const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Derive available colors and sizes from variants
    const uniqueColors = useMemo(() => {
        const colorMap = new Map();
        (product.variants || [])
            .filter((v) => v.is_active !== false)
            .forEach((v) => {
                if (!colorMap.has(v.color_id)) {
                    // Find matching color definition for image using ID
                    const existingColor = product.colors?.find(
                        (c) => c.color_id === v.color_id,
                    );

                    colorMap.set(v.color_id, {
                        id: v.color_id,
                        name: v.color_name,
                        code: v.color_code,
                        image: existingColor?.image || null,
                    });
                }
            });
        return Array.from(colorMap.values());
    }, [product]);

    // Get all possible sizes across all variants to show complete grid
    const allSizes = useMemo(() => {
        const sizesMap = new Map();
        (product.variants || [])
            .filter((v) => v.is_active !== false)
            .forEach((v) => {
                if (!sizesMap.has(v.size_id)) {
                    sizesMap.set(v.size_id, {
                        id: v.size_id,
                        name: v.size_name,
                    });
                }
            });
        // Sort sizes? Assuming ID or insertion order for now.
        // Real app might need specific sort order (S, M, L).
        // Relying on variant order for now.
        return Array.from(sizesMap.values());
    }, [product]);

    // Check availability for specific color+size combination
    const checkAvailability = (colorId: number | null, sizeId: number) => {
        if (!colorId) return { available: false, stock: 0 };
        const variant = (product.variants || []).find(
            (v) =>
                v.color_id === colorId && v.size_id === sizeId && v.is_active !== false,
        );
        return {
            available: !!variant,
            stock: variant ? variant.stock : 0,
            variantId: variant?.id,
        };
    };

    // Determine current stock and variant
    const selectedVariant = useMemo(() => {
        if (!selectedColorId || !selectedSizeId) return null;
        return (product.variants || []).find(
            (v) =>
                v.color_id === selectedColorId &&
                v.size_id === selectedSizeId &&
                v.is_active !== false,
        );
    }, [product, selectedColorId, selectedSizeId]);

    // Check how many we already have in the cart
    const { items } = useCart();
    const cartItem = selectedVariant
        ? items.find(
            (item) =>
                item.product.id === product.id &&
                item.color_id === selectedVariant.color_id &&
                item.size_id === selectedVariant.size_id,
        )
        : null;
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const currentStock = selectedVariant ? selectedVariant.stock : 0;

    // Disable if true stock is 0 OR if we already have max in cart
    const isOutOfStock = !!selectedVariant && currentStock === 0;
    const isMaxedOut = !!selectedVariant && quantityInCart >= currentStock;

    const maxAvailable = selectedVariant
        ? Math.max(0, currentStock - quantityInCart)
        : 0;

    const handleQuantityChange = (val: number) => {
        if (val >= 1 && val <= maxAvailable) {
            setQuantity(val);
        }
    };

    const handleAddToCart = () => {
        if (selectedVariant && maxAvailable > 0 && quantity <= maxAvailable) {
            addToCart(
                product,
                quantity,
                selectedVariant.color_id,
                selectedVariant.size_id,
                selectedVariant.color_name,
                selectedVariant.size_name,
            );
            onClose();
            openCart();
        }
    };

    if (!isOpen) return null;

    // Use main image from images array
    const displayImage = product.images?.[0] || "/placeholder-product.svg";

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 animate-in fade-in duration-200 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-[#FDFDFB] rounded-4xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-200 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 z-10 bg-white/80 rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-5">
                    {/* Product Header */}
                    <div className="flex gap-4 mb-6">
                        <div className="w-20 h-24 relative rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                            <NextImage
                                src={getImageUrl(displayImage)}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-koulen text-2xl leading-tight mb-1 uppercase tracking-wide">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="font-koulen text-xl text-[#0e4d80]">
                                    ฿{product.price.toLocaleString()}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-sm font-istok text-gray-400 line-through font-bold">
                                        ฿{product.originalPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="mb-4">
                        <span className="text-sm font-istok font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                            Color
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {uniqueColors.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => {
                                        setSelectedColorId(color.id);
                                        setSelectedSizeId(null); // Reset size when color changes
                                        setQuantity(1); // Reset quantity
                                    }}
                                    className={`w-14 h-14 rounded-full relative border bg-white overflow-hidden shadow-sm transition-all ${selectedColorId === color.id
                                        ? "border-transparent ring-2 ring-black ring-offset-2 scale-105"
                                        : "border-gray-200 hover:border-gray-300 hover:scale-110"
                                        }`}
                                    style={{ backgroundColor: color.code }}
                                    title={color.name}
                                >
                                    {color.image && (
                                        <NextImage
                                            src={getImageUrl(color.image)}
                                            alt={color.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="mb-6">
                        <span className="text-sm font-istok font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                            Size
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {selectedColorId ? (
                                allSizes.length > 0 ? (
                                    allSizes.map((size) => {
                                        const { available, stock } = checkAvailability(
                                            selectedColorId,
                                            size.id,
                                        );
                                        const isSizeOutOfStock = !available || stock <= 0;

                                        return (
                                            <button
                                                key={size.id}
                                                onClick={() => {
                                                    setSelectedSizeId(size.id);
                                                    setQuantity(1); // Reset quantity when size changes
                                                }}
                                                disabled={isSizeOutOfStock}
                                                className={`min-w-12 px-4 py-2 text-sm font-istok font-bold rounded-full border shadow-sm transition-all uppercase tracking-wide ${selectedSizeId === size.id
                                                    ? "bg-black text-white border-transparent transform scale-105"
                                                    : isSizeOutOfStock
                                                        ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through opacity-60"
                                                        : "bg-white text-gray-900 border-gray-200 hover:border-black hover:bg-gray-50"
                                                    }`}
                                            >
                                                {size.name}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-gray-400 italic">
                                        No sizes available.
                                    </p>
                                )
                            ) : (
                                <p className="text-sm text-gray-400 italic">
                                    Please select a color first.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stock Status */}
                    {selectedVariant && (
                        <div className="mb-4 text-sm">
                            {isOutOfStock ? (
                                <span className="text-red-600 font-istok font-bold">Out of Stock</span>
                            ) : isMaxedOut ? (
                                <span className="text-orange-600 font-istok font-bold">
                                    Limit Reached ({currentStock} max, {quantityInCart} in cart)
                                </span>
                            ) : (
                                <span className="text-green-600 font-istok font-bold">
                                    {maxAvailable} available{" "}
                                    {quantityInCart > 0 &&
                                        `(${quantityInCart} currently in cart)`}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Quantity Selector */}
                    {selectedVariant && !isOutOfStock && !isMaxedOut && (
                        <div className="mb-6">
                            <span className="text-sm font-istok font-bold text-gray-700 mb-2 block uppercase tracking-wider">
                                Quantity
                            </span>
                            <div className="flex items-center h-12 bg-white rounded-full border border-gray-200 overflow-hidden shadow-sm w-32">
                                <button
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    disabled={quantity <= 1}
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <div className="flex-1 text-center font-istok font-bold text-base text-gray-900 select-none">
                                    {quantity}
                                </div >
                                <button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    disabled={quantity >= maxAvailable}
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 disabled:opacity-30 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || isOutOfStock || isMaxedOut}
                        className={`w-full py-3 px-4 rounded-full font-koulen tracking-wider text-[16px] uppercase transition-all duration-200 shadow-lg ${!selectedVariant || isOutOfStock || isMaxedOut
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                            : "bg-[#0e4d80] hover:bg-[#0a3a60] text-white hover:shadow-xl hover:scale-[1.02]"
                            }`}
                    >
                        {isOutOfStock
                            ? "Out of Stock"
                            : isMaxedOut
                                ? "Limit Reached"
                                : "Add to Bag"}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
