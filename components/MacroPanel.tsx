"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

interface SeriesData {
  id: string;
  label: string;
  data: { date: string; value: number }[];
  unit: string;
}

interface MacroResponse {
  treasury: SeriesData;
  fedFunds: SeriesData;
  usingMockData: boolean;
  error?: string;
}

const CHART_COLORS = { treasury: "#00d4ff", fedFunds: "#a78bfa" };

function MacroChart({ series, color }: { series: SeriesData; color: string }) {
  const latest = series.data[series.data.length - 1];
  const prev = series.data[series.data.length - 2];
  const delta = latest && prev ? (latest.value - prev.value).toFixed(2) : null;
  const up = delta !== null && parseFloat(delta) >= 0;

  // Only show last ~180 data points (about 6 months of daily data)
  const displayData = series.data.slice(-180);

  return (
    <div
      className="rounded-xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-4"
      style={{ boxShadow: `0 0 30px ${color}18` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-mono text-sm text-white font-semibold">{series.label}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-2xl font-bold" style={{ color }}>
              {latest?.value?.toFixed(2)}{series.unit}
            </span>
            {delta && (
              <span className={`text-xs font-mono ${up ? "text-emerald-400" : "text-rose-400"}`}>
                {up ? "▲" : "▼"} {Math.abs(parseFloat(delta)).toFixed(2)}
              </span>
            )}
          </div>
          {latest && (
            <div className="text-[10px] text-gray-500 mt-0.5">as of {latest.date}</div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={displayData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#4b5563", fontSize: 9, fontFamily: "monospace" }}
            tickFormatter={(v: string) => v.slice(5)}
            interval={Math.floor(displayData.length / 6)}
          />
          <YAxis
            tick={{ fill: "#4b5563", fontSize: 9, fontFamily: "monospace" }}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11, fontFamily: "monospace" }}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ color }}
            formatter={(v: number) => [`${v.toFixed(2)}%`, series.label]}
          />
          <ReferenceLine y={latest?.value} stroke={color} strokeDasharray="4 4" strokeOpacity={0.3} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MacroPanel() {
  const [macro, setMacro] = useState<MacroResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/macro")
      .then(r => r.json())
      .then(d => { setMacro(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500 font-mono text-sm animate-pulse">Loading macro data…</div>;
  if (!macro || macro.error) return <div className="text-rose-400 font-mono text-sm">Failed to load macro data.</div>;

  return (
    <div className="space-y-6">
      {macro.usingMockData && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400 font-mono">
          ⚠ No FRED_API_KEY set — displaying simulated macro data. Add your FRED key to .env.local to see real data.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MacroChart series={macro.treasury} color={CHART_COLORS.treasury} />
        <MacroChart series={macro.fedFunds} color={CHART_COLORS.fedFunds} />
      </div>
      <div className="rounded-lg border border-white/5 bg-gray-900/40 p-4 text-xs text-gray-500 leading-relaxed font-mono">
        <span className="text-gray-400 font-semibold">About these charts: </span>
        The 10-Year Treasury Yield (DGS10) reflects the market's expectations for long-term interest rates and inflation.
        The Federal Funds Rate (FEDFUNDS) is the overnight lending rate set by the Fed.
        Rising rates typically pressure growth stocks; falling rates often support them.
        Data sourced from FRED (Federal Reserve Bank of St. Louis).
      </div>
    </div>
  );
}
