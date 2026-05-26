"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
      }
    });
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
    setTimeout(() => router.replace("/"), 2000);
  };

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
            <p className="text-sm text-emerald-400">Password berhasil diubah!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs md:text-sm text-white/60 mb-1.5 block">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/40" />
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 md:pl-11 text-sm md:text-base"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
