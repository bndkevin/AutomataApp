import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function NFAInputForm({
  value,
  onChange,
  onLoadExample = null,
  title = "Konfigurasi NFA",
  exampleLabel = "Load Contoh NFA"
}) {
  const { states, alphabet, startState, acceptStates, transitions } = value;

  // Local text states for input editing to avoid losing focus/sluggishness on every keystroke
  const [statesInput, setStatesInput] = useState(states.join(', '));
  const [alphabetInput, setAlphabetInput] = useState(alphabet.join(', '));
  const [validationError, setValidationError] = useState("");

  // Keep track of local cell text values so typing is extremely smooth
  // Structure: { "q0-a": "q0, q1", "q0-ε": "q1" }
  const [cellTexts, setCellTexts] = useState({});

  // Synchronize local input fields if value changes from outside (e.g. Load Example)
  useEffect(() => {
    const currentParsedStates = statesInput.split(',').map(s => s.trim()).filter(s => s !== "");
    const isStatesSame = currentParsedStates.length === states.length && currentParsedStates.every((s, i) => s === states[i]);
    if (!isStatesSame) {
      setStatesInput(states.join(', '));
    }

    const currentParsedAlphabet = alphabetInput.split(',').map(a => a.trim()).filter(a => a !== "");
    const isAlphabetSame = currentParsedAlphabet.length === alphabet.length && currentParsedAlphabet.every((a, i) => a === alphabet[i]);
    if (!isAlphabetSame) {
      setAlphabetInput(alphabet.join(', '));
    }

    // Build local cellTexts from transitions only if they are structurally different
    const newCellTexts = { ...cellTexts };
    let hasChanged = false;
    states.forEach(s => {
      // alphabet symbols
      alphabet.forEach(sym => {
        const key = `${s}-${sym}`;
        const val = transitions[s]?.[sym] || [];
        const currentText = cellTexts[key] || "";
        const parsedCurrent = currentText.split(',').map(x => x.trim()).filter(x => x !== "");
        const isSame = val.length === parsedCurrent.length && val.every((v, idx) => v === parsedCurrent[idx]);
        
        if (!isSame) {
          newCellTexts[key] = Array.isArray(val) ? val.join(', ') : val;
          hasChanged = true;
        }
      });
      // epsilon symbol
      const epsKey = `${s}-ε`;
      const epsVal = transitions[s]?.[`""`] || transitions[s]?.[`ε`] || transitions[s]?.[`anim`] || transitions[s]?.[""] || [];
      const finalEpsVal = Array.isArray(epsVal) 
        ? epsVal 
        : (epsVal ? [epsVal] : []);
      const currentText = cellTexts[epsKey] || "";
      const parsedCurrent = currentText.split(',').map(x => x.trim()).filter(x => x !== "");
      const isSame = finalEpsVal.length === parsedCurrent.length && finalEpsVal.every((v, idx) => v === parsedCurrent[idx]);

      if (!isSame) {
        newCellTexts[epsKey] = finalEpsVal.join(', ');
        hasChanged = true;
      }
    });

    if (hasChanged || Object.keys(cellTexts).length === 0) {
      setCellTexts(newCellTexts);
    }
  }, [states, alphabet, transitions]);

  // Handle parsing of states comma-separated text
  const handleStatesChange = (val) => {
    setStatesInput(val);
    const parsedStates = val.split(',')
      .map(s => s.trim())
      .filter(s => s !== "");

    const newStart = parsedStates.includes(startState) ? startState : (parsedStates[0] || "");
    const newAccept = acceptStates.filter(s => parsedStates.includes(s));

    // Update transitions
    const newTransitions = {};
    parsedStates.forEach(s => {
      newTransitions[s] = {};
      
      // Preserve alphabet transitions
      alphabet.forEach(sym => {
        const existing = transitions[s]?.[sym];
        newTransitions[s][sym] = Array.isArray(existing) 
          ? existing.filter(x => parsedStates.includes(x))
          : [];
      });

      // Preserve epsilon transition (stored as key "")
      const existingEps = transitions[s]?.[`""`] || transitions[s]?.[`ε`] || transitions[s]?.[`anim`] || transitions[s]?.[""] || [];
      const finalEps = Array.isArray(existingEps) ? existingEps : (existingEps ? [existingEps] : []);
      newTransitions[s][`""`] = finalEps.filter(x => parsedStates.includes(x));
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
      
      // Preserve alphabet transitions
      parsedAlphabet.forEach(sym => {
        const existing = transitions[s]?.[sym];
        newTransitions[s][sym] = Array.isArray(existing) ? existing : [];
      });

      // Preserve epsilon transition (stored as key "")
      const existingEps = transitions[s]?.[`""`] || transitions[s]?.[`ε`] || transitions[s]?.[`anim`] || transitions[s]?.[""] || [];
      const finalEps = Array.isArray(existingEps) ? existingEps : (existingEps ? [existingEps] : []);
      newTransitions[s][`""`] = finalEps;
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
  const handleTransitionCellTextChange = (fromState, symbol, textValue) => {
    // 1. Update local text state for smooth typing
    const key = `${fromState}-${symbol}`;
    setCellTexts(prev => ({
      ...prev,
      [key]: textValue
    }));

    // 2. Parse target states list
    const parsedTargets = textValue.split(',')
      .map(s => s.trim())
      .filter(s => s !== "");

    // 3. Update parent transitions
    const symKey = symbol === "ε" ? `""` : symbol;
    const newTransitions = {
      ...transitions,
      [fromState]: {
        ...(transitions[fromState] || {}),
        [symKey]: parsedTargets
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

    // Check if there are any invalid states entered in transition cells
    let invalidStateFound = false;
    let invalidStateName = "";
    
    for (const [key, textVal] of Object.entries(cellTexts)) {
      if (!textVal) continue;
      const parsed = textVal.split(',').map(s => s.trim()).filter(s => s !== "");
      for (const target of parsed) {
        if (!states.includes(target)) {
          invalidStateFound = true;
          invalidStateName = target;
          break;
        }
      }
      if (invalidStateFound) break;
    }

    if (invalidStateFound) {
      setValidationError(`State '${invalidStateName}' di tabel transisi tidak terdefinisi di daftar States.`);
    } else {
      setValidationError("");
    }
  }, [states, alphabet, startState, acceptStates, cellTexts]);

  // Check if a specific cell text contains invalid states
  const isCellInvalid = (textVal) => {
    if (!textVal) return false;
    const parsed = textVal.split(',').map(s => s.trim()).filter(s => s !== "");
    return parsed.some(target => !states.includes(target));
  };

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

      {/* Transition Function Editable Table for NFA */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Tabel Fungsi Transisi NFA (δ) - Masukkan target dipisah koma (contoh: q0, q1)
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
                  <th className="px-4 py-3 font-semibold text-emerald-400 text-center text-xs uppercase">
                    ε (epsilon)
                  </th>
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
                    
                    {/* Alphabet columns */}
                    {alphabet.map(sym => {
                      const valKey = `${fromState}-${sym}`;
                      const cellVal = cellTexts[valKey] || "";
                      const invalid = isCellInvalid(cellVal);
                      return (
                        <td key={sym} className="px-4 py-2 text-center">
                          <input
                            type="text"
                            value={cellVal}
                            onChange={(e) => handleTransitionCellTextChange(fromState, sym, e.target.value)}
                            placeholder="Ø"
                            className={`w-full max-w-[120px] mx-auto bg-slate-950 border text-xs px-2.5 py-1.5 rounded-lg focus:outline-none transition font-mono text-center
                              ${invalid
                                ? 'border-red-500 text-red-400 focus:border-red-500' 
                                : 'border-slate-850 text-slate-200 focus:border-indigo-500'}`}
                          />
                        </td>
                      );
                    })}

                    {/* Epsilon transition column */}
                    <td className="px-4 py-2 text-center">
                      {(() => {
                        const valKey = `${fromState}-ε`;
                        const cellVal = cellTexts[valKey] || "";
                        const invalid = isCellInvalid(cellVal);
                        return (
                          <input
                            type="text"
                            value={cellVal}
                            onChange={(e) => handleTransitionCellTextChange(fromState, "ε", e.target.value)}
                            placeholder="Ø"
                            className={`w-full max-w-[120px] mx-auto bg-slate-950 border text-xs px-2.5 py-1.5 rounded-lg focus:outline-none transition font-mono text-center
                              ${invalid
                                ? 'border-red-500 text-red-400 focus:border-red-500' 
                                : 'border-slate-850 text-slate-200 focus:border-emerald-500'}`}
                          />
                        );
                      })()}
                    </td>
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
