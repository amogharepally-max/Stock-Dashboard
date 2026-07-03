"use client";
import { useState, useEffect, useCallback } from "react";
import { Sector } from "@/lib/types";
import { DEFAULT_SECTORS } from "@/lib/defaultSectors";
import SectorPanel from "@/components/SectorPanel";
import MacroPanel from "@/components/MacroPanel";
import WealthManager from "@/components/WealthManager";
import { Plus, X, Edit2, Check, RefreshCw, House, BarChart2, Briefcase, Activity, ChevronRight } from "lucide-react";

const STORAGE_KEY = "stock-dashboard-sectors";
const REFRESH_INTERVAL = 3 * 60 * 1000;

const ZenithLogo = () => (
  <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="26" fill="#040810"/>
    <line x1="18" y1="80" x2="102" y2="80" stroke="#0a2535" stroke-width="2"/>
    <circle cx="60" cy="46" r="18" fill="rgba(0,212,255,0.07)"/>
    <circle cx="60" cy="46" r="12" fill="rgba(0,212,255,0.10)"/>
    <circle cx="60" cy="46" r="7" fill="#00d4ff"/>
    <circle cx="60" cy="46" r="4" fill="#fff"/>
    <line x1="60" y1="22" x2="60" y2="28" stroke="#00d4ff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="79" y1="27" x2="75" y2="32" stroke="#00d4ff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="84" y1="46" x2="78" y2="46" stroke="#00d4ff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="41" y1="27" x2="45" y2="32" stroke="#00d4ff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="36" y1="46" x2="42" y2="46" stroke="#00d4ff" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="75" y1="65" x2="71" y2="61" stroke="#00ffa3" stroke-width="2" stroke-linecap="round"/>
    <line x1="45" y1="65" x2="49" y2="61" stroke="#00ffa3" stroke-width="2" stroke-linecap="round"/>
  </svg>
);

type BottomTab = "home" | "markets" | "advisor" | "macro";

export default function Dashboard() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [bottomTab, setBottomTab] = useState<BottomTab>("home");
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [addingSector, setAddingSector] = useState(false);
  const [newSectorName, setNewSectorName] = useState("");
  const [editingSector, setEditingSector] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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
      id, label: newSectorName.trim(),
      subsections: [
        { label: "Growth", tickers: [] },
        { label: "Value", tickers: [] },
        { label: "Dividend", tickers: [] },
      ],
    };
    setSectors(prev => [...prev, s]);
    setActiveSector(id);
    setBottomTab("markets");
    setNewSectorName("");
    setAddingSector(false);
  }

  function removeSector(id: string) {
    setSectors(prev => prev.filter(s => s.id !== id));
    setActiveSector(null);
  }

  function renameSector(id: string) {
    if (!editName.trim()) return;
    setSectors(prev => prev.map(s => s.id === id ? { ...s, label: editName.trim() } : s));
    setEditingSector(null);
  }

  function updateSector(updated: Sector) {
    setSectors(prev => prev.map(s => s.id === updated.id ? updated : s));
  }

  const currentSector = activeSector ? sectors.find(s => s.id === activeSector) : sectors[0];

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col" style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/90 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ZenithLogo />
          <div>
            <div className="text-sm font-bold tracking-widest text-white">ZENITH</div>
            <div className="text-[9px] text-gray-600 tracking-wider">RESEARCH TERMINAL</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-[9px] text-gray-700 font-mono hidden sm:block">
              {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-cyan-400 transition-colors border border-white/10 rounded-lg px-2.5 py-1.5 hover:border-cyan-500/40"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-950/30 border-b border-amber-500/15 px-4 py-1.5">
        <p className="text-center text-[9px] text-amber-400/60">
          ⚠ For personal research only — not investment advice
        </p>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* HOME TAB */}
        {bottomTab === "home" && (
          <div className="px-4 py-5 space-y-5">
            {/* Hero welcome */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <div className="text-[9px] text-cyan-500/60 uppercase tracking-widest mb-1">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}</div>
              <div className="text-xl font-bold text-white mb-1">Your Markets</div>
              <div className="text-[11px] text-gray-500">Real-time quotes · AI wealth advisor · Macro data</div>
            </div>

            {/* Quick nav cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBottomTab("markets")}
                className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-left hover:border-cyan-500/30 transition-all active:scale-95"
              >
                <BarChart2 size={18} className="text-cyan-400 mb-2" />
                <div className="text-xs font-bold text-white mb-0.5">Markets</div>
                <div className="text-[10px] text-gray-500">{sectors.length} sectors tracked</div>
              </button>
              <button
                onClick={() => setBottomTab("advisor")}
                className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-left hover:border-cyan-500/30 transition-all active:scale-95"
              >
                <Briefcase size={18} className="text-cyan-400 mb-2" />
                <div className="text-xs font-bold text-white mb-0.5">AI Advisor</div>
                <div className="text-[10px] text-gray-500">Goldman Sachs-grade picks</div>
              </button>
              <button
                onClick={() => setBottomTab("macro")}
                className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-left hover:border-cyan-500/30 transition-all active:scale-95"
              >
                <Activity size={18} className="text-cyan-400 mb-2" />
                <div className="text-xs font-bold text-white mb-0.5">Macro</div>
                <div className="text-[10px] text-gray-500">Fed, GDP, inflation</div>
              </button>
              <button
                onClick={() => { setBottomTab("markets"); setActiveSector(sectors[0]?.id ?? null); }}
                className="rounded-xl border border-white/10 bg-gray-900/60 p-4 text-left hover:border-cyan-500/30 transition-all active:scale-95"
              >
                <House size={18} className="text-cyan-400 mb-2" />
                <div className="text-xs font-bold text-white mb-0.5">Watchlist</div>
                <div className="text-[10px] text-gray-500">Top picks by sector</div>
              </button>
            </div>

            {/* Sectors list */}
            <div>
              <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">Your Sectors</div>
              <div className="space-y-2">
                {sectors.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveSector(s.id); setBottomTab("markets"); }}
                    className="w-full flex items-center justify-between rounded-xl border border-white/5 bg-gray-900/40 px-4 py-3 hover:border-cyan-500/20 transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 rounded-full bg-cyan-500/40" />
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">{s.label}</div>
                        <div className="text-[10px] text-gray-600">{s.subsections.reduce((n, sub) => n + sub.tickers.length, 0)} stocks</div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MARKETS TAB */}
        {bottomTab === "markets" && (
          <div className="px-4 py-5">
            {/* Sector picker */}
            <div className="overflow-x-auto -mx-4 px-4 mb-5">
              <div className="flex gap-2 w-max">
                {sectors.map(s => (
                  <div key={s.id} className="relative group shrink-0">
                    {editingSector === s.id ? (
                      <div className="flex items-center gap-1 bg-gray-800 border border-cyan-500/40 rounded-full px-3 py-1.5">
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="bg-transparent text-[11px] text-white w-20 outline-none"
                          autoFocus
                          onKeyDown={e => { if (e.key === "Enter") renameSector(s.id); if (e.key === "Escape") setEditingSector(null); }}
                        />
                        <button onClick={() => renameSector(s.id)}><Check size={11} className="text-cyan-400" /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveSector(s.id)}
                        onLongPress={() => { setEditingSector(s.id); setEditName(s.label); }}
                        className={`text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                          activeSector === s.id
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                            : "border-white/10 text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {s.label}
                      </button>
                    )}
                    {activeSector === s.id && (
                      <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                        <button onClick={() => { setEditingSector(s.id); setEditName(s.label); }} className="w-4 h-4 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center">
                          <Edit2 size={8} className="text-cyan-400" />
                        </button>
                        <button onClick={() => removeSector(s.id)} className="w-4 h-4 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center">
                          <X size={8} className="text-rose-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {addingSector ? (
                  <div className="flex items-center gap-1 bg-gray-800 border border-cyan-500/40 rounded-full px-3 py-1.5 shrink-0">
                    <input
                      value={newSectorName}
                      onChange={e => setNewSectorName(e.target.value)}
                      placeholder="Name…"
                      className="bg-transparent text-[11px] text-white w-20 outline-none placeholder-gray-600"
                      autoFocus
                      onKeyDown={e => { if (e.key === "Enter") addSector(); if (e.key === "Escape") setAddingSector(false); }}
                    />
                    <button onClick={addSector} className="text-[10px] text-cyan-400">Add</button>
                    <button onClick={() => setAddingSector(false)} className="text-gray-500"><X size={10} /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingSector(true)}
                    className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-cyan-400 border border-dashed border-white/10 hover:border-cyan-500/30 rounded-full px-3 py-1.5 shrink-0 transition-all"
                  >
                    <Plus size={11} /> Sector
                  </button>
                )}
              </div>
            </div>

            {currentSector && (
              <div key={currentSector.id + refreshKey}>
                <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-4">{currentSector.label} — Watchlist</div>
                <SectorPanel sector={currentSector} onUpdate={updateSector} />
              </div>
            )}
          </div>
        )}

        {/* ADVISOR TAB */}
        {bottomTab === "advisor" && (
          <div className="px-4 py-5">
            <div className="flex items-center gap-2 mb-5">
              <Briefcase size={13} className="text-cyan-400" />
              <div className="text-[9px] text-gray-500 uppercase tracking-widest">AI Wealth Advisor</div>
            </div>
            <WealthManager />
          </div>
        )}

        {/* MACRO TAB */}
        {bottomTab === "macro" && (
          <div className="px-4 py-5">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={13} className="text-cyan-400" />
              <div className="text-[9px] text-gray-500 uppercase tracking-widest">Macroeconomic Indicators</div>
            </div>
            <MacroPanel key={refreshKey} />
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#030712]/95 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {([
            { id: "home", icon: House, label: "Home" },
            { id: "markets", icon: BarChart2, label: "Markets" },
            { id: "advisor", icon: Briefcase, label: "Advisor" },
            { id: "macro", icon: Activity, label: "Macro" },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setBottomTab(id)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                bottomTab === id
                  ? "text-cyan-400"
                  : "text-gray-600 hover:text-gray-400"
              }`}
            >
              <Icon size={20} />
              <span className="text-[9px] font-mono uppercase tracking-wider">{label}</span>
              {bottomTab === id && <div className="w-1 h-1 rounded-full bg-cyan-400" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
