"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const cssToTailwind_1 = require("../cssToTailwind");
const tailwindToCss_1 = require("../tailwindToCss");
(0, vitest_1.describe)("convertCssToTailwind", () => {
    (0, vitest_1.describe)("tagged round-trip (unchanged lines)", () => {
        (0, vitest_1.it)("preserves original classes when CSS is unchanged", () => {
            const original = "fixed inset-0 z-50 flex items-center justify-center bg-black/40";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            const result = (0, cssToTailwind_1.convertCssToTailwind)(css);
            (0, vitest_1.expect)(result.success).toBe(true);
            // All original classes preserved exactly
            (0, vitest_1.expect)(result.classes).toBe(original);
        });
        (0, vitest_1.it)("preserves gradient + color stops unchanged", () => {
            const original = "bg-linear-to-t from-white via-white/80 to-transparent px-6 pb-6 pt-10";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            const result = (0, cssToTailwind_1.convertCssToTailwind)(css);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toBe(original);
        });
        (0, vitest_1.it)("preserves variant prefixed classes", () => {
            const original = "lg:hidden hover:underline dark:text-white";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            const result = (0, cssToTailwind_1.convertCssToTailwind)(css);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toBe(original);
        });
        (0, vitest_1.it)("preserves stacked variant classes", () => {
            const original = "dark:hover:text-white lg:hover:bg-blue-500";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            const result = (0, cssToTailwind_1.convertCssToTailwind)(css);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toBe(original);
        });
        (0, vitest_1.it)("preserves complex class list unchanged", () => {
            const original = "flex flex-col gap-4 p-4 rounded-lg shadow-md bg-white text-sm font-medium";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            const result = (0, cssToTailwind_1.convertCssToTailwind)(css);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toBe(original);
        });
    });
    (0, vitest_1.describe)("tagged round-trip (modified lines)", () => {
        (0, vitest_1.it)("only re-converts changed lines, keeps unchanged", () => {
            const original = "flex items-center p-4";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            // Change p-4 (padding: 1rem) to padding: 2rem (p-8)
            const modified = css.replace("padding: 1rem;", "padding: 2rem;");
            const result = (0, cssToTailwind_1.convertCssToTailwind)(modified);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("flex");
            (0, vitest_1.expect)(result.classes).toContain("items-center");
            (0, vitest_1.expect)(result.classes).toContain("p-8");
            (0, vitest_1.expect)(result.classes).not.toContain("p-4");
        });
        (0, vitest_1.it)("user modifies opacity: via-white/80 → via-white/20", () => {
            const original = "bg-linear-to-t from-white via-white/80 to-transparent px-6 pb-6 pt-10";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            // Change "80% opacity" to "20% opacity"
            const modified = css.replace("80% opacity", "20% opacity");
            const result = (0, cssToTailwind_1.convertCssToTailwind)(modified);
            (0, vitest_1.expect)(result.success).toBe(true);
            // Unchanged classes preserved
            (0, vitest_1.expect)(result.classes).toContain("bg-linear-to-t");
            (0, vitest_1.expect)(result.classes).toContain("from-white");
            (0, vitest_1.expect)(result.classes).toContain("to-transparent");
            (0, vitest_1.expect)(result.classes).toContain("px-6");
            (0, vitest_1.expect)(result.classes).toContain("pb-6");
            (0, vitest_1.expect)(result.classes).toContain("pt-10");
            // Opacity updated correctly
            (0, vitest_1.expect)(result.classes).toContain("via-white/20");
            (0, vitest_1.expect)(result.classes).not.toContain("via-white/80");
            // No bogus arbitrary values
            (0, vitest_1.expect)(result.classes).not.toContain("[background-image");
            (0, vitest_1.expect)(result.classes).not.toContain("bg-[");
            (0, vitest_1.expect)(result.classes).not.toContain("pl-6");
            (0, vitest_1.expect)(result.classes).not.toContain("pr-6");
        });
        (0, vitest_1.it)("deleted line removes the class", () => {
            const original = "flex items-center p-4";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            // Remove the padding line
            const modified = css
                .split("\n")
                .filter((l) => !l.includes("padding"))
                .join("\n");
            const result = (0, cssToTailwind_1.convertCssToTailwind)(modified);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("flex");
            (0, vitest_1.expect)(result.classes).toContain("items-center");
            (0, vitest_1.expect)(result.classes).not.toContain("p-4");
        });
        (0, vitest_1.it)("no duplicate arbitrary when translator produces arbitrary class", () => {
            const original = "rounded-full bg-black";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            // User changes border-radius from 50% to 30%
            const modified = css.replace("border-radius: 50%;", "border-radius: 30%;");
            const result = (0, cssToTailwind_1.convertCssToTailwind)(modified);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("bg-black");
            // Should not have duplicate border-radius entries
            const brClasses = result.classes.split(" ").filter((c) => c.includes("border-radius") || c.includes("rounded"));
            (0, vitest_1.expect)(brClasses.length).toBe(1);
        });
    });
    (0, vitest_1.describe)("untagged CSS (user adds new lines)", () => {
        (0, vitest_1.it)("converts new plain CSS", () => {
            const result = (0, cssToTailwind_1.convertCssToTailwind)("display: flex;");
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("flex");
        });
        (0, vitest_1.it)("converts position: fixed", () => {
            const result = (0, cssToTailwind_1.convertCssToTailwind)("position: fixed;");
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("fixed");
        });
        (0, vitest_1.it)("handles empty input", () => {
            const result = (0, cssToTailwind_1.convertCssToTailwind)("");
            (0, vitest_1.expect)(result.success).toBe(false);
        });
        (0, vitest_1.it)("user adds a new line to existing tagged CSS", () => {
            const original = "flex items-center";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            // User adds a new untagged line
            const modified = css + "\npadding: 1rem;";
            const result = (0, cssToTailwind_1.convertCssToTailwind)(modified);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("flex");
            (0, vitest_1.expect)(result.classes).toContain("items-center");
            // New line should be converted
            (0, vitest_1.expect)(result.classes).toContain("p-4");
        });
    });
    (0, vitest_1.describe)("real CSS variant blocks", () => {
        (0, vitest_1.it)("responsive variant in tagged CSS round-trips", () => {
            const original = "flex lg:hidden";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            const result = (0, cssToTailwind_1.convertCssToTailwind)(css);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toBe(original);
        });
        (0, vitest_1.it)("output format uses real CSS blocks for variants", () => {
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)("lg:hidden");
            // Should be real CSS, not a comment
            (0, vitest_1.expect)(css).toContain("@media (min-width: 1024px)");
            (0, vitest_1.expect)(css).toContain("{");
            (0, vitest_1.expect)(css).toContain("display: none;");
            (0, vitest_1.expect)(css).toContain("}");
            // Should NOT have comment-wrapped variant
            (0, vitest_1.expect)(css).not.toMatch(/\/\*\s*@media/);
        });
        (0, vitest_1.it)("stacked variant output uses nested CSS blocks", () => {
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)("dark:hover:text-white");
            (0, vitest_1.expect)(css).toContain("@media (prefers-color-scheme: dark)");
            (0, vitest_1.expect)(css).toContain("&:hover");
            (0, vitest_1.expect)(css).toContain("{");
        });
        (0, vitest_1.it)("editing variant breakpoint changes the class", () => {
            const original = "fixed inset-x-0 bottom-0 z-20 lg:hidden";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            // User changes 1024px to 2024px
            const modified = css.replace("1024px", "2024px");
            const result = (0, cssToTailwind_1.convertCssToTailwind)(modified);
            (0, vitest_1.expect)(result.success).toBe(true);
            // Variant should change to arbitrary breakpoint
            (0, vitest_1.expect)(result.classes).toContain("min-[2024px]:hidden");
            (0, vitest_1.expect)(result.classes).not.toContain("lg:hidden");
            // Other classes unchanged
            (0, vitest_1.expect)(result.classes).toContain("fixed");
            (0, vitest_1.expect)(result.classes).toContain("inset-x-0");
            (0, vitest_1.expect)(result.classes).toContain("bottom-0");
            (0, vitest_1.expect)(result.classes).toContain("z-20");
        });
        (0, vitest_1.it)("editing variant to another known breakpoint", () => {
            const original = "lg:hidden";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            // User changes 1024px to 768px (md breakpoint)
            const modified = css.replace("1024px", "768px");
            const result = (0, cssToTailwind_1.convertCssToTailwind)(modified);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("md:hidden");
        });
        (0, vitest_1.it)("mixed variant + non-variant lines", () => {
            const css = [
                "position: fixed;",
                "left: 0px;",
                "z-index: 20;",
                "@media (min-width: 1024px) { display: none; }",
            ].join("\n");
            const result = (0, cssToTailwind_1.convertCssToTailwind)(css);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("fixed");
            (0, vitest_1.expect)(result.classes).toContain("lg:hidden");
        });
        (0, vitest_1.it)("user adds new variant block as untagged CSS", () => {
            const original = "flex";
            const css = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(original);
            const modified = css + "\n@media (min-width: 1024px) { display: none; }";
            const result = (0, cssToTailwind_1.convertCssToTailwind)(modified);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("flex");
            (0, vitest_1.expect)(result.classes).toContain("lg:hidden");
        });
    });
    (0, vitest_1.describe)("comment stripping safety", () => {
        (0, vitest_1.it)("does not parse properties inside comments", () => {
            const css = "/* min-width: 100px */ display: flex;";
            const result = (0, cssToTailwind_1.convertCssToTailwind)(css);
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.classes).toContain("flex");
            (0, vitest_1.expect)(result.classes).not.toContain("[min-width");
        });
    });
});
//# sourceMappingURL=cssToTailwind.test.js.map