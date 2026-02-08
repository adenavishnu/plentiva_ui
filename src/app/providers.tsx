"use client";

import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </CartProvider>
  );
}
