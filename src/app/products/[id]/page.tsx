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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-white/40 text-lg">Produk tidak ditemukan</p>
        <Link href="/products" className="btn-primary mt-4 inline-block">
          Lihat Produk Lain
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Kembali
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl overflow-hidden bg-surface-lighter">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                    selectedImage === i
                      ? "border-primary"
                      : "border-transparent opacity-60"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-white/40 mb-1">{product.category}</p>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-sm text-white/40">|</span>
              <span className="text-sm text-white/40">
                Terjual {product.sold}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">
              Rp{product.price.toLocaleString("id-ID")}
            </span>
            {product.stock > 0 ? (
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Stok tersedia
              </span>
            ) : (
              <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                Stok habis
              </span>
            )}
          </div>

          <p className="text-white/60 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Store Info */}
          <div className="glass rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{product.store}</p>
                  <p className="text-xs text-white/40 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {product.location}
                  </p>
                </div>
              </div>
              <button className="text-xs text-primary hover:underline">Ikuti</button>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">Jumlah:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-surface-light border border-border flex items-center justify-center hover:bg-surface-lighter transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-8 h-8 rounded-lg bg-surface-light border border-border flex items-center justify-center hover:bg-surface-lighter transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className={cn(
                "flex-1 btn-primary flex items-center justify-center gap-2",
                addedToCart && "bg-emerald-500"
              )}
            >
              {addedToCart ? (
                <>
                  <Check className="w-5 h-5" /> Ditambahkan
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" /> Keranjang
                </>
              )}
            </button>
            <button className="btn-outline">
              <Heart className="w-5 h-5" />
            </button>
            <button className="btn-outline">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Gratis Ongkir", sub: "Min Rp50rb" },
              { icon: Shield, label: "Garansi", sub: "30 hari retur" },
              { icon: Package, label: "Pengiriman", sub: "1-3 hari kerja" },
            ].map((badge) => (
              <div key={badge.label} className="glass rounded-xl p-3 text-center">
                <badge.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs font-medium">{badge.label}</p>
                <p className="text-[10px] text-white/40">{badge.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
