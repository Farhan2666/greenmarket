"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Camera, Upload, Image as ImageIcon, Search, Loader2, Star, X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { products } from "@/lib/data";

export default function AISearchPage() {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<typeof products>([]);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      scanImage();
    };
    reader.readAsDataURL(file);
  };

  const scanImage = () => {
    setScanning(true);
    setDone(false);
    setResults([]);

    setTimeout(() => {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      const count = Math.min(4, products.length);
      const matched = shuffled.slice(0, count).map((p, i) => ({
        ...p,
        match: `${(85 + Math.floor(Math.random() * 14))}%`,
      }));
      setResults(matched);
      setScanning(false);
      setDone(true);
    }, 2000);
  };

  const reset = () => {
    setImage(null);
    setResults([]);
    setScanning(false);
    setDone(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => window.history.back()} className="flex items-center gap-1 text-[10px] md:text-xs text-white/40 hover:text-white mb-1">
            <ChevronLeft className="w-3 h-3" /> Kembali
          </button>
          <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            AI Image Search
          </h1>
        </div>
        {image && (
          <button onClick={reset} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      <p className="text-xs md:text-sm text-white/40">
        Upload foto atau gunakan kamera untuk mencari produk serupa.
      </p>

      {/* Upload Area */}
      {!image && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={cn(
            "glass rounded-2xl md:rounded-3xl p-8 md:p-16 text-center transition-all duration-300 cursor-pointer border-2 border-dashed",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          )}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          </div>
          <p className="text-sm md:text-base font-medium mb-1">Upload Foto</p>
          <p className="text-xs md:text-sm text-white/40 mb-2">atau drag & drop file di sini</p>
          <p className="text-[10px] md:text-xs text-white/30">JPG, PNG, WEBP — Maks 5MB</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
              className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2"
            >
              <Camera className="w-4 h-4" /> Buka Kamera
            </button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        </div>
      )}

      {/* Preview */}
      {image && (
        <div className="glass rounded-2xl p-3 md:p-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-surface-lighter shrink-0">
              <img src={image} alt="Upload" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium">Foto kamu</p>
              <p className="text-[10px] md:text-xs text-white/40 mt-0.5">
                {scanning ? "Mencari produk serupa..." : done ? `${results.length} produk ditemukan` : ""}
              </p>
            </div>
            {scanning && (
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs hidden md:inline">Memindai...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scanning Animation */}
      {scanning && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary/30 flex items-center justify-center">
              <Search className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-xs md:text-sm font-medium text-primary">AI Sedang Memindai...</p>
            <p className="text-[10px] md:text-xs text-white/40">Menganalisis bentuk, warna, dan pola</p>
          </div>
        </div>
      )}

      {/* Results */}
      {done && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-semibold">Produk Serupa</h2>
            <span className="text-[10px] md:text-xs text-white/40">{results.length} hasil</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {results.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="card overflow-hidden group">
                <div className="aspect-square overflow-hidden rounded-t-2xl bg-surface-lighter relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {(p as any).match && (
                    <div className="absolute top-2 left-2 bg-primary/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {(p as any).match}
                    </div>
                  )}
                </div>
                <div className="p-2 md:p-3 space-y-1">
                  <p className="text-[10px] text-white/40 truncate">{p.store}</p>
                  <h3 className="font-medium text-xs truncate">{p.name}</h3>
                  <p className="font-bold text-primary text-xs">Rp{p.price.toLocaleString("id-ID")}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                    <span className="text-[10px] text-white/40">{p.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-xs text-white/40">
              Hasil ini masih simulasi.{" "}
              <span className="text-primary">Backend AI menyusul.</span>
            </p>
          </div>
        </div>
      )}

      {done && results.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/40">Tidak ada produk yang cocok</p>
          <button onClick={reset} className="btn-primary text-xs mt-3 inline-block">Coba Upload Lain</button>
        </div>
      )}
    </div>
  );
}
