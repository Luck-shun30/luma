"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import type { WardrobeItem } from "@/lib/types";
import { cn, formatWearDate, titleCase } from "@/lib/utils";

type WardrobeDraft = {
  name: string;
  category: string;
  subcategory: string;
  colors: string;
  pattern: string;
  fabric: string;
  size: string;
  formality: WardrobeItem["formality"];
  seasonality: string;
  status: Exclude<WardrobeItem["status"], "processing">;
};

function createDraft(item: WardrobeItem): WardrobeDraft {
  return {
    name: item.name,
    category: item.category,
    subcategory: item.subcategory,
    colors: item.colors.join(", "),
    pattern: item.pattern,
    fabric: item.fabric,
    size: item.size,
    formality: item.formality,
    seasonality: item.seasonality.join(", "),
    status: item.status === "processing" ? "needs_review" : item.status,
  };
}

export function WardrobeGrid({ items }: { items: WardrobeItem[] }) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState(items);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WardrobeDraft | null>(null);
  const [busyAction, setBusyAction] = useState<"save" | "delete" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => localItems.find((item) => item.id === selectedId) ?? null,
    [localItems, selectedId],
  );

  const openEditor = (item: WardrobeItem) => {
    setSelectedId(item.id);
    setDraft(createDraft(item));
    setStatusMessage(null);
  };

  const closeEditor = () => {
    setSelectedId(null);
    setDraft(null);
    setBusyAction(null);
    setStatusMessage(null);
  };

  const saveItem = async () => {
    if (!selectedItem || !draft) {
      return;
    }

    setBusyAction("save");
    setStatusMessage("Saving changes...");

    const payload = {
      name: draft.name.trim(),
      category: draft.category.trim(),
      subcategory: draft.subcategory.trim(),
      colors: draft.colors
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      pattern: draft.pattern.trim(),
      fabric: draft.fabric.trim(),
      size: draft.size.trim(),
      formality: draft.formality,
      seasonality: draft.seasonality
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      status: draft.status,
    };

    try {
      const response = await fetch(`/api/items/${selectedItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      const data = (await response.json()) as { item: WardrobeItem };
      setLocalItems((current) =>
        current.map((item) => (item.id === data.item.id ? data.item : item)),
      );
      setStatusMessage("Saved.");
      router.refresh();
    } catch {
      setStatusMessage("Could not save changes.");
    } finally {
      setBusyAction(null);
    }
  };

  const deleteItem = async () => {
    if (!selectedItem) {
      return;
    }

    const confirmed = window.confirm(`Delete ${selectedItem.name} from your wardrobe?`);

    if (!confirmed) {
      return;
    }

    setBusyAction("delete");
    setStatusMessage("Deleting item...");

    try {
      const response = await fetch(`/api/items/${selectedItem.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setLocalItems((current) => current.filter((item) => item.id !== selectedItem.id));
      closeEditor();
      router.refresh();
    } catch {
      setBusyAction(null);
      setStatusMessage("Could not delete this item.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {localItems.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-[1.6rem] border border-white/12 bg-[rgba(255,255,255,0.06)]"
          >
            <button
              type="button"
              onClick={() => openEditor(item)}
              className="block w-full text-left"
            >
              <div className="aspect-[0.82] overflow-hidden bg-[rgba(255,255,255,0.04)]">
                {item.asset?.isolatedPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.asset.isolatedPath}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--text-soft)]">
                    No preview
                  </div>
                )}
              </div>

              <div className="space-y-3 p-3.5">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold tracking-tight text-[var(--text-strong)]">
                      {item.name}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-[0.62rem] uppercase tracking-[0.18em]",
                        item.status === "active"
                          ? "bg-[var(--accent)]/18 text-[var(--accent)]"
                          : "bg-white/8 text-[var(--text-soft)]",
                      )}
                    >
                      {item.status === "needs_review" ? "Review" : titleCase(item.status)}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-soft)]">
                    {titleCase(item.category)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.colors.slice(0, 2).map((color) => (
                    <span
                      key={color}
                      className="rounded-full border border-white/10 px-2 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-[var(--text-soft)]"
                    >
                      {color}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-soft)]">
                  <span>{item.fabric}</span>
                  <span>{formatWearDate(item.lastWornAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--text-soft)]">
                  <Pencil className="h-3.5 w-3.5" />
                  Tap to edit or delete
                </div>
              </div>
            </button>
          </article>
        ))}
      </div>

      {selectedItem && draft ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-white/12 bg-[var(--canvas-soft)] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--text-soft)]">
                  Wardrobe item
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-[var(--text-strong)]">
                  Edit {selectedItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-white/10 p-2 text-[var(--text-soft)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block space-y-2">
                <span className="text-sm text-[var(--text-soft)]">Name</span>
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, name: event.target.value } : current,
                    )
                  }
                  className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2">
                  <span className="text-sm text-[var(--text-soft)]">Category</span>
                  <input
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((current) =>
                        current ? { ...current, category: event.target.value } : current,
                      )
                    }
                    className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-[var(--text-soft)]">Subcategory</span>
                  <input
                    value={draft.subcategory}
                    onChange={(event) =>
                      setDraft((current) =>
                        current ? { ...current, subcategory: event.target.value } : current,
                      )
                    }
                    className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2">
                  <span className="text-sm text-[var(--text-soft)]">Fabric</span>
                  <input
                    value={draft.fabric}
                    onChange={(event) =>
                      setDraft((current) =>
                        current ? { ...current, fabric: event.target.value } : current,
                      )
                    }
                    className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-[var(--text-soft)]">Size</span>
                  <input
                    value={draft.size}
                    onChange={(event) =>
                      setDraft((current) =>
                        current ? { ...current, size: event.target.value } : current,
                      )
                    }
                    className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm text-[var(--text-soft)]">Colors</span>
                <input
                  value={draft.colors}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, colors: event.target.value } : current,
                    )
                  }
                  className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-[var(--text-soft)]">Pattern</span>
                <input
                  value={draft.pattern}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, pattern: event.target.value } : current,
                    )
                  }
                  className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-[var(--text-soft)]">Seasonality</span>
                <input
                  value={draft.seasonality}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, seasonality: event.target.value } : current,
                    )
                  }
                  className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-2">
                  <span className="text-sm text-[var(--text-soft)]">Formality</span>
                  <select
                    value={draft.formality}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              formality: event.target.value as WardrobeDraft["formality"],
                            }
                          : current,
                      )
                    }
                    className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                  >
                    <option value="casual">Casual</option>
                    <option value="smart-casual">Smart casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-[var(--text-soft)]">Status</span>
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? {
                              ...current,
                              status: event.target.value as WardrobeDraft["status"],
                            }
                          : current,
                      )
                    }
                    className="w-full rounded-[1.1rem] border border-white/12 bg-black/12 px-4 py-3 text-sm text-[var(--text-strong)] outline-none"
                  >
                    <option value="needs_review">Needs review</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  void saveItem();
                }}
                disabled={busyAction !== null}
                className="rounded-[1.2rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-ink)] disabled:opacity-70"
              >
                {busyAction === "save" ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  void deleteItem();
                }}
                disabled={busyAction !== null}
                className="flex items-center justify-center gap-2 rounded-[1.2rem] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 disabled:opacity-70"
              >
                <Trash2 className="h-4 w-4" />
                {busyAction === "delete" ? "Deleting..." : "Delete"}
              </button>
            </div>

            {statusMessage ? (
              <p className="mt-4 text-sm text-[var(--text-soft)]">{statusMessage}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
