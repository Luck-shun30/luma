"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";

import type { OutfitSuggestion, WardrobeItem } from "@/lib/types";

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
}

function describeItem(itemId: string | undefined, itemsById: Record<string, WardrobeItem>) {
  if (!itemId) return null;
  return itemsById[itemId] ?? null;
}

function buildSlotKey(outfit: OutfitSuggestion["primarySlots"]) {
  return JSON.stringify({
    ...outfit,
    accessories: outfit.accessories?.slice().sort() ?? [],
  });
}

function getItemImageUrl(item: WardrobeItem) {
  return item.asset?.isolatedPath ?? item.asset?.croppedPath ?? item.asset?.originalPath ?? null;
}

export function TodayOutfitCard({
  outfit,
  itemsById,
}: {
  outfit: OutfitSuggestion;
  itemsById: Record<string, WardrobeItem>;
}) {
  const [currentOutfit, setCurrentOutfit] = useState(outfit);
  const [status, setStatus] = useState<string | null>(null);
  const [seenSlotKeys, setSeenSlotKeys] = useState<string[]>([buildSlotKey(outfit.primarySlots)]);
  const [showAllReasoning, setShowAllReasoning] = useState(false);

  useEffect(() => {
    setCurrentOutfit(outfit);
    setSeenSlotKeys([buildSlotKey(outfit.primarySlots)]);
    setStatus(null);
    setShowAllReasoning(false);
  }, [outfit]);

  const primary = [
    describeItem(currentOutfit.primarySlots.top, itemsById),
    describeItem(currentOutfit.primarySlots.bottom, itemsById),
    describeItem(currentOutfit.primarySlots.onePiece, itemsById),
    describeItem(currentOutfit.primarySlots.outerwear, itemsById),
    describeItem(currentOutfit.primarySlots.shoes, itemsById),
    ...(currentOutfit.primarySlots.accessories ?? []).map((itemId) =>
      describeItem(itemId, itemsById),
    ),
  ].filter(Boolean) as WardrobeItem[];
  const visibleReasoning = showAllReasoning
    ? currentOutfit.reasoning
    : currentOutfit.reasoning.slice(0, 1);

  const sendFeedback = async (reaction: "like" | "dislike" | "accept" | "reject") => {
    const response = await fetch(`/api/outfits/${currentOutfit.id}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reaction,
        reasonCode: reaction === "dislike" ? "not_my_vibe" : "positive_signal",
        notes: "",
      }),
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
  };

  const regenerate = async () => {
    const queuedAlternate = currentOutfit.alternateSlots.find(
      (slots) => !seenSlotKeys.includes(buildSlotKey(slots)),
    );

    if (queuedAlternate) {
      const nextKey = buildSlotKey(queuedAlternate);
      setCurrentOutfit((previous) => ({
        ...previous,
        primarySlots: queuedAlternate,
        alternateSlots: previous.alternateSlots.filter(
          (slots) => buildSlotKey(slots) !== nextKey,
        ),
      }));
      setSeenSlotKeys((current) => [...current, nextKey]);
      setStatus("Showing another outfit from today's alternates.");
      return;
    }

    setStatus("Generating another outfit...");

    try {
      const response = await fetch("/api/outfits/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          excludeSlotKeys: seenSlotKeys,
          vibePrompt:
            typeof currentOutfit.context.vibePrompt === "string"
              ? currentOutfit.context.vibePrompt
              : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const payload = (await response.json()) as { outfit: OutfitSuggestion };
      const nextKey = buildSlotKey(payload.outfit.primarySlots);
      setCurrentOutfit(payload.outfit);
      setShowAllReasoning(false);
      setSeenSlotKeys((current) =>
        current.includes(nextKey) ? current : [...current, nextKey],
      );
      setStatus("Fresh outfit generated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not regenerate right now.");
    }
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))]">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-soft)]">
              Daily suggestion
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-strong)]">
              {currentOutfit.context.vibePrompt
                ? `${currentOutfit.context.vibePrompt} energy`
                : "Weather-aware look"}
            </h2>
          </div>
          <span className="rounded-full border border-white/12 px-3 py-1 text-xs text-[var(--text-soft)]">
            {Math.round(currentOutfit.confidence * 100)}% fit
          </span>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="space-y-3">
          {primary.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/10 p-2.5"
            >
              {getItemImageUrl(item) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getItemImageUrl(item) ?? ""}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text-strong)]">{item.name}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  {item.category}
                </p>
                <p className="truncate text-xs text-[var(--text-soft)]">{item.colors.join(" / ")}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {visibleReasoning.map((reason) => (
            <p key={reason} className="text-sm leading-6 text-[var(--text-soft)]">
              {reason}
            </p>
          ))}
          {currentOutfit.reasoning.length > 1 ? (
            <button
              type="button"
              onClick={() => setShowAllReasoning((current) => !current)}
              className="flex w-full items-center gap-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]"
            >
              <span className="h-px flex-1 bg-white/12" />
              {showAllReasoning ? "Show less" : "Show more"}
              <span className="h-px flex-1 bg-white/12" />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={async () => {
              try {
                await sendFeedback("accept");
                setStatus("Marked as your look for today.");
              } catch (error) {
                setStatus(error instanceof Error ? error.message : "Could not save feedback.");
              }
            }}
            className="flex items-center justify-center gap-2 rounded-[1.3rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-black transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(243,179,76,0.28)] active:translate-y-0"
          >
            <ThumbsUp className="h-4 w-4" />
            Wear this
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await sendFeedback("dislike");
                setStatus("Finding a better fit...");
                await regenerate();
              } catch (error) {
                setStatus(error instanceof Error ? error.message : "Could not save feedback.");
              }
            }}
            className="flex items-center justify-center gap-2 rounded-[1.3rem] border border-white/12 px-4 py-3 text-sm font-semibold text-[var(--text-strong)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/70 hover:bg-white/8 active:translate-y-0"
          >
            <ThumbsDown className="h-4 w-4" />
            Not my vibe
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            void regenerate();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-[1.3rem] border border-white/12 px-4 py-3 text-sm font-semibold text-[var(--text-strong)] transition hover:bg-white/8"
        >
          <RefreshCw className="h-4 w-4" />
          Show another outfit
        </button>

        {status ? <p className="text-sm text-[var(--text-soft)]">{status}</p> : null}
      </div>
    </div>
  );
}
