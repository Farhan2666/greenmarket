"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ShoppingBag, Loader2, Check, MapPin, Phone, User,
  Banknote, CreditCard, Smartphone, Upload, X, Image as ImageIcon, ArrowRight
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase-browser";

const PAYMENT_METHODS = [
  { id: "bca",    label: "Transfer BCA",     icon: Banknote },
  { id: "mandiri", label: "Transfer Mandiri", icon: Banknote },
  { id: "bri",    label: "Transfer BRI",      icon: Banknote },
  { id: "gopay",  label: "GoPay",             icon: Smartphone },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { session } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pos: "" });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [orderResult, setOrderResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!paymentMethod) {
      setError("Pilih metode pembayaran");
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
          payment_method: paymentMethod,
          shipping_address: address,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      clearCart();
      setOrderResult(data);
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderResult) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Hanya file JPEG, JPG, dan PNG yang diizinkan!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    setUploading(true);
    try {
      const path = `payment-proofs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        if (uploadError.message.includes("bucket")) {
          throw new Error("Bucket 'payment-proofs' belum dibuat. Hubungi admin.");
        }
        throw new Error("Gagal upload: " + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(path);

      const res = await fetch("/api/orders/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ orderId: orderResult.orderId, paymentProof: publicUrlData.publicUrl }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error);
      }

      setOrderResult({ ...orderResult, proofUploaded: true });
    } catch (err: any) {
      alert(err.message);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (done) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="text-center space-y-4 py-8">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" />
          </div>
          <h2 className="text-lg md:text-xl font-bold">Pesanan Berhasil Dibuat!</h2>
          <p className="text-xs md:text-sm text-white/40">Silakan lakukan pembayaran untuk memproses pesanan</p>
        </div>

        {/* Payment Info */}
        {orderResult?.payment_info && (
          <div className="glass rounded-2xl p-4 md:p-5 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Pembayaran
            </h3>
            <div className="bg-surface-lighter rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Bank</span>
                <span className="font-medium">{orderResult.payment_info.bank}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">No. Rekening</span>
                <span className="font-mono font-bold text-sm">{orderResult.payment_info.number}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Atas Nama</span>
                <span className="font-medium">{orderResult.payment_info.name}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Total</span>
                <span className="font-bold text-primary">Rp{orderResult.total?.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Upload Payment Proof */}
        <div className="glass rounded-2xl p-4 md:p-5 space-y-3">
          <h3 className="text-sm font-semibold">Upload Bukti Pembayaran</h3>
          {orderResult?.proofUploaded ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              Bukti pembayaran sudah diupload. Kami akan memproses pesanan setelah pembayaran dikonfirmasi.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-white/40">
                Transfer sesuai total ke rekening di atas, lalu upload bukti transfer di sini.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleUploadProof}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? "Mengupload..." : "Upload Bukti Pembayaran"}
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Link href="/profile" className="btn-primary flex-1 py-3 text-sm text-center">
            Lihat Pesanan
          </Link>
          <Link href="/products" className="flex-1 py-3 text-sm text-center glass rounded-xl hover:bg-white/5 transition-colors">
            Belanja Lagi
          </Link>
        </div>
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

      <form onSubmit={handleCheckout} className="space-y-5">
        {/* Address Form */}
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

        {/* Payment Method */}
        <div className="glass rounded-2xl p-4 md:p-5 space-y-3">
          <h2 className="text-sm md:text-base font-semibold flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Metode Pembayaran
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs md:text-sm transition-all ${
                  paymentMethod === pm.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-lighter text-white/60 hover:border-white/20"
                }`}
              >
                <pm.icon className="w-4 h-4 shrink-0" />
                {pm.label}
              </button>
            ))}
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
          Buat Pesanan — Rp{totalPrice.toLocaleString("id-ID")}
        </button>
      </form>
    </div>
  );
}
