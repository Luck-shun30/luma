import { Sparkles } from "lucide-react";

import { CurrentTemperature } from "@/components/current-temperature";
import { TodayGenerateButton } from "@/components/today-generate-button";
import { SectionCard } from "@/components/section-card";
import { TodayOutfitCard } from "@/components/today-outfit-card";
import { getCurrentUserContext } from "@/lib/auth/session";
import {
  canGenerateOutfitFromItems,
  getStyleProfile,
  getTodayOutfit,
  listWardrobeItems,
} from "@/lib/data/repository";
import { generateOutfitForUser } from "@/lib/outfits/generate";

export default async function TodayPage() {
  const user = await getCurrentUserContext();
  const [items, styleProfile, savedOutfit] = await Promise.all([
    listWardrobeItems(user.userId),
    getStyleProfile(user.userId),
    getTodayOutfit(user.userId),
  ]);
  const generationState = canGenerateOutfitFromItems(items);
  const generated =
    !savedOutfit && generationState.canGenerate
      ? await generateOutfitForUser({
          userId: user.userId,
        }).catch(() => null)
      : null;
  const outfit = savedOutfit ?? generated?.outfit ?? null;

  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));

  return (
    <>
      <SectionCard
        title="Current temperature"
      >
        <CurrentTemperature />
      </SectionCard>

      {outfit ? (
        <TodayOutfitCard outfit={outfit} itemsById={itemsById} />
      ) : (
        <SectionCard
          title={
            generationState.canGenerate
              ? "Generate today's look"
              : "Almost ready to generate"
          }
        >
          {generationState.canGenerate ? (
            <TodayGenerateButton />
          ) : (
            <p className="text-sm leading-6 text-[var(--text-soft)]">
              Missing pieces:
              {" "}
              {[
                !generationState.needs.top && !generationState.needs.onePiece ? "top or one-piece" : null,
                !generationState.needs.bottom && !generationState.needs.onePiece ? "bottom" : null,
                !generationState.needs.shoes ? "shoes" : null,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </SectionCard>
      )}

      <SectionCard
        title="What the model is optimizing for"
        action={
          <Sparkles className="h-5 w-5 text-[var(--accent)]" />
        }
      >
        <p className="text-sm leading-6 text-[var(--text-strong)]">
          {styleProfile.structuredTraits.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {styleProfile.structuredTraits.targetVibes.map((vibe) => (
            <span
              key={vibe}
              className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[var(--text-soft)]"
            >
              {vibe}
            </span>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
