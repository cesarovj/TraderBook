"use client";

import { Trade } from "@/lib/types";
import { format } from "date-fns";
import { formatDuration } from "@/lib/calculateMetrics";

interface TradeTableProps {
  trades: Trade[];
}

export default function TradeTable({ trades }: TradeTableProps) {
  const sorted = [...trades].reverse(); // most recent first

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <h3 className="font-semibold text-white">Recent Trades</h3>
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {trades.length} total
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Symbol", "Entry Time", "Dir", "Entry", "Exit", "Qty", "Duration", "P&L"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((trade) => (
              <tr
                key={trade.id}
                className="transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: "1px solid rgba(42,45,62,0.5)" }}
              >
                <td className="px-4 py-3 font-medium text-white">{trade.symbol}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                  {format(trade.entryDateTime, "MMM d, HH:mm:ss")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      background: trade.direction === "Long" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: trade.direction === "Long" ? "#4ade80" : "#f87171",
                    }}
                  >
                    {trade.direction}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-white">
                  {trade.entryPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-white">
                  {trade.exitPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                  {trade.quantity}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {formatDuration(trade.duration)}
                </td>
                <td className="px-4 py-3 font-semibold">
                  <span className={trade.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trades.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            No trades yet
          </div>
        )}
      </div>
    </div>
  );
}
