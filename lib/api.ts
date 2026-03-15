import { ActualDataPoint, ForecastDataPoint } from "./types";

export async function fetchActuals(
  from: string,
  to: string
): Promise<ActualDataPoint[]> {
  const res = await fetch(`/api/actuals?from=${from}&to=${to}`);
  if (!res.ok) throw new Error("Failed to fetch actuals");
  return res.json();
}

export async function fetchForecasts(
  from: string,
  to: string
): Promise<ForecastDataPoint[]> {
  const res = await fetch(`/api/forecasts?from=${from}&to=${to}`);
  if (!res.ok) throw new Error("Failed to fetch forecasts");
  return res.json();
}