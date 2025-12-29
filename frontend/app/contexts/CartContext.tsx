"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "@/app/types";
import { useAuth } from "@/app/hooks/useAuth";
import { cartApi } from "@/app/lib/api/cart";
import { mapProducts } from "@/app/lib/api/client";

// Define cart item type
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  // Store price at time of adding to cart
  price: number;
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
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
}

// Define action types for the reducer
type CartAction =
  | { type: "ADD_TO_CART"; payload: { product: Product; quantity?: number } }
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

      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        (item) => item.product.id === product.id,
      );

      // Trust the product.price as the final selling price
      const effectivePrice = Number(product.price);

      // STOCK VALIDATION
      const stock = product.stock;

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

        const newItem: CartItem = {
          id: product.id,
          product,
          quantity: validQuantity,
          price: effectivePrice,
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
            // Cap at stock
            const validQuantity = Math.min(quantity, item.product.stock);
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
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart);
              if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                // Sync each item to backend
                for (const item of parsedCart) {
                  await cartApi.addItem(item.product.id, item.quantity);
                }
                // Clear local cart after successful sync
                localStorage.removeItem("cart");

                // If we synced, we MUST fetch to get the correct state/IDs
                const remoteCart = await cartApi.getCart();
                const items: CartItem[] = remoteCart.items.map(item => {
                  const mappedProduct = mapProducts([item.product])[0];
                  return {
                    id: item.id,
                    product: mappedProduct,
                    quantity: item.quantity,
                    price: Number(mappedProduct.price)
                  };
                });
                dispatch({ type: "LOAD_CART", payload: { items } });
              }
            } catch (error) {
              console.error("Error syncing local cart to API:", error);
            }
          }

          // ALWAYS fetch remote cart on mount to ensure badge and data are correct
          const remoteCart = await cartApi.getCart();
          const items: CartItem[] = remoteCart.items.map(item => {
            const mappedProduct = mapProducts([item.product])[0];
            return {
              id: item.id,
              product: mappedProduct,
              quantity: item.quantity,
              price: Number(mappedProduct.price)
            };
          });
          dispatch({ type: "LOAD_CART", payload: { items } });
        } catch (error) {
          console.error("Failed to load cart from API:", error);
        }
      } else {
        // ... (Anonymous logic remains same)
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            if (Array.isArray(parsedCart)) {
              dispatch({ type: "LOAD_CART", payload: { items: parsedCart } });
            }
          } catch (error) {
            console.error("Error loading cart from localStorage:", error);
          }
        }
      }
    };
    loadCart();
  }, [isAuthenticated]);

  // Sync to localStorage (anonymous) or API (authenticated)

  // Save to localStorage ONLY if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items, isAuthenticated]);

  // Calculate derived values
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Define actions with API side-effects
  const openCart = async () => {
    dispatch({ type: "OPEN_CART" });
    // Lazy load: Fetch when opened to ensure fresh data
    if (isAuthenticated) {
      dispatch({ type: "SET_UPDATING", payload: true });
      try {
        const remoteCart = await cartApi.getCart();
        const items: CartItem[] = remoteCart.items.map(item => {
          const mappedProduct = mapProducts([item.product])[0];
          return {
            id: item.id,
            product: mappedProduct,
            quantity: item.quantity,
            price: Number(mappedProduct.price)
          };
        });
        dispatch({ type: "LOAD_CART", payload: { items } });
      } catch (error) {
        console.error("Failed to fetch cart on open", error);
      } finally {
        dispatch({ type: "SET_UPDATING", payload: false });
      }
    }
  };
  const closeCart = () => dispatch({ type: "CLOSE_CART" });

  const addToCart = async (product: Product, quantity = 1) => {
    // Prevent multiple actions while syncing
    if (state.isUpdating) return;

    // Optimistic update
    const optimisticProduct = product;
    dispatch({ type: "ADD_TO_CART", payload: { product: optimisticProduct, quantity } });

    // Open cart WITHOUT fetching (avoid racing with the add operation)
    dispatch({ type: "OPEN_CART" });

    if (isAuthenticated) {
      dispatch({ type: "SET_UPDATING", payload: true });
      try {
        await cartApi.addItem(product.id, quantity);
        // We DO NOT reload the cart here. 
        // Reloading causes race conditions where a previous slow request's response 
        // overwrites a subsequent fast user action.
        // The optimistic update is sufficient for 99% of cases.
      } catch (error) {
        console.error("Failed to add to cart API", error);
        // Rollback optimistic update if failed
        // For simple rollback, we could fetch the true state or decrement
        // But for now, just reloading the consistent state is safer on error
        const remoteCart = await cartApi.getCart();
        const items: CartItem[] = remoteCart.items.map(item => {
          const mappedProduct = mapProducts([item.product])[0];
          return {
            id: item.id,
            product: mappedProduct,
            quantity: item.quantity,
            price: Number(mappedProduct.price)
          };
        });
        dispatch({ type: "LOAD_CART", payload: { items } });
      } finally {
        dispatch({ type: "SET_UPDATING", payload: false });
      }
    }
  };

  const removeFromCart = async (productId: number) => {
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
        const items: CartItem[] = remoteCart.items.map(item => {
          const mappedProduct = mapProducts([item.product])[0];
          return {
            id: item.id,
            product: mappedProduct,
            quantity: item.quantity,
            price: Number(mappedProduct.price)
          };
        });
        dispatch({ type: "LOAD_CART", payload: { items } });
      } finally {
        dispatch({ type: "SET_UPDATING", payload: false });
      }
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
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
        const remoteCart = await cartApi.getCart();
        const items: CartItem[] = remoteCart.items.map(item => {
          const mappedProduct = mapProducts([item.product])[0];
          return {
            id: item.id,
            product: mappedProduct,
            quantity: item.quantity,
            price: Number(mappedProduct.price)
          };
        });
        dispatch({ type: "LOAD_CART", payload: { items } });
      } finally {
        dispatch({ type: "SET_UPDATING", payload: false });
      }
    }
  };

  const clearCart = async () => {
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
  };

  const getItemQuantity = (productId: number) => {
    // Look up item by product ID
    const item = state.items.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
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
  };

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
