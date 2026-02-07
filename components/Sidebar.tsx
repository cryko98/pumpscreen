
import React from 'react';
import { Home, Zap, User, Settings, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Language, translations } from '../translations';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNav: (action: string) => void;
  currentSort: string;
  language: Language;
  theme: 'dark' | 'light';
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onNav, currentSort, language, theme }) => {
  const t = translations[language];
  const currentTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  
  const menuItems = [
    { icon: <Home size={20} />, label: t.trending, action: 'Trending' },
    { icon: <Zap size={20} />, label: t.newPairs, action: 'New Pairs' },
    { icon: <User size={20} />, label: t.watchlist, action: 'Profile' },
  ];

  const isItemActive = (action: string) => {
    if (action === 'Trending' && currentSort === 'trending') return true;
    if (action === 'New Pairs' && currentSort === 'age') return true;
    if (action === 'Profile' && currentSort === 'Profile') return true;
    return false;
  };

  return (
    <>
      <motion.aside 
        initial={false}
        animate={{ width: isOpen ? '260px' : '80px' }}
        className="h-full bg-inherit border-r border-white/5 flex flex-col z-40 relative hidden lg:flex shrink-0"
      >
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => onNav('Trending')}>
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] shrink-0">
            <Zap className="text-white fill-white" size={24} />
          </div>
          {isOpen && (
            <span className={`text-xl font-black italic tracking-tighter uppercase whitespace-nowrap ${currentTextClass}`}>
              PumpScreener
            </span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, idx) => {
            const active = isItemActive(item.action);
            return (
              <button
                key={idx}
                onClick={() => onNav(item.action)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group border ${
                  active 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]' 
                    : `text-gray-400 hover:bg-black/5 hover:${currentTextClass} border-transparent`
                }`}
              >
                <span className={`${active ? 'text-green-500' : 'text-gray-400 group-hover:text-green-500'} transition-colors`}>
                  {item.icon}
                </span>
                {isOpen && <span className="font-black uppercase tracking-widest text-[10px]">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button 
            className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-green-500 transition-colors group"
            onClick={() => onNav('Settings')}
          >
            <Settings size={20} className="text-gray-400 group-hover:text-green-500" />
            {isOpen && <span className="font-black uppercase tracking-widest text-[10px]">{t.settings}</span>}
          </button>
        </div>
      </motion.aside>
      
      {/* Mobile Trigger */}
      <button 
        onClick={onToggle}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-green-500 rounded-full shadow-2xl active:scale-90 transition-transform"
      >
        {isOpen ? <X size={24} className="text-black" /> : <Menu size={24} className="text-black" />}
      </button>
    </>
  );
};
