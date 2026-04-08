import { CompletionContext, CompletionResult, Completion } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";

/**
 * Map of CSS property names to their common values.
 * This provides property-specific value suggestions after the colon.
 */
const CSS_PROPERTY_VALUES: Record<string, string[]> = {
  display: [
    "none", "block", "inline", "inline-block", "flex", "inline-flex",
    "grid", "inline-grid", "table", "inline-table", "table-row",
    "table-cell", "table-column", "table-caption", "table-row-group",
    "table-header-group", "table-footer-group", "table-column-group",
    "list-item", "run-in", "contents", "flow-root",
  ],
  position: ["static", "relative", "absolute", "fixed", "sticky"],
  visibility: ["visible", "hidden", "collapse"],
  overflow: ["visible", "hidden", "scroll", "auto", "clip"],
  "overflow-x": ["visible", "hidden", "scroll", "auto", "clip"],
  "overflow-y": ["visible", "hidden", "scroll", "auto", "clip"],
  float: ["none", "left", "right", "inline-start", "inline-end"],
  clear: ["none", "left", "right", "both", "inline-start", "inline-end"],

  // Flexbox
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
  "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
  "justify-content": [
    "flex-start", "flex-end", "center", "space-between", "space-around",
    "space-evenly", "start", "end", "stretch",
  ],
  "align-items": [
    "flex-start", "flex-end", "center", "baseline", "stretch",
    "start", "end", "self-start", "self-end",
  ],
  "align-content": [
    "flex-start", "flex-end", "center", "space-between", "space-around",
    "stretch", "start", "end",
  ],
  "align-self": [
    "auto", "flex-start", "flex-end", "center", "baseline", "stretch",
    "start", "end", "self-start", "self-end",
  ],
  "flex-grow": ["0", "1"],
  "flex-shrink": ["0", "1"],
  "flex-basis": ["auto", "0", "content", "max-content", "min-content", "fit-content"],

  // Grid
  "grid-auto-flow": ["row", "column", "dense", "row dense", "column dense"],
  "justify-items": ["start", "end", "center", "stretch", "baseline"],
  "justify-self": ["auto", "start", "end", "center", "stretch", "baseline"],
  "place-content": ["start", "end", "center", "stretch", "space-between", "space-around", "space-evenly"],
  "place-items": ["start", "end", "center", "stretch", "baseline"],

  // Box model
  "box-sizing": ["content-box", "border-box"],
  margin: ["auto", "0"],
  padding: ["0"],

  // Typography
  "font-weight": [
    "normal", "bold", "bolder", "lighter",
    "100", "200", "300", "400", "500", "600", "700", "800", "900",
  ],
  "font-style": ["normal", "italic", "oblique"],
  "font-variant": ["normal", "small-caps"],
  "font-stretch": [
    "normal", "ultra-condensed", "extra-condensed", "condensed",
    "semi-condensed", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded",
  ],
  "text-align": ["left", "right", "center", "justify", "start", "end"],
  "text-decoration": ["none", "underline", "overline", "line-through"],
  "text-decoration-line": ["none", "underline", "overline", "line-through"],
  "text-decoration-style": ["solid", "double", "dotted", "dashed", "wavy"],
  "text-transform": ["none", "capitalize", "uppercase", "lowercase", "full-width"],
  "text-overflow": ["clip", "ellipsis"],
  "white-space": ["normal", "nowrap", "pre", "pre-wrap", "pre-line", "break-spaces"],
  "word-break": ["normal", "break-all", "keep-all", "break-word"],
  "word-wrap": ["normal", "break-word"],
  "overflow-wrap": ["normal", "break-word", "anywhere"],
  "line-break": ["auto", "loose", "normal", "strict", "anywhere"],
  "vertical-align": [
    "baseline", "sub", "super", "text-top", "text-bottom",
    "middle", "top", "bottom",
  ],
  "writing-mode": ["horizontal-tb", "vertical-rl", "vertical-lr"],
  direction: ["ltr", "rtl"],
  "unicode-bidi": ["normal", "embed", "bidi-override", "isolate", "isolate-override", "plaintext"],
  "font-size": [
    "xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large",
    "smaller", "larger",
  ],

  // Colors & backgrounds
  "background-color": ["transparent", "currentColor", "inherit"],
  color: ["inherit", "currentColor", "transparent"],
  "background-repeat": ["repeat", "repeat-x", "repeat-y", "no-repeat", "space", "round"],
  "background-size": ["auto", "cover", "contain"],
  "background-position": ["top", "bottom", "left", "right", "center"],
  "background-attachment": ["scroll", "fixed", "local"],
  "background-origin": ["padding-box", "border-box", "content-box"],
  "background-clip": ["border-box", "padding-box", "content-box", "text"],
  "background-blend-mode": [
    "normal", "multiply", "screen", "overlay", "darken", "lighten",
    "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
    "exclusion", "hue", "saturation", "color", "luminosity",
  ],

  // Borders
  "border-style": ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],
  "border-top-style": ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],
  "border-right-style": ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],
  "border-bottom-style": ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],
  "border-left-style": ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],
  "border-collapse": ["separate", "collapse"],
  "outline-style": ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset"],

  // Lists
  "list-style-type": [
    "none", "disc", "circle", "square", "decimal", "decimal-leading-zero",
    "lower-roman", "upper-roman", "lower-alpha", "upper-alpha",
    "lower-greek", "lower-latin", "upper-latin",
  ],
  "list-style-position": ["inside", "outside"],

  // Cursor & pointer
  cursor: [
    "auto", "default", "none", "context-menu", "help", "pointer",
    "progress", "wait", "cell", "crosshair", "text", "vertical-text",
    "alias", "copy", "move", "no-drop", "not-allowed", "grab", "grabbing",
    "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize",
    "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize",
    "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out",
  ],
  "pointer-events": ["auto", "none"],
  "user-select": ["auto", "none", "text", "all", "contain"],
  "touch-action": ["auto", "none", "pan-x", "pan-y", "manipulation", "pinch-zoom"],
  resize: ["none", "both", "horizontal", "vertical", "block", "inline"],

  // Transitions & animations
  "transition-timing-function": [
    "ease", "ease-in", "ease-out", "ease-in-out", "linear", "step-start", "step-end",
  ],
  "animation-direction": ["normal", "reverse", "alternate", "alternate-reverse"],
  "animation-fill-mode": ["none", "forwards", "backwards", "both"],
  "animation-play-state": ["running", "paused"],
  "animation-timing-function": [
    "ease", "ease-in", "ease-out", "ease-in-out", "linear", "step-start", "step-end",
  ],

  // Transforms
  "transform-origin": ["center", "top", "bottom", "left", "right"],
  "transform-style": ["flat", "preserve-3d"],
  "backface-visibility": ["visible", "hidden"],
  perspective: ["none"],

  // Object
  "object-fit": ["fill", "contain", "cover", "none", "scale-down"],
  "object-position": ["top", "bottom", "left", "right", "center"],

  // Aspect ratio
  "aspect-ratio": ["auto"],

  // Will change
  "will-change": ["auto", "scroll-position", "contents", "transform", "opacity"],

  // Contain
  contain: ["none", "strict", "content", "size", "layout", "style", "paint"],

  // Isolation
  isolation: ["auto", "isolate"],

  // Mix blend
  "mix-blend-mode": [
    "normal", "multiply", "screen", "overlay", "darken", "lighten",
    "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
    "exclusion", "hue", "saturation", "color", "luminosity",
  ],

  // Columns
  "column-fill": ["auto", "balance"],
  "column-span": ["none", "all"],

  // Table
  "table-layout": ["auto", "fixed"],
  "caption-side": ["top", "bottom"],
  "empty-cells": ["show", "hide"],

  // Appearance
  appearance: ["none", "auto"],

  // Scroll behavior
  "scroll-behavior": ["auto", "smooth"],
  "scroll-snap-type": ["none", "x mandatory", "y mandatory", "x proximity", "y proximity"],
  "scroll-snap-align": ["none", "start", "end", "center"],
  "overscroll-behavior": ["auto", "contain", "none"],
  "overscroll-behavior-x": ["auto", "contain", "none"],
  "overscroll-behavior-y": ["auto", "contain", "none"],

  // Gap
  gap: ["normal"],
  "row-gap": ["normal"],
  "column-gap": ["normal"],

  // Content
  content: ["none", "normal", "open-quote", "close-quote", "no-open-quote", "no-close-quote"],

  // Hyphens
  hyphens: ["none", "manual", "auto"],

  // Accent
  "accent-color": ["auto"],

  // Color scheme
  "color-scheme": ["normal", "light", "dark", "light dark"],

  // Print
  "page-break-before": ["auto", "always", "avoid", "left", "right"],
  "page-break-after": ["auto", "always", "avoid", "left", "right"],
  "page-break-inside": ["auto", "avoid"],
  "break-before": ["auto", "avoid", "always", "all", "avoid-page", "page", "left", "right", "recto", "verso", "avoid-column", "column", "avoid-region", "region"],
  "break-after": ["auto", "avoid", "always", "all", "avoid-page", "page", "left", "right", "recto", "verso", "avoid-column", "column", "avoid-region", "region"],
  "break-inside": ["auto", "avoid", "avoid-page", "avoid-column", "avoid-region"],
};

/** Global CSS values that apply to any property */
const GLOBAL_VALUES = ["inherit", "initial", "unset", "revert", "revert-layer"];

/**
 * Find the CSS property name on the current line before the cursor.
 * Walks backward from the colon to extract the property name.
 */
function findPropertyName(doc: string, pos: number): string | null {
  // Find the line containing pos
  let lineStart = pos;
  while (lineStart > 0 && doc[lineStart - 1] !== "\n") {
    lineStart--;
  }

  const lineUpToCursor = doc.slice(lineStart, pos);

  // Match "property-name:" possibly with value text after colon
  const match = lineUpToCursor.match(/^\s*([\w-]+)\s*:\s*/);
  if (match) {
    return match[1].toLowerCase();
  }
  return null;
}

/**
 * Check if cursor is in the value position (after a colon in a declaration).
 */
function isInValuePosition(doc: string, pos: number): boolean {
  let lineStart = pos;
  while (lineStart > 0 && doc[lineStart - 1] !== "\n") {
    lineStart--;
  }
  const lineUpToCursor = doc.slice(lineStart, pos);
  return /^\s*[\w-]+\s*:/.test(lineUpToCursor);
}

/**
 * Custom CSS completion source that provides property-specific value suggestions.
 */
export function cssValueCompletionSource(
  context: CompletionContext
): CompletionResult | null {
  const { state, pos } = context;
  const doc = state.doc.toString();

  // Only provide value completions when cursor is after a colon
  if (!isInValuePosition(doc, pos)) {
    return null; // Let the default source handle property name completions
  }

  const propertyName = findPropertyName(doc, pos);
  if (!propertyName) {
    return null;
  }

  // Find the start of the value being typed
  let valueStart = pos;
  while (valueStart > 0) {
    const ch = doc[valueStart - 1];
    if (ch === ":" || ch === "\n") {
      break;
    }
    valueStart--;
  }
  // Skip whitespace after colon
  while (valueStart < pos && /\s/.test(doc[valueStart])) {
    valueStart++;
  }

  // Build completions
  const propertyValues = CSS_PROPERTY_VALUES[propertyName] || [];
  const allValues = [...propertyValues, ...GLOBAL_VALUES];

  const options: Completion[] = allValues.map((value) => ({
    label: value,
    type: "keyword",
  }));

  if (options.length === 0) {
    return null;
  }

  // Get the word being typed to filter
  const word = context.matchBefore(/[\w-]*/);
  const from = word ? word.from : pos;

  return {
    from,
    options,
    validFor: /^[\w-]*$/,
  };
}
