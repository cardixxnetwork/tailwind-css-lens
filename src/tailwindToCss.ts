/**
 * Tailwind class → CSS conversion using the real Tailwind CSS v4 engine.
 * Used by the "View as CSS" CodeLens action.
 */

import { resolveClass, resolveClasses } from "./tailwindEngine";

// =====================================================================
// VARIANT SYSTEM
// =====================================================================

/**
 * Variant map used by cssToTailwind.ts for reverse mapping.
 * Values must match the format the engine produces in CSS output.
 */
export const VARIANT_MAP: Record<string, string> = {
  // Responsive (engine uses width >= Nrem)
  sm: "@media (width >= 40rem)",
  md: "@media (width >= 48rem)",
  lg: "@media (width >= 64rem)",
  xl: "@media (width >= 80rem)",
  "2xl": "@media (width >= 96rem)",

  // Container queries (v4)
  "@sm": "@container (min-width: 20rem)",
  "@md": "@container (min-width: 24rem)",
  "@lg": "@container (min-width: 32rem)",
  "@xl": "@container (min-width: 36rem)",
  "@2xl": "@container (min-width: 42rem)",

  // State
  hover: "&:hover",
  focus: "&:focus",
  active: "&:active",
  disabled: "&:disabled",
  visited: "&:visited",
  checked: "&:checked",
  required: "&:required",
  "focus-within": "&:focus-within",
  "focus-visible": "&:focus-visible",
  first: "&:first-child",
  last: "&:last-child",
  odd: "&:nth-child(odd)",
  even: "&:nth-child(even)",
  "first-of-type": "&:first-of-type",
  "last-of-type": "&:last-of-type",
  "only-child": "&:only-child",
  empty: "&:empty",
  "group-hover": "&:is(:where(.group):hover *)",
  "group-focus": "&:is(:where(.group):focus *)",
  "peer-hover": "&:is(:where(.peer):hover ~ *)",
  "peer-focus": "&:is(:where(.peer):focus ~ *)",

  // v4 variants
  inert: "&:is([inert], [inert] *)",
  starting: "@starting-style",
  "forced-colors": "@media (forced-colors: active)",
  open: "&[open]",

  // Dark / print / motion
  dark: "@media (prefers-color-scheme: dark)",
  print: "@media print",
  "motion-reduce": "@media (prefers-reduced-motion: reduce)",
  "motion-safe": "@media (prefers-reduced-motion: no-preference)",
  "contrast-more": "@media (prefers-contrast: more)",
  "contrast-less": "@media (prefers-contrast: less)",

  // Pseudo elements
  before: "&::before",
  after: "&::after",
  placeholder: "&::placeholder",
  selection: "&::selection",
  marker: "&::marker",
  file: "&::file-selector-button",
  backdrop: "&::backdrop",
  "first-letter": "&::first-letter",
  "first-line": "&::first-line",
};

/**
 * Strip variant prefixes from a Tailwind class.
 * Returns the variant rules array and the base class.
 */
function stripVariants(cls: string): { variantRules: string[]; baseClass: string } {
  const variantRules: string[] = [];
  let remaining = cls;

  while (true) {
    // Don't split inside [] for arbitrary values
    const bracketStart = remaining.indexOf("[");
    const colonPos = remaining.indexOf(":");

    // No colon, or colon is inside brackets — no more variants
    if (colonPos === -1) break;
    if (bracketStart !== -1 && bracketStart < colonPos) break;

    const candidate = remaining.slice(0, colonPos);
    if (VARIANT_MAP[candidate]) {
      variantRules.push(VARIANT_MAP[candidate]);
      remaining = remaining.slice(colonPos + 1);
    } else {
      break;
    }
  }

  return { variantRules, baseClass: remaining };
}

// =====================================================================
// MAIN EXPORTS
// =====================================================================

/**
 * Convert a single Tailwind class to its CSS representation.
 * Uses the real Tailwind CSS v4 engine for accurate output.
 */
export async function tailwindClassToCss(cls: string): Promise<string | null> {
  // For variant classes, the engine handles them directly
  const result = await resolveClass(cls);
  return result;
}

export async function tailwindClassesToCss(classString: string): Promise<string> {
  const classes = classString.trim().split(/\s+/).filter(Boolean);
  if (classes.length === 0) return "/* No classes */";

  const resolved = await resolveClasses(classes);

  const lines: string[] = [".element {"];
  for (const cls of classes) {
    const css = resolved.get(cls);
    if (css) {
      lines.push(`  ${css}`);
    } else {
      lines.push(`  /* unknown: ${cls} */`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}

export async function tailwindClassesToCssDeclarations(classString: string): Promise<string> {
  const classes = classString.trim().split(/\s+/).filter(Boolean);
  if (classes.length === 0) return "";

  const resolved = await resolveClasses(classes);

  const lines: string[] = [];
  for (const cls of classes) {
    const css = resolved.get(cls);
    if (css) {
      // Check if the CSS contains nested blocks (variant classes, @supports, etc.)
      if (css.includes("{")) {
        // Collapse to single line and add tw tag
        const singleLine = css.replace(/\s*\n\s*/g, " ").trim();
        lines.push(`${singleLine} /* tw: ${cls} */`);
      } else {
        // Non-variant: split into individual declaration lines
        const declarations = css.split(";").map((d) => d.trim()).filter(Boolean);
        for (let i = 0; i < declarations.length; i++) {
          if (i === 0) {
            lines.push(`${declarations[i]}; /* tw: ${cls} */`);
          } else {
            lines.push(`${declarations[i]}; /* tw+: ${cls} */`);
          }
        }
      }
    } else {
      lines.push(`/* unknown: ${cls} */`);
    }
  }
  return lines.join("\n");
}
