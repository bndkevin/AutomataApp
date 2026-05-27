import React, { useState } from 'react';
import DFAInputForm from '../components/DFAInputForm';
import AutomataGraph from '../components/AutomataGraph';
import TransitionTable from '../components/TransitionTable';
import { checkDFAEquivalence } from '../lib/dfaEquivalence';
import { getFlowElements } from '../lib/graphLayout';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Layers, Shuffle, CheckCircle, XCircle } from 'lucide-react';

const EQUIVALENT_DFA_1 = {
  states: ['p0', 'p1'],
  alphabet: ['a', 'b'],
  startState: 'p0',
  acceptStates: ['p1'],
  transitions: {
    p0: { a: 'p1', b: 'p0' },
    p1: { a: 'p1', b: 'p0' }
  }
};

const EQUIVALENT_DFA_2 = {
  states: ['r0', 'r1', 'r2'],
  alphabet: ['a', 'b'],
  startState: 'r0',
  acceptStates: ['r1', 'r2'],
  transitions: {
    r0: { a: 'r1', b: 'r0' },
    r1: { a: 'r2', b: 'r0' },
    r2: { a: 'r2', b: 'r0' }
  }
};

const NOTEQ_DFA_1 = {
  states: ['q0', 'q1', 'q2'],
  alphabet: ['a', 'b'],
  startState: 'q0',
  acceptStates: ['q2'],
  transitions: {
    q0: { a: 'q1', b: 'q0' },
    q1: { a: 'q2', b: 'q0' },
    q2: { a: 'q2', b: 'q0' }
  }
};

const NOTEQ_DFA_2 = {
  states: ['s0', 's1'],
  alphabet: ['a', 'b'],
  startState: 's0',
  acceptStates: ['s1'],
  transitions: {
    s0: { a: 's1', b: 's0' },
    s1: { a: 's1', b: 's0' }
  }
};

const DEFAULT_EMPTY_DFA_1 = {
  states: ['p0'],
  alphabet: ['a', 'b'],
  startState: 'p0',
  acceptStates: [],
  transitions: {
    p0: { a: '', b: '' }
  }
};

const DEFAULT_EMPTY_DFA_2 = {
  states: ['r0'],
  alphabet: ['a', 'b'],
  startState: 'r0',
  acceptStates: [],
  transitions: {
    r0: { a: '', b: '' }
  }
};

export default function DFAEquivalence() {
  const [dfa1, setDfa1] = useState(DEFAULT_EMPTY_DFA_1);
  const [dfa2, setDfa2] = useState(DEFAULT_EMPTY_DFA_2);
  const [result, setResult] = useState(null);

  const handleLoadEquivalent = () => {
    setDfa1(JSON.parse(JSON.stringify(EQUIVALENT_DFA_1)));
    setDfa2(JSON.parse(JSON.stringify(EQUIVALENT_DFA_2)));
    setResult(null);
  };

  const handleLoadNotEquivalent = () => {
    setDfa1(JSON.parse(JSON.stringify(NOTEQ_DFA_1)));
    setDfa2(JSON.parse(JSON.stringify(NOTEQ_DFA_2)));
    setResult(null);
  };

  const handleReset = () => {
    setDfa1(DEFAULT_EMPTY_DFA_1);
    setDfa2(DEFAULT_EMPTY_DFA_2);
    setResult(null);
  };

  // Perform distinguishability construction
  const handleCheckEquivalence = () => {
    const res = checkDFAEquivalence(dfa1, dfa2);
    setResult(res);
  };

  // Build product automaton flow graph if completed
  const { nodes: productNodes, edges: productEdges } = result && result.productAutomaton
    ? getFlowElements(result.productAutomaton)
    : { nodes: [], edges: [] };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 flex-1">
      
      {/* Top action control header bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between border border-slate-850 shadow-md select-none">
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleLoadEquivalent}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 active:scale-95 text-xs font-bold transition cursor-pointer"
          >
            <Sparkles size={13} />
            Load Contoh Ekuivalen (akhiran 'a')
          </button>
          
          <button
            onClick={handleLoadNotEquivalent}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 active:scale-95 text-xs font-bold transition cursor-pointer"
          >
            <Sparkles size={13} />
            Load Contoh Tidak Ekuivalen
          </button>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleCheckEquivalence}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-sm font-bold rounded-xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            Cek Ekuivalensi
          </button>
          
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-800 active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <RefreshCw size={13} />
            Reset Semua
          </button>
        </div>
      </div>

      {/* Dual Inputs Side-by-Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DFAInputForm
          value={dfa1}
          onChange={setDfa1}
          title="DFA Pertama (DFA 1)"
          exampleLabel={null}
        />
        
        <DFAInputForm
          value={dfa2}
          onChange={setDfa2}
          title="DFA Kedua (DFA 2)"
          exampleLabel={null}
        />
      </div>

      {/* RESULT SECTION */}
      {result && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT: Acceptance verification banners and tabular logs */}
          <div className="xl:col-span-6 flex flex-col gap-6">
            
            {/* Status card banner */}
            <div className={`p-5 rounded-2xl border flex items-start gap-4 transition-all duration-300 shadow-md
              ${result.equivalent
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 glow-emerald'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300 glow-rose'
              }`}
            >
              {result.equivalent ? (
                <CheckCircle size={24} className="shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <XCircle size={24} className="shrink-0 mt-0.5 text-rose-400" />
              )}
              <div>
                <h3 className="font-bold text-base font-display">
                  {result.equivalent ? "EKUIVALEN (EQUIVALENT) ✅" : "TIDAK EKUIVALEN (NOT EQUIVALENT) ❌"}
                </h3>
                <p className="text-xs mt-2 leading-relaxed whitespace-pre-line font-medium">
                  {result.equivalent 
                    ? "Kedua DFA menerima bahasa formal yang persis sama. Tidak ada satu pun string input yang perilakunya dibedakan." 
                    : result.reason}
                </p>
              </div>
            </div>

            {/* Product BFS execution path list */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-850 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Layers size={16} className="text-indigo-400" />
                <h3 className="text-sm font-bold font-display text-slate-200 uppercase tracking-wide">
                  Detail Log Pasangan State Automaton Product (BFS)
                </h3>
              </div>
              
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/20">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-500">
                      <th className="px-3 py-2.5 font-semibold text-center w-12">No</th>
                      <th className="px-3 py-2.5 font-semibold">State Pair (Q₁ × Q₂)</th>
                      <th className="px-3 py-2.5 font-semibold text-center">Path Terdekat</th>
                      <th className="px-3 py-2.5 font-semibold text-center">DFA 1 (Q₁)</th>
                      <th className="px-3 py-2.5 font-semibold text-center">DFA 2 (Q₂)</th>
                      <th className="px-3 py-2.5 font-semibold">Hasil Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-slate-300 font-mono">
                    {result.trace.map((step, idx) => {
                      const isDist = step.isAccept1 !== step.isAccept2;
                      return (
                        <tr key={idx} className={`hover:bg-slate-900/10 ${isDist ? 'bg-red-500/5 hover:bg-red-500/10' : ''}`}>
                          <td className="px-3 py-2.5 text-center font-bold text-slate-550">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5 text-indigo-400 font-semibold">
                            {step.pair}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-cyan-400">
                            {step.path}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px]
                              ${step.isAccept1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                              {step.dfa1State} {step.isAccept1 && "★"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px]
                              ${step.isAccept2 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                              {step.dfa2State} {step.isAccept2 && "★"}
                            </span>
                          </td>
                          <td className={`px-3 py-2.5 text-[10px] font-sans font-medium
                            ${isDist ? 'text-rose-400' : 'text-slate-450'}`}>
                            {step.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT: Visual Symmetric Difference Product Automaton graph */}
          <div className="xl:col-span-6 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850 flex flex-col h-[500px] shadow-lg">
              <div className="bg-slate-900/50 px-5 py-3.5 border-b border-slate-800 flex justify-between items-center shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <Shuffle size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-bold tracking-wide font-display text-slate-200 uppercase">
                    Visualisasi Graf Automaton Product (Q₁ × Q₂)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-450 font-medium">
                  State ganda mewakili pasangan simultan
                </span>
              </div>
              <div className="flex-1 min-h-0 bg-slate-950/20">
                <AutomataGraph nodes={productNodes} edges={productEdges} />
              </div>
              <div className="bg-slate-900/40 p-4 border-t border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1 shrink-0 leading-normal">
                <p>💡 **Tentang Graf Product Automaton**:</p>
                <p>Node berlabel ganda `(p, r)` mewakili status sinkron dari kedua DFA. Jika terdapat setidaknya satu node **Accept ganda** (hijau/double-circle) yang dapat dijangkau dari start state, maka status penerimaannya berbeda (inekuivalen), dan jalur pencariannya menghasilkan string pembeda.</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
