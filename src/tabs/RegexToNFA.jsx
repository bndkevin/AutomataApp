import React, { useState, useEffect } from 'react';
import AutomataGraph from '../components/AutomataGraph';
import TransitionTable from '../components/TransitionTable';
import SimulationLog from '../components/SimulationLog';
import { regexToNFA } from '../lib/regexToNFA';
import { runNFA } from '../lib/nfaEngine';
import { getFlowElements } from '../lib/graphLayout';
import { Sparkles, RefreshCw, CheckCircle, XCircle, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';

const DEFAULT_REGEX = "(a|b)*aa";
const DEFAULT_TEST_STRING = "abaa";

export default function RegexToNFA() {
  const [regex, setRegex] = useState(DEFAULT_REGEX);
  const [testString, setTestString] = useState(DEFAULT_TEST_STRING);
  
  const [nfa, setNfa] = useState(null);
  const [nfaError, setNfaError] = useState("");
  const [simulationResult, setSimulationResult] = useState(null);
  const [activeStep, setActiveStep] = useState(null);

  // Compile regex to NFA
  const handleGenerateNFA = () => {
    setNfaError("");
    setSimulationResult(null);
    setActiveStep(null);

    if (!regex.trim()) {
      setNfaError("Regular Expression tidak boleh kosong.");
      return;
    }

    const compiled = regexToNFA(regex);
    if (compiled.success) {
      setNfa(compiled);
    } else {
      setNfa(null);
      setNfaError(compiled.error);
    }
  };

  // Generate NFA on initial mount
  useEffect(() => {
    handleGenerateNFA();
  }, []);

  // Prefill example (a|b)*aa
  const handleLoadExample = () => {
    setRegex("(a|b)*aa");
    setTestString("abaa");
    
    const compiled = regexToNFA("(a|b)*aa");
    if (compiled.success) {
      setNfa(compiled);
      setNfaError("");
      setSimulationResult(null);
    }
  };

  // Prefill alternate example a*b
  const handleLoadExampleAlt = () => {
    setRegex("a*b");
    setTestString("aaab");

    const compiled = regexToNFA("a*b");
    if (compiled.success) {
      setNfa(compiled);
      setNfaError("");
      setSimulationResult(null);
    }
  };

  const handleReset = () => {
    setRegex("");
    setTestString("");
    setNfa(null);
    setNfaError("");
    setSimulationResult(null);
    setActiveStep(null);
  };

  // Test input string against compiled NFA
  const handleTestString = () => {
    if (!nfa) return;
    const res = runNFA(nfa, testString);
    setSimulationResult(res);
    setActiveStep(null);
  };

  // Direct Javascript RegExp match comparison
  const getDirectRegexResult = () => {
    try {
      // replace '+' with standard quantifier or keep as is since JS RegExp supports '+'
      // JS supports | * + ? ( ) natively
      const sanitizedPattern = regex.replace(/\s+/g, "");
      const jsRegex = new RegExp(`^(${sanitizedPattern})$`);
      const matched = jsRegex.test(testString);
      return {
        matched,
        success: true,
        pattern: jsRegex.toString()
      };
    } catch (e) {
      return {
        success: false,
        error: e.message
      };
    }
  };

  const directResult = nfa ? getDirectRegexResult() : null;

  // React Flow elements construction
  const getActiveStatesList = () => {
    if (!simulationResult || activeStep === null) return null;
    const stepData = simulationResult.trace[activeStep];
    return stepData ? stepData.nextStates : null;
  };

  const activeNodeStates = getActiveStatesList();
  const { nodes, edges } = nfa 
    ? getFlowElements(nfa, activeNodeStates, null) 
    : { nodes: [], edges: [] };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto w-full p-4 flex-1">
      {/* LEFT COLUMN: Input regex, instructions and NFA Formal definitions */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        
        {/* Design input form card */}
        <div className="glass-panel rounded-2xl p-6 glow-indigo flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
            <h2 className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Desain Regular Expression
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLoadExample}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition cursor-pointer select-none active:scale-95"
              >
                <Sparkles size={11} />
                Contoh 1: (a|b)*aa
              </button>
              <button
                type="button"
                onClick={handleLoadExampleAlt}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition cursor-pointer select-none active:scale-95"
              >
                <Sparkles size={11} />
                Contoh 2: a*b
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Masukkan Regular Expression (Regex)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  placeholder="Masukkan regex, misal: (a|b)*aa"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-mono text-indigo-300"
                />
                <button
                  onClick={handleGenerateNFA}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold rounded-xl shadow-md transition cursor-pointer select-none"
                >
                  Konstruksi NFA
                </button>
              </div>
            </div>

            {/* Error notifications */}
            {nfaError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs">
                <AlertTriangle size={15} className="shrink-0" />
                <span>Kesalahan parsing: {nfaError}</span>
              </div>
            )}
          </div>

          {/* Syntax Help Panel */}
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 flex flex-col gap-2">
            <h4 className="font-bold text-slate-300">Sintaksis Regex yang Didukung:</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[10px] text-slate-500 border-t border-slate-800/80 pt-2">
              <div><span className="text-indigo-400">a</span> : literal karakter</div>
              <div><span className="text-indigo-400">ab</span> : konkatenasi (sekuensial)</div>
              <div><span className="text-indigo-400">a|b</span> : union (alternatif)</div>
              <div><span className="text-indigo-400">a*</span> : Kleene star (0 atau lebih)</div>
              <div><span className="text-indigo-400">a+</span> : satu atau lebih</div>
              <div><span className="text-indigo-400">a?</span> : nol atau satu (opsional)</div>
              <div className="col-span-2"><span className="text-indigo-400">(a|b)*</span> : pengelompokan kurung</div>
            </div>
          </div>
        </div>

        {/* NFA Formal Definition display */}
        {nfa && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-850 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold font-display text-slate-200 uppercase tracking-wide">
                Definisi Formal NFA
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed text-slate-400">
              <div>
                <span className="font-semibold text-slate-300">State (Q): </span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-indigo-300">
                  {`{${nfa.states.join(", ")}}`}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-300">Alfabet (Σ): </span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-indigo-300">
                  {`{${nfa.alphabet.join(", ")}}`}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-300">Start State (q₀): </span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-indigo-300">
                  {nfa.startState}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-300">Accept States (F): </span>
                <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-emerald-400">
                  {`{${nfa.acceptStates.join(", ")}}`}
                </span>
              </div>
            </div>

            {/* delta transitions matrix */}
            <div className="mt-2">
              <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                Tabel Transisi δ (Termasuk transisi ε):
              </h4>
              <TransitionTable automaton={nfa} isNFA={true} />
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Graph visualizer, test string inputs, trace results */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        
        {/* NFA Visualizer Graph Graph Panel */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850 flex flex-col h-[400px] shadow-lg">
          <div className="bg-slate-900/50 px-5 py-3.5 border-b border-slate-800 flex justify-between items-center shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="text-sm font-bold tracking-wide font-display text-slate-200 uppercase">
                Graf NFA (Thompson Construction)
              </h3>
            </div>
            <div className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">
              ε-transitions: Dashed Lines labels 'ε'
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-slate-950/20">
            <AutomataGraph nodes={nodes} edges={edges} />
          </div>
        </div>

        {/* NFA Simulator and runners */}
        {nfa && (
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6 border border-slate-850">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h3 className="text-lg font-bold font-display text-slate-200">
                Penguji String NFA (Subset Simulator)
              </h3>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-800 hover:border-slate-700 transition cursor-pointer select-none active:scale-95"
              >
                <RefreshCw size={12} />
                Reset
              </button>
            </div>

            {/* Test Input bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={testString}
                onChange={(e) => setTestString(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                placeholder="Masukkan string untuk diuji terhadap NFA"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-mono"
              />
              <button
                onClick={handleTestString}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-sm font-bold rounded-xl shadow-md transition cursor-pointer select-none"
              >
                Simulasikan
              </button>
            </div>

            {/* Simulation log and results */}
            {simulationResult && (
              <div className="flex flex-col gap-4">
                
                {/* Accept/Reject banner */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300
                  ${simulationResult.accepted
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 glow-emerald'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300 glow-rose'
                  }`}
                >
                  {simulationResult.accepted ? (
                    <CheckCircle size={20} className="shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <XCircle size={20} className="shrink-0 mt-0.5 text-rose-400" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {simulationResult.accepted ? "Diterima oleh NFA (ACCEPTED) ✅" : "Ditolak oleh NFA (REJECTED) ❌"}
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed">{simulationResult.reason}</p>
                  </div>
                </div>

                {/* Direct Javascript Regex comparator card */}
                {directResult && directResult.success && (
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <span>
                        Hasil Pembanding (Javascript Regex <span className="font-mono text-indigo-400">{directResult.pattern}</span>):
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]
                      ${directResult.matched 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {directResult.matched ? "MATCHED" : "MISMATCHED"}
                    </span>
                  </div>
                )}

                {/* Subset progress click trace interactive highlighting */}
                <div className="bg-slate-900/30 p-3.5 border border-slate-800/80 rounded-xl flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Navigasi Highlight Subset State Graf:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveStep(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition
                        ${activeStep === null
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400 border border-slate-800 hover:border-slate-700'}`}
                    >
                      Nonaktifkan Highlight
                    </button>
                    {simulationResult.trace.map((step, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveStep(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition font-mono
                          ${activeStep === idx
                            ? 'bg-yellow-500 text-slate-950 font-bold'
                            : 'bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400'}`}
                      >
                        Step {idx} ({step.symbol})
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">
                    💡 Klik tombol langkah di atas untuk memvisualisasikan subset states closure aktif (kuning) pada graf NFA.
                  </p>
                </div>

                {/* Simulation Logs table */}
                <SimulationLog
                  trace={simulationResult.trace}
                  activeStepIndex={activeStep}
                  isNFA={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
