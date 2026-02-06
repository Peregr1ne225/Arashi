"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/app/contexts/CartContext";
import { CartItem } from "@/app/contexts/CartContext";
import { api } from "@/app/lib/api";
import { ordersApi } from "@/app/lib/api/orders";
import { CreateOrderData } from "@/app/types/order";
import { getImageUrl } from "@/app/lib/utils/image";
import MessageModal from "@/app/components/ui/MessageModal";

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
    <div className="flex gap-4 items-start group">
      <div className="relative w-20 aspect-[3/4] shrink-0 bg-[#f4f4f5] rounded-2xl overflow-hidden border border-gray-100/50 shadow-sm">
        <Image
          src={imgSrc}
          alt={item.product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgSrc("/placeholder-product.svg")}
        />
      </div>
      <div className="flex-1 min-w-0 py-1">
        <h3 className="font-koulen text-base uppercase tracking-wide text-[#0e4d80] truncate pr-4 leading-tight mb-1">
          {item.product.name}
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-body">
          Qty: {item.quantity}
        </p>
        {(item.color_name || item.size_name) && (
          <div className="flex gap-2 mt-2">
            {item.color_name && (
              <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-500 font-bold uppercase tracking-wider border border-gray-100">
                {item.color_name}
              </span>
            )}
            {item.size_name && (
              <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-500 font-bold uppercase tracking-wider border border-gray-100">
                {item.size_name}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end py-1">
        {item.product.originalPrice ? (
          <>
            <span className="font-koulen text-black text-lg tracking-wide">
              ฿{Number(item.price).toFixed(2)}
            </span>
            <span className="text-xs text-red-400 line-through font-body font-bold">
              ฿{Number(item.product.originalPrice).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="font-koulen text-black text-lg tracking-wide">
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

  // Message Modal
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

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
      setMessageModal({
        isOpen: true,
        title: "Order Failed",
        message: error instanceof Error ? error.message : "Failed to place order",
        type: "error",
      });
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
        <div className="text-center max-w-md mx-auto animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="font-koulen text-4xl text-gray-300">0</span>
          </div>
          <h1 className="text-4xl font-koulen uppercase tracking-wide text-[#0e4d80] mb-4">
            Cart is Empty
          </h1>
          <p className="text-gray-400 mb-8 font-body font-bold uppercase tracking-widest text-xs">
            Redirecting you to the cart page...
          </p>
          <div className="h-1 w-24 bg-gray-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-[#0e4d80] animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
                Secure Checkout
              </span>
            </div>
          </div>
          <h1 className="font-koulen text-[64px] md:text-[96px] leading-[0.9] text-[#0e4d80] mb-6 uppercase tracking-tighter animate-in zoom-in-95 duration-700">
            Final <span className="text-gray-300">Steps</span>
          </h1>
          <p className="font-body text-gray-400 uppercase tracking-[0.4em] text-xs md:text-sm font-bold animate-in slide-in-from-bottom-5 duration-1000 delay-100">
            Shipping & Payment
          </p>
        </div>
      </div>

      {/* Main Content Card Container */}
      <div className="container mx-auto p-4 max-w-[1600px]">
        <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl shadow-blue-900/5 p-8 border border-gray-100 relative overflow-hidden">
          {/* Decorative Blobs */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#0e4d80]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Main Content (Forms) */}
              <div className="lg:col-span-6 space-y-8">
                {/* Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="w-10 h-10 rounded-full bg-[#0e4d80] text-white flex items-center justify-center text-lg font-koulen shadow-lg shadow-blue-900/20">
                      1
                    </span>
                    <h2 className="text-2xl font-koulen text-[#0e4d80] uppercase tracking-wide">
                      Information
                    </h2>
                  </div>

                  <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 space-y-6">
                    <div>
                      <label
                        htmlFor="full_name"
                        className="block text-xs font-bold text-gray-400 mb-2 font-body uppercase tracking-[0.2em]"
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
                        className={`w-full px-6 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0e4d80]/20 focus:border-[#0e4d80] font-body text-gray-700 transition-all shadow-sm ${errors.full_name ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                        required
                      />
                      {errors.full_name && (
                        <p className="text-red-500 text-xs mt-2 font-bold font-body tracking-wide uppercase">
                          {errors.full_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone_number"
                        className="block text-xs font-bold text-gray-400 mb-2 font-body uppercase tracking-[0.2em]"
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
                        className={`w-full px-6 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0e4d80]/20 focus:border-[#0e4d80] font-body text-gray-700 transition-all shadow-sm ${errors.phone_number ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                        required
                      />
                      {errors.phone_number && (
                        <p className="text-red-500 text-xs mt-2 font-bold font-body tracking-wide uppercase">
                          {errors.phone_number}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="w-10 h-10 rounded-full bg-[#0e4d80] text-white flex items-center justify-center text-lg font-koulen shadow-lg shadow-blue-900/20">
                      2
                    </span>
                    <h2 className="text-2xl font-koulen text-[#0e4d80] uppercase tracking-wide">
                      Shipping Address
                    </h2>
                  </div>

                  <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 space-y-6">
                    <div>
                      <textarea
                        id="shipping_address"
                        name="shipping_address"
                        rows={4}
                        value={formData.shipping_address}
                        onChange={handleInputChange}
                        placeholder="Enter your full delivery address..."
                        className={`w-full px-6 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0e4d80]/20 focus:border-[#0e4d80] font-body text-gray-700 transition-all resize-none shadow-sm ${errors.shipping_address ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                        required
                      />
                      {errors.shipping_address && (
                        <p className="text-red-500 text-xs mt-2 font-bold font-body tracking-wide uppercase">
                          {errors.shipping_address}
                        </p>
                      )}
                    </div>

                    {/* Save to Profile Checkbox */}
                    <div className="flex items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <input
                        id="save-to-profile"
                        name="save-to-profile"
                        type="checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="h-5 w-5 text-[#0e4d80] focus:ring-[#0e4d80] border-gray-300 rounded cursor-pointer accent-[#0e4d80]"
                      />
                      <label
                        htmlFor="save-to-profile"
                        className="ml-3 block text-xs font-bold text-gray-500 font-body uppercase tracking-[0.1em] cursor-pointer select-none group-hover:text-[#0e4d80] transition-colors"
                      >
                        Save this information for next time
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (Summary) */}
              <div className="lg:col-span-6 space-y-8">
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-8 border border-gray-100 sticky top-4">
                  <h2 className="text-xl font-koulen text-[#0e4d80] uppercase tracking-wide mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item) => (
                      <CheckoutItem key={item.id} item={item} />
                    ))}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-gray-100">
                    <div className="flex justify-between font-body text-xs font-bold uppercase tracking-widest text-gray-400">
                      <span>
                        Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)}{" "}
                        items)
                      </span>
                      <span className="text-gray-600">
                        ฿{totalOriginalPrice.toFixed(2)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between font-body text-xs font-bold uppercase tracking-widest text-red-500">
                        <span>Discount</span>
                        <span>-฿{discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-body text-xs font-bold uppercase tracking-widest text-gray-400">
                      <span>Shipping</span>
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md">FREE</span>
                    </div>

                    <div className="h-px bg-gray-100 my-6" />

                    <div className="flex justify-between items-end">
                      <span className="font-koulen text-xl text-gray-400 uppercase tracking-wide">Total</span>
                      <span className="font-koulen text-4xl text-[#0e4d80] leading-none">฿{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full mt-8 py-5 bg-[#0e4d80] text-white rounded-full font-koulen uppercase tracking-[0.2em] text-lg hover:bg-[#0a3a60] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Order
                        <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-center text-gray-400 mt-6 font-body font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Secure Checkout powered by Stripe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MessageModal
        isOpen={messageModal.isOpen}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
        onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
      />
    </div>
  );
}
