import type {
  OutfitGenerationContext,
  OutfitSlotName,
  WeatherSnapshot,
  WardrobeItem,
} from "@/lib/types";

export function deriveWeatherTags(snapshot: WeatherSnapshot) {
  const tags = new Set<string>();
  const averageTemp = (snapshot.temperatureHighC + snapshot.temperatureLowC) / 2;

  if (averageTemp <= 6) tags.add("cold");
  if (averageTemp > 6 && averageTemp < 18) tags.add("cool");
  if (averageTemp >= 18 && averageTemp < 27) tags.add("mild");
  if (averageTemp >= 27) tags.add("hot");
  if (snapshot.precipitationProbability >= 40) tags.add("rain");
  if (snapshot.conditionCode.includes("storm")) tags.add("storm");
  if (snapshot.conditionCode.includes("clear")) tags.add("clear");

  return Array.from(tags);
}

export function deriveTimeOfDay(date = new Date()): OutfitGenerationContext["timeOfDay"] {
  const hour = date.getHours();

  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function inferSlotFromItem(item: WardrobeItem): OutfitSlotName | null {
  const category = item.category.toLowerCase();
  const subcategory = item.subcategory.toLowerCase();

  if (
    ["top", "shirt", "tee", "blouse", "tank"].includes(category) ||
    ["shirt", "tee", "blouse", "tank"].includes(subcategory)
  ) {
    return "top";
  }

  if (
    ["bottom", "trousers", "pants", "jeans", "skirt", "shorts"].includes(
      category,
    ) ||
    ["trousers", "pants", "jeans", "skirt", "shorts"].includes(subcategory)
  ) {
    return "bottom";
  }

  if (
    ["dress", "jumpsuit", "romper"].includes(category) ||
    ["dress", "jumpsuit", "romper"].includes(subcategory) ||
    item.layerRole === "full-look"
  ) {
    return "onePiece";
  }

  if (
    ["outerwear", "coat", "jacket", "blazer", "cardigan"].includes(category) ||
    ["coat", "jacket", "blazer", "cardigan"].includes(subcategory) ||
    item.layerRole === "outer"
  ) {
    return "outerwear";
  }

  if (
    ["shoes", "sneakers", "boots", "heels", "loafers"].includes(category) ||
    ["sneakers", "boots", "heels", "loafers"].includes(subcategory)
  ) {
    return "shoes";
  }

  if (item.layerRole === "accessory" || category === "accessory") {
    return "accessories";
  }

  return null;
}

export function isWeatherCompatible(
  item: WardrobeItem,
  snapshot: WeatherSnapshot,
) {
  const tags = deriveWeatherTags(snapshot);
  const seasons = new Set(item.seasonality.map((entry) => entry.toLowerCase()));

  if (tags.includes("hot") && seasons.has("winter")) {
    return false;
  }

  if (tags.includes("cold") && seasons.has("summer") && item.layerRole !== "base") {
    return false;
  }

  if (tags.includes("rain") && item.fabric.toLowerCase().includes("suede")) {
    return false;
  }

  return true;
}

export function scoreItem(item: WardrobeItem, context: OutfitGenerationContext) {
  let score = 50;

  if (!isWeatherCompatible(item, context.weather)) {
    return 0;
  }

  if (context.tags.some((tag) => item.occasionTags.includes(tag))) {
    score += 18;
  }

  if (context.tags.includes("cold") && item.layerRole === "outer") {
    score += 14;
  }

  if (context.tags.includes("hot") && item.fabric.toLowerCase().includes("linen")) {
    score += 12;
  }

  score += item.favoriteScore * 4;
  score -= item.dislikeScore * 12;
  score -= Math.min(item.wearCount, 18);

  if (!item.lastWornAt) {
    score += 8;
  }

  return score;
}
