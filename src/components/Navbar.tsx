"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Products" },
    { href: "/cart", label: "Cart" },
    { href: "/orders", label: "Orders" },
    { href: "/admin/products", label: "Admin" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Plentiva Logo"
            width={400}
            height={100}
            priority
            className="h-10 w-auto"
          />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
            Plentiva
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {l.label}
              {l.label === "Cart" && totalItems > 0 && (
                <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
