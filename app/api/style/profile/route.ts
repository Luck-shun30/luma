import { NextResponse } from "next/server";

import { toApiErrorResponse } from "@/lib/api/errors";
import { styleProfileUpdateSchema } from "@/lib/ai/schemas";
import { buildPromptUsage, embedStyleText, summarizeStylePreferences } from "@/lib/ai/gemini";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { getStyleProfile, saveAiRun, upsertStyleProfile } from "@/lib/data/repository";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUserContext();
    const body = styleProfileUpdateSchema.parse(await request.json());
    const current = await getStyleProfile(user.userId);
    const startedAt = Date.now();
    const summary = await summarizeStylePreferences({
      freeformPreferences: body.freeformPreferences,
      explicitLikes: body.explicitLikes,
      explicitDislikes: body.explicitDislikes,
      inspirationSummaries: [],
    });
    const embedding = await embedStyleText(
      [
        body.freeformPreferences,
        summary.summary,
        summary.target_vibes.join(" "),
        summary.favorite_categories.join(" "),
      ].join("\n"),
    );

    const profile = {
      ...current,
      userId: user.userId,
      freeformPreferences: body.freeformPreferences,
      structuredTraits: {
        summary: summary.summary,
        preferredColors: summary.preferred_colors,
        avoidedColors: summary.avoided_colors,
        preferredSilhouettes: summary.preferred_silhouettes,
        favoriteCategories: summary.favorite_categories,
        targetVibes: summary.target_vibes,
        formalityTendency: summary.formality_tendency,
        notes: summary.notes,
      },
      dislikedTraits: body.explicitDislikes,
      styleEmbedding: embedding,
      updatedAt: new Date().toISOString(),
    };

    await upsertStyleProfile(user.userId, profile);
    await saveAiRun({
      id: crypto.randomUUID(),
      userId: user.userId,
      runType: "embed",
      model: "gemini-embedding-001",
      promptVersion: "luma-style-summary-v1",
      input: body,
      output: {
        summary,
      },
      latencyMs: Date.now() - startedAt,
      tokenUsage: buildPromptUsage(body.freeformPreferences),
      status: "succeeded",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
