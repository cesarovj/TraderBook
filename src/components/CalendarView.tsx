"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from "date-fns";
import { useState } from "react";
import { DayStats } from "@/lib/types";

interface CalendarViewProps {
  dayStats: DayStats[];
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pnlColor(pnl: number): string {
  if (pnl > 0) return "rgba(34,197,94,0.15)";
  if (pnl < 0) return "rgba(239,68,68,0.15)";
  return "transparent";
}

function pnlBorder(pnl: number): string {
  if (pnl > 0) return "1px solid rgba(34,197,94,0.35)";
  if (pnl < 0) return "1px solid rgba(239,68,68,0.35)";
  return "1px solid var(--border)";
}

function formatPnl(pnl: number): string {
  const abs = Math.abs(pnl);
  const sign = pnl < 0 ? "-" : "+";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export default function CalendarView({ dayStats }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Default to the month of the last trade, or current month
    if (dayStats.length > 0) {
      const lastDay = dayStats[dayStats.length - 1].date;
      return new Date(lastDay + "T12:00:00");
    }
    return new Date();
  });

  const statsMap = new Map(dayStats.map((ds) => [ds.date, ds]));

  const firstDay = startOfMonth(currentMonth);
  const lastDay = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Pad with empty cells for the start of the week
  const startPad = getDay(firstDay);
  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...days,
  ];

  // Monthly totals
  const monthDays = dayStats.filter((ds) =>
    ds.date.startsWith(format(currentMonth, "yyyy-MM"))
  );
  const monthPnl = monthDays.reduce((s, d) => s + d.pnl, 0);
  const monthTrades = monthDays.reduce((s, d) => s + d.trades, 0);
  const monthWins = monthDays.filter((d) => d.pnl > 0).length;

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="rounded-lg px-2 py-1 text-sm transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
          >
            ‹
          </button>
          <h3 className="text-base font-semibold text-white">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="rounded-lg px-2 py-1 text-sm transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
          >
            ›
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>
            {monthTrades} trades · {monthWins} green days
          </span>
          <span className={`font-semibold ${monthPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            {monthPnl >= 0 ? "+" : ""}${monthPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium py-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const key = format(day, "yyyy-MM-dd");
          const stats = statsMap.get(key);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={key}
              className="rounded-lg p-1.5 min-h-[72px] flex flex-col"
              style={{
                background: stats ? pnlColor(stats.pnl) : "transparent",
                border: today ? "1px solid #6366f1" : stats ? pnlBorder(stats.pnl) : "1px solid transparent",
                opacity: inMonth ? 1 : 0.3,
              }}
            >
              <span
                className="text-xs font-medium mb-1"
                style={{ color: today ? "#a5b4fc" : "var(--text-secondary)" }}
              >
                {format(day, "d")}
              </span>
              {stats && (
                <>
                  <span
                    className={`text-xs font-bold leading-tight ${
                      stats.pnl >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {formatPnl(stats.pnl)}
                  </span>
                  <span className="text-xs mt-auto" style={{ color: "var(--text-secondary)" }}>
                    {stats.trades} trade{stats.trades !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {stats.wins}W / {stats.losses}L
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
