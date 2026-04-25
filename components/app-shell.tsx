import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

import { BottomNav } from "@/components/bottom-nav";

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-5">
        <header className="mb-5">
          <div>
            <Link
              href="/today"
              prefetch={false}
              aria-label="Luma home"
              className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-white/8"
            >
              <Image
                src="/smartcloset-logo.png"
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-cover"
                priority
              />
            </Link>
            <div className="mt-3 space-y-1">
              <h1 className="text-[2.55rem] font-semibold leading-none tracking-[-0.055em] text-[var(--text-strong)]">
                {title}
              </h1>
              {subtitle ? (
                <p className="max-w-[30ch] text-sm leading-6 text-[var(--text-soft)]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
