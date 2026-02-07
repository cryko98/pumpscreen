
import { Token } from '../types';

const DEX_API = 'https://api.dexscreener.com/latest/dex';
const BOOSTS_API = 'https://api.dexscreener.com/token-boosts/top/v1';

export const fetchTrendingTokens = async (): Promise<Token[]> => {
  try {
    // 1. Lépés: Lekérjük a Top Boosted tokeneket (ez a valódi Trending lista alapja)
    const boostsResponse = await fetch(BOOSTS_API);
    let boostedTokens: any[] = [];
    if (boostsResponse.ok) {
      boostedTokens = await boostsResponse.json();
    }

    // Csak a Solana címeket gyűjtjük össze
    const solanaAddresses = boostedTokens
      .filter(t => t.chainId === 'solana')
      .map(t => t.tokenAddress)
      .slice(0, 30);

    let allPairs: any[] = [];

    // 2. Lépés: Ha vannak boosted tokenek, lekérjük a piaci adataikat csoportosan
    if (solanaAddresses.length > 0) {
      const pairsResponse = await fetch(`${DEX_API}/tokens/${solanaAddresses.join(',')}`);
      if (pairsResponse.ok) {
        const data = await pairsResponse.json();
        if (data.pairs) allPairs = [...data.pairs];
      }
    }

    // 3. Lépés: Kiegészítjük a keresést általános Solana találatokkal, hogy ne csak a "pump" szavasak legyenek
    // A keresést üresen vagy nagyon gyakori karakterekkel nem lehet futtatni, 
    // ezért több releváns, de nem korlátozó kulcsszót használunk ha kevés a találat.
    if (allPairs.length < 20) {
      const genericQueries = ['solana', 'raydium', 'dex', 'ai', 'dog'];
      for (const query of genericQueries) {
        const searchRes = await fetch(`${DEX_API}/search?q=${query}`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.pairs) {
            allPairs = [...allPairs, ...searchData.pairs.filter((p: any) => p.chainId === 'solana')];
          }
        }
        if (allPairs.length > 60) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (allPairs.length === 0) return [];

    // Duplikációk szűrése (ugyanaz a token több párban is lehet)
    const uniquePairsMap = new Map();
    allPairs.forEach(pair => {
      if (!pair.baseToken) return;
      const current = uniquePairsMap.get(pair.baseToken.address);
      // Mindig a legnagyobb likviditású párt tartjuk meg egy tokenhez
      if (!current || (pair.liquidity?.usd || 0) > (current.liquidity?.usd || 0)) {
        uniquePairsMap.set(pair.baseToken.address, pair);
      }
    });

    const uniquePairs = Array.from(uniquePairsMap.values());

    // Memecoin szűrés: Solana, nem stabil, van némi likviditás
    const filteredPairs = uniquePairs.filter((pair: any) => 
      !['SOL', 'USDC', 'USDT', 'DAI', 'mSOL', 'jitoSOL', 'WSOL'].includes(pair.baseToken.symbol) &&
      (pair.liquidity?.usd || 0) > 300
    );

    // Szigorú trending rendezés: 24h volumen + 1h változás súlyozva
    const sortedPairs = filteredPairs.sort((a: any, b: any) => {
      const volA = a.volume?.h24 || 0;
      const volB = b.volume?.h24 || 0;
      const scoreA = volA * (1 + Math.abs(a.priceChange?.h1 || 0) / 100);
      const scoreB = volB * (1 + Math.abs(b.priceChange?.h1 || 0) / 100);
      return scoreB - scoreA;
    });

    return sortedPairs.slice(0, 50).map((pair: any) => {
      const buys = pair.txns?.h24?.buys || 0;
      const sells = pair.txns?.h24?.sells || 0;
      const volume = pair.volume?.h24 || 0;
      
      const calculatedScore = Math.min(999, Math.floor((volume / 40000) + (buys / 40) + Math.abs(pair.priceChange?.m5 || 0) * 15));

      return {
        id: pair.pairAddress,
        address: pair.baseToken.address,
        pairAddress: pair.pairAddress,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price: parseFloat(pair.priceUsd) || 0,
        age: pair.pairCreatedAt ? calculateAge(pair.pairCreatedAt) : 'NEW',
        txns24h: buys + sells,
        volume24h: volume,
        makers24h: Math.floor(buys * 0.72) + 2,
        priceChange5m: pair.priceChange?.m5 || 0,
        priceChange1h: pair.priceChange?.h1 || 0,
        priceChange6h: pair.priceChange?.h6 || 0,
        priceChange24h: pair.priceChange?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        marketCap: pair.fdv || 0,
        image: pair.info?.imageUrl || `https://dd.dexscreener.com/ds-data/tokens/solana/${pair.baseToken.address}.png`,
        url: pair.url,
        score: calculatedScore,
        creator: pair.baseToken.address.slice(0, 4) + '...' + pair.baseToken.address.slice(-4),
        description: `Active Solana pair on ${pair.dexId.toUpperCase()}`,
        bondingCurve: Math.min(100, Math.floor((pair.liquidity?.usd / 65000) * 100)),
        holders: Math.floor(buys * 0.85) + 5
      };
    });
  } catch (error) {
    console.error("DexScreener trending fetch error:", error);
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
