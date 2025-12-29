import { api } from "../api";
import { Product } from "@/app/types";

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  total_price: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
  total_items: number;
}

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get("/cart/");
    return response.json();
  },

  addItem: async (productId: number, quantity: number = 1): Promise<Cart> => {
    const response = await api.post("/cart/items/", {
      product_id: productId,
      quantity,
    });
    return response.json();
  },

  updateItem: async (itemId: number, quantity: number): Promise<Cart> => {
    const response = await api.patch(`/cart/items/${itemId}/`, {
      quantity,
    });
    return response.json();
  },

  removeItem: async (itemId: number): Promise<Cart | null> => {
    const response = await api.delete(`/cart/items/${itemId}/`);
    if (response.status === 204) {
      return null;
    }
    return response.json();
  },

  clearCart: async (): Promise<Cart> => {
    const response = await api.post("/cart/clear/", {});
    return response.json();
  },
};
