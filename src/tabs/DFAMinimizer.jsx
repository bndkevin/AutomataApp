import React, { useState } from 'react';
import DFAInputForm from '../components/DFAInputForm';
import AutomataGraph from '../components/AutomataGraph';
import TransitionTable from '../components/TransitionTable';
import { minimizeDFA } from '../lib/dfaMinimizer';
import { getFlowElements } from '../lib/graphLayout';
import { Minimize2, RefreshCw, Layers, GitMerge, FileText, BarChart2 } from 'lucide-react';

const EXAMPLE_NON_MINIMAL_DFA = {
  states: ['q0', 'q1', 'q2', 'q3'],
  alphabet: ['a', 'b'],
  startState: 'q0',
  acceptStates: ['q1', 'q3'],
  transitions: {
    q0: { a: 'q0', b: 'q1' },
    q1: { a: 'q2', b: 'q1' },
    q2: { a: 'q2', b: 'q3' },
    q3: { a: 'q2', b: 'q1' }
  }
};

const DEFAULT_EMPTY_DFA = {
  states: ['q0'],
  alphabet: ['a', 'b'],
  startState: 'q0',
  acceptStates: [],
  transitions: {
    q0: { a: '', b: '' }
  }
};

export default function DFAMinimizer() {
  const [dfa, setDfa] = useState(DEFAULT_EMPTY_DFA);
  const [minimizationResult, setMinimizationResult] = useState(null);

  const handleLoadExample = () => {
    setDfa(JSON.parse(JSON.stringify(EXAMPLE_NON_MINIMAL_DFA)));
    setMinimizationResult(null);
  };

  const handleReset = () => {
    setDfa(DEFAULT_EMPTY_DFA);
    setMinimizationResult(null);
  };

  // Perform Myhill-Nerode Hopcroft minimization
  const handleMinimize = () => {
    const res = minimizeDFA(dfa);
    setMinimizationResult(res);
  };

  // Build graph layouts
  const { nodes: originalNodes, edges: originalEdges } = getFlowElements(dfa);
  const { nodes: minNodes, edges: minEdges } = minimizationResult 
    ? getFlowElements(minimizationResult.minimized)
    : { nodes: [], edges: [] };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto w-full p-4 flex-1">
      {/* LEFT COLUMN: Input form & controls */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        <DFAInputForm
          value={dfa}
          onChange={setDfa}
          onLoadExample={handleLoadExample}
          exampleLabel="DFA dengan {q1, q3} ekuivalen"
          title="Input DFA untuk Diminimalisasi"
        />

        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleMinimize}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-sm font-bold rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <Minimize2 size={16} />
            Minimalisasi DFA sekarang
          </button>
          
          <button
            onClick={handleReset}
            className="px-4 py-3 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-800 active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer select-none"
          >
            <RefreshCw size={13} />
            Reset
          </button>
        </div>

        {/* Minimized DFA formal definition */}
        {minimizationResult && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-850 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold font-display text-slate-200 uppercase tracking-wide">
                Definisi Formal DFA Hasil Minimalisasi
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed text-slate-400">
              <div>
                <span className="font-semibold text-slate-300">State (Q'): </span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-indigo-300">
                  {`{${minimizationResult.minimized.states.join(", ")}}`}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-300">Alfabet (Σ): </span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-indigo-300">
                  {`{${minimizationResult.minimized.alphabet.join(", ")}}`}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-300">Start State (q₀'): </span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-indigo-300">
                  {minimizationResult.minimized.startState}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-300">Accept States (F'): </span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-emerald-400">
                  {`{${minimizationResult.minimized.acceptStates.join(", ")}}`}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                Tabel Transisi δ Minimized:
              </h4>
              <TransitionTable automaton={minimizationResult.minimized} isNFA={false} />
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Interactive side-by-side graphs and Hopcroft partitioning traces */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* Side-by-Side Visualizer Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Original Graph */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850 flex flex-col h-[400px] shadow-lg">
            <div className="bg-slate-900/50 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                1. DFA Asal (Original)
              </span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 border border-indigo-500/25 rounded-md font-bold font-mono">
                {dfa.states.length} States
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <AutomataGraph nodes={originalNodes} edges={originalEdges} />
            </div>
          </div>

          {/* Minimized Graph */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850 flex flex-col h-[400px] shadow-lg">
            <div className="bg-slate-900/50 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                2. DFA Hasil Minimal (Minimized)
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/25 rounded-md font-bold font-mono">
                {minimizationResult ? minimizationResult.minimized.states.length : "?"} States
              </span>
            </div>
            <div className="flex-1 min-h-0 bg-slate-950/20">
              {minimizationResult ? (
                <AutomataGraph nodes={minNodes} edges={minEdges} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 italic bg-slate-900/10">
                  Klik tombol "Minimalisasi DFA" untuk melihat hasil
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Statistics & partition trace steps details */}
        {minimizationResult && (
          <div className="flex flex-col gap-6">
            
            {/* Stats row banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel rounded-xl p-4 flex items-center gap-3.5 border border-slate-800">
                <BarChart2 className="text-indigo-400" size={24} />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">State Awal</div>
                  <div className="text-lg font-bold font-display text-slate-200">{minimizationResult.original.stateCount} States</div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-4 flex items-center gap-3.5 border border-slate-800">
                <Minimize2 className="text-emerald-400" size={24} />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">State Minimal</div>
                  <div className="text-lg font-bold font-display text-emerald-400">{minimizationResult.minimized.stateCount} States</div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-4 flex items-center gap-3.5 border border-slate-800">
                <GitMerge className="text-cyan-400" size={24} />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Status Reduksi</div>
                  <div className="text-sm font-bold text-slate-300">
                    Reduksi {minimizationResult.original.stateCount - minimizationResult.minimized.stateCount} State
                  </div>
                </div>
              </div>
            </div>

            {/* Equivalence Classes merged tables */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-850 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers size={16} className="text-indigo-400" />
                <h3 className="text-sm font-bold font-display text-slate-200 uppercase tracking-wide">
                  Kelas Ekuivalensi (Equivalence Classes)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {minimizationResult.equivalenceClasses.map(eq => (
                  <div key={eq.minState} className="flex justify-between items-center bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
                    <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                      {eq.minState}
                    </span>
                    <span className="text-slate-500 font-bold font-display text-[10px] uppercase tracking-wider">mewakili</span>
                    <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      {`{${eq.originalStates.join(", ")}}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-step trace tables */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-850 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers size={16} className="text-indigo-400" />
                <h3 className="text-sm font-bold font-display text-slate-200 uppercase tracking-wide">
                  Detail Log Pembagian Partisi (Hopcroft Algorithm)
                </h3>
              </div>
              
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                      <th className="px-4 py-3 font-semibold w-16 text-center">Ronde</th>
                      <th className="px-4 py-3 font-semibold">Grup Partisi Aktif</th>
                      <th className="px-4 py-3 font-semibold">Penjelasan Aktivitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-slate-300">
                    {minimizationResult.trace.map(t => (
                      <tr key={t.round} className="hover:bg-slate-900/10">
                        <td className="px-4 py-3 text-center font-bold text-indigo-400 font-mono">
                          {t.round}
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-emerald-400 font-medium tracking-wide">
                          {`{ ${t.partitions.join(", ")} }`}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-450 leading-relaxed">
                          {t.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
