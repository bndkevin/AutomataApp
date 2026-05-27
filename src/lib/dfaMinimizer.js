/**
 * DFA Minimizer Engine
 * Implements Hopcroft's / Partition Refinement algorithm to minimize a DFA.
 */

export function minimizeDFA(dfa) {
  const { states, alphabet, startState, acceptStates, transitions } = dfa;

  // Step 1: Remove unreachable states using BFS from start state
  const reachable = new Set();
  const queue = [startState];
  reachable.add(startState);

  while (queue.length > 0) {
    const current = queue.shift();
    const stateTrans = transitions[current] || {};
    for (const sym of alphabet) {
      const next = stateTrans[sym];
      if (next && !reachable.has(next)) {
        reachable.add(next);
        queue.push(next);
      }
    }
  }

  const reachableStates = Array.from(reachable).sort();
  const unreachableStates = states.filter(s => !reachable.has(s));

  // Step 2: Initialize partition P = {Accept States, Non-Accept States}
  const acceptReachable = reachableStates.filter(s => acceptStates.includes(s));
  const nonAcceptReachable = reachableStates.filter(s => !acceptStates.includes(s));

  let partitions = [];
  if (nonAcceptReachable.length > 0) {
    partitions.push(nonAcceptReachable);
  }
  if (acceptReachable.length > 0) {
    partitions.push(acceptReachable);
  }

  const trace = [];
  trace.push({
    round: 0,
    partitions: partitions.map(p => `[${p.join(",")}]`),
    note: "Inisialisasi partisi awal: kelompok Non-Accept dan kelompok Accept."
  });

  // Helper: Find which partition group index a state belongs to
  const getGroupIndex = (state, currentPartitions) => {
    return currentPartitions.findIndex(group => group.includes(state));
  };

  // Step 3: Iteratively refine partitions
  let changed = true;
  let roundNum = 1;

  while (changed && roundNum < 20) {
    changed = false;
    const newPartitions = [];

    for (const group of partitions) {
      if (group.length <= 1) {
        newPartitions.push(group);
        continue;
      }

      // Distribute states into subgroups based on where they transition to
      const subgroups = [];
      
      for (const state of group) {
        let placed = false;
        
        for (const sub of subgroups) {
          const representative = sub[0];
          let behavesSame = true;

          for (const sym of alphabet) {
            const next1 = transitions[state]?.[sym];
            const next2 = transitions[representative]?.[sym];

            const g1 = getGroupIndex(next1, partitions);
            const g2 = getGroupIndex(next2, partitions);

            if (g1 !== g2) {
              behavesSame = false;
              break;
            }
          }

          if (behavesSame) {
            sub.push(state);
            placed = true;
            break;
          }
        }

        if (!placed) {
          subgroups.push([state]);
        }
      }

      if (subgroups.length > 1) {
        changed = true;
      }
      newPartitions.push(...subgroups);
    }

    partitions = newPartitions;
    
    trace.push({
      round: roundNum,
      partitions: partitions.map(p => `[${p.join(",")}]`),
      note: changed 
        ? `Ronde ${roundNum}: Terjadi pembagian partisi karena ada transisi dari state dalam kelompok yang menuju ke kelompok berbeda.`
        : `Ronde ${roundNum}: Tidak ada partisi yang bisa dibagi lagi. Konvergen.`
    });
    
    roundNum++;
  }

  // Step 4: Build Minimized DFA from Equivalence Classes
  // Name new merged states Q0, Q1, Q2...
  // Make sure the group containing startState becomes Q0 (for consistency)
  const sortedPartitions = [...partitions].sort((a, b) => {
    const hasStartA = a.includes(startState);
    const hasStartB = b.includes(startState);
    if (hasStartA) return -1;
    if (hasStartB) return 1;
    return a[0].localeCompare(b[0]);
  });

  const stateMap = {}; // originalState -> minimizedState (e.g. Q0)
  const minStates = [];
  const minAcceptStates = [];
  const equivalenceClasses = [];

  sortedPartitions.forEach((group, index) => {
    const minStateName = `Q${index}`;
    minStates.push(minStateName);
    
    group.forEach(s => {
      stateMap[s] = minStateName;
    });

    if (group.some(s => acceptStates.includes(s))) {
      minAcceptStates.push(minStateName);
    }

    equivalenceClasses.push({
      minState: minStateName,
      originalStates: group,
      label: `{${group.join(", ")}} → merged to ${minStateName}`
    });
  });

  const minStartState = stateMap[startState];

  // Rebuild Transition Function
  const minTransitions = {};
  for (const minState of minStates) {
    minTransitions[minState] = {};
  }

  sortedPartitions.forEach((group, index) => {
    const minStateName = `Q${index}`;
    const representative = group[0];
    const originalTrans = transitions[representative] || {};
    
    for (const sym of alphabet) {
      const nextOriginal = originalTrans[sym];
      if (nextOriginal) {
        minTransitions[minStateName][sym] = stateMap[nextOriginal];
      }
    }
  });

  return {
    original: {
      stateCount: states.length,
      unreachable: unreachableStates
    },
    minimized: {
      states: minStates,
      alphabet: [...alphabet],
      startState: minStartState,
      acceptStates: minAcceptStates,
      transitions: minTransitions,
      stateCount: minStates.length
    },
    equivalenceClasses,
    trace
  };
}
