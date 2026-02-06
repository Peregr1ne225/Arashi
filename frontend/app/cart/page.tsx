"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/app/contexts/CartContext";

import CartItemCard from "@/app/components/cart/CartItemCard";
import StickySummary from "@/app/components/cart/StickySummary";
import ConfirmationModal from "@/app/components/ui/ConfirmationModal";

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    removeFromCart,
    updateQuantity,
    isUpdating,
  } = useCart();

  const [itemToRemove, setItemToRemove] = useState<number | null>(null);

  // Sort items by id to prevent jumping when updating
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.id - b.id);
  }, [items]);

  const totalOriginalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const original = item.product.originalPrice
        ? Number(item.product.originalPrice)
        : item.price;
      return sum + original * item.quantity;
    }, 0);
  }, [items]);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      setItemToRemove(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      setItemToRemove(null);
    }
  };

  if (items.length === 0 && isUpdating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 mt-20">
        <div className="h-12 w-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-istok uppercase tracking-wider text-sm">
          Loading your cart...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FDFDFB] pt-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold font-istok uppercase tracking-wide text-gray-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-500 mb-8 font-istok text-sm">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-koulen uppercase tracking-wider text-white transition-all bg-[#0e4d80] rounded-full hover:bg-[#0a3a60] shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFDFB] min-h-screen relative">
      {/* Global Loading Overlay for Cart Page */}
      {isUpdating && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center bg-white p-6 rounded-xl shadow-xl">
            <div className="h-10 w-10 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-gray-700">
              Updating cart...
            </p>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal (Shared) */}
      <ConfirmationModal
        isOpen={!!itemToRemove}
        title="Remove Item?"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        variant="danger"
        onConfirm={confirmRemove}
        onCancel={() => setItemToRemove(null)}
      />

      <div className="min-h-screen bg-white pb-4 animate-in fade-in duration-700">
        {/* Hero Header */}
        <div className="w-full py-4 px-4 relative overflow-hidden">
          {/* Background Accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/30 skew-x-[-20deg] translate-x-1/2 pointer-events-none" />

          <div className="container mx-auto text-center relative z-10">
            <div className="inline-block mb-6 animate-in slide-in-from-bottom-4 duration-700">
              <div className="px-6 py-2 rounded-full border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0e4d80] animate-pulse"></div>
                <span className="font-koulen text-[14px] text-[#0e4d80] uppercase tracking-[0.2em]">
                  Your Bag / {totalItems} Items
                </span>
              </div>
            </div>
            <h1 className="font-koulen text-[64px] md:text-[96px] leading-[0.9] text-[#0e4d80] mb-6 uppercase tracking-tighter animate-in zoom-in-95 duration-700">
              Shopping <span className="text-gray-300">Bag</span>
            </h1>
            <p className="font-body text-gray-400 uppercase tracking-[0.4em] text-xs md:text-sm font-bold animate-in slide-in-from-bottom-5 duration-1000 delay-100">
              Review & Checkout
            </p>
          </div>
        </div>

        {/* Main Content Card Container */}
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-blue-900/5 p-8 border border-gray-100 relative overflow-hidden">
            {/* Decorative Blobs */}
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#0e4d80]/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                <Link
                  href="/"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#0e4d80] font-body transition-colors group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Continue Shopping
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Cart Items List */}
                <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 gap-y-6">
                    {sortedItems.map((item) => (
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
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={setItemToRemove}
                      />
                    ))}
                  </div>
                </div>
                {/* Sticky Summary */}
                <div className="lg:col-span-4">
                  <StickySummary
                    subtotal={totalPrice}
                    total={totalPrice}
                    itemCount={totalItems}
                    originalTotal={totalOriginalPrice}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
