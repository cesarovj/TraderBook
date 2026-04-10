export interface RawFill {
  activityType: string;
  dateTime: string;
  transDateTime: string;
  symbol: string;
  orderActionSource: string;
  internalOrderID: string;
  serviceOrderID: string;
  orderType: string;
  quantity: number;
  buySell: "Buy" | "Sell";
  price: string;
  price2: string;
  orderStatus: string;
  fillPrice: number;
  filledQuantity: number;
  tradeAccount: string;
  openClose: "Open" | "Close" | "";
  parentInternalOrderID: string;
  positionQuantity: number;
  fillExecutionServiceID: string;
  highDuringPosition: number;
  lowDuringPosition: number;
  note: string;
  accountBalance: number;
  exchangeOrderID: string;
  clientOrderID: string;
  timeInForce: string;
  username: string;
  isAutomated: string;
}

export interface Trade {
  id: string;
  symbol: string;
  entryDateTime: Date;
  exitDateTime: Date;
  direction: "Long" | "Short";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  isWin: boolean;
  duration: number; // seconds
  note: string;
}

export interface DayStats {
  date: string; // YYYY-MM-DD
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
}

export interface Metrics {
  netPnl: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  avgRR: number;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  largestWin: number;
  largestLoss: number;
  maxDrawdown: number;
  avgDuration: number; // seconds
  cumulativePnl: { date: string; pnl: number }[];
  dayStats: DayStats[];
}

// Futures contract multipliers ($ per point)
export const CONTRACT_MULTIPLIERS: Record<string, number> = {
  MES: 5,   // Micro E-mini S&P 500
  ES: 50,   // E-mini S&P 500
  MNQ: 2,   // Micro E-mini Nasdaq
  NQ: 20,   // E-mini Nasdaq
  MYM: 0.5, // Micro E-mini Dow
  YM: 5,    // E-mini Dow
  M2K: 5,   // Micro E-mini Russell 2000
  RTY: 50,  // E-mini Russell 2000
  MCL: 100, // Micro WTI Crude Oil
  CL: 1000, // WTI Crude Oil
  MGC: 10,  // Micro Gold
  GC: 100,  // Gold
};

// Price divisors — Sierra Chart stores some futures prices scaled
// MES/ES prices appear as e.g. 687000 meaning 6870.00 (÷100)
export const PRICE_DIVISORS: Record<string, number> = {
  MES: 100,
  ES: 100,
  MNQ: 100,
  NQ: 100,
  MYM: 1,
  YM: 1,
  M2K: 100,
  RTY: 100,
  MCL: 100,
  CL: 100,
  MGC: 100,
  GC: 100,
};

export function getBaseSymbol(symbol: string): string {
  // Sierra Chart format: {ROOT}{MONTH_CODE}{YY}_FUT_{EXCHANGE}
  // Month codes: F G H J K M N Q U V X Z
  // Use lazy match to stop at the first month-code letter followed by digits
  // e.g. MESM26_FUT_CME -> MES, ESM26_FUT_CME -> ES, MNQM26 -> MNQ
  const match = symbol.match(/^([A-Z]+?)([FGHJKMNQUVXZ]\d)/);
  if (match) return match[1];
  // Fallback: strip trailing digits and exchange suffix
  const fallback = symbol.match(/^([A-Z]+)/);
  return fallback ? fallback[1] : symbol;
}
