"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/contexts/CartContext";
import { getImageUrl } from "@/app/lib/utils/image";

interface CartSheetProps {
  className?: string;
}

export default function CartSheet({ className = "" }: CartSheetProps) {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    isUpdating,
  } = useCart();

  const [itemToRemove, setItemToRemove] = useState<number | null>(null);

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      setItemToRemove(null);
    }
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      setItemToRemove(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Cart Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#FDFDFB] shadow-2xl flex flex-col transform transition-transform animate-slideInRight font-istok sm:rounded-l-4xl border-l border-white/50">
        {/* Loading Overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-[#FDFDFB]/60 z-20 flex items-center justify-center backdrop-blur-sm rounded-l-4xl">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-gray-100 border-t-[#0e4d80] rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Remove Confirmation Modal (Inside Sheet) */}
        {itemToRemove && (
          <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fadeIn">
            <div className="bg-white rounded-[20px] p-8 w-full shadow-2xl">
              <h3 className="font-koulen text-2xl uppercase tracking-wide text-black mb-4 text-center">
                Remove Item?
              </h3>
              <p className="font-istok text-gray-600 mb-8 text-center text-sm">
                Are you sure you want to remove this item?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setItemToRemove(null)}
                  className="flex-1 py-3 rounded-full border border-gray-200 bg-white font-koulen text-lg uppercase tracking-wide hover:bg-gray-50 transition-colors text-black shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="flex-1 py-3 rounded-full bg-[#0e4d80] text-white font-koulen text-lg uppercase tracking-wide hover:bg-[#0a3a60] transition-colors shadow-lg"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 bg-[#FDFDFB] sm:rounded-tl-4xl">
          <h2 className="text-3xl font-koulen uppercase tracking-wide text-black">
            Shopping Bag ({totalItems})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-gray-500 font-bold uppercase tracking-wide mb-2">
                Your bag is empty
              </p>
              <p className="text-sm font-istok text-gray-400 mb-8 font-bold">
                Add some items to get started
              </p>
              <button
                onClick={closeCart}
                className="px-10 py-3 bg-[#0e4d80] text-white rounded-full font-koulen uppercase tracking-wider hover:bg-[#0a3a60] shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md"
                >
                  {/* Product Image */}
                  <div className="relative w-24 aspect-4/5 shrink-0 bg-[#f4f4f5] rounded-2xl overflow-hidden">
                    <Image
                      src={getImageUrl(
                        item.product.images?.[0] || "/placeholder-product.svg",
                      )}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <Link
                        href={`/product/${item.product.id}`}
                        onClick={closeCart}
                        className="font-koulen text-lg text-black uppercase tracking-wide truncate pr-2 hover:text-[#0e4d80] transition-colors leading-tight"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => setItemToRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      {item.product.categoryName || "Apparel"}
                    </p>
                    {/* Variant Info */}
                    {(item.color_name || item.size_name) && (
                      <div className="flex gap-3 mb-auto text-xs text-gray-500 font-medium">
                        {item.color_name && (
                          <span>Color: {item.color_name}</span>
                        )}
                        {item.size_name && <span>Size: {item.size_name}</span>}
                      </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-full h-9 shadow-sm overflow-hidden">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-9 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-istok">
                        {item.quantity}
                      </span>

                      {/* Calculate specific variant stock limit */}
                      {(() => {
                        let availableStock = item.product.stock;
                        if (item.color_id || item.size_id) {
                          const variant = item.product.variants?.find(
                            (v) =>
                              (!item.color_id ||
                                v.color_id === item.color_id) &&
                              (!item.size_id || v.size_id === item.size_id),
                          );
                          if (variant) availableStock = variant.stock;
                        }

                        return (
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            // Correctly disable if strictly >= specific stock
                            disabled={item.quantity >= availableStock}
                            className="w-9 h-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            +
                          </button>
                        );
                      })()}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      {item.product.originalPrice ? (
                        <div className="flex flex-col items-end">
                          <span className="font-koulen text-lg text-[#0e4d80] tracking-wide">
                            ฿{Number(item.price).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 line-through font-istok font-bold">
                            ฿{Number(item.product.originalPrice).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-koulen text-lg tracking-wide text-black">
                          ฿{Number(item.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 sm:p-8 border-t border-gray-100 bg-[#FDFDFB] space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-koulen uppercase tracking-wide text-lg text-black">
                Subtotal
              </span>
              <span className="font-koulen text-2xl text-[#0e4d80]">
                ฿{totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex items-center justify-center py-4 px-4 bg-gray-100 hover:bg-gray-200 text-black rounded-full text-base font-koulen uppercase tracking-wider transition-colors shadow-sm"
              >
                View Cart
              </Link>
              <button
                onClick={closeCart}
                className="flex items-center justify-center py-4 px-4 bg-[#0e4d80] hover:bg-[#0a3a60] text-white rounded-full text-base font-koulen uppercase tracking-wider transition-colors shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
