"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  subValue?: string;
  positive?: boolean | null; // null = neutral
  icon?: React.ReactNode;
}

export default function MetricCard({
  label,
  value,
  subLabel,
  subValue,
  positive,
  icon,
}: MetricCardProps) {
  const valueColor =
    positive === true
      ? "text-green-400"
      : positive === false
      ? "text-red-400"
      : "text-white";

  return (
    <div className="rounded-xl p-5 flex flex-col gap-2" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        {icon && <span style={{ color: "var(--text-secondary)" }}>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${valueColor}`}>
        {value}
      </div>
      {subLabel && subValue && (
        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span>{subLabel}:</span>
          <span className="font-medium text-white">{subValue}</span>
        </div>
      )}
    </div>
  );
}
