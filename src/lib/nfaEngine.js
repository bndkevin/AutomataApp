/**
 * NFA Simulator Engine
 * Uses Epsilon-Closure and subset construction to simulate NFA strings in parallel.
 */

/**
 * Computes the epsilon-closure of a given set of states.
 * Epsilon transitions are represented by empty string "" or "ε" in transitions.
 */
export function getEpsilonClosure(states, transitions) {
  const closure = new Set(states);
  const queue = [...states];

  while (queue.length > 0) {
    const state = queue.shift();
    const stateTransitions = transitions[state];
    
    if (stateTransitions) {
      // Check both empty string "" and symbol "ε"
      const epsTransitions = stateTransitions[""] || stateTransitions["ε"] || [];
      const epsTargets = Array.isArray(epsTransitions) ? epsTransitions : [epsTransitions];

      for (const nextState of epsTargets) {
        if (nextState && !closure.has(nextState)) {
          closure.add(nextState);
          queue.push(nextState);
        }
      }
    }
  }

  return Array.from(closure).sort();
}

/**
 * Simulates an NFA on a given input string.
 * Returns the trace details and simulation results.
 */
export function runNFA(nfa, inputString) {
  const { states, alphabet, startState, acceptStates, transitions } = nfa;

  if (!startState) {
    return {
      accepted: false,
      trace: [],
      finalStates: [],
      reason: "Start state NFA belum dikonfigurasi.",
      error: true
    };
  }

  // Initial states are epsilon closure of start state
  const initialStates = getEpsilonClosure([startState], transitions);

  const trace = [
    {
      step: 0,
      symbol: "(start)",
      currentStates: [...initialStates],
      nextStates: [...initialStates],
      note: `Epsilon-closure dari start state '${startState}': {${initialStates.join(", ")}}`
    }
  ];

  let currentSet = [...initialStates];

  if (inputString === "") {
    const isAccepted = currentSet.some(s => acceptStates.includes(s));
    const reason = isAccepted
      ? `String kosong diterima karena closure state {${currentSet.join(", ")}} mengandung accept state.`
      : `String kosong ditolak karena closure state {${currentSet.join(", ")}} tidak mengandung accept state.`;
    
    return {
      accepted: isAccepted,
      trace,
      finalStates: currentSet,
      reason
    };
  }

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    
    // Check if symbol is in NFA alphabet
    if (!alphabet.includes(symbol)) {
      return {
        accepted: false,
        trace,
        finalStates: currentSet,
        reason: `String ditolak karena simbol '${symbol}' tidak dikenali dalam alfabet NFA.`
      };
    }

    // Move to next states
    const nextSet = new Set();
    for (const state of currentSet) {
      const stateTransitions = transitions[state];
      if (stateTransitions) {
        const targets = stateTransitions[symbol] || [];
        const targetsArray = Array.isArray(targets) ? targets : [targets];
        for (const t of targetsArray) {
          nextSet.add(t);
        }
      }
    }

    const nextStatesList = Array.from(nextSet).sort();
    
    // Epsilon closure of next states
    const closedNextStates = getEpsilonClosure(nextStatesList, transitions);
    const stepNum = i + 1;

    trace.push({
      step: stepNum,
      symbol,
      currentStates: [...currentSet],
      nextStates: [...closedNextStates],
      note: `Membaca '${symbol}': Transisi ke {${nextStatesList.join(", ")}} -> E-Closure menjadi {${closedNextStates.join(", ")}}`
    });

    currentSet = closedNextStates;
    
    if (currentSet.length === 0) {
      return {
        accepted: false,
        trace,
        finalStates: [],
        reason: `String '${inputString}' ditolak karena simulator mencapai set state kosong pada simbol '${symbol}'.`
      };
    }
  }

  const activeAcceptStates = currentSet.filter(s => acceptStates.includes(s));
  const isAccepted = activeAcceptStates.length > 0;
  
  const reason = isAccepted
    ? `String '${inputString}' diterima karena set state akhir {${currentSet.join(", ")}} mengandung accept state {${activeAcceptStates.join(", ")}}.`
    : `String '${inputString}' ditolak karena set state akhir {${currentSet.join(", ")}} tidak mengandung accept state.`;

  return {
    accepted: isAccepted,
    trace,
    finalStates: currentSet,
    reason
  };
}
