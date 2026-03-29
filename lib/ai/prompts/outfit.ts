import type { CandidateOutfit, StyleProfile, WeatherSnapshot, WardrobeItem } from "@/lib/types";

export const OUTFIT_PROMPT_VERSION = "luma-outfit-v1";

export function buildOutfitPrompt(params: {
  weather: WeatherSnapshot;
  styleProfile: StyleProfile;
  candidates: CandidateOutfit[];
  itemMap: Map<string, WardrobeItem>;
  vibePrompt?: string;
}) {
  const candidateSummary = params.candidates.map((candidate) => {
    const describe = (itemId?: string) => {
      if (!itemId) return "none";
      const item = params.itemMap.get(itemId);
      if (!item) return itemId;
      return `${item.name} (${item.category}, ${item.colors.join("/")})`;
    };

    return {
      id: candidate.id,
      vibe: candidate.vibe,
      score: candidate.score,
      top: describe(candidate.slots.top),
      bottom: describe(candidate.slots.bottom),
      onePiece: describe(candidate.slots.onePiece),
      outerwear: describe(candidate.slots.outerwear),
      shoes: describe(candidate.slots.shoes),
      accessories: (candidate.slots.accessories ?? []).map((itemId) => describe(itemId)),
      notes: candidate.notes,
    };
  });

  return `
You are reranking outfit candidates for a wardrobe app.

Priorities:
- Respect real wardrobe constraints over creativity.
- Prefer weather fit first, user taste second, novelty third.
- Avoid disliked traits and overused items.
- Keep the explanation concise for a mobile UI.

User style summary:
${params.styleProfile.structuredTraits.summary}

Preferred colors: ${params.styleProfile.structuredTraits.preferredColors.join(", ")}
Avoided colors: ${params.styleProfile.structuredTraits.avoidedColors.join(", ")}
Target vibes: ${params.styleProfile.structuredTraits.targetVibes.join(", ")}
Requested vibe: ${params.vibePrompt ?? "none"}

Weather:
- high_c: ${params.weather.temperatureHighC}
- low_c: ${params.weather.temperatureLowC}
- condition: ${params.weather.conditionCode}
- precipitation_probability: ${params.weather.precipitationProbability}

Candidate outfits:
${JSON.stringify(candidateSummary, null, 2)}

Return JSON only with this exact shape:
{
  "primary_candidate_id": "candidate-id",
  "alternate_candidate_ids": ["candidate-id"],
  "reasoning": ["short reason", "short reason"],
  "confidence": 0.0
}
  `.trim();
}
