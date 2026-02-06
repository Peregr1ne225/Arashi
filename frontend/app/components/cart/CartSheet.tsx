"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/contexts/CartContext";
import CartItemCard from "@/app/components/cart/CartItemCard";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";

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

        {/* Remove Confirmation Modal (Shared) */}
        <ConfirmationModal
          isOpen={!!itemToRemove}
          title="Remove Item?"
          message="Are you sure you want to remove this item?"
          confirmText="Remove"
          variant="danger"
          onConfirm={confirmRemove}
          onCancel={() => setItemToRemove(null)}
        />

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
                <CartItemCard
                  key={item.id}
                  id={item.id}
                  product={item.product}
                  category={item.product.categoryName || "Apparel"}
                  quantity={item.quantity}
                  price={item.price}
                  color={item.color_name}
                  size={item.size_name}
                  colorId={item.color_id}
                  sizeId={item.size_id}
                  onUpdateQuantity={updateQuantity}
                  onRemove={setItemToRemove}
                  variant="compact"
                />
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
              <button
                onClick={closeCart}
                className="flex items-center justify-center py-4 px-4 bg-gray-100 hover:bg-gray-200 text-black rounded-full text-base font-koulen uppercase tracking-wider transition-colors shadow-sm"
              >
                Continue Shopping
              </button>
              <Link
                href="/cart"
                onClick={closeCart}
                className="flex items-center justify-center py-4 px-4 bg-[#0e4d80] hover:bg-[#0a3a60] text-white rounded-full text-base font-koulen uppercase tracking-wider transition-colors shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
