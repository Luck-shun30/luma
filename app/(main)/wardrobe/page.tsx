import { Grid3X3, Layers3 } from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { WardrobeGrid } from "@/components/wardrobe-grid";
import { getCurrentUserContext } from "@/lib/auth/session";
import { listWardrobeItems } from "@/lib/data/repository";

export default async function WardrobePage() {
  const user = await getCurrentUserContext();
  const items = await listWardrobeItems(user.userId);
  const visibleItems = items.filter((item) => item.status !== "archived");
  const activeCount = visibleItems.length;

  return (
    <>
      <SectionCard
        eyebrow="Wardrobe"
        title={`${activeCount} active pieces`}
        description="Cropped, tagged, and ready for outfit generation. Review new captures here after processing."
      >
        <div className="grid grid-cols-2 gap-3 text-sm text-[var(--text-soft)]">
          <div className="rounded-[1.4rem] border border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-2 text-[var(--text-soft)]">
              <Grid3X3 className="h-4 w-4" />
              Categories
            </div>
            <p className="mt-3 text-lg font-semibold text-[var(--text-strong)]">
              {new Set(items.map((item) => item.category)).size}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-2 text-[var(--text-soft)]">
              <Layers3 className="h-4 w-4" />
              Total pieces
            </div>
            <p className="mt-3 text-lg font-semibold text-[var(--text-strong)]">
              {items.length}
            </p>
          </div>
        </div>
      </SectionCard>

      <WardrobeGrid items={visibleItems} />
    </>
  );
}
