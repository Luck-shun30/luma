import sharp from "sharp";

import { getSupabaseAdminMaybe } from "@/lib/supabase/admin";
import type { BoundingBox } from "@/lib/types";
import { clamp } from "@/lib/utils";

const WARDROBE_BUCKET = "wardrobe";

function bufferToDataUrl(buffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function parseMaskDataUri(mask: string) {
  const prefix = "data:image/png;base64,";

  if (!mask.startsWith(prefix)) {
    return null;
  }

  return Buffer.from(mask.slice(prefix.length), "base64");
}

function toPixelBox(box: [number, number, number, number], width: number, height: number) {
  const y0 = clamp(Math.floor((box[0] / 1000) * height), 0, height - 1);
  const x0 = clamp(Math.floor((box[1] / 1000) * width), 0, width - 1);
  const y1 = clamp(Math.ceil((box[2] / 1000) * height), y0 + 1, height);
  const x1 = clamp(Math.ceil((box[3] / 1000) * width), x0 + 1, width);

  return {
    left: x0,
    top: y0,
    width: x1 - x0,
    height: y1 - y0,
    bbox: {
      y0: box[0],
      x0: box[1],
      y1: box[2],
      x1: box[3],
    } satisfies BoundingBox,
  };
}

async function persistAsset(path: string, buffer: Buffer, mimeType: string) {
  const admin = getSupabaseAdminMaybe();

  if (!admin) {
    return bufferToDataUrl(buffer, mimeType);
  }

  const upload = await admin.storage.from(WARDROBE_BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: true,
  });

  if (upload.error) {
    return bufferToDataUrl(buffer, mimeType);
  }

  const publicUrl = admin.storage.from(WARDROBE_BUCKET).getPublicUrl(path).data.publicUrl;
  return publicUrl;
}

export async function persistOriginalAsset(params: {
  itemId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const safeFileName = params.fileName.replace(/[^a-zA-Z0-9.-]/g, "-");
  return persistAsset(
    `${params.itemId}/original-${Date.now()}-${safeFileName}`,
    params.buffer,
    params.mimeType,
  );
}

export async function persistDerivedGarmentAssets(params: {
  itemId: string;
  sourceBuffer: Buffer;
  mask: string;
  box2d: [number, number, number, number];
}) {
  const metadata = await sharp(params.sourceBuffer).metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 1024;
  const pixelBox = toPixelBox(params.box2d, width, height);

  const cropped = await sharp(params.sourceBuffer)
    .extract({
      left: pixelBox.left,
      top: pixelBox.top,
      width: pixelBox.width,
      height: pixelBox.height,
    })
    .png()
    .toBuffer();

  let isolated = cropped;
  const maskBuffer = parseMaskDataUri(params.mask);
  let safeMaskBuffer: Buffer | null = null;

  if (maskBuffer) {
    try {
      const resizedMask = await sharp(maskBuffer)
        .resize(pixelBox.width, pixelBox.height)
        .ensureAlpha()
        .extractChannel("alpha")
        .toBuffer();

      isolated = await sharp(cropped)
        .ensureAlpha()
        .joinChannel(resizedMask)
        .png()
        .toBuffer();
      safeMaskBuffer = maskBuffer;
    } catch {
      safeMaskBuffer = null;
    }
  }

  const croppedUrl = await persistAsset(
    `${params.itemId}/cropped-${Date.now()}.png`,
    cropped,
    "image/png",
  );
  const isolatedUrl = await persistAsset(
    `${params.itemId}/isolated-${Date.now()}.png`,
    isolated,
    "image/png",
  );
  const maskUrl = safeMaskBuffer
    ? await persistAsset(`${params.itemId}/mask-${Date.now()}.png`, safeMaskBuffer, "image/png")
    : isolatedUrl;

  return {
    croppedPath: croppedUrl,
    isolatedPath: isolatedUrl,
    maskPath: maskUrl,
    bbox: pixelBox.bbox,
  };
}
