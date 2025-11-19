import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/60 backdrop-blur-sm">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Ian Anaya
      </Link>
      <nav className="space-x-6 text-sm">
        <Link href="/projects" className="hover:text-neutral-600">
          Projects
        </Link>
        <Link href="/typefaces" className="hover:text-neutral-600">
          Typefaces
        </Link>
      </nav>
    </header>
  );
}
