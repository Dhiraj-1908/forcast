import {
  ActualDataPoint,
  ChartDataPoint,
  FilteredForecast,
  ForecastDataPoint,
} from "./types";
import { format, parseISO } from "date-fns";

// Normalize to hourly key (drop minutes) for alignment between FUELHH and WINDFOR
function toHourKey(isoString: string): string {
  const d = new Date(isoString);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

export function filterForecastsByHorizon(
  forecasts: ForecastDataPoint[],
  horizonHours: number
): FilteredForecast[] {
  // Group by normalized hourly startTime
  const grouped = new Map<string, ForecastDataPoint[]>();
  for (const f of forecasts) {
    const key = toHourKey(f.startTime);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(f);
  }

  const result: FilteredForecast[] = [];

  for (const [hourKey, preds] of grouped.entries()) {
    const targetTime = new Date(hourKey).getTime();
    const cutoff = targetTime - horizonHours * 60 * 60 * 1000;

    const candidates = preds.filter(
      (f) => new Date(f.publishTime).getTime() <= cutoff
    );

    if (candidates.length === 0) continue;

    candidates.sort(
      (a, b) =>
        new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
    );

    result.push({
      startTime: hourKey, // normalized hour key for alignment
      generation: candidates[0].generation,
      publishTime: candidates[0].publishTime,
    });
  }

  return result.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export function buildChartData(
  actuals: ActualDataPoint[],
  forecasts: FilteredForecast[]
): ChartDataPoint[] {
  const map = new Map<string, ChartDataPoint>();

  // Index actuals by their hour key
  for (const a of actuals) {
    const key = toHourKey(a.startTime);
    const label = format(parseISO(key), "dd/MM HH:mm");
    const existing = map.get(key);
    if (existing) {
      // Average if two 30-min slots fall in same hour
      existing.actual = ((existing.actual ?? 0) + a.generation) / 2;
    } else {
      map.set(key, { time: label, actual: a.generation });
    }
  }

  // Merge forecasts (already on hour keys)
  for (const f of forecasts) {
    const label = format(parseISO(f.startTime), "dd/MM HH:mm");
    const existing = map.get(f.startTime);
    if (existing) {
      existing.forecast = f.generation;
      existing.forecastPublishTime = f.publishTime;
    } else {
      map.set(f.startTime, {
        time: label,
        forecast: f.generation,
        forecastPublishTime: f.publishTime,
      });
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([, v]) => v);
}

export function computeStats(data: ChartDataPoint[]) {
  const pairs = data.filter(
    (d) => d.actual !== undefined && d.forecast !== undefined
  );
  if (pairs.length === 0) return null;

  const errors = pairs.map((d) => d.actual! - d.forecast!);
  const absErrors = errors.map(Math.abs);
  const mae = absErrors.reduce((a, b) => a + b, 0) / absErrors.length;
  const rmse = Math.sqrt(
    errors.map((e) => e * e).reduce((a, b) => a + b, 0) / errors.length
  );
  const bias = errors.reduce((a, b) => a + b, 0) / errors.length;
  const maxError = Math.max(...absErrors);

  return { mae, rmse, bias, maxError, count: pairs.length };
}