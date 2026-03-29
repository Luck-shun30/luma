"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import type { StyleProfile } from "@/lib/types";

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "Unable to save the style profile.";
  } catch {
    return "Unable to save the style profile.";
  }
}

export function StyleProfileForm({ initialProfile }: { initialProfile: StyleProfile }) {
  const router = useRouter();
  const [preferences, setPreferences] = useState(initialProfile.freeformPreferences);
  const [likes, setLikes] = useState(
    initialProfile.structuredTraits.preferredColors.join(", "),
  );
  const [dislikes, setDislikes] = useState(initialProfile.dislikedTraits.join(", "));
  const [status, setStatus] = useState<string | null>(null);

  const handleSave = async () => {
    setStatus("Saving your style profile...");

    try {
      const response = await fetch("/api/style/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          freeformPreferences: preferences,
          explicitLikes: likes
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          explicitDislikes: dislikes
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          inspirationAssetIds: [],
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      setStatus("Saved. Luma will use this profile for future outfit generations.");
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Profile save failed. Check your backend configuration and try again.",
      );
    }
  };

  return (
    <div className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text-strong)]">
          Describe your style
        </span>
        <textarea
          value={preferences}
          onChange={(event) => setPreferences(event.target.value)}
          className="min-h-36 w-full rounded-[1.5rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text-strong)]">
          Favorite colors or categories
        </span>
        <input
          value={likes}
          onChange={(event) => setLikes(event.target.value)}
          className="w-full rounded-[1.3rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--text-strong)]">
          Avoided colors or vibes
        </span>
        <input
          value={dislikes}
          onChange={(event) => setDislikes(event.target.value)}
          className="w-full rounded-[1.3rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none transition focus:border-[var(--accent)]"
        />
      </label>

      <button
        type="button"
        onClick={() => {
          startTransition(() => {
            void handleSave();
          });
        }}
        className="w-full rounded-[1.4rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:opacity-90"
      >
        Save style profile
      </button>

      {status ? <p className="text-sm text-[var(--text-soft)]">{status}</p> : null}
    </div>
  );
}
