"use client";

import { useState } from "react";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "History", href: "#history" },
  { label: "Workspace", href: "#workspace" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative flex items-center justify-between border-b border-[#17221d]/12 py-5">
      <a className="flex items-center gap-3" href="#top" aria-label="IntentOS home">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17221d] text-sm font-bold text-[#f4f1ea]">I</span>
        <span className="text-lg font-semibold tracking-[-0.03em]">IntentOS</span>
      </a>
      <nav className="hidden items-center gap-8 text-sm text-[#53605a] sm:flex" aria-label="Main navigation">
        {links.map((link) => (
          <a className="transition-colors hover:text-[#17221d]" href={link.href} key={link.href}>{link.label}</a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <a className="hidden rounded-full border border-[#17221d]/20 px-4 py-2 text-sm font-medium transition-colors hover:border-[#17221d] sm:block" href="#workspace">
          Try IntentOS <span aria-hidden="true">-&gt;</span>
        </a>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#17221d]/20 text-lg sm:hidden"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "x" : "="}
        </button>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" className="absolute left-0 right-0 top-full z-20 border-b border-[#17221d]/12 bg-[#f4f1ea] py-4 sm:hidden" aria-label="Mobile navigation">
          {links.map((link) => (
            <a className="block px-2 py-3 text-sm text-[#53605a]" href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
          ))}
          <a className="mt-2 block border-t border-[#17221d]/10 px-2 pt-4 text-sm font-semibold" href="#workspace" onClick={() => setMenuOpen(false)}>Try IntentOS -&gt;</a>
        </nav>
      )}
    </header>
  );
}
