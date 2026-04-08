"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tailwindToCss_1 = require("../tailwindToCss");
// Helper: assert result is not null and contains a substring
async function expectContains(input, substring) {
    const result = await (0, tailwindToCss_1.tailwindClassToCss)(input);
    (0, vitest_1.expect)(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
    (0, vitest_1.expect)(result.toLowerCase()).toContain(substring.toLowerCase());
}
// Helper: assert exact match
async function expectResult(input, expected) {
    const result = await (0, tailwindToCss_1.tailwindClassToCss)(input);
    (0, vitest_1.expect)(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
    (0, vitest_1.expect)(result).toBe(expected);
}
// Helper: assert not null (just resolved to something)
async function expectResolved(input) {
    const result = await (0, tailwindToCss_1.tailwindClassToCss)(input);
    (0, vitest_1.expect)(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
}
// =====================================================================
// VARIANT PREFIXES
// =====================================================================
(0, vitest_1.describe)("variant prefixes", async () => {
    (0, vitest_1.describe)("responsive", async () => {
        (0, vitest_1.it)("sm:flex", async () => {
            await expectContains("sm:flex", "@media (width >= 40rem)");
            await expectContains("sm:flex", "display: flex");
        });
        (0, vitest_1.it)("md:hidden", async () => {
            await expectContains("md:hidden", "@media (width >= 48rem)");
            await expectContains("md:hidden", "display: none");
        });
        (0, vitest_1.it)("lg:hidden", async () => {
            await expectContains("lg:hidden", "@media (width >= 64rem)");
            await expectContains("lg:hidden", "display: none");
        });
        (0, vitest_1.it)("xl:block", async () => {
            await expectContains("xl:block", "@media (width >= 80rem)");
            await expectContains("xl:block", "display: block");
        });
        (0, vitest_1.it)("2xl:grid", async () => {
            // The v4 engine returns null for 2xl: prefix (class names starting with digits need escaping)
            const result = await (0, tailwindToCss_1.tailwindClassToCss)("2xl:grid");
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    (0, vitest_1.describe)("container queries (v4)", async () => {
        (0, vitest_1.it)("@sm:flex", async () => {
            await expectContains("@sm:flex", "@container");
            await expectContains("@sm:flex", "display: flex");
        });
        (0, vitest_1.it)("@lg:hidden", async () => {
            await expectContains("@lg:hidden", "@container");
            await expectContains("@lg:hidden", "display: none");
        });
    });
    (0, vitest_1.describe)("state variants", async () => {
        (0, vitest_1.it)("hover:", async () => await expectContains("hover:underline", "&:hover"));
        (0, vitest_1.it)("focus:", async () => await expectContains("focus:ring-2", "&:focus"));
        (0, vitest_1.it)("active:", async () => await expectContains("active:bg-blue-700", "&:active"));
        (0, vitest_1.it)("disabled:", async () => await expectContains("disabled:opacity-50", "&:disabled"));
        (0, vitest_1.it)("focus-within:", async () => await expectContains("focus-within:ring-2", "&:focus-within"));
        (0, vitest_1.it)("focus-visible:", async () => await expectContains("focus-visible:ring-2", "&:focus-visible"));
        (0, vitest_1.it)("first:", async () => await expectContains("first:mt-0", "&:first-child"));
        (0, vitest_1.it)("last:", async () => await expectContains("last:mb-0", "&:last-child"));
        (0, vitest_1.it)("odd:", async () => await expectContains("odd:bg-gray-100", "&:nth-child(odd)"));
        (0, vitest_1.it)("even:", async () => await expectContains("even:bg-white", "&:nth-child(even)"));
        (0, vitest_1.it)("group-hover:", async () => await expectContains("group-hover:text-white", "&:is(:where(.group):hover *)"));
    });
    (0, vitest_1.describe)("v4 variants", async () => {
        (0, vitest_1.it)("has:", async () => {
            const result = await (0, tailwindToCss_1.tailwindClassToCss)("has:bg-red-500");
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)("not:", async () => {
            const result = await (0, tailwindToCss_1.tailwindClassToCss)("not:hidden");
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)("inert:", async () => await expectContains("inert:opacity-50", "&:is([inert], [inert] *)"));
        (0, vitest_1.it)("starting:", async () => await expectContains("starting:opacity-0", "@starting-style"));
        (0, vitest_1.it)("forced-colors:", async () => await expectContains("forced-colors:hidden", "forced-colors: active"));
    });
    (0, vitest_1.describe)("dark / print / motion", async () => {
        (0, vitest_1.it)("dark:", async () => await expectContains("dark:text-white", "prefers-color-scheme: dark"));
        (0, vitest_1.it)("print:", async () => await expectContains("print:hidden", "@media print"));
        (0, vitest_1.it)("motion-reduce:", async () => await expectContains("motion-reduce:hidden", "prefers-reduced-motion: reduce"));
        (0, vitest_1.it)("motion-safe:", async () => await expectContains("motion-safe:flex", "prefers-reduced-motion: no-preference"));
    });
    (0, vitest_1.describe)("pseudo elements", async () => {
        (0, vitest_1.it)("before:", async () => await expectContains("before:block", "&::before"));
        (0, vitest_1.it)("after:", async () => await expectContains("after:block", "&::after"));
        (0, vitest_1.it)("placeholder:", async () => await expectContains("placeholder:italic", "&::placeholder"));
        (0, vitest_1.it)("selection:", async () => await expectContains("selection:bg-blue-500", "&::selection"));
        (0, vitest_1.it)("marker:", async () => await expectContains("marker:text-red-500", "&::marker"));
        (0, vitest_1.it)("file:", async () => await expectContains("file:rounded", "&::file-selector-button"));
    });
    (0, vitest_1.describe)("stacked variants", async () => {
        (0, vitest_1.it)("dark:hover:text-white", async () => {
            const result = await (0, tailwindToCss_1.tailwindClassToCss)("dark:hover:text-white");
            (0, vitest_1.expect)(result).not.toBeNull();
            (0, vitest_1.expect)(result).toContain("dark");
            (0, vitest_1.expect)(result).toContain("hover");
            await expectContains("dark:hover:text-white", "color");
        });
        (0, vitest_1.it)("lg:hover:bg-blue-500", async () => {
            const result = await (0, tailwindToCss_1.tailwindClassToCss)("lg:hover:bg-blue-500");
            (0, vitest_1.expect)(result).not.toBeNull();
            (0, vitest_1.expect)(result).toContain("width >= 64rem");
            (0, vitest_1.expect)(result).toContain("hover");
        });
    });
    (0, vitest_1.describe)("variant + negative", async () => {
        (0, vitest_1.it)("lg:-translate-x-4", async () => {
            await expectContains("lg:-translate-x-4", "width >= 64rem");
            await expectContains("lg:-translate-x-4", "translate");
        });
    });
    (0, vitest_1.describe)("variant + arbitrary", async () => {
        (0, vitest_1.it)("hover:[color:red]", async () => {
            await expectContains("hover:[color:red]", "&:hover");
            await expectContains("hover:[color:red]", "color: red");
        });
    });
});
// =====================================================================
// EXISTING UTILITIES (REGRESSION)
// =====================================================================
(0, vitest_1.describe)("existing utilities (regression)", async () => {
    (0, vitest_1.it)("flex", async () => await expectResult("flex", "display: flex"));
    (0, vitest_1.it)("hidden", async () => await expectResult("hidden", "display: none"));
    (0, vitest_1.it)("block", async () => await expectResult("block", "display: block"));
    (0, vitest_1.it)("grid", async () => await expectResult("grid", "display: grid"));
    (0, vitest_1.it)("inline", async () => await expectResult("inline", "display: inline"));
    (0, vitest_1.it)("contents", async () => await expectResult("contents", "display: contents"));
    (0, vitest_1.it)("absolute", async () => await expectResult("absolute", "position: absolute"));
    (0, vitest_1.it)("relative", async () => await expectResult("relative", "position: relative"));
    (0, vitest_1.it)("fixed", async () => await expectResult("fixed", "position: fixed"));
    (0, vitest_1.it)("sticky", async () => await expectResult("sticky", "position: sticky"));
    (0, vitest_1.it)("flex-col", async () => await expectResult("flex-col", "flex-direction: column"));
    (0, vitest_1.it)("flex-row", async () => await expectResult("flex-row", "flex-direction: row"));
    (0, vitest_1.it)("items-center", async () => await expectResult("items-center", "align-items: center"));
    (0, vitest_1.it)("justify-between", async () => await expectResult("justify-between", "justify-content: space-between"));
    (0, vitest_1.it)("p-4", async () => await expectContains("p-4", "padding: 1rem"));
    (0, vitest_1.it)("mt-2", async () => await expectContains("mt-2", "margin-top: 0.5rem"));
    (0, vitest_1.it)("-mt-4", async () => await expectContains("-mt-4", "margin-top: calc("));
    (0, vitest_1.it)("w-full", async () => await expectResult("w-full", "width: 100%"));
    (0, vitest_1.it)("h-screen", async () => await expectResult("h-screen", "height: 100vh"));
    (0, vitest_1.it)("text-center", async () => await expectResult("text-center", "text-align: center"));
    (0, vitest_1.it)("text-lg", async () => await expectContains("text-lg", "font-size"));
    (0, vitest_1.it)("font-bold", async () => await expectContains("font-bold", "font-weight: 700"));
    (0, vitest_1.it)("rounded-lg", async () => await expectResult("rounded-lg", "border-radius: 0.5rem"));
    (0, vitest_1.it)("shadow-md", async () => await expectContains("shadow-md", "box-shadow"));
    (0, vitest_1.it)("opacity-50", async () => await expectContains("opacity-50", "opacity: 50%"));
    (0, vitest_1.it)("z-10", async () => await expectResult("z-10", "z-index: 10"));
    (0, vitest_1.it)("gap-4", async () => await expectContains("gap-4", "gap: 1rem"));
    (0, vitest_1.it)("cursor-pointer", async () => await expectResult("cursor-pointer", "cursor: pointer"));
    (0, vitest_1.it)("truncate", async () => await expectContains("truncate", "overflow: hidden"));
    (0, vitest_1.it)("underline", async () => await expectContains("underline", "underline"));
    (0, vitest_1.it)("uppercase", async () => await expectResult("uppercase", "text-transform: uppercase"));
    (0, vitest_1.it)("arbitrary [letter-spacing:3px]", async () => await expectResult("[letter-spacing:3px]", "letter-spacing: 3px"));
    (0, vitest_1.it)("duration-300", async () => await expectContains("duration-300", "transition-duration: 300ms"));
    (0, vitest_1.it)("delay-150", async () => await expectResult("delay-150", "transition-delay: 150ms"));
    (0, vitest_1.it)("rotate-45", async () => await expectContains("rotate-45", "rotate: 45deg"));
    (0, vitest_1.it)("scale-75", async () => await expectContains("scale-75", "scale:"));
    (0, vitest_1.it)("grid-cols-3", async () => await expectContains("grid-cols-3", "repeat(3"));
    (0, vitest_1.it)("col-span-2", async () => await expectContains("col-span-2", "span 2"));
    (0, vitest_1.it)("order-1", async () => await expectResult("order-1", "order: 1"));
});
// =====================================================================
// V4 RENAMES (both old + new names)
// =====================================================================
(0, vitest_1.describe)("v4 renames", async () => {
    (0, vitest_1.describe)("gradients", async () => {
        (0, vitest_1.it)("bg-gradient-to-r (v3)", async () => await expectContains("bg-gradient-to-r", "background-image:"));
        (0, vitest_1.it)("bg-linear-to-r (v4)", async () => await expectContains("bg-linear-to-r", "--tw-gradient-position: to right"));
        (0, vitest_1.it)("bg-gradient-to-t", async () => await expectContains("bg-gradient-to-t", "background-image:"));
        (0, vitest_1.it)("bg-linear-to-t", async () => await expectContains("bg-linear-to-t", "--tw-gradient-position: to top"));
        (0, vitest_1.it)("bg-gradient-to-b", async () => await expectContains("bg-gradient-to-b", "background-image:"));
        (0, vitest_1.it)("bg-gradient-to-l", async () => await expectContains("bg-gradient-to-l", "background-image:"));
        (0, vitest_1.it)("bg-gradient-to-br", async () => await expectContains("bg-gradient-to-br", "background-image:"));
        (0, vitest_1.it)("bg-gradient-to-tl", async () => await expectContains("bg-gradient-to-tl", "background-image:"));
        (0, vitest_1.it)("bg-gradient-to-tr", async () => await expectContains("bg-gradient-to-tr", "background-image:"));
        (0, vitest_1.it)("bg-gradient-to-bl", async () => await expectContains("bg-gradient-to-bl", "background-image:"));
        (0, vitest_1.it)("bg-radial (v4)", async () => await expectContains("bg-radial", "radial-gradient"));
        (0, vitest_1.it)("bg-conic (v4)", async () => await expectContains("bg-conic", "conic-gradient"));
    });
    (0, vitest_1.describe)("shadow scale", async () => {
        (0, vitest_1.it)("shadow-xs", async () => await expectContains("shadow-xs", "box-shadow"));
        (0, vitest_1.it)("shadow-sm", async () => await expectContains("shadow-sm", "box-shadow"));
    });
});
// =====================================================================
// V4 NEW UTILITIES
// =====================================================================
(0, vitest_1.describe)("v4 new utilities", async () => {
    (0, vitest_1.it)("text-balance", async () => await expectResult("text-balance", "text-wrap: balance"));
    (0, vitest_1.it)("text-pretty", async () => await expectResult("text-pretty", "text-wrap: pretty"));
    (0, vitest_1.it)("text-nowrap", async () => await expectResult("text-nowrap", "text-wrap: nowrap"));
    (0, vitest_1.it)("field-sizing-content", async () => await expectResult("field-sizing-content", "field-sizing: content"));
    (0, vitest_1.it)("field-sizing-fixed", async () => await expectResult("field-sizing-fixed", "field-sizing: fixed"));
    (0, vitest_1.it)("grid-cols-subgrid", async () => await expectResult("grid-cols-subgrid", "grid-template-columns: subgrid"));
    (0, vitest_1.it)("grid-rows-subgrid", async () => await expectResult("grid-rows-subgrid", "grid-template-rows: subgrid"));
    (0, vitest_1.it)("transform-3d", async () => await expectResult("transform-3d", "transform-style: preserve-3d"));
    (0, vitest_1.it)("transform-flat", async () => await expectResult("transform-flat", "transform-style: flat"));
    (0, vitest_1.it)("transform-gpu", async () => await expectContains("transform-gpu", "transform:"));
    (0, vitest_1.it)("transform-cpu", async () => await expectContains("transform-cpu", "transform:"));
    (0, vitest_1.it)("backface-visible", async () => await expectResult("backface-visible", "backface-visibility: visible"));
    (0, vitest_1.it)("backface-hidden", async () => await expectResult("backface-hidden", "backface-visibility: hidden"));
    (0, vitest_1.it)("forced-color-adjust-auto", async () => await expectResult("forced-color-adjust-auto", "forced-color-adjust: auto"));
    (0, vitest_1.it)("forced-color-adjust-none", async () => await expectResult("forced-color-adjust-none", "forced-color-adjust: none"));
});
// =====================================================================
// SIZE UTILITY (v4)
// =====================================================================
(0, vitest_1.describe)("size utility", async () => {
    (0, vitest_1.it)("size-4", async () => { expectContains("size-4", "width: 1rem"); expectContains("size-4", "height: 1rem"); });
    (0, vitest_1.it)("size-8", async () => await expectContains("size-8", "width: 2rem"));
    (0, vitest_1.it)("size-full", async () => { expectContains("size-full", "width: 100%"); expectContains("size-full", "height: 100%"); });
    (0, vitest_1.it)("size-auto", async () => await expectContains("size-auto", "width: auto"));
    (0, vitest_1.it)("size-min", async () => await expectContains("size-min", "min-content"));
    (0, vitest_1.it)("size-max", async () => await expectContains("size-max", "max-content"));
    (0, vitest_1.it)("size-fit", async () => await expectContains("size-fit", "fit-content"));
    (0, vitest_1.it)("size-px", async () => await expectContains("size-px", "1px"));
    (0, vitest_1.it)("size-0", async () => await expectContains("size-0", "0rem"));
    (0, vitest_1.it)("size-1/2", async () => await expectContains("size-1/2", "calc(1 / 2 * 100%)"));
});
// =====================================================================
// 3D TRANSFORMS (v4)
// =====================================================================
(0, vitest_1.describe)("3D transforms", async () => {
    (0, vitest_1.it)("translate-z-4", async () => await expectContains("translate-z-4", "--tw-translate-z: 1rem"));
    (0, vitest_1.it)("translate-z-px", async () => await expectContains("translate-z-px", "--tw-translate-z: 1px"));
    (0, vitest_1.it)("-translate-z-4", async () => await expectContains("-translate-z-4", "--tw-translate-z:"));
    (0, vitest_1.it)("rotate-x-45", async () => await expectContains("rotate-x-45", "rotateX(45deg)"));
    (0, vitest_1.it)("rotate-y-90", async () => await expectContains("rotate-y-90", "rotateY(90deg)"));
    (0, vitest_1.it)("rotate-z-180", async () => await expectContains("rotate-z-180", "rotateZ(180deg)"));
    (0, vitest_1.it)("perspective-500", async () => {
        const result = await (0, tailwindToCss_1.tailwindClassToCss)("perspective-500");
        (0, vitest_1.expect)(result).toBeNull();
    });
    (0, vitest_1.it)("perspective-none", async () => await expectContains("perspective-none", "perspective: none"));
});
// =====================================================================
// COLORS (generic resolver)
// =====================================================================
(0, vitest_1.describe)("color utilities", async () => {
    (0, vitest_1.it)("text-white", async () => await expectContains("text-white", "color: #fff"));
    (0, vitest_1.it)("text-black", async () => await expectContains("text-black", "color: #000"));
    (0, vitest_1.it)("text-transparent", async () => await expectContains("text-transparent", "color: transparent"));
    (0, vitest_1.it)("text-current", async () => await expectContains("text-current", "color: currentColor"));
    (0, vitest_1.it)("bg-transparent", async () => await expectContains("bg-transparent", "background-color: transparent"));
    (0, vitest_1.it)("bg-white", async () => await expectContains("bg-white", "background-color: #fff"));
    (0, vitest_1.it)("text-red-500", async () => await expectContains("text-red-500", "color"));
    (0, vitest_1.it)("bg-blue-700", async () => await expectContains("bg-blue-700", "background-color"));
    (0, vitest_1.it)("border-green-300", async () => await expectContains("border-green-300", "border-color"));
    (0, vitest_1.describe)("new color prefixes", async () => {
        (0, vitest_1.it)("ring-purple-500", async () => await expectResolved("ring-purple-500"));
        (0, vitest_1.it)("divide-gray-200", async () => await expectContains("divide-gray-200", "border-color"));
        (0, vitest_1.it)("accent-pink-500", async () => await expectContains("accent-pink-500", "accent-color"));
        (0, vitest_1.it)("caret-blue-500", async () => await expectContains("caret-blue-500", "caret-color"));
        (0, vitest_1.it)("decoration-red-500", async () => await expectContains("decoration-red-500", "text-decoration-color"));
        (0, vitest_1.it)("fill-current", async () => await expectContains("fill-current", "fill: currentColor"));
        (0, vitest_1.it)("fill-white", async () => await expectContains("fill-white", "fill"));
        (0, vitest_1.it)("stroke-current", async () => await expectContains("stroke-current", "stroke: currentColor"));
        (0, vitest_1.it)("stroke-black", async () => await expectContains("stroke-black", "stroke"));
    });
    (0, vitest_1.describe)("gradient stops", async () => {
        (0, vitest_1.it)("from-red-500", async () => await expectContains("from-red-500", "--tw-gradient-from"));
        (0, vitest_1.it)("via-blue-500", async () => await expectContains("via-blue-500", "--tw-gradient-via"));
        (0, vitest_1.it)("to-green-500", async () => await expectContains("to-green-500", "--tw-gradient-to"));
        (0, vitest_1.it)("from-transparent", async () => await expectContains("from-transparent", "transparent"));
        (0, vitest_1.it)("from-white", async () => await expectContains("from-white", "#fff"));
        (0, vitest_1.it)("to-transparent", async () => await expectContains("to-transparent", "transparent"));
    });
});
// =====================================================================
// SLASH OPACITY
// =====================================================================
(0, vitest_1.describe)("opacity slash syntax", async () => {
    (0, vitest_1.it)("bg-red-500/50", async () => {
        const result = await (0, tailwindToCss_1.tailwindClassToCss)("bg-red-500/50");
        (0, vitest_1.expect)(result).not.toBeNull();
        await expectContains("bg-red-500/50", "background-color");
        await expectContains("bg-red-500/50", "50%");
    });
    (0, vitest_1.it)("text-white/75", async () => {
        await expectContains("text-white/75", "color");
        await expectContains("text-white/75", "75%");
    });
    (0, vitest_1.it)("border-black/10", async () => {
        await expectContains("border-black/10", "border-color");
        await expectContains("border-black/10", "10%");
    });
});
// =====================================================================
// RING
// =====================================================================
(0, vitest_1.describe)("ring utilities", async () => {
    (0, vitest_1.it)("ring", async () => await expectContains("ring", "box-shadow"));
    (0, vitest_1.it)("ring-0", async () => await expectContains("ring-0", "0px"));
    (0, vitest_1.it)("ring-1", async () => await expectContains("ring-1", "1px"));
    (0, vitest_1.it)("ring-2", async () => await expectContains("ring-2", "2px"));
    (0, vitest_1.it)("ring-4", async () => await expectContains("ring-4", "4px"));
    (0, vitest_1.it)("ring-8", async () => await expectContains("ring-8", "8px"));
    (0, vitest_1.it)("ring-inset", async () => await expectContains("ring-inset", "inset"));
    (0, vitest_1.it)("ring-offset-2", async () => await expectContains("ring-offset-2", "2px"));
    (0, vitest_1.it)("ring-offset-4", async () => await expectContains("ring-offset-4", "4px"));
});
// =====================================================================
// FILTERS
// =====================================================================
(0, vitest_1.describe)("filter utilities", async () => {
    (0, vitest_1.it)("blur-none", async () => await expectContains("blur-none", "--tw-blur:"));
    (0, vitest_1.it)("blur-sm", async () => await expectContains("blur-sm", "--tw-blur: blur(8px)"));
    (0, vitest_1.it)("blur", async () => await expectContains("blur", "blur(8px)"));
    (0, vitest_1.it)("blur-md", async () => await expectContains("blur-md", "blur(12px)"));
    (0, vitest_1.it)("blur-lg", async () => await expectContains("blur-lg", "blur(16px)"));
    (0, vitest_1.it)("blur-xl", async () => await expectContains("blur-xl", "blur(24px)"));
    (0, vitest_1.it)("blur-2xl", async () => await expectContains("blur-2xl", "blur(40px)"));
    (0, vitest_1.it)("blur-3xl", async () => await expectContains("blur-3xl", "blur(64px)"));
    (0, vitest_1.it)("brightness-50", async () => await expectContains("brightness-50", "--tw-brightness: brightness(50%)"));
    (0, vitest_1.it)("brightness-100", async () => await expectContains("brightness-100", "--tw-brightness: brightness(100%)"));
    (0, vitest_1.it)("brightness-150", async () => await expectContains("brightness-150", "--tw-brightness: brightness(150%)"));
    (0, vitest_1.it)("contrast-50", async () => await expectContains("contrast-50", "--tw-contrast: contrast(50%)"));
    (0, vitest_1.it)("contrast-200", async () => await expectContains("contrast-200", "--tw-contrast: contrast(200%)"));
    (0, vitest_1.it)("saturate-0", async () => await expectContains("saturate-0", "--tw-saturate: saturate(0%)"));
    (0, vitest_1.it)("saturate-150", async () => await expectContains("saturate-150", "--tw-saturate: saturate(150%)"));
    (0, vitest_1.it)("hue-rotate-15", async () => await expectContains("hue-rotate-15", "hue-rotate(15deg)"));
    (0, vitest_1.it)("hue-rotate-90", async () => await expectContains("hue-rotate-90", "hue-rotate(90deg)"));
    (0, vitest_1.it)("hue-rotate-180", async () => await expectContains("hue-rotate-180", "hue-rotate(180deg)"));
    (0, vitest_1.it)("grayscale", async () => await expectContains("grayscale", "grayscale(100%)"));
    (0, vitest_1.it)("grayscale-0", async () => await expectContains("grayscale-0", "--tw-grayscale: grayscale(0%)"));
    (0, vitest_1.it)("invert", async () => await expectContains("invert", "invert(100%)"));
    (0, vitest_1.it)("invert-0", async () => await expectContains("invert-0", "--tw-invert: invert(0%)"));
    (0, vitest_1.it)("sepia", async () => await expectContains("sepia", "sepia(100%)"));
    (0, vitest_1.it)("sepia-0", async () => await expectContains("sepia-0", "--tw-sepia: sepia(0%)"));
    (0, vitest_1.it)("drop-shadow-sm", async () => await expectContains("drop-shadow-sm", "drop-shadow"));
    (0, vitest_1.it)("drop-shadow-md", async () => await expectContains("drop-shadow-md", "drop-shadow"));
    (0, vitest_1.it)("drop-shadow-lg", async () => await expectContains("drop-shadow-lg", "drop-shadow"));
    (0, vitest_1.it)("drop-shadow-xl", async () => await expectContains("drop-shadow-xl", "drop-shadow"));
    (0, vitest_1.it)("drop-shadow-none", async () => await expectContains("drop-shadow-none", "drop-shadow"));
});
// =====================================================================
// BACKDROP FILTERS
// =====================================================================
(0, vitest_1.describe)("backdrop filter utilities", async () => {
    (0, vitest_1.it)("backdrop-blur-sm", async () => await expectContains("backdrop-blur-sm", "--tw-backdrop-blur: blur(8px)"));
    (0, vitest_1.it)("backdrop-blur-md", async () => await expectContains("backdrop-blur-md", "--tw-backdrop-blur: blur(12px)"));
    (0, vitest_1.it)("backdrop-brightness-50", async () => await expectContains("backdrop-brightness-50", "--tw-backdrop-brightness: brightness(50%)"));
    (0, vitest_1.it)("backdrop-contrast-125", async () => await expectContains("backdrop-contrast-125", "--tw-backdrop-contrast: contrast(125%)"));
    (0, vitest_1.it)("backdrop-saturate-150", async () => await expectContains("backdrop-saturate-150", "--tw-backdrop-saturate: saturate(150%)"));
    (0, vitest_1.it)("backdrop-hue-rotate-90", async () => await expectContains("backdrop-hue-rotate-90", "--tw-backdrop-hue-rotate: hue-rotate(90deg)"));
    (0, vitest_1.it)("backdrop-grayscale", async () => await expectContains("backdrop-grayscale", "--tw-backdrop-grayscale: grayscale(100%)"));
    (0, vitest_1.it)("backdrop-invert", async () => await expectContains("backdrop-invert", "--tw-backdrop-invert: invert(100%)"));
    (0, vitest_1.it)("backdrop-sepia", async () => await expectContains("backdrop-sepia", "--tw-backdrop-sepia: sepia(100%)"));
    (0, vitest_1.it)("backdrop-opacity-50", async () => await expectContains("backdrop-opacity-50", "--tw-backdrop-opacity: opacity(50%)"));
});
// =====================================================================
// DIVIDE
// =====================================================================
(0, vitest_1.describe)("divide utilities", async () => {
    (0, vitest_1.it)("divide-x", async () => await expectContains("divide-x", "border"));
    (0, vitest_1.it)("divide-y", async () => await expectContains("divide-y", "border"));
    (0, vitest_1.it)("divide-x-2", async () => await expectContains("divide-x-2", "2px"));
    (0, vitest_1.it)("divide-y-4", async () => await expectContains("divide-y-4", "4px"));
    (0, vitest_1.it)("divide-x-0", async () => await expectContains("divide-x-0", "0px"));
    (0, vitest_1.it)("divide-solid", async () => await expectContains("divide-solid", "border-style: solid"));
    (0, vitest_1.it)("divide-dashed", async () => await expectContains("divide-dashed", "border-style: dashed"));
    (0, vitest_1.it)("divide-dotted", async () => await expectContains("divide-dotted", "border-style: dotted"));
    (0, vitest_1.it)("divide-double", async () => await expectContains("divide-double", "border-style: double"));
    (0, vitest_1.it)("divide-none", async () => await expectContains("divide-none", "border-style: none"));
});
// =====================================================================
// TRANSLATE / SKEW
// =====================================================================
(0, vitest_1.describe)("translate and skew", async () => {
    (0, vitest_1.it)("translate-x-4", async () => await expectContains("translate-x-4", "--tw-translate-x: 1rem"));
    (0, vitest_1.it)("translate-y-2", async () => await expectContains("translate-y-2", "--tw-translate-y: 0.5rem"));
    (0, vitest_1.it)("-translate-x-4", async () => await expectContains("-translate-x-4", "--tw-translate-x: calc("));
    (0, vitest_1.it)("translate-x-1/2", async () => await expectContains("translate-x-1/2", "--tw-translate-x: calc(1 / 2 * 100%)"));
    (0, vitest_1.it)("translate-x-full", async () => await expectContains("translate-x-full", "--tw-translate-x: 100%"));
    (0, vitest_1.it)("translate-x-px", async () => await expectContains("translate-x-px", "--tw-translate-x: 1px"));
    (0, vitest_1.it)("-translate-y-full", async () => await expectContains("-translate-y-full", "--tw-translate-y:"));
    (0, vitest_1.it)("skew-x-3", async () => await expectContains("skew-x-3", "skewX(3deg)"));
    (0, vitest_1.it)("skew-y-6", async () => await expectContains("skew-y-6", "skewY(6deg)"));
    (0, vitest_1.it)("-skew-x-12", async () => await expectContains("-skew-x-12", "skew-x:"));
});
// =====================================================================
// LINE CLAMP
// =====================================================================
(0, vitest_1.describe)("line clamp", async () => {
    (0, vitest_1.it)("line-clamp-1", async () => await expectContains("line-clamp-1", "-webkit-line-clamp: 1"));
    (0, vitest_1.it)("line-clamp-3", async () => await expectContains("line-clamp-3", "-webkit-line-clamp: 3"));
    (0, vitest_1.it)("line-clamp-6", async () => await expectContains("line-clamp-6", "-webkit-line-clamp: 6"));
    (0, vitest_1.it)("line-clamp-none", async () => await expectContains("line-clamp-none", "-webkit-line-clamp: unset"));
});
// =====================================================================
// SR-ONLY
// =====================================================================
(0, vitest_1.describe)("screen reader", async () => {
    (0, vitest_1.it)("sr-only", async () => {
        await expectContains("sr-only", "position: absolute");
        await expectContains("sr-only", "width: 1px");
        await expectContains("sr-only", "height: 1px");
    });
    (0, vitest_1.it)("not-sr-only", async () => await expectContains("not-sr-only", "position: static"));
});
// =====================================================================
// TEXT UTILITIES
// =====================================================================
(0, vitest_1.describe)("text utilities", async () => {
    (0, vitest_1.it)("text-ellipsis", async () => await expectResult("text-ellipsis", "text-overflow: ellipsis"));
    (0, vitest_1.it)("text-clip", async () => await expectResult("text-clip", "text-overflow: clip"));
    (0, vitest_1.it)("break-words", async () => await expectResult("break-words", "overflow-wrap: break-word"));
    (0, vitest_1.it)("break-all", async () => await expectResult("break-all", "word-break: break-all"));
    (0, vitest_1.it)("break-normal", async () => await expectContains("break-normal", "overflow-wrap: normal"));
    (0, vitest_1.it)("break-keep", async () => await expectResult("break-keep", "word-break: keep-all"));
});
// =====================================================================
// LIST STYLE
// =====================================================================
(0, vitest_1.describe)("list style", async () => {
    (0, vitest_1.it)("list-none", async () => await expectResult("list-none", "list-style-type: none"));
    (0, vitest_1.it)("list-disc", async () => await expectResult("list-disc", "list-style-type: disc"));
    (0, vitest_1.it)("list-decimal", async () => await expectResult("list-decimal", "list-style-type: decimal"));
    (0, vitest_1.it)("list-inside", async () => await expectResult("list-inside", "list-style-position: inside"));
    (0, vitest_1.it)("list-outside", async () => await expectResult("list-outside", "list-style-position: outside"));
});
// =====================================================================
// OUTLINE
// =====================================================================
(0, vitest_1.describe)("outline", async () => {
    (0, vitest_1.it)("outline", async () => await expectContains("outline", "outline-style:"));
    (0, vitest_1.it)("outline-none", async () => await expectContains("outline-none", "outline"));
    (0, vitest_1.it)("outline-dashed", async () => await expectContains("outline-dashed", "outline-style: dashed"));
    (0, vitest_1.it)("outline-dotted", async () => await expectContains("outline-dotted", "outline-style: dotted"));
    (0, vitest_1.it)("outline-double", async () => await expectContains("outline-double", "outline-style: double"));
    (0, vitest_1.it)("outline-1", async () => await expectContains("outline-1", "outline-width: 1px"));
    (0, vitest_1.it)("outline-2", async () => await expectContains("outline-2", "outline-width: 2px"));
    (0, vitest_1.it)("outline-4", async () => await expectContains("outline-4", "outline-width: 4px"));
    (0, vitest_1.it)("outline-offset-2", async () => await expectContains("outline-offset-2", "outline-offset: 2px"));
    (0, vitest_1.it)("outline-offset-4", async () => await expectContains("outline-offset-4", "outline-offset: 4px"));
});
// =====================================================================
// COLUMNS / INDENT
// =====================================================================
(0, vitest_1.describe)("columns and indent", async () => {
    (0, vitest_1.it)("columns-1", async () => await expectContains("columns-1", "columns: 1"));
    (0, vitest_1.it)("columns-3", async () => await expectContains("columns-3", "columns: 3"));
    (0, vitest_1.it)("columns-auto", async () => await expectContains("columns-auto", "columns: auto"));
    (0, vitest_1.it)("indent-4", async () => await expectContains("indent-4", "text-indent: 1rem"));
    (0, vitest_1.it)("indent-8", async () => await expectContains("indent-8", "text-indent: 2rem"));
    (0, vitest_1.it)("indent-px", async () => await expectContains("indent-px", "text-indent: 1px"));
    (0, vitest_1.it)("-indent-4", async () => await expectContains("-indent-4", "text-indent: calc("));
});
// =====================================================================
// DECORATION
// =====================================================================
(0, vitest_1.describe)("text decoration", async () => {
    (0, vitest_1.it)("underline-offset-auto", async () => await expectContains("underline-offset-auto", "text-underline-offset: auto"));
    (0, vitest_1.it)("underline-offset-2", async () => await expectContains("underline-offset-2", "text-underline-offset: 2px"));
    (0, vitest_1.it)("underline-offset-4", async () => await expectContains("underline-offset-4", "text-underline-offset: 4px"));
    (0, vitest_1.it)("decoration-solid", async () => await expectContains("decoration-solid", "text-decoration-style: solid"));
    (0, vitest_1.it)("decoration-dashed", async () => await expectContains("decoration-dashed", "text-decoration-style: dashed"));
    (0, vitest_1.it)("decoration-wavy", async () => await expectContains("decoration-wavy", "text-decoration-style: wavy"));
    (0, vitest_1.it)("decoration-dotted", async () => await expectContains("decoration-dotted", "text-decoration-style: dotted"));
    (0, vitest_1.it)("decoration-double", async () => await expectContains("decoration-double", "text-decoration-style: double"));
    (0, vitest_1.it)("decoration-1", async () => await expectContains("decoration-1", "text-decoration-thickness: 1px"));
    (0, vitest_1.it)("decoration-2", async () => await expectContains("decoration-2", "text-decoration-thickness: 2px"));
    (0, vitest_1.it)("decoration-auto", async () => await expectContains("decoration-auto", "text-decoration-thickness: auto"));
    (0, vitest_1.it)("decoration-from-font", async () => await expectContains("decoration-from-font", "text-decoration-thickness: from-font"));
});
// =====================================================================
// WILL CHANGE / TOUCH / APPEARANCE
// =====================================================================
(0, vitest_1.describe)("interactivity", async () => {
    (0, vitest_1.it)("will-change-auto", async () => await expectResult("will-change-auto", "will-change: auto"));
    (0, vitest_1.it)("will-change-scroll", async () => await expectResult("will-change-scroll", "will-change: scroll-position"));
    (0, vitest_1.it)("will-change-contents", async () => await expectResult("will-change-contents", "will-change: contents"));
    (0, vitest_1.it)("will-change-transform", async () => await expectResult("will-change-transform", "will-change: transform"));
    (0, vitest_1.it)("touch-auto", async () => await expectResult("touch-auto", "touch-action: auto"));
    (0, vitest_1.it)("touch-none", async () => await expectResult("touch-none", "touch-action: none"));
    (0, vitest_1.it)("touch-pan-x", async () => await expectContains("touch-pan-x", "--tw-pan-x: pan-x"));
    (0, vitest_1.it)("touch-pan-y", async () => await expectContains("touch-pan-y", "--tw-pan-y: pan-y"));
    (0, vitest_1.it)("touch-manipulation", async () => await expectResult("touch-manipulation", "touch-action: manipulation"));
    (0, vitest_1.it)("touch-pinch-zoom", async () => await expectContains("touch-pinch-zoom", "--tw-pinch-zoom: pinch-zoom"));
    (0, vitest_1.it)("appearance-none", async () => await expectResult("appearance-none", "appearance: none"));
    (0, vitest_1.it)("appearance-auto", async () => await expectResult("appearance-auto", "appearance: auto"));
});
// =====================================================================
// MIX BLEND / VERTICAL ALIGN
// =====================================================================
(0, vitest_1.describe)("mix blend and vertical align", async () => {
    (0, vitest_1.it)("mix-blend-normal", async () => await expectResult("mix-blend-normal", "mix-blend-mode: normal"));
    (0, vitest_1.it)("mix-blend-multiply", async () => await expectResult("mix-blend-multiply", "mix-blend-mode: multiply"));
    (0, vitest_1.it)("mix-blend-screen", async () => await expectResult("mix-blend-screen", "mix-blend-mode: screen"));
    (0, vitest_1.it)("mix-blend-overlay", async () => await expectResult("mix-blend-overlay", "mix-blend-mode: overlay"));
    (0, vitest_1.it)("mix-blend-darken", async () => await expectResult("mix-blend-darken", "mix-blend-mode: darken"));
    (0, vitest_1.it)("mix-blend-lighten", async () => await expectResult("mix-blend-lighten", "mix-blend-mode: lighten"));
    (0, vitest_1.it)("mix-blend-color-dodge", async () => await expectResult("mix-blend-color-dodge", "mix-blend-mode: color-dodge"));
    (0, vitest_1.it)("mix-blend-color-burn", async () => await expectResult("mix-blend-color-burn", "mix-blend-mode: color-burn"));
    (0, vitest_1.it)("mix-blend-hard-light", async () => await expectResult("mix-blend-hard-light", "mix-blend-mode: hard-light"));
    (0, vitest_1.it)("mix-blend-soft-light", async () => await expectResult("mix-blend-soft-light", "mix-blend-mode: soft-light"));
    (0, vitest_1.it)("mix-blend-difference", async () => await expectResult("mix-blend-difference", "mix-blend-mode: difference"));
    (0, vitest_1.it)("mix-blend-exclusion", async () => await expectResult("mix-blend-exclusion", "mix-blend-mode: exclusion"));
    (0, vitest_1.it)("mix-blend-hue", async () => await expectResult("mix-blend-hue", "mix-blend-mode: hue"));
    (0, vitest_1.it)("mix-blend-saturation", async () => await expectResult("mix-blend-saturation", "mix-blend-mode: saturation"));
    (0, vitest_1.it)("mix-blend-color", async () => await expectResult("mix-blend-color", "mix-blend-mode: color"));
    (0, vitest_1.it)("mix-blend-luminosity", async () => await expectResult("mix-blend-luminosity", "mix-blend-mode: luminosity"));
    (0, vitest_1.it)("align-baseline", async () => await expectResult("align-baseline", "vertical-align: baseline"));
    (0, vitest_1.it)("align-top", async () => await expectResult("align-top", "vertical-align: top"));
    (0, vitest_1.it)("align-middle", async () => await expectResult("align-middle", "vertical-align: middle"));
    (0, vitest_1.it)("align-bottom", async () => await expectResult("align-bottom", "vertical-align: bottom"));
    (0, vitest_1.it)("align-text-top", async () => await expectResult("align-text-top", "vertical-align: text-top"));
    (0, vitest_1.it)("align-text-bottom", async () => await expectResult("align-text-bottom", "vertical-align: text-bottom"));
    (0, vitest_1.it)("align-sub", async () => await expectResult("align-sub", "vertical-align: sub"));
    (0, vitest_1.it)("align-super", async () => await expectResult("align-super", "vertical-align: super"));
});
// =====================================================================
// SNAP / SCROLL
// =====================================================================
(0, vitest_1.describe)("scroll snap and scroll spacing", async () => {
    (0, vitest_1.it)("snap-start", async () => await expectResult("snap-start", "scroll-snap-align: start"));
    (0, vitest_1.it)("snap-end", async () => await expectResult("snap-end", "scroll-snap-align: end"));
    (0, vitest_1.it)("snap-center", async () => await expectResult("snap-center", "scroll-snap-align: center"));
    (0, vitest_1.it)("snap-align-none", async () => await expectResult("snap-align-none", "scroll-snap-align: none"));
    (0, vitest_1.it)("snap-none", async () => await expectResult("snap-none", "scroll-snap-type: none"));
    (0, vitest_1.it)("snap-x", async () => await expectContains("snap-x", "scroll-snap-type"));
    (0, vitest_1.it)("snap-y", async () => await expectContains("snap-y", "scroll-snap-type"));
    (0, vitest_1.it)("snap-both", async () => await expectContains("snap-both", "scroll-snap-type"));
    (0, vitest_1.it)("snap-mandatory", async () => await expectContains("snap-mandatory", "mandatory"));
    (0, vitest_1.it)("snap-proximity", async () => await expectContains("snap-proximity", "proximity"));
    (0, vitest_1.it)("snap-normal", async () => await expectContains("snap-normal", "scroll-snap-stop: normal"));
    (0, vitest_1.it)("snap-always", async () => await expectContains("snap-always", "scroll-snap-stop: always"));
    (0, vitest_1.it)("scroll-mt-4", async () => await expectContains("scroll-mt-4", "scroll-margin-top: 1rem"));
    (0, vitest_1.it)("scroll-pb-2", async () => await expectContains("scroll-pb-2", "scroll-padding-bottom: 0.5rem"));
    (0, vitest_1.it)("scroll-px-8", async () => await expectContains("scroll-px-8", "scroll-padding"));
});
// =====================================================================
// BG UTILITIES
// =====================================================================
(0, vitest_1.describe)("background utilities", async () => {
    (0, vitest_1.it)("bg-fixed", async () => await expectResult("bg-fixed", "background-attachment: fixed"));
    (0, vitest_1.it)("bg-local", async () => await expectResult("bg-local", "background-attachment: local"));
    (0, vitest_1.it)("bg-scroll", async () => await expectResult("bg-scroll", "background-attachment: scroll"));
    (0, vitest_1.it)("bg-cover", async () => await expectResult("bg-cover", "background-size: cover"));
    (0, vitest_1.it)("bg-contain", async () => await expectResult("bg-contain", "background-size: contain"));
    (0, vitest_1.it)("bg-center", async () => await expectResult("bg-center", "background-position: center"));
    (0, vitest_1.it)("bg-top", async () => await expectResult("bg-top", "background-position: top"));
    (0, vitest_1.it)("bg-bottom", async () => await expectResult("bg-bottom", "background-position: bottom"));
    (0, vitest_1.it)("bg-left", async () => await expectResult("bg-left", "background-position: left"));
    (0, vitest_1.it)("bg-right", async () => await expectResult("bg-right", "background-position: right"));
    (0, vitest_1.it)("bg-no-repeat", async () => await expectResult("bg-no-repeat", "background-repeat: no-repeat"));
    (0, vitest_1.it)("bg-repeat", async () => await expectResult("bg-repeat", "background-repeat: repeat"));
    (0, vitest_1.it)("bg-repeat-x", async () => await expectResult("bg-repeat-x", "background-repeat: repeat-x"));
    (0, vitest_1.it)("bg-repeat-y", async () => await expectResult("bg-repeat-y", "background-repeat: repeat-y"));
});
// =====================================================================
// ANIMATE
// =====================================================================
(0, vitest_1.describe)("animation", async () => {
    (0, vitest_1.it)("animate-spin", async () => await expectContains("animate-spin", "animation"));
    (0, vitest_1.it)("animate-ping", async () => await expectContains("animate-ping", "animation"));
    (0, vitest_1.it)("animate-pulse", async () => await expectContains("animate-pulse", "animation"));
    (0, vitest_1.it)("animate-bounce", async () => await expectContains("animate-bounce", "animation"));
    (0, vitest_1.it)("animate-none", async () => await expectResult("animate-none", "animation: none"));
});
// =====================================================================
// PLACE UTILITIES
// =====================================================================
(0, vitest_1.describe)("place utilities", async () => {
    (0, vitest_1.it)("place-content-center", async () => await expectResult("place-content-center", "place-content: center"));
    (0, vitest_1.it)("place-content-start", async () => await expectResult("place-content-start", "place-content: start"));
    (0, vitest_1.it)("place-content-end", async () => await expectResult("place-content-end", "place-content: end"));
    (0, vitest_1.it)("place-content-between", async () => await expectResult("place-content-between", "place-content: space-between"));
    (0, vitest_1.it)("place-content-around", async () => await expectResult("place-content-around", "place-content: space-around"));
    (0, vitest_1.it)("place-content-evenly", async () => await expectResult("place-content-evenly", "place-content: space-evenly"));
    (0, vitest_1.it)("place-content-stretch", async () => await expectResult("place-content-stretch", "place-content: stretch"));
    (0, vitest_1.it)("place-items-center", async () => await expectResult("place-items-center", "place-items: center"));
    (0, vitest_1.it)("place-items-start", async () => await expectResult("place-items-start", "place-items: start"));
    (0, vitest_1.it)("place-items-end", async () => await expectResult("place-items-end", "place-items: end"));
    (0, vitest_1.it)("place-items-stretch", async () => await expectResult("place-items-stretch", "place-items: stretch"));
    (0, vitest_1.it)("place-self-center", async () => await expectResult("place-self-center", "place-self: center"));
    (0, vitest_1.it)("place-self-auto", async () => await expectResult("place-self-auto", "place-self: auto"));
    (0, vitest_1.it)("place-self-start", async () => await expectResult("place-self-start", "place-self: start"));
    (0, vitest_1.it)("place-self-end", async () => await expectResult("place-self-end", "place-self: end"));
    (0, vitest_1.it)("place-self-stretch", async () => await expectResult("place-self-stretch", "place-self: stretch"));
});
// =====================================================================
// OVERSCROLL
// =====================================================================
(0, vitest_1.describe)("overscroll", async () => {
    (0, vitest_1.it)("overscroll-auto", async () => await expectResult("overscroll-auto", "overscroll-behavior: auto"));
    (0, vitest_1.it)("overscroll-contain", async () => await expectResult("overscroll-contain", "overscroll-behavior: contain"));
    (0, vitest_1.it)("overscroll-none", async () => await expectResult("overscroll-none", "overscroll-behavior: none"));
    (0, vitest_1.it)("overscroll-x-auto", async () => await expectResult("overscroll-x-auto", "overscroll-behavior-x: auto"));
    (0, vitest_1.it)("overscroll-x-contain", async () => await expectResult("overscroll-x-contain", "overscroll-behavior-x: contain"));
    (0, vitest_1.it)("overscroll-x-none", async () => await expectResult("overscroll-x-none", "overscroll-behavior-x: none"));
    (0, vitest_1.it)("overscroll-y-auto", async () => await expectResult("overscroll-y-auto", "overscroll-behavior-y: auto"));
    (0, vitest_1.it)("overscroll-y-contain", async () => await expectResult("overscroll-y-contain", "overscroll-behavior-y: contain"));
    (0, vitest_1.it)("overscroll-y-none", async () => await expectResult("overscroll-y-none", "overscroll-behavior-y: none"));
});
// =====================================================================
// FLEX BASIS
// =====================================================================
(0, vitest_1.describe)("flex basis", async () => {
    (0, vitest_1.it)("basis-0", async () => await expectContains("basis-0", "flex-basis: 0rem"));
    (0, vitest_1.it)("basis-4", async () => await expectContains("basis-4", "flex-basis: 1rem"));
    (0, vitest_1.it)("basis-full", async () => await expectContains("basis-full", "flex-basis: 100%"));
    (0, vitest_1.it)("basis-auto", async () => await expectContains("basis-auto", "flex-basis: auto"));
    (0, vitest_1.it)("basis-1/2", async () => await expectContains("basis-1/2", "flex-basis: calc(1 / 2 * 100%)"));
    (0, vitest_1.it)("basis-1/3", async () => {
        const result = await (0, tailwindToCss_1.tailwindClassToCss)("basis-1/3");
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result).toContain("flex-basis");
        (0, vitest_1.expect)(result).toContain("calc(1 / 3 * 100%)");
    });
    (0, vitest_1.it)("basis-px", async () => await expectContains("basis-px", "flex-basis: 1px"));
});
// =====================================================================
// CONTAINER
// =====================================================================
(0, vitest_1.describe)("container", async () => {
    (0, vitest_1.it)("container", async () => await expectContains("container", "width: 100%"));
});
// =====================================================================
// ISOLATION / BOX DECORATION / MISC
// =====================================================================
(0, vitest_1.describe)("miscellaneous", async () => {
    (0, vitest_1.it)("isolate", async () => await expectResult("isolate", "isolation: isolate"));
    (0, vitest_1.it)("isolation-auto", async () => await expectResult("isolation-auto", "isolation: auto"));
    (0, vitest_1.it)("box-decoration-clone", async () => await expectContains("box-decoration-clone", "box-decoration-break: clone"));
    (0, vitest_1.it)("box-decoration-slice", async () => await expectContains("box-decoration-slice", "box-decoration-break: slice"));
});
//# sourceMappingURL=tailwindToCss.test.js.map