import Link from "next/link";
import { ReactNode } from "react";
import Image from "next/image";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-sm border-b border-neutral-200 py-3 px-[10%] flex items-center justify-between z-50">
        <Link href="/" className="flex items-center hover:opacity-80 transition">
          {/* Replace this src with your own logo file path */}
          <Image
            src="/logo.svg"
            alt="Ian Anaya"
            width={120}
            height={32}
            priority
          />
        </Link>

        <nav className="flex gap-8 text-[0.9rem] font-medium">
          <Link href="/projects" className="hover:text-neutral-500 transition">
            Projects
          </Link>
          <Link href="/typefaces" className="hover:text-neutral-500 transition">
            Typefaces
          </Link>
        </nav>
      </header>

      {/* OFFSET to prevent content from being hidden behind fixed header */}
      <div className="h-[64px]" />

      {/* PAGE CONTENT */}
      <main className="flex-grow">{children}</main>

      {/* FOOTER (optional) */}
      <footer className="w-full py-8 text-center text-xs text-neutral-400 border-t border-neutral-100">
        © {new Date().getFullYear()} Ian Anaya
      </footer>
    </div>
  );
}
