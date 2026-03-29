import { NextResponse } from "next/server";

import { toApiErrorResponse } from "@/lib/api/errors";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { processWardrobeUpload } from "@/lib/wardrobe/process";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUserContext();
    const formData = await request.formData();
    const file = formData.get("file");
    const captureMode = String(formData.get("captureMode") ?? "single-item");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A photo file is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processWardrobeUpload({
      userId: user.userId,
      fileName: file.name || "wardrobe-upload.jpg",
      mimeType: file.type || "image/jpeg",
      captureMode,
      buffer,
    });

    return NextResponse.json(result);
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
