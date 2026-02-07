
import React, { useState } from 'react';
import { Token } from '../types';
import { X, TrendingUp, Shield, BarChart3, Users, ExternalLink, Copy, Check, Zap, ArrowUpRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations, Language } from '../translations';

interface TokenDetailsProps {
  token: Token;
  onClose: () => void;
  isWatched: boolean;
  onToggleWatchlist: () => void;
  language: Language;
  theme?: 'dark' | 'light';
}

export const TokenDetails: React.FC<TokenDetailsProps> = ({ token, onClose, isWatched, onToggleWatchlist, language, theme = 'dark' }) => {
  const [copied, setCopied] = useState(false);
  const t = translations[language];
  const currentTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const copyCA = () => {
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToPumpFun = () => {
    const pumpUrl = `https://pump.fun/coin/${token.address}`;
    window.open(pumpUrl, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar bg-inherit">
      {/* Detail Header */}
      <div className="p-6 border-b border-black/5 flex items-center justify-between bg-inherit sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-black/5 border border-black/5 overflow-hidden shadow-2xl relative">
            <img 
              src={token.image} 
              alt={token.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=22c55e&color=fff`;
              }} 
            />
          </div>
          <div>
            <h1 className={`text-2xl font-black italic tracking-tighter uppercase ${currentTextClass}`}>
              {token.name} <span className="text-gray-500 text-sm font-mono normal-case">{token.symbol}</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[9px] px-2 py-0.5 bg-green-500 text-black rounded font-black tracking-widest uppercase">SOLANA</span>
              <div 
                onClick={copyCA}
                className="flex items-center gap-2 px-2 py-0.5 bg-black/5 hover:bg-black/10 text-xs text-gray-500 font-mono rounded cursor-pointer transition-colors border border-black/5"
              >
                <span>{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={onToggleWatchlist}
             className={`p-3 rounded-xl border transition-all ${isWatched ? 'bg-green-500 border-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-black/5 border-black/10 text-gray-400 hover:text-green-500'}`}
           >
              <Star size={20} fill={isWatched ? 'currentColor' : 'none'} />
           </button>
           <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-xl transition-colors text-gray-500">
             <X size={24} />
           </button>
        </div>
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          {/* Chart Container */}
          <div className="relative h-[500px] rounded-3xl overflow-hidden bg-black/40 border border-black/10 shadow-2xl">
            <iframe 
              src={`https://dexscreener.com/solana/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
              className="w-full h-full border-none"
              title="DexScreener Chart"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: t.mcap, value: token.marketCap > 1000000 ? `$${(token.marketCap / 1000000).toFixed(2)}M` : `$${(token.marketCap / 1000).toFixed(1)}K`, icon: <BarChart3 size={16} className="text-green-500"/> },
              { label: t.liquidity, value: `$${(token.liquidity / 1000).toFixed(1)}K`, icon: <Shield size={16} className="text-blue-500"/> },
              { label: t.volume, value: `$${(token.volume24h / 1000).toFixed(1)}K`, icon: <TrendingUp size={16} className="text-purple-500"/> },
              { label: t.age, value: token.age, icon: <Users size={16} className="text-orange-500"/> },
            ].map((stat, i) => (
              <div key={i} className={`p-4 rounded-2xl border border-white/5 bg-black/10 backdrop-blur-sm`}>
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  {stat.icon}
                  <span className="text-[9px] uppercase font-black tracking-widest">{stat.label}</span>
                </div>
                <div className={`text-lg font-black font-mono tracking-tight ${currentTextClass}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className={`rounded-3xl p-6 border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl`}>
            <h3 className={`text-xl font-black mb-6 flex items-center gap-2 italic tracking-tighter uppercase ${currentTextClass}`}>
              <Zap size={20} className="text-green-500 fill-green-500" />
              TERMINAL
            </h3>

            <button 
              onClick={goToPumpFun}
              className="group relative w-full py-8 bg-green-500 text-black font-black rounded-2xl hover:bg-green-400 transition-all shadow-xl shadow-green-500/20 flex flex-col items-center justify-center gap-1 overflow-hidden active:scale-95"
            >
              <div className="relative flex items-center gap-2 text-lg uppercase tracking-tighter italic">
                {t.tradeOnPump}
                <ArrowUpRight size={20} />
              </div>
            </button>
            
            <div className="mt-8 p-4 bg-black/20 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span>Bonding Curve</span>
                <span className="text-green-500">{token.bondingCurve || 0}%</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${token.bondingCurve || 0}%` }}
                  className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Holders</span>
                <span className={`text-xs font-mono font-bold ${currentTextClass}`}>{token.holders || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Transactions</span>
                <span className={`text-xs font-mono font-bold ${currentTextClass}`}>{token.txns24h}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
