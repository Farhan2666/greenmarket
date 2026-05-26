"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { products as fallbackProducts, categories } from "@/lib/data";
import type { Product } from "@/lib/data";

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlQ);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(urlCategory || null);
  const [sortBy, setSortBy] = useState<string>("terbaru");
  const [showFilters, setShowFilters] = useState(urlQ || urlCategory ? true : false);

  useEffect(() => {
    setSearch(urlQ);
    setSelectedCategory(urlCategory || null);
  }, [urlQ, urlCategory]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (urlQ) params.set("q", urlQ);
        const res = await fetch(`/api/products?${params}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data as Product[]);
        } else {
          setProducts(fallbackProducts);
        }
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [urlQ]);

  const filtered = useMemo(() => {
    let result = [...products];
    const q = search.toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.store.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    switch (sortBy) {
      case "termurah": result.sort((a, b) => a.price - b.price); break;
      case "termahal": result.sort((a, b) => b.price - a.price); break;
      case "terlaris": result.sort((a, b) => b.sold - a.sold); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [products, search, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-5 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Semua Produk</h1>
          <p className="text-xs md:text-sm text-white/40 mt-0.5">{filtered.length} produk ditemukan</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar pl-10 md:pl-12 text-sm md:text-base"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-white/40" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-3 md:p-3.5 rounded-2xl border transition-all shrink-0",
            showFilters ? "bg-primary/10 border-primary text-primary" : "bg-surface-light border-border text-white/60"
          )}
        >
          <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {showFilters && (
        <div className="glass rounded-2xl p-4 md:p-5 space-y-4 md:space-y-5 animate-slide-up">
          <div>
            <p className="text-xs md:text-sm font-medium mb-2 md:mb-3">Kategori</p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all",
                  !selectedCategory ? "bg-primary text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all",
                    selectedCategory === cat.name ? "bg-primary text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium mb-2 md:mb-3">Urutkan</p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {[
                { value: "terbaru", label: "Terbaru" },
                { value: "termurah", label: "Termurah" },
                { value: "termahal", label: "Termahal" },
                { value: "terlaris", label: "Terlaris" },
                { value: "rating", label: "Rating" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cn(
                    "px-2.5 md:px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all",
                    sortBy === opt.value ? "bg-primary text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 md:py-20 space-y-3">
          <p className="text-sm md:text-lg text-white/40">Produk tidak ditemukan</p>
          <button
            onClick={() => { setSearch(""); setSelectedCategory(null); }}
            className="btn-primary text-sm inline-block"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="card overflow-hidden group">
              <div className="aspect-square overflow-hidden rounded-t-2xl bg-surface-lighter">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-2 md:p-3 space-y-1 md:space-y-1.5">
                <p className="text-[10px] md:text-xs text-white/40 truncate">{product.store}</p>
                <h3 className="font-medium text-xs md:text-sm truncate leading-tight">{product.name}</h3>
                <p className="font-bold text-primary text-xs md:text-sm">Rp{product.price.toLocaleString("id-ID")}</p>
                <div className="flex items-center justify-between text-[10px] md:text-xs text-white/40">
                  <div className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-yellow-500 text-yellow-500" />
                    <span>{product.rating}</span>
                  </div>
                  <span>Terjual {product.sold}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
