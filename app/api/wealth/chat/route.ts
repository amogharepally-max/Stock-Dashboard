import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, portfolio, history } = await req.json();
    if (!message || !portfolio) {
      return NextResponse.json({ error: "Message and portfolio required" }, { status: 400 });
    }

    const portfolioContext = JSON.stringify(portfolio, null, 2);

    const systemPrompt = `You are a senior Portfolio Manager and Wealth Advisor at Goldman Sachs Private Wealth Management. You just constructed a portfolio for a client and are now answering their follow-up questions about it.

Here is the portfolio you built for them:
${portfolioContext}

Answer questions about this portfolio with the depth and clarity of a Goldman Sachs advisor speaking directly to a client. Be specific — reference actual stocks, allocations, sectors, and reasoning from the portfolio above. Be concise but substantive. Use plain language, no jargon unless explained. Do not use markdown formatting like ** or ## — write in clean prose.`;

    const messages = [
      ...(history ?? []),
      { role: "user" as const, content: message },
    ];

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content.find(b => b.type === "text");
    return NextResponse.json({ reply: text?.text ?? "" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
