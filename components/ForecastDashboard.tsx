"use client";

import { useState } from "react";
import DateTimePicker from "./DateTimePicker";
import HorizonSlider from "./HorizonSlider";
import ForecastChart from "./ForecastChart";
import StatsPanel from "./StatsPanel";
import { useForecastData } from "@/hooks/useForecastData";

const DEFAULT_START = new Date("2024-01-01T00:00:00Z");
const DEFAULT_END = new Date("2024-01-03T00:00:00Z");

export default function ForecastDashboard() {
  const [startTime, setStartTime] = useState<Date>(DEFAULT_START);
  const [endTime, setEndTime] = useState<Date>(DEFAULT_END);
  const [horizonHours, setHorizonHours] = useState(4);

  const { chartData, stats, loading, error } = useForecastData(
    startTime,
    endTime,
    horizonHours
  );

  const handleStartChange = (d: Date) => {
    if (d < endTime) setStartTime(d);
    else alert("Start time must be before end time");
  };

  const handleEndChange = (d: Date) => {
    if (d > startTime) setEndTime(d);
    else alert("End time must be after start time");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🌬️</span>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">
            UK Wind Power Forecast Monitor
          </h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            National wind generation · Actual vs Forecast · January 2024
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">

        {/* Controls card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 items-end">
            <DateTimePicker
              label="Start Time"
              value={startTime}
              onChange={handleStartChange}
            />
            <DateTimePicker
              label="End Time"
              value={endTime}
              onChange={handleEndChange}
            />
            <HorizonSlider value={horizonHours} onChange={setHorizonHours} />
          </div>
        </div>

        {/* Chart card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">

          {/* Chart header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">
                Generation (MW) — Target Time End (UTC)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing forecasts published at least{" "}
                <span className="font-semibold text-blue-500">{horizonHours}h</span>{" "}
                before each target time
              </p>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 bg-blue-500 inline-block rounded" />
                Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 bg-green-500 inline-block rounded" />
                Forecast
              </span>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="h-64 sm:h-80 flex flex-col items-center justify-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Fetching generation data...</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="h-64 sm:h-80 flex items-center justify-center">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm max-w-sm text-center">
                <p className="font-semibold mb-1">⚠️ Failed to load data</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Chart */}
          {!loading && !error && (
            <>
              <ForecastChart data={chartData} />
              <StatsPanel stats={stats} />
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Data: Elexon BMRS API · FUELHH (actuals) · WINDFOR (forecasts)
        </p>
      </div>
    </div>
  );
}