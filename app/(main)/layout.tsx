import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      title="Your closet, clarified"
      subtitle="Phone-first outfit planning, wardrobe capture, and a Gemini-powered stylist."
    >
      {children}
    </AppShell>
  );
}
