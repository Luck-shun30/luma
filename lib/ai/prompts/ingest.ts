export const INGEST_PROMPT_VERSION = "luma-ingest-v1";

export function buildIngestionPrompt(params: {
  fileName: string;
  captureMode?: string;
}) {
  return `
You are extracting garments for a mobile wardrobe app.

Return JSON only.

Requirements:
- Detect each visible garment.
- Provide the normalized bounding box as [y0, x0, y1, x1] scaled 0-1000.
- Prefer an empty string for mask unless you can provide a short, valid data:image/png;base64 URI.
- Never invent or approximate a segmentation mask.
- Use specific fashion labels for category and subcategory.
- Do not hallucinate hidden details.
- If uncertain, use "unknown" style labels only where required and keep confidence low.
- Only fill size if the label is visibly readable.
- Set size_source to one of visible_label, inferred, or unknown.
- Prefer concise style and occasion tags.
- Return this exact JSON shape:
{
  "garments": [
    {
      "label": "string",
      "category": "string",
      "subcategory": "string",
      "colors": ["string"],
      "pattern": "string",
      "fabric": "string",
      "size": "string",
      "size_source": "visible_label|inferred|unknown",
      "formality": "casual|smart-casual|formal",
      "seasonality": ["spring|summer|fall|winter"],
      "layer_role": "base|mid|outer|full-look|accessory",
      "occasion_tags": ["string"],
      "style_tags": ["string"],
      "confidence": {
        "category": 0.0,
        "segmentation": 0.0
      },
      "box_2d": [0, 0, 1000, 1000],
      "mask": ""
    }
  ]
}
- No markdown fences.

Image metadata:
- file_name: ${params.fileName}
- capture_mode: ${params.captureMode ?? "single-item"}
  `.trim();
}
