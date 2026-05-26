"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingBag, Loader2, Check, MapPin, Phone, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const { session } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pos: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0 && !done) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <ShoppingBag className="w-12 h-12 text-white/20 mx-auto" />
        <h2 className="text-lg font-bold">Tidak ada barang</h2>
        <Link href="/cart" className="btn-primary text-sm inline-block">Kembali ke Keranjang</Link>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { router.push("/auth"); return; }
    if (!address.name || !address.phone || !address.street || !address.city) {
      setError("Lengkapi alamat pengiriman");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      clearCart();
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" />
        </div>
        <h2 className="text-lg md:text-xl font-bold">Pesanan Berhasil!</h2>
        <p className="text-xs md:text-sm text-white/40">Pesanan kamu sedang diproses</p>
        <Link href="/profile" className="btn-primary text-sm inline-block">Lihat Pesanan</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-2xl font-bold">Checkout</h1>
        <Link href="/cart" className="text-xs md:text-sm text-primary flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" /> Kembali
        </Link>
      </div>

      {/* Address Form */}
      <form onSubmit={handleCheckout} className="space-y-5">
        <div className="glass rounded-2xl p-4 md:p-5 space-y-3">
          <h2 className="text-sm md:text-base font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Alamat Pengiriman
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Nama Penerima</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input type="text" placeholder="Nama" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="input-field pl-10 text-sm w-full" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">No. HP</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                <input type="tel" placeholder="08123456789" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="input-field pl-10 text-sm w-full" required />
              </div>
            </div>
          </div>
          <textarea placeholder="Alamat lengkap (jalan, gang, no. rumah)" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="input-field w-full text-sm resize-none h-20" required />
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Kota</label>
              <input type="text" placeholder="Kota" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-field text-sm w-full" required />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Kode Pos</label>
              <input type="text" placeholder="Kode pos" value={address.pos} onChange={(e) => setAddress({ ...address, pos: e.target.value })} className="input-field text-sm w-full" />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="glass rounded-2xl p-4 md:p-5 space-y-3">
          <h2 className="text-sm md:text-base font-semibold">Ringkasan Pesanan</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-lighter overflow-hidden shrink-0">
                  <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{item.product.name}</p>
                  <p className="text-[10px] text-white/40">{item.quantity}x</p>
                </div>
                <p className="text-xs font-medium">Rp{(item.product.price * item.quantity).toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
          <hr className="border-border" />
          <div className="flex justify-between font-bold text-sm">
            <span>Total</span>
            <span className="text-primary">Rp{totalPrice.toLocaleString("id-ID")}</span>
          </div>
          <div className="text-[10px] text-emerald-400">✨ Gratis ongkir</div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-2 rounded-xl">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Bayar Rp{totalPrice.toLocaleString("id-ID")}
        </button>
      </form>
    </div>
  );
}
