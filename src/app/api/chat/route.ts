import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { ANALYST_SYSTEM_PROMPT } from "@/lib/knowledge";
import { ANALYSIS_MODEL } from "@/lib/analyze";
import type { ChatMessage } from "@/lib/types";

export const maxDuration = 60;

const MAX_HISTORY = 20;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Set it in your environment or Vercel project settings." },
      { status: 500 },
    );
  }

  let body: {
    question?: string;
    history?: ChatMessage[];
    productName?: string;
    ingredients?: string;
    analysisSummary?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "question is required." }, { status: 400 });
  }
  if (question.length > 4000) {
    return NextResponse.json({ error: "Question is too long." }, { status: 400 });
  }

  const productContext = body.productName
    ? `\n\nThe parent is currently looking at this product:\nProduct: ${body.productName}\nIngredients: ${body.ingredients ?? "(not provided)"}${body.analysisSummary ? `\nYour prior analysis summary: ${body.analysisSummary}` : ""}`
    : "";

  const history = (body.history ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: ANALYSIS_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: ANALYST_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: `You are now answering follow-up questions in a chat. Keep answers short (2-4 sentences unless asked for detail), practical, and specific to children's nutrition. Politely decline questions unrelated to food, ingredients, or children's nutrition.${productContext}`,
      },
    ],
    messages: [...history, { role: "user" as const, content: question }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch {
        controller.enqueue(encoder.encode("\n\n[The response was interrupted — please try again.]"));
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
