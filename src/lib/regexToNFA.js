/**
 * Thompson's Construction Algorithm for Regex to NFA translation.
 * Supports: a, a|b, ab, a*, a+, a?, (a|b)*
 */

// Global state counter for NFA states (reset each build)
let stateCounter = 0;
function createNewStateName() {
  return `n${stateCounter++}`;
}

// AST Nodes
class ASTNode {
  constructor(type, value = null, left = null, right = null) {
    this.type = type; // 'char', 'union', 'concat', 'star', 'plus', 'question'
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

/**
 * Preprocesses a regex string to insert explicit concatenation dots '.'.
 * Example: "(a|b)*aa" -> "(a|b)*.a.a"
 */
function insertExplicitConcat(regex) {
  let result = "";
  const nonOperands = new Set(['(', ')', '|', '*', '+', '?', '.']);
  
  for (let i = 0; i < regex.length; i++) {
    const curr = regex[i];
    result += curr;
    
    if (i + 1 < regex.length) {
      const next = regex[i + 1];
      
      // Can curr end an expression?
      const endsExpr = !nonOperands.has(curr) || curr === ')' || curr === '*' || curr === '+' || curr === '?';
      // Can next start an expression?
      const startsExpr = !nonOperands.has(next) || next === '(';
      
      if (endsExpr && startsExpr) {
        result += ".";
      }
    }
  }
  return result;
}


/**
 * Regex Parser (Recursive Descent)
 */
class RegexParser {
  constructor(regex) {
    this.input = insertExplicitConcat(regex.replace(/\s+/g, ""));
    this.pos = 0;
  }

  peek() {
    return this.pos < this.input.length ? this.input[this.pos] : null;
  }

  next() {
    return this.pos < this.input.length ? this.input[this.pos++] : null;
  }

  parse() {
    if (this.input === "") {
      // Empty regex
      return new ASTNode('char', '');
    }
    const node = this.parseUnion();
    if (this.pos < this.input.length) {
      throw new Error(`Karakter tidak terduga pada posisi ${this.pos}: '${this.peek()}'`);
    }
    return node;
  }

  // parseUnion() -> parseConcat() ('|' parseConcat())*
  parseUnion() {
    let node = this.parseConcat();
    while (this.peek() === '|') {
      this.next(); // consume '|'
      const right = this.parseConcat();
      node = new ASTNode('union', null, node, right);
    }
    return node;
  }

  // parseConcat() -> parseQuantifier() ('.' parseQuantifier())*
  parseConcat() {
    let node = this.parseQuantifier();
    while (this.peek() === '.') {
      this.next(); // consume '.'
      const right = this.parseQuantifier();
      node = new ASTNode('concat', null, node, right);
    }
    return node;
  }

  // parseQuantifier() -> parseAtom() ('*' | '+' | '?')?
  parseQuantifier() {
    let node = this.parseAtom();
    const nextChar = this.peek();
    if (nextChar === '*') {
      this.next();
      node = new ASTNode('star', null, node);
    } else if (nextChar === '+') {
      this.next();
      node = new ASTNode('plus', null, node);
    } else if (nextChar === '?') {
      this.next();
      node = new ASTNode('question', null, node);
    }
    return node;
  }

  // parseAtom() -> char | '(' parseUnion() ')'
  parseAtom() {
    const curr = this.peek();
    if (curr === '(') {
      this.next(); // consume '('
      const node = this.parseUnion();
      if (this.next() !== ')') {
        throw new Error("Tanda kurung tidak seimbang.");
      }
      return node;
    } else if (curr !== null && curr !== ')' && curr !== '|' && curr !== '*' && curr !== '+' && curr !== '?') {
      this.next();
      return new ASTNode('char', curr);
    } else {
      throw new Error(`Kesalahan sintaksis pada '${curr || 'EOF'}'`);
    }
  }
}

/**
 * Helper to deep-merge transition dictionaries
 */
function mergeTransitions(t1, t2) {
  const merged = {};
  
  const addAll = (t) => {
    for (const [fromState, stateTrans] of Object.entries(t)) {
      if (!merged[fromState]) {
        merged[fromState] = {};
      }
      for (const [symbol, targets] of Object.entries(stateTrans)) {
        if (!merged[fromState][symbol]) {
          merged[fromState][symbol] = [];
        }
        const targetsArray = Array.isArray(targets) ? targets : [targets];
        for (const target of targetsArray) {
          if (!merged[fromState][symbol].includes(target)) {
            merged[fromState][symbol].push(target);
          }
        }
      }
    }
  };

  addAll(t1);
  addAll(t2);
  return merged;
}

/**
 * Thompson's construction over the AST
 */
function buildThompsonNFA(node) {
  switch (node.type) {
    case 'char': {
      const start = createNewStateName();
      const accept = createNewStateName();
      const transitions = {
        [start]: {
          [node.value]: [accept]
        }
      };
      return { start, accept, transitions };
    }

    case 'concat': {
      const leftNFA = buildThompsonNFA(node.left);
      const rightNFA = buildThompsonNFA(node.right);

      // Connect left accept state to right start state with an epsilon transition
      const connection = {
        [leftNFA.accept]: {
          "": [rightNFA.start]
        }
      };

      const transitions = mergeTransitions(
        mergeTransitions(leftNFA.transitions, rightNFA.transitions),
        connection
      );

      return {
        start: leftNFA.start,
        accept: rightNFA.accept,
        transitions
      };
    }

    case 'union': {
      const leftNFA = buildThompsonNFA(node.left);
      const rightNFA = buildThompsonNFA(node.right);

      const start = createNewStateName();
      const accept = createNewStateName();

      const newTransitions = {
        [start]: {
          "": [leftNFA.start, rightNFA.start]
        },
        [leftNFA.accept]: {
          "": [accept]
        },
        [rightNFA.accept]: {
          "": [accept]
        }
      };

      const transitions = mergeTransitions(
        mergeTransitions(leftNFA.transitions, rightNFA.transitions),
        newTransitions
      );

      return { start, accept, transitions };
    }

    case 'star': {
      const innerNFA = buildThompsonNFA(node.left);
      const start = createNewStateName();
      const accept = createNewStateName();

      const newTransitions = {
        [start]: {
          "": [innerNFA.start, accept]
        },
        [innerNFA.accept]: {
          "": [innerNFA.start, accept]
        }
      };

      const transitions = mergeTransitions(innerNFA.transitions, newTransitions);
      return { start, accept, transitions };
    }

    case 'plus': {
      const innerNFA = buildThompsonNFA(node.left);
      const start = createNewStateName();
      const accept = createNewStateName();

      const newTransitions = {
        [start]: {
          "": [innerNFA.start]
        },
        [innerNFA.accept]: {
          "": [innerNFA.start, accept]
        }
      };

      const transitions = mergeTransitions(innerNFA.transitions, newTransitions);
      return { start, accept, transitions };
    }

    case 'question': {
      const innerNFA = buildThompsonNFA(node.left);
      const start = createNewStateName();
      const accept = createNewStateName();

      const newTransitions = {
        [start]: {
          "": [innerNFA.start, accept]
        },
        [innerNFA.accept]: {
          "": [accept]
        }
      };

      const transitions = mergeTransitions(innerNFA.transitions, newTransitions);
      return { start, accept, transitions };
    }

    default:
      throw new Error(`Unsupported AST Node Type: ${node.type}`);
  }
}

/**
 * Main function: Regex -> NFA Definition Object
 */
export function regexToNFA(regexString) {
  stateCounter = 0; // reset state names

  try {
    const parser = new RegexParser(regexString);
    const ast = parser.parse();
    const thompson = buildThompsonNFA(ast);

    // Extract all unique states
    const statesSet = new Set([thompson.start, thompson.accept]);
    for (const [fromState, trans] of Object.entries(thompson.transitions)) {
      statesSet.add(fromState);
      for (const targets of Object.values(trans)) {
        targets.forEach(t => statesSet.add(t));
      }
    }
    const states = Array.from(statesSet).sort((a, b) => {
      return parseInt(a.slice(1)) - parseInt(b.slice(1));
    });

    // Extract unique symbols (excluding epsilon "")
    const symbolsSet = new Set();
    for (const trans of Object.values(thompson.transitions)) {
      for (const sym of Object.keys(trans)) {
        if (sym !== "" && sym !== "ε") {
          symbolsSet.add(sym);
        }
      }
    }
    const alphabet = Array.from(symbolsSet).sort();

    // Re-fill all transitions so every state has a record
    const completeTransitions = {};
    for (const state of states) {
      completeTransitions[state] = thompson.transitions[state] || {};
    }

    return {
      states,
      alphabet,
      startState: thompson.start,
      acceptStates: [thompson.accept],
      transitions: completeTransitions,
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
