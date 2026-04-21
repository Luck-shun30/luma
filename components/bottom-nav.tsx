"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  House,
  MessagesSquare,
  Shirt,
  SlidersHorizontal,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/today", label: "Today", icon: House },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { href: "/capture", label: "Capture", icon: Camera },
  { href: "/stylist", label: "Stylist", icon: MessagesSquare },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-2 rounded-[1.75rem] border border-white/14 bg-[rgba(8,14,20,0.88)] p-2 shadow-[0_24px_80px_rgba(2,8,13,0.42)] backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[0.7rem] font-medium transition duration-200",
                active
                  ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                  : "text-[var(--text-soft)] hover:bg-white/6 hover:text-[var(--text-strong)]",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
