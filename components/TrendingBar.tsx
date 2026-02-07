
import React from 'react';
import { Token } from '../types';

interface TrendingBarProps {
  tokens: Token[];
  onSelect: (token: Token) => void;
}

export const TrendingBar: React.FC<TrendingBarProps> = ({ tokens, onSelect }) => {
  // Sort by volume for the trending bar
  const trending = [...tokens].sort((a, b) => b.volume24h - a.volume24h).slice(0, 10);

  return (
    <div className="w-full bg-green-500/10 border-y border-green-500/20 py-2 overflow-hidden whitespace-nowrap relative">
      <div className="flex animate-marquee hover:pause-marquee gap-8">
        {[...trending, ...trending].map((token, idx) => (
          <div 
            key={`${token.id}-${idx}`}
            onClick={() => onSelect(token)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-gray-500 font-bold text-xs">#{ (idx % trending.length) + 1 }</span>
            <img src={token.image} className="w-5 h-5 rounded-full bg-black/20" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <span className="font-bold text-sm text-white group-hover:text-green-500 transition-colors">{token.symbol}</span>
            <span className={`text-xs font-mono ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {token.priceChange24h >= 0 ? '↑' : '↓'}{Math.abs(token.priceChange24h).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .hover\\:pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
