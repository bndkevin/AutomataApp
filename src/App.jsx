import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DFASimulator from './tabs/DFASimulator';
import RegexToNFA from './tabs/RegexToNFA';
import DFAMinimizer from './tabs/DFAMinimizer';
import DFAEquivalence from './tabs/DFAEquivalence';

export default function App() {
  const [activeTab, setActiveTab] = useState('dfa-simulator');
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dfa-simulator':
        return <DFASimulator />;
      case 'regex-nfa':
        return <RegexToNFA />;
      case 'dfa-minimizer':
        return <DFAMinimizer />;
      case 'dfa-equivalence':
        return <DFAEquivalence />;
      default:
        return <DFASimulator />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased transition-colors duration-300">
      {/* Top beautiful Header Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      {/* Main Tab Panel Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 w-full max-w-[1440px] mx-auto min-w-[1280px]">
        {renderActiveTab()}
      </main>

      {/* Footer Details */}
      <footer className="py-4 border-t border-slate-900 bg-slate-950/80 text-center text-[10px] text-slate-500 font-semibold tracking-wider select-none shrink-0 transition-colors duration-300">
        &copy; {new Date().getFullYear()} FINITE AUTOMATA SIMULATOR &bull; TEORI BAHASA &amp; AUTOMATA
      </footer>
    </div>
  );
}
