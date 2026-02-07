
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TokenTable } from './components/TokenTable';
import { TokenDetails } from './components/TokenDetails';
import { TrendingBar } from './components/TrendingBar';
import { Token } from './types';
import { fetchTrendingTokens } from './services/dexScreenerService';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Zap, Settings, Globe, Moon, Sun, X, Terminal } from 'lucide-react';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState('Syncing Nodes...');
  const [sortBy, setSortBy] = useState<'trending' | 'volume' | 'gainers' | 'age'>('trending');
  const [logs, setLogs] = useState<string[]>(["[SYSTEM]: Core initialized.", "[NODE]: SOL-RPC Connected."]);
  
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('pumpscreener_watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('pumpscreener_lang') as Language) || 'en';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('pumpscreener_theme') as 'dark' | 'light') || 'dark';
  });
  const [showSettings, setShowSettings] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const logInterval = setInterval(() => {
      const messages = [
        `[FEED]: New pair detected in Solana Ecosystem.`,
        `[WHALE]: $${(Math.random() * 50).toFixed(1)}k buy in ${tokens[Math.floor(Math.random() * tokens.length)]?.symbol || 'MEME'}`,
        `[NETWORK]: Latency 42ms.`,
        `[AI]: Sentiment shifting to BULLISH on AI Sector.`
      ];
      setLogs(prev => [messages[Math.floor(Math.random() * messages.length)], ...prev].slice(0, 3));
    }, 8000);
    return () => clearInterval(logInterval);
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem('pumpscreener_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('pumpscreener_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('pumpscreener_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode-active');
    } else {
      document.body.classList.remove('light-mode-active');
    }
  }, [theme]);

  const loadData = async () => {
    setLoading(true);
    setLoadStatus('Fetching Memecoins...');
    try {
      const data = await fetchTrendingTokens();
      if (data && data.length > 0) {
        setTokens(data);
      }
    } catch (e) {
      console.error("Sync Error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const toggleWatchlist = (tokenId: string) => {
    setWatchlist(prev => 
      prev.includes(tokenId) ? prev.filter(id => id !== tokenId) : [...prev, tokenId]
    );
  };

  const processedTokens = useMemo(() => {
    let base = showWatchlist ? tokens.filter(tok => watchlist.includes(tok.id)) : tokens;
    let filtered = base.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortBy === 'volume') return [...filtered].sort((a, b) => b.volume24h - a.volume24h);
    if (sortBy === 'gainers') return [...filtered].sort((a, b) => b.priceChange24h - a.priceChange24h);
    if (sortBy === 'age') {
       const getMin = (s: string) => parseInt(s) * (s.includes('h') ? 60 : (s.includes('d') ? 1440 : 1));
       return [...filtered].sort((a, b) => getMin(a.age) - getMin(b.age));
    }
    return [...filtered].sort((a, b) => b.score - a.score);
  }, [tokens, searchQuery, sortBy, watchlist, showWatchlist]);

  const handleSidebarNav = (action: string) => {
    setSelectedToken(null);
    setShowWatchlist(false);
    if (action === 'Trending') setSortBy('trending');
    else if (action === 'New Pairs') setSortBy('age');
    else if (action === 'Profile') setShowWatchlist(true);
    else if (action === 'Settings') setShowSettings(true);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const currentTextClass = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`flex flex-col h-screen w-full transition-colors duration-300 overflow-hidden ${theme === 'dark' ? 'bg-[#0c0c0c] text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Top Strip Header */}
      <div className="h-10 bg-black text-white flex items-center justify-between px-6 z-50 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
           <Zap size={16} className="text-green-500 fill-green-500" />
           <span className="font-black tracking-tighter text-sm uppercase italic">PumpScreener</span>
        </div>
        <div className="flex items-center gap-6">
           <div className="hidden sm:flex items-center gap-4">
              {logs.map((log, i) => (
                <span key={i} className="text-[10px] font-mono text-gray-400 opacity-60 animate-pulse truncate max-w-[200px]">{log}</span>
              ))}
           </div>
           <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-0.5 rounded border border-white/10 text-[10px] font-mono text-gray-400">
              <span className="text-green-500 font-bold">CA:</span>
              <span className="select-all">AFKoHXqRazzuiyBFH21YMr2J2TExdGUMZ1DuNbsp65iu</span>
           </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          onNav={handleSidebarNav}
          currentSort={showWatchlist ? 'Profile' : sortBy}
          language={language}
          theme={theme}
        />

        <main className="flex-1 flex flex-col min-w-0 relative">
          <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            sortBy={sortBy}
            setSortBy={setSortBy}
            language={language}
            theme={theme}
          />
          
          {!loading && tokens.length > 0 && <TrendingBar tokens={tokens} onSelect={setSelectedToken} />}

          <div className="flex-1 flex overflow-hidden">
            <section className={`flex-1 flex flex-col border-r border-white/5 overflow-hidden ${selectedToken ? 'hidden xl:flex' : 'flex'}`}>
              <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-inherit text-[11px] font-bold text-gray-500">
                <h2 className="uppercase tracking-widest text-[10px] text-green-500">
                  {showWatchlist ? t.watchlist : t.trending}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="uppercase flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                    Live Pairs: <span className={currentTextClass}>{processedTokens.length}</span>
                  </span>
                  <button onClick={loadData} className="p-1 hover:text-green-500 transition-colors">
                    <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-inherit">
                {loading && tokens.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-12 text-center">
                    <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                    <p className="text-green-500 font-black tracking-widest text-xs uppercase">{loadStatus}</p>
                  </div>
                ) : (
                  <TokenTable 
                    tokens={processedTokens} 
                    onSelectToken={setSelectedToken} 
                    selectedTokenId={selectedToken?.id}
                    watchlist={watchlist}
                    onToggleWatchlist={toggleWatchlist}
                    theme={theme}
                  />
                )}
              </div>
            </section>

            <AnimatePresence mode="wait">
              {selectedToken && (
                <motion.section 
                  key={selectedToken.id}
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="absolute inset-0 xl:relative xl:flex-[1.5] flex flex-col bg-inherit z-50 overflow-hidden"
                >
                  <TokenDetails 
                    token={selectedToken} 
                    onClose={() => setSelectedToken(null)} 
                    isWatched={watchlist.includes(selectedToken.id)}
                    onToggleWatchlist={() => toggleWatchlist(selectedToken.id)}
                    language={language}
                    theme={theme}
                  />
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full max-w-sm rounded-3xl p-8 border border-white/10 shadow-2xl ${theme === 'dark' ? 'bg-[#111]' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`text-2xl font-black italic tracking-tighter flex items-center gap-2 uppercase ${currentTextClass}`}><Settings className="text-green-500" /> {t.settings}</h2>
                  <button onClick={() => setShowSettings(false)} className={`p-2 hover:bg-black/5 rounded-full ${currentTextClass}`}><X size={20}/></button>
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Globe size={14}/> {t.language}</div>
                    <div className="grid grid-cols-2 gap-2">
                       {([['en', 'English'], ['de', 'Deutsch'], ['es', 'Español'], ['zh', '中文'], ['fr', 'Français']] as const).map(([code, name]) => (
                         <button key={code} onClick={() => setLanguage(code)} className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${language === code ? 'bg-green-500 border-green-500 text-black' : 'border-black/5 bg-black/5 text-gray-400'}`}>{name}</button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Moon size={14}/> {t.theme}</div>
                    <div className="flex bg-black/5 p-1 rounded-2xl border border-black/5">
                      <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${theme === 'dark' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-gray-400'}`}><Moon size={16}/> <span className="text-xs font-black uppercase tracking-widest">{t.dark}</span></button>
                      <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${theme === 'light' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-gray-400'}`}><Sun size={16}/> <span className="text-xs font-black uppercase tracking-widest">{t.light}</span></button>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowSettings(false)} className="w-full mt-10 py-4 bg-green-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-green-400 transition-colors">Confirm</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #22c55e; }
        .light-mode-active .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; }
      `}</style>
    </div>
  );
};

export default App;
