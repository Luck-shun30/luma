import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

import {
  garmentExtractionSchema,
  outfitRankingSchema,
  styleSummarySchema,
} from "@/lib/ai/schemas";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompts/chat";
import { buildIngestionPrompt, INGEST_PROMPT_VERSION } from "@/lib/ai/prompts/ingest";
import { buildOutfitPrompt, OUTFIT_PROMPT_VERSION } from "@/lib/ai/prompts/outfit";
import { geminiApiKey, hasGeminiEnv } from "@/lib/env";
import type {
  CandidateOutfit,
  StyleProfile,
  ToolCallRecord,
  WardrobeItem,
  WeatherSnapshot,
} from "@/lib/types";
import { hashToVector, stableHash, titleCase } from "@/lib/utils";

let client: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!hasGeminiEnv) {
    return null;
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: geminiApiKey!,
    });
  }

  return client;
}

async function generateStructured<T>({
  schema,
  model = "gemini-2.5-flash",
  contents,
  systemInstruction,
}: {
  schema: z.ZodType<T>;
  model?: string;
  contents: string | Array<Record<string, unknown>>;
  systemInstruction?: string;
}) {
  const gemini = getGeminiClient();

  if (!gemini) {
    throw new Error("Gemini is not configured.");
  }

  const config = {
    responseMimeType: "application/json",
    thinkingConfig: {
      thinkingBudget: 0,
    },
    ...(systemInstruction ? { systemInstruction } : {}),
  };

  const attempt = async (suffix?: string) => {
    const response = await gemini.models.generateContent({
      model,
      contents:
        typeof contents === "string"
          ? `${contents}${suffix ? `\n\n${suffix}` : ""}`
          : suffix
            ? [
                ...contents,
                {
                  text: suffix,
                },
              ]
            : contents,
      config,
    });

    return schema.parse(JSON.parse(response.text ?? "{}"));
  };

  try {
    return await attempt();
  } catch {
    return attempt("Return valid JSON only. Do not wrap in markdown.");
  }
}

function guessCategory(fileName: string) {
  const lower = fileName.toLowerCase();

  if (lower.includes("jacket") || lower.includes("coat") || lower.includes("blazer")) {
    return {
      label: "Outer layer",
      category: "outerwear",
      subcategory: lower.includes("blazer") ? "blazer" : "jacket",
      layerRole: "outer" as const,
    };
  }

  if (lower.includes("pant") || lower.includes("trouser") || lower.includes("jean")) {
    return {
      label: "Bottom",
      category: "bottom",
      subcategory: lower.includes("jean") ? "jeans" : "trousers",
      layerRole: "base" as const,
    };
  }

  if (lower.includes("dress")) {
    return {
      label: "Dress",
      category: "dress",
      subcategory: "dress",
      layerRole: "full-look" as const,
    };
  }

  if (lower.includes("shoe") || lower.includes("boot") || lower.includes("loafer")) {
    return {
      label: "Shoes",
      category: "shoes",
      subcategory: lower.includes("boot") ? "boots" : "loafers",
      layerRole: "accessory" as const,
    };
  }

  return {
    label: "Top",
    category: "top",
    subcategory: lower.includes("tee") ? "tee" : "shirt",
    layerRole: "base" as const,
  };
}

export async function extractWardrobeGarments(params: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  captureMode?: string;
}) {
  const prompt = buildIngestionPrompt(params);
  const gemini = getGeminiClient();

  if (!gemini) {
    const guess = guessCategory(params.fileName);
    return garmentExtractionSchema.parse({
      garments: [
        {
          label: guess.label,
          category: guess.category,
          subcategory: guess.subcategory,
          colors: ["neutral"],
          pattern: "solid",
          fabric: "unknown",
          size: "",
          size_source: "unknown",
          formality: "casual",
          seasonality: ["spring", "fall"],
          layer_role: guess.layerRole,
          occasion_tags: ["everyday"],
          style_tags: ["clean"],
          confidence: {
            category: 0.56,
            segmentation: 0.48,
          },
          box_2d: [0, 0, 1000, 1000],
          mask: "",
        },
      ],
    });
  }

  return generateStructured({
    schema: garmentExtractionSchema,
    contents: [
      {
        inlineData: {
          mimeType: params.mimeType,
          data: params.buffer.toString("base64"),
        },
      },
      {
        text: prompt,
      },
    ],
  });
}

export async function summarizeStylePreferences(params: {
  freeformPreferences: string;
  inspirationSummaries?: string[];
  explicitLikes?: string[];
  explicitDislikes?: string[];
}) {
  const joinedText = [
    params.freeformPreferences,
    ...(params.inspirationSummaries ?? []),
    `likes: ${(params.explicitLikes ?? []).join(", ")}`,
    `dislikes: ${(params.explicitDislikes ?? []).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!getGeminiClient()) {
    return styleSummarySchema.parse({
      summary: params.freeformPreferences,
      preferred_colors: params.explicitLikes?.filter((entry) => entry.length < 20) ?? [
        "navy",
        "white",
        "charcoal",
      ],
      avoided_colors: params.explicitDislikes ?? [],
      preferred_silhouettes: ["tailored", "easy layer"],
      favorite_categories: ["shirt", "trousers", "outerwear"],
      target_vibes: ["confident", "clean"],
      formality_tendency: "balanced",
      notes: ["Fallback summary used because Gemini is not configured."],
    });
  }

  return generateStructured({
    schema: styleSummarySchema,
    contents: `
Summarize these wardrobe preferences into structured traits for a stylist app.

Return JSON only.
Use this exact shape:
{
  "summary": "string",
  "preferred_colors": ["string"],
  "avoided_colors": ["string"],
  "preferred_silhouettes": ["string"],
  "favorite_categories": ["string"],
  "target_vibes": ["string"],
  "formality_tendency": "relaxed|balanced|polished",
  "notes": ["string"]
}

${joinedText}
    `.trim(),
  });
}

export async function embedStyleText(input: string) {
  const gemini = getGeminiClient();

  if (!gemini) {
    return hashToVector(input, 16);
  }

  const response = await gemini.models.embedContent({
    model: "gemini-embedding-001",
    contents: input,
    config: {
      outputDimensionality: 768,
    },
  });

  const embeddings = response.embeddings as Array<{ values?: number[] }>;

  return embeddings[0]?.values ?? hashToVector(input, 16);
}

export async function rerankOutfitsWithGemini(params: {
  candidates: CandidateOutfit[];
  wardrobeItems: WardrobeItem[];
  styleProfile: StyleProfile;
  weather: WeatherSnapshot;
  vibePrompt?: string;
}) {
  if (!getGeminiClient()) {
    return outfitRankingSchema.parse({
      primary_candidate_id: params.candidates[0]?.id ?? "",
      alternate_candidate_ids: params.candidates.slice(1, 3).map((entry) => entry.id),
      reasoning: params.candidates[0]?.notes ?? ["Used deterministic fallback ordering."],
      confidence: 0.74,
    });
  }

  const itemMap = new Map(params.wardrobeItems.map((item) => [item.id, item]));

  return generateStructured({
    schema: outfitRankingSchema,
    contents: buildOutfitPrompt({
      weather: params.weather,
      styleProfile: params.styleProfile,
      candidates: params.candidates,
      itemMap,
      vibePrompt: params.vibePrompt,
    }),
  });
}

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

export async function runStylistAssistant(params: {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  contextSummary: string;
  toolHandlers: Record<string, ToolHandler>;
}) {
  const gemini = getGeminiClient();

  if (!gemini) {
    return {
      reply:
        "I can work from your saved wardrobe and feedback once Gemini is configured. For now, lean on your tailored layers and keep the palette neutral if you want a fast polished look.",
      toolCalls: [] as ToolCallRecord[],
      promptVersion: "fallback",
      model: "fallback",
    };
  }

  const tools = [
    {
      functionDeclarations: [
        {
          name: "searchWardrobe",
          description: "Search the user's wardrobe items by query or vibe.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              query: {
                type: Type.STRING,
              },
            },
            required: ["query"],
          },
        },
        {
          name: "getWeatherContext",
          description: "Get today's weather summary for outfit decisions.",
          parameters: {
            type: Type.OBJECT,
            properties: {},
          },
        },
        {
          name: "generateOutfit",
          description: "Generate a new outfit suggestion from the saved wardrobe.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              vibePrompt: {
                type: Type.STRING,
              },
            },
          },
        },
        {
          name: "savePreference",
          description: "Persist a new style preference or dislike.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              preference: {
                type: Type.STRING,
              },
            },
            required: ["preference"],
          },
        },
        {
          name: "listRecentFeedback",
          description: "Retrieve recent likes, dislikes, and swap reasons.",
          parameters: {
            type: Type.OBJECT,
            properties: {},
          },
        },
      ],
    },
  ] as const;

  const contents = [
    ...params.history.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    })),
    {
      role: "user",
      parts: [{ text: params.message }],
    },
  ];

  const initial = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: `${CHAT_SYSTEM_PROMPT}\n\nKnown context:\n${params.contextSummary}`,
      tools: tools as never,
    },
  });

  const functionCalls = (initial.functionCalls ?? []) as Array<{
    name?: string;
    args?: Record<string, unknown>;
  }>;

  if (!functionCalls.length) {
    return {
      reply: initial.text ?? "I found a grounded wardrobe answer, but it came back empty.",
      toolCalls: [] as ToolCallRecord[],
      promptVersion: "luma-chat-v1",
      model: "gemini-2.5-flash",
    };
  }

  const executed: ToolCallRecord[] = [];

  for (const call of functionCalls.slice(0, 4)) {
    const name = call.name ?? "unknown";
    const args = call.args ?? {};
    const handler = params.toolHandlers[name];
    const result = handler
      ? await handler(args)
      : {
          error: `No tool handler registered for ${name}`,
        };

    executed.push({ name, args, result });
  }

  const final = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      ...contents,
      initial.candidates?.[0]?.content ?? {
        role: "model",
        parts: [{ text: initial.text }],
      },
      {
        role: "user",
        parts: executed.map((record) => ({
          functionResponse: {
            name: record.name,
            response: {
              output: record.result as Record<string, unknown>,
            },
          },
        })),
      },
    ],
    config: {
      systemInstruction: `${CHAT_SYSTEM_PROMPT}\n\nKnown context:\n${params.contextSummary}`,
      tools: tools as never,
    },
  });

  return {
    reply: final.text ?? initial.text ?? "I can help once the tool responses are available.",
    toolCalls: executed,
    promptVersion: "luma-chat-v1",
    model: "gemini-2.5-flash",
  };
}

export function buildItemName(label: string, colors: string[]) {
  const base = titleCase(label.trim());
  const colorPrefix = colors[0] ? `${titleCase(colors[0])} ` : "";
  return `${colorPrefix}${base}`.trim();
}

export function buildFallbackReasoning(candidateId: string) {
  return [
    `Candidate ${candidateId} won because it balanced structure, weather fit, and novelty.`,
  ];
}

export function buildPromptUsage(input: string) {
  const tokenEstimate = Math.max(20, Math.ceil(input.length / 4));

  return {
    prompt_tokens: tokenEstimate,
    completion_tokens: Math.ceil(tokenEstimate * 0.45),
    total_tokens: Math.ceil(tokenEstimate * 1.45),
    checksum: stableHash(input),
    ingest_version: INGEST_PROMPT_VERSION,
    outfit_version: OUTFIT_PROMPT_VERSION,
  };
}
