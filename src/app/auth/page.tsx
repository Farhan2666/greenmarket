"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, Chrome, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/auth/reset`,
        });
        if (error) throw error;
        setSuccess("Email reset password terkirim! Cek inbox kamu.");
        return;
      }

      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        if (!data.session) throw new Error("Gagal mendapatkan session");
        await supabase.auth.setSession(data.session);
        await new Promise(r => setTimeout(r, 100));
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { name: form.name } },
        });
        if (error) throw error;
        setSuccess("Daftar berhasil! Cek email untuk konfirmasi.");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6 md:space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-3 md:mb-4">
            <Image
              src="/logo.svg"
              alt="GreenMarket"
              width={160}
              height={48}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">
            {mode === "login" ? "Masuk" : mode === "register" ? "Daftar Akun" : "Lupa Password"}
          </h1>
          <p className="text-xs md:text-sm text-white/40 mt-1">
            {mode === "login" ? "Selamat datang kembali" : mode === "register" ? "Mulai berbelanja di GreenMarket" : "Tenang, kami kirim email reset"}
          </p>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.origin },
            });
          }}
          className="w-full glass rounded-2xl py-3 md:py-3.5 flex items-center justify-center gap-2 md:gap-3 glass-hover text-sm md:text-base"
        >
          <Chrome className="w-4 h-4 md:w-5 md:h-5" />
          Lanjutkan dengan Google
        </button>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] md:text-xs text-white/40">atau</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs md:text-sm px-3 md:px-4 py-2 md:py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs md:text-sm px-3 md:px-4 py-2 md:py-3 rounded-xl">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs md:text-sm text-white/60 mb-1 md:mb-1.5 block">Nama</label>
              <input type="text" placeholder="Masukkan nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-sm md:text-base" required />
            </div>
          )}
          <div>
            <label className="text-xs md:text-sm text-white/60 mb-1 md:mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
              <input type="email" placeholder="Masukkan email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10 md:pl-11 text-sm md:text-base" required />
            </div>
          </div>
          {mode !== "forgot" && (
            <div>
              <label className="text-xs md:text-sm text-white/60 mb-1 md:mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
                <input type={showPassword ? "text" : "password"} placeholder="Masukkan password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-10 md:pl-11 text-sm md:text-base" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="text-right">
              <button type="button" onClick={() => setMode("forgot")} className="text-[10px] md:text-xs text-primary hover:underline">Lupa password?</button>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full text-sm md:text-base py-2.5 md:py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === "login" ? "Masuk" : mode === "register" ? "Daftar" : "Kirim Email Reset"}
          </button>
        </form>

        <p className="text-center text-xs md:text-sm text-white/40">
          {mode === "forgot" ? (
            <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">Kembali ke Masuk</button>
          ) : mode === "login" ? (
            <>Belum punya akun? <button onClick={() => setMode("register")} className="text-primary hover:underline font-medium">Daftar</button></>
          ) : (
            <>Sudah punya akun? <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">Masuk</button></>
          )}
        </p>
      </div>
    </div>
  );
}
