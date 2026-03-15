"use client";

interface Stats {
  mae: number;
  rmse: number;
  bias: number;
  maxError: number;
  count: number;
}

interface Props {
  stats: Stats | null;
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

export default function StatsPanel({ stats }: Props) {
  if (!stats) return null;

  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      <StatCard
        label="MAE"
        value={`${fmt(stats.mae)} MW`}
        sub="Mean Absolute Error"
      />
      <StatCard
        label="RMSE"
        value={`${fmt(stats.rmse)} MW`}
        sub="Root Mean Square Error"
      />
      <StatCard
        label="Bias"
        value={`${stats.bias >= 0 ? "+" : ""}${fmt(stats.bias)} MW`}
        sub={stats.bias >= 0 ? "Under-forecast" : "Over-forecast"}
      />
      <StatCard
        label="Max Error"
        value={`${fmt(stats.maxError)} MW`}
        sub={`Over ${stats.count} points`}
      />
    </div>
  );
}