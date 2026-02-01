"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/app/contexts/CartContext";

import CartItemCard from "@/app/components/cart/CartItemCard";
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 mt-20">
        <div className="h-12 w-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-istok uppercase tracking-wider text-sm">
          Loading your cart...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-[#FDFDFB] pt-20">
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

      {/* Remove Confirmation Modal */}
      {itemToRemove && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#FDFDFB] rounded-4xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 border border-white/50">
            <h3 className="font-koulen text-2xl uppercase tracking-wide text-black mb-4 text-center">
              Remove Item?
            </h3>
            <p className="font-istok text-gray-600 mb-8 text-center text-sm">
              Are you sure you want to remove this item from your cart?
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

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex justify-between items-center mb-12 border-b border-black/5 pb-4">
          <div className="flex items-center gap-8">
            <h1 className="font-koulen text-3xl uppercase tracking-wide text-black">
              Shopping Bag
              <span className="ml-4 font-istok text-lg font-bold text-gray-500 bg-white px-4 py-1 rounded-full align-middle border border-gray-100 shadow-sm">
                {totalItems}
              </span>
            </h1>
            {/* <span className="font-istok text-sm font-bold uppercase tracking-wider text-gray-400 cursor-not-allowed">
            Favourites
          </span> */}
          </div>

          <Link
            href="/"
            className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-black font-istok transition-colors group"
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
  );
}
