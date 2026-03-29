"use client";

import { Camera, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type JobResponse = {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  resultItemIds?: string[];
  errorMessage?: string | null;
};

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "Upload failed.";
  } catch {
    return "Upload failed.";
  }
}

export function CaptureUploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState<JobResponse | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") {
      return;
    }

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/items/process/${job.jobId}`);

      if (!response.ok) {
        return;
      }

      const next = (await response.json()) as JobResponse;
      setJob(next);

      if (next.status === "completed") {
        router.refresh();
        setStatus(`Processed ${next.resultItemIds?.length ?? 0} item(s). Head to Wardrobe to review.`);
      }

      if (next.status === "failed") {
        setStatus(next.errorMessage ?? "Processing failed.");
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [job, router]);

  const handleSubmit = async () => {
    if (!file) {
      setStatus("Pick a clothing photo first.");
      return;
    }

    setJob(null);
    setStatus("Uploading and processing your item...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("captureMode", "single-item");

    try {
      const response = await fetch("/api/items/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const payload = (await response.json()) as JobResponse;
      setJob(payload);

      if (payload.status === "completed") {
        router.refresh();
        setStatus(`Processed ${payload.resultItemIds?.length ?? 0} item(s).`);
      } else if (payload.status === "failed") {
        setStatus(payload.errorMessage ?? "Processing failed.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    }
  };

  return (
    <div className="space-y-4">
      <label className="block cursor-pointer rounded-[1.8rem] border border-dashed border-white/18 bg-black/10 p-5 transition hover:border-[var(--accent)]">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-white/8 p-4">
            <Camera className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-base font-semibold text-[var(--text-strong)]">
              Photograph a clothing item
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
              One item per photo works best, but the ingestion flow can split multiple garments if needed.
            </p>
          </div>
        </div>
      </label>

      {previewUrl ? (
        <div className="overflow-hidden rounded-[1.8rem] border border-white/12 bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Wardrobe preview" className="h-80 w-full object-cover" />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          startTransition(() => {
            void handleSubmit();
          });
        }}
        className="flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:opacity-90"
      >
        {job && ["queued", "processing"].includes(job.status) ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Process item with AI
      </button>

      {job ? (
        <div className="flex items-center gap-2 rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--text-soft)]">
          <RefreshCw className="h-4 w-4" />
          Job `{job.jobId}` is {job.status}.
        </div>
      ) : null}

      {status ? <p className="text-sm leading-6 text-[var(--text-soft)]">{status}</p> : null}
    </div>
  );
}
