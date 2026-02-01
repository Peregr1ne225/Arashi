"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/app/contexts/CartContext";
import { CartItem } from "@/app/contexts/CartContext";
import { api } from "@/app/lib/api";
import { ordersApi } from "@/app/lib/api/orders";
import { CreateOrderData } from "@/app/types/order";
import { getImageUrl } from "@/app/lib/utils/image";

interface OrderFormData {
  full_name: string;
  phone_number: string;
  shipping_address: string;
}

const CheckoutItem = ({ item }: { item: CartItem }) => {
  const [imgSrc, setImgSrc] = useState(
    getImageUrl(item.product.images?.[0] || "/placeholder-product.svg"),
  );

  return (
    <div className="flex gap-4 items-start">
      <div className="relative w-16 h-20 shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-100">
        <Image
          src={imgSrc}
          alt={item.product.name}
          fill
          className="object-cover"
          onError={() => setImgSrc("/placeholder-product.svg")}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm uppercase tracking-wide text-black truncate pr-4 font-istok">
          {item.product.name}
        </h3>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 font-istok mt-1">
          Qty: {item.quantity}
        </p>
        {(item.color_name || item.size_name) && (
          <p className="text-xs text-gray-400 font-istok mt-1">
            {item.color_name && <span>{item.color_name}</span>}
            {item.color_name && item.size_name && <span> / </span>}
            {item.size_name && <span>{item.size_name}</span>}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end">
        {item.product.originalPrice ? (
          <>
            <span className="font-bold text-red-600 text-sm font-istok">
              ฿{Number(item.price).toFixed(2)}
            </span>
            <span className="text-xs text-gray-400 line-through font-istok">
              ฿{Number(item.product.originalPrice).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="font-bold text-sm text-black font-istok">
            ฿{Number(item.price).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const { items, totalPrice } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    full_name: "",
    phone_number: "",
    shipping_address: "",
  });
  const [errors, setErrors] = useState<Partial<OrderFormData>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [isAuthenticated, router]);

  // Redirect to cart if empty
  useEffect(() => {
    if (isAuthenticated && items.length === 0) {
      router.push("/cart");
    }
  }, [isAuthenticated, items, router]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name:
          prev.full_name ||
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.username ||
          "",
        phone_number: prev.phone_number || user.phone_number || "",
        shipping_address: prev.shipping_address || user.address || "",
      }));
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof OrderFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.full_name || formData.full_name.trim().length < 3) {
      newErrors.full_name = "Full name must be at least 3 characters long";
    }

    if (!formData.phone_number || formData.phone_number.trim().length < 10) {
      newErrors.phone_number =
        "Phone number must be at least 10 characters long";
    }

    if (
      !formData.shipping_address ||
      formData.shipping_address.trim().length < 10
    ) {
      newErrors.shipping_address =
        "Shipping address must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Update Profile (if checked)
      if (saveToProfile) {
        try {
          // Split full name into first and last name
          const nameParts = formData.full_name.trim().split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ");

          const updateData = {
            first_name: firstName,
            last_name: lastName,
            phone_number: formData.phone_number,
            address: formData.shipping_address,
          };

          await api.patch("/auth/profile/update/", updateData);
        } catch (profileError) {
          console.warn("Failed to update profile:", profileError);
          // Don't stop order creation if profile update fails
        }
      }

      // 2. Prepare order data for API
      const orderItems = ordersApi.cartItemsToOrderItems(items);

      const orderData: CreateOrderData = {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim(),
        shipping_address: formData.shipping_address.trim(),
        total_amount: totalPrice,
        items: orderItems,
      };

      // 3. Send order to API
      const response = await ordersApi.createOrder(orderData);

      // Redirect to Stripe Checkout
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      // In a real app, you'd show a toast notification here
      alert(error instanceof Error ? error.message : "Failed to place order");
      setIsSubmitting(false);
    }
  };

  const totalOriginalPrice = items.reduce((sum, item) => {
    const original = item.product.originalPrice
      ? Number(item.product.originalPrice)
      : item.price;
    return sum + original * item.quantity;
  }, 0);

  const discount =
    totalOriginalPrice > totalPrice ? totalOriginalPrice - totalPrice : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] container mx-auto px-4 py-8 pt-20 flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] container mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-koulen uppercase tracking-wide text-black mb-4">
            Your Bag is Empty
          </h1>
          <Link
            href="/"
            className="inline-block py-3 px-8 bg-[#1e1c15] text-white rounded-[10px] font-koulen uppercase tracking-widest text-lg hover:bg-black transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-black font-koulen uppercase tracking-widest border-b border-black/5 pb-4">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content (Forms) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Information Section */}
            <div className="bg-white rounded-4xl shadow-sm p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-black font-istok uppercase tracking-wider flex items-center">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm mr-3 font-koulen">
                  1
                </span>
                Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-bold text-gray-700 mb-2 font-istok uppercase tracking-wide"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-black/20 focus:border-black font-istok transition-colors ${errors.full_name ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50/50"}`}
                    required
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-xs mt-1 font-bold font-istok">
                      {errors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-bold text-gray-700 mb-2 font-istok uppercase tracking-wide"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="0812345678"
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-black/20 focus:border-black font-istok transition-colors ${errors.phone_number ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50/50"}`}
                    required
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-xs mt-1 font-bold font-istok">
                      {errors.phone_number}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Section */}
            <div className="bg-white rounded-4xl shadow-sm p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-black font-istok uppercase tracking-wider flex items-center">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm mr-3 font-koulen">
                  2
                </span>
                Shipping Address
              </h2>
              <div className="space-y-6">
                <div>
                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    rows={4}
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    placeholder="Enter your full delivery address..."
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-1 focus:ring-black/20 focus:border-black font-istok transition-colors resize-none ${errors.shipping_address ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-50/50"}`}
                    required
                  />
                  {errors.shipping_address && (
                    <p className="text-red-500 text-xs mt-1 font-bold font-istok">
                      {errors.shipping_address}
                    </p>
                  )}
                </div>

                {/* Save to Profile Checkbox */}
                <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <input
                    id="save-to-profile"
                    name="save-to-profile"
                    type="checkbox"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                    className="h-5 w-5 text-black focus:ring-black border-gray-300 rounded cursor-pointer accent-black"
                  />
                  <label
                    htmlFor="save-to-profile"
                    className="ml-3 block text-sm font-bold text-gray-600 font-istok uppercase tracking-wider cursor-pointer select-none"
                  >
                    Save this information for next time
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Summary) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-4xl shadow-sm p-6 md:p-8 border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold mb-6 text-black font-istok uppercase tracking-wider border-b border-black/5 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <CheckoutItem key={item.id} item={item} />
                ))}
              </div>

              <div className="border-t border-black/5 pt-6 space-y-3">
                <div className="flex justify-between font-istok text-sm font-bold uppercase tracking-wider text-gray-500">
                  <span>
                    Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)}{" "}
                    items)
                  </span>
                  <span className="text-black">
                    ฿{totalOriginalPrice.toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between font-istok text-sm font-bold uppercase tracking-wider text-red-600">
                    <span>Discount</span>
                    <span>-฿{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-istok text-sm font-bold uppercase tracking-wider text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>

                <div className="h-px bg-black/10 my-4" />

                <div className="flex justify-between items-center font-istok font-bold uppercase tracking-wider text-black text-xl">
                  <span>Total</span>
                  <span>฿{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full mt-8 py-4 bg-[#0e4d80] text-white rounded-full font-koulen uppercase tracking-widest text-lg hover:bg-[#0a3a60] transition-all shadow-lg hover:shadow-xl cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Order"
                )}
              </button>

              <p className="text-xs text-center text-gray-400 mt-4 font-istok font-medium">
                Secure Checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
