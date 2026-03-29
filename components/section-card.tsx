import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionCard({
  eyebrow,
  title,
  description,
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
          {eyebrow ? (
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-[var(--text-soft)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-strong)]">
            {title}
          </h2>
          {description ? (
            <p className="max-w-[34ch] text-sm leading-6 text-[var(--text-soft)]">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
