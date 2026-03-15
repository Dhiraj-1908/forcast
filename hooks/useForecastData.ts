"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchActuals, fetchForecasts } from "@/lib/api";
import {
  filterForecastsByHorizon,
  buildChartData,
  computeStats,
} from "@/lib/transforms";
import { ActualDataPoint, ForecastDataPoint } from "@/lib/types";

export function useForecastData(
  startTime: Date,
  endTime: Date,
  horizonHours: number
) {
  const [actuals, setActuals] = useState<ActualDataPoint[]>([]);
  const [forecasts, setForecasts] = useState<ForecastDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromStr = startTime.toISOString().split("T")[0];
  const toStr = endTime.toISOString().split("T")[0];

  useEffect(() => {
    setLoading(true);
    setError(null);
    setActuals([]);
    setForecasts([]);

    Promise.all([fetchActuals(fromStr, toStr), fetchForecasts(fromStr, toStr)])
      .then(([acts, fcsts]) => {
        setActuals(acts);
        setForecasts(fcsts);
        // Verify horizon logic in console
        console.log(`Fetched ${acts.length} actuals, ${fcsts.length} forecasts`);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fromStr, toStr]);

  const filteredForecasts = useMemo(() => {
    const filtered = filterForecastsByHorizon(forecasts, horizonHours);
    console.log(
      `Horizon ${horizonHours}h → ${filtered.length} forecasts after filtering`
    );
    // Spot-check: verify publishTime is always <= startTime - horizonHours
    const violations = filtered.filter((f) => {
      const diff =
        (new Date(f.startTime).getTime() - new Date(f.publishTime).getTime()) /
        (1000 * 60 * 60);
      return diff < horizonHours;
    });
    if (violations.length > 0) {
      console.warn(`⚠️ ${violations.length} horizon violations found!`, violations);
    } else {
      console.log(`✅ All forecasts respect the ${horizonHours}h horizon`);
    }
    return filtered;
  }, [forecasts, horizonHours]);

  const chartData = useMemo(
    () => buildChartData(actuals, filteredForecasts),
    [actuals, filteredForecasts]
  );

  const stats = useMemo(() => computeStats(chartData), [chartData]);

  return { chartData, stats, loading, error };
}