"use client";

import { Store, Package, TrendingUp, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export default function SellerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-12 md:py-16 space-y-4 md:space-y-6">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto">
          <Store className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard Penjual</h1>
        <p className="text-xs md:text-sm text-white/40 max-w-md mx-auto">
          Kelola toko, produk, dan pesananmu dalam satu dashboard modern dengan analitik real-time.
        </p>
        <Link href="/auth" className="btn-primary text-sm inline-block">Mulai Jualan Sekarang</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { icon: DollarSign, label: "Penghasilan", value: "Rp0", change: "+0%" },
          { icon: Package, label: "Produk", value: "0", change: "0 aktif" },
          { icon: TrendingUp, label: "Pesanan", value: "0", change: "0 bulan ini" },
          { icon: Users, label: "Pengunjung", value: "0", change: "0 hari ini" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-3 md:p-4">
            <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mb-2 md:mb-3" />
            <p className="text-lg md:text-2xl font-bold">{stat.value}</p>
            <p className="text-[10px] md:text-xs text-white/40 mt-0.5">{stat.label}</p>
            <p className="text-[8px] md:text-[10px] text-primary mt-1">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
