import { NextResponse } from "next/server";

import { toApiErrorResponse } from "@/lib/api/errors";
import { wardrobeItemPatchSchema } from "@/lib/ai/schemas";
import { requireCurrentUserContext } from "@/lib/auth/session";
import { deleteWardrobeItem, updateWardrobeItem } from "@/lib/data/repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireCurrentUserContext();
    const payload = wardrobeItemPatchSchema.parse(await request.json());
    const item = await updateWardrobeItem(user.userId, id, payload);

    if (!item) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireCurrentUserContext();
    const deleted = await deleteWardrobeItem(user.userId, id);

    if (!deleted) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toApiErrorResponse(error);
  }
}
