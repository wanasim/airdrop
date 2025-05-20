"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import {
  IconBrandGithub,
  IconTent,
} from "@tabler/icons-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-black/[.08] border-b bg-background/80 backdrop-blur-sm dark:border-white/[.145]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg transition-opacity hover:opacity-80 sm:text-xl"
          >
            <IconTent className="h-5 w-5 sm:h-6 sm:w-6" />
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
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80 sm:gap-2"
          >
            <IconBrandGithub className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>
        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
