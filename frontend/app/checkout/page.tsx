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
    <div className="flex gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={imgSrc}
          alt={item.product.name}
          fill
          className="object-cover rounded-md"
          onError={() => setImgSrc("/placeholder-product.svg")}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-sm text-black">
          {item.product.name}
        </h3>
        <p className="text-sm text-gray-600">
          Qty: {item.quantity}
        </p>
        <div className="font-semibold text-black">
          {/* Display original price if discounted */}
          {item.product.originalPrice ? (
            <>
              <span className="line-through mr-1 text-gray-400 text-sm">
                ฿{Number(item.product.originalPrice).toFixed(2)}
              </span>
              <span className="text-red-600">
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
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8">
        Loading...
      </div>
    );
  }

  if (orderComplete && orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-black">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 mb-6">
              Your order #{orderData.id} has been received and is now being
              processed.
            </p>
            <div className="space-y-3">
              <Link
                href="/account"
                className="block w-full py-3 px-4 bg-blue-600 text-white rounded-md text-center font-medium hover:bg-blue-700 transition"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                className="block w-full py-3 px-4 border border-gray-300 rounded-md text-center font-medium hover:bg-gray-50 transition"
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
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          Your cart is empty
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-black pt-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-black">
              Order Summary
            </h2>
            <div className="bg-white rounded-md shadow-sm p-4 space-y-4">
              {items.map((item) => (
                <CheckoutItem key={item.id} item={item} />
              ))}

              <div className="pt-4 border-t">
                <div className="flex justify-between font-semibold text-black">
                  <span>Total</span>
                  <span>฿{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information Form */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-black">
              Shipping Information
            </h2>
            <div className="bg-white rounded-md shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.full_name ? "border-red-500" : "border-gray-300"
                      }`}
                    required
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.phone_number ? "border-red-500" : "border-gray-300"
                      }`}
                    required
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="shipping_address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Shipping Address
                  </label>
                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    rows={4}
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.shipping_address
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                    required
                  />
                  {errors.shipping_address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.shipping_address}
                    </p>
                  )}
                </div>

                {/* Save to Profile Checkbox */}
                <div className="flex items-center">
                  <input
                    id="save-to-profile"
                    name="save-to-profile"
                    type="checkbox"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="save-to-profile" className="ml-2 block text-sm text-gray-900">
                    Save this information to my profile
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Placing Order..." : "Confirm Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
