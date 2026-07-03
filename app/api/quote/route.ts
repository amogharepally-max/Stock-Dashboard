import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FINNHUB_API_KEY;
const BASE = "https://finnhub.io/api/v1";

const cache = new Map<string, { data: unknown; fetchedAt: number }>();
const CACHE_TTL = 2 * 60 * 1000;

async function finnhub(path: string) {
  const res = await fetch(`${BASE}${path}&token=${API_KEY}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Finnhub ${res.status}: ${path}`);
  return res.json();
}

function syntheticCandles(q: { pc: number; o: number; h: number; l: number; c: number }) {
  const now = Date.now() / 1000;
  const marketOpen = now - 6.5 * 3600;
  const positive = q.c >= q.o;
  return [
    { t: marketOpen, c: q.pc },
    { t: marketOpen + 1.5 * 3600, c: q.o },
    { t: marketOpen + 3 * 3600, c: positive ? q.l : q.h },
    { t: marketOpen + 5 * 3600, c: positive ? q.h : q.l },
    { t: now, c: q.c },
  ];
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase();
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const [q, news, metricRes, profile] = await Promise.all([
      finnhub(`/quote?symbol=${symbol}`),
      finnhub(`/company-news?symbol=${symbol}&from=${yesterday}&to=${today}`),
      finnhub(`/stock/metric?symbol=${symbol}&metric=all`).catch(() => null),
      finnhub(`/stock/profile2?symbol=${symbol}`).catch(() => null),
    ]);

    const m = metricRes?.metric ?? {};

    const data = {
      quote: {
        symbol,
        price: q.c,
        change: q.d,
        changePercent: q.dp,
        high: q.h,
        low: q.l,
        open: q.o,
        prevClose: q.pc,
      },
      news: (Array.isArray(news) ? news.slice(0, 3) : []).map(
        (n: { headline: string; url: string; source: string; datetime: number; summary: string }) => ({
          headline: n.headline,
          url: n.url,
          source: n.source,
          datetime: n.datetime,
          summary: n.summary,
        })
      ),
      candles: syntheticCandles(q),
      metrics: {
        week52High: m["52WeekHigh"] ?? null,
        week52Low: m["52WeekLow"] ?? null,
        ipoDate: profile?.ipo ?? null,
        // Finnhub free tier doesn't expose the IPO offer price
        ipoPrice: null,
      },
    };

    cache.set(symbol, { data, fetchedAt: Date.now() });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
