import { CartItem } from "@/app/contexts/CartContext";
import { api } from "@/app/lib/api";
import {
  Order,
  OrderItemData,
  CreateOrderData,
  CreateOrderResponse,
  OrderListResponse,
  OrderItem,
  OrderStats
} from "@/app/types/order";

/**
 * Helper to map a raw Order from the backend to the frontend Order type
 */
function mapOrder(order: unknown): Order {
  const rawOrder = order as Record<string, unknown>;
  const items = rawOrder.items;
  return {
    ...rawOrder,
    items: Array.isArray(items) ? items.map(mapOrderItem) : [],
  } as unknown as Order;
}

/**
 * Helper to map a raw OrderItem to ensure its product images are strings
 */
function mapOrderItem(item: unknown): OrderItem {
  const rawItem = item as Record<string, unknown>;
  const product = rawItem.product as Record<string, unknown> | undefined;

  if (!product || !Array.isArray(product.images)) {
    return rawItem as unknown as OrderItem;
  }

  const mappedImages = product.images.map((img: unknown) => {
    if (typeof img === "object" && img !== null && "image" in img) {
      return (img as { image: string }).image;
    }
    return String(img);
  });

  return {
    ...rawItem,
    product: {
      ...product,
      images: mappedImages,
    },
  } as unknown as OrderItem;
}

/**
 * Orders API client
 */
export const ordersApi = {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderData): Promise<CreateOrderResponse> {
    const response = await api.post("/orders/orders/", orderData);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.detail ||
        (Object.keys(errorData).length > 0
          ? JSON.stringify(errorData)
          : "Failed to create order");
      throw new Error(errorMessage);
    }
    return response.json();
  },

  /**
   * Get a list of orders for the current user
   */
  async getOrders(params?: {
    mode?: string;
    ordering?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<OrderListResponse> {
    const query = new URLSearchParams(
      params as Record<string, string>,
    ).toString();
    const response = await api.get(`/orders/orders/?${query}`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    const data: OrderListResponse = await response.json();

    // Map each order to ensure product images are string arrays
    return {
      ...data,
      results: data.results.map(mapOrder),
    };
  },

  /**
   * Get a single order by ID (or display_id)
   */
  async getOrder(
    id: number | string,
    params?: { mode?: string },
  ): Promise<Order> {
    const query = params
      ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
      : "";
    const response = await api.get(`/orders/orders/${id}/${query}`);
    if (!response.ok) throw new Error("Failed to fetch order");
    const data: Order = await response.json();
    return mapOrder(data);
  },

  /**
   * Update tracking number (Admin only)
   */
  async updateTracking(
    id: number | string,
    trackingNumber: string,
  ): Promise<Order> {
    const response = await api.patch(
      `/orders/orders/${id}/tracking/?mode=admin`,
      {
        tracking_number: trackingNumber,
      },
    );
    if (!response.ok) throw new Error("Failed to update tracking");
    return response.json();
  },

  /**
   * Get checkout URL for a pending order
   */
  async payOrder(id: number | string): Promise<{ checkout_url: string }> {
    const response = await api.post(`/orders/orders/${id}/pay/`, {});
    if (!response.ok) throw new Error("Failed to get payment URL");
    return response.json();
  },

  /**
   * Cancel an order if it's still pending
   */
  async cancelOrder(id: number | string): Promise<Order> {
    const response = await api.post(`/orders/orders/${id}/cancel/`, {});
    if (!response.ok) throw new Error("Failed to cancel order");
    return response.json();
  },

  /**
   * Update order status (Admin only)
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    const response = await api.patch(`/orders/orders/${id}/status/`, {
      status,
    });
    if (!response.ok) throw new Error("Failed to update status");
    return response.json();
  },

  /**
   * Convert cart items to order items for API submission
   */
  cartItemsToOrderItems(cartItems: CartItem[]): OrderItemData[] {
    return cartItems.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.price,
      color_id: item.color_id || null,
      size_id: item.size_id || null,
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
      throw new Error(
        `We're sorry, but the following items are currently out of stock: ${itemsList}. Please try again later.`,
      );
    }

    // 2. Add all items to cart (only if all are available)
    const { cartApi } = await import("./cart"); // Works because file is cart.ts

    // Using simple loop for now. In production, consider a bulk add endpoint or Promise.all if independent.
    // Sequential is safer to avoid race conditions with cart ordering if relevant.
    for (const item of order.items) {
      await cartApi.addItem(item.product.id, item.quantity);
    }
  },

  /**
   * Get order statistics
   */
  async getStats(): Promise<OrderStats> {
    const response = await api.get("/orders/orders/stats/");
    if (!response.ok) throw new Error("Failed to fetch order stats");
    return response.json();
  },
}