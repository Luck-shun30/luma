import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { processWardrobeItemFunction } from "@/inngest/functions/process-item";
import { scheduleDailyOutfitFunction } from "@/inngest/functions/schedule-daily-outfit";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processWardrobeItemFunction, scheduleDailyOutfitFunction],
});
