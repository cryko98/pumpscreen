
import React from 'react';
import { Token } from '../types';
import { Star, ShieldCheck, AlertTriangle } from 'lucide-react';

interface TokenTableProps {
  tokens: Token[];
  onSelectToken: (token: Token) => void;
  selectedTokenId?: string;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  theme: 'dark' | 'light';
}

const formatValue = (val: number) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
};

const PercentCell = ({ value }: { value: number }) => {
  if (value === 0) return <span className="text-gray-500 font-mono text-[11px]">-</span>;
  const isPositive = value >= 0;
  return (
    <span className={`font-mono text-[11px] font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {isPositive ? '↑' : '↓'}{Math.abs(value).toFixed(1)}%
    </span>
  );
};

export const TokenTable: React.FC<TokenTableProps> = ({ tokens, onSelectToken, selectedTokenId, watchlist, onToggleWatchlist, theme }) => {
  const currentTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextClass = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr className={`${theme === 'dark' ? 'bg-[#111]' : 'bg-gray-100'} text-gray-500 text-[9px] uppercase font-black tracking-widest sticky top-0 z-10 border-b border-white/5`}>
            <th className="px-4 py-3">Token</th>
            <th className="px-2 py-3 text-right">Price</th>
            <th className="px-2 py-3 text-right">Age</th>
            <th className="px-2 py-3 text-right">Volume</th>
            <th className="px-2 py-3 text-right">1H</th>
            <th className="px-2 py-3 text-right">24H</th>
            <th className="px-2 py-3 text-right">Liquidity</th>
            <th className="px-4 py-3 text-right">MCAP</th>
            <th className="px-2 py-3 text-center">Audit</th>
            <th className="w-10 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-inherit">
          {tokens.map((token) => {
            const isWatched = watchlist.includes(token.id);
            const isSafe = token.liquidity > 20000; // Mock safety check logic
            return (
              <tr 
                key={token.id}
                onClick={() => onSelectToken(token)}
                className={`group cursor-pointer transition-all hover:bg-green-500/[0.03] border-b border-white/5 ${
                  selectedTokenId === token.id ? 'bg-green-500/[0.05]' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={token.image} 
                      className="w-8 h-8 rounded-lg bg-black/10 border border-black/10" 
                      onError={(e) => (e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=222&color=fff`)}
                      alt=""
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black text-sm group-hover:text-green-500 transition-colors uppercase italic tracking-tighter ${currentTextClass}`}>
                          {token.name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>{token.symbol}</span>
                    </div>
                  </div>
                </td>
                <td className={`px-2 py-3 text-right font-mono text-[11px] font-bold ${currentTextClass}`}>
                  ${token.price < 0.0001 ? token.price.toExponential(2) : token.price.toFixed(6)}
                </td>
                <td className="px-2 py-3 text-right text-gray-500 font-mono text-[11px]">
                  {token.age}
                </td>
                <td className={`px-2 py-3 text-right font-mono text-[11px] ${currentTextClass}`}>
                  {formatValue(token.volume24h)}
                </td>
                <td className="px-2 py-3 text-right">
                  <PercentCell value={token.priceChange1h} />
                </td>
                <td className="px-2 py-3 text-right">
                  <PercentCell value={token.priceChange24h} />
                </td>
                <td className={`px-2 py-3 text-right font-mono text-[11px] ${currentTextClass}`}>
                  {formatValue(token.liquidity)}
                </td>
                <td className="px-2 py-3 text-right font-mono text-[11px] font-bold text-green-500">
                  {formatValue(token.marketCap)}
                </td>
                <td className="px-2 py-3 text-center">
                   <div className="flex justify-center">
                      {isSafe ? (
                        <ShieldCheck size={16} className="text-green-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <AlertTriangle size={16} className="text-orange-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                   </div>
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(token.id);
                    }}
                    className={`p-1.5 rounded-lg transition-all ${isWatched ? 'text-green-500 bg-green-500/10' : 'text-gray-400 hover:text-green-500 hover:bg-green-500/5'}`}
                  >
                    <Star size={16} fill={isWatched ? 'currentColor' : 'none'} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
