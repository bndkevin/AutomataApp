/**
 * DFA Simulator Engine
 * Handles DFA execution with detailed step-by-step trace mapping.
 * 
 * Test cases in comments:
 * --- FEATURE 1 (DFA) ---
 * Input DFA: strings over {a,b} ending with "aa"
 *   States: q0,q1,q2 | Start: q0 | Accept: q2
 *   δ: q0-a->q1, q0-b->q0, q1-a->q2, q1-b->q0, q2-a->q2, q2-b->q0
 * Test "abaa"  → ACCEPTED (trace: q0→q1→q0→q1→q2)
 * Test "ab"    → REJECTED (ends at q0, bukan accept state)
 * Test "aa"    → ACCEPTED (trace: q0→q1→q2)
 * Test ""      → REJECTED (empty string, start q0 bukan accept state)
 */

export function runDFA(dfa, inputString) {
  const { states, alphabet, startState, acceptStates, transitions } = dfa;

  // Validation
  if (!startState) {
    return {
      accepted: false,
      trace: [],
      finalState: null,
      reason: "Start state belum dikonfigurasi.",
      error: true
    };
  }

  const trace = [
    {
      step: 0,
      symbol: "(start)",
      currentState: startState,
      nextState: startState,
      note: "Memulai dari start state"
    }
  ];

  if (inputString === "") {
    const isAccepted = acceptStates.includes(startState);
    const reason = isAccepted
      ? `String kosong diterima karena start state '${startState}' merupakan accept state.`
      : `String kosong ditolak karena start state '${startState}' bukan accept state.`;
    
    return {
      accepted: isAccepted,
      trace,
      finalState: startState,
      reason
    };
  }

  let currentState = startState;
  
  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    
    // Check if symbol is in alphabet
    if (!alphabet.includes(symbol)) {
      return {
        accepted: false,
        trace,
        finalState: currentState,
        reason: `String ditolak karena simbol '${symbol}' tidak dikenali dalam alfabet.`
      };
    }

    const stateTransitions = transitions[currentState];
    const nextState = stateTransitions ? stateTransitions[symbol] : undefined;

    if (nextState === undefined || nextState === null || nextState === "") {
      const stepNum = i + 1;
      trace.push({
        step: stepNum,
        symbol,
        currentState,
        nextState: "Ø",
        note: `Ditolak: tidak ada transisi dari state '${currentState}' dengan simbol '${symbol}'`
      });

      return {
        accepted: false,
        trace,
        finalState: null,
        reason: `String '${inputString}' ditolak karena tidak ada transisi dari state '${currentState}' dengan simbol '${symbol}'.`
      };
    }

    const stepNum = i + 1;
    trace.push({
      step: stepNum,
      symbol,
      currentState,
      nextState,
      note: `Membaca '${symbol}': transisi dari '${currentState}' ke '${nextState}'`
    });

    currentState = nextState;
  }

  const isAccepted = acceptStates.includes(currentState);
  const reason = isAccepted
    ? `String '${inputString}' diterima karena berakhir di state '${currentState}' yang merupakan accept state.`
    : `String '${inputString}' ditolak karena berakhir di state '${currentState}' yang BUKAN accept state.`;

  return {
    accepted: isAccepted,
    trace,
    finalState: currentState,
    reason
  };
}
