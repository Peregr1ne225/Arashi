import { api } from "../api";
import { Cart, AddToCartPayload } from "@/app/types/cart";

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get("/cart/");
    return response.json();
  },

  addItem: async (
    productId: number,
    quantity: number = 1,
    color_id?: number,
    size_id?: number,
  ): Promise<Cart> => {
    const payload: AddToCartPayload = {
      product_id: productId,
      quantity,
    };

    if (color_id) payload.color_id = color_id;
    if (size_id) payload.size_id = size_id;

    const response = await api.post("/cart/items/", payload);
    if (!response.ok) {
      throw new Error("Failed to add item");
    }
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
