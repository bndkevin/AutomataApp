import React from 'react';

export default function TransitionTable({ automaton, isNFA = false }) {
  const { states, alphabet, startState, acceptStates, transitions } = automaton;

  if (!states || states.length === 0) {
    return (
      <div className="text-center p-4 text-xs text-slate-500 italic">
        Data transisi tidak tersedia
      </div>
    );
  }

  // If NFA, display the epsilon transition column as well
  const tableColumns = isNFA ? [...alphabet, "ε"] : alphabet;

  // Helper: formats target cell
  const renderCellContent = (fromState, sym) => {
    const key = sym === "ε" ? "" : sym; // inside transitions object, epsilon is empty string ""
    const target = transitions[fromState]?.[key];

    if (target === undefined || target === null || target === "" || (Array.isArray(target) && target.length === 0)) {
      return <span className="text-slate-600 font-mono">Ø</span>;
    }

    if (Array.isArray(target)) {
      return <span className="font-mono text-emerald-400 font-medium">{`{${target.sort().join(", ")}}`}</span>;
    }

    return <span className="font-mono text-indigo-400 font-medium">{target}</span>;
  };

  return (
    <div className="overflow-x-auto border border-slate-700/60 rounded-xl bg-slate-900/10">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="bg-slate-900/60 border-b border-slate-700/60 text-slate-400">
            <th className="px-4 py-2.5 font-semibold uppercase tracking-wider">State</th>
            {tableColumns.map(sym => (
              <th key={sym} className="px-4 py-2.5 font-semibold text-center uppercase tracking-wider">
                {sym === "ε" ? (
                  <span className="text-emerald-400">ε (epsilon)</span>
                ) : (
                  <span>{sym}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40 text-slate-300">
          {states.map(state => {
            const isStart = state === startState;
            const isAccept = acceptStates.includes(state);

            return (
              <tr key={state} className="hover:bg-slate-900/20">
                <td className="px-4 py-2.5 font-semibold">
                  <div className="flex items-center gap-1.5">
                    {isStart && <span className="text-indigo-400 font-bold" title="Start State">➔</span>}
                    <span className={isAccept ? 'text-emerald-400 font-bold' : ''}>
                      {state}
                    </span>
                    {isAccept && <span className="text-emerald-400" title="Accept State">★</span>}
                  </div>
                </td>
                {tableColumns.map(sym => (
                  <td key={sym} className="px-4 py-2.5 text-center">
                    {renderCellContent(state, sym)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
