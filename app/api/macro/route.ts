import { NextResponse } from "next/server";

const FRED_KEY = process.env.FRED_API_KEY;
const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

// Cache macro data for 30 minutes
let macroCache: { data: unknown; fetchedAt: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000;

async function fredSeries(seriesId: string, limit = 180) {
  if (!FRED_KEY) {
    // Return mock data when no FRED key
    return generateMockSeries(seriesId, limit);
  }
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${res.status}: ${seriesId}`);
  const json = await res.json();
  return json.observations
    .filter((o: { value: string }) => o.value !== ".")
    .map((o: { date: string; value: string }) => ({ date: o.date, value: parseFloat(o.value) }))
    .reverse();
}

function generateMockSeries(seriesId: string, count: number) {
  const data = [];
  const now = new Date();
  const baseVal = seriesId === "DGS10" ? 4.2 : 5.33;
  for (let i = count; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 2);
    data.push({
      date: d.toISOString().split("T")[0],
      value: parseFloat((baseVal + (Math.random() - 0.5) * 0.5).toFixed(2)),
    });
  }
  return data;
}

export async function GET() {
  if (macroCache && Date.now() - macroCache.fetchedAt < CACHE_TTL) {
    return NextResponse.json(macroCache.data);
  }

  try {
    const [treasury, fedFunds] = await Promise.all([
      fredSeries("DGS10", 180),
      fredSeries("FEDFUNDS", 180),
    ]);

    const data = {
      treasury: {
        id: "DGS10",
        label: "10-Year Treasury Yield",
        data: treasury,
        unit: "%",
      },
      fedFunds: {
        id: "FEDFUNDS",
        label: "Federal Funds Rate",
        data: fedFunds,
        unit: "%",
      },
      usingMockData: !FRED_KEY,
    };

    macroCache = { data, fetchedAt: Date.now() };
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
