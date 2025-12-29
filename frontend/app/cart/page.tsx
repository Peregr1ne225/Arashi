"use client";

import Link from "next/link";
import { useCart } from "@/app/contexts/CartContext";

import CartItemRow from "@/app/components/cart/CartItemRow";
import StickySummary from "@/app/components/cart/StickySummary";

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    removeFromCart,
    updateQuantity,
    isUpdating,
  } = useCart();

  // Sort items by id to prevent jumping when updating
  const sortedItems = [...items].sort((a, b) => a.id - b.id);

  if (items.length === 0 && isUpdating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="h-12 w-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added anything to your cart yet.
            Explore our products to find something you love.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white transition-all bg-black rounded-lg hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative text-white">
      {/* Global Loading Overlay for Cart Page */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center bg-neutral-900 p-8 border border-accent/20 skew-box shadow-[0_0_50px_rgba(204,255,0,0.1)]">
            <div className="h-10 w-10 border-4 border-white/10 border-t-accent animate-spin mb-4"></div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent">Updating Inventory...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
            Locker Inventory
            <span className="ml-4 text-2xl text-accent font-black align-top bg-accent/10 px-3 py-1 skew-box inline-block border border-accent/20">
              {totalItems} ITEMS
            </span>
          </h1>
          <Link href="/" className="hidden md:inline-flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-accent transition-colors group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Keep Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-4">
              {sortedItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  id={item.id}
                  product={item.product}
                  quantity={item.quantity}
                  price={item.price}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="pt-8 md:hidden text-center">
              <Link href="/" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-accent hover:text-white">
                <span className="mr-2">←</span>
                Keep Shopping
              </Link>
            </div>
          </div>

          {/* Sticky Summary */}
          <div className="lg:col-span-4">
            <StickySummary
              subtotal={totalPrice}
              total={totalPrice}
              itemCount={totalItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
