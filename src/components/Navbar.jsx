import React from 'react';
import { Cpu, GitFork, Shuffle, Minimize2, CheckSquare, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme }) {
  const tabs = [
    { id: 'dfa-simulator', label: 'DFA Simulator', icon: Cpu },
    { id: 'nfa-simulator', label: 'NFA Simulator', icon: GitFork },
    { id: 'regex-nfa', label: 'Regex ➔ NFA', icon: Shuffle },
    { id: 'dfa-minimizer', label: 'DFA Minimizer', icon: Minimize2 },
    { id: 'dfa-equivalence', label: 'DFA Equivalence', icon: CheckSquare },
  ];

  return (
    <header className="glass-panel border-b border-slate-800/80 sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg backdrop-blur select-none transition-colors duration-300">
      {/* Title logo */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-500/20 text-indigo-400 p-2.5 rounded-2xl border border-indigo-500/30 flex items-center justify-center glow-indigo animate-pulse">
          <Cpu size={24} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight text-slate-100 flex items-center gap-1.5 transition-colors duration-300">
            🤖 Automata Simulator
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 transition-colors duration-300">
            Theory of Computation Toolkit
          </p>
        </div>
      </div>

      {/* Tabs navigation buttons + Theme Toggle */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <nav className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner w-full md:w-auto max-w-[600px] overflow-x-auto flex-1 md:flex-initial transition-colors duration-300">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition duration-300 whitespace-nowrap flex-1 md:flex-initial select-none cursor-pointer active:scale-95
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
              >
                <Icon size={14} className={isActive ? 'stroke-[2.5]' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 text-indigo-400 hover:text-indigo-300 transition duration-300 cursor-pointer active:scale-95 flex items-center justify-center glow-indigo shrink-0"
          title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
