import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { analyzeIngredients } from "@/lib/analyze";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Set it in your environment or Vercel project settings." },
      { status: 500 },
    );
  }

  let body: { productName?: string; ingredients?: string; category?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const productName = body.productName?.trim();
  const ingredients = body.ingredients?.trim();
  if (!productName || !ingredients) {
    return NextResponse.json(
      { error: "Both productName and ingredients are required." },
      { status: 400 },
    );
  }
  if (ingredients.length > 8000) {
    return NextResponse.json({ error: "Ingredient list is too long." }, { status: 400 });
  }

  const client = new Anthropic();
  try {
    const analysis = await analyzeIngredients(client, productName, ingredients, body.category);
    return NextResponse.json({ analysis, analyzedAt: new Date().toISOString() });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited by the AI provider. Please retry in a moment." },
        { status: 429 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI provider error (${err.status}).` },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "Analysis failed unexpectedly." }, { status: 500 });
  }
}
