import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function DFAInputForm({
  value,
  onChange,
  onLoadExample = null,
  title = "Konfigurasi DFA",
  exampleLabel = "Load Contoh DFA"
}) {
  const { states, alphabet, startState, acceptStates, transitions } = value;

  // Local text states for input editing to avoid losing focus/sluggishness on every keystroke
  const [statesInput, setStatesInput] = useState(states.join(', '));
  const [alphabetInput, setAlphabetInput] = useState(alphabet.join(', '));
  const [validationError, setValidationError] = useState("");

  // Keep local inputs synchronized if value changes from outside (e.g., Load Example)
  useEffect(() => {
    const currentParsed = statesInput.split(',').map(s => s.trim()).filter(s => s !== "");
    const isSame = currentParsed.length === states.length && currentParsed.every((s, i) => s === states[i]);
    if (!isSame) {
      setStatesInput(states.join(', '));
    }
  }, [states]);

  useEffect(() => {
    const currentParsed = alphabetInput.split(',').map(a => a.trim()).filter(a => a !== "");
    const isSame = currentParsed.length === alphabet.length && currentParsed.every((a, i) => a === alphabet[i]);
    if (!isSame) {
      setAlphabetInput(alphabet.join(', '));
    }
  }, [alphabet]);


  // Handle parsing of states comma-separated text
  const handleStatesChange = (val) => {
    setStatesInput(val);
    const parsedStates = val.split(',')
      .map(s => s.trim())
      .filter(s => s !== "");

    // Automatically update start and accept states if current ones are removed
    const newStart = parsedStates.includes(startState) ? startState : (parsedStates[0] || "");
    const newAccept = acceptStates.filter(s => parsedStates.includes(s));

    // Update transitions
    const newTransitions = {};
    parsedStates.forEach(s => {
      newTransitions[s] = {};
      alphabet.forEach(sym => {
        // preserve existing if applicable
        if (transitions[s] && transitions[s][sym] !== undefined) {
          newTransitions[s][sym] = transitions[s][sym];
        } else {
          newTransitions[s][sym] = "";
        }
      });
    });

    onChange({
      ...value,
      states: parsedStates,
      startState: newStart,
      acceptStates: newAccept,
      transitions: newTransitions
    });
  };

  // Handle parsing of alphabet comma-separated text
  const handleAlphabetChange = (val) => {
    setAlphabetInput(val);
    const parsedAlphabet = val.split(',')
      .map(a => a.trim())
      .filter(a => a !== "");

    // Update transitions
    const newTransitions = {};
    states.forEach(s => {
      newTransitions[s] = {};
      parsedAlphabet.forEach(sym => {
        if (transitions[s] && transitions[s][sym] !== undefined) {
          newTransitions[s][sym] = transitions[s][sym];
        } else {
          newTransitions[s][sym] = "";
        }
      });
    });

    onChange({
      ...value,
      alphabet: parsedAlphabet,
      transitions: newTransitions
    });
  };

  // Select start state
  const handleStartStateChange = (e) => {
    onChange({
      ...value,
      startState: e.target.value
    });
  };

  // Toggle accept state checkboxes
  const handleAcceptStateToggle = (state) => {
    let newAccept = [...acceptStates];
    if (newAccept.includes(state)) {
      newAccept = newAccept.filter(s => s !== state);
    } else {
      newAccept.push(state);
    }
    onChange({
      ...value,
      acceptStates: newAccept
    });
  };

  // Update a single transition matrix cell
  const handleTransitionCellChange = (fromState, symbol, toState) => {
    const newTransitions = {
      ...transitions,
      [fromState]: {
        ...(transitions[fromState] || {}),
        [symbol]: toState
      }
    };
    onChange({
      ...value,
      transitions: newTransitions
    });
  };

  // Validation checking
  useEffect(() => {
    if (states.length === 0) {
      setValidationError("Daftar state tidak boleh kosong.");
      return;
    }
    if (alphabet.length === 0) {
      setValidationError("Alfabet tidak boleh kosong.");
      return;
    }
    if (!startState) {
      setValidationError("Start state harus dipilih.");
      return;
    }
    
    // Check if transition matrix is fully completed
    let incomplete = false;
    for (const state of states) {
      for (const sym of alphabet) {
        const next = transitions[state]?.[sym];
        if (next === undefined || next === "") {
          incomplete = true;
          break;
        }
      }
      if (incomplete) break;
    }

    if (incomplete) {
      setValidationError("Tabel transisi belum lengkap. Isi semua kolom.");
    } else {
      setValidationError("");
    }
  }, [states, alphabet, startState, acceptStates, transitions]);

  return (
    <div className="glass-panel rounded-2xl p-6 glow-indigo flex flex-col gap-6 select-none">
      <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
        <h2 className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          {title}
        </h2>
        {onLoadExample && (
          <button
            type="button"
            onClick={onLoadExample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 active:scale-95 transition"
          >
            <Sparkles size={13} />
            {exampleLabel}
          </button>
        )}
      </div>

      {/* Main input fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            States (koma-terpisah)
          </label>
          <input
            type="text"
            value={statesInput}
            onChange={(e) => handleStatesChange(e.target.value)}
            placeholder="q0, q1, q2"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Alfabet (koma-terpisah)
          </label>
          <input
            type="text"
            value={alphabetInput}
            onChange={(e) => handleAlphabetChange(e.target.value)}
            placeholder="a, b"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Start and Accept states selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Start State
          </label>
          <select
            value={startState}
            onChange={handleStartStateChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="" disabled>-- Pilih Start State --</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Accept States
          </label>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
            {states.length === 0 ? (
              <span className="text-xs text-slate-600 italic px-2 py-1">Masukkan state terlebih dahulu</span>
            ) : (
              states.map(state => {
                const checked = acceptStates.includes(state);
                return (
                  <label
                    key={state}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer select-none
                      ${checked 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleAcceptStateToggle(state)}
                      className="hidden"
                    />
                    {checked && <span className="text-[10px]">★</span>}
                    {state}
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Transition Function Editable Table */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Tabel Fungsi Transisi (δ)
        </label>
        {states.length === 0 || alphabet.length === 0 ? (
          <div className="text-center p-6 bg-slate-900/50 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
            Tabel transisi akan muncul setelah States dan Alfabet diisi
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full border-collapse text-left bg-slate-900/20 text-sm">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase">State / Input</th>
                  {alphabet.map(sym => (
                    <th key={sym} className="px-4 py-3 font-semibold text-indigo-400 text-center text-xs uppercase">
                      {sym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {states.map(fromState => (
                  <tr key={fromState} className="hover:bg-slate-900/35">
                    <td className="px-4 py-3 font-semibold text-slate-300">
                      {fromState === startState && "➔ "}
                      {fromState}
                      {acceptStates.includes(fromState) && " ★"}
                    </td>
                    {alphabet.map(sym => {
                      const valueCell = transitions[fromState]?.[sym] || "";
                      return (
                        <td key={sym} className="px-4 py-2 text-center">
                          <select
                            value={valueCell}
                            onChange={(e) => handleTransitionCellChange(fromState, sym, e.target.value)}
                            className={`w-full max-w-[120px] mx-auto bg-slate-950 border text-xs px-2.5 py-1.5 rounded-lg focus:outline-none transition
                              ${valueCell === "" 
                                ? 'border-red-500/50 text-red-400' 
                                : 'border-slate-800 text-slate-200 focus:border-indigo-500'}`}
                          >
                            <option value="">-- pilih --</option>
                            {states.map(optState => (
                              <option key={optState} value={optState}>{optState}</option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs">
          <AlertCircle size={15} className="shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
