"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Camera,
  Package,
  Store,
  Sparkles,
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
  Truck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { products as fallbackProducts, categories } from "@/lib/data";
import type { Product } from "@/lib/data";

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const trending = ["Wireless Headphone", "Sepatu Running", "Smartwatch", "Tas Ransel"];

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setFeaturedProducts((data as Product[]).slice(0, 4));
        } else {
          setFeaturedProducts(fallbackProducts.slice(0, 4));
        }
      } catch {
        setFeaturedProducts(fallbackProducts.slice(0, 4));
      } finally {
        setFeaturedLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="space-y-12 md:space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-16 pb-10 md:pb-12 relative">
          <div className="text-center space-y-5 md:space-y-6 max-w-3xl mx-auto">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 glass rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm text-primary animate-fade-in"
            >
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              Belanja Lebih Cerdas dengan AI
            </Link>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-balance leading-tight">
              Temukan Produk
              <span className="text-primary"> Impianmu</span>
            </h1>
            <p className="text-sm md:text-lg text-white/60 max-w-xl mx-auto px-2">
              Cari barang cukup dengan foto. AI kami akan menemukan produk
              serupa dalam hitungan detik.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto px-2 md:px-0">
              <div
                className={cn(
                  "flex items-center gap-2 glass rounded-2xl px-4 md:px-5 py-3 md:py-3.5 transition-all duration-300",
                  searchFocused && "ring-2 ring-primary/50"
                )}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5 text-white/40 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari produk, brand, atau kategori..."
                  className="flex-1 bg-transparent text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none min-w-0"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
                <Link
                  href="/products"
                  className="p-1.5 md:p-2 hover:bg-white/10 rounded-xl transition-colors group shrink-0"
                >
                  <Camera className="w-4 h-4 md:w-5 md:h-5 text-primary group-hover:text-primary-light transition-colors" />
                </Link>
              </div>
              {searchFocused && (
                <div className="absolute top-full left-2 right-2 md:left-0 md:right-0 mt-2 glass rounded-2xl p-4 animate-slide-up z-10">
                  <p className="text-xs text-white/40 mb-3 font-medium">TRENDING</p>
                  <div className="flex flex-wrap gap-2">
                    {trending.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setSearch(item);
                          router.push(`/products?q=${encodeURIComponent(item)}`);
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs md:text-sm text-white/60 hover:text-white transition-all"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold">Kategori</h2>
          <Link href="/products" className="text-xs md:text-sm text-primary flex items-center gap-1">
            Lihat Semua <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 glass rounded-2xl glass-hover group"
            >
              <span className="text-xl md:text-2xl">{cat.icon}</span>
              <span className="text-[10px] md:text-xs text-white/60 group-hover:text-white transition-colors text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold">Produk Terpopuler</h2>
          <Link
            href="/products"
            className="text-xs md:text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all"
          >
            Lihat Semua <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {featuredLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="card overflow-hidden group"
            >
              <div className="aspect-square overflow-hidden rounded-t-2xl bg-surface-lighter">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-2 md:p-3 space-y-1 md:space-y-1.5">
                <p className="text-[10px] md:text-xs text-white/40 truncate">{product.store}</p>
                <h3 className="font-medium text-xs md:text-sm truncate leading-tight">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-primary text-xs md:text-sm">
                    Rp{product.price.toLocaleString("id-ID")}
                  </p>
                  <div className="flex items-center gap-0.5 md:gap-1">
                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-[10px] md:text-xs text-white/60">{product.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: Truck, label: "Gratis Ongkir", desc: "Min. beli Rp50rb" },
            { icon: Shield, label: "Garansi 100%", desc: "Pengembalian mudah" },
            { icon: TrendingUp, label: "Harga Terbaik", desc: "Cocokkan harga" },
            { icon: Package, label: "AI Search", desc: "Cari pakai foto" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-3 md:p-4 text-center">
              <item.icon className="w-5 h-5 md:w-6 md:h-6 text-primary mx-auto mb-1.5 md:mb-2" />
              <p className="font-medium text-xs md:text-sm">{item.label}</p>
              <p className="text-[10px] md:text-xs text-white/40 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Seller */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass rounded-2xl md:rounded-3xl p-6 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
          <div className="relative">
            <Store className="w-8 h-8 md:w-12 md:h-12 text-primary mx-auto mb-3 md:mb-4" />
            <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-3">
              Jadi Penjual di GreenMarket
            </h2>
            <p className="text-xs md:text-base text-white/60 mb-4 md:mb-6 max-w-lg mx-auto">
              Raih jutaan pembeli potensial. Dashboard penjual modern dengan
              analitik real-time.
            </p>
            <Link href="/seller" className="btn-primary text-sm md:text-base inline-block">
              Buka Toko Gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
