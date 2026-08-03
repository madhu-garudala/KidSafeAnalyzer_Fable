import Anthropic from "@anthropic-ai/sdk";
import { ANALYST_SYSTEM_PROMPT } from "./knowledge";
import type { Analysis } from "./types";

export const ANALYSIS_MODEL = "claude-haiku-4-5";

const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["good", "moderate", "bad"] },
    summary: {
      type: "string",
      description: "Two-sentence plain-language verdict a parent can read in the store aisle.",
    },
    overallAssessment: {
      type: "string",
      description: "One paragraph assessing the product as a whole for children.",
    },
    redFlags: {
      type: "array",
      description: "Red-flag ingredients actually present in this product. Empty if none.",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          note: { type: "string", description: "Why this ingredient is concerning for children." },
        },
        required: ["name", "note"],
        additionalProperties: false,
      },
    },
    addedSugar: {
      type: "string",
      description: "Assessment of added sugar: which sugar aliases appear, how early in the list, and what that means against the under-25g/day guidance.",
    },
    ingredientBreakdown: {
      type: "array",
      description: "One entry per ingredient in the list, in original order.",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          rating: { type: "string", enum: ["good", "neutral", "caution", "avoid"] },
          note: { type: "string", description: "One sentence on what it is and its relevance for children." },
        },
        required: ["name", "rating", "note"],
        additionalProperties: false,
      },
    },
    keyConcerns: {
      type: "array",
      description: "Prioritized concerns, most important first. Empty if none.",
      items: { type: "string" },
    },
    positives: {
      type: "array",
      description: "Genuine positive aspects. Empty if none.",
      items: { type: "string" },
    },
    conclusion: {
      type: "string",
      description: "One-sentence bottom line, optionally suggesting what kind of alternative to prefer.",
    },
  },
  required: [
    "verdict",
    "summary",
    "overallAssessment",
    "redFlags",
    "addedSugar",
    "ingredientBreakdown",
    "keyConcerns",
    "positives",
    "conclusion",
  ],
  additionalProperties: false,
} as const;

export async function analyzeIngredients(
  client: Anthropic,
  productName: string,
  ingredients: string,
  category?: string,
): Promise<Analysis> {
  const response = await client.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: ANALYST_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Analyze this product for child safety.\n\nProduct: ${productName}${category ? `\nCategory: ${category}` : ""}\nIngredients: ${ingredients}`,
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: ANALYSIS_SCHEMA },
    },
  });

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) {
    throw new Error(`Model returned no text (stop_reason: ${response.stop_reason})`);
  }
  const parsed = JSON.parse(text) as Omit<Analysis, "source">;
  return { ...parsed, source: "haiku-4-5" };
}
