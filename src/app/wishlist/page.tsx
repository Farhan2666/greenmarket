"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Loader2, ChevronLeft, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function WishlistPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth"); return; }

    async function fetchWishlist() {
      try {
        const res = await fetch("/api/wishlist", { headers: { Authorization: `Bearer ${session?.access_token}` } });
        if (res.ok) setItems(await res.json());
      } catch {}
      setLoading(false);
    }
    fetchWishlist();
  }, [user, session, authLoading, router]);

  const removeItem = async (productId: string) => {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ product_id: productId }),
    });
    setItems((prev) => prev.filter((i) => i.product?.id !== productId));
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2">
          <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          Favorit ({items.length})
        </h1>
        <Link href="/products" className="text-xs md:text-sm text-primary flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" /> Kembali
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Heart className="w-12 h-12 text-white/20 mx-auto" />
          <p className="text-sm text-white/40">Belum ada produk favorit</p>
          <Link href="/products" className="btn-primary text-sm inline-block">Jelajahi Produk</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((w: any) => {
            const p = w.product;
            if (!p) return null;
            return (
              <div key={w.id} className="card overflow-hidden group relative">
                <Link href={`/products/${p.id}`}>
                  <div className="aspect-square overflow-hidden rounded-t-2xl bg-surface-lighter">
                    <img src={p.images?.[0] || ""} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-2 md:p-3 space-y-1">
                    <h3 className="font-medium text-xs truncate">{p.name}</h3>
                    <p className="font-bold text-primary text-xs">Rp{p.price?.toLocaleString("id-ID")}</p>
                  </div>
                </Link>
                <button
                  onClick={() => removeItem(p.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-red-500/80 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
