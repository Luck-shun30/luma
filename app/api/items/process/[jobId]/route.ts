import { NextResponse } from "next/server";

import { toApiErrorResponse } from "@/lib/api/errors";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { getProcessingJob } from "@/lib/data/repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;
    const user = await requireCurrentUserContext();
    const job = await getProcessingJob(user.userId, jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      resultItemIds: job.resultItemIds,
      errorMessage: job.errorMessage,
    });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
