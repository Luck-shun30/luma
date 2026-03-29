import { INGEST_PROMPT_VERSION } from "@/lib/ai/prompts/ingest";
import { buildItemName, buildPromptUsage, extractWardrobeGarments } from "@/lib/ai/gemini";
import {
  createProcessingJob,
  insertProcessedWardrobeItem,
  saveAiRun,
  updateProcessingJob,
} from "@/lib/data/repository";
import { persistDerivedGarmentAssets, persistOriginalAsset } from "@/lib/storage/index";
import type { ProcessingJob, WardrobeAsset, WardrobeItem } from "@/lib/types";

function normalizeProcessingError(error: unknown) {
  const raw = error instanceof Error ? error.message : "Item processing failed.";

  try {
    const parsed = JSON.parse(raw) as {
      error?: {
        message?: string;
      };
    };

    return parsed.error?.message ?? raw;
  } catch {
    return raw;
  }
}

export async function processWardrobeUpload(params: {
  userId: string;
  fileName: string;
  mimeType: string;
  captureMode?: string;
  buffer: Buffer;
}) {
  const now = new Date().toISOString();
  const jobId = crypto.randomUUID();
  const sourcePath = await persistOriginalAsset({
    itemId: jobId,
    fileName: params.fileName,
    mimeType: params.mimeType,
    buffer: params.buffer,
  });

  const job: ProcessingJob = {
    id: jobId,
    userId: params.userId,
    status: "queued",
    captureMode: params.captureMode ?? "single-item",
    fileName: params.fileName,
    mimeType: params.mimeType,
    sourcePath,
    resultItemIds: [],
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
  };

  await createProcessingJob(job);
  await updateProcessingJob(jobId, {
    userId: params.userId,
    status: "processing",
    updatedAt: new Date().toISOString(),
  });

  const startedAt = Date.now();

  try {
    const extraction = await extractWardrobeGarments({
      buffer: params.buffer,
      mimeType: params.mimeType,
      fileName: params.fileName,
      captureMode: params.captureMode,
    });

    const createdItems: WardrobeItem[] = [];

    for (const garment of extraction.garments) {
      const itemId = crypto.randomUUID();
      const derived = await persistDerivedGarmentAssets({
        itemId,
        sourceBuffer: params.buffer,
        mask: garment.mask,
        box2d: garment.box_2d,
      });

      const requiresReview =
        extraction.garments.length > 1 ||
        Object.values(garment.confidence).some((value) => value < 0.7);

      const item: WardrobeItem = {
        id: itemId,
        userId: params.userId,
        status: requiresReview ? "needs_review" : "active",
        name: buildItemName(garment.label, garment.colors),
        category: garment.category,
        subcategory: garment.subcategory,
        colors: garment.colors,
        pattern: garment.pattern,
        fabric: garment.fabric,
        size: garment.size_source === "visible_label" ? garment.size : "",
        formality: garment.formality,
        seasonality: garment.seasonality,
        layerRole: garment.layer_role,
        occasionTags: garment.occasion_tags,
        styleTags: garment.style_tags,
        wearCount: 0,
        lastWornAt: null,
        favoriteScore: 0,
        dislikeScore: 0,
        confidence: garment.confidence,
        sourcePromptVersion: INGEST_PROMPT_VERSION,
        createdAt: new Date().toISOString(),
      };

      const asset: WardrobeAsset = {
        id: crypto.randomUUID(),
        itemId,
        originalPath: sourcePath,
        croppedPath: derived.croppedPath,
        isolatedPath: derived.isolatedPath,
        maskPath: derived.maskPath,
        bbox: derived.bbox,
        qualityFlags: requiresReview ? ["needs_review"] : [],
      };

      await insertProcessedWardrobeItem({ item, asset });
      createdItems.push({ ...item, asset });
    }

    const completedAt = new Date().toISOString();

    await updateProcessingJob(jobId, {
      userId: params.userId,
      status: "completed",
      resultItemIds: createdItems.map((item) => item.id),
      updatedAt: completedAt,
    });

    await saveAiRun({
      id: crypto.randomUUID(),
      userId: params.userId,
      runType: "ingest",
      model: "gemini-2.5-flash",
      promptVersion: INGEST_PROMPT_VERSION,
      input: {
        fileName: params.fileName,
        captureMode: params.captureMode ?? "single-item",
      },
      output: {
        garments: createdItems.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
        })),
      },
      latencyMs: Date.now() - startedAt,
      tokenUsage: buildPromptUsage(params.fileName),
      status: "succeeded",
      createdAt: completedAt,
    });

    return {
      jobId,
      status: "completed" as const,
      resultItemIds: createdItems.map((item) => item.id),
    };
  } catch (error) {
    const message = normalizeProcessingError(error);

    await updateProcessingJob(jobId, {
      userId: params.userId,
      status: "failed",
      errorMessage: message,
      updatedAt: new Date().toISOString(),
    });

    await saveAiRun({
      id: crypto.randomUUID(),
      userId: params.userId,
      runType: "ingest",
      model: "gemini-2.5-flash",
      promptVersion: INGEST_PROMPT_VERSION,
      input: {
        fileName: params.fileName,
      },
      output: {
        error: message,
      },
      latencyMs: Date.now() - startedAt,
      tokenUsage: buildPromptUsage(params.fileName),
      status: "failed",
      createdAt: new Date().toISOString(),
    });

    return {
      jobId,
      status: "failed" as const,
      errorMessage: message,
    };
  }
}
