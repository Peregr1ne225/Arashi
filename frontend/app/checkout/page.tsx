"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import { useCart } from "@/app/contexts/CartContext";
import { CartItem } from "@/app/contexts/CartContext";
import { Product } from "@/app/types";
import { api } from "@/app/lib/api";
import { ordersApi, CreateOrderData, Order } from "@/app/lib/api/orders";

interface OrderFormData {
  full_name: string;
  phone_number: string;
  shipping_address: string;
}

const CheckoutItem = ({ item }: { item: CartItem }) => {
  const [imgSrc, setImgSrc] = useState(
    item.product.image || item.product.image_url || "/placeholder-product.svg"
  );

  return (
    <div className="flex gap-4 border-b border-white/5 pb-4 last:border-0">
      <div className="relative w-20 h-20 flex-shrink-0 bg-black border border-white/10 overflow-hidden skew-box-sm">
        <Image
          src={imgSrc}
          alt={item.product.name}
          fill
          className="object-cover"
          onError={() => setImgSrc("/placeholder-product.svg")}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg uppercase italic tracking-tighter text-white line-clamp-1">
          {item.product.name}
        </h3>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
          QTY: {item.quantity}
        </p>
        <div className="font-black text-accent italic tracking-tighter text-lg">
          {/* Display original price if discounted */}
          {item.product.originalPrice ? (
            <>
              <span className="line-through mr-2 text-gray-600 text-sm font-bold decoration-accent">
                ฿{Number(item.product.originalPrice).toFixed(2)}
              </span>
              <span>
                ฿{Number(item.price).toFixed(2)}
              </span>
            </>
          ) : (
            <span>฿{Number(item.price).toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderData, setOrderData] = useState<Order | null>(null);
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
    if (isAuthenticated && items.length === 0 && !orderComplete) {
      router.push("/cart");
    }
  }, [isAuthenticated, items, router, orderComplete]);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="text-accent font-bold uppercase tracking-widest animate-pulse">Loading Authenticated Session...</div>
      </div>
    );
  }

  if (orderComplete && orderData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-neutral-900 border border-accent rounded-none skew-box p-8 text-center shadow-[0_0_50px_rgba(204,255,0,0.1)]">
            <div className="w-20 h-20 mx-auto bg-accent/20 border border-accent rounded-full flex items-center justify-center mb-6 animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-4">
              Victory! Order Placed
            </h1>
            <p className="text-gray-400 mb-8 font-bold uppercase tracking-wide">
              Your order #{orderData.id} is confirmed and entering the locker.
            </p>
            <div className="space-y-4">
              <Link
                href="/account"
                className="btn-primary w-full py-4 block"
              >
                View My Orders //
              </Link>
              <Link
                href="/"
                className="block w-full py-4 border border-white/20 text-white hover:border-accent hover:text-accent font-bold uppercase tracking-widest transition skew-box"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="bg-neutral-900 border border-white/10 skew-box p-12 text-center">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">Locker is Empty</h2>
          <Link href="/" className="text-accent hover:underline font-bold uppercase tracking-wide">Go to Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white mb-12 border-b border-white/10 pb-6">
          Checkout // <span className="text-accent">Game Plan</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6 flex items-center gap-3">
              <span className="bg-accent text-black w-8 h-8 flex items-center justify-center text-lg skew-box font-bold">1</span>
              Your Gear
            </h2>
            <div className="bg-neutral-900 border border-white/10 skew-box p-6 space-y-6">
              {items.map((item) => (
                <CheckoutItem key={item.id} item={item} />
              ))}

              <div className="pt-6 border-t border-dashed border-white/20">
                <div className="flex justify-between font-black text-2xl uppercase italic tracking-tighter text-white">
                  <span>Total</span>
                  <span className="text-accent">฿{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information Form */}
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-6 flex items-center gap-3">
              <span className="bg-white text-black w-8 h-8 flex items-center justify-center text-lg skew-box font-bold">2</span>
              Shipping Details
            </h2>
            <div className="bg-neutral-900 border-2 border-dashed border-accent/20 p-8 skew-box relative">
              {/* Ticket cutouts */}
              <div className="absolute -left-3 top-1/2 w-6 h-6 bg-background rounded-full transform -translate-y-1/2"></div>
              <div className="absolute -right-3 top-1/2 w-6 h-6 bg-background rounded-full transform -translate-y-1/2"></div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-black border ${errors.full_name ? "border-red-500" : "border-white/20"} rounded-none text-white font-bold tracking-wide focus:outline-none focus:border-accent skew-box placeholder-gray-700 transition-colors`}
                    placeholder="ENTER YOUR FULL NAME"
                    required
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-wide">
                      {errors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-black border ${errors.phone_number ? "border-red-500" : "border-white/20"} rounded-none text-white font-bold tracking-wide focus:outline-none focus:border-accent skew-box placeholder-gray-700 transition-colors`}
                    placeholder="ENTER PHONE NUMBER"
                    required
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-wide">
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="shipping_address"
                    className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
                  >
                    Shipping Address
                  </label>
                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    rows={4}
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-black border ${errors.shipping_address ? "border-red-500" : "border-white/20"} rounded-none text-white font-bold tracking-wide focus:outline-none focus:border-accent skew-box placeholder-gray-700 transition-colors resize-none`}
                    placeholder="ENTER DELIVERY ADDRESS..."
                    required
                  />
                  {errors.shipping_address && (
                    <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-wide">
                      {errors.shipping_address}
                    </p>
                  )}
                </div>

                {/* Save to Profile Checkbox */}
                <div className="flex items-center group cursor-pointer">
                  <input
                    id="save-to-profile"
                    name="save-to-profile"
                    type="checkbox"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                    className="h-5 w-5 bg-black border-white/20 rounded-none text-accent focus:ring-accent focus:ring-offset-black"
                  />
                  <label htmlFor="save-to-profile" className="ml-3 block text-sm font-bold uppercase tracking-wide text-gray-400 group-hover:text-white transition-colors cursor-pointer select-none">
                    Save to Locker Profile
                  </label>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-5 text-xl relative overflow-hidden group"
                  >
                    {isSubmitting ? "PROCESSING..." : "CONFIRM ORDER //"}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                  </button>
                  <p className="text-center mt-4 text-xs font-bold uppercase tracking-widest text-gray-600">
                    Redirecting to Secure Payment
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
