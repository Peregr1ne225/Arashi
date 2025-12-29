import { CartItem } from "@/app/contexts/CartContext";
import Cookies from "js-cookie";

// Base API URL - adjust this to match your backend configuration
const isServer = typeof window === "undefined";
// Use proxy /api/v1 for client-side, and internal docker URL for server-side
export const API_BASE_URL = isServer
  ? process.env.INTERNAL_API_URL || "http://backend:8000/api/v1"
  : "/api";

// Common headers for API requests
const headers = {
  "Content-Type": "application/json",
};

/**
 * Generic API client with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    // Get JWT token
    const token = Cookies.get("accessToken");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(url, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // If 'detail' exists, use it. Otherwise, stringify the whole error object (e.g. validation errors)
      const errorMessage = errorData.detail
        || (Object.keys(errorData).length > 0 ? JSON.stringify(errorData) : null)
        || `API error: ${response.status} ${response.statusText}`;

      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Types for order data
export interface OrderItemData {
  product_id: number;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  full_name: string;
  phone_number: string;
  shipping_address: string;
  total_amount: number;
  items: OrderItemData[];
}

export interface Order {
  id: number;
  display_id: string;
  user: number;
  full_name: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: number;
  shipping_address: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  payment_status?: string; // e.g. "pending", "paid"
  stripe_checkout_session_id?: string;
  tracking_number?: string;
}

export interface CreateOrderResponse {
  checkout_url: string;
}

export interface OrderItem {
  id: number;
  order: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
    image_url: string;
    stock: number;
  };
  quantity: number;
  price: number;
  is_rated?: boolean;
}

export interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

/**
 * Orders API client
 */
export const ordersApi = {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderData): Promise<CreateOrderResponse> {
    return apiFetch<CreateOrderResponse>("/orders/orders/", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  /**
   * Get a list of orders for the current user
   */
  async getOrders(params?: { mode?: string }): Promise<OrderListResponse> {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<OrderListResponse>(`/orders/orders/?${query}`);
  },

  /**
   * Get a single order by ID (or display_id)
   */
  async getOrder(id: number | string, params?: { mode?: string }): Promise<Order> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return apiFetch<Order>(`/orders/orders/${id}/${query}`);
  },

  /**
   * Update tracking number (Admin only)
   */
  async updateTracking(id: number | string, trackingNumber: string): Promise<Order> {
    return apiFetch<Order>(`/orders/orders/${id}/tracking/?mode=admin`, {
      method: "PATCH",
      body: JSON.stringify({ tracking_number: trackingNumber }),
    });
  },

  /**
   * Get checkout URL for a pending order
   */
  async payOrder(id: number | string): Promise<{ checkout_url: string }> {
    return apiFetch<{ checkout_url: string }>(`/orders/orders/${id}/pay/`, {
      method: "POST",
    });
  },

  /**
   * Cancel an order if it's still pending
   */
  cancelOrder(id: number | string): Promise<Order> {
    return apiFetch<Order>(`/orders/orders/${id}/cancel/`, {
      method: "POST",
    });
  },

  /**
   * Update order status (Admin only)
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    return apiFetch<Order>(`/orders/orders/${id}/status/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Convert cart items to order items for API submission
   */
  cartItemsToOrderItems(cartItems: CartItem[]): OrderItemData[] {
    return cartItems.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.price,
    }));
  },

  /**
   * Reorder a cancelled/expired order
   */
  async reorder(orderId: number | string): Promise<void> {
    const order = await this.getOrder(orderId);

    // 1. Check for stock availability
    const outOfStockItems = [];

    // Note: order.items.product contains the current product state from the API
    // because OrderItemSerializer uses ProductSerializer(read_only=True)
    for (const item of order.items) {
      if (item.product.stock < item.quantity) {
        outOfStockItems.push(item.product.name);
      }
    }

    if (outOfStockItems.length > 0) {
      const itemsList = outOfStockItems.join(", ");
      throw new Error(`We're sorry, but the following items are currently out of stock: ${itemsList}. Please try again later.`);
    }

    // 2. Add all items to cart (only if all are available)
    const { cartApi } = await import("../cart"); // Works because file is cart.ts

    // Using simple loop for now. In production, consider a bulk add endpoint or Promise.all if independent.
    // Sequential is safer to avoid race conditions with cart ordering if relevant.
    for (const item of order.items) {
      await cartApi.addItem(item.product.id, item.quantity);
    }
  }
};
