import { format } from "date-fns";
import { Trade, Metrics, DayStats } from "./types";

export function calculateMetrics(trades: Trade[]): Metrics {
  if (trades.length === 0) {
    return {
      netPnl: 0,
      winRate: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      avgRR: 0,
      totalTrades: 0,
      winCount: 0,
      lossCount: 0,
      largestWin: 0,
      largestLoss: 0,
      maxDrawdown: 0,
      avgDuration: 0,
      cumulativePnl: [],
      dayStats: [],
    };
  }

  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);

  const totalWinAmount = wins.reduce((s, t) => s + t.pnl, 0);
  const totalLossAmount = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  const netPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;
  const avgWin = wins.length > 0 ? totalWinAmount / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossAmount / losses.length : 0;
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;
  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.pnl)) : 0;
  const avgDuration = trades.reduce((s, t) => s + t.duration, 0) / trades.length;

  // Cumulative P&L over time
  let runningPnl = 0;
  let peakPnl = 0;
  let maxDrawdown = 0;

  const cumulativePnl = trades.map((t) => {
    runningPnl += t.pnl;
    if (runningPnl > peakPnl) peakPnl = runningPnl;
    const drawdown = peakPnl - runningPnl;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    return {
      date: format(t.exitDateTime, "yyyy-MM-dd HH:mm"),
      pnl: Math.round(runningPnl * 100) / 100,
    };
  });

  // Day stats
  const dayMap = new Map<string, DayStats>();
  for (const t of trades) {
    const day = format(t.exitDateTime, "yyyy-MM-dd");
    if (!dayMap.has(day)) {
      dayMap.set(day, { date: day, pnl: 0, trades: 0, wins: 0, losses: 0 });
    }
    const ds = dayMap.get(day)!;
    ds.pnl += t.pnl;
    ds.trades += 1;
    if (t.pnl > 0) ds.wins += 1;
    else ds.losses += 1;
  }

  // Round day pnl values
  const dayStats = Array.from(dayMap.values())
    .map((ds) => ({ ...ds, pnl: Math.round(ds.pnl * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    netPnl: Math.round(netPnl * 100) / 100,
    winRate: Math.round(winRate * 10) / 10,
    profitFactor: Math.round(profitFactor * 100) / 100,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    avgRR: Math.round(avgRR * 100) / 100,
    totalTrades: trades.length,
    winCount: wins.length,
    lossCount: losses.length,
    largestWin: Math.round(largestWin * 100) / 100,
    largestLoss: Math.round(largestLoss * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    avgDuration,
    cumulativePnl,
    dayStats,
  };
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(2)}K`;
  }
  return `${sign}$${abs.toFixed(2)}`;
}
