"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Camera,
  Package,
  Store,
  Sparkles,
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Elektronik", icon: "📱" },
  { name: "Fashion", icon: "👕" },
  { name: "Sepatu", icon: "👟" },
  { name: "Aksesoris", icon: "⌚" },
  { name: "Rumah", icon: "🏠" },
  { name: "Olahraga", icon: "⚽" },
];

const featuredProducts = [
  {
    id: 1,
    name: "Wireless Headphone Pro",
    price: 299000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    store: "TechStore Official",
  },
  {
    id: 2,
    name: "Smart Watch Ultra",
    price: 549000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    store: "GadgetZone",
  },
  {
    id: 3,
    name: "Sneakers Air Max",
    price: 450000,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    store: "Sportify",
  },
  {
    id: 4,
    name: "Premium Backpack",
    price: 189000,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    store: "UrbanGear",
  },
];

export default function HomePage() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-12 relative">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-primary animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Belanja Lebih Cerdas dengan AI
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              Temukan Produk
              <span className="text-primary"> Impianmu</span>
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Cari barang cukup dengan foto. AI kami akan menemukan produk
              serupa dalam hitungan detik.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div
                className={cn(
                  "flex items-center gap-2 glass rounded-2xl px-5 py-3.5 transition-all duration-300",
                  searchFocused && "ring-2 ring-primary/50"
                )}
              >
                <Search className="w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Cari produk, brand, atau kategori..."
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors group">
                  <Camera className="w-5 h-5 text-primary group-hover:text-primary-light transition-colors" />
                </button>
              </div>
              {/* Trending Searches */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-4 animate-slide-up">
                  <p className="text-xs text-white/40 mb-3 font-medium">
                    TRENDING
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Wireless Headphone",
                      "Sepatu Running",
                      "Smartwatch",
                      "Tas Ransel",
                    ].map((item) => (
                      <button
                        key={item}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-all"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-6">Kategori</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center gap-2 min-w-[90px] p-4 glass rounded-2xl glass-hover group"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs text-white/60 group-hover:text-white transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Produk Terpopuler</h2>
          <button className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="card overflow-hidden group"
            >
              <div className="aspect-square overflow-hidden rounded-t-2xl bg-surface-lighter">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-xs text-white/40 truncate">{product.store}</p>
                <h3 className="font-medium text-sm truncate">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-primary">
                    Rp{product.price.toLocaleString("id-ID")}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs text-white/60">{product.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, label: "Gratis Ongkir", desc: "Min. beli Rp50rb" },
            { icon: Shield, label: "Garansi 100%", desc: "Pengembalian mudah" },
            { icon: TrendingUp, label: "Harga Terbaik", desc: "Cocokkan harga" },
            { icon: Package, label: "AI Search", desc: "Cari pakai foto" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-4 text-center">
              <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-medium text-sm">{item.label}</p>
              <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Seller */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
          <div className="relative">
            <Store className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Jadi Penjual di GreenMarket
            </h2>
            <p className="text-white/60 mb-6 max-w-lg mx-auto">
              Raih jutaan pembeli potensial. Dashboard penjual modern dengan
              analitik real-time.
            </p>
            <button className="btn-primary">Buka Toko Gratis</button>
          </div>
        </div>
      </section>
    </div>
  );
}
