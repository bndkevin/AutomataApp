/**
 * DFA Equivalence Checker
 * Implements Product Automaton construction and BFS-based distinguishability check.
 */

export function checkDFAEquivalence(dfa1, dfa2) {
  const alphabet = Array.from(new Set([...dfa1.alphabet, ...dfa2.alphabet])).sort();

  // Validate starting states
  if (!dfa1.startState || !dfa2.startState) {
    return {
      equivalent: false,
      reason: "Start state pada salah satu DFA belum dikonfigurasi.",
      error: true
    };
  }

  // Helper: Format state pair as a string key
  const getPairKey = (s1, s2) => `(${s1},${s2})`;

  const visited = new Set();
  const queue = [];
  const startPair = { s1: dfa1.startState, s2: dfa2.startState, path: "" };

  visited.add(getPairKey(startPair.s1, startPair.s2));
  queue.push(startPair);

  // Reconstructed product automaton elements (for graph rendering)
  const productStates = [];
  const productTransitions = {};
  const productAcceptStates = []; // These are distinguishing states in the symmetric difference

  const traceSteps = [];

  let isEquivalent = true;
  let witnessString = null;
  let dfa1Accepted = false;
  let dfa2Accepted = false;

  while (queue.length > 0) {
    const { s1, s2, path } = queue.shift();
    const pairKey = getPairKey(s1, s2);
    productStates.push(pairKey);

    const isAcc1 = dfa1.acceptStates.includes(s1);
    const isAcc2 = dfa2.acceptStates.includes(s2);

    const isDistinguishable = isAcc1 !== isAcc2;

    if (isDistinguishable) {
      productAcceptStates.push(pairKey);
      
      if (isEquivalent) {
        // First distinguishing pair found is the shortest witness path
        isEquivalent = false;
        witnessString = path;
        dfa1Accepted = isAcc1;
        dfa2Accepted = isAcc2;
      }
    }

    traceSteps.push({
      pair: pairKey,
      path: path === "" ? "ε" : path,
      dfa1State: s1,
      dfa2State: s2,
      isAccept1: isAcc1,
      isAccept2: isAcc2,
      status: isDistinguishable ? "MEMBEDAKAN (Keduanya berbeda status)" : "SAMA (Keduanya Accept/Non-Accept)"
    });

    productTransitions[pairKey] = {};

    for (const sym of alphabet) {
      const next1 = dfa1.transitions[s1]?.[sym];
      const next2 = dfa2.transitions[s2]?.[sym];

      // If one of the transitions doesn't exist, we treat it as an error or dead state
      const effectiveNext1 = next1 || "Ø";
      const effectiveNext2 = next2 || "Ø";
      const nextPairKey = getPairKey(effectiveNext1, effectiveNext2);

      productTransitions[pairKey][sym] = nextPairKey;

      if (!visited.has(nextPairKey) && effectiveNext1 !== "Ø" && effectiveNext2 !== "Ø") {
        visited.add(nextPairKey);
        queue.push({
          s1: effectiveNext1,
          s2: effectiveNext2,
          path: path + sym
        });
      }
    }
  }

  // Construct Indonesian human-readable explanations
  let reason = "";
  if (isEquivalent) {
    reason = "Kedua DFA menerima bahasa yang sama (Ekuivalen). Tidak ditemukan string pembeda.";
  } else {
    reason = `Kedua DFA TIDAK ekuivalen. Ditemukan contoh string pembeda: '${witnessString}'.\n` +
             `DFA 1: ${dfa1Accepted ? "ACCEPTED" : "REJECTED"} | DFA 2: ${dfa2Accepted ? "ACCEPTED" : "REJECTED"}`;
  }

  return {
    equivalent: isEquivalent,
    witness: witnessString,
    dfa1Accepted,
    dfa2Accepted,
    reason,
    trace: traceSteps,
    productAutomaton: {
      states: productStates,
      alphabet,
      startState: getPairKey(dfa1.startState, dfa2.startState),
      acceptStates: productAcceptStates,
      transitions: productTransitions
    }
  };
}
