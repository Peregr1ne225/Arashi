"use client";

import React from "react";
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

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Cart Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-neutral-900 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col transform transition-transform duration-300">
        {/* Loading Overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-white/20 border-t-accent animate-spin skew-box"></div>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-accent animate-pulse">Syncing Gear...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Locker <span className="text-accent">Manifest</span>
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
              {totalItems} Unit{totalItems !== 1 ? 's' : ''} Selected
            </p>
          </div>
          <button
            onClick={closeCart}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-900 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-white/10 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Empty Locker</h3>
              <p className="text-sm font-bold uppercase tracking-wide text-gray-500 max-w-[200px]">
                Your equipment list is currently empty.
              </p>
              <button
                onClick={closeCart}
                className="mt-8 text-accent hover:text-white font-bold uppercase tracking-widest text-xs border-b border-accent hover:border-white transition-colors pb-1"
              >
                Return to Base
              </button>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="group relative flex gap-4 bg-black border border-white/10 hover:border-accent/40 col-span-1 p-3 skew-box transition-all">
                  {/* Product Image */}
                  <div className="relative w-20 h-24 shrink-0 bg-neutral-800 border border-white/5 overflow-hidden">
                    <Image
                      src={getImageUrl(item.product.image || item.product.image_url || "/placeholder-product.svg")}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-white uppercase italic tracking-wider truncate pr-6 text-sm">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.product.originalPrice ? (
                          <>
                            <span className="text-xs font-bold uppercase tracking-wide text-accent">
                              ฿{Number(item.price).toFixed(2)}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wide text-gray-600 line-through decoration-red-500">
                              ฿{Number(item.product.originalPrice).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            ฿{Number(item.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity */}
                      <div className="flex items-center border border-white/20 bg-neutral-900 skew-box-sm scale-90 origin-left">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-bold text-lg"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-black text-white tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-bold text-lg"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="square"
                            strokeLinejoin="miter"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/10 bg-black/60 p-6 space-y-6 backdrop-blur-md">
            {/* Subtotal */}
            <div className="flex justify-between items-end">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total Estimated</span>
              <span className="text-2xl font-black italic tracking-tighter text-white">฿{totalPrice.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full py-4 bg-accent text-black font-black uppercase italic tracking-widest text-center hover:bg-white transition-colors skew-box shadow-[0_0_20px_rgba(204,255,0,0.3)]"
              >
                Review Full Manifest
              </Link>
              <button
                onClick={closeCart}
                className="block w-full py-3 border border-white/20 text-gray-400 font-bold uppercase tracking-widest text-xs text-center hover:text-white hover:border-white transition-colors skew-box"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
