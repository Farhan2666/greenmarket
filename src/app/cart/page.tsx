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
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center space-y-3 md:space-y-4">
        <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 text-white/20 mx-auto" />
        <h2 className="text-lg md:text-xl font-bold">Keranjang Kosong</h2>
        <p className="text-xs md:text-sm text-white/40">Belum ada produk di keranjang</p>
        <Link href="/products" className="btn-primary text-sm inline-block">Mulai Belanja</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold">Keranjang ({totalItems})</h1>
        <Link href="/products" className="text-xs md:text-sm text-primary hover:underline flex items-center gap-1">
          <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" /> Lanjut Belanja
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="card p-3 md:p-4 flex gap-3 md:gap-4">
              <Link href={`/products/${item.product.id}`} className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-surface-lighter shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.id}`} className="font-medium text-xs md:text-sm hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {item.product.name}
                </Link>
                <p className="text-[10px] md:text-xs text-white/40 mt-0.5">{item.product.store}</p>
                <p className="text-primary font-bold text-xs md:text-sm mt-1">
                  Rp{(item.product.price * item.quantity).toLocaleString("id-ID")}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-surface-light border border-border flex items-center justify-center hover:bg-surface-lighter">
                      <Minus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </button>
                    <span className="w-5 md:w-6 text-center text-xs md:text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-surface-light border border-border flex items-center justify-center hover:bg-surface-lighter">
                      <Plus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-300 p-1">
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass rounded-2xl p-4 md:p-6 h-fit space-y-3 md:space-y-4 sticky top-20 md:top-24">
          <h3 className="font-semibold text-sm md:text-base">Ringkasan Belanja</h3>
          <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
            <div className="flex justify-between text-white/60">
              <span>Total Barang</span>
              <span>{totalItems} item</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Ongkos Kirim</span>
              <span className="text-emerald-400">Gratis</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-bold text-sm md:text-lg">
              <span>Total</span>
              <span className="text-primary">Rp{totalPrice.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 text-xs md:text-sm py-2.5 md:py-3">
            Checkout <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
