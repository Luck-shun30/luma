import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[2rem] border border-white/12 bg-white/8 p-5 shadow-[0_18px_60px_rgba(7,14,20,0.22)] backdrop-blur-xl",
        className,
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-[-0.035em] text-[var(--text-strong)]">
            {title}
          </h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
