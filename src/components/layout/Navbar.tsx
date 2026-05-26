"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  Camera,
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
  <Image
    src="/logo.svg"
    alt="GreenMarket logo"
    width={100}
    height={30}
    className="h-7 sm:h-8 w-auto"
    priority
  />
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
          <Link href="/ai-search" className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden sm:block">
            <Camera className="w-5 h-5" />
          </Link>
          <Link href="/wishlist" className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden sm:block">
            <Heart className="w-5 h-5" />
          </Link>
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
              <Link href="/profile" className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden sm:block">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={signOut} className="text-xs md:text-sm text-white/60 hover:text-white px-3 hidden sm:block">
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
            <Link href="/ai-search" className="block px-4 py-2 rounded-xl hover:bg-white/5">AI Search</Link>
            <Link href="/wishlist" className="block px-4 py-2 rounded-xl hover:bg-white/5">Favorit</Link>
            <Link href="/cart" className="block px-4 py-2 rounded-xl hover:bg-white/5">
              Keranjang {totalItems > 0 && `(${totalItems})`}
            </Link>
            {!loading && user && (
              <>
                <Link href="/profile" className="block px-4 py-2 rounded-xl hover:bg-white/5">Profil</Link>
              </>
            )}
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
