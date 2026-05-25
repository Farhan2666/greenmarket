"use client";

import { Store, BarChart3, Package, TrendingUp, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export default function SellerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-16 space-y-6">
        <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Dashboard Penjual</h1>
        <p className="text-white/40 max-w-md mx-auto">
          Kelola toko, produk, dan pesananmu dalam satu dashboard modern dengan analitik real-time.
        </p>
        <Link href="/auth" className="btn-primary inline-block">
          Mulai Jualan Sekarang
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Penghasilan", value: "Rp0", change: "+0%" },
          { icon: Package, label: "Produk", value: "0", change: "0 aktif" },
          { icon: TrendingUp, label: "Pesanan", value: "0", change: "0 bulan ini" },
          { icon: Users, label: "Pengunjung", value: "0", change: "0 hari ini" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4">
            <stat.icon className="w-5 h-5 text-primary mb-3" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-primary mt-1">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
