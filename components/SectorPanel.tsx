"use client";
import { useState } from "react";
import { Sector } from "@/lib/types";
import StockCard from "./StockCard";
import { Plus, X, Edit2, Check } from "lucide-react";

interface Props {
  sector: Sector;
  onUpdate: (updated: Sector) => void;
}

export default function SectorPanel({ sector, onUpdate }: Props) {
  const [editingTicker, setEditingTicker] = useState<{ sub: number; idx: number } | null>(null);
  const [tickerInput, setTickerInput] = useState("");
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [newTicker, setNewTicker] = useState("");

  function updateTicker(subIdx: number, tickerIdx: number, val: string) {
    const updated = { ...sector, subsections: sector.subsections.map((s, si) =>
      si !== subIdx ? s : { ...s, tickers: s.tickers.map((t, ti) => ti === tickerIdx ? val.toUpperCase() : t) }
    )};
    onUpdate(updated);
    setEditingTicker(null);
  }

  function removeTicker(subIdx: number, tickerIdx: number) {
    const updated = { ...sector, subsections: sector.subsections.map((s, si) =>
      si !== subIdx ? s : { ...s, tickers: s.tickers.filter((_, ti) => ti !== tickerIdx) }
    )};
    onUpdate(updated);
  }

  function addTicker(subIdx: number) {
    if (!newTicker.trim()) return;
    const updated = { ...sector, subsections: sector.subsections.map((s, si) =>
      si !== subIdx ? s : { ...s, tickers: [...s.tickers, newTicker.trim().toUpperCase()] }
    )};
    onUpdate(updated);
    setNewTicker("");
    setAddingTo(null);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sector.subsections.map((sub, si) => (
        <div key={sub.label}>
          <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400/70 mb-3 border-b border-cyan-500/20 pb-1">
            {sub.label}
          </h3>
          <div className="space-y-3">
            {sub.tickers.map((ticker, ti) => (
              <div key={ticker} className="group relative">
                {editingTicker?.sub === si && editingTicker?.idx === ti ? (
                  <div className="flex gap-1 mb-1">
                    <input
                      value={tickerInput}
                      onChange={e => setTickerInput(e.target.value)}
                      className="flex-1 bg-gray-800 border border-cyan-500/40 rounded px-2 py-1 text-xs font-mono text-white uppercase"
                      autoFocus
                      onKeyDown={e => e.key === "Enter" && updateTicker(si, ti, tickerInput)}
                    />
                    <button onClick={() => updateTicker(si, ti, tickerInput)} className="text-cyan-400 hover:text-cyan-300">
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-1 z-10">
                    <button
                      onClick={() => { setEditingTicker({ sub: si, idx: ti }); setTickerInput(ticker); }}
                      className="bg-gray-800 border border-white/10 rounded p-0.5 text-gray-400 hover:text-cyan-400"
                    >
                      <Edit2 size={10} />
                    </button>
                    <button
                      onClick={() => removeTicker(si, ti)}
                      className="bg-gray-800 border border-white/10 rounded p-0.5 text-gray-400 hover:text-rose-400"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
                <StockCard symbol={ticker} />
              </div>
            ))}
            {addingTo === si ? (
              <div className="flex gap-1">
                <input
                  value={newTicker}
                  onChange={e => setNewTicker(e.target.value)}
                  placeholder="e.g. TSLA"
                  className="flex-1 bg-gray-800 border border-cyan-500/40 rounded px-2 py-1 text-xs font-mono text-white uppercase placeholder-gray-600"
                  autoFocus
                  onKeyDown={e => { if (e.key === "Enter") addTicker(si); if (e.key === "Escape") setAddingTo(null); }}
                />
                <button onClick={() => addTicker(si)} className="text-cyan-400 hover:text-cyan-300 text-xs px-2">Add</button>
                <button onClick={() => setAddingTo(null)} className="text-gray-500 hover:text-gray-300 text-xs px-1">✕</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingTo(si)}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg border border-dashed border-white/10 text-gray-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors text-xs"
              >
                <Plus size={12} /> Add ticker
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
