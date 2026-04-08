"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCssToTailwind = convertCssToTailwind;
const css_to_tailwind_translator_1 = require("css-to-tailwind-translator");
const tailwindToCss_1 = require("./tailwindToCss");
/**
 * Reverse map: CSS rule string → Tailwind variant prefix.
 * e.g. "@media (min-width: 1024px)" → "lg:"
 */
const CSS_RULE_TO_VARIANT = {};
for (const [variant, cssRule] of Object.entries(tailwindToCss_1.VARIANT_MAP)) {
    CSS_RULE_TO_VARIANT[cssRule] = variant + ":";
}
/**
 * Convert a CSS rule wrapper to a Tailwind variant prefix.
 * First tries exact match against known variants, then falls back to arbitrary.
 */
function cssRuleToVariantPrefix(rule) {
    const normalized = rule.trim();
    // Exact match against known variants
    if (CSS_RULE_TO_VARIANT[normalized]) {
        return CSS_RULE_TO_VARIANT[normalized];
    }
    // Arbitrary min-width: @media (min-width: Xpx) → min-[Xpx]:
    const minWidth = normalized.match(/@media\s*\(\s*min-width:\s*(.+?)\s*\)/);
    if (minWidth)
        return `min-[${minWidth[1]}]:`;
    // Arbitrary max-width: @media (max-width: Xpx) → max-[Xpx]:
    const maxWidth = normalized.match(/@media\s*\(\s*max-width:\s*(.+?)\s*\)/);
    if (maxWidth)
        return `max-[${maxWidth[1]}]:`;
    // Pseudo-class/element selectors: &:hover → hover:, &::before → before:
    if (normalized.startsWith("&:")) {
        const pseudo = normalized.slice(1); // ":hover" or "::before"
        // Check if this matches a known variant by value
        for (const [variant, css] of Object.entries(tailwindToCss_1.VARIANT_MAP)) {
            if (css === normalized)
                return variant + ":";
        }
        // Arbitrary selector variant
        return `[${normalized}]:`;
    }
    // Arbitrary @media/container query
    if (normalized.startsWith("@media") || normalized.startsWith("@container")) {
        return `[${normalized}]:`;
    }
    // Fallback: arbitrary variant
    return `[${normalized}]:`;
}
/**
 * Parse nested CSS blocks to extract variant wrappers and inner declarations.
 * e.g. "@media (min-width: 1024px) { &:hover { color: #fff; } }"
 * → { wrappers: ["@media (min-width: 1024px)", "&:hover"], declarations: "color: #fff;" }
 */
function parseVariantBlock(css) {
    const trimmed = css.trim();
    // Match outermost block: "rule { content }"
    // Use brace counting for proper nesting
    const openBrace = trimmed.indexOf("{");
    if (openBrace === -1) {
        return { wrappers: [], declarations: trimmed };
    }
    // Find matching closing brace
    let depth = 0;
    let closeBrace = -1;
    for (let i = openBrace; i < trimmed.length; i++) {
        if (trimmed[i] === "{")
            depth++;
        else if (trimmed[i] === "}") {
            depth--;
            if (depth === 0) {
                closeBrace = i;
                break;
            }
        }
    }
    if (closeBrace === -1) {
        return { wrappers: [], declarations: trimmed };
    }
    const wrapper = trimmed.slice(0, openBrace).trim();
    const inner = trimmed.slice(openBrace + 1, closeBrace).trim();
    // Check if there's content after the closing brace (besides comments/whitespace)
    const afterBrace = trimmed.slice(closeBrace + 1).trim();
    if (afterBrace && !afterBrace.startsWith("/*")) {
        // There's more CSS after the block — treat the whole thing as plain CSS
        return { wrappers: [], declarations: trimmed };
    }
    // Recursively parse inner content
    const innerResult = parseVariantBlock(inner);
    return { wrappers: [wrapper, ...innerResult.wrappers], declarations: innerResult.declarations };
}
/**
 * Known Tailwind utility prefixes mapped to the CSS properties they represent.
 * Used to detect which input properties were successfully converted.
 */
const TAILWIND_PREFIX_TO_CSS_PROP = {
    flex: ["display"],
    grid: ["display"],
    block: ["display"],
    inline: ["display"],
    hidden: ["display"],
    table: ["display"],
    contents: ["display"],
    "flow-root": ["display"],
    "inline-block": ["display"],
    "inline-flex": ["display"],
    "inline-grid": ["display"],
    "items-": ["align-items"],
    "justify-": ["justify-content"],
    "self-": ["align-self"],
    "content-": ["align-content"],
    "gap-": ["gap"],
    "gap-x-": ["column-gap"],
    "gap-y-": ["row-gap"],
    "p-": ["padding"],
    "px-": ["padding-left", "padding-right"],
    "py-": ["padding-top", "padding-bottom"],
    "pt-": ["padding-top"],
    "pr-": ["padding-right"],
    "pb-": ["padding-bottom"],
    "pl-": ["padding-left"],
    "m-": ["margin"],
    "mx-": ["margin-left", "margin-right"],
    "my-": ["margin-top", "margin-bottom"],
    "mt-": ["margin-top"],
    "mr-": ["margin-right"],
    "mb-": ["margin-bottom"],
    "ml-": ["margin-left"],
    "w-": ["width"],
    "h-": ["height"],
    "min-w-": ["min-width"],
    "min-h-": ["min-height"],
    "max-w-": ["max-width"],
    "max-h-": ["max-height"],
    "text-": ["color", "font-size", "text-align", "text-decoration", "text-transform"],
    "font-": ["font-weight", "font-family", "font-style"],
    "leading-": ["line-height"],
    "tracking-": ["letter-spacing"],
    "bg-": ["background-color", "background", "background-image"],
    "border-": ["border", "border-width", "border-color", "border-style"],
    "rounded-": ["border-radius"],
    rounded: ["border-radius"],
    "shadow-": ["box-shadow"],
    shadow: ["box-shadow"],
    "opacity-": ["opacity"],
    "z-": ["z-index"],
    "top-": ["top"],
    "right-": ["right"],
    "bottom-": ["bottom"],
    "left-": ["left"],
    "inset-": ["inset", "top", "right", "bottom", "left"],
    absolute: ["position"],
    relative: ["position"],
    fixed: ["position"],
    sticky: ["position"],
    static: ["position"],
    "overflow-": ["overflow"],
    "cursor-": ["cursor"],
    "transition-": ["transition"],
    "duration-": ["transition-duration"],
    "ease-": ["transition-timing-function"],
    "delay-": ["transition-delay"],
    "rotate-": ["transform", "rotate"],
    "scale-": ["transform", "scale"],
    "translate-": ["transform", "translate"],
    "skew-": ["transform", "skew"],
    "object-": ["object-fit", "object-position"],
    "whitespace-": ["white-space"],
    "break-": ["word-break", "overflow-wrap"],
    truncate: ["overflow", "text-overflow", "white-space"],
    "list-": ["list-style-type", "list-style-position"],
    "decoration-": ["text-decoration"],
    underline: ["text-decoration"],
    "line-through": ["text-decoration"],
    "no-underline": ["text-decoration"],
    uppercase: ["text-transform"],
    lowercase: ["text-transform"],
    capitalize: ["text-transform"],
    "normal-case": ["text-transform"],
    italic: ["font-style"],
    "not-italic": ["font-style"],
    "flex-": ["flex", "flex-direction", "flex-wrap", "flex-grow", "flex-shrink"],
    "grow": ["flex-grow"],
    "shrink": ["flex-shrink"],
    "order-": ["order"],
    "grid-cols-": ["grid-template-columns"],
    "grid-rows-": ["grid-template-rows"],
    "col-span-": ["grid-column"],
    "row-span-": ["grid-row"],
    "auto-cols-": ["grid-auto-columns"],
    "auto-rows-": ["grid-auto-rows"],
    "place-": ["place-content", "place-items", "place-self"],
    "visible": ["visibility"],
    "invisible": ["visibility"],
    "outline-": ["outline"],
    "ring-": ["box-shadow"],
    "fill-": ["fill"],
    "stroke-": ["stroke"],
    "aspect-": ["aspect-ratio"],
    "columns-": ["columns"],
    "float-": ["float"],
    "clear-": ["clear"],
    "isolate": ["isolation"],
    "pointer-events-": ["pointer-events"],
    "resize": ["resize"],
    "select-": ["user-select"],
    "snap-": ["scroll-snap-type", "scroll-snap-align"],
    "touch-": ["touch-action"],
    "will-change-": ["will-change"],
};
function stripCssComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, "");
}
function parseCssDeclarations(css) {
    const cleaned = stripCssComments(css);
    const declarations = [];
    const regex = /([a-z-]+)\s*:\s*([^;}]+)/gi;
    let match;
    while ((match = regex.exec(cleaned)) !== null) {
        const prop = match[1].trim().toLowerCase();
        const val = match[2].trim();
        if (prop && val) {
            declarations.push({ property: prop, value: val });
        }
    }
    return declarations;
}
function getConvertedCssProperties(tailwindClasses) {
    const covered = new Set();
    for (const cls of tailwindClasses) {
        if (cls.startsWith("[")) {
            continue;
        }
        for (const [prefix, props] of Object.entries(TAILWIND_PREFIX_TO_CSS_PROP)) {
            if (prefix.endsWith("-") ? cls.startsWith(prefix) : cls === prefix) {
                for (const p of props) {
                    covered.add(p);
                }
            }
        }
    }
    return covered;
}
// =====================================================================
// TAG-BASED APPROACH
// =====================================================================
/** Tag pattern: "/* tw: className *​/" or "/* tw+: className *​/" */
const TW_TAG_REGEX = /\/\*\s*tw[+]?\s*:\s*(.+?)\s*\*\/\s*$/;
/**
 * Parse a line from the CSS editor, extracting the tw tag and variant blocks.
 */
function parseTaggedLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("/* unknown:")) {
        return { cssText: trimmed, innerCss: trimmed, originalClass: null, isContinuation: false, variantWrappers: [] };
    }
    // Extract tw tag
    const tagMatch = trimmed.match(TW_TAG_REGEX);
    let originalClass = null;
    let isContinuation = false;
    let cssWithoutTag = trimmed;
    if (tagMatch) {
        originalClass = tagMatch[1].trim();
        isContinuation = trimmed.includes("/* tw+:");
        cssWithoutTag = trimmed.slice(0, trimmed.indexOf(tagMatch[0])).trim();
    }
    // Parse variant blocks from the CSS
    const { wrappers, declarations } = parseVariantBlock(cssWithoutTag);
    return {
        cssText: cssWithoutTag,
        innerCss: declarations,
        originalClass,
        isContinuation,
        variantWrappers: wrappers,
    };
}
/**
 * Normalize a full CSS string for comparison (preserves variant wrappers).
 * Normalizes whitespace and trailing semicolons.
 */
function normalizeCssForCompare(css) {
    return css
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, "; }")
        .replace(/;\s*$/, "")
        .trim()
        .toLowerCase();
}
/**
 * Normalize inner declarations only (strips variant wrappers) for comparison.
 */
function normalizeInnerCssForCompare(css) {
    const { declarations } = parseVariantBlock(css);
    return declarations
        .replace(/\s+/g, " ")
        .replace(/;\s*$/, "")
        .trim()
        .toLowerCase();
}
/**
 * If the original class had a /N opacity suffix and the user changed
 * the opacity comment, return the updated class. Otherwise return null.
 */
function tryUpdateOpacity(originalClass, currentCss, originalCss) {
    // Only applies if original class has /N suffix
    const opacityMatch = originalClass.match(/^(.+)\/(\d+)$/);
    if (!opacityMatch)
        return null;
    // Strip opacity comments from both and compare the rest
    const stripOpacity = (s) => s.replace(/\/\*\s*\d+%\s*opacity\s*\*\//, "").replace(/\s+/g, " ").replace(/;\s*$/, "").trim().toLowerCase();
    if (stripOpacity(currentCss) !== stripOpacity(originalCss)) {
        return null; // Something other than opacity changed
    }
    // Extract the new opacity from the current CSS
    const newOpacityMatch = currentCss.match(/\/\*\s*(\d+)%\s*opacity\s*\*\//);
    if (!newOpacityMatch) {
        // User removed the opacity comment → return class without /N
        return opacityMatch[1];
    }
    const newOpacity = newOpacityMatch[1];
    return `${opacityMatch[1]}/${newOpacity}`;
}
/**
 * Convert CSS declarations that aren't tagged (new lines added by user)
 * using the css-to-tailwind-translator library + arbitrary fallback.
 */
function convertNewCssToTailwind(cssText) {
    const cleaned = stripCssComments(cssText).trim();
    if (!cleaned)
        return [];
    const normalizedCss = `.dummy { ${cleaned} }`.replace(/([^;\s}])\s*}/g, "$1; }");
    const result = (0, css_to_tailwind_translator_1.CssToTailwindTranslator)(normalizedCss);
    const classes = [];
    if (result.code === "OK" && result.data && result.data.length > 0) {
        for (const item of result.data) {
            const rawVal = item.resultVal.trim();
            if (rawVal) {
                classes.push(...rawVal.split(/\s+/).filter(Boolean));
            }
        }
    }
    // Check for uncovered properties and create arbitrary fallbacks
    const inputDeclarations = parseCssDeclarations(normalizedCss);
    const coveredProps = getConvertedCssProperties(classes);
    for (const decl of inputDeclarations) {
        if (!coveredProps.has(decl.property)) {
            const arbitraryValue = decl.value.replace(/\s+/g, "_");
            classes.push(`[${decl.property}:${arbitraryValue}]`);
        }
    }
    return classes;
}
/**
 * Build a Tailwind variant prefix string from an array of CSS rule wrappers.
 * e.g. ["@media (min-width: 1024px)", "&:hover"] → "lg:hover:"
 */
function wrappersToVariantPrefix(wrappers) {
    if (wrappers.length === 0)
        return "";
    return wrappers.map(w => cssRuleToVariantPrefix(w)).join("");
}
function convertCssToTailwind(cssInput) {
    const trimmed = cssInput.trim();
    if (!trimmed) {
        return { success: false, classes: "", warnings: ["Empty input"] };
    }
    const lines = trimmed.split("\n");
    const allClasses = [];
    const warnings = [];
    const seenOriginalClasses = new Set();
    // Group tagged lines by their original class
    // (multi-declaration classes span multiple lines with tw+ tags)
    let i = 0;
    while (i < lines.length) {
        const parsed = parseTaggedLine(lines[i]);
        if (parsed.originalClass && !parsed.isContinuation) {
            // This is a tagged primary line. Collect any continuation lines.
            const originalClass = parsed.originalClass;
            const cssLines = [parsed.innerCss];
            let j = i + 1;
            while (j < lines.length) {
                const nextParsed = parseTaggedLine(lines[j]);
                if (nextParsed.isContinuation && nextParsed.originalClass === originalClass) {
                    cssLines.push(nextParsed.innerCss);
                    j++;
                }
                else {
                    break;
                }
            }
            // Get the original CSS for this class
            const originalCss = (0, tailwindToCss_1.tailwindClassToCss)(originalClass);
            // Combine all inner CSS lines for this class
            const currentInnerCombined = cssLines.join(" ").replace(/;\s*/g, "; ").trim();
            // For variant classes, the full CSS (with wrapper) is on the primary line
            // For non-variant multi-decl classes, we reconstruct from combined inner CSS
            const fullCurrentCss = parsed.variantWrappers.length > 0
                ? parsed.cssText
                : currentInnerCombined;
            const originalCombined = originalCss || "";
            // Compare the full CSS (including variant wrappers) against original
            if (originalCss &&
                normalizeCssForCompare(fullCurrentCss) ===
                    normalizeCssForCompare(originalCombined)) {
                // Unchanged — keep original class
                allClasses.push(originalClass);
            }
            else if (originalCss) {
                // Check if only the opacity comment changed (compare inner CSS only)
                const originalInner = parseVariantBlock(originalCombined).declarations;
                const opacityUpdated = tryUpdateOpacity(originalClass, currentInnerCombined, originalInner);
                if (opacityUpdated) {
                    allClasses.push(opacityUpdated);
                }
                else {
                    // Changed — convert the modified CSS
                    // Derive variant from the CURRENT CSS blocks (user may have changed it)
                    const variantPrefix = wrappersToVariantPrefix(parsed.variantWrappers);
                    const newClasses = convertNewCssToTailwind(currentInnerCombined);
                    if (newClasses.length > 0) {
                        for (const cls of newClasses) {
                            allClasses.push(variantPrefix ? variantPrefix + cls : cls);
                        }
                    }
                    else if (currentInnerCombined.replace(/;/g, "").trim()) {
                        // Non-empty but couldn't convert — use arbitrary
                        warnings.push(`Could not convert modified CSS for "${originalClass}"`);
                        const decls = parseCssDeclarations(`.d{${currentInnerCombined}}`);
                        for (const decl of decls) {
                            const arb = `[${decl.property}:${decl.value.replace(/\s+/g, "_")}]`;
                            allClasses.push(variantPrefix ? variantPrefix + arb : arb);
                        }
                    }
                    // else: line was blanked out — class removed
                }
            }
            else {
                // No original CSS to compare — re-convert
                const variantPrefix = wrappersToVariantPrefix(parsed.variantWrappers);
                const newClasses = convertNewCssToTailwind(currentInnerCombined);
                for (const cls of newClasses) {
                    allClasses.push(variantPrefix ? variantPrefix + cls : cls);
                }
            }
            seenOriginalClasses.add(originalClass);
            i = j;
        }
        else if (parsed.isContinuation) {
            // Orphaned continuation line — skip (its primary line was probably deleted)
            i++;
        }
        else {
            // Untagged line — user added new CSS
            const css = parsed.cssText;
            if (css && !css.startsWith("/* unknown:")) {
                const variantPrefix = wrappersToVariantPrefix(parsed.variantWrappers);
                const newClasses = convertNewCssToTailwind(parsed.innerCss);
                if (newClasses.length > 0) {
                    for (const cls of newClasses) {
                        allClasses.push(variantPrefix ? variantPrefix + cls : cls);
                    }
                }
                else {
                    const decls = parseCssDeclarations(`.d{${parsed.innerCss}}`);
                    for (const decl of decls) {
                        const arb = `[${decl.property}:${decl.value.replace(/\s+/g, "_")}]`;
                        allClasses.push(variantPrefix ? variantPrefix + arb : arb);
                        warnings.push(`"${decl.property}: ${decl.value}" → arbitrary value`);
                    }
                }
            }
            i++;
        }
    }
    if (allClasses.length === 0) {
        return {
            success: false,
            classes: "",
            warnings: ["No equivalent Tailwind classes found."],
        };
    }
    return {
        success: true,
        classes: allClasses.join(" "),
        warnings,
    };
}
//# sourceMappingURL=cssToTailwind.js.map