"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { ProductCardData, toProductCardData } from "@/app/types/product";
import { useAuth } from "@/app/hooks/useAuth";
import { cartApi } from "@/app/lib/api/cart";
import { mapProducts } from "@/app/lib/api/client";
import { CartItem as ApiCartItem } from "@/app/types/cart";

// Versioned localStorage key - change version when schema changes
const CART_VERSION = "v1";
const CART_KEY = `cart:${CART_VERSION}`;

// Helper for loading cart from localStorage with error handling
function loadLocalCart(): CartItem[] {
  try {
    if (typeof window === "undefined") return [];
    const savedCart = localStorage.getItem(CART_KEY);
    if (!savedCart) return [];
    const parsed = JSON.parse(savedCart);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Handles JSON parse errors, incognito mode, quota exceeded
    return [];
  }
}

// Helper for saving cart to localStorage with error handling
function saveLocalCart(items: CartItem[]): void {
  try {
    if (typeof window === "undefined") return;
    // Store only essential fields to minimize storage usage
    const minimized = items.map((item) => ({
      id: item.id,
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      color_id: item.color_id,
      size_id: item.size_id,
      color_name: item.color_name,
      size_name: item.size_name,
    }));
    localStorage.setItem(CART_KEY, JSON.stringify(minimized));
  } catch {
    // Silently fail if storage is full or in incognito mode
  }
}

// Helper for clearing cart from localStorage
function clearLocalCart(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CART_KEY);
  } catch {
    // Silently fail
  }
}

// Helper for consistent mapping
const mapApiItemToCartItem = (apiItems: ApiCartItem[]): CartItem[] => {
  return apiItems.map((item) => {
    const mappedProduct = mapProducts([item.product])[0];
    // Convert to ProductCardData for minimal serialization
    const productCardData = toProductCardData(mappedProduct);
    return {
      id: item.id,
      product: productCardData,
      quantity: item.quantity,
      price: Number(mappedProduct.price),
      color_id: item.color_id,
      size_id: item.size_id,
      color_name: item.color_name,
      size_name: item.size_name,
    };
  });
};

// Define cart item type
export interface CartItem {
  id: number;
  product: ProductCardData;
  quantity: number;
  // Store price at time of adding to cart
  price: number;
  color_id?: number;
  size_id?: number;
  color_name?: string;
  size_name?: string;
}

// Define cart state type
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isUpdating: boolean;
}

// Define cart context type
interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  isUpdating: boolean;
  totalItems: number;
  totalPrice: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (
    product: ProductCardData,
    quantity?: number,
    color_id?: number,
    size_id?: number,
    color_name?: string,
    size_name?: string,
  ) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
}

// Define action types for the reducer
type CartAction =
  | {
    type: "ADD_TO_CART";
    payload: {
      product: ProductCardData;
      quantity?: number;
      color_id?: number;
      size_id?: number;
      color_name?: string;
      size_name?: string;
    };
  }
  | { type: "REMOVE_FROM_CART"; payload: { productId: number } }
  | {
    type: "UPDATE_QUANTITY";
    payload: { productId: number; quantity: number };
  }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: { items: CartItem[] } }
  | { type: "SET_UPDATING"; payload: boolean };

// Initial state
const initialState: CartState = {
  items: [],
  isOpen: false,
  isUpdating: false,
};

// Reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "SET_UPDATING": {
      return {
        ...state,
        isUpdating: action.payload,
      };
    }
    case "ADD_TO_CART": {
      const { product, quantity = 1 } = action.payload;

      // Check if item already exists in cart (matching product + variant)
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.color_id === action.payload.color_id &&
          item.size_id === action.payload.size_id,
      );

      // Trust the product.price as the final selling price
      const effectivePrice = Number(product.price);

      // STOCK VALIDATION
      let stock = product.stock;

      // If adding a variant, check that specific variant's stock
      if (action.payload.color_id || action.payload.size_id) {
        const variant = product.variants?.find(
          (v) =>
            (!action.payload.color_id ||
              v.color_id === action.payload.color_id) &&
            (!action.payload.size_id || v.size_id === action.payload.size_id),
        );
        if (variant) {
          stock = variant.is_active !== false ? variant.stock : 0;
        }
      }

      if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];

        // Calculate new quantity but cap at stock
        const newQuantity = Math.min(existingItem.quantity + quantity, stock);

        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };

        return {
          ...state,
          items: updatedItems,
        };
      } else {
        // Add new item, ensuring we don't start with more than stock
        const validQuantity = Math.min(quantity, stock);

        // Generate a unique temp ID to avoid key collisions (e.g. Product 26 Blue vs Product 26 Black)
        // Use negative number to distinguish from real DB IDs
        const tempId = -1 * (Date.now() + Math.floor(Math.random() * 1000));

        const newItem: CartItem = {
          id: tempId,
          product,
          quantity: validQuantity,
          price: effectivePrice,
          color_id: action.payload.color_id,
          size_id: action.payload.size_id,
          color_name: action.payload.color_name,
          size_name: action.payload.size_name,
        };

        return {
          ...state,
          items: [...state.items, newItem],
        };
      }
    }

    case "REMOVE_FROM_CART": {
      return {
        ...state,
        items: state.items.filter(
          (item) => item.id !== action.payload.productId,
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== productId),
        };
      }

      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id === productId) {
            // Cap at stock, but check if variant is still active
            let effectiveStock = item.product.stock;
            if (item.color_id || item.size_id) {
              const variant = item.product.variants?.find(
                (v) =>
                  (!item.color_id || v.color_id === item.color_id) &&
                  (!item.size_id || v.size_id === item.size_id),
              );
              if (variant) {
                effectiveStock =
                  variant.is_active !== false ? variant.stock : 0;
              }
            }

            const validQuantity = Math.min(quantity, effectiveStock);
            return { ...item, quantity: validQuantity };
          }
          return item;
        }),
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
      };
    }

    case "OPEN_CART": {
      return {
        ...state,
        isOpen: true,
      };
    }

    case "CLOSE_CART": {
      return {
        ...state,
        isOpen: false,
      };
    }

    case "LOAD_CART": {
      return {
        ...state,
        items: action.payload.items,
      };
    }

    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth(); // Assume useAuth is available and working

  // Load cart from localStorage on mount (for anonymous) or API (for auth)
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        try {
          // Merge logic: check if there are local items to sync first
          const localItems = loadLocalCart();
          if (localItems.length > 0) {
            // Sync each item to backend
            for (const item of localItems) {
              await cartApi.addItem(
                item.product.id,
                item.quantity,
                item.color_id,
                item.size_id,
              );
            }
            // Clear local cart after successful sync
            clearLocalCart();
          }

          // ALWAYS fetch remote cart on mount to ensure badge and data are correct
          const remoteCart = await cartApi.getCart();
          const items = mapApiItemToCartItem(remoteCart.items);
          dispatch({ type: "LOAD_CART", payload: { items } });
        } catch (error) {
          console.error("Failed to load cart from API:", error);
        }
      } else {
        // Load from localStorage for anonymous users
        const localItems = loadLocalCart();
        if (localItems.length > 0) {
          dispatch({ type: "LOAD_CART", payload: { items: localItems } });
        }
      }
    };
    loadCart();
  }, [isAuthenticated]);

  // Save cart to localStorage for anonymous users whenever items change
  useEffect(() => {
    if (!isAuthenticated && state.items.length >= 0) {
      saveLocalCart(state.items);
    }
  }, [isAuthenticated, state.items]);

  // Define actions with API side-effects
  const openCart = useCallback(async () => {
    dispatch({ type: "OPEN_CART" });
    // Lazy load: Fetch when opened to ensure fresh data
    if (isAuthenticated) {
      dispatch({ type: "SET_UPDATING", payload: true });
      try {
        const remoteCart = await cartApi.getCart();
        const items = mapApiItemToCartItem(remoteCart.items);
        dispatch({ type: "LOAD_CART", payload: { items } });
      } catch (error) {
        console.error("Failed to fetch cart on open", error);
      } finally {
        dispatch({ type: "SET_UPDATING", payload: false });
      }
    }
  }, [isAuthenticated]); // dispatch is stable

  const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);


  const addToCart = useCallback(
    async (
      product: ProductCardData,
      quantity = 1,
      color_id?: number,
      size_id?: number,
      color_name?: string,
      size_name?: string,
    ) => {
      // Prevent multiple actions while syncing
      if (state.isUpdating) return;

      // Optimistic update
      const optimisticProduct = product;
      dispatch({
        type: "ADD_TO_CART",
        payload: {
          product: optimisticProduct,
          quantity,
          color_id,
          size_id,
          color_name,
          size_name,
        }
      });

      // Open cart WITHOUT fetching (avoid racing with the add operation)
      dispatch({ type: "OPEN_CART" });

      if (isAuthenticated) {
        dispatch({ type: "SET_UPDATING", payload: true });
        try {
          const remoteCart = await cartApi.addItem(
            product.id,
            quantity,
            color_id,
            size_id,
          );

          // Update local state with the real backend data (including real IDs)
          // This is crucial so that subsequent actions (remove/update) use the real ID
          const items = mapApiItemToCartItem(remoteCart.items);
          dispatch({ type: "LOAD_CART", payload: { items } });
        } catch (error) {
          console.error("Failed to add to cart API", error);

          // Rollback optimistic update if failed
          try {
            const remoteCart = await cartApi.getCart();
            if (remoteCart && Array.isArray(remoteCart.items)) {
              const items = mapApiItemToCartItem(remoteCart.items);
              dispatch({ type: "LOAD_CART", payload: { items } });
            }
          } catch (rollbackError) {
            console.error(
              "Resulting to manual rollback failed:",
              rollbackError,
            );
            // Worst case: Reload page or silently fail, but we MUST unset updating
          }
        } finally {
          dispatch({ type: "SET_UPDATING", payload: false });
        }
      }
    },
    [state.isUpdating, isAuthenticated],
  );

  const removeFromCart = useCallback(
    async (productId: number) => {
      if (state.isUpdating) return;

      // Optimistic Update
      dispatch({ type: "REMOVE_FROM_CART", payload: { productId } });

      if (isAuthenticated) {
        dispatch({ type: "SET_UPDATING", payload: true });
        try {
          await cartApi.removeItem(productId);
        } catch (error) {
          console.error("Failed to remove item from API", error);
          // Rollback/Sync on error
          const remoteCart = await cartApi.getCart();
          const items = mapApiItemToCartItem(remoteCart.items);
          dispatch({ type: "LOAD_CART", payload: { items } });
        } finally {
          dispatch({ type: "SET_UPDATING", payload: false });
        }
      }
    },
    [state.isUpdating, isAuthenticated],
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (state.isUpdating) return;

      // Optimistic Update
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });

      if (isAuthenticated) {
        dispatch({ type: "SET_UPDATING", payload: true });
        try {
          await cartApi.updateItem(productId, quantity);
        } catch (error) {
          console.error("Failed to update quantity API", error);
          // Rollback/Sync on error
          try {
            const remoteCart = await cartApi.getCart();
            if (remoteCart && Array.isArray(remoteCart.items)) {
              const items = mapApiItemToCartItem(remoteCart.items);
              dispatch({ type: "LOAD_CART", payload: { items } });
            }
          } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
          }
        } finally {
          dispatch({ type: "SET_UPDATING", payload: false });
        }
      }
    },
    [state.isUpdating, isAuthenticated],
  );

  const clearCart = useCallback(async () => {
    if (state.isUpdating) return;

    dispatch({ type: "CLEAR_CART" });
    if (isAuthenticated) {
      dispatch({ type: "SET_UPDATING", payload: true });
      try {
        await cartApi.clearCart();
      } catch (error) {
        console.error("Failed to clear cart API", error);
      } finally {
        dispatch({ type: "SET_UPDATING", payload: false });
      }
    }
  }, [state.isUpdating, isAuthenticated]);

  const getItemQuantity = useCallback(
    (productId: number, color_id?: number, size_id?: number) => {
      return state.items
        .filter(
          (item) =>
            item.product.id === productId &&
            item.color_id === color_id &&
            item.size_id === size_id,
        )
        .reduce((sum, item) => sum + item.quantity, 0);
    },
    [state.items],
  );

  const totalItems = useMemo(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  }, [state.items]);

  const totalPrice = useMemo(() => {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, [state.items]);

  const value: CartContextType = useMemo(
    () => ({
      items: state.items,
      isOpen: state.isOpen,
      isUpdating: state.isUpdating, // Exposed
      totalItems,
      totalPrice,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemQuantity,
    }),
    [
      state.items,
      state.isOpen,
      state.isUpdating,
      totalItems,
      totalPrice,
      openCart,
      closeCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getItemQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
