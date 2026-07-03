"use client";
import { useState, useRef, useEffect } from "react";
import { RefreshCw, ChevronDown, ChevronUp, TrendingUp, AlertCircle, Loader2, DollarSign, Send, MessageSquare } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Allocation {
  symbol: string;
  name: string;
  sector: string;
  allocation: number;
  amount: number;
  thesis: string;
  conviction: "High" | "Medium";
  timeHorizon: string;
}

interface Portfolio {
  summary: string;
  riskProfile: string;
  expectedReturn: string;
  allocations: Allocation[];
}

function AllocationCard({ item, totalAmount }: { item: Allocation; totalAmount: number }) {
  const [open, setOpen] = useState(false);
  const pct = (item.allocation * 100).toFixed(1);
  const barWidth = item.allocation * 100;

  return (
    <div className="rounded-xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-4 transition-all duration-200 hover:border-cyan-500/30">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-cyan-400">{item.symbol.slice(0, 4)}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-white text-sm tracking-widest">{item.symbol}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                item.conviction === "High"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
              }`}>
                {item.conviction} conviction
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono truncate">{item.name}</div>
            <div className="text-[10px] text-gray-600 font-mono">{item.sector} · {item.timeHorizon}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-mono font-bold text-white">${item.amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div className="text-xs font-mono text-cyan-400">{pct}%</div>
        </div>
      </div>

      {/* Allocation bar */}
      <div className="h-1 bg-white/5 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-700"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Reasoning toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-500 hover:text-cyan-400 transition-colors"
      >
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        Reasoning
      </button>

      {open && (
        <div className="mt-2.5 pt-2.5 border-t border-white/5">
          <p className="text-[11px] text-gray-300 leading-relaxed font-mono">{item.thesis}</p>
        </div>
      )}
    </div>
  );
}

export default function WealthManager() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  async function sendChat() {
    if (!chatInput.trim() || !portfolio || chatLoading) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    setChatHistory(h => [...h, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/wealth/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          portfolio,
          history: chatHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChatHistory(h => [...h, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setChatHistory(h => [...h, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  async function generate() {
    const num = Number(amount.replace(/[^0-9.]/g, ""));
    if (!num || num <= 0) {
      setError("Please enter a valid investment amount.");
      return;
    }
    setLoading(true);
    setError(null);
    setChatHistory([]);
    try {
      const res = await fetch("/api/wealth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPortfolio(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate portfolio");
    } finally {
      setLoading(false);
    }
  }

  function formatAmount(val: string) {
    const digits = val.replace(/[^0-9]/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("en-US");
  }

  const totalAmount = portfolio?.allocations.reduce((s, a) => s + a.amount, 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Input section */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/40 backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} className="text-cyan-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Goldman Sachs Private Wealth Advisor</span>
        </div>
        <h3 className="text-sm font-mono text-white mb-4">
          Enter your investment amount and receive an institutional-grade portfolio recommendation.
        </h3>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={e => setAmount(formatAmount(e.target.value))}
              onKeyDown={e => { if (e.key === "Enter" && !loading) generate(); }}
              placeholder="10,000"
              className="w-full bg-gray-800/80 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
            />
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-sm hover:bg-cyan-500/30 hover:border-cyan-400/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
            ) : portfolio ? (
              <><RefreshCw size={14} /> Regenerate</>
            ) : (
              <><TrendingUp size={14} /> Generate Portfolio</>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-rose-400 text-xs font-mono">
            <AlertCircle size={12} />
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-4 p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
            <p className="text-[11px] text-cyan-400/70 font-mono">
              Conducting deep market analysis and portfolio construction — this may take 20-40 seconds…
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {portfolio && !loading && (
        <div className="space-y-6">
          {/* Summary card */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/40 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600 mb-1">Portfolio Summary</div>
                <p className="text-sm text-gray-200 font-mono leading-relaxed max-w-2xl">{portfolio.summary}</p>
              </div>
              <div className="flex gap-3 flex-wrap shrink-0">
                <div className="text-center px-4 py-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider font-mono mb-0.5">Risk Profile</div>
                  <div className="text-xs font-mono text-cyan-400 font-semibold">{portfolio.riskProfile}</div>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider font-mono mb-0.5">Expected Return</div>
                  <div className="text-xs font-mono text-emerald-400 font-semibold">{portfolio.expectedReturn}</div>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-[9px] text-gray-600 uppercase tracking-wider font-mono mb-0.5">Positions</div>
                  <div className="text-xs font-mono text-white font-semibold">{portfolio.allocations.length} stocks</div>
                </div>
              </div>
            </div>

            {/* Sector breakdown */}
            <div className="pt-4 border-t border-white/5">
              <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600 mb-2">Sector Breakdown</div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(
                  portfolio.allocations.reduce<Record<string, number>>((acc, a) => {
                    acc[a.sector] = (acc[a.sector] ?? 0) + a.allocation;
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([sector, pct]) => (
                    <div key={sector} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                      <span className="text-[10px] font-mono text-gray-400">{sector}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{(pct * 100).toFixed(0)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Allocations grid */}
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600 mb-3">
              {portfolio.allocations.length} Position Portfolio · ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} deployed
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {portfolio.allocations
                .slice()
                .sort((a, b) => b.allocation - a.allocation)
                .map(item => (
                  <AllocationCard key={item.symbol} item={item} totalAmount={totalAmount} />
                ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
            <p className="text-[10px] text-amber-400/70 font-mono leading-relaxed">
              ⚠ This AI-generated portfolio analysis is for educational and research purposes only. It does not constitute personalized investment advice, a solicitation to buy or sell securities, or a recommendation from a registered investment advisor. Past performance does not guarantee future results. All investments involve risk, including potential loss of principal. Consult a licensed financial advisor before making investment decisions.
            </p>
          </div>

          {/* Chat */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/40 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
              <MessageSquare size={13} className="text-cyan-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Ask Your Advisor</span>
            </div>

            {/* Messages */}
            <div className="px-5 py-4 space-y-4 max-h-96 overflow-y-auto">
              {chatHistory.length === 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] text-gray-600 font-mono">Ask anything about your portfolio. For example:</p>
                  {[
                    "Why did you choose these sectors over others?",
                    "What's the biggest risk in this portfolio?",
                    "Why is NVDA weighted so heavily?",
                    "How would this portfolio perform in a recession?",
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      className="block text-left text-[10px] font-mono text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      ▸ {q}
                    </button>
                  ))}
                </div>
              )}

              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-[11px] font-mono leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cyan-500/15 border border-cyan-500/25 text-cyan-100"
                      : "bg-white/5 border border-white/5 text-gray-300"
                  }`}>
                    {msg.role === "assistant" && (
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">GS Advisor</div>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Loader2 size={11} className="animate-spin text-cyan-400" />
                      <span className="text-[11px] font-mono text-gray-500">Thinking…</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !chatLoading) sendChat(); }}
                placeholder="Ask about your portfolio…"
                className="flex-1 bg-gray-800/60 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={sendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
