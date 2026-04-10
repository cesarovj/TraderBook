import { RawFill, Trade, getBaseSymbol, CONTRACT_MULTIPLIERS, PRICE_DIVISORS } from "./types";

const HEADERS = [
  "activityType", "dateTime", "transDateTime", "symbol", "orderActionSource",
  "internalOrderID", "serviceOrderID", "orderType", "quantity", "buySell",
  "price", "price2", "orderStatus", "fillPrice", "filledQuantity", "tradeAccount",
  "openClose", "parentInternalOrderID", "positionQuantity", "fillExecutionServiceID",
  "highDuringPosition", "lowDuringPosition", "note", "accountBalance", "exchangeOrderID",
  "clientOrderID", "timeInForce", "username", "isAutomated",
];

function parseRow(row: string): RawFill | null {
  const cols = row.split("\t");
  if (cols.length < HEADERS.length) return null;
  if (cols[0] !== "Fills") return null;

  return {
    activityType: cols[0],
    dateTime: cols[1].trim(),
    transDateTime: cols[2].trim(),
    symbol: cols[3].trim(),
    orderActionSource: cols[4].trim(),
    internalOrderID: cols[5].trim(),
    serviceOrderID: cols[6].trim(),
    orderType: cols[7].trim(),
    quantity: parseFloat(cols[8]) || 0,
    buySell: cols[9].trim() as "Buy" | "Sell",
    price: cols[10].trim(),
    price2: cols[11].trim(),
    orderStatus: cols[12].trim(),
    fillPrice: parseFloat(cols[13]) || 0,
    filledQuantity: parseFloat(cols[14]) || 0,
    tradeAccount: cols[15].trim(),
    openClose: cols[16].trim() as "Open" | "Close" | "",
    parentInternalOrderID: cols[17].trim(),
    positionQuantity: parseFloat(cols[18]) || 0,
    fillExecutionServiceID: cols[19].trim(),
    highDuringPosition: parseFloat(cols[20]) || 0,
    lowDuringPosition: parseFloat(cols[21]) || 0,
    note: cols[22].trim(),
    accountBalance: parseFloat(cols[23]) || 0,
    exchangeOrderID: cols[24].trim(),
    clientOrderID: cols[25].trim(),
    timeInForce: cols[26].trim(),
    username: cols[27]?.trim() || "",
    isAutomated: cols[28]?.trim() || "",
  };
}

function parseDateTime(dt: string): Date {
  // Format: "2026-04-10  13:41:34.751549" — Sierra Chart stores times in UTC
  // Append "Z" so JavaScript parses as UTC; date-fns format() will display in local time
  const cleaned = dt.replace(/\s+/, "T").split(".")[0];
  return new Date(cleaned + "Z");
}

function computePnl(
  direction: "Long" | "Short",
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  baseSymbol: string,
): number {
  const multiplier = CONTRACT_MULTIPLIERS[baseSymbol] ?? 1;
  const divisor = PRICE_DIVISORS[baseSymbol] ?? 1;
  const entry = entryPrice / divisor;
  const exit = exitPrice / divisor;
  const priceDiff = direction === "Long" ? exit - entry : entry - exit;
  return priceDiff * quantity * multiplier;
}

export function parseTradeLog(content: string): Trade[] {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  const fills: RawFill[] = [];

  for (const line of lines) {
    const fill = parseRow(line);
    if (fill) fills.push(fill);
  }

  const trades: Trade[] = [];

  // Match Open fills with their corresponding Close fills
  // Strategy: iterate through fills, track open positions by symbol
  // Each open fill creates a position; the next close fill for that symbol closes it
  interface OpenPosition {
    fill: RawFill;
    direction: "Long" | "Short";
  }

  const openPositions: Map<string, OpenPosition[]> = new Map();

  for (const fill of fills) {
    const symbol = fill.symbol;

    if (fill.openClose === "Open") {
      const direction: "Long" | "Short" = fill.buySell === "Buy" ? "Long" : "Short";
      if (!openPositions.has(symbol)) openPositions.set(symbol, []);
      openPositions.get(symbol)!.push({ fill, direction });
    } else if (fill.openClose === "Close") {
      const positions = openPositions.get(symbol);
      if (!positions || positions.length === 0) continue;

      // Find matching open: opposite direction
      const closeDirection: "Long" | "Short" = fill.buySell === "Buy" ? "Long" : "Short";
      const openIdx = positions.findIndex((p) => p.direction !== closeDirection);
      if (openIdx === -1) continue;

      const open = positions.splice(openIdx, 1)[0];
      const baseSymbol = getBaseSymbol(symbol);

      // Use transDateTime (exchange fill time) rather than dateTime (SC receipt time)
      const entryDateTime = parseDateTime(open.fill.transDateTime);
      const exitDateTime = parseDateTime(fill.transDateTime);

      const pnl = computePnl(
        open.direction,
        open.fill.fillPrice,
        fill.fillPrice,
        Math.min(open.fill.filledQuantity, fill.filledQuantity),
        baseSymbol,
      );

      trades.push({
        id: `${open.fill.internalOrderID}-${fill.internalOrderID}`,
        symbol: baseSymbol,
        entryDateTime,
        exitDateTime,
        direction: open.direction,
        entryPrice: open.fill.fillPrice / (PRICE_DIVISORS[baseSymbol] ?? 1),
        exitPrice: fill.fillPrice / (PRICE_DIVISORS[baseSymbol] ?? 1),
        quantity: Math.min(open.fill.filledQuantity, fill.filledQuantity),
        pnl: Math.round(pnl * 100) / 100,
        isWin: pnl > 0,
        duration: (exitDateTime.getTime() - entryDateTime.getTime()) / 1000,
        note: open.fill.note || fill.note,
      });
    }
  }

  return trades.sort((a, b) => a.entryDateTime.getTime() - b.entryDateTime.getTime());
}
