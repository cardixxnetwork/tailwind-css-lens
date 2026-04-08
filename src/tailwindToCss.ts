/**
 * Reverse mapping: Tailwind utility classes → approximate CSS.
 * Used by the "View as CSS" CodeLens action.
 * Supports Tailwind v3 + v4 utilities and variant prefixes.
 */

// =====================================================================
// VARIANT SYSTEM
// =====================================================================

export const VARIANT_MAP: Record<string, string> = {
  // Responsive
  sm: "@media (min-width: 640px)",
  md: "@media (min-width: 768px)",
  lg: "@media (min-width: 1024px)",
  xl: "@media (min-width: 1280px)",
  "2xl": "@media (min-width: 1536px)",

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
  "group-hover": ".group:hover &",
  "group-focus": ".group:focus &",
  "peer-hover": ".peer:hover ~ &",
  "peer-focus": ".peer:focus ~ &",

  // v4 variants
  has: "&:has(...)",
  not: "&:not(...)",
  inert: "&[inert]",
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
 * Returns the variant prefix string and the base class.
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

/**
 * Wrap CSS declarations in nested variant blocks.
 * e.g. ["@media (min-width: 1024px)", "&:hover"] + "color: #fff"
 * → "@media (min-width: 1024px) { &:hover { color: #fff; } }"
 */
function wrapWithVariants(variantRules: string[], declarations: string): string {
  if (variantRules.length === 0) return declarations;
  let result = declarations;
  // Wrap from innermost to outermost
  for (let i = variantRules.length - 1; i >= 0; i--) {
    result = `${variantRules[i]} { ${result} }`;
  }
  return result;
}

// =====================================================================
// STATIC MAP
// =====================================================================

export const STATIC_MAP: Record<string, string> = {
  // Display
  flex: "display: flex",
  "inline-flex": "display: inline-flex",
  grid: "display: grid",
  "inline-grid": "display: inline-grid",
  block: "display: block",
  "inline-block": "display: inline-block",
  inline: "display: inline",
  hidden: "display: none",
  contents: "display: contents",
  table: "display: table",
  "table-row": "display: table-row",
  "table-cell": "display: table-cell",
  "flow-root": "display: flow-root",

  // Position
  static: "position: static",
  fixed: "position: fixed",
  absolute: "position: absolute",
  relative: "position: relative",
  sticky: "position: sticky",

  // Flex direction
  "flex-row": "flex-direction: row",
  "flex-col": "flex-direction: column",
  "flex-row-reverse": "flex-direction: row-reverse",
  "flex-col-reverse": "flex-direction: column-reverse",
  "flex-wrap": "flex-wrap: wrap",
  "flex-nowrap": "flex-wrap: nowrap",
  "flex-wrap-reverse": "flex-wrap: wrap-reverse",
  "flex-1": "flex: 1 1 0%",
  "flex-auto": "flex: 1 1 auto",
  "flex-initial": "flex: 0 1 auto",
  "flex-none": "flex: none",
  grow: "flex-grow: 1",
  "grow-0": "flex-grow: 0",
  shrink: "flex-shrink: 1",
  "shrink-0": "flex-shrink: 0",

  // Align / Justify
  "items-start": "align-items: flex-start",
  "items-end": "align-items: flex-end",
  "items-center": "align-items: center",
  "items-baseline": "align-items: baseline",
  "items-stretch": "align-items: stretch",
  "justify-start": "justify-content: flex-start",
  "justify-end": "justify-content: flex-end",
  "justify-center": "justify-content: center",
  "justify-between": "justify-content: space-between",
  "justify-around": "justify-content: space-around",
  "justify-evenly": "justify-content: space-evenly",
  "justify-items-start": "justify-items: start",
  "justify-items-end": "justify-items: end",
  "justify-items-center": "justify-items: center",
  "justify-items-stretch": "justify-items: stretch",
  "justify-self-auto": "justify-self: auto",
  "justify-self-start": "justify-self: start",
  "justify-self-end": "justify-self: end",
  "justify-self-center": "justify-self: center",
  "justify-self-stretch": "justify-self: stretch",
  "self-auto": "align-self: auto",
  "self-start": "align-self: flex-start",
  "self-end": "align-self: flex-end",
  "self-center": "align-self: center",
  "self-stretch": "align-self: stretch",
  "content-start": "align-content: flex-start",
  "content-end": "align-content: flex-end",
  "content-center": "align-content: center",
  "content-between": "align-content: space-between",
  "content-around": "align-content: space-around",
  "content-evenly": "align-content: space-evenly",

  // Sizing
  "w-full": "width: 100%",
  "w-screen": "width: 100vw",
  "w-auto": "width: auto",
  "w-min": "width: min-content",
  "w-max": "width: max-content",
  "w-fit": "width: fit-content",
  "h-full": "height: 100%",
  "h-screen": "height: 100vh",
  "h-auto": "height: auto",
  "h-min": "height: min-content",
  "h-max": "height: max-content",
  "h-fit": "height: fit-content",
  "min-w-0": "min-width: 0px",
  "min-w-full": "min-width: 100%",
  "min-h-0": "min-height: 0px",
  "min-h-full": "min-height: 100%",
  "min-h-screen": "min-height: 100vh",
  "max-w-none": "max-width: none",
  "max-w-full": "max-width: 100%",
  "max-h-full": "max-height: 100%",
  "max-h-screen": "max-height: 100vh",

  // Overflow
  "overflow-auto": "overflow: auto",
  "overflow-hidden": "overflow: hidden",
  "overflow-visible": "overflow: visible",
  "overflow-scroll": "overflow: scroll",
  "overflow-clip": "overflow: clip",
  "overflow-x-auto": "overflow-x: auto",
  "overflow-x-hidden": "overflow-x: hidden",
  "overflow-x-clip": "overflow-x: clip",
  "overflow-y-auto": "overflow-y: auto",
  "overflow-y-hidden": "overflow-y: hidden",
  "overflow-y-clip": "overflow-y: clip",

  // Text alignment & sizes
  "text-left": "text-align: left",
  "text-center": "text-align: center",
  "text-right": "text-align: right",
  "text-justify": "text-align: justify",
  "text-start": "text-align: start",
  "text-end": "text-align: end",
  "text-xs": "font-size: 0.75rem; line-height: 1rem",
  "text-sm": "font-size: 0.875rem; line-height: 1.25rem",
  "text-base": "font-size: 1rem; line-height: 1.5rem",
  "text-lg": "font-size: 1.125rem; line-height: 1.75rem",
  "text-xl": "font-size: 1.25rem; line-height: 1.75rem",
  "text-2xl": "font-size: 1.5rem; line-height: 2rem",
  "text-3xl": "font-size: 1.875rem; line-height: 2.25rem",
  "text-4xl": "font-size: 2.25rem; line-height: 2.5rem",
  "text-5xl": "font-size: 3rem; line-height: 1",
  "text-6xl": "font-size: 3.75rem; line-height: 1",
  "text-7xl": "font-size: 4.5rem; line-height: 1",
  "text-8xl": "font-size: 6rem; line-height: 1",
  "text-9xl": "font-size: 8rem; line-height: 1",

  // v4 text-wrap
  "text-balance": "text-wrap: balance",
  "text-pretty": "text-wrap: pretty",
  "text-nowrap": "text-wrap: nowrap",
  "text-wrap": "text-wrap: wrap",

  // Text overflow
  "text-ellipsis": "text-overflow: ellipsis",
  "text-clip": "text-overflow: clip",

  // Word break / overflow-wrap
  "break-words": "overflow-wrap: break-word",
  "break-all": "word-break: break-all",
  "break-normal": "overflow-wrap: normal; word-break: normal",
  "break-keep": "word-break: keep-all",

  // Font weight
  "font-thin": "font-weight: 100",
  "font-extralight": "font-weight: 200",
  "font-light": "font-weight: 300",
  "font-normal": "font-weight: 400",
  "font-medium": "font-weight: 500",
  "font-semibold": "font-weight: 600",
  "font-bold": "font-weight: 700",
  "font-extrabold": "font-weight: 800",
  "font-black": "font-weight: 900",

  // Text decoration
  underline: "text-decoration-line: underline",
  "line-through": "text-decoration-line: line-through",
  "no-underline": "text-decoration-line: none",
  overline: "text-decoration-line: overline",

  // Text transform
  uppercase: "text-transform: uppercase",
  lowercase: "text-transform: lowercase",
  capitalize: "text-transform: capitalize",
  "normal-case": "text-transform: none",

  // Font style
  italic: "font-style: italic",
  "not-italic": "font-style: normal",

  // Whitespace
  "whitespace-normal": "white-space: normal",
  "whitespace-nowrap": "white-space: nowrap",
  "whitespace-pre": "white-space: pre",
  "whitespace-pre-line": "white-space: pre-line",
  "whitespace-pre-wrap": "white-space: pre-wrap",
  "whitespace-break-spaces": "white-space: break-spaces",
  truncate: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap",

  // Border style
  "border-solid": "border-style: solid",
  "border-dashed": "border-style: dashed",
  "border-dotted": "border-style: dotted",
  "border-double": "border-style: double",
  "border-none": "border-style: none",
  "border-hidden": "border-style: hidden",

  // Shadow
  shadow: "box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  "shadow-xs": "box-shadow: 0 1px rgb(0 0 0 / 0.05)",
  "shadow-sm": "box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)",
  "shadow-md": "box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  "shadow-lg": "box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  "shadow-xl": "box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "shadow-2xl": "box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)",
  "shadow-none": "box-shadow: 0 0 #0000",
  "shadow-inner": "box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",

  // Rounded
  "rounded-none": "border-radius: 0px",
  "rounded-sm": "border-radius: 0.125rem",
  rounded: "border-radius: 0.25rem",
  "rounded-md": "border-radius: 0.375rem",
  "rounded-lg": "border-radius: 0.5rem",
  "rounded-xl": "border-radius: 0.75rem",
  "rounded-2xl": "border-radius: 1rem",
  "rounded-3xl": "border-radius: 1.5rem",
  "rounded-full": "border-radius: 50%",

  // Cursor
  "cursor-pointer": "cursor: pointer",
  "cursor-default": "cursor: default",
  "cursor-wait": "cursor: wait",
  "cursor-text": "cursor: text",
  "cursor-move": "cursor: move",
  "cursor-not-allowed": "cursor: not-allowed",
  "cursor-grab": "cursor: grab",
  "cursor-grabbing": "cursor: grabbing",
  "cursor-help": "cursor: help",
  "cursor-crosshair": "cursor: crosshair",
  "cursor-none": "cursor: none",
  "cursor-auto": "cursor: auto",

  // Visibility
  visible: "visibility: visible",
  invisible: "visibility: hidden",
  collapse: "visibility: collapse",

  // Pointer events
  "pointer-events-none": "pointer-events: none",
  "pointer-events-auto": "pointer-events: auto",

  // User select
  "select-none": "user-select: none",
  "select-text": "user-select: text",
  "select-all": "user-select: all",
  "select-auto": "user-select: auto",

  // Object fit
  "object-contain": "object-fit: contain",
  "object-cover": "object-fit: cover",
  "object-fill": "object-fit: fill",
  "object-none": "object-fit: none",
  "object-scale-down": "object-fit: scale-down",

  // Aspect ratio
  "aspect-auto": "aspect-ratio: auto",
  "aspect-square": "aspect-ratio: 1 / 1",
  "aspect-video": "aspect-ratio: 16 / 9",

  // Transition
  "transition-all": "transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms",
  transition: "transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms",
  "transition-none": "transition-property: none",
  "transition-colors": "transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms",
  "transition-opacity": "transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms",
  "transition-shadow": "transition-property: box-shadow; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms",
  "transition-transform": "transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms",

  // Ease
  "ease-linear": "transition-timing-function: linear",
  "ease-in": "transition-timing-function: cubic-bezier(0.4, 0, 1, 1)",
  "ease-out": "transition-timing-function: cubic-bezier(0, 0, 0.2, 1)",
  "ease-in-out": "transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)",

  // SR-only
  "sr-only": "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0",
  "not-sr-only": "position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal",

  // List style
  "list-none": "list-style-type: none",
  "list-disc": "list-style-type: disc",
  "list-decimal": "list-style-type: decimal",
  "list-inside": "list-style-position: inside",
  "list-outside": "list-style-position: outside",

  // Outline
  outline: "outline-style: solid",
  "outline-none": "outline: 2px solid transparent; outline-offset: 2px",
  "outline-dashed": "outline-style: dashed",
  "outline-dotted": "outline-style: dotted",
  "outline-double": "outline-style: double",

  // Will change
  "will-change-auto": "will-change: auto",
  "will-change-scroll": "will-change: scroll-position",
  "will-change-contents": "will-change: contents",
  "will-change-transform": "will-change: transform",

  // Touch action
  "touch-auto": "touch-action: auto",
  "touch-none": "touch-action: none",
  "touch-pan-x": "touch-action: pan-x",
  "touch-pan-y": "touch-action: pan-y",
  "touch-pan-left": "touch-action: pan-left",
  "touch-pan-right": "touch-action: pan-right",
  "touch-pan-up": "touch-action: pan-up",
  "touch-pan-down": "touch-action: pan-down",
  "touch-manipulation": "touch-action: manipulation",
  "touch-pinch-zoom": "touch-action: pinch-zoom",

  // Appearance
  "appearance-none": "appearance: none",
  "appearance-auto": "appearance: auto",

  // Vertical align
  "align-baseline": "vertical-align: baseline",
  "align-top": "vertical-align: top",
  "align-middle": "vertical-align: middle",
  "align-bottom": "vertical-align: bottom",
  "align-text-top": "vertical-align: text-top",
  "align-text-bottom": "vertical-align: text-bottom",
  "align-sub": "vertical-align: sub",
  "align-super": "vertical-align: super",

  // Scroll snap
  "snap-start": "scroll-snap-align: start",
  "snap-end": "scroll-snap-align: end",
  "snap-center": "scroll-snap-align: center",
  "snap-align-none": "scroll-snap-align: none",
  "snap-none": "scroll-snap-type: none",
  "snap-x": "scroll-snap-type: x var(--tw-scroll-snap-strictness)",
  "snap-y": "scroll-snap-type: y var(--tw-scroll-snap-strictness)",
  "snap-both": "scroll-snap-type: both var(--tw-scroll-snap-strictness)",
  "snap-mandatory": "--tw-scroll-snap-strictness: mandatory",
  "snap-proximity": "--tw-scroll-snap-strictness: proximity",
  "snap-normal": "scroll-snap-stop: normal",
  "snap-always": "scroll-snap-stop: always",

  // Scroll behavior
  "scroll-auto": "scroll-behavior: auto",
  "scroll-smooth": "scroll-behavior: smooth",

  // Background attachment / size / position / repeat
  "bg-fixed": "background-attachment: fixed",
  "bg-local": "background-attachment: local",
  "bg-scroll": "background-attachment: scroll",
  "bg-cover": "background-size: cover",
  "bg-contain": "background-size: contain",
  "bg-auto": "background-size: auto",
  "bg-center": "background-position: center",
  "bg-top": "background-position: top",
  "bg-bottom": "background-position: bottom",
  "bg-left": "background-position: left",
  "bg-right": "background-position: right",
  "bg-left-top": "background-position: left top",
  "bg-left-bottom": "background-position: left bottom",
  "bg-right-top": "background-position: right top",
  "bg-right-bottom": "background-position: right bottom",
  "bg-no-repeat": "background-repeat: no-repeat",
  "bg-repeat": "background-repeat: repeat",
  "bg-repeat-x": "background-repeat: repeat-x",
  "bg-repeat-y": "background-repeat: repeat-y",
  "bg-repeat-round": "background-repeat: round",
  "bg-repeat-space": "background-repeat: space",
  "bg-clip-border": "background-clip: border-box",
  "bg-clip-padding": "background-clip: padding-box",
  "bg-clip-content": "background-clip: content-box",
  "bg-clip-text": "background-clip: text",
  "bg-origin-border": "background-origin: border-box",
  "bg-origin-padding": "background-origin: padding-box",
  "bg-origin-content": "background-origin: content-box",

  // Gradients (v3 + v4)
  "bg-gradient-to-t": "background-image: linear-gradient(to top, var(--tw-gradient-stops))",
  "bg-gradient-to-b": "background-image: linear-gradient(to bottom, var(--tw-gradient-stops))",
  "bg-gradient-to-l": "background-image: linear-gradient(to left, var(--tw-gradient-stops))",
  "bg-gradient-to-r": "background-image: linear-gradient(to right, var(--tw-gradient-stops))",
  "bg-gradient-to-tl": "background-image: linear-gradient(to top left, var(--tw-gradient-stops))",
  "bg-gradient-to-tr": "background-image: linear-gradient(to top right, var(--tw-gradient-stops))",
  "bg-gradient-to-bl": "background-image: linear-gradient(to bottom left, var(--tw-gradient-stops))",
  "bg-gradient-to-br": "background-image: linear-gradient(to bottom right, var(--tw-gradient-stops))",
  // v4 renames
  "bg-linear-to-t": "background-image: linear-gradient(to top, var(--tw-gradient-stops))",
  "bg-linear-to-b": "background-image: linear-gradient(to bottom, var(--tw-gradient-stops))",
  "bg-linear-to-l": "background-image: linear-gradient(to left, var(--tw-gradient-stops))",
  "bg-linear-to-r": "background-image: linear-gradient(to right, var(--tw-gradient-stops))",
  "bg-linear-to-tl": "background-image: linear-gradient(to top left, var(--tw-gradient-stops))",
  "bg-linear-to-tr": "background-image: linear-gradient(to top right, var(--tw-gradient-stops))",
  "bg-linear-to-bl": "background-image: linear-gradient(to bottom left, var(--tw-gradient-stops))",
  "bg-linear-to-br": "background-image: linear-gradient(to bottom right, var(--tw-gradient-stops))",
  "bg-radial": "background-image: radial-gradient(var(--tw-gradient-stops))",
  "bg-conic": "background-image: conic-gradient(var(--tw-gradient-stops))",
  "bg-none": "background-image: none",

  // Animation
  "animate-spin": "animation: spin 1s linear infinite",
  "animate-ping": "animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
  "animate-pulse": "animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  "animate-bounce": "animation: bounce 1s infinite",
  "animate-none": "animation: none",

  // Place utilities
  "place-content-center": "place-content: center",
  "place-content-start": "place-content: start",
  "place-content-end": "place-content: end",
  "place-content-between": "place-content: space-between",
  "place-content-around": "place-content: space-around",
  "place-content-evenly": "place-content: space-evenly",
  "place-content-stretch": "place-content: stretch",
  "place-content-baseline": "place-content: baseline",
  "place-items-center": "place-items: center",
  "place-items-start": "place-items: start",
  "place-items-end": "place-items: end",
  "place-items-stretch": "place-items: stretch",
  "place-items-baseline": "place-items: baseline",
  "place-self-auto": "place-self: auto",
  "place-self-center": "place-self: center",
  "place-self-start": "place-self: start",
  "place-self-end": "place-self: end",
  "place-self-stretch": "place-self: stretch",

  // Overscroll
  "overscroll-auto": "overscroll-behavior: auto",
  "overscroll-contain": "overscroll-behavior: contain",
  "overscroll-none": "overscroll-behavior: none",
  "overscroll-x-auto": "overscroll-behavior-x: auto",
  "overscroll-x-contain": "overscroll-behavior-x: contain",
  "overscroll-x-none": "overscroll-behavior-x: none",
  "overscroll-y-auto": "overscroll-behavior-y: auto",
  "overscroll-y-contain": "overscroll-behavior-y: contain",
  "overscroll-y-none": "overscroll-behavior-y: none",

  // Isolation
  isolate: "isolation: isolate",
  "isolation-auto": "isolation: auto",

  // Box decoration
  "box-decoration-clone": "box-decoration-break: clone",
  "box-decoration-slice": "box-decoration-break: slice",
  "box-border": "box-sizing: border-box",
  "box-content": "box-sizing: content-box",

  // Container
  container: "width: 100%",

  // Resize
  "resize-none": "resize: none",
  "resize-y": "resize: vertical",
  "resize-x": "resize: horizontal",
  resize: "resize: both",

  // Float / clear
  "float-right": "float: right",
  "float-left": "float: left",
  "float-none": "float: none",
  "clear-left": "clear: left",
  "clear-right": "clear: right",
  "clear-both": "clear: both",
  "clear-none": "clear: none",

  // Ring
  ring: "box-shadow: 0 0 0 3px var(--tw-ring-color)",
  "ring-inset": "--tw-ring-inset: inset",

  // Divide style
  "divide-solid": "border-style: solid /* > * + * */",
  "divide-dashed": "border-style: dashed /* > * + * */",
  "divide-dotted": "border-style: dotted /* > * + * */",
  "divide-double": "border-style: double /* > * + * */",
  "divide-none": "border-style: none /* > * + * */",

  // Filters
  "blur-none": "filter: blur(0)",
  blur: "filter: blur(8px)",
  "blur-sm": "filter: blur(4px)",
  "blur-md": "filter: blur(12px)",
  "blur-lg": "filter: blur(16px)",
  "blur-xl": "filter: blur(24px)",
  "blur-2xl": "filter: blur(40px)",
  "blur-3xl": "filter: blur(64px)",
  grayscale: "filter: grayscale(100%)",
  "grayscale-0": "filter: grayscale(0)",
  invert: "filter: invert(100%)",
  "invert-0": "filter: invert(0)",
  sepia: "filter: sepia(100%)",
  "sepia-0": "filter: sepia(0)",

  // Backdrop filters
  "backdrop-grayscale": "backdrop-filter: grayscale(100%)",
  "backdrop-grayscale-0": "backdrop-filter: grayscale(0)",
  "backdrop-invert": "backdrop-filter: invert(100%)",
  "backdrop-invert-0": "backdrop-filter: invert(0)",
  "backdrop-sepia": "backdrop-filter: sepia(100%)",
  "backdrop-sepia-0": "backdrop-filter: sepia(0)",

  // Drop shadow
  "drop-shadow-sm": "filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))",
  "drop-shadow": "filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))",
  "drop-shadow-md": "filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
  "drop-shadow-lg": "filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))",
  "drop-shadow-xl": "filter: drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08))",
  "drop-shadow-2xl": "filter: drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))",
  "drop-shadow-none": "filter: drop-shadow(0 0 0 #0000)",

  // Decoration style
  "decoration-solid": "text-decoration-style: solid",
  "decoration-dashed": "text-decoration-style: dashed",
  "decoration-dotted": "text-decoration-style: dotted",
  "decoration-double": "text-decoration-style: double",
  "decoration-wavy": "text-decoration-style: wavy",
  "decoration-auto": "text-decoration-thickness: auto",
  "decoration-from-font": "text-decoration-thickness: from-font",

  // v4 new utilities
  "field-sizing-content": "field-sizing: content",
  "field-sizing-fixed": "field-sizing: fixed",
  "grid-cols-subgrid": "grid-template-columns: subgrid",
  "grid-rows-subgrid": "grid-template-rows: subgrid",
  "transform-3d": "transform-style: preserve-3d",
  "transform-flat": "transform-style: flat",
  "transform-gpu": "transform: translate3d(0, 0, 0)",
  "transform-cpu": "transform: translateZ(0)",
  "backface-visible": "backface-visibility: visible",
  "backface-hidden": "backface-visibility: hidden",
  "forced-color-adjust-auto": "forced-color-adjust: auto",
  "forced-color-adjust-none": "forced-color-adjust: none",
  "perspective-none": "perspective: none",

  // Fill / stroke
  "fill-current": "fill: currentColor",
  "fill-none": "fill: none",
  "stroke-current": "stroke: currentColor",
  "stroke-none": "stroke: none",

  // Table
  "table-auto": "table-layout: auto",
  "table-fixed": "table-layout: fixed",
  "border-collapse": "border-collapse: collapse",
  "border-separate": "border-collapse: separate",

  // Hyphens
  "hyphens-none": "hyphens: none",
  "hyphens-manual": "hyphens: manual",
  "hyphens-auto": "hyphens: auto",

  // Accent
  "accent-auto": "accent-color: auto",

  // Color scheme
  "scheme-normal": "color-scheme: normal",
  "scheme-light": "color-scheme: light",
  "scheme-dark": "color-scheme: dark",
};

// =====================================================================
// MIX BLEND MODE — generated
// =====================================================================
const MIX_BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
  "exclusion", "hue", "saturation", "color", "luminosity",
];
for (const mode of MIX_BLEND_MODES) {
  STATIC_MAP[`mix-blend-${mode}`] = `mix-blend-mode: ${mode}`;
}

// =====================================================================
// SPACING MAP
// =====================================================================

export const SPACING_PREFIX_MAP: Record<string, string> = {
  p: "padding",
  px: "padding-left; padding-right",
  py: "padding-top; padding-bottom",
  pt: "padding-top",
  pr: "padding-right",
  pb: "padding-bottom",
  pl: "padding-left",
  m: "margin",
  mx: "margin-left; margin-right",
  my: "margin-top; margin-bottom",
  mt: "margin-top",
  mr: "margin-right",
  mb: "margin-bottom",
  ml: "margin-left",
  gap: "gap",
  "gap-x": "column-gap",
  "gap-y": "row-gap",
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  "inset-x": "left; right",
  "inset-y": "top; bottom",
  inset: "inset",
  "space-x": "margin-left /* between children */",
  "space-y": "margin-top /* between children */",
  // Scroll spacing
  "scroll-m": "scroll-margin",
  "scroll-mx": "scroll-margin-left; scroll-margin-right",
  "scroll-my": "scroll-margin-top; scroll-margin-bottom",
  "scroll-mt": "scroll-margin-top",
  "scroll-mr": "scroll-margin-right",
  "scroll-mb": "scroll-margin-bottom",
  "scroll-ml": "scroll-margin-left",
  "scroll-p": "scroll-padding",
  "scroll-px": "scroll-padding-left; scroll-padding-right",
  "scroll-py": "scroll-padding-top; scroll-padding-bottom",
  "scroll-pt": "scroll-padding-top",
  "scroll-pr": "scroll-padding-right",
  "scroll-pb": "scroll-padding-bottom",
  "scroll-pl": "scroll-padding-left",
};

export const SIZE_PREFIX_MAP: Record<string, string> = {
  w: "width",
  h: "height",
  "min-w": "min-width",
  "min-h": "min-height",
  "max-w": "max-width",
  "max-h": "max-height",
};

// =====================================================================
// COLOR MAP
// =====================================================================

export const COLOR_MAP: Record<string, string> = {
  inherit: "inherit",
  current: "currentColor",
  transparent: "transparent",
  black: "#000000",
  white: "#ffffff",
  slate: "#64748b",
  gray: "#6b7280",
  zinc: "#71717a",
  neutral: "#737373",
  stone: "#78716c",
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
};

/**
 * Color prefix → CSS property mapping for generic color resolver.
 */
export const COLOR_PREFIX_MAP: Record<string, string> = {
  text: "color",
  bg: "background-color",
  border: "border-color",
  ring: "--tw-ring-color",
  divide: "border-color /* > * + * */",
  accent: "accent-color",
  caret: "caret-color",
  decoration: "text-decoration-color",
  fill: "fill",
  stroke: "stroke",
  outline: "outline-color",
  shadow: "--tw-shadow-color",
  from: "--tw-gradient-from",
  via: "--tw-gradient-via",
  to: "--tw-gradient-to",
};

// =====================================================================
// HELPERS
// =====================================================================

function spacingToRem(value: string): string {
  if (value === "px") return "1px";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  if (num === 0) return "0px";
  return `${num * 0.25}rem`;
}

function sizeValueToCSS(value: string): string {
  if (value === "full") return "100%";
  if (value === "screen") return "100vw";
  if (value === "auto") return "auto";
  if (value === "min") return "min-content";
  if (value === "max") return "max-content";
  if (value === "fit") return "fit-content";
  if (value === "px") return "1px";
  const fractionMatch = value.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const pct = (parseInt(fractionMatch[1]) / parseInt(fractionMatch[2])) * 100;
    // Use up to 4 decimal places
    return `${parseFloat(pct.toFixed(4))}%`;
  }
  const num = parseFloat(value);
  if (!isNaN(num)) return num === 0 ? "0px" : `${num * 0.25}rem`;
  return value;
}

/**
 * Resolve a color class. Returns CSS string or null.
 * Handles: text-{color}[-{shade}][/{opacity}], bg-{color}[-{shade}][/{opacity}], etc.
 */
function resolveColorClass(cls: string): string | null {
  // Handle slash opacity first — strip it
  let opacity: string | null = null;
  let classWithoutOpacity = cls;
  const slashIdx = cls.lastIndexOf("/");
  if (slashIdx !== -1) {
    const opacityStr = cls.slice(slashIdx + 1);
    if (/^\d+$/.test(opacityStr)) {
      opacity = opacityStr;
      classWithoutOpacity = cls.slice(0, slashIdx);
    }
  }

  for (const [prefix, cssProp] of Object.entries(COLOR_PREFIX_MAP)) {
    const prefixDash = prefix + "-";
    if (!classWithoutOpacity.startsWith(prefixDash)) continue;

    const rest = classWithoutOpacity.slice(prefixDash.length);

    // Special single-word colors: transparent, current, inherit, white, black
    if (COLOR_MAP[rest] !== undefined) {
      const colorVal = COLOR_MAP[rest];
      if (opacity) {
        return `${cssProp}: ${colorVal} /* ${opacity}% opacity */`;
      }
      return `${cssProp}: ${colorVal}`;
    }

    // color-shade pattern: e.g., red-500
    const colorShadeMatch = rest.match(/^(\w+)-(\d+)$/);
    if (colorShadeMatch && COLOR_MAP[colorShadeMatch[1]]) {
      const colorName = colorShadeMatch[1];
      const shade = colorShadeMatch[2];
      if (opacity) {
        return `${cssProp}: ${colorName}-${shade} /* ${COLOR_MAP[colorName]} shade, ${opacity}% opacity */`;
      }
      return `${cssProp}: ${colorName}-${shade} /* ${COLOR_MAP[colorName]} shade */`;
    }
  }

  return null;
}

// =====================================================================
// RESOLVE BASE CLASS (no variants)
// =====================================================================

function resolveBaseClass(cls: string): string | null {
  // Check static map first
  if (STATIC_MAP[cls]) return STATIC_MAP[cls];

  // Handle negative prefix for lookup
  const isNegative = cls.startsWith("-");
  const absClass = isNegative ? cls.slice(1) : cls;

  // Arbitrary values: [property:value]
  const arbitraryMatch = cls.match(/^\[([^:]+):(.+)\]$/);
  if (arbitraryMatch) {
    return `${arbitraryMatch[1]}: ${arbitraryMatch[2].replace(/_/g, " ")}`;
  }

  // Opacity: opacity-{n}
  const opacityMatch = cls.match(/^opacity-(\d+)$/);
  if (opacityMatch) return `opacity: ${parseInt(opacityMatch[1]) / 100}`;

  // Z-index: z-{n}
  const zMatch = cls.match(/^z-(\d+|auto)$/);
  if (zMatch) return `z-index: ${zMatch[1]}`;

  // Duration: duration-{n}
  const durationMatch = cls.match(/^duration-(\d+)$/);
  if (durationMatch) return `transition-duration: ${durationMatch[1]}ms`;

  // Delay: delay-{n}
  const delayMatch = cls.match(/^delay-(\d+)$/);
  if (delayMatch) return `transition-delay: ${delayMatch[1]}ms`;

  // Border width: border, border-{n}
  if (cls === "border") return "border-width: 1px";
  const borderWidthMatch = cls.match(/^border-(\d+)$/);
  if (borderWidthMatch) return `border-width: ${borderWidthMatch[1]}px`;

  // Ring width: ring-{n}
  const ringMatch = cls.match(/^ring-(\d+)$/);
  if (ringMatch) return `box-shadow: 0 0 0 ${ringMatch[1]}px var(--tw-ring-color)`;

  // Ring offset: ring-offset-{n}
  const ringOffsetMatch = cls.match(/^ring-offset-(\d+)$/);
  if (ringOffsetMatch) return `--tw-ring-offset-width: ${ringOffsetMatch[1]}px`;

  // Outline width: outline-{n}
  const outlineWidthMatch = cls.match(/^outline-(\d+)$/);
  if (outlineWidthMatch) return `outline-width: ${outlineWidthMatch[1]}px`;

  // Outline offset: outline-offset-{n}
  const outlineOffsetMatch = cls.match(/^outline-offset-(\d+)$/);
  if (outlineOffsetMatch) return `outline-offset: ${outlineOffsetMatch[1]}px`;

  // Spacing utilities (including negative)
  // Sort by longest prefix first to match "scroll-mt" before "scroll-m"
  const sortedSpacingEntries = Object.entries(SPACING_PREFIX_MAP).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [prefix, cssProp] of sortedSpacingEntries) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const spacingRegex = new RegExp(`^-?${escaped}-(\\S+)$`);
    const spacingMatch = cls.match(spacingRegex);
    if (spacingMatch) {
      const val = spacingToRem(spacingMatch[1]);
      const cssVal = isNegative ? `-${val}` : val;
      if (cssProp.includes(";")) {
        return cssProp.split(";").map((p) => `${p.trim()}: ${cssVal}`).join("; ");
      }
      return `${cssProp}: ${cssVal}`;
    }
  }

  // Size utilities: w-{n}, h-{n}, min-w-{n}, etc.
  for (const [prefix, cssProp] of Object.entries(SIZE_PREFIX_MAP)) {
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sizeRegex = new RegExp(`^${escaped}-(.+)$`);
    const sizeMatch = cls.match(sizeRegex);
    if (sizeMatch) return `${cssProp}: ${sizeValueToCSS(sizeMatch[1])}`;
  }

  // Size utility (v4): size-{n} → width + height
  const sizeMatch = cls.match(/^size-(.+)$/);
  if (sizeMatch) {
    const val = sizeValueToCSS(sizeMatch[1]);
    return `width: ${val}; height: ${val}`;
  }

  // Basis: basis-{n}
  const basisMatch = cls.match(/^basis-(.+)$/);
  if (basisMatch) return `flex-basis: ${sizeValueToCSS(basisMatch[1])}`;

  // Color utilities (generic resolver)
  const colorResult = resolveColorClass(cls);
  if (colorResult) return colorResult;

  // Leading (line-height)
  const leadingMatch = cls.match(/^leading-(\d+|tight|snug|normal|relaxed|loose|none)$/);
  if (leadingMatch) {
    const lineHeightMap: Record<string, string> = {
      none: "1", tight: "1.25", snug: "1.375", normal: "1.5", relaxed: "1.625", loose: "2",
    };
    const val = lineHeightMap[leadingMatch[1]] || `${parseInt(leadingMatch[1]) * 0.25}rem`;
    return `line-height: ${val}`;
  }

  // Tracking (letter-spacing)
  const trackingMatch = cls.match(/^tracking-(tighter|tight|normal|wide|wider|widest)$/);
  if (trackingMatch) {
    const trackingMap: Record<string, string> = {
      tighter: "-0.05em", tight: "-0.025em", normal: "0em",
      wide: "0.025em", wider: "0.05em", widest: "0.1em",
    };
    return `letter-spacing: ${trackingMap[trackingMatch[1]]}`;
  }

  // Rotate: rotate-{deg} / -rotate-{deg}
  const rotateMatch = absClass.match(/^rotate-(\d+)$/);
  if (rotateMatch) {
    const neg = isNegative ? "-" : "";
    return `transform: rotate(${neg}${rotateMatch[1]}deg)`;
  }

  // 3D rotations: rotate-x-{deg}, rotate-y-{deg}, rotate-z-{deg}
  const rotate3dMatch = cls.match(/^rotate-([xyz])-(\d+)$/);
  if (rotate3dMatch) {
    const axis = rotate3dMatch[1].toUpperCase();
    return `transform: rotate${axis}(${rotate3dMatch[2]}deg)`;
  }

  // Scale: scale-{n}
  const scaleMatch = cls.match(/^scale-(\d+)$/);
  if (scaleMatch) return `transform: scale(${parseInt(scaleMatch[1]) / 100})`;

  // Scale axis: scale-x-{n}, scale-y-{n}
  const scaleAxisMatch = cls.match(/^scale-([xy])-(\d+)$/);
  if (scaleAxisMatch) {
    const fn = scaleAxisMatch[1] === "x" ? "scaleX" : "scaleY";
    return `transform: ${fn}(${parseInt(scaleAxisMatch[2]) / 100})`;
  }

  // Translate: translate-x-{n}, translate-y-{n}, -translate-x-{n}
  const translateMatch = absClass.match(/^translate-([xyz])-(.+)$/);
  if (translateMatch) {
    const axis = translateMatch[1].toUpperCase();
    const rawVal = translateMatch[2];
    let cssVal: string;
    if (rawVal === "full") cssVal = "100%";
    else if (rawVal === "px") cssVal = "1px";
    else if (rawVal.includes("/")) {
      const parts = rawVal.split("/");
      cssVal = `${(parseInt(parts[0]) / parseInt(parts[1])) * 100}%`;
    } else {
      cssVal = spacingToRem(rawVal);
    }
    const neg = isNegative ? "-" : "";
    return `transform: translate${axis}(${neg}${cssVal})`;
  }

  // Skew: skew-x-{n}, skew-y-{n}, -skew-x-{n}
  const skewMatch = absClass.match(/^skew-([xy])-(\d+)$/);
  if (skewMatch) {
    const fn = skewMatch[1] === "x" ? "skewX" : "skewY";
    const neg = isNegative ? "-" : "";
    return `transform: ${fn}(${neg}${skewMatch[2]}deg)`;
  }

  // Perspective: perspective-{n}
  const perspectiveMatch = cls.match(/^perspective-(\d+)$/);
  if (perspectiveMatch) return `perspective: ${perspectiveMatch[1]}px`;

  // Order: order-{n}
  const orderMatch = cls.match(/^order-(\d+|first|last|none)$/);
  if (orderMatch) {
    const orderMap: Record<string, string> = { first: "-9999", last: "9999", none: "0" };
    return `order: ${orderMap[orderMatch[1]] || orderMatch[1]}`;
  }

  // Grid cols: grid-cols-{n}
  const gridColsMatch = cls.match(/^grid-cols-(\d+|none)$/);
  if (gridColsMatch) {
    if (gridColsMatch[1] === "none") return "grid-template-columns: none";
    return `grid-template-columns: repeat(${gridColsMatch[1]}, minmax(0, 1fr))`;
  }

  // Grid rows: grid-rows-{n}
  const gridRowsMatch = cls.match(/^grid-rows-(\d+|none)$/);
  if (gridRowsMatch) {
    if (gridRowsMatch[1] === "none") return "grid-template-rows: none";
    return `grid-template-rows: repeat(${gridRowsMatch[1]}, minmax(0, 1fr))`;
  }

  // Col span: col-span-{n}
  const colSpanMatch = cls.match(/^col-span-(\d+|full)$/);
  if (colSpanMatch) {
    if (colSpanMatch[1] === "full") return "grid-column: 1 / -1";
    return `grid-column: span ${colSpanMatch[1]} / span ${colSpanMatch[1]}`;
  }

  // Row span: row-span-{n}
  const rowSpanMatch = cls.match(/^row-span-(\d+|full)$/);
  if (rowSpanMatch) {
    if (rowSpanMatch[1] === "full") return "grid-row: 1 / -1";
    return `grid-row: span ${rowSpanMatch[1]} / span ${rowSpanMatch[1]}`;
  }

  // Col start/end
  const colStartMatch = cls.match(/^col-start-(\d+|auto)$/);
  if (colStartMatch) return `grid-column-start: ${colStartMatch[1]}`;
  const colEndMatch = cls.match(/^col-end-(\d+|auto)$/);
  if (colEndMatch) return `grid-column-end: ${colEndMatch[1]}`;

  // Line clamp
  const lineClampMatch = cls.match(/^line-clamp-(\d+|none)$/);
  if (lineClampMatch) {
    if (lineClampMatch[1] === "none") {
      return "overflow: visible; display: block; -webkit-box-orient: horizontal; -webkit-line-clamp: unset";
    }
    return `overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: ${lineClampMatch[1]}`;
  }

  // Columns: columns-{n|auto}
  const columnsMatch = cls.match(/^columns-(\d+|auto)$/);
  if (columnsMatch) return `columns: ${columnsMatch[1]}`;

  // Indent: indent-{n}
  const indentMatch = absClass.match(/^indent-(.+)$/);
  if (indentMatch) {
    const val = spacingToRem(indentMatch[1]);
    const neg = isNegative ? "-" : "";
    return `text-indent: ${neg}${val}`;
  }

  // Underline offset
  const ulOffsetMatch = cls.match(/^underline-offset-(\w+)$/);
  if (ulOffsetMatch) {
    const v = ulOffsetMatch[1];
    return `text-underline-offset: ${v === "auto" ? "auto" : `${v}px`}`;
  }

  // Decoration thickness
  const decoThickMatch = cls.match(/^decoration-(\d+)$/);
  if (decoThickMatch) return `text-decoration-thickness: ${decoThickMatch[1]}px`;

  // Divide width
  const divideXMatch = cls.match(/^divide-x-(\d+)$/);
  if (divideXMatch) return `border-left-width: ${divideXMatch[1]}px /* > * + * */`;
  if (cls === "divide-x") return "border-left-width: 1px /* > * + * */";

  const divideYMatch = cls.match(/^divide-y-(\d+)$/);
  if (divideYMatch) return `border-top-width: ${divideYMatch[1]}px /* > * + * */`;
  if (cls === "divide-y") return "border-top-width: 1px /* > * + * */";

  // Filter utilities: brightness, contrast, saturate, hue-rotate
  const brightnessMatch = cls.match(/^brightness-(\d+)$/);
  if (brightnessMatch) return `filter: brightness(${parseInt(brightnessMatch[1]) / 100})`;

  const contrastMatch = cls.match(/^contrast-(\d+)$/);
  if (contrastMatch) return `filter: contrast(${parseInt(contrastMatch[1]) / 100})`;

  const saturateMatch = cls.match(/^saturate-(\d+)$/);
  if (saturateMatch) return `filter: saturate(${parseInt(saturateMatch[1]) / 100})`;

  const hueRotateMatch = cls.match(/^hue-rotate-(\d+)$/);
  if (hueRotateMatch) return `filter: hue-rotate(${hueRotateMatch[1]}deg)`;

  // Backdrop filter utilities
  const backdropBlurMap: Record<string, string> = {
    "backdrop-blur-none": "backdrop-filter: blur(0)",
    "backdrop-blur-sm": "backdrop-filter: blur(4px)",
    "backdrop-blur": "backdrop-filter: blur(8px)",
    "backdrop-blur-md": "backdrop-filter: blur(12px)",
    "backdrop-blur-lg": "backdrop-filter: blur(16px)",
    "backdrop-blur-xl": "backdrop-filter: blur(24px)",
    "backdrop-blur-2xl": "backdrop-filter: blur(40px)",
    "backdrop-blur-3xl": "backdrop-filter: blur(64px)",
  };
  if (backdropBlurMap[cls]) return backdropBlurMap[cls];

  const backdropBrightnessMatch = cls.match(/^backdrop-brightness-(\d+)$/);
  if (backdropBrightnessMatch) return `backdrop-filter: brightness(${parseInt(backdropBrightnessMatch[1]) / 100})`;

  const backdropContrastMatch = cls.match(/^backdrop-contrast-(\d+)$/);
  if (backdropContrastMatch) return `backdrop-filter: contrast(${parseInt(backdropContrastMatch[1]) / 100})`;

  const backdropSaturateMatch = cls.match(/^backdrop-saturate-(\d+)$/);
  if (backdropSaturateMatch) return `backdrop-filter: saturate(${parseInt(backdropSaturateMatch[1]) / 100})`;

  const backdropHueRotateMatch = cls.match(/^backdrop-hue-rotate-(\d+)$/);
  if (backdropHueRotateMatch) return `backdrop-filter: hue-rotate(${backdropHueRotateMatch[1]}deg)`;

  const backdropOpacityMatch = cls.match(/^backdrop-opacity-(\d+)$/);
  if (backdropOpacityMatch) return `backdrop-filter: opacity(${parseInt(backdropOpacityMatch[1]) / 100})`;

  // Stroke width: stroke-{n}
  const strokeWidthMatch = cls.match(/^stroke-(\d+)$/);
  if (strokeWidthMatch) return `stroke-width: ${strokeWidthMatch[1]}`;

  return null;
}

// =====================================================================
// MAIN EXPORTS
// =====================================================================

export function tailwindClassToCss(cls: string): string | null {
  // Strip variant prefixes
  const { variantRules, baseClass } = stripVariants(cls);

  const result = resolveBaseClass(baseClass);
  if (result === null) return null;

  if (variantRules.length === 0) return result;

  // Wrap declarations in real CSS variant blocks
  // Ensure declarations end with semicolons for valid CSS inside blocks
  const declarations = result
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => d + ";")
    .join(" ");

  return wrapWithVariants(variantRules, declarations);
}

export function tailwindClassesToCss(classString: string): string {
  const classes = classString.trim().split(/\s+/).filter(Boolean);
  if (classes.length === 0) return "/* No classes */";

  const lines: string[] = [".element {"];
  for (const cls of classes) {
    const css = tailwindClassToCss(cls);
    if (css) {
      lines.push(`  ${css}`);
    } else {
      lines.push(`  /* unknown: ${cls} */`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}

export function tailwindClassesToCssDeclarations(classString: string): string {
  const classes = classString.trim().split(/\s+/).filter(Boolean);
  if (classes.length === 0) return "";

  const lines: string[] = [];
  for (const cls of classes) {
    const { variantRules } = stripVariants(cls);
    const css = tailwindClassToCss(cls);
    if (css) {
      if (variantRules.length > 0) {
        // Variant classes: entire block on one line with tw tag
        lines.push(`${css} /* tw: ${cls} */`);
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
