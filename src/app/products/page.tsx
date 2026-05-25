import { Suspense } from "react";
import ProductsContent from "./content";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-white/40">Memuat...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
