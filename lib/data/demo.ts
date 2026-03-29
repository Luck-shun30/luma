import type {
  DemoState,
  OutfitSuggestion,
  StyleProfile,
  StylistMessage,
  StylistThread,
  WardrobeAsset,
  WardrobeItem,
} from "@/lib/types";
import { createSvgDataUri, hashToVector } from "@/lib/utils";

const DEMO_USER_ID = "demo-user";
const TODAY = new Date().toISOString().slice(0, 10);

declare global {
  var __lumaDemoState: DemoState | undefined;
}

function createAsset(
  id: string,
  itemId: string,
  title: string,
  subtitle: string,
  background: string,
): WardrobeAsset {
  const image = createSvgDataUri({ title, subtitle, background });

  return {
    id,
    itemId,
    originalPath: image,
    croppedPath: image,
    isolatedPath: image,
    maskPath: image,
    bbox: {
      y0: 0,
      x0: 0,
      y1: 1000,
      x1: 1000,
    },
    qualityFlags: [],
  };
}

function createItem(
  item: Omit<WardrobeItem, "userId" | "createdAt" | "sourcePromptVersion">,
): WardrobeItem {
  return {
    ...item,
    userId: DEMO_USER_ID,
    sourcePromptVersion: "demo-seed",
    createdAt: "2026-03-28T09:00:00.000Z",
  };
}

function buildInitialState(): DemoState {
  const items: WardrobeItem[] = [
    createItem({
      id: "item-blazer",
      status: "active",
      name: "Midnight blazer",
      category: "outerwear",
      subcategory: "blazer",
      colors: ["navy"],
      pattern: "solid",
      fabric: "wool blend",
      size: "M",
      formality: "smart-casual",
      seasonality: ["spring", "fall"],
      layerRole: "outer",
      occasionTags: ["work", "dinner"],
      styleTags: ["tailored", "clean"],
      wearCount: 7,
      lastWornAt: "2026-03-21T08:00:00.000Z",
      favoriteScore: 4,
      dislikeScore: 0,
      confidence: {
        category: 0.99,
        colors: 0.97,
      },
    }),
    createItem({
      id: "item-shirt",
      status: "active",
      name: "Cloud button-down",
      category: "top",
      subcategory: "shirt",
      colors: ["white"],
      pattern: "solid",
      fabric: "cotton",
      size: "M",
      formality: "smart-casual",
      seasonality: ["spring", "summer", "fall"],
      layerRole: "base",
      occasionTags: ["work", "travel"],
      styleTags: ["crisp", "minimal"],
      wearCount: 11,
      lastWornAt: "2026-03-24T08:00:00.000Z",
      favoriteScore: 5,
      dislikeScore: 0,
      confidence: {
        category: 0.98,
        colors: 0.98,
      },
    }),
    createItem({
      id: "item-knit",
      status: "active",
      name: "Clay merino knit",
      category: "top",
      subcategory: "sweater",
      colors: ["camel"],
      pattern: "solid",
      fabric: "merino",
      size: "M",
      formality: "casual",
      seasonality: ["fall", "winter", "spring"],
      layerRole: "mid",
      occasionTags: ["weekend", "coffee"],
      styleTags: ["soft", "layered"],
      wearCount: 5,
      lastWornAt: "2026-03-18T08:00:00.000Z",
      favoriteScore: 3,
      dislikeScore: 0,
      confidence: {
        category: 0.96,
        colors: 0.95,
      },
    }),
    createItem({
      id: "item-trousers",
      status: "active",
      name: "Graphite trousers",
      category: "bottom",
      subcategory: "trousers",
      colors: ["charcoal"],
      pattern: "solid",
      fabric: "twill",
      size: "32",
      formality: "smart-casual",
      seasonality: ["spring", "fall", "winter"],
      layerRole: "base",
      occasionTags: ["work", "travel"],
      styleTags: ["clean", "tailored"],
      wearCount: 10,
      lastWornAt: "2026-03-25T08:00:00.000Z",
      favoriteScore: 4,
      dislikeScore: 0,
      confidence: {
        category: 0.99,
        colors: 0.98,
      },
    }),
    createItem({
      id: "item-loafers",
      status: "active",
      name: "Onyx loafers",
      category: "shoes",
      subcategory: "loafers",
      colors: ["black"],
      pattern: "solid",
      fabric: "leather",
      size: "10",
      formality: "smart-casual",
      seasonality: ["spring", "summer", "fall"],
      layerRole: "accessory",
      occasionTags: ["work", "dinner"],
      styleTags: ["sleek"],
      wearCount: 8,
      lastWornAt: "2026-03-20T08:00:00.000Z",
      favoriteScore: 4,
      dislikeScore: 0,
      confidence: {
        category: 0.98,
        colors: 0.99,
      },
    }),
    createItem({
      id: "item-watch",
      status: "active",
      name: "Steel watch",
      category: "accessory",
      subcategory: "watch",
      colors: ["silver"],
      pattern: "solid",
      fabric: "steel",
      size: "",
      formality: "smart-casual",
      seasonality: ["spring", "summer", "fall", "winter"],
      layerRole: "accessory",
      occasionTags: ["work", "date-night"],
      styleTags: ["refined"],
      wearCount: 14,
      lastWornAt: "2026-03-26T08:00:00.000Z",
      favoriteScore: 5,
      dislikeScore: 0,
      confidence: {
        category: 0.97,
        colors: 0.97,
      },
    }),
  ];

  const assets: WardrobeAsset[] = [
    createAsset("asset-blazer", "item-blazer", "Blazer", "Structured layer", "#1b2a49"),
    createAsset("asset-shirt", "item-shirt", "Shirt", "Everyday crisp", "#3f72af"),
    createAsset("asset-knit", "item-knit", "Knit", "Soft texture", "#9c6644"),
    createAsset("asset-trousers", "item-trousers", "Trousers", "Clean line", "#2c363f"),
    createAsset("asset-loafers", "item-loafers", "Loafers", "Easy polish", "#111827"),
    createAsset("asset-watch", "item-watch", "Watch", "Subtle detail", "#64748b"),
  ];

  const styleProfile: StyleProfile = {
    userId: DEMO_USER_ID,
    freeformPreferences:
      "Polished but approachable. Prefer neutrals, tailored layers, and looks that work for meetings and coffee runs.",
    structuredTraits: {
      summary:
        "A tailored wardrobe built around clean neutrals, sharp layers, and quiet confidence.",
      preferredColors: ["navy", "white", "charcoal", "camel"],
      avoidedColors: ["neon", "purple"],
      preferredSilhouettes: ["tailored", "relaxed-structured"],
      favoriteCategories: ["blazer", "shirt", "trousers", "loafers"],
      targetVibes: ["confident", "professional", "clean"],
      formalityTendency: "polished",
      notes: [
        "Likes sharp layers in the morning.",
        "Prefers outfits that can move from work to dinner.",
      ],
    },
    dislikedTraits: ["overly sporty", "high-contrast brights"],
    styleEmbedding: hashToVector(
      "polished approachable neutrals tailored layers work coffee dinner",
      16,
    ),
    updatedAt: "2026-03-28T09:00:00.000Z",
  };

  const outfitSuggestion: OutfitSuggestion = {
    id: "outfit-today",
    userId: DEMO_USER_ID,
    generatedForDate: TODAY,
    context: {
      vibePrompt: "confident but calm",
      weather: "cool morning with a mild afternoon",
      tags: ["cool", "workday", "professional"],
    },
    primarySlots: {
      top: "item-shirt",
      bottom: "item-trousers",
      outerwear: "item-blazer",
      shoes: "item-loafers",
      accessories: ["item-watch"],
    },
    alternateSlots: [
      {
        top: "item-knit",
        bottom: "item-trousers",
        shoes: "item-loafers",
        accessories: ["item-watch"],
      },
      {
        top: "item-shirt",
        bottom: "item-trousers",
        shoes: "item-loafers",
      },
    ],
    reasoning: [
      "The blazer adds enough structure for meetings without feeling stiff on a mild day.",
      "White shirt plus charcoal trousers keeps the palette sharp and low-friction.",
      "Loafers and the steel watch finish the look without adding bulk.",
    ],
    confidence: 0.89,
    acceptedAt: null,
    rejectedAt: null,
    createdAt: "2026-03-28T06:30:00.000Z",
  };

  const thread: StylistThread = {
    id: "thread-default",
    userId: DEMO_USER_ID,
    title: "Daily stylist",
    createdAt: "2026-03-28T09:00:00.000Z",
  };

  const messages: StylistMessage[] = [
    {
      id: "message-1",
      threadId: thread.id,
      role: "assistant",
      content:
        "Your wardrobe reads polished, layered, and calm. Today I would lean into the navy blazer or the camel knit depending on how formal the day feels.",
      toolCalls: [],
      createdAt: "2026-03-28T09:02:00.000Z",
    },
  ];

  return {
    user: {
      id: DEMO_USER_ID,
      displayName: "Lakshan",
      timezone: "America/Chicago",
      homeLat: 41.8781,
      homeLng: -87.6298,
      createdAt: "2026-03-28T09:00:00.000Z",
    },
    styleProfile,
    inspirationAssets: [],
    wardrobeItems: items,
    wardrobeAssets: assets,
    processingJobs: [],
    outfitSuggestions: [outfitSuggestion],
    feedbackEvents: [],
    weatherSnapshots: [
      {
        id: "weather-today",
        userId: DEMO_USER_ID,
        forecastDate: TODAY,
        temperatureHighC: 17,
        temperatureLowC: 8,
        precipitationProbability: 20,
        conditionCode: "partly-cloudy",
        raw: {
          source: "demo",
        },
      },
    ],
    stylistThreads: [thread],
    stylistMessages: messages,
    aiRuns: [],
    notifications: [
      {
        id: "notification-1",
        userId: DEMO_USER_ID,
        title: "Layering alert",
        body: "Cool morning, mild afternoon. Start with the blazer and keep the knit close by.",
        level: "nudge",
        createdAt: "2026-03-28T06:32:00.000Z",
      },
    ],
  };
}

export function getDemoState() {
  if (!globalThis.__lumaDemoState) {
    globalThis.__lumaDemoState = buildInitialState();
  }

  return globalThis.__lumaDemoState;
}
