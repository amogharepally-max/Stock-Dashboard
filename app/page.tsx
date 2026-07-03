"use client";
import { useState, useEffect, useCallback } from "react";
import { Sector } from "@/lib/types";
import { DEFAULT_SECTORS } from "@/lib/defaultSectors";
import SectorPanel from "@/components/SectorPanel";
import MacroPanel from "@/components/MacroPanel";
import WealthManager from "@/components/WealthManager";
import { Plus, X, Edit2, Check, RefreshCw, TrendingUp, Briefcase } from "lucide-react";

const STORAGE_KEY = "stock-dashboard-sectors";
const REFRESH_INTERVAL = 3 * 60 * 1000;

export default function Home() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [activeTab, setActiveTab] = useState<string>("macro");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [addingSector, setAddingSector] = useState(false);
  const [newSectorName, setNewSectorName] = useState("");
  const [editingSector, setEditingSector] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setSectors(saved ? JSON.parse(saved) : DEFAULT_SECTORS);
    } catch {
      setSectors(DEFAULT_SECTORS);
    }
  }, []);

  useEffect(() => {
    if (sectors.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(sectors));
  }, [sectors]);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    setLastRefresh(new Date());
    const id = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  function addSector() {
    if (!newSectorName.trim()) return;
    const id = newSectorName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const s: Sector = {
      id,
      label: newSectorName.trim(),
      subsections: [
        { label: "Growth", tickers: [] },
        { label: "Value", tickers: [] },
        { label: "Dividend", tickers: [] },
      ],
    };
    setSectors(prev => [...prev, s]);
    setActiveTab(id);
    setNewSectorName("");
    setAddingSector(false);
  }

  function removeSector(id: string) {
    setSectors(prev => prev.filter(s => s.id !== id));
    setActiveTab("macro");
  }

  function renameSector(id: string) {
    if (!editName.trim()) return;
    setSectors(prev => prev.map(s => s.id === id ? { ...s, label: editName.trim() } : s));
    setEditingSector(null);
  }

  function updateSector(updated: Sector) {
    setSectors(prev => prev.map(s => s.id === updated.id ? updated : s));
  }

  const tabs = [
    { id: "macro", label: "Macro" },
    { id: "wealth", label: "Wealth Manager" },
    ...sectors.map(s => ({ id: s.id, label: s.label })),
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-cyan-400" />
            <span className="text-sm font-bold tracking-widest text-white uppercase">Stock Research Terminal</span>
            <span className="text-[10px] text-gray-600 border border-gray-700 rounded px-1.5 py-0.5">PERSONAL USE ONLY</span>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-[10px] text-gray-600 font-mono">
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition-colors border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-cyan-500/40"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-6 py-2">
        <p className="max-w-7xl mx-auto text-center text-[10px] text-amber-400/80">
          ⚠ <strong>Disclaimer:</strong> This tool is for personal research and education only — not investment advice. &quot;Possible reasons&quot; sections surface recent news headlines as context only; they are not verified causal explanations for price movements. Always do your own research.
        </p>
      </div>

      {/* Tab bar */}
      <div className="sticky top-[57px] z-40 border-b border-white/5 bg-gray-950/70 backdrop-blur-xl px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1">
          {tabs.map(tab => (
            <div key={tab.id} className="relative group flex items-center shrink-0">
              {editingSector === tab.id ? (
                <div className="flex items-center gap-1 px-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-gray-800 border border-cyan-500/40 rounded px-2 py-0.5 text-xs text-white w-28"
                    autoFocus
                    onKeyDown={e => { if (e.key === "Enter") renameSector(tab.id); if (e.key === "Escape") setEditingSector(null); }}
                  />
                  <button onClick={() => renameSector(tab.id)} className="text-cyan-400 hover:text-cyan-300"><Check size={12} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-t-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              )}
              {tab.id !== "macro" && activeTab === tab.id && (
                <div className="hidden group-hover:flex items-center gap-0.5 absolute top-0 -right-5">
                  <button
                    onClick={() => { setEditingSector(tab.id); setEditName(tab.label); }}
                    className="text-gray-500 hover:text-cyan-400 p-0.5"
                  >
                    <Edit2 size={10} />
                  </button>
                  <button onClick={() => removeSector(tab.id)} className="text-gray-500 hover:text-rose-400 p-0.5">
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {addingSector ? (
            <div className="flex items-center gap-1 px-2 shrink-0">
              <input
                value={newSectorName}
                onChange={e => setNewSectorName(e.target.value)}
                placeholder="Sector name…"
                className="bg-gray-800 border border-cyan-500/40 rounded px-2 py-0.5 text-xs text-white w-32 placeholder-gray-600"
                autoFocus
                onKeyDown={e => { if (e.key === "Enter") addSector(); if (e.key === "Escape") setAddingSector(false); }}
              />
              <button onClick={addSector} className="text-xs text-cyan-400 px-1">Add</button>
              <button onClick={() => setAddingSector(false)} className="text-gray-500 text-xs px-1">✕</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSector(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:text-cyan-400 transition-colors rounded border border-dashed border-white/10 hover:border-cyan-500/30 ml-1 shrink-0"
            >
              <Plus size={11} /> Sector
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "macro" ? (
          <div>
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              Macroeconomic Indicators
            </h2>
            <MacroPanel key={refreshKey} />
          </div>
        ) : activeTab === "wealth" ? (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Briefcase size={14} className="text-cyan-400" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500">
                Wealth Manager — AI Portfolio Advisor
              </h2>
            </div>
            <WealthManager />
          </div>
        ) : (
          sectors.filter(s => s.id === activeTab).map(sector => (
            <div key={sector.id + refreshKey}>
              <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
                {sector.label} — Watchlist
              </h2>
              <SectorPanel sector={sector} onUpdate={updateSector} />
            </div>
          ))
        )}
      </main>

      <footer className="border-t border-white/5 px-6 py-4 mt-12">
        <p className="max-w-7xl mx-auto text-center text-[10px] text-gray-700">
          Data: Finnhub (quotes, news) · FRED (macro) · Refreshes every 3 min · Personal research only
        </p>
      </footer>
    </div>
  );
}
