import { ActualDataPoint, ForecastDataPoint } from "./types";

const ELEXON_BASE = "https://data.elexon.co.uk/bmrs/api/v1";

export async function fetchElexonActuals(
  from: string,
  to: string
): Promise<ActualDataPoint[]> {
  const url = `${ELEXON_BASE}/datasets/FUELHH/stream?settlementDateFrom=${from}&settlementDateTo=${to}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Elexon actuals error: ${res.status}`);

  const data = await res.json();
  const items = Array.isArray(data) ? data : data?.data ?? [];

  return items
    .filter((d: any) => d.fuelType === "WIND")
    .map((d: any) => ({
      startTime: d.startTime,
      generation: Number(d.generation),
    }));
}

export async function fetchElexonForecasts(
  from: string,
  to: string
): Promise<ForecastDataPoint[]> {
  // Go 48h earlier on publishTime to capture forecasts made before the window
  const publishFrom = new Date(new Date(from).getTime() - 48 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19) + "Z";

  const publishTo = new Date(to + "T23:59:59Z").toISOString().slice(0, 19) + "Z";

  const url = `${ELEXON_BASE}/datasets/WINDFOR/stream?publishDateTimeFrom=${publishFrom}&publishDateTimeTo=${publishTo}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Elexon forecasts error: ${res.status}`);

  const data = await res.json();
  const items = Array.isArray(data) ? data : data?.data ?? [];

  // Filter: startTime must be within requested range, horizon 0-48h
  const fromMs = new Date(from + "T00:00:00Z").getTime();
  const toMs = new Date(to + "T23:59:59Z").getTime();

  return items
    .filter((d: any) => {
      if (!d.startTime || !d.publishTime) return false;
      const startMs = new Date(d.startTime).getTime();
      const publishMs = new Date(d.publishTime).getTime();
      const horizonHours = (startMs - publishMs) / (1000 * 60 * 60);
      return (
        startMs >= fromMs &&
        startMs <= toMs &&
        horizonHours >= 0 &&
        horizonHours <= 48
      );
    })
    .map((d: any) => ({
      startTime: d.startTime,
      publishTime: d.publishTime,
      generation: Number(d.generation),
    }));
}