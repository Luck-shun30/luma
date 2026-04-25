import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      title="Your Closet"
    >
      {children}
    </AppShell>
  );
}
