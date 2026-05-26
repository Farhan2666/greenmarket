"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase-browser";
import { categories } from "@/lib/data";
import { Loader2, ChevronLeft, Plus, X, LogIn, Store, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "Elektronik", stock: "10", images: [""] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setError("not-authenticated"); setLoading(false); return; }
    if (error === "not-authenticated") return;
    setError(null);
    fetchProducts();
  }, [user, authLoading]);

  async function fetchProducts() {
    const res = await fetch("/api/seller", { headers: { Authorization: `Bearer ${session?.access_token}` } });
    if (res.status === 403) { setError("not-seller"); setLoading(false); return; }
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products || []);
    }
    setLoading(false);
  }

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "Elektronik", stock: "10", images: [""] });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (p: any) => {
    setForm({ name: p.name, description: p.description || "", price: String(p.price), category: p.category, stock: String(p.stock), images: p.images?.length ? p.images : [""] });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Hanya file JPEG, JPG, dan PNG yang diizinkan!");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal adalah 2MB.");
      return;
    }

    setSelectedFile(file);
    setForm({ ...form, images: [""] });
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = form.images[0] || "";

      if (selectedFile) {
        setUploadProgress(true);
        const path = `products/${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, selectedFile, { contentType: selectedFile.type });
        if (uploadError) throw new Error("Gagal upload gambar: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        imageUrl = publicUrlData.publicUrl;
        setUploadProgress(false);
      }

      const payload = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        images: imageUrl ? [imageUrl] : undefined,
      };
      const res = await fetch("/api/seller/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      resetForm();
      fetchProducts();
    } catch (e: any) {
      alert(e.message);
    }
    setSaving(false);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, []);

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
          <p className="text-sm text-white/60">Kamu harus masuk akun dulu untuk mengelola produk.</p>
          <Link href="/auth" className="btn-primary inline-block px-6 py-2.5 text-sm">Masuk / Daftar</Link>
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
          <Link href="/seller" className="text-primary text-sm hover:underline">Kembali</Link>
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
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-xs text-white/40 hover:text-white mb-1">
            <ChevronLeft className="w-3 h-3" /> Kembali
          </button>
          <h1 className="text-xl md:text-2xl font-bold">Produk Saya</h1>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); }} className="btn-primary text-xs md:text-sm py-2 px-3 md:px-4 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Tambah
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass rounded-2xl p-4 md:p-6 relative">
          <button onClick={resetForm} className="absolute top-4 right-4 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
          <h2 className="text-sm md:text-base font-semibold mb-4">{editingId ? "Edit Produk" : "Tambah Produk Baru"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-white/60">Nama Produk</label>
              <input type="text" className="input-field text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-white/60">Deskripsi</label>
              <textarea className="input-field text-sm min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/60">Harga</label>
              <input type="number" className="input-field text-sm" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/60">Kategori</label>
              <select className="input-field text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/60">Stok</label>
              <input type="number" className="input-field text-sm" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>

            {/* Image URL / Upload */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/60">Gambar Produk</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  className="input-field text-sm flex-1 min-w-0"
                  placeholder="URL gambar..."
                  value={selectedFile ? "" : form.images[0] || ""}
                  onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                  disabled={!!selectedFile}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary px-3 py-2 text-xs shrink-0 flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
              </div>

              {selectedFile && previewUrl && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  <p className="text-[10px] text-white/40 mt-1 truncate max-w-[100px]">{selectedFile.name}</p>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-white/60 hover:text-white">Batal</button>
              <button type="submit" disabled={saving || uploadProgress} className="btn-primary px-6 py-2 text-sm disabled:opacity-50 flex items-center gap-2">
                {(saving || uploadProgress) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {uploadProgress ? "Mengupload..." : saving ? "Menyimpan..." : editingId ? "Simpan" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="glass rounded-2xl overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-8 text-sm text-white/40">
            <ImageIcon className="w-8 h-8 mx-auto mb-3 text-white/20" />
            Belum ada produk
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
            {products.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                {p.images?.[0] && (
                  <img src={p.images[0]} alt="" className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[10px] md:text-xs text-white/40">Stok: {p.stock} | Rp{p.price?.toLocaleString("id-ID")}</p>
                </div>
                <button onClick={() => handleEdit(p)} className="text-[10px] md:text-xs text-primary hover:underline shrink-0">Edit</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}