import React, { useState, useEffect } from "react";
import { CartContext } from "./cartContextValue";

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Failed to parse cart from localStorage", err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to write cart to localStorage", err);
    }
  }, [cart]);

  const addToCart = (item) => {
    // default behavior: merge items with same id. To add exact duplicates as separate
    // lines (same book/combo multiple identical entries), callers can pass
    // `item._addOptions = { merge: false }` or set `item.merge === false`.
    setCart((prev) => {
      const availableStock = Number(item?.stock ?? Infinity);
      const requestedQty = Math.max(1, Number(item?.quantity || 1));

      // Prevent adding when stock is 0 or not available
      if (Number.isFinite(availableStock) && availableStock <= 0) {
        try {
          alert("❌ Item is out of stock and cannot be added to cart");
        } catch (_) {}
        return prev;
      }

      const merge = item?.merge !== undefined ? Boolean(item.merge) : true;
      // generate a per-line unique id so duplicates can be stored separately
      const cartItemId =
        item.cartItemId ||
        `${String(
          item._id || item.id || item.key || Math.random()
        )}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const baseKey = String(item._id || item.id || item.key || "");

      if (!merge || !baseKey) {
        // push as a distinct line but cap by available stock if finite
        if (Number.isFinite(availableStock) && requestedQty > availableStock) {
          try {
            alert(`Only ${availableStock} item(s) available in stock`);
          } catch (_) {}
          return prev;
        }
        return [...prev, { ...item, cartItemId, quantity: requestedQty }];
      }

      // merge behavior: if an existing item with same base id exists, increase quantity
      const found = prev.find(
        (p) => String(p._id || p.id || p.key) === baseKey
      );
      if (found) {
        const newQty = (found.quantity || 1) + requestedQty;
        if (Number.isFinite(availableStock) && newQty > availableStock) {
          try {
            alert(`Only ${availableStock} item(s) available in stock`);
          } catch (_) {}
          return prev;
        }
        return prev.map((p) =>
          String(p._id || p.id || p.key) === baseKey
            ? { ...p, quantity: newQty }
            : p
        );
      }

      // first time add, cap by available stock if finite
      if (Number.isFinite(availableStock) && requestedQty > availableStock) {
        try {
          alert(`Only ${availableStock} item(s) available in stock`);
        } catch (_) {}
        return prev;
      }
      return [...prev, { ...item, cartItemId, quantity: requestedQty }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((p) =>
        // allow updating by cartItemId first, else by base id
        (p.cartItemId && String(p.cartItemId) === String(id)) ||
        String(p._id || p.id || p.key) === String(id)
          ? { ...p, quantity }
          : p
      )
    );
  };

  const removeItem = (id) => {
    setCart((prev) =>
      prev.filter((p) =>
        // allow removing by cartItemId first, else by base id
        p.cartItemId && String(p.cartItemId) === String(id)
          ? false
          : String(p._id || p.id || p.key) !== String(id)
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
