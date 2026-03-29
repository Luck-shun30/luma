import { CloudSun, Sparkles, Thermometer } from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { TodayOutfitCard } from "@/components/today-outfit-card";
import { getCurrentUserContext } from "@/lib/auth/session";
import { getStyleProfile, getTodayOutfit, listWardrobeItems } from "@/lib/data/repository";
import { generateOutfitForUser } from "@/lib/outfits/generate";
import { getWeatherSnapshot } from "@/lib/weather/open-meteo";
import { formatTemperature } from "@/lib/utils";

export default async function TodayPage() {
  const user = await getCurrentUserContext();
  const [items, styleProfile, savedOutfit, weather] = await Promise.all([
    listWardrobeItems(user.userId),
    getStyleProfile(user.userId),
    getTodayOutfit(user.userId),
    getWeatherSnapshot(),
  ]);
  const generated =
    !savedOutfit && items.length > 0
      ? await generateOutfitForUser({
          userId: user.userId,
        }).catch(() => null)
      : null;
  const outfit = savedOutfit ?? generated?.outfit ?? null;

  const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));

  return (
    <>
      <SectionCard
        eyebrow="Today"
        title="Forecast and styling context"
        description="Luma uses weather, saved preferences, and your feedback loop to narrow today’s look."
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-2 text-[var(--text-soft)]">
              <Thermometer className="h-4 w-4" />
              Temperature
            </div>
            <p className="mt-3 text-lg font-semibold text-[var(--text-strong)]">
              {formatTemperature(weather.temperatureLowC)} - {formatTemperature(weather.temperatureHighC)}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-2 text-[var(--text-soft)]">
              <CloudSun className="h-4 w-4" />
              Conditions
            </div>
            <p className="mt-3 text-lg font-semibold capitalize text-[var(--text-strong)]">
              {weather.conditionCode}
            </p>
            <p className="mt-1 text-sm text-[var(--text-soft)]">
              {weather.precipitationProbability}% chance of precipitation
            </p>
          </div>
        </div>
      </SectionCard>

      {outfit ? (
        <TodayOutfitCard outfit={outfit} itemsById={itemsById} />
      ) : (
        <SectionCard
          eyebrow="Outfits"
          title="Generate your first look"
          description="Add a few wardrobe items first, then Luma can build a weather-aware outfit with alternates."
        >
          <p className="text-sm leading-6 text-[var(--text-soft)]">
            Capture at least a top, a bottom or one-piece, and shoes to unlock the full outfit engine.
          </p>
        </SectionCard>
      )}

      <SectionCard
        eyebrow="Style profile"
        title="What the model is optimizing for"
        description="This is the summary currently driving outfit ranking and stylist responses."
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
