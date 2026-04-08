"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tailwindEngine_1 = require("../tailwindEngine");
const { extractThemeVars, resolveVars, resolveCalc, parseDeclarations, unescapeSelector } = tailwindEngine_1._testing;
(0, vitest_1.beforeEach)(() => {
    // Don't clear cache between tests — engine init is expensive
});
(0, vitest_1.describe)("tailwindEngine", () => {
    (0, vitest_1.describe)("resolveClass", () => {
        (0, vitest_1.it)("resolves display utilities", async () => {
            (0, vitest_1.expect)(await (0, tailwindEngine_1.resolveClass)("flex")).toBe("display: flex");
            (0, vitest_1.expect)(await (0, tailwindEngine_1.resolveClass)("hidden")).toBe("display: none");
            (0, vitest_1.expect)(await (0, tailwindEngine_1.resolveClass)("block")).toBe("display: block");
            (0, vitest_1.expect)(await (0, tailwindEngine_1.resolveClass)("inline")).toBe("display: inline");
            (0, vitest_1.expect)(await (0, tailwindEngine_1.resolveClass)("grid")).toBe("display: grid");
        });
        (0, vitest_1.it)("resolves spacing utilities", async () => {
            const p4 = await (0, tailwindEngine_1.resolveClass)("p-4");
            (0, vitest_1.expect)(p4).toContain("padding");
            (0, vitest_1.expect)(p4).toContain("1rem");
            const px6 = await (0, tailwindEngine_1.resolveClass)("px-6");
            (0, vitest_1.expect)(px6).toContain("padding");
            (0, vitest_1.expect)(px6).toContain("1.5rem");
        });
        (0, vitest_1.it)("resolves color utilities", async () => {
            const text = await (0, tailwindEngine_1.resolveClass)("text-red-500");
            (0, vitest_1.expect)(text).toContain("color:");
            const bg = await (0, tailwindEngine_1.resolveClass)("bg-blue-500");
            (0, vitest_1.expect)(bg).toContain("background-color:");
        });
        (0, vitest_1.it)("resolves font utilities", async () => {
            const bold = await (0, tailwindEngine_1.resolveClass)("font-bold");
            (0, vitest_1.expect)(bold).toContain("font-weight");
            (0, vitest_1.expect)(bold).toContain("700");
            const semibold = await (0, tailwindEngine_1.resolveClass)("font-semibold");
            (0, vitest_1.expect)(semibold).toContain("font-weight");
            (0, vitest_1.expect)(semibold).toContain("600");
        });
        (0, vitest_1.it)("resolves border-radius", async () => {
            const lg = await (0, tailwindEngine_1.resolveClass)("rounded-lg");
            (0, vitest_1.expect)(lg).toContain("border-radius");
            (0, vitest_1.expect)(lg).toContain("0.5rem");
            const full = await (0, tailwindEngine_1.resolveClass)("rounded-full");
            (0, vitest_1.expect)(full).toContain("border-radius");
        });
        (0, vitest_1.it)("resolves sizing utilities", async () => {
            (0, vitest_1.expect)(await (0, tailwindEngine_1.resolveClass)("w-full")).toBe("width: 100%");
            const h10 = await (0, tailwindEngine_1.resolveClass)("h-10");
            (0, vitest_1.expect)(h10).toContain("height");
        });
        (0, vitest_1.it)("returns null for unknown classes", async () => {
            (0, vitest_1.expect)(await (0, tailwindEngine_1.resolveClass)("nonexistent-class")).toBeNull();
            (0, vitest_1.expect)(await (0, tailwindEngine_1.resolveClass)("totally-fake")).toBeNull();
        });
        (0, vitest_1.it)("resolves variant classes with nested CSS blocks", async () => {
            const lgHidden = await (0, tailwindEngine_1.resolveClass)("lg:hidden");
            (0, vitest_1.expect)(lgHidden).toContain("@media");
            (0, vitest_1.expect)(lgHidden).toContain("display: none");
            const hoverUnderline = await (0, tailwindEngine_1.resolveClass)("hover:underline");
            (0, vitest_1.expect)(hoverUnderline).toContain("&:hover");
            (0, vitest_1.expect)(hoverUnderline).toContain("text-decoration-line: underline");
        });
        (0, vitest_1.it)("resolves opacity classes with color-mix", async () => {
            const bgBlack40 = await (0, tailwindEngine_1.resolveClass)("bg-black/40");
            (0, vitest_1.expect)(bgBlack40).toContain("background-color");
            (0, vitest_1.expect)(bgBlack40).toContain("color-mix");
            (0, vitest_1.expect)(bgBlack40).toContain("40%");
        });
    });
    (0, vitest_1.describe)("resolveClasses (batch)", () => {
        (0, vitest_1.it)("resolves multiple classes at once", async () => {
            const results = await (0, tailwindEngine_1.resolveClasses)(["flex", "hidden", "p-4", "nonexistent"]);
            (0, vitest_1.expect)(results.get("flex")).toBe("display: flex");
            (0, vitest_1.expect)(results.get("hidden")).toBe("display: none");
            (0, vitest_1.expect)(results.get("p-4")).toContain("padding");
            (0, vitest_1.expect)(results.get("nonexistent")).toBeNull();
        });
    });
    (0, vitest_1.describe)("internal helpers", () => {
        (0, vitest_1.it)("resolveCalc handles multiplication", () => {
            (0, vitest_1.expect)(resolveCalc("calc(0.25rem * 4)")).toBe("1rem");
            (0, vitest_1.expect)(resolveCalc("calc(0.25rem * 8)")).toBe("2rem");
        });
        (0, vitest_1.it)("resolveCalc handles division", () => {
            (0, vitest_1.expect)(resolveCalc("calc(1.25 / 0.875)")).toBe("1.42857");
        });
        (0, vitest_1.it)("resolveVars resolves known variables", () => {
            const vars = new Map([
                ["--spacing", "0.25rem"],
                ["--color-red-500", "oklch(63.7% 0.237 25.331)"],
            ]);
            (0, vitest_1.expect)(resolveVars("var(--spacing)", vars)).toBe("0.25rem");
            (0, vitest_1.expect)(resolveVars("var(--color-red-500)", vars)).toBe("oklch(63.7% 0.237 25.331)");
        });
        (0, vitest_1.it)("resolveVars uses fallback for unknown variables", () => {
            const vars = new Map();
            (0, vitest_1.expect)(resolveVars("var(--unknown, 10px)", vars)).toBe("10px");
        });
        (0, vitest_1.it)("resolveVars handles nested var() in fallback", () => {
            const vars = new Map([
                ["--text-sm--line-height", "calc(1.25 / 0.875)"],
            ]);
            (0, vitest_1.expect)(resolveVars("var(--tw-leading, var(--text-sm--line-height))", vars)).toBe("1.42857");
        });
        (0, vitest_1.it)("unescapeSelector removes backslashes", () => {
            (0, vitest_1.expect)(unescapeSelector(".hover\\:underline")).toBe("hover:underline");
            (0, vitest_1.expect)(unescapeSelector(".w-1\\/2")).toBe("w-1/2");
            (0, vitest_1.expect)(unescapeSelector(".bg-black\\/40")).toBe("bg-black/40");
        });
        (0, vitest_1.it)("parseDeclarations extracts property-value pairs", () => {
            (0, vitest_1.expect)(parseDeclarations("{ display: flex; }")).toBe("display: flex");
            (0, vitest_1.expect)(parseDeclarations("{ font-weight: 700; color: red; }")).toBe("font-weight: 700; color: red");
        });
    });
});
//# sourceMappingURL=tailwindEngine.test.js.map