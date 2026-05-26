"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Package, LogOut, ChevronRight, Mail, Calendar,
  ShoppingBag, Loader2, Shield, Clock, ArrowRight, Store,
  Upload, Check, X, AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-browser";

interface ProfileData {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

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
    case "PAID": return "Dibayar";
    case "CONFIRMED": return "Dikonfirmasi";
    case "SHIPPED": return "Dikirim";
    case "DELIVERED": return "Selesai";
    case "CANCELLED": return "Dibatalkan";
    default: return status;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth"); return; }

    async function fetchProfile() {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || "");
      }

      const ordersRes = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (ordersRes.ok) setOrders(await ordersRes.json());
      setOrdersLoading(false);
      setLoading(false);
    }
    fetchProfile();
  }, [user, session, authLoading, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleUploadProof = async (orderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) { alert("Hanya file JPEG, JPG, dan PNG"); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Maks 2MB"); return; }

    setUploadingOrderId(orderId);
    try {
      const path = `payment-proofs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw new Error("Gagal upload: " + uploadError.message);

      const { data: publicUrlData } = supabase.storage.from("payment-proofs").getPublicUrl(path);

      const res = await fetch("/api/orders/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ orderId, paymentProof: publicUrlData.publicUrl }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }

      const ordersRes = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (err: any) {
      alert(err.message);
    }
    setUploadingOrderId(null);
    if (fileInputRefs.current[orderId]) fileInputRefs.current[orderId]!.value = "";
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <h1 className="text-lg md:text-2xl font-bold">Profil Saya</h1>

      {/* Profile Card */}
      <div className="glass rounded-2xl p-4 md:p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <User className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-sm md:text-base flex-1"
                  autoFocus
                />
                <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-3">
                  {saving ? "..." : "Simpan"}
                </button>
                <button onClick={() => setEditing(false)} className="text-xs text-white/40 hover:text-white px-2">
                  Batal
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-sm md:text-lg truncate">{profile?.name || "User"}</h2>
                <p className="text-[10px] md:text-xs text-white/40 flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  {profile?.email}
                </p>
              </>
            )}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-[10px] md:text-xs text-primary hover:underline shrink-0">
              Edit
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 md:gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-white/40">
            <Calendar className="w-3 h-3" />
            Bergabung {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("id-ID") : "-"}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] md:text-xs">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-primary font-medium">{profile?.role || "BUYER"}</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <Link href="/cart" className="glass rounded-xl p-3 md:p-4 flex items-center justify-between glass-hover">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <span className="text-xs md:text-sm">Keranjang Belanja</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
        </Link>
        {profile?.role === "SELLER" && (
          <Link href="/seller" className="glass rounded-xl p-3 md:p-4 flex items-center justify-between glass-hover">
            <div className="flex items-center gap-2 md:gap-3">
              <Store className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <span className="text-sm md:text-base text-white font-medium">Dashboard Penjual</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
          </Link>
        )}
        {profile?.role === "ADMIN" && (
          <Link href="/admin" className="glass rounded-xl p-3 md:p-4 flex items-center justify-between glass-hover border border-primary/30">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">Panel Admin</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          </Link>
        )}
        <button onClick={signOut} className="glass rounded-xl p-3 md:p-4 flex items-center justify-between w-full glass-hover text-red-400">
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Keluar</span>
          </div>
        </button>
      </div>

      {/* Order History */}
      <div className="space-y-3">
        <h2 className="text-sm md:text-base font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Riwayat Pesanan
        </h2>

        {ordersLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-xs md:text-sm text-white/40">Belum ada pesanan</p>
            <Link href="/products" className="text-xs text-primary hover:underline mt-1 inline-block">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order: any) => (
              <div key={order.id} className="glass rounded-2xl p-3 md:p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-white/40 font-mono">#{order.id.slice(0, 8)}</span>
                  <span className={cn("text-[10px] md:text-xs font-medium", getStatusColor(order.status))}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
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
                <div className="flex justify-between text-xs pt-1 border-t border-border items-center">
                  <span className="text-white/40">{new Date(order.created_at).toLocaleDateString("id-ID")}</span>
                  <span className="font-bold text-primary">Rp{order.total?.toLocaleString("id-ID")}</span>
                </div>

                {/* Upload Payment Proof Button */}
                {order.status === "WAITING_PAYMENT" && (
                  <div className="pt-1 border-t border-border">
                    {order.payment_proof ? (
                      <div className="flex items-center gap-2 text-[10px] text-yellow-400">
                        <AlertCircle className="w-3 h-3" />
                        Menunggu konfirmasi penjual
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          ref={(el) => { fileInputRefs.current[order.id] = el; }}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={(e) => handleUploadProof(order.id, e)}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRefs.current[order.id]?.click()}
                          disabled={uploadingOrderId === order.id}
                          className="btn-primary text-[10px] py-1.5 px-3 flex items-center gap-1 disabled:opacity-50"
                        >
                          {uploadingOrderId === order.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          Upload Bukti Bayar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment proof link for PAID orders */}
                {order.status === "PAID" && order.payment_proof && (
                  <div className="pt-1 border-t border-border">
                    <a
                      href={order.payment_proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Lihat bukti pembayaran
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
