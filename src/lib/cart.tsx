"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "./supabase-browser";
import type { Product } from "@/lib/data";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  syncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

async function dbCart(action: string, data?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const token = session.access_token;
  try {
    if (action === "fetch") {
      const res = await fetch("/api/cart", { headers: { Authorization: `Bearer ${token}` } });
      return res.ok ? await res.json() : [];
    }
    if (action === "add") {
      await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
    }
    if (action === "update") {
      await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
    }
    if (action === "remove") {
      await fetch("/api/cart", { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(data) });
    }
  } catch {}
}

function dbItemToProduct(dbItem: any): Product {
  const p = dbItem.product || dbItem;
  return {
    id: Number(p.id.replace(/\D/g, "")) || 0,
    name: p.name,
    description: p.description || "",
    price: p.price,
    image: p.images?.[0] || "",
    images: p.images || [],
    category: p.category || "",
    rating: p.rating || 0,
    sold: 0,
    store: p.store || "",
    location: "Indonesia",
    stock: p.stock || 0,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    async function loadCart() {
      const stored = localStorage.getItem("cart");
      const localItems: CartItem[] = stored ? JSON.parse(stored) : [];

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const dbItems = await dbCart("fetch");

        if (dbItems && dbItems.length > 0) {
          // Merge: local items not yet in DB get added, existing items keep DB qty
          const dbMap = new Map(dbItems.map((i: any) => [i.product_id, i.quantity]));
          for (const local of localItems) {
            const dbId = `p${local.product.id}`;
            const existing = dbMap.get(dbId);
            if (existing === undefined) {
              await dbCart("add", { product_id: dbId, quantity: local.quantity });
              dbMap.set(dbId, local.quantity);
            }
          }
          // Re-fetch merged cart
          const mergedDb = await dbCart("fetch");
          if (mergedDb) {
            const merged: CartItem[] = mergedDb.map((i: any) => ({
              product: dbItemToProduct(i),
              quantity: i.quantity,
            }));
            setItems(merged);
            localStorage.setItem("cart", JSON.stringify(merged));
            setSyncing(false);
            return;
          }
        }

        // DB empty but local has items → sync local to DB
        if (localItems.length > 0) {
          for (const item of localItems) {
            await dbCart("add", { product_id: `p${item.product.id}`, quantity: item.quantity });
          }
          const syncedDb = await dbCart("fetch");
          if (syncedDb) {
            const merged: CartItem[] = syncedDb.map((i: any) => ({
              product: dbItemToProduct(i),
              quantity: i.quantity,
            }));
            setItems(merged);
            localStorage.setItem("cart", JSON.stringify(merged));
            setSyncing(false);
            return;
          }
        }
      }

      // No session or no DB items — use local items
      if (localItems.length > 0) {
        setItems(localItems);
      }
      setSyncing(false);
    }
    loadCart();
  }, []);

  useEffect(() => {
    if (!syncing) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, syncing]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const addItem = useCallback(async (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    await dbCart("add", { product_id: `p${product.id}`, quantity: 1 });
  }, []);

  const removeItem = useCallback(async (productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    await dbCart("remove", { product_id: `p${productId}` });
  }, []);

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      await dbCart("remove", { product_id: `p${productId}` });
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
    await dbCart("update", { product_id: `p${productId}`, quantity });
  }, []);

  const clearCart = useCallback(async () => {
    setItems([]);
    const dbItems = await dbCart("fetch");
    if (Array.isArray(dbItems)) {
      for (const item of dbItems) {
        await dbCart("remove", { product_id: item.product_id });
      }
    }
  }, []);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, syncing }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
