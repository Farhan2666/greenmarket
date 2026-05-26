"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Users, Package, ShoppingBag, LayoutDashboard,
  Shield, Loader2, Trash2, ChevronLeft, Search, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "users" | "products" | "orders";

export default function AdminPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth"); return; }
    fetchData("dashboard");
  }, [user, authLoading]);

  async function fetchData(type: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?type=${type}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.status === 403) { router.push("/"); return; }
      if (res.ok) {
        const result = await res.json();
        if (type === "dashboard") {
          const [usersRes, productsRes, ordersRes] = await Promise.all([
            fetch("/api/admin?type=users", { headers: { Authorization: `Bearer ${session?.access_token}` } }),
            fetch("/api/admin?type=products", { headers: { Authorization: `Bearer ${session?.access_token}` } }),
            fetch("/api/admin?type=orders", { headers: { Authorization: `Bearer ${session?.access_token}` } })
          ]);
          const users = await usersRes.json();
          const products = await productsRes.json();
          const orders = await ordersRes.json();
          setStats({
            totalUsers: Array.isArray(users) ? users.length : 0,
            totalProducts: Array.isArray(products) ? products.length : 0,
            totalOrders: Array.isArray(orders) ? orders.length : 0,
            revenue: Array.isArray(orders) ? orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0) : 0,
          });
        } else {
          setData(Array.isArray(result) ? result : []);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const filteredData = data.filter((item: any) => {
    const q = search.toLowerCase();
    if (tab === "users") return item.name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q);
    if (tab === "products") return item.name?.toLowerCase().includes(q);
    if (tab === "orders") return item.id?.toLowerCase().includes(q);
    return true;
  });

  async function updateItem(type: string, id: string, updates: any) {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ type, id, ...updates })
    });
    fetchData(type + "s");
  }

  async function deleteItem(type: string, id: string) {
    if (!confirm("Yakin hapus item ini?")) return;
    await fetch("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ type, id })
    });
    fetchData(type + "s");
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "users", label: "Users", icon: Users },
    { key: "products", label: "Products", icon: Package },
    { key: "orders", label: "Orders", icon: ShoppingBag },
  ];

  if (authLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-[10px] md:text-xs text-white/40 hover:text-white mb-1">
            <ChevronLeft className="w-3 h-3" /> Kembali
          </button>
          <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Panel Admin
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 md:gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); fetchData(t.key === "dashboard" ? "dashboard" : t.key + "s"); }}
            className={cn(
              "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm whitespace-nowrap transition-all",
              tab === t.key ? "bg-primary text-black font-medium" : "glass text-white/60 hover:text-white"
            )}
          >
            <t.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers?.toLocaleString() || "0", icon: Users },
            { label: "Total Produk", value: stats.totalProducts?.toLocaleString() || "0", icon: Package },
            { label: "Total Pesanan", value: stats.totalOrders?.toLocaleString() || "0", icon: ShoppingBag },
            { label: "Revenue", value: `Rp${(stats.revenue || 0).toLocaleString("id-ID")}`, icon: Shield },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-3 md:p-4">
              <s.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mb-2" />
              <p className="text-lg md:text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] md:text-xs text-white/40 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {tab !== "dashboard" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder={`Cari ${tab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar pl-10 text-sm"
          />
        </div>
      )}

      {/* Users Table */}
      {tab === "users" && (
        <div className="overflow-x-auto">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto py-8 text-primary" /> : (
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="text-white/40 border-b border-border">
                  <th className="text-left py-2 md:py-3 px-2">Nama</th>
                  <th className="text-left py-2 md:py-3 px-2 hidden md:table-cell">Email</th>
                  <th className="text-left py-2 md:py-3 px-2">Role</th>
                  <th className="text-right py-2 md:py-3 px-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((u: any) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-white/5">
                    <td className="py-2 md:py-3 px-2 font-medium truncate max-w-[120px] md:max-w-none">{u.name || "-"}</td>
                    <td className="py-2 md:py-3 px-2 text-white/60 hidden md:table-cell">{u.email}</td>
                    <td className="py-2 md:py-3 px-2">
                      <select
                        value={u.role}
                        onChange={(e) => updateItem("user", u.id, { role: e.target.value })}
                        className={cn(
                          "bg-transparent border border-border rounded-lg px-1.5 md:px-2 py-1 text-[10px] md:text-xs",
                          u.role === "ADMIN" && "text-primary",
                          u.role === "SELLER" && "text-emerald-400",
                          u.role === "BUYER" && "text-white/60"
                        )}
                      >
                        <option value="BUYER">BUYER</option>
                        <option value="SELLER">SELLER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-2 md:py-3 px-2 text-right">
                      {u.role === "SELLER" ? (
                        <button onClick={() => deleteItem("user", u.id)} className="text-red-400 hover:text-red-300 text-[10px] md:text-xs px-2 py-1 border border-red-400/30 rounded-lg">
                          Suspend
                        </button>
                      ) : (
                        <span className="text-[10px] md:text-xs text-white/20">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Products Table */}
      {tab === "products" && (
        <div className="overflow-x-auto">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto py-8 text-primary" /> : (
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="text-white/40 border-b border-border">
                  <th className="text-left py-2 md:py-3 px-2">Produk</th>
                  <th className="text-left py-2 md:py-3 px-2 hidden md:table-cell">Kategori</th>
                  <th className="text-left py-2 md:py-3 px-2">Harga</th>
                  <th className="text-left py-2 md:py-3 px-2">Stok</th>
                  <th className="text-left py-2 md:py-3 px-2 hidden md:table-cell">Penjual</th>
                  <th className="text-right py-2 md:py-3 px-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((p: any) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-white/5">
                    <td className="py-2 md:py-3 px-2">
                      <div className="flex items-center gap-2">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        )}
                        <span className="truncate max-w-[150px] md:max-w-none">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 text-white/60 hidden md:table-cell">{p.category}</td>
                    <td className="py-2 md:py-3 px-2">Rp{p.price?.toLocaleString("id-ID")}</td>
                    <td className="py-2 md:py-3 px-2">
                      <input
                        type="number"
                        value={p.stock}
                        onChange={(e) => updateItem("product", p.id, { stock: parseInt(e.target.value) || 0 })}
                        className="w-14 md:w-16 bg-transparent border border-border rounded-lg px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="py-2 md:py-3 px-2 text-white/60 hidden md:table-cell">
                      {p.seller?.name || p.seller?.email || "-"}
                    </td>
                    <td className="py-2 md:py-3 px-2 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Takedown "${p.name}" (milik ${p.seller?.name || "seller"}?`)) deleteItem("product", p.id);
                        }}
                        className="text-red-400 hover:text-red-300 text-[10px] md:text-xs px-2 py-1 border border-red-400/30 rounded-lg"
                      >
                        Takedown
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Orders Table */}
      {tab === "orders" && (
        <div className="overflow-x-auto">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto py-8 text-primary" /> : (
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="text-white/40 border-b border-border">
                  <th className="text-left py-2 md:py-3 px-2">ID</th>
                  <th className="text-left py-2 md:py-3 px-2 hidden md:table-cell">Pembeli</th>
                  <th className="text-left py-2 md:py-3 px-2">Total</th>
                  <th className="text-left py-2 md:py-3 px-2">Status</th>
                  <th className="text-right py-2 md:py-3 px-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((o: any) => (
                  <tr key={o.id} className="border-b border-border/50 hover:bg-white/5">
                    <td className="py-2 md:py-3 px-2 font-mono text-[10px] md:text-xs text-white/60">#{o.id.slice(0, 8)}</td>
                    <td className="py-2 md:py-3 px-2 hidden md:table-cell">{o.user?.name || o.user?.email || "-"}</td>
                    <td className="py-2 md:py-3 px-2">Rp{o.total?.toLocaleString("id-ID")}</td>
                    <td className="py-2 md:py-3 px-2">
                      <select
                        value={o.status}
                        onChange={(e) => updateItem("order", o.id, { status: e.target.value })}
                        className={cn(
                          "bg-transparent border border-border rounded-lg px-1.5 md:px-2 py-1 text-[10px] md:text-xs",
                          o.status === "DELIVERED" && "text-emerald-400",
                          o.status === "CANCELLED" && "text-red-400",
                          o.status === "PENDING" && "text-yellow-400",
                          o.status === "SHIPPED" && "text-primary",
                          o.status === "CONFIRMED" && "text-blue-400"
                        )}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-2 md:py-3 px-2 text-right text-white/40">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
