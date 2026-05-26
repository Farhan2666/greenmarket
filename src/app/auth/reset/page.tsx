"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setIsValidSession(true);
          setChecking(false);
          return;
        }
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            setIsValidSession(true);
            setChecking(false);
            return;
          }
        } else if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
          if (!error) {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (s) {
              setIsValidSession(true);
              setChecking(false);
              return;
            }
          }
        }
      } catch {}

      if (cancelled) return;
      setError("Link reset password tidak valid atau sudah kedaluwarsa. Silakan coba lagi.");
      setChecking(false);
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY" && !cancelled) {
        setIsValidSession(true);
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => router.replace("/auth"), 2000);
  };

  if (checking) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md glass rounded-2xl p-6 md:p-8 space-y-5">
        <div className="text-center">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">Reset Password</h1>
          <p className="text-xs md:text-sm text-white/40 mt-1">Masukkan password baru</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs md:text-sm px-3 py-2 rounded-xl">{error}</div>
        )}

        {done ? (
          <div className="text-center space-y-3 py-4">
            <Check className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm text-emerald-400">Password berhasil diubah! Kamu akan dialihkan ke halaman login.</p>
          </div>
        ) : isValidSession ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs md:text-sm text-white/60 mb-1.5 block">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 md:pl-11 pr-10 text-sm md:text-base"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Reset Password
            </button>
          </form>
        ) : (
          <div className="text-center space-y-3 py-4">
            <p className="text-sm text-white/60">Link tidak valid atau sudah kedaluwarsa.</p>
            <button onClick={() => router.push("/auth")} className="btn-primary text-sm px-4 py-2">
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
