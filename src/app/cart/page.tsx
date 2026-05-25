"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { items, totalPrice, totalItems, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingCart className="w-16 h-16 text-white/20 mx-auto" />
        <h2 className="text-xl font-bold">Keranjang Kosong</h2>
        <p className="text-white/40">Belum ada produk di keranjang</p>
        <Link href="/products" className="btn-primary inline-block">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Keranjang ({totalItems})</h1>
        <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Lanjut Belanja
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="card p-4 flex gap-4">
              <Link href={`/products/${item.product.id}`} className="w-24 h-24 rounded-xl overflow-hidden bg-surface-lighter shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.id}`} className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">
                  {item.product.name}
                </Link>
                <p className="text-xs text-white/40 mt-0.5">{item.product.store}</p>
                <p className="text-primary font-bold mt-1">
                  Rp{(item.product.price * item.quantity).toLocaleString("id-ID")}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-surface-light border border-border flex items-center justify-center hover:bg-surface-lighter"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-surface-light border border-border flex items-center justify-center hover:bg-surface-lighter"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass rounded-2xl p-6 h-fit space-y-4 sticky top-24">
          <h3 className="font-semibold">Ringkasan Belanja</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Total Barang</span>
              <span>{totalItems} item</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Ongkos Kirim</span>
              <span className="text-emerald-400">Gratis</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">Rp{totalPrice.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            Checkout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
