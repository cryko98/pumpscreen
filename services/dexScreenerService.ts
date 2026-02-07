
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

    // 3. AGGRESSIVE EXPANDED SEARCH: Massive query list for high volume and variety
    // Expanded keywords to capture more of the current meta
    const searchQueries = [
      'pump', 'solana', 'raydium', 'ai', 'dog', 'pepe', 'wif', 
      'cat', 'moon', 'trump', 'elon', 'goat', 'bonk', 'popcat',
      'fart', 'zerebro', 'griff', 'toby', 'skibidi', 'pnut',
      'ai16z', 'fartcoin', 'act', 'moodeng', 'chillguy', 'luce', 
      'fwog', 'bert', 'max', 'mumu', 'giga', 'retardio', 'scf', 
      'habibi', 'aura', 'quant', 'ban', 'eagle', 'bome', 'jup'
    ];
    
    // Fetch multiple search pages concurrently
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

    // Deduplication and Ranking by Liquidity/Volume mix
    const uniquePairsMap = new Map();
    allPairs.forEach(pair => {
      if (!pair.baseToken || !pair.baseToken.address) return;
      const current = uniquePairsMap.get(pair.baseToken.address);
      // Keep the one with higher liquidity if duplicate
      if (!current || (pair.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
        uniquePairsMap.set(pair.baseToken.address, pair);
      }
    });

    const uniquePairs = Array.from(uniquePairsMap.values());

    // Filtering: Minimum viability checks
    const filteredPairs = uniquePairs.filter((pair: any) => 
      !['SOL', 'USDC', 'USDT', 'DAI', 'WSOL'].includes(pair.baseToken.symbol?.toUpperCase()) &&
      (pair.liquidity?.usd || 0) > 100 // Very low bar to maximize token count for the terminal
    );

    // Dynamic Ranking: Sort primarily by 24h volume
    const sortedPairs = filteredPairs.sort((a: any, b: any) => {
      const volA = a.volume?.h24 || 0;
      const volB = b.volume?.h24 || 0;
      return volB - volA;
    });

    // Return an even larger list (aiming for 500-1000)
    return sortedPairs.slice(0, 1000).map((pair: any) => {
      const buys = (pair.txns?.h24?.buys || 0) + (pair.txns?.h6?.buys || 0) + (pair.txns?.h1?.buys || 0);
      const sells = (pair.txns?.h24?.sells || 0) + (pair.txns?.h6?.sells || 0) + (pair.txns?.h1?.sells || 0);
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
        description: pair.info?.description || `Live degen pair on Solana.`,
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
