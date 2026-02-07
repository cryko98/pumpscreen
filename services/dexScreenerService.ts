
import { Token } from '../types';

const DEX_API = 'https://api.dexscreener.com/latest/dex';
const BOOSTS_API = 'https://api.dexscreener.com/token-boosts/top/v1';

export const fetchTrendingTokens = async (): Promise<Token[]> => {
  try {
    // 1. Get Top Boosted (high priority trending)
    const boostsResponse = await fetch(BOOSTS_API);
    let boostedTokens: any[] = [];
    if (boostsResponse.ok) {
      boostedTokens = await boostsResponse.json();
    }

    const solanaAddresses = boostedTokens
      .filter(t => t.chainId === 'solana')
      .map(t => t.tokenAddress);

    let allPairs: any[] = [];

    // 2. Fetch market data for boosted tokens
    if (solanaAddresses.length > 0) {
      const chunks = [];
      for (let i = 0; i < solanaAddresses.length; i += 30) {
        chunks.push(solanaAddresses.slice(i, i + 30));
      }
      
      for (const chunk of chunks) {
        try {
          const pairsResponse = await fetch(`${DEX_API}/tokens/${chunk.join(',')}`);
          if (pairsResponse.ok) {
            const data = await pairsResponse.json();
            if (data.pairs) allPairs = [...allPairs, ...data.pairs];
          }
        } catch (e) { /* silent chunk fail */ }
      }
    }

    // 3. PUMP.FUN EXCLUSIVE SEARCH: Focused queries to capture launchpad meta
    const searchQueries = [
      'pump.fun', 'pump', 'bonding', 'curve'
    ];
    
    const searchPromises = searchQueries.map(async (q) => {
      try {
        const res = await fetch(`${DEX_API}/search?q=${q}`);
        if (res.ok) {
          const data = await res.json();
          return data.pairs ? data.pairs.filter((p: any) => p.chainId === 'solana') : [];
        }
      } catch (e) { return []; }
      return [];
    });

    const searchResults = await Promise.all(searchPromises);
    searchResults.forEach(results => {
      allPairs = [...allPairs, ...results];
    });

    if (allPairs.length === 0) return [];

    // Deduplication
    const uniquePairsMap = new Map();
    allPairs.forEach(pair => {
      if (!pair.baseToken || !pair.baseToken.address) return;
      
      // CRITICAL: PUMP.FUN ONLY FILTER
      // Tokens launched via pump.fun always have addresses ending in 'pump'
      if (!pair.baseToken.address.toLowerCase().endsWith('pump')) return;

      const current = uniquePairsMap.get(pair.baseToken.address);
      if (!current || (pair.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
        uniquePairsMap.set(pair.baseToken.address, pair);
      }
    });

    const uniquePairs = Array.from(uniquePairsMap.values());

    // Sorting by 24h volume for high activity feel
    const sortedPairs = uniquePairs.sort((a: any, b: any) => {
      const volA = a.volume?.h24 || 0;
      const volB = b.volume?.h24 || 0;
      return volB - volA;
    });

    return sortedPairs.slice(0, 1000).map((pair: any) => {
      const buys = (pair.txns?.h24?.buys || 0) + (pair.txns?.h6?.buys || 0) + (pair.txns?.h1?.buys || 0);
      const volume = pair.volume?.h24 || 0;
      
      const calculatedScore = Math.min(999, Math.floor((volume / 5000) + (buys / 5)));

      return {
        id: pair.pairAddress,
        address: pair.baseToken.address,
        pairAddress: pair.pairAddress,
        name: pair.baseToken.name || 'Unknown',
        symbol: pair.baseToken.symbol || '???',
        price: parseFloat(pair.priceUsd) || 0,
        age: pair.pairCreatedAt ? calculateAge(pair.pairCreatedAt) : 'NEW',
        txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
        volume24h: volume,
        makers24h: Math.floor(buys * 0.7),
        priceChange5m: pair.priceChange?.m5 || 0,
        priceChange1h: pair.priceChange?.h1 || 0,
        priceChange6h: pair.priceChange?.h6 || 0,
        priceChange24h: pair.priceChange?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        marketCap: pair.fdv || pair.marketCap || 0,
        image: pair.info?.imageUrl || `https://dd.dexscreener.com/ds-data/tokens/solana/${pair.baseToken.address}.png`,
        url: pair.url,
        score: calculatedScore,
        creator: pair.baseToken.address.slice(0, 4) + '...' + pair.baseToken.address.slice(-4),
        description: pair.info?.description || `Pump.fun launched token on Solana.`,
        bondingCurve: Math.min(100, Math.floor((pair.liquidity?.usd / 60000) * 100)),
        holders: Math.floor(buys * 0.8) + 5
      };
    });
  } catch (error) {
    console.error("Sync Failure:", error);
    return [];
  }
};

const calculateAge = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};
