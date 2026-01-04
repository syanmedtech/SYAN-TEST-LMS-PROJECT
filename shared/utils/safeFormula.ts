/**
 * Safe Medical Formula Evaluator
 * Supports basic arithmetic, parentheses, and specific Math functions.
 * No eval() or new Function() used.
 */

const ALLOWED_FUNCTIONS = new Set(['min', 'max', 'round', 'floor', 'ceil', 'pow', 'sqrt', 'abs']);

export interface FormulaResult {
  success: boolean;
  value?: number;
  error?: string;
}

export const validateFormula = (formula: string, availableKeys: string[]): { valid: boolean; error?: string } => {
  if (!formula.trim()) return { valid: false, error: "Formula is empty" };

  // Remove whitespace
  const clean = formula.replace(/\s+/g, '');
  
  // Regex to extract identifiers (words)
  const identifiers = clean.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  
  for (const id of identifiers) {
    if (!ALLOWED_FUNCTIONS.has(id) && !availableKeys.includes(id)) {
      return { valid: false, error: `Invalid identifier: "${id}". Only input keys and Math functions (min, max, etc.) are allowed.` };
    }
  }

  // Check for balanced parentheses
  let balance = 0;
  for (const char of clean) {
    if (char === '(') balance++;
    if (char === ')') balance--;
    if (balance < 0) return { valid: false, error: "Unbalanced parentheses" };
  }
  if (balance !== 0) return { valid: false, error: "Unbalanced parentheses" };

  return { valid: true };
};

/**
 * Basic expression parser using Shunting-Yard + RPN Evaluation
 */
export const evaluateSafeFormula = (formula: string, variables: Record<string, number>): FormulaResult => {
  try {
    const tokens = tokenize(formula, variables);
    const rpn = shuntingYard(tokens);
    const result = evaluateRPN(rpn);
    return { success: true, value: result };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

function tokenize(formula: string, variables: Record<string, number>): string[] {
  const result: string[] = [];
  const regex = /([0-9]*\.?[0-9]+)|([a-zA-Z_][a-zA-Z0-9_]*)|([\+\-\*\/\(\)\,])/g;
  let match;

  while ((match = regex.exec(formula)) !== null) {
    if (match[1]) result.push(match[1]); // Number
    else if (match[2]) {
      const id = match[2];
      if (ALLOWED_FUNCTIONS.has(id)) result.push(id);
      else if (id in variables) result.push(variables[id].toString());
      else throw new Error(`Unknown variable: ${id}`);
    }
    else if (match[3]) result.push(match[3]); // Operator/Paren
  }
  return result;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1, '-': 1, '*': 2, '/': 2,
  'min': 0, 'max': 0, 'round': 0, 'floor': 0, 'ceil': 0, 'pow': 0, 'sqrt': 0, 'abs': 0
};

function shuntingYard(tokens: string[]): string[] {
  const output: string[] = [];
  const stack: string[] = [];

  tokens.forEach(token => {
    if (!isNaN(parseFloat(token))) {
      output.push(token);
    } else if (ALLOWED_FUNCTIONS.has(token)) {
      stack.push(token);
    } else if (token === ',') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!);
      }
    } else if (token in PRECEDENCE && !ALLOWED_FUNCTIONS.has(token)) {
      while (stack.length && stack[stack.length - 1] in PRECEDENCE && 
             PRECEDENCE[stack[stack.length - 1]] >= PRECEDENCE[token]) {
        output.push(stack.pop()!);
      }
      stack.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop()!);
      }
      stack.pop(); // pop '('
      if (stack.length && ALLOWED_FUNCTIONS.has(stack[stack.length - 1])) {
        output.push(stack.pop()!);
      }
    }
  });

  while (stack.length) {
    output.push(stack.pop()!);
  }
  return output;
}

function evaluateRPN(rpn: string[]): number {
  const stack: number[] = [];

  rpn.forEach(token => {
    if (!isNaN(parseFloat(token))) {
      stack.push(parseFloat(token));
    } else {
      const op = token;
      if (op === '+') stack.push(stack.pop()! + stack.pop()!);
      else if (op === '-') { const b = stack.pop()!, a = stack.pop()!; stack.push(a - b); }
      else if (op === '*') stack.push(stack.pop()! * stack.pop()!);
      else if (op === '/') { const b = stack.pop()!, a = stack.pop()!; stack.push(a / b); }
      else if (op === 'min') stack.push(Math.min(stack.pop()!, stack.pop()!));
      else if (op === 'max') stack.push(Math.max(stack.pop()!, stack.pop()!));
      else if (op === 'round') stack.push(Math.round(stack.pop()!));
      else if (op === 'floor') stack.push(Math.floor(stack.pop()!));
      else if (op === 'ceil') stack.push(Math.ceil(stack.pop()!));
      else if (op === 'abs') stack.push(Math.abs(stack.pop()!));
      else if (op === 'sqrt') stack.push(Math.sqrt(stack.pop()!));
      else if (op === 'pow') { const b = stack.pop()!, a = stack.pop()!; stack.push(Math.pow(a, b)); }
    }
  });

  return stack[0];
}
