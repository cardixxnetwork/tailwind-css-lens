/**
 * Tailwind CSS v4 engine integration.
 * Uses the real Tailwind compiler to resolve class names to CSS declarations.
 */
import * as path from "path";
import * as fs from "fs";

// Lazy-loaded engine state
let enginePromise: Promise<TailwindEngine> | null = null;

interface TailwindEngine {
  build: (candidates: string[]) => string;
}

interface ThemeVars {
  vars: Map<string, string>;
}

/**
 * Initialize the Tailwind CSS v4 engine.
 * Reads the bundled index.css and compiles it once.
 */
async function initEngine(): Promise<TailwindEngine> {
  const { compile } = require("tailwindcss");
  const cssPath = path.join(
    path.dirname(require.resolve("tailwindcss/package.json")),
    "index.css"
  );
  const css = fs.readFileSync(cssPath, "utf8");
  return await compile(css);
}

function getEngine(): Promise<TailwindEngine> {
  if (!enginePromise) {
    enginePromise = initEngine();
  }
  return enginePromise;
}

/**
 * Extract theme variables from the @layer theme block in CSS output.
 */
function extractThemeVars(cssOutput: string): Map<string, string> {
  const vars = new Map<string, string>();

  // Match multi-line @layer theme block
  const themeMatch = cssOutput.match(/@layer theme\s*\{([\s\S]*?)\n\}/);
  if (!themeMatch) return vars;

  // Extract var declarations, handling multi-line values
  const content = themeMatch[1];
  const lines = content.split("\n");
  let currentProp = "";
  let currentVal = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "{" || trimmed === "}") continue;

    // New declaration
    const declMatch = trimmed.match(/^(--[\w-]+)\s*:\s*(.*)/);
    if (declMatch) {
      // Save previous
      if (currentProp) {
        vars.set(currentProp, currentVal.replace(/;\s*$/, "").trim());
      }
      currentProp = declMatch[1];
      currentVal = declMatch[2];
    } else if (currentProp) {
      // Continuation of previous value
      currentVal += " " + trimmed;
    }
  }
  // Save last
  if (currentProp) {
    vars.set(currentProp, currentVal.replace(/;\s*$/, "").trim());
  }

  return vars;
}

/**
 * Find the matching closing parenthesis for a var() call,
 * handling nested parentheses.
 */
function findVarEnd(value: string, start: number): number {
  let depth = 0;
  for (let i = start; i < value.length; i++) {
    if (value[i] === "(") depth++;
    else if (value[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Resolve CSS variable references using theme variables.
 * Handles nested var() and calc() expressions.
 */
function resolveVars(value: string, themeVars: Map<string, string>, depth = 0): string {
  if (depth > 10) return value;

  let result = "";
  let i = 0;
  while (i < value.length) {
    const varIdx = value.indexOf("var(", i);
    if (varIdx === -1) {
      result += value.slice(i);
      break;
    }

    result += value.slice(i, varIdx);
    const end = findVarEnd(value, varIdx + 3); // start after "var"
    if (end === -1) {
      result += value.slice(varIdx);
      break;
    }

    const inner = value.slice(varIdx + 4, end); // content inside var(...)
    // Split on first comma to get name and fallback
    const commaIdx = findTopLevelComma(inner);
    const varName = (commaIdx === -1 ? inner : inner.slice(0, commaIdx)).trim();
    const fallback = commaIdx === -1 ? null : inner.slice(commaIdx + 1).trim();

    const themeVal = themeVars.get(varName);
    if (themeVal) {
      result += resolveVars(themeVal, themeVars, depth + 1);
    } else if (fallback) {
      result += resolveVars(fallback, themeVars, depth + 1);
    } else {
      result += value.slice(varIdx, end + 1); // keep original var()
    }

    i = end + 1;
  }

  return resolveCalc(result);
}

/**
 * Find the first top-level comma (not inside nested parentheses).
 */
function findTopLevelComma(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (s[i] === "," && depth === 0) return i;
  }
  return -1;
}

/**
 * Resolve simple calc() expressions.
 * Handles: calc(0.25rem * 4) → 1rem, calc(1.25 / 0.875) → 1.42857
 */
function resolveCalc(value: string): string {
  return value.replace(/calc\(([^()]+)\)/g, (original, expr: string) => {
    const trimmed = expr.trim();

    // calc(A * B) where both are numbers (possibly with unit)
    const mulMatch = trimmed.match(/^([\d.]+)(rem|px|em|%)?\s*\*\s*([\d.]+)(rem|px|em|%)?$/);
    if (mulMatch) {
      const a = parseFloat(mulMatch[1]);
      const b = parseFloat(mulMatch[3]);
      const unit = mulMatch[2] || mulMatch[4] || "";
      const result = a * b;
      return cleanNumber(result) + unit;
    }

    // calc(A / B) where both are pure numbers
    const divMatch = trimmed.match(/^([\d.]+)\s*\/\s*([\d.]+)$/);
    if (divMatch) {
      const a = parseFloat(divMatch[1]);
      const b = parseFloat(divMatch[2]);
      if (b !== 0) {
        return cleanNumber(a / b);
      }
    }

    return original;
  });
}

function cleanNumber(n: number): string {
  // Round to reasonable precision and remove trailing zeros
  return parseFloat(n.toFixed(5)).toString();
}

/**
 * Extract utility rule blocks from the CSS output.
 * Returns a map from class selector (e.g. ".flex") to its declarations string.
 */
function extractUtilityRules(cssOutput: string): Map<string, string> {
  const rules = new Map<string, string>();

  // Find @layer utilities block
  const utilStart = cssOutput.indexOf("@layer utilities");
  if (utilStart === -1) return rules;

  // Find the opening brace of @layer utilities
  let braceIdx = cssOutput.indexOf("{", utilStart);
  if (braceIdx === -1) return rules;

  // Extract content using brace counting
  let depth = 1;
  let pos = braceIdx + 1;
  while (pos < cssOutput.length && depth > 0) {
    if (cssOutput[pos] === "{") depth++;
    else if (cssOutput[pos] === "}") depth--;
    pos++;
  }
  const utilContent = cssOutput.substring(braceIdx + 1, pos - 1);

  // Parse individual rules from the utilities content
  // Each top-level rule is: .selector { declarations }
  let i = 0;
  while (i < utilContent.length) {
    // Skip whitespace
    while (i < utilContent.length && /\s/.test(utilContent[i])) i++;
    if (i >= utilContent.length) break;

    // Read the selector (everything up to the first {)
    const selectorStart = i;
    while (i < utilContent.length && utilContent[i] !== "{") i++;
    if (i >= utilContent.length) break;
    const selector = utilContent.substring(selectorStart, i).trim();

    // Read the block content using brace counting
    const blockStart = i;
    let blockDepth = 0;
    while (i < utilContent.length) {
      if (utilContent[i] === "{") blockDepth++;
      else if (utilContent[i] === "}") {
        blockDepth--;
        if (blockDepth === 0) { i++; break; }
      }
      i++;
    }
    const fullBlock = utilContent.substring(blockStart, i).trim();

    if (selector.startsWith(".")) {
      rules.set(selector, fullBlock);
    }
  }

  return rules;
}

/**
 * Unescape a CSS selector to get the class name.
 * e.g. ".hover\\:underline" → "hover:underline"
 *      ".w-1\\/2" → "w-1/2"
 */
function unescapeSelector(selector: string): string {
  // Remove leading dot
  const cls = selector.startsWith(".") ? selector.slice(1) : selector;
  // Remove backslash escapes
  return cls.replace(/\\(.)/g, "$1");
}

/**
 * Parse declarations from a CSS rule block string.
 * Input: "{ --tw-font-weight: 600; font-weight: 600; }"
 * Returns: "--tw-font-weight: 600; font-weight: 600"
 */
function parseDeclarations(block: string): string {
  // Remove outer braces
  let content = block.trim();
  if (content.startsWith("{")) content = content.slice(1);
  if (content.endsWith("}")) content = content.slice(0, -1);
  content = content.trim();

  // Check if this contains nested blocks (variant wrappers)
  // If so, return the FULL nested content (not just declarations)
  if (content.includes("{")) {
    return content.trim();
  }

  // Extract declarations
  const decls: string[] = [];
  const regex = /([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    decls.push(`${match[1]}: ${match[2].trim()}`);
  }
  return decls.join("; ");
}

// Cache for resolved classes
const classCache = new Map<string, string | null>();

/**
 * Resolve a single Tailwind class to its CSS declarations.
 * Returns semicolon-separated declarations or null if unknown.
 *
 * For variant classes (e.g. "hover:underline", "lg:hidden"),
 * returns the full nested CSS block.
 */
export async function resolveClass(className: string): Promise<string | null> {
  if (classCache.has(className)) {
    return classCache.get(className)!;
  }

  const engine = await getEngine();
  const cssOutput = engine.build([className]);

  const themeVars = extractThemeVars(cssOutput);
  const rules = extractUtilityRules(cssOutput);

  let result: string | null = null;

  for (const [selector, block] of rules) {
    const cls = unescapeSelector(selector);
    if (cls === className) {
      let declarations = parseDeclarations(block);
      // Resolve theme variables
      declarations = resolveVars(declarations, themeVars);
      result = declarations || null;
      break;
    }
  }

  classCache.set(className, result);
  return result;
}

/**
 * Resolve multiple Tailwind classes at once (more efficient than individual calls).
 * Returns a map from class name to its CSS declarations (or null).
 */
export async function resolveClasses(classNames: string[]): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const uncached: string[] = [];

  for (const cls of classNames) {
    if (classCache.has(cls)) {
      results.set(cls, classCache.get(cls)!);
    } else {
      uncached.push(cls);
    }
  }

  if (uncached.length === 0) return results;

  const engine = await getEngine();
  const cssOutput = engine.build(uncached);

  const themeVars = extractThemeVars(cssOutput);
  const rules = extractUtilityRules(cssOutput);

  // Map selectors to class names
  for (const cls of uncached) {
    let found = false;
    for (const [selector, block] of rules) {
      const selectorCls = unescapeSelector(selector);
      if (selectorCls === cls) {
        let declarations = parseDeclarations(block);
        declarations = resolveVars(declarations, themeVars);
        const val = declarations || null;
        results.set(cls, val);
        classCache.set(cls, val);
        found = true;
        break;
      }
    }
    if (!found) {
      results.set(cls, null);
      classCache.set(cls, null);
    }
  }

  return results;
}

/**
 * Clear the class cache (useful for testing or config changes).
 */
export function clearCache(): void {
  classCache.clear();
  enginePromise = null;
}

// Export internals for testing
export const _testing = {
  extractThemeVars,
  extractUtilityRules,
  resolveVars,
  resolveCalc,
  parseDeclarations,
  unescapeSelector,
};
