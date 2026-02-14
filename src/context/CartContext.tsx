"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { CartItem, Product, Order } from "@/types";
import { generateOrderId } from "@/lib/utils";

// ── State ────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  orders: Order[];
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "PLACE_ORDER"; order: Order };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product.id !== action.productId),
      };
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product.id !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "PLACE_ORDER":
      return {
        ...state,
        items: [],
        orders: [action.order, ...state.orders],
      };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  orders: Order[];
  totalItems: number;
  totalAmount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: () => Order;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    orders: [],
  });

  // Persist orders to localStorage whenever they change
  React.useEffect(() => {
    if (state.orders.length > 0) {
      localStorage.setItem("cart_orders", JSON.stringify(state.orders));
    }
  }, [state.orders]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = state.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const addItem = useCallback(
    (product: Product) => dispatch({ type: "ADD_ITEM", product }),
    []
  );
  const removeItem = useCallback(
    (productId: string) => dispatch({ type: "REMOVE_ITEM", productId }),
    []
  );
  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

  const placeOrder = useCallback((): Order => {
    const order: Order = {
      id: generateOrderId(),
      items: [...state.items],
      totalAmount,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "PLACE_ORDER", order });
    return order;
  }, [state.items, totalAmount]);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        orders: state.orders,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
