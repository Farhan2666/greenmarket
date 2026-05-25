import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { StarField } from "@/components/ui/StarField";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GreenMarket - Modern E-Commerce",
  description: "Belanja cerdas dengan AI Image Search",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} relative`}>
        <StarField />
        <div className="relative z-10">
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="pt-16 min-h-screen">{children}</main>
            </CartProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
