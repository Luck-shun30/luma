import { CheckCircle2, Sparkles } from "lucide-react";

import { CaptureUploader } from "@/components/capture-uploader";
import { SectionCard } from "@/components/section-card";

export default function CapturePage() {
  return (
    <>
      <SectionCard
        eyebrow="Capture"
        title="Build your digital wardrobe"
        description="Shoot pieces in natural light, keep the garment centered, and let the ingestion pipeline handle extraction and tagging."
      >
        <CaptureUploader />
      </SectionCard>

      <SectionCard
        eyebrow="Tips"
        title="Fastest path to clean AI results"
        description="These are the guardrails the capture flow is optimized around."
      >
        <div className="space-y-3">
          {[
            "Use one item per frame whenever possible.",
            "Hang or lay the garment flat so edges are visible.",
            "Include labels only when size detection matters.",
          ].map((tip) => (
            <div
              key={tip}
              className="flex items-start gap-3 rounded-[1.3rem] border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6 text-[var(--text-soft)]"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-soft)]">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          Gemini segmentation is conservative on size and hidden details by design.
        </div>
      </SectionCard>
    </>
  );
}
