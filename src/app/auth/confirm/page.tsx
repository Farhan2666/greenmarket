"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { Loader2, Check, XCircle } from "lucide-react";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

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

        if (type === "recovery") {
          window.location.href = "/auth/reset";
          return;
        }

        setStatus("success");
        setMessage("Email berhasil diverifikasi! Kamu sudah masuk.");
        setTimeout(() => { window.location.href = "/"; }, 1500);
      } catch (err: any) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err.message || "Gagal verifikasi");
      }
    }

    handleConfirm();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm glass rounded-2xl p-8 text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-white/60">Memverifikasi...</p>
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
