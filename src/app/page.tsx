"use client";

import { useState, useCallback } from "react";
import { parseTradeLog } from "@/lib/parseTradeLog";
import { calculateMetrics, formatCurrency, formatDuration } from "@/lib/calculateMetrics";
import { Trade, Metrics } from "@/lib/types";
import FileUpload from "@/components/FileUpload";
import MetricCard from "@/components/MetricCard";
import PnLChart from "@/components/PnLChart";
import CalendarView from "@/components/CalendarView";
import TradeTable from "@/components/TradeTable";

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "trades">("overview");

  const handleFileLoaded = useCallback((content: string, name: string) => {
    try {
      setError("");
      const parsed = parseTradeLog(content);
      if (parsed.length === 0) {
        setError("No valid trades found. Make sure this is a Sierra Chart Trade Activity Log export.");
        return;
      }
      const m = calculateMetrics(parsed);
      setTrades(parsed);
      setMetrics(m);
      setFilename(name);
    } catch (e) {
      setError(`Failed to parse file: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  }, []);

  const hasData = metrics !== null && trades.length > 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Top Nav */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#6366f1" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">TraderBook</span>
        </div>
        <div className="flex items-center gap-3">
          {filename && (
            <span className="text-xs px-2 py-1 rounded" style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
              {filename}
            </span>
          )}
          <button
            onClick={() => document.getElementById("file-input")?.click()}
            className="text-sm px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{ background: "#6366f1", color: "white" }}
          >
            Import Log
          </button>
          <input
            id="file-input"
            type="file"
            accept=".txt,.csv,.tsv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => handleFileLoaded(ev.target?.result as string, file.name);
              reader.readAsText(file);
            }}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!hasData ? (
          /* Empty state */
          <div className="max-w-xl mx-auto mt-20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-3">Trading Analytics Dashboard</h1>
              <p style={{ color: "var(--text-secondary)" }}>
                Import your Sierra Chart Trade Activity Log to see your performance analytics.
              </p>
            </div>
            <FileUpload onFileLoaded={handleFileLoaded} />
            {error && (
              <div className="mt-4 p-3 rounded-lg text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}
            <div
              className="mt-6 rounded-xl p-5"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-medium text-white mb-2">How to export from Sierra Chart</p>
              <ol className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                <li>1. Open Sierra Chart → Trade Activity Log</li>
                <li>2. Click <strong className="text-white">File → Save / Export Trade Activity Log</strong></li>
                <li>3. Save as a <strong className="text-white">.txt</strong> tab-separated file</li>
                <li>4. Import it here</li>
              </ol>
            </div>
          </div>
        ) : (
          /* Dashboard */
          <>
            {/* Tab navigation */}
            <div className="flex items-center gap-1 mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
              {(["overview", "trades"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 text-sm font-medium capitalize transition-colors"
                  style={{
                    color: activeTab === tab ? "#a5b4fc" : "var(--text-secondary)",
                    borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
                    marginBottom: "-1px",
                  }}
                >
                  {tab}
                </button>
              ))}
              <div className="ml-auto text-xs" style={{ color: "var(--text-secondary)" }}>
                {trades.length} trades imported
              </div>
            </div>

            {activeTab === "overview" && (
              <>
                {/* Metric cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <MetricCard
                    label="Net P&L"
                    value={`${metrics.netPnl >= 0 ? "+" : ""}$${metrics.netPnl.toFixed(2)}`}
                    subLabel="Trades"
                    subValue={String(metrics.totalTrades)}
                    positive={metrics.netPnl >= 0}
                  />
                  <MetricCard
                    label="Win Rate"
                    value={`${metrics.winRate.toFixed(1)}%`}
                    subLabel="W / L"
                    subValue={`${metrics.winCount} / ${metrics.lossCount}`}
                    positive={metrics.winRate >= 50}
                  />
                  <MetricCard
                    label="Profit Factor"
                    value={isFinite(metrics.profitFactor) ? metrics.profitFactor.toFixed(2) : "∞"}
                    subLabel="Avg R:R"
                    subValue={`${metrics.avgRR.toFixed(2)}`}
                    positive={metrics.profitFactor >= 1}
                  />
                  <MetricCard
                    label="Avg Win / Loss"
                    value={`${formatCurrency(metrics.avgWin)}`}
                    subLabel="Avg loss"
                    subValue={`-${formatCurrency(metrics.avgLoss)}`}
                    positive={metrics.avgWin > metrics.avgLoss}
                  />
                </div>

                {/* Secondary metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <MetricCard
                    label="Largest Win"
                    value={`+$${metrics.largestWin.toFixed(2)}`}
                    positive={true}
                  />
                  <MetricCard
                    label="Largest Loss"
                    value={`-$${Math.abs(metrics.largestLoss).toFixed(2)}`}
                    positive={false}
                  />
                  <MetricCard
                    label="Max Drawdown"
                    value={`-$${metrics.maxDrawdown.toFixed(2)}`}
                    positive={false}
                  />
                  <MetricCard
                    label="Avg Trade Duration"
                    value={formatDuration(metrics.avgDuration)}
                    positive={null}
                  />
                </div>

                {/* Chart + Calendar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PnLChart data={metrics.cumulativePnl} />
                  <CalendarView dayStats={metrics.dayStats} />
                </div>
              </>
            )}

            {activeTab === "trades" && (
              <TradeTable trades={trades} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
