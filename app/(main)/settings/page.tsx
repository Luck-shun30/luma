import { BellRing, MapPin, TimerReset } from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { getCurrentUserContext } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/data/repository";

export default async function SettingsPage() {
  const user = await getCurrentUserContext();
  const profile = await getUserProfile(user.userId);

  return (
    <>
      <SectionCard
        eyebrow="Settings"
        title="Daily generation defaults"
        description="These settings shape how the scheduler and weather context behave."
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-black/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-sm text-[var(--text-strong)]">Home base</span>
            </div>
            <span className="text-sm text-[var(--text-soft)]">
              {profile.homeLat?.toFixed(2)}, {profile.homeLng?.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-black/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <TimerReset className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-sm text-[var(--text-strong)]">Morning run</span>
            </div>
            <span className="text-sm text-[var(--text-soft)]">7:00 AM local</span>
          </div>
          <div className="flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-black/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <BellRing className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-sm text-[var(--text-strong)]">Notifications</span>
            </div>
            <span className="text-sm text-[var(--text-soft)]">Stored in-app</span>
          </div>
        </div>
      </SectionCard>
    </>
  );
}
