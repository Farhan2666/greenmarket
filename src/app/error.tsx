"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold text-primary">Error</h1>
        <p className="text-sm text-white/60">Maaf, terjadi kesalahan yang tidak terduga.</p>
        <button
          onClick={reset}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
