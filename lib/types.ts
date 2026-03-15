export interface ActualDataPoint {
  startTime: string;
  generation: number;
}

export interface ForecastDataPoint {
  startTime: string;
  publishTime: string;
  generation: number;
}

export interface FilteredForecast {
  startTime: string;
  generation: number;
  publishTime: string;
}

export interface ChartDataPoint {
  time: string;
  actual?: number;
  forecast?: number;
  forecastPublishTime?: string;
}
