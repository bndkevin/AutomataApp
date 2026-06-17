/**
 * Graph Layout Helper for React Flow
 * Positions automaton states automatically using a circle or a straight line,
 * and sets up transitions with appropriate labels, custom self-loops, and highlights.
 */

export function getFlowElements(automaton, activeNode = null, activeEdge = null) {
  const { states, startState, acceptStates, transitions } = automaton;
  
  if (!states || states.length === 0) return { nodes: [], edges: [] };

  const nodesCount = states.length;
  const positions = {};

  if (nodesCount === 1) {
    positions[states[0]] = { x: 250, y: 200 };
  } else {
    // Arrange all states in a clean circle (polygon) to avoid linear line crossings and overlaps
    const centerX = 350;
    const centerY = 220;
    
    // Radius adapts dynamically based on node count to keep the diagram balanced
    const radius = nodesCount <= 3 ? 110 : nodesCount <= 5 ? 160 : 220;
    
    states.forEach((state, i) => {
      // Start at -Math.PI / 2 (top) so the start state is positioned at the top-center
      const angle = (i * 2 * Math.PI) / nodesCount - Math.PI / 2;
      positions[state] = {
        x: centerX + radius * Math.cos(angle) - 24, // offset center for 48px node
        y: centerY + radius * Math.sin(angle) - 24
      };
    });
  }

  // 2. Build nodes
  const nodes = states.map((state) => {
    const isStart = state === startState;
    const isAccept = acceptStates.includes(state);
    
    let type = 'normalNode';
    if (isStart && isAccept) {
      type = 'startAcceptNode';
    } else if (isStart) {
      type = 'startNode';
    } else if (isAccept) {
      type = 'acceptNode';
    }

    const isActive = activeNode === state || (Array.isArray(activeNode) && activeNode.includes(state));

    return {
      id: state,
      type,
      position: positions[state],
      data: { 
        label: state,
        isStart,
        isAccept,
        isActive
      },
      className: ''
    };
  });

  // 3. Build edges
  const edges = [];
  const edgeCountMap = {}; // Key: source-target, tracks multiple edges between same nodes to offset them

  // Group transitions by source-target pair to display merged labels (e.g., "a, b" on a single edge!)
  const groupedTransitions = {};

  Object.entries(transitions).forEach(([fromState, stateTrans]) => {
    Object.entries(stateTrans).forEach(([symbol, targets]) => {
      const targetList = Array.isArray(targets) ? targets : [targets];
      
      targetList.forEach((toState) => {
        if (!toState || toState === "Ø") return;

        const key = `${fromState}->${toState}`;
        if (!groupedTransitions[key]) {
          groupedTransitions[key] = {
            source: fromState,
            target: toState,
            symbols: new Set()
          };
        }
        groupedTransitions[key].symbols.add(symbol === "" ? "ε" : symbol);
      });
    });
  });

  Object.values(groupedTransitions).forEach(({ source, target, symbols }) => {
    const labelList = Array.from(symbols).sort();
    const label = labelList.join(", ");
    const isSelfLoop = source === target;
    const isEpsilon = labelList.includes("ε");

    const edgeId = `e-${source}-${label}-${target}`;
    
    // Check if this edge is active
    // An edge is active if activeEdge contains { source, target, symbol } (or array of such)
    let isActive = false;
    if (activeEdge) {
      const activeEdgesArray = Array.isArray(activeEdge) ? activeEdge : [activeEdge];
      isActive = activeEdgesArray.some(ae => {
        const activeSource = ae.source;
        const activeTarget = ae.target;
        const activeSymbol = ae.symbol === "" ? "ε" : ae.symbol;

        if (source === activeSource && target === activeTarget) {
          if (activeSymbol === null || activeSymbol === undefined || labelList.includes(activeSymbol)) {
            return true;
          }
        }
        return false;
      });
    }

    const edge = {
      id: edgeId,
      source,
      target,
      label,
      type: isSelfLoop ? 'selfconnecting' : 'default',
      // Dashed for epsilon transitions, orange/yellow stroke and custom animated class if active
      style: {
        stroke: isActive ? '#fbbf24' : '#6366f1',
        strokeWidth: isActive ? 3 : 2,
        strokeDasharray: isEpsilon ? '5,5' : 'none',
      },
      labelStyle: {
        fill: isActive ? '#facc15' : '#cbd5e1',
        fontWeight: isActive ? 'bold' : 'normal',
        fontSize: 12,
      },
      labelBgStyle: {
        fill: '#1e293b',
        fillOpacity: 0.8,
        rx: 4,
      },
      animated: isActive,
      className: isActive ? 'animated-edge' : ''
    };

    edges.push(edge);
  });

  return { nodes, edges };
}
