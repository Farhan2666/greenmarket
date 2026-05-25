"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="nav-blur">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">G</span>
          </div>
          <span className="font-bold text-lg hidden sm:block">GreenMarket</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">
            Beranda
          </Link>
          <Link href="/products" className="text-sm text-white/60 hover:text-white transition-colors">
            Produk
          </Link>
          <Link href="/seller" className="text-sm text-white/60 hover:text-white transition-colors">
            Jual
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="p-2 hover:bg-white/10 rounded-xl transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
          {!loading && user ? (
            <>
              <Link href="/auth" className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden sm:block">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={signOut} className="btn-primary text-sm py-2 px-4 hidden sm:block">
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden sm:block">
                <User className="w-5 h-5" />
              </Link>
              <Link href="/auth" className="btn-primary text-sm py-2 px-4 hidden sm:block">
                Masuk
              </Link>
            </>
          )}
          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-border animate-slide-up">
          <div className="p-4 space-y-3">
            <Link href="/" className="block px-4 py-2 rounded-xl hover:bg-white/5">Beranda</Link>
            <Link href="/products" className="block px-4 py-2 rounded-xl hover:bg-white/5">Produk</Link>
            <Link href="/seller" className="block px-4 py-2 rounded-xl hover:bg-white/5">Jual</Link>
            <Link href="/cart" className="block px-4 py-2 rounded-xl hover:bg-white/5">
              Keranjang {totalItems > 0 && `(${totalItems})`}
            </Link>
            <hr className="border-border" />
            {!loading && user ? (
              <button onClick={signOut} className="block btn-primary text-center text-sm py-2.5 w-full">
                Keluar
              </button>
            ) : (
              <Link href="/auth" className="block btn-primary text-center text-sm py-2.5">
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
