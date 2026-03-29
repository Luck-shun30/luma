import { inngest } from "@/inngest/client";

export const scheduleDailyOutfitFunction = inngest.createFunction(
  {
    id: "schedule-daily-outfit",
    triggers: {
      cron: "TZ=America/Chicago 0 7 * * *",
    },
  },
  async ({ step }) => {
    await step.run("queue-daily-outfit", async () => ({
      ok: true,
      queuedAt: new Date().toISOString(),
    }));

    return {
      ok: true,
    };
  },
);
