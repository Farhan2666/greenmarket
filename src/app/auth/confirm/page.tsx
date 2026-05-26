"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { Loader2, Check, XCircle, ArrowRight } from "lucide-react";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    let recovered = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY") {
        recovered = true;
        window.location.href = "/auth/reset";
      }
    });

    async function handleConfirm() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && type) {
          if (type === "recovery" || type === "invite") {
            await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
            if (cancelled) return;
            window.location.href = "/auth/reset";
            return;
          }
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          if (error) throw error;
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error("Tidak ada session");
        }

        if (cancelled) return;
        if (recovered) return;

        await new Promise(r => setTimeout(r, 300));

        if (recovered || cancelled) return;

        setStatus("success");
        setMessage("Login Berhasil! Selamat datang di GreenMarket.");
        setTimeout(() => { window.location.href = "/"; }, 2000);
      } catch (err: any) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err.message || "Gagal verifikasi");
      }
    }

    handleConfirm();
    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass rounded-2xl p-8 text-center space-y-5">
        {status === "loading" && (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-white/60">Memverifikasi akun...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold">{message}</h2>
              <p className="text-xs text-white/40">Kamu akan dialihkan ke dashboard dalam 2 detik</p>
            </div>
            <button
              onClick={() => window.location.href = "/"}
              className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
            >
              Ke Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7 text-red-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Verifikasi Gagal</h2>
              <p className="text-sm text-red-400">{message}</p>
            </div>
            <button onClick={() => router.push("/auth")} className="btn-primary w-full py-2.5 text-sm">
              Kembali ke Halaman Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
