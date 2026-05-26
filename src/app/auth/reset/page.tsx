"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Check, Eye, EyeOff, ArrowRight } from "lucide-react";
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
      setError("Link reset password tidak valid atau sudah kedaluwarsa.");
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
    setTimeout(() => router.replace("/auth?reset=success"), 2000);
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
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">Reset Password</h1>
          <p className="text-xs md:text-sm text-white/40 mt-1">Buat password baru untuk akun kamu</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-xl">{error}</div>
        )}

        {done ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Password Berhasil Diubah!</h2>
              <p className="text-sm text-white/40">Kamu akan dialihkan ke halaman login</p>
            </div>
          </div>
        ) : isValidSession ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 text-sm w-full"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-white/40 mt-1">Password akan langsung tersimpan di server setelah di-reset</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Simpan Password Baru
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4">
            <p className="text-sm text-white/60">Link reset sudah tidak berlaku.</p>
            <button onClick={() => router.push("/auth")} className="btn-primary px-6 py-2.5 text-sm">
              Kembali ke Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
