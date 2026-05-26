"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Package, TrendingUp, DollarSign, ShoppingBag, Loader2, ChevronLeft, Plus, LogIn, Check, X, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";

function getStatusColor(status: string) {
  switch (status) {
    case "WAITING_PAYMENT": return "text-yellow-400";
    case "PAID": return "text-blue-400";
    case "CONFIRMED": return "text-primary";
    case "SHIPPED": return "text-primary";
    case "DELIVERED": return "text-emerald-400";
    case "CANCELLED": return "text-red-400";
    default: return "text-white/40";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "WAITING_PAYMENT": return "Menunggu Pembayaran";
    case "PAID": return "Sudah Dibayar";
    case "CONFIRMED": return "Dikonfirmasi";
    case "SHIPPED": return "Dikirim";
    case "DELIVERED": return "Selesai";
    case "CANCELLED": return "Dibatalkan";
    default: return status;
  }
}

export default function SellerPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setError("not-authenticated"); setLoading(false); return; }
    if (error === "not-authenticated") return;
    setError(null);

    async function fetchSellerData() {
      try {
        const res = await fetch("/api/seller", {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (res.status === 403) { setError("not-seller"); setLoading(false); return; }
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else setError("Server error");
      } catch (e) { setError("Network error"); }
      setLoading(false);
    }

    async function fetchOrders() {
      try {
        const res = await fetch("/api/seller/orders", {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (res.ok) {
          const result = await res.json();
          setOrders(result || []);
        }
      } catch (e) { /* ignore */ }
      setOrdersLoading(false);
    }

    fetchSellerData();
    fetchOrders();
  }, [user, session, authLoading, router]);

  async function handleRegisterSeller() {
    setRegistering(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ role: "SELLER" }),
      });
      if (!res.ok) throw new Error("Gagal daftar");
      setError(null);
      setLoading(true);
      setData(null);
      const fetchRes = await fetch("/api/seller", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (fetchRes.ok) {
        const result = await fetchRes.json();
        setData(result);
      }
    } catch (e: any) {
      alert(e.message);
    }
    setRegistering(false);
    setLoading(false);
  }

  async function handleOrderAction(orderId: string, action: string) {
    setActionLoading(orderId);
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ orderId, action }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error);
        return;
      }

      const ordersRes = await fetch("/api/seller/orders", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (ordersRes.ok) {
        const result = await ordersRes.json();
        setOrders(result || []);
      }

      const sellerRes = await fetch("/api/seller", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (sellerRes.ok) setData(await sellerRes.json());

    } catch (e: any) {
      alert(e.message);
    }
    setActionLoading(null);
  }

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error === "not-authenticated") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 space-y-5">
          <LogIn className="w-10 h-10 text-primary mx-auto" />
          <h2 className="text-xl font-bold">Login Diperlukan</h2>
          <p className="text-sm text-white/60">Kamu harus masuk akun dulu untuk jadi penjual.</p>
          <Link href="/auth" className="btn-primary inline-block px-6 py-2.5 text-sm">
            Masuk / Daftar
          </Link>
        </div>
      </div>
    );
  }

  if (error === "not-seller") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 space-y-5">
          <Store className="w-10 h-10 text-primary mx-auto" />
          <h2 className="text-xl font-bold">Bukan Penjual</h2>
          <p className="text-sm text-white/60">Akun kamu belum terdaftar sebagai penjual.</p>
          <button onClick={handleRegisterSeller} disabled={registering} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">
            {registering ? "Mendaftarkan..." : "Daftar Jadi Seller"}
          </button>
          <Link href="/" className="text-primary text-sm hover:underline block">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 space-y-5">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary px-6 py-2.5 text-sm">Coba Lagi</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-xs text-white/40 hover:text-white mb-1">
            <ChevronLeft className="w-3 h-3" /> Kembali
          </button>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Store className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Dashboard Penjual
          </h1>
        </div>
        <Link href="/seller/products" className="btn-primary text-xs md:text-sm py-2 px-3 md:px-4 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Tambah Produk
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Produk", value: data?.products?.length || 0, icon: Package },
          { label: "Revenue", value: `Rp${(data?.revenue || 0).toLocaleString("id-ID")}`, icon: DollarSign },
          { label: "Pesanan", value: data?.ordersCount || 0, icon: ShoppingBag },
          { label: "Rating", value: data?.rating || 0, icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-3 md:p-4">
            <s.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mb-2" />
            <p className="text-lg md:text-2xl font-bold">{s.value}</p>
            <p className="text-[10px] md:text-xs text-white/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        <h2 className="text-sm md:text-base font-semibold flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-primary" /> Pesanan Masuk
        </h2>

        {ordersLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-sm text-white/40">Belum ada pesanan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => {
              const paidOrder = order.status === "PAID";
              const confirmable = order.status === "PAID" || order.status === "CONFIRMED";
              const shippable = order.status === "CONFIRMED";

              return (
                <div key={order.id} className="glass rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40 font-mono">#{order.id?.slice(0, 8)}</span>
                    <span className={cn("text-[10px] font-medium", getStatusColor(order.status))}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* Buyer Info */}
                  <div className="bg-surface-lighter rounded-xl p-3 space-y-1 text-xs">
                    <p><span className="text-white/40">Pembeli:</span> {order.buyer?.name || order.buyer_name || "-"}</p>
                    <p><span className="text-white/40">Kontak:</span> {order.buyer_phone || "-"}</p>
                    <p><span className="text-white/40">Alamat:</span> {order.buyer_address || "-"}</p>
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {(order.items || []).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2">
                        {item.product?.images?.[0] && (
                          <img src={item.product.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate">{item.product?.name || "Product"}</p>
                          <p className="text-[10px] text-white/40">{item.quantity}x @ Rp{item.price?.toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs pt-1 border-t border-border">
                    <span className="text-white/40">{new Date(order.created_at).toLocaleDateString("id-ID")}</span>
                    <span className="font-bold text-primary">Rp{order.total?.toLocaleString("id-ID")}</span>
                  </div>

                  {/* Payment Proof */}
                  {order.status === "PAID" && order.payment_proof && (
                    <div className="pt-1 border-t border-border">
                      <a
                        href={order.payment_proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline"
                      >
                        Lihat bukti pembayaran
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1 border-t border-border">
                    {order.status === "PAID" && (
                      <>
                        <button
                          onClick={() => handleOrderAction(order.id, "confirm")}
                          disabled={actionLoading === order.id}
                          className="btn-primary text-[10px] py-1.5 px-3 flex items-center gap-1 disabled:opacity-50"
                        >
                          {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Konfirmasi
                        </button>
                        <button
                          onClick={() => handleOrderAction(order.id, "reject")}
                          disabled={actionLoading === order.id}
                          className="text-[10px] py-1.5 px-3 glass rounded-xl hover:bg-red-500/10 text-red-400 flex items-center gap-1 disabled:opacity-50"
                        >
                          {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                          Tolak
                        </button>
                      </>
                    )}
                    {order.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleOrderAction(order.id, "ship")}
                        disabled={actionLoading === order.id}
                        className="btn-primary text-[10px] py-1.5 px-3 flex items-center gap-1 disabled:opacity-50"
                      >
                        {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                        Kirim
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Produk */}
      <div className="glass rounded-2xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm md:text-base font-semibold">Produk Kamu</h2>
          <Link href="/seller/products" className="text-xs md:text-sm text-primary hover:underline">Kelola</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data?.products?.map((p: any) => (
            <Link
              key={p.id}
              href={`/products/${p.id.replace(/\D/g, "")}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              {p.images?.[0] && (
                <img src={p.images[0]} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium truncate">{p.name}</p>
                <p className="text-[10px] md:text-xs text-white/40">Stok: {p.stock} | Rp{p.price?.toLocaleString("id-ID")}</p>
              </div>
            </Link>
          ))}
          {(!data?.products || data.products.length === 0) && (
            <p className="text-xs md:text-sm text-white/40 col-span-full text-center py-4">Belum ada produk</p>
          )}
        </div>
      </div>
    </div>
  );
}
