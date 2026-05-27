import React from 'react';

export default function SimulationLog({ trace = [], activeStepIndex = null, isNFA = false }) {
  if (!trace || trace.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-900/30 border border-slate-800 rounded-xl text-slate-500 text-sm">
        Belum ada langkah simulasi untuk ditampilkan.
      </div>
    );
  }

  // Format array/sets/strings nicely
  const formatStates = (states) => {
    if (Array.isArray(states)) {
      return `{${states.join(", ")}}`;
    }
    return states || "-";
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-inner">
      <div className="bg-slate-900/70 border-b border-slate-800/80 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Trace Log Simulasi Langkah demi Langkah
        </h3>
      </div>
      <div className="overflow-y-auto max-h-[300px] flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/30 border-b border-slate-800 text-slate-500">
              <th className="px-4 py-2 font-semibold text-center w-12">Step</th>
              <th className="px-4 py-2 font-semibold text-center w-24">Karakter</th>
              <th className="px-4 py-2 font-semibold">Current State{isNFA && "(s)"}</th>
              <th className="px-4 py-2 font-semibold">Next State{isNFA && "(s)"}</th>
              <th className="px-4 py-2 font-semibold">Penjelasan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {trace.map((stepData, index) => {
              const isCurrent = activeStepIndex === index;
              
              // Colors: Highlight if current step, or standard classes
              const rowClass = isCurrent
                ? 'bg-yellow-500/10 hover:bg-yellow-500/15 border-l-2 border-l-yellow-400 font-medium'
                : 'hover:bg-slate-900/20';

              const stepText = stepData.step === 0 ? "Mulailah" : stepData.step;

              return (
                <tr key={index} className={`transition-colors duration-200 ${rowClass}`}>
                  <td className="px-4 py-2.5 text-center font-semibold text-slate-500 font-mono">
                    {stepText}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold uppercase
                      ${stepData.symbol === "(start)" 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                        : 'bg-slate-800 text-slate-300'}`}>
                      {stepData.symbol === "(start)" ? "START" : `'${stepData.symbol}'`}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-indigo-400 font-medium">
                    {isNFA ? formatStates(stepData.currentStates) : stepData.currentState}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-cyan-400 font-medium">
                    {isNFA ? formatStates(stepData.nextStates) : stepData.nextState}
                  </td>
                  <td className={`px-4 py-2.5 text-[11px]
                    ${isCurrent ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {stepData.note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-900/20 px-4 py-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
        <span>Total Langkah: {trace.length - 1}</span>
        {activeStepIndex !== null && (
          <span className="text-yellow-400 animate-pulse">Langkah Aktif: {activeStepIndex}</span>
        )}
      </div>
    </div>
  );
}
