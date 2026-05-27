import React, { useState, useEffect, useRef } from 'react';
import DFAInputForm from '../components/DFAInputForm';
import AutomataGraph from '../components/AutomataGraph';
import TransitionTable from '../components/TransitionTable';
import SimulationLog from '../components/SimulationLog';
import { runDFA } from '../lib/dfaEngine';
import { getFlowElements } from '../lib/graphLayout';
import { Play, Pause, SkipForward, SkipBack, RefreshCw, CheckCircle, XCircle, Settings, HelpCircle } from 'lucide-react';

const EXAMPLE_DFA = {
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

const DEFAULT_EMPTY_DFA = {
  states: ['q0'],
  alphabet: ['a', 'b'],
  startState: 'q0',
  acceptStates: [],
  transitions: {
    q0: { a: '', b: '' }
  }
};

export default function DFASimulator() {
  const [dfa, setDfa] = useState(DEFAULT_EMPTY_DFA);
  const [testString, setTestString] = useState("");
  const [isStepMode, setIsStepMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);

  const timerRef = useRef(null);

  // Load standard pre-fill example
  const handleLoadExample = () => {
    setDfa(JSON.parse(JSON.stringify(EXAMPLE_DFA)));
    setTestString("abaa");
    setSimulationResult(null);
    setIsStepMode(false);
    setIsPlaying(false);
  };

  // Reset inputs
  const handleReset = () => {
    setDfa(DEFAULT_EMPTY_DFA);
    setTestString("");
    setSimulationResult(null);
    setIsStepMode(false);
    setIsPlaying(false);
  };

  // Compute simulation result
  const handleTestString = () => {
    setIsPlaying(false);
    const res = runDFA(dfa, testString);
    setSimulationResult(res);
    setActiveStep(0);
  };

  // Run automatically when inputs or testString changes
  useEffect(() => {
    if (simulationResult) {
      // Re-run if DFA or testString changes after testing once
      const res = runDFA(dfa, testString);
      setSimulationResult(res);
    }
  }, [dfa]);

  // Stepping forward
  const handleNextStep = () => {
    if (simulationResult && activeStep < simulationResult.trace.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  // Stepping backward
  const handlePrevStep = () => {
    if (simulationResult && activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Auto-play interval
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        handleNextStep();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, activeStep, simulationResult]);

  // Get active states/edges for high-fidelity react-flow highlighting
  const getActiveGraphElements = () => {
    if (!simulationResult || simulationResult.trace.length === 0) {
      return { activeNode: null, activeEdge: null };
    }

    const currentTrace = simulationResult.trace[activeStep];
    if (!currentTrace) return { activeNode: null, activeEdge: null };

    // At step 0, only start node is active
    if (activeStep === 0) {
      return {
        activeNode: currentTrace.currentState,
        activeEdge: null
      };
    }

    // After step 0, nextState is the highlighted current state, and the transition path is animated
    return {
      activeNode: currentTrace.nextState === "Ø" ? null : currentTrace.nextState,
      activeEdge: {
        source: currentTrace.currentState,
        target: currentTrace.nextState,
        symbol: currentTrace.symbol
      }
    };
  };

  const { activeNode, activeEdge } = getActiveGraphElements();
  const { nodes, edges } = getFlowElements(dfa, activeNode, activeEdge);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto w-full p-4 flex-1">
      {/* LEFT COLUMN: Configuration (DFA Input Form) */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        <DFAInputForm
          value={dfa}
          onChange={setDfa}
          onLoadExample={handleLoadExample}
          exampleLabel="Ending with 'aa'"
          title="Desain Deterministic Finite Automata (DFA)"
        />

        {/* Info card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
          <HelpCircle size={18} className="text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-200 mb-1">Panduan Konfigurasi DFA:</h4>
            <p>Masukkan state yang unik (misal: q0, q1, q2). Tentukan alfabet simbol input (misal: a, b). Pilih State Awal dan State Penerima (Accept). Isi semua sel tabel transisi di atas untuk mensimulasikan DFA.</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Graph Visualizer + Simulation Results */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        
        {/* Graph rendering Panel */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850 flex flex-col h-[400px] shadow-lg">
          <div className="bg-slate-900/50 px-5 py-3.5 border-b border-slate-800 flex justify-between items-center shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              <h3 className="text-sm font-bold tracking-wide font-display text-slate-200 uppercase">
                Visualisasi Graf DFA
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border border-indigo-500 bg-slate-800"></span> Normal</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-emerald-500/10"></span> Accept</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-400"></span> Aktif</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-slate-950/20">
            <AutomataGraph nodes={nodes} edges={edges} />
          </div>
        </div>

        {/* Simulator input and runner panel */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6 border border-slate-850">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h3 className="text-lg font-bold font-display text-slate-200">
              Mesin Penguji String (Simulasi)
            </h3>
            
            {/* Reset / Clean up */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-800 active:scale-95 transition"
            >
              <RefreshCw size={12} />
              Reset Input
            </button>
          </div>

          {/* Test Input form row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              placeholder="Masukkan string input (contoh: abaa)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600 font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={handleTestString}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-sm font-bold rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition cursor-pointer select-none"
              >
                Uji String
              </button>

              <button
                onClick={() => {
                  setIsStepMode(!isStepMode);
                  setIsPlaying(false);
                  setActiveStep(0);
                  if (!simulationResult) handleTestString();
                }}
                className={`px-4 py-2.5 border rounded-xl text-sm font-semibold active:scale-95 transition cursor-pointer select-none
                  ${isStepMode 
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'}`}
              >
                {isStepMode ? "Matikan Langkah" : "Langkah-demi-Langkah"}
              </button>
            </div>
          </div>

          {/* SIMULATION ACTIVE DETAILS & BANNER */}
          {simulationResult && (
            <div className="flex flex-col gap-4">
              
              {/* Acceptance result banner */}
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
                    {simulationResult.accepted ? "DIterima (ACCEPTED) ✅" : "Ditolak (REJECTED) ❌"}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed">{simulationResult.reason}</p>
                </div>
              </div>

              {/* Step-by-Step simulator bar */}
              {isStepMode && (
                <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      Langkah {activeStep} dari {simulationResult.trace.length - 1}
                    </span>
                    
                    {/* Stepping controls */}
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrevStep}
                        disabled={activeStep === 0}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 active:scale-95 transition"
                        title="Langkah Sebelumnya"
                      >
                        <SkipBack size={15} />
                      </button>

                      <button
                        onClick={() => {
                          if (isPlaying) {
                            setIsPlaying(false);
                            setActiveStep(0);
                          } else {
                            if (simulationResult && activeStep === simulationResult.trace.length - 1) {
                              setActiveStep(0);
                            }
                            setIsPlaying(true);
                          }
                        }}
                        className={`p-2 rounded-lg active:scale-95 transition flex items-center justify-center
                          ${isPlaying 
                            ? 'bg-yellow-500 text-slate-950 font-bold hover:bg-yellow-400' 
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'}`}
                        title={isPlaying ? "Jeda (Kembali ke awal)" : "Mainkan Otomatis"}
                      >
                        {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                      </button>

                      <button
                        onClick={handleNextStep}
                        disabled={activeStep === simulationResult.trace.length - 1}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 active:scale-95 transition"
                        title="Langkah Selanjutnya"
                      >
                        <SkipForward size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Character progress list bar */}
                  <div className="flex items-center gap-2 flex-wrap bg-slate-900 p-3 rounded-lg border border-slate-800/80 font-mono text-sm overflow-x-auto select-none">
                    <span className="text-xs text-slate-500 font-semibold uppercase mr-2 tracking-wider">String:</span>
                    {testString === "" ? (
                      <span className="text-slate-600 italic text-xs">epsilon (ε)</span>
                    ) : (
                      testString.split("").map((char, index) => {
                        // Current read state matches index
                        const isRead = activeStep > index;
                        const isReading = activeStep === index + 1;

                        return (
                          <span
                            key={index}
                            className={`px-2 py-0.5 rounded text-xs transition duration-300 font-bold
                              ${isReading 
                                ? 'bg-yellow-500 text-slate-950 font-extrabold animate-pulse' 
                                : isRead 
                                  ? 'text-indigo-400 line-through bg-indigo-500/10' 
                                  : 'text-slate-500 bg-slate-950'}`}
                          >
                            {char}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Simulation trace log list */}
              <SimulationLog
                trace={simulationResult.trace}
                activeStepIndex={isStepMode ? activeStep : null}
                isNFA={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
