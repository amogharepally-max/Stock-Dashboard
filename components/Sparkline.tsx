"use client";
import {
  ResponsiveContainer, LineChart, Line, YAxis, Tooltip,
  ReferenceLine, XAxis,
} from "recharts";
import { Candle } from "@/lib/types";

interface Props {
  candles: Candle[];
  positive: boolean;
}

function fmt(unix: number) {
  const d = new Date(unix * 1000);
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as Candle;
  const { date, time } = fmt(point.t);
  const price = point.c;
  return (
    <div className="rounded-lg border border-white/10 bg-gray-900/95 backdrop-blur px-3 py-2 shadow-xl">
      <div className="font-mono text-white text-sm font-semibold">${price?.toFixed(2)}</div>
      <div className="font-mono text-gray-400 text-[10px]">{date}</div>
      <div className="font-mono text-gray-500 text-[10px]">{time}</div>
    </div>
  );
}

export default function Sparkline({ candles, positive }: Props) {
  if (!candles || candles.length < 2) {
    return <div className="h-14 w-full flex items-center justify-center text-[10px] text-gray-700">no chart data</div>;
  }

  const color = positive ? "#00ffa3" : "#ff3d6b";
  const gradId = `grad-${positive ? "up" : "dn"}`;
  const openPrice = candles[0].c;

  return (
    <ResponsiveContainer width="100%" height={56}>
      <LineChart data={candles} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" hide />
        <YAxis domain={["auto", "auto"]} hide />
        <ReferenceLine y={openPrice} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Line
          type="linear"
          dataKey="c"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
