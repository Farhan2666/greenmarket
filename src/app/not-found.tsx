import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-sm text-white/60">Halaman tidak ditemukan</p>
        <Link href="/" className="btn-primary inline-block px-6 py-2.5 text-sm">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
