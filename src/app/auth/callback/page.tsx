"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { Loader2, Check, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
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
      if (event === "SIGNED_IN" && !cancelled) {
        setStatus("success");
        setMessage("Berhasil masuk!");
        setTimeout(() => { window.location.href = "/"; }, 1000);
      }
    });

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } catch (err: any) {
          if (cancelled) return;
          setStatus("error");
          setMessage(err.message || "Gagal verifikasi");
          return;
        }
      } else if (tokenHash && type) {
        try {
          if (type === "recovery" || type === "invite") {
            await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
            if (cancelled) return;
            window.location.href = "/auth/reset";
            return;
          }
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
          if (error) throw error;
        } catch (err: any) {
          if (cancelled) return;
          setStatus("error");
          setMessage(err.message || "Gagal verifikasi");
          return;
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !cancelled) {
          setStatus("loading");
          return;
        }
      }

      if (cancelled || recovered) return;

      setStatus("success");
      setMessage("Berhasil masuk!");
      setTimeout(() => { window.location.href = "/"; }, 1000);
    }

    handleCallback();
    return () => { cancelled = true; subscription?.unsubscribe(); };
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass rounded-2xl p-8 text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-white/60">Memproses...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm text-emerald-400">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm text-red-400">{message}</p>
            <button onClick={() => router.push("/auth")} className="btn-primary text-sm px-4 py-2">
              Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
