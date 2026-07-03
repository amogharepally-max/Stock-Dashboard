export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

export interface NewsItem {
  headline: string;
  url: string;
  source: string;
  datetime: number;
  summary: string;
}

export interface Candle {
  t: number; // unix timestamp
  c: number; // close price
}

export interface StockMetrics {
  week52High: number | null;
  week52Low: number | null;
  ipoDate: string | null;
  ipoPrice: number | null;
}

export interface StockData {
  quote: StockQuote;
  news: NewsItem[];
  candles: Candle[];
  metrics: StockMetrics;
}

export interface WatchlistStock {
  symbol: string;
}

export interface Subsection {
  label: string;
  tickers: string[];
}

export interface Sector {
  id: string;
  label: string;
  subsections: Subsection[];
}

export interface MacroSeries {
  id: string;
  label: string;
  data: { date: string; value: number }[];
  latestNote?: string;
}
