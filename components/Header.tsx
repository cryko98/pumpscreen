
import React from 'react';
import { Search, Zap, TrendingUp, BarChart } from 'lucide-react';
import { translations, Language } from '../translations';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onMenuClick: () => void;
  sortBy: string;
  setSortBy: (s: any) => void;
  language: Language;
  theme: 'dark' | 'light';
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, onMenuClick, sortBy, setSortBy, language, theme }) => {
  const t = translations[language];
  const currentTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className="flex flex-col w-full shrink-0">
      <header className="h-16 border-b border-white/5 px-4 flex items-center justify-between bg-inherit sticky top-0 z-30">
        <div className="flex items-center gap-4 flex-1">
          <div className={`flex items-center gap-1.5 rounded-xl p-1 border border-white/5 ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-100'}`}>
            <button 
              onClick={() => setSortBy('trending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'trending' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-green-500'
              }`}
            >
              <Zap size={14} className={sortBy === 'trending' ? 'fill-black' : ''} />
              {t.trending}
            </button>
            <button 
              onClick={() => setSortBy('gainers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'gainers' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-purple-500'
              }`}
            >
              <TrendingUp size={14} />
              {t.gainers}
            </button>
            <button 
              onClick={() => setSortBy('age')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                sortBy === 'age' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-orange-500'
              }`}
            >
              <BarChart size={14} />
              {t.newPairs}
            </button>
          </div>

          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-green-500/50 transition-colors ${theme === 'dark' ? 'bg-black/20 text-white' : 'bg-gray-50 text-gray-900'}`}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Global Vol</span>
              <span className="text-xs font-black text-green-500">$14.2B</span>
           </div>
        </div>
      </header>
    </div>
  );
};
