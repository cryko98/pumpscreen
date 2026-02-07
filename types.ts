
export interface Token {
  id: string;
  address: string;
  pairAddress: string;
  name: string;
  symbol: string;
  price: number;
  age: string;
  txns24h: number;
  volume24h: number;
  makers24h: number;
  priceChange5m: number;
  priceChange1h: number;
  priceChange6h: number;
  priceChange24h: number;
  liquidity: number;
  marketCap: number;
  image: string;
  url: string;
  score: number; // Lightning bolt score
  // Added properties to resolve type errors in constants.tsx and support Gemini analysis
  creator?: string;
  description?: string;
  bondingCurve?: number;
  holders?: number;
}

export interface MarketStats {
  volume24h: string;
  txns24h: string;
  latestBlock: string;
  blockTime: string;
}
