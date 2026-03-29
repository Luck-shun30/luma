import { Inngest } from "inngest";

import { env } from "@/lib/env";

export const inngest = new Inngest({
  id: "luma-ai-first-pwa",
  eventKey: env.INNGEST_EVENT_KEY,
});
