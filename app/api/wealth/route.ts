import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Valid investment amount required" }, { status: 400 });
    }

    const investmentAmount = Number(amount);

    const systemPrompt = `You are a senior Portfolio Manager and Wealth Advisor at Goldman Sachs Private Wealth Management with 20+ years of experience managing high-net-worth client portfolios. You have deep expertise in equity research, macro analysis, sector rotation, and risk-adjusted returns.

Your mandate: deliver institutional-quality portfolio construction advice that reflects current market conditions, sector fundamentals, and risk management principles. Think like you're presenting to a Goldman Sachs Investment Committee.

Key principles you adhere to:
- Diversification across sectors, market caps, and risk profiles
- Balance growth positions with defensive holdings
- Consider macro tailwinds and headwinds
- Factor in valuation, momentum, and quality metrics
- Risk-adjusted return optimization, not just absolute return chasing
- Position sizing based on conviction and risk/reward
- Include a mix of established blue-chips and high-conviction growth names

You MUST respond with ONLY valid JSON in this exact structure, no other text:
{
  "summary": "Brief 2-3 sentence portfolio thesis and market outlook",
  "riskProfile": "Moderate Growth" | "Aggressive Growth" | "Conservative" | "Balanced",
  "expectedReturn": "estimated annual return range, e.g. 12-18%",
  "allocations": [
    {
      "symbol": "TICKER",
      "name": "Company Name",
      "sector": "Sector Name",
      "allocation": 0.20,
      "amount": 2000.00,
      "thesis": "2-3 sentence investment thesis explaining WHY this stock at this weighting, including specific catalysts, valuation perspective, and how it fits the overall portfolio",
      "conviction": "High" | "Medium",
      "timeHorizon": "12-18 months" | "2-3 years" | "3-5 years"
    }
  ]
}

Rules:
- allocations must sum to exactly 1.0
- Recommend 8-12 stocks for proper diversification
- Cover at least 4-5 different sectors
- Each thesis must be substantive (50-80 words minimum) and specific
- Do not include any text outside the JSON`;

    const userPrompt = `I have $${investmentAmount.toLocaleString()} to invest. Build me an optimal diversified portfolio allocation. Today's date is ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Consider current market conditions, sector dynamics, and construct a portfolio that balances risk and return appropriately for this capital base.`;

    const stream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const message = await stream.finalMessage();

    const textBlock = message.content.find(b => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response generated" }, { status: 500 });
    }

    let jsonText = textBlock.text.trim();
    // Strip markdown code fences if present
    jsonText = jsonText.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "");

    const portfolio = JSON.parse(jsonText);
    return NextResponse.json(portfolio);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
