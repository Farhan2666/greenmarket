"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Chrome } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      mode === "login"
        ? "Login berhasil! (demo)"
        : "Pendaftaran berhasil! (demo)"
    );
    router.push("/");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-xl">G</span>
          </div>
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "Masuk" : "Daftar Akun"}
          </h1>
          <p className="text-white/40 mt-1">
            {mode === "login"
              ? "Selamat datang kembali"
              : "Mulai berbelanja di GreenMarket"}
          </p>
        </div>

        {/* Google Login */}
        <button className="w-full glass rounded-2xl py-3.5 flex items-center justify-center gap-3 glass-hover">
          <Chrome className="w-5 h-5" />
          Lanjutkan dengan Google
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-white/40">atau</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Nama</label>
              <input
                type="text"
                placeholder="Masukkan nama"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-11"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {mode === "login" && (
            <div className="text-right">
              <button
                type="button"
                className="text-xs text-primary hover:underline"
              >
                Lupa password?
              </button>
            </div>
          )}

          <button type="submit" className="btn-primary w-full">
            {mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </form>

        {/* Toggle Mode */}
        <p className="text-center text-sm text-white/40">
          {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-primary hover:underline font-medium"
          >
            {mode === "login" ? "Daftar" : "Masuk"}
          </button>
        </p>
      </div>
    </div>
  );
}
