"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  pnl: number;
}

interface PnLChartProps {
  data: DataPoint[];
}

function formatYAxis(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const pnl = payload[0].value as number;
    const isPositive = pnl >= 0;
    return (
      <div
        className="rounded-lg px-3 py-2 text-sm shadow-xl"
        style={{ background: "#1e2130", border: "1px solid #2a2d3e" }}
      >
        <div style={{ color: "#8892a4" }}>{label}</div>
        <div className={`font-bold mt-0.5 ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? "+" : ""}${pnl.toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
}

export default function PnLChart({ data }: PnLChartProps) {
  const isPositive = data.length > 0 && data[data.length - 1].pnl >= 0;
  const color = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <h3 className="text-sm font-medium mb-4" style={{ color: "var(--text-secondary)" }}>
        Cumulative Net P&amp;L
      </h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm" style={{ color: "var(--text-secondary)" }}>
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8892a4", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "#2a2d3e" }}
              tickFormatter={(v: string) => v.slice(0, 10)}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: "#8892a4", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke={color}
              strokeWidth={2}
              fill="url(#pnlGradient)"
              dot={false}
              activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
