import { NextResponse } from "next/server";

import { toApiErrorResponse } from "@/lib/api/errors";
import { feedbackRequestSchema } from "@/lib/ai/schemas";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { recordFeedback } from "@/lib/data/repository";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireCurrentUserContext();
    const payload = feedbackRequestSchema.parse(await request.json());

    const feedback = await recordFeedback({
      id: crypto.randomUUID(),
      userId: user.userId,
      targetType: "outfit",
      targetId: id,
      reaction: payload.reaction,
      reasonCode: payload.reasonCode,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
