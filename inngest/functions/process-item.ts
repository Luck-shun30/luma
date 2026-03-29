import { inngest } from "@/inngest/client";

export const processWardrobeItemFunction = inngest.createFunction(
  {
    id: "process-wardrobe-item",
    triggers: {
      event: "luma/item.process.requested",
    },
  },
  async ({ event, step }) => {
    await step.run("record-payload", async () => event.data);

    return {
      ok: true,
      jobId: event.data.jobId,
      note:
        "This worker is wired and ready. The route handler still processes inline when Inngest keys are absent.",
    };
  },
);
