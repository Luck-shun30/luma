import Link from "next/link";
import { ArrowRight, Camera, Images, Sparkles } from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { StyleProfileForm } from "@/components/style-profile-form";
import { getCurrentUserContext } from "@/lib/auth/session";
import { getStyleProfile } from "@/lib/data/repository";

const steps = [
  {
    title: "Basic profile",
    body: "Confirm location and timezone so weather-aware recommendations start with the right context.",
    icon: Sparkles,
  },
  {
    title: "Style preferences",
    body: "Describe the silhouettes, moods, and categories you naturally reach for.",
    icon: Sparkles,
  },
  {
    title: "Inspiration",
    body: "Later, add image references to shape embeddings and style summaries.",
    icon: Images,
  },
  {
    title: "Wardrobe capture",
    body: "Start feeding the closet one photo at a time and review the model’s extracted tags.",
    icon: Camera,
  },
];

export default async function OnboardingPage() {
  const user = await getCurrentUserContext();
  const profile = await getStyleProfile(user.userId);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-12 pt-6">
      <SectionCard
        eyebrow="Onboarding"
        title="Set up the AI styling loop"
        description="This flow seeds the parts of Luma that matter for the AI-first MVP: taste, context, and a usable wardrobe."
      >
        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex gap-3 rounded-[1.4rem] border border-white/10 bg-black/10 px-4 py-3"
              >
                <div className="rounded-full bg-white/8 p-2">
                  <Icon className="h-4 w-4 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-strong)]">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Preferences"
        title="Save your baseline style"
        description="This data is summarized and embedded before feeding the outfit ranker."
      >
        <StyleProfileForm initialProfile={profile} />
      </SectionCard>

      <Link
        href="/capture"
        className="flex items-center justify-center gap-2 rounded-[1.5rem] bg-[var(--accent)] px-4 py-4 text-sm font-semibold text-[var(--accent-ink)]"
      >
        Continue to wardrobe capture
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
