"use client";
import { useEffect, useState, useCallback } from "react";
import { StockData } from "@/lib/types";
import Sparkline from "./Sparkline";
import { ExternalLink, RefreshCw } from "lucide-react";

interface Props {
  symbol: string;
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-2 py-1 rounded-md bg-white/5 border border-white/5 min-w-0">
      <span className="text-[9px] text-gray-600 uppercase tracking-wider whitespace-nowrap">{label}</span>
      <span className="text-[11px] font-mono text-gray-300 font-semibold">{value}</span>
    </div>
  );
}

export default function StockCard({ symbol }: Props) {
  const [data, setData] = useState<StockData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/quote?symbol=${symbol}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "fetch failed");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => { load(); }, [load]);

  const positive = (data?.quote.changePercent ?? 0) >= 0;
  const glowColor = positive ? "rgba(0,255,163,0.12)" : "rgba(255,61,107,0.12)";
  const textColor = positive ? "text-emerald-400" : "text-rose-400";
  const borderColor = positive ? "border-emerald-500/20" : "border-rose-500/20";

  const m = data?.metrics;
  const fmt = (v: number | null | undefined) => v != null ? `$${v.toFixed(2)}` : "—";

  return (
    <div
      className={`relative rounded-xl border ${borderColor} bg-gray-900/60 backdrop-blur-sm p-3 transition-all duration-300 hover:scale-[1.01]`}
      style={{ boxShadow: `0 0 18px ${glowColor}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono font-bold text-white text-sm tracking-widest">{symbol}</span>
        {loading && <RefreshCw size={12} className="text-gray-500 animate-spin" />}
      </div>

      {error ? (
        <div className="text-xs text-rose-400 font-mono">{error}</div>
      ) : data ? (
        <>
          {/* Price + change */}
          <div className="flex items-end gap-2 mb-1">
            <span className="font-mono text-xl text-white font-semibold">
              ${data.quote.price?.toFixed(2) ?? "—"}
            </span>
            <span className={`font-mono text-xs ${textColor} mb-0.5`}>
              {data.quote.change >= 0 ? "+" : ""}{data.quote.change?.toFixed(2)}{" "}
              ({data.quote.changePercent >= 0 ? "+" : ""}{data.quote.changePercent?.toFixed(2)}%)
            </span>
          </div>

          {/* Sparkline */}
          <Sparkline candles={data.candles} positive={positive} />

          {/* Metrics row */}
          <div className="flex gap-1.5 mt-2 justify-between">
            <MetricPill label="52W High" value={fmt(m?.week52High)} />
            <MetricPill label="52W Low" value={fmt(m?.week52Low)} />
            <MetricPill label="IPO" value={m?.ipoDate ?? "—"} />
          </div>

          {/* News */}
          {data.news.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-white/10">
              <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">
                Possible reasons (news context — not verified causes)
              </div>
              <ul className="space-y-1">
                {data.news.map((n, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-gray-700 text-[10px] mt-0.5 shrink-0">▸</span>
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-gray-400 hover:text-cyan-400 transition-colors leading-tight flex items-start gap-1"
                    >
                      {n.headline}
                      <ExternalLink size={8} className="shrink-0 mt-0.5 opacity-50" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
