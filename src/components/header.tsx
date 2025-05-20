"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import {
  IconBrandGithub,
  IconTent,
} from "@tabler/icons-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[.08] dark:border-white/[.145] bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="text-lg sm:text-xl font-semibold hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <IconTent className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>
              <span className="underline decoration-amber-500 underline-offset-4">
                Air
              </span>
              <span className="text-amber-500">Drop</span>
            </span>
          </Link>
          <Link
            href="https://github.com/yourusername/airdrop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:opacity-80 transition-opacity flex items-center gap-1.5 sm:gap-2"
          >
            <IconBrandGithub className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
