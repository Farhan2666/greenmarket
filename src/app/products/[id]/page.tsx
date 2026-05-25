"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  Package,
  Store,
  MapPin,
  Check,
} from "lucide-react";
import { products } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const product = products.find((p) => p.id === Number(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <p className="text-sm md:text-lg text-white/40">Produk tidak ditemukan</p>
        <Link href="/products" className="btn-primary text-sm inline-block">Lihat Produk Lain</Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/60 hover:text-white mb-3 md:mb-4 transition-colors">
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        Kembali
      </button>

      <div className="grid md:grid-cols-2 gap-5 md:gap-8">
        {/* Images */}
        <div className="space-y-2 md:space-y-3">
          <div className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-surface-lighter">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all",
                    selectedImage === i ? "border-primary" : "border-transparent opacity-60"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4 md:space-y-5">
          <div>
            <p className="text-[10px] md:text-xs text-white/40 mb-0.5 md:mb-1">{product.category}</p>
            <h1 className="text-lg md:text-2xl font-bold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-xs md:text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-[10px] md:text-xs text-white/40">|</span>
              <span className="text-xs md:text-sm text-white/40">Terjual {product.sold}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-3xl font-bold text-primary">Rp{product.price.toLocaleString("id-ID")}</span>
            <span className={cn(
              "text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full",
              product.stock > 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
            )}>
              {product.stock > 0 ? "Stok tersedia" : "Stok habis"}
            </span>
          </div>

          <p className="text-xs md:text-sm text-white/60 leading-relaxed">{product.description}</p>

          {/* Store */}
          <div className="glass rounded-2xl p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs md:text-sm">{product.store}</p>
                <p className="text-[10px] md:text-xs text-white/40 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  {product.location}
                </p>
              </div>
              <button className="text-[10px] md:text-xs text-primary hover:underline shrink-0">Ikuti</button>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-xs md:text-sm text-white/60">Jumlah:</span>
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-surface-light border border-border flex items-center justify-center hover:bg-surface-lighter transition-colors">
                <Minus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <span className="w-6 md:w-8 text-center font-medium text-sm md:text-base">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-surface-light border border-border flex items-center justify-center hover:bg-surface-lighter transition-colors">
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={handleAddToCart}
              className={cn(
                "flex-1 btn-primary flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm",
                addedToCart && "bg-emerald-500"
              )}
            >
              {addedToCart ? <><Check className="w-4 h-4" /> Ditambahkan</> : <><ShoppingCart className="w-4 h-4" /> Keranjang</>}
            </button>
            <button className="btn-outline p-3 md:p-3.5"><Heart className="w-4 h-4 md:w-5 md:h-5" /></button>
            <button className="btn-outline p-3 md:p-3.5"><Share2 className="w-4 h-4 md:w-5 md:h-5" /></button>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { icon: Truck, label: "Gratis Ongkir", sub: "Min Rp50rb" },
              { icon: Shield, label: "Garansi", sub: "30 hari retur" },
              { icon: Package, label: "Pengiriman", sub: "1-3 hari" },
            ].map((badge) => (
              <div key={badge.label} className="glass rounded-xl p-2 md:p-3 text-center">
                <badge.icon className="w-3 h-3 md:w-4 md:h-4 text-primary mx-auto mb-1" />
                <p className="text-[10px] md:text-xs font-medium">{badge.label}</p>
                <p className="text-[8px] md:text-[10px] text-white/40">{badge.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
