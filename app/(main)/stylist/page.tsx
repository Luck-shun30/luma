import { SectionCard } from "@/components/section-card";
import { StylistChat } from "@/components/stylist-chat";
import { getCurrentUserContext } from "@/lib/auth/session";
import {
  getOrCreateStylistThread,
  getStyleProfile,
  listStylistMessages,
} from "@/lib/data/repository";

export default async function StylistPage() {
  const user = await getCurrentUserContext();
  const [profile, thread] = await Promise.all([
    getStyleProfile(user.userId),
    getOrCreateStylistThread(user.userId),
  ]);
  const messages = await listStylistMessages(thread.id);

  return (
    <>
      <SectionCard
        eyebrow="Stylist"
        title="Ask for outfit help in plain language"
        description="This assistant is grounded in your wardrobe, weather, and feedback history."
      >
        <p className="text-sm leading-6 text-[var(--text-soft)]">
          Current model summary: {profile.structuredTraits.summary}
        </p>
      </SectionCard>
      <StylistChat threadId={thread.id} initialMessages={messages} />
    </>
  );
}
