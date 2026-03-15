"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { ChartDataPoint } from "@/lib/types";

interface Props {
  data: ChartDataPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const actual = payload.find((p: any) => p.dataKey === "actual")?.value;
  const forecast = payload.find((p: any) => p.dataKey === "forecast")?.value;
  const error =
    actual !== undefined && forecast !== undefined
      ? actual - forecast
      : undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm min-w-[160px]">
      <p className="font-semibold text-gray-700 mb-2 text-xs">{label}</p>
      {actual !== undefined && (
        <p className="text-blue-600 text-xs">
          Actual:{" "}
          <span className="font-bold">{actual.toLocaleString()} MW</span>
        </p>
      )}
      {forecast !== undefined && (
        <p className="text-green-600 text-xs">
          Forecast:{" "}
          <span className="font-bold">{forecast.toLocaleString()} MW</span>
        </p>
      )}
      {error !== undefined && (
        <p
          className={`mt-1.5 text-xs font-semibold ${
            error >= 0 ? "text-orange-500" : "text-purple-500"
          }`}
        >
          Error: {error >= 0 ? "+" : ""}
          {error.toFixed(0)} MW
        </p>
      )}
    </div>
  );
}

export default function ForecastChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm">
        No data for selected range
      </div>
    );
  }

  const yValues = data.flatMap((d) =>
    [d.actual, d.forecast].filter((v) => v !== undefined)
  ) as number[];
  const yMin = Math.floor(Math.min(...yValues) / 1000) * 1000 - 500;
  const yMax = Math.ceil(Math.max(...yValues) / 1000) * 1000 + 500;

  const tickInterval = Math.max(1, Math.floor(data.length / 8));

  return (
    <div className="w-full h-64 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            interval={tickInterval}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) =>
              value === "actual" ? "Actual Generation" : "Forecasted Generation"
            }
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6" }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#22c55e" }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}