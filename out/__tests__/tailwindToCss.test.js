"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tailwindToCss_1 = require("../tailwindToCss");
// Helper: assert result is not null and contains a substring
function expectContains(input, substring) {
    const result = (0, tailwindToCss_1.tailwindClassToCss)(input);
    (0, vitest_1.expect)(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
    (0, vitest_1.expect)(result.toLowerCase()).toContain(substring.toLowerCase());
}
// Helper: assert exact match
function expectResult(input, expected) {
    const result = (0, tailwindToCss_1.tailwindClassToCss)(input);
    (0, vitest_1.expect)(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
    (0, vitest_1.expect)(result).toBe(expected);
}
// Helper: assert not null (just resolved to something)
function expectResolved(input) {
    const result = (0, tailwindToCss_1.tailwindClassToCss)(input);
    (0, vitest_1.expect)(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
}
// =====================================================================
// VARIANT PREFIXES
// =====================================================================
(0, vitest_1.describe)("variant prefixes", () => {
    (0, vitest_1.describe)("responsive", () => {
        (0, vitest_1.it)("sm:flex", () => {
            expectContains("sm:flex", "@media (min-width: 640px)");
            expectContains("sm:flex", "display: flex");
        });
        (0, vitest_1.it)("md:hidden", () => {
            expectContains("md:hidden", "@media (min-width: 768px)");
            expectContains("md:hidden", "display: none");
        });
        (0, vitest_1.it)("lg:hidden", () => {
            expectContains("lg:hidden", "@media (min-width: 1024px)");
            expectContains("lg:hidden", "display: none");
        });
        (0, vitest_1.it)("xl:block", () => {
            expectContains("xl:block", "@media (min-width: 1280px)");
            expectContains("xl:block", "display: block");
        });
        (0, vitest_1.it)("2xl:grid", () => {
            expectContains("2xl:grid", "@media (min-width: 1536px)");
            expectContains("2xl:grid", "display: grid");
        });
    });
    (0, vitest_1.describe)("container queries (v4)", () => {
        (0, vitest_1.it)("@sm:flex", () => {
            expectContains("@sm:flex", "@container");
            expectContains("@sm:flex", "display: flex");
        });
        (0, vitest_1.it)("@lg:hidden", () => {
            expectContains("@lg:hidden", "@container");
            expectContains("@lg:hidden", "display: none");
        });
    });
    (0, vitest_1.describe)("state variants", () => {
        (0, vitest_1.it)("hover:", () => expectContains("hover:underline", "&:hover"));
        (0, vitest_1.it)("focus:", () => expectContains("focus:ring-2", "&:focus"));
        (0, vitest_1.it)("active:", () => expectContains("active:bg-blue-700", "&:active"));
        (0, vitest_1.it)("disabled:", () => expectContains("disabled:opacity-50", "&:disabled"));
        (0, vitest_1.it)("focus-within:", () => expectContains("focus-within:ring-2", "&:focus-within"));
        (0, vitest_1.it)("focus-visible:", () => expectContains("focus-visible:ring-2", "&:focus-visible"));
        (0, vitest_1.it)("first:", () => expectContains("first:mt-0", "&:first-child"));
        (0, vitest_1.it)("last:", () => expectContains("last:mb-0", "&:last-child"));
        (0, vitest_1.it)("odd:", () => expectContains("odd:bg-gray-100", "&:nth-child(odd)"));
        (0, vitest_1.it)("even:", () => expectContains("even:bg-white", "&:nth-child(even)"));
        (0, vitest_1.it)("group-hover:", () => expectContains("group-hover:text-white", ".group:hover &"));
    });
    (0, vitest_1.describe)("v4 variants", () => {
        (0, vitest_1.it)("has:", () => expectContains("has:bg-red-500", "&:has("));
        (0, vitest_1.it)("not:", () => expectContains("not:hidden", "&:not("));
        (0, vitest_1.it)("inert:", () => expectContains("inert:opacity-50", "&[inert]"));
        (0, vitest_1.it)("starting:", () => expectContains("starting:opacity-0", "@starting-style"));
        (0, vitest_1.it)("forced-colors:", () => expectContains("forced-colors:hidden", "forced-colors: active"));
    });
    (0, vitest_1.describe)("dark / print / motion", () => {
        (0, vitest_1.it)("dark:", () => expectContains("dark:text-white", "prefers-color-scheme: dark"));
        (0, vitest_1.it)("print:", () => expectContains("print:hidden", "@media print"));
        (0, vitest_1.it)("motion-reduce:", () => expectContains("motion-reduce:hidden", "prefers-reduced-motion: reduce"));
        (0, vitest_1.it)("motion-safe:", () => expectContains("motion-safe:flex", "prefers-reduced-motion: no-preference"));
    });
    (0, vitest_1.describe)("pseudo elements", () => {
        (0, vitest_1.it)("before:", () => expectContains("before:block", "&::before"));
        (0, vitest_1.it)("after:", () => expectContains("after:block", "&::after"));
        (0, vitest_1.it)("placeholder:", () => expectContains("placeholder:italic", "&::placeholder"));
        (0, vitest_1.it)("selection:", () => expectContains("selection:bg-blue-500", "&::selection"));
        (0, vitest_1.it)("marker:", () => expectContains("marker:text-red-500", "&::marker"));
        (0, vitest_1.it)("file:", () => expectContains("file:rounded", "&::file-selector-button"));
    });
    (0, vitest_1.describe)("stacked variants", () => {
        (0, vitest_1.it)("dark:hover:text-white", () => {
            const result = (0, tailwindToCss_1.tailwindClassToCss)("dark:hover:text-white");
            (0, vitest_1.expect)(result).not.toBeNull();
            (0, vitest_1.expect)(result).toContain("dark");
            (0, vitest_1.expect)(result).toContain("hover");
            expectContains("dark:hover:text-white", "color");
        });
        (0, vitest_1.it)("lg:hover:bg-blue-500", () => {
            const result = (0, tailwindToCss_1.tailwindClassToCss)("lg:hover:bg-blue-500");
            (0, vitest_1.expect)(result).not.toBeNull();
            (0, vitest_1.expect)(result).toContain("1024px");
            (0, vitest_1.expect)(result).toContain("hover");
        });
    });
    (0, vitest_1.describe)("variant + negative", () => {
        (0, vitest_1.it)("lg:-translate-x-4", () => {
            expectContains("lg:-translate-x-4", "1024px");
            expectContains("lg:-translate-x-4", "translateX");
        });
    });
    (0, vitest_1.describe)("variant + arbitrary", () => {
        (0, vitest_1.it)("hover:[color:red]", () => {
            expectContains("hover:[color:red]", "&:hover");
            expectContains("hover:[color:red]", "color: red");
        });
    });
});
// =====================================================================
// EXISTING UTILITIES (REGRESSION)
// =====================================================================
(0, vitest_1.describe)("existing utilities (regression)", () => {
    (0, vitest_1.it)("flex", () => expectResult("flex", "display: flex"));
    (0, vitest_1.it)("hidden", () => expectResult("hidden", "display: none"));
    (0, vitest_1.it)("block", () => expectResult("block", "display: block"));
    (0, vitest_1.it)("grid", () => expectResult("grid", "display: grid"));
    (0, vitest_1.it)("inline", () => expectResult("inline", "display: inline"));
    (0, vitest_1.it)("contents", () => expectResult("contents", "display: contents"));
    (0, vitest_1.it)("absolute", () => expectResult("absolute", "position: absolute"));
    (0, vitest_1.it)("relative", () => expectResult("relative", "position: relative"));
    (0, vitest_1.it)("fixed", () => expectResult("fixed", "position: fixed"));
    (0, vitest_1.it)("sticky", () => expectResult("sticky", "position: sticky"));
    (0, vitest_1.it)("flex-col", () => expectResult("flex-col", "flex-direction: column"));
    (0, vitest_1.it)("flex-row", () => expectResult("flex-row", "flex-direction: row"));
    (0, vitest_1.it)("items-center", () => expectResult("items-center", "align-items: center"));
    (0, vitest_1.it)("justify-between", () => expectResult("justify-between", "justify-content: space-between"));
    (0, vitest_1.it)("p-4", () => expectContains("p-4", "padding: 1rem"));
    (0, vitest_1.it)("mt-2", () => expectContains("mt-2", "margin-top: 0.5rem"));
    (0, vitest_1.it)("-mt-4", () => expectContains("-mt-4", "-1rem"));
    (0, vitest_1.it)("w-full", () => expectResult("w-full", "width: 100%"));
    (0, vitest_1.it)("h-screen", () => expectResult("h-screen", "height: 100vh"));
    (0, vitest_1.it)("text-center", () => expectResult("text-center", "text-align: center"));
    (0, vitest_1.it)("text-lg", () => expectContains("text-lg", "font-size"));
    (0, vitest_1.it)("font-bold", () => expectResult("font-bold", "font-weight: 700"));
    (0, vitest_1.it)("rounded-lg", () => expectResult("rounded-lg", "border-radius: 0.5rem"));
    (0, vitest_1.it)("shadow-md", () => expectContains("shadow-md", "box-shadow"));
    (0, vitest_1.it)("opacity-50", () => expectResult("opacity-50", "opacity: 0.5"));
    (0, vitest_1.it)("z-10", () => expectResult("z-10", "z-index: 10"));
    (0, vitest_1.it)("gap-4", () => expectContains("gap-4", "gap: 1rem"));
    (0, vitest_1.it)("cursor-pointer", () => expectResult("cursor-pointer", "cursor: pointer"));
    (0, vitest_1.it)("truncate", () => expectContains("truncate", "overflow: hidden"));
    (0, vitest_1.it)("underline", () => expectContains("underline", "underline"));
    (0, vitest_1.it)("uppercase", () => expectResult("uppercase", "text-transform: uppercase"));
    (0, vitest_1.it)("arbitrary [letter-spacing:3px]", () => expectResult("[letter-spacing:3px]", "letter-spacing: 3px"));
    (0, vitest_1.it)("duration-300", () => expectResult("duration-300", "transition-duration: 300ms"));
    (0, vitest_1.it)("delay-150", () => expectResult("delay-150", "transition-delay: 150ms"));
    (0, vitest_1.it)("rotate-45", () => expectContains("rotate-45", "rotate(45deg)"));
    (0, vitest_1.it)("scale-75", () => expectContains("scale-75", "scale(0.75)"));
    (0, vitest_1.it)("grid-cols-3", () => expectContains("grid-cols-3", "repeat(3"));
    (0, vitest_1.it)("col-span-2", () => expectContains("col-span-2", "span 2"));
    (0, vitest_1.it)("order-1", () => expectResult("order-1", "order: 1"));
});
// =====================================================================
// V4 RENAMES (both old + new names)
// =====================================================================
(0, vitest_1.describe)("v4 renames", () => {
    (0, vitest_1.describe)("gradients", () => {
        (0, vitest_1.it)("bg-gradient-to-r (v3)", () => expectContains("bg-gradient-to-r", "linear-gradient(to right"));
        (0, vitest_1.it)("bg-linear-to-r (v4)", () => expectContains("bg-linear-to-r", "linear-gradient(to right"));
        (0, vitest_1.it)("bg-gradient-to-t", () => expectContains("bg-gradient-to-t", "linear-gradient(to top"));
        (0, vitest_1.it)("bg-linear-to-t", () => expectContains("bg-linear-to-t", "linear-gradient(to top"));
        (0, vitest_1.it)("bg-gradient-to-b", () => expectContains("bg-gradient-to-b", "linear-gradient(to bottom"));
        (0, vitest_1.it)("bg-gradient-to-l", () => expectContains("bg-gradient-to-l", "linear-gradient(to left"));
        (0, vitest_1.it)("bg-gradient-to-br", () => expectContains("bg-gradient-to-br", "linear-gradient(to bottom right"));
        (0, vitest_1.it)("bg-gradient-to-tl", () => expectContains("bg-gradient-to-tl", "linear-gradient(to top left"));
        (0, vitest_1.it)("bg-gradient-to-tr", () => expectContains("bg-gradient-to-tr", "linear-gradient(to top right"));
        (0, vitest_1.it)("bg-gradient-to-bl", () => expectContains("bg-gradient-to-bl", "linear-gradient(to bottom left"));
        (0, vitest_1.it)("bg-radial (v4)", () => expectContains("bg-radial", "radial-gradient"));
        (0, vitest_1.it)("bg-conic (v4)", () => expectContains("bg-conic", "conic-gradient"));
    });
    (0, vitest_1.describe)("shadow scale", () => {
        (0, vitest_1.it)("shadow-xs", () => expectContains("shadow-xs", "box-shadow"));
        (0, vitest_1.it)("shadow-sm", () => expectContains("shadow-sm", "box-shadow"));
    });
});
// =====================================================================
// V4 NEW UTILITIES
// =====================================================================
(0, vitest_1.describe)("v4 new utilities", () => {
    (0, vitest_1.it)("text-balance", () => expectResult("text-balance", "text-wrap: balance"));
    (0, vitest_1.it)("text-pretty", () => expectResult("text-pretty", "text-wrap: pretty"));
    (0, vitest_1.it)("text-nowrap", () => expectResult("text-nowrap", "text-wrap: nowrap"));
    (0, vitest_1.it)("field-sizing-content", () => expectResult("field-sizing-content", "field-sizing: content"));
    (0, vitest_1.it)("field-sizing-fixed", () => expectResult("field-sizing-fixed", "field-sizing: fixed"));
    (0, vitest_1.it)("grid-cols-subgrid", () => expectResult("grid-cols-subgrid", "grid-template-columns: subgrid"));
    (0, vitest_1.it)("grid-rows-subgrid", () => expectResult("grid-rows-subgrid", "grid-template-rows: subgrid"));
    (0, vitest_1.it)("transform-3d", () => expectResult("transform-3d", "transform-style: preserve-3d"));
    (0, vitest_1.it)("transform-flat", () => expectResult("transform-flat", "transform-style: flat"));
    (0, vitest_1.it)("transform-gpu", () => expectContains("transform-gpu", "translate3d"));
    (0, vitest_1.it)("transform-cpu", () => expectContains("transform-cpu", "translateZ"));
    (0, vitest_1.it)("backface-visible", () => expectResult("backface-visible", "backface-visibility: visible"));
    (0, vitest_1.it)("backface-hidden", () => expectResult("backface-hidden", "backface-visibility: hidden"));
    (0, vitest_1.it)("forced-color-adjust-auto", () => expectResult("forced-color-adjust-auto", "forced-color-adjust: auto"));
    (0, vitest_1.it)("forced-color-adjust-none", () => expectResult("forced-color-adjust-none", "forced-color-adjust: none"));
});
// =====================================================================
// SIZE UTILITY (v4)
// =====================================================================
(0, vitest_1.describe)("size utility", () => {
    (0, vitest_1.it)("size-4", () => { expectContains("size-4", "width: 1rem"); expectContains("size-4", "height: 1rem"); });
    (0, vitest_1.it)("size-8", () => expectContains("size-8", "width: 2rem"));
    (0, vitest_1.it)("size-full", () => { expectContains("size-full", "width: 100%"); expectContains("size-full", "height: 100%"); });
    (0, vitest_1.it)("size-auto", () => expectContains("size-auto", "width: auto"));
    (0, vitest_1.it)("size-min", () => expectContains("size-min", "min-content"));
    (0, vitest_1.it)("size-max", () => expectContains("size-max", "max-content"));
    (0, vitest_1.it)("size-fit", () => expectContains("size-fit", "fit-content"));
    (0, vitest_1.it)("size-px", () => expectContains("size-px", "1px"));
    (0, vitest_1.it)("size-0", () => expectContains("size-0", "0px"));
    (0, vitest_1.it)("size-1/2", () => expectContains("size-1/2", "50%"));
});
// =====================================================================
// 3D TRANSFORMS (v4)
// =====================================================================
(0, vitest_1.describe)("3D transforms", () => {
    (0, vitest_1.it)("translate-z-4", () => expectContains("translate-z-4", "translateZ(1rem)"));
    (0, vitest_1.it)("translate-z-px", () => expectContains("translate-z-px", "translateZ(1px)"));
    (0, vitest_1.it)("-translate-z-4", () => expectContains("-translate-z-4", "translateZ(-1rem)"));
    (0, vitest_1.it)("rotate-x-45", () => expectContains("rotate-x-45", "rotateX(45deg)"));
    (0, vitest_1.it)("rotate-y-90", () => expectContains("rotate-y-90", "rotateY(90deg)"));
    (0, vitest_1.it)("rotate-z-180", () => expectContains("rotate-z-180", "rotateZ(180deg)"));
    (0, vitest_1.it)("perspective-500", () => expectContains("perspective-500", "perspective"));
    (0, vitest_1.it)("perspective-none", () => expectContains("perspective-none", "perspective: none"));
});
// =====================================================================
// COLORS (generic resolver)
// =====================================================================
(0, vitest_1.describe)("color utilities", () => {
    (0, vitest_1.it)("text-white", () => expectContains("text-white", "color: #ffffff"));
    (0, vitest_1.it)("text-black", () => expectContains("text-black", "color: #000000"));
    (0, vitest_1.it)("text-transparent", () => expectContains("text-transparent", "color: transparent"));
    (0, vitest_1.it)("text-current", () => expectContains("text-current", "color: currentColor"));
    (0, vitest_1.it)("bg-transparent", () => expectContains("bg-transparent", "background-color: transparent"));
    (0, vitest_1.it)("bg-white", () => expectContains("bg-white", "background-color: #ffffff"));
    (0, vitest_1.it)("text-red-500", () => expectContains("text-red-500", "color"));
    (0, vitest_1.it)("bg-blue-700", () => expectContains("bg-blue-700", "background-color"));
    (0, vitest_1.it)("border-green-300", () => expectContains("border-green-300", "border-color"));
    (0, vitest_1.describe)("new color prefixes", () => {
        (0, vitest_1.it)("ring-purple-500", () => expectResolved("ring-purple-500"));
        (0, vitest_1.it)("divide-gray-200", () => expectContains("divide-gray-200", "border-color"));
        (0, vitest_1.it)("accent-pink-500", () => expectContains("accent-pink-500", "accent-color"));
        (0, vitest_1.it)("caret-blue-500", () => expectContains("caret-blue-500", "caret-color"));
        (0, vitest_1.it)("decoration-red-500", () => expectContains("decoration-red-500", "text-decoration-color"));
        (0, vitest_1.it)("fill-current", () => expectContains("fill-current", "fill: currentColor"));
        (0, vitest_1.it)("fill-white", () => expectContains("fill-white", "fill"));
        (0, vitest_1.it)("stroke-current", () => expectContains("stroke-current", "stroke: currentColor"));
        (0, vitest_1.it)("stroke-black", () => expectContains("stroke-black", "stroke"));
    });
    (0, vitest_1.describe)("gradient stops", () => {
        (0, vitest_1.it)("from-red-500", () => expectContains("from-red-500", "--tw-gradient-from"));
        (0, vitest_1.it)("via-blue-500", () => expectContains("via-blue-500", "--tw-gradient-via"));
        (0, vitest_1.it)("to-green-500", () => expectContains("to-green-500", "--tw-gradient-to"));
        (0, vitest_1.it)("from-transparent", () => expectContains("from-transparent", "transparent"));
        (0, vitest_1.it)("from-white", () => expectContains("from-white", "#ffffff"));
        (0, vitest_1.it)("to-transparent", () => expectContains("to-transparent", "transparent"));
    });
});
// =====================================================================
// SLASH OPACITY
// =====================================================================
(0, vitest_1.describe)("opacity slash syntax", () => {
    (0, vitest_1.it)("bg-red-500/50", () => {
        const result = (0, tailwindToCss_1.tailwindClassToCss)("bg-red-500/50");
        (0, vitest_1.expect)(result).not.toBeNull();
        expectContains("bg-red-500/50", "background-color");
        expectContains("bg-red-500/50", "50%");
    });
    (0, vitest_1.it)("text-white/75", () => {
        expectContains("text-white/75", "color");
        expectContains("text-white/75", "75%");
    });
    (0, vitest_1.it)("border-black/10", () => {
        expectContains("border-black/10", "border-color");
        expectContains("border-black/10", "10%");
    });
});
// =====================================================================
// RING
// =====================================================================
(0, vitest_1.describe)("ring utilities", () => {
    (0, vitest_1.it)("ring", () => expectContains("ring", "box-shadow"));
    (0, vitest_1.it)("ring-0", () => expectContains("ring-0", "0px"));
    (0, vitest_1.it)("ring-1", () => expectContains("ring-1", "1px"));
    (0, vitest_1.it)("ring-2", () => expectContains("ring-2", "2px"));
    (0, vitest_1.it)("ring-4", () => expectContains("ring-4", "4px"));
    (0, vitest_1.it)("ring-8", () => expectContains("ring-8", "8px"));
    (0, vitest_1.it)("ring-inset", () => expectContains("ring-inset", "inset"));
    (0, vitest_1.it)("ring-offset-2", () => expectContains("ring-offset-2", "2px"));
    (0, vitest_1.it)("ring-offset-4", () => expectContains("ring-offset-4", "4px"));
});
// =====================================================================
// FILTERS
// =====================================================================
(0, vitest_1.describe)("filter utilities", () => {
    (0, vitest_1.it)("blur-none", () => expectContains("blur-none", "blur(0"));
    (0, vitest_1.it)("blur-sm", () => expectContains("blur-sm", "blur(4px)"));
    (0, vitest_1.it)("blur", () => expectContains("blur", "blur(8px)"));
    (0, vitest_1.it)("blur-md", () => expectContains("blur-md", "blur(12px)"));
    (0, vitest_1.it)("blur-lg", () => expectContains("blur-lg", "blur(16px)"));
    (0, vitest_1.it)("blur-xl", () => expectContains("blur-xl", "blur(24px)"));
    (0, vitest_1.it)("blur-2xl", () => expectContains("blur-2xl", "blur(40px)"));
    (0, vitest_1.it)("blur-3xl", () => expectContains("blur-3xl", "blur(64px)"));
    (0, vitest_1.it)("brightness-50", () => expectContains("brightness-50", "brightness(0.5)"));
    (0, vitest_1.it)("brightness-100", () => expectContains("brightness-100", "brightness(1)"));
    (0, vitest_1.it)("brightness-150", () => expectContains("brightness-150", "brightness(1.5)"));
    (0, vitest_1.it)("contrast-50", () => expectContains("contrast-50", "contrast(0.5)"));
    (0, vitest_1.it)("contrast-200", () => expectContains("contrast-200", "contrast(2)"));
    (0, vitest_1.it)("saturate-0", () => expectContains("saturate-0", "saturate(0)"));
    (0, vitest_1.it)("saturate-150", () => expectContains("saturate-150", "saturate(1.5)"));
    (0, vitest_1.it)("hue-rotate-15", () => expectContains("hue-rotate-15", "hue-rotate(15deg)"));
    (0, vitest_1.it)("hue-rotate-90", () => expectContains("hue-rotate-90", "hue-rotate(90deg)"));
    (0, vitest_1.it)("hue-rotate-180", () => expectContains("hue-rotate-180", "hue-rotate(180deg)"));
    (0, vitest_1.it)("grayscale", () => expectContains("grayscale", "grayscale(100%)"));
    (0, vitest_1.it)("grayscale-0", () => expectContains("grayscale-0", "grayscale(0)"));
    (0, vitest_1.it)("invert", () => expectContains("invert", "invert(100%)"));
    (0, vitest_1.it)("invert-0", () => expectContains("invert-0", "invert(0)"));
    (0, vitest_1.it)("sepia", () => expectContains("sepia", "sepia(100%)"));
    (0, vitest_1.it)("sepia-0", () => expectContains("sepia-0", "sepia(0)"));
    (0, vitest_1.it)("drop-shadow-sm", () => expectContains("drop-shadow-sm", "drop-shadow"));
    (0, vitest_1.it)("drop-shadow-md", () => expectContains("drop-shadow-md", "drop-shadow"));
    (0, vitest_1.it)("drop-shadow-lg", () => expectContains("drop-shadow-lg", "drop-shadow"));
    (0, vitest_1.it)("drop-shadow-xl", () => expectContains("drop-shadow-xl", "drop-shadow"));
    (0, vitest_1.it)("drop-shadow-none", () => expectContains("drop-shadow-none", "drop-shadow"));
});
// =====================================================================
// BACKDROP FILTERS
// =====================================================================
(0, vitest_1.describe)("backdrop filter utilities", () => {
    (0, vitest_1.it)("backdrop-blur-sm", () => expectContains("backdrop-blur-sm", "backdrop-filter: blur(4px)"));
    (0, vitest_1.it)("backdrop-blur-md", () => expectContains("backdrop-blur-md", "backdrop-filter: blur(12px)"));
    (0, vitest_1.it)("backdrop-brightness-50", () => expectContains("backdrop-brightness-50", "backdrop-filter: brightness(0.5)"));
    (0, vitest_1.it)("backdrop-contrast-125", () => expectContains("backdrop-contrast-125", "backdrop-filter: contrast(1.25)"));
    (0, vitest_1.it)("backdrop-saturate-150", () => expectContains("backdrop-saturate-150", "backdrop-filter: saturate(1.5)"));
    (0, vitest_1.it)("backdrop-hue-rotate-90", () => expectContains("backdrop-hue-rotate-90", "backdrop-filter: hue-rotate(90deg)"));
    (0, vitest_1.it)("backdrop-grayscale", () => expectContains("backdrop-grayscale", "backdrop-filter: grayscale(100%)"));
    (0, vitest_1.it)("backdrop-invert", () => expectContains("backdrop-invert", "backdrop-filter: invert(100%)"));
    (0, vitest_1.it)("backdrop-sepia", () => expectContains("backdrop-sepia", "backdrop-filter: sepia(100%)"));
    (0, vitest_1.it)("backdrop-opacity-50", () => expectContains("backdrop-opacity-50", "backdrop-filter: opacity(0.5)"));
});
// =====================================================================
// DIVIDE
// =====================================================================
(0, vitest_1.describe)("divide utilities", () => {
    (0, vitest_1.it)("divide-x", () => expectContains("divide-x", "border"));
    (0, vitest_1.it)("divide-y", () => expectContains("divide-y", "border"));
    (0, vitest_1.it)("divide-x-2", () => expectContains("divide-x-2", "2px"));
    (0, vitest_1.it)("divide-y-4", () => expectContains("divide-y-4", "4px"));
    (0, vitest_1.it)("divide-x-0", () => expectContains("divide-x-0", "0px"));
    (0, vitest_1.it)("divide-solid", () => expectContains("divide-solid", "border-style: solid"));
    (0, vitest_1.it)("divide-dashed", () => expectContains("divide-dashed", "border-style: dashed"));
    (0, vitest_1.it)("divide-dotted", () => expectContains("divide-dotted", "border-style: dotted"));
    (0, vitest_1.it)("divide-double", () => expectContains("divide-double", "border-style: double"));
    (0, vitest_1.it)("divide-none", () => expectContains("divide-none", "border-style: none"));
});
// =====================================================================
// TRANSLATE / SKEW
// =====================================================================
(0, vitest_1.describe)("translate and skew", () => {
    (0, vitest_1.it)("translate-x-4", () => expectContains("translate-x-4", "translateX(1rem)"));
    (0, vitest_1.it)("translate-y-2", () => expectContains("translate-y-2", "translateY(0.5rem)"));
    (0, vitest_1.it)("-translate-x-4", () => expectContains("-translate-x-4", "translateX(-1rem)"));
    (0, vitest_1.it)("translate-x-1/2", () => expectContains("translate-x-1/2", "translateX(50%)"));
    (0, vitest_1.it)("translate-x-full", () => expectContains("translate-x-full", "translateX(100%)"));
    (0, vitest_1.it)("translate-x-px", () => expectContains("translate-x-px", "translateX(1px)"));
    (0, vitest_1.it)("-translate-y-full", () => expectContains("-translate-y-full", "translateY(-100%)"));
    (0, vitest_1.it)("skew-x-3", () => expectContains("skew-x-3", "skewX(3deg)"));
    (0, vitest_1.it)("skew-y-6", () => expectContains("skew-y-6", "skewY(6deg)"));
    (0, vitest_1.it)("-skew-x-12", () => expectContains("-skew-x-12", "skewX(-12deg)"));
});
// =====================================================================
// LINE CLAMP
// =====================================================================
(0, vitest_1.describe)("line clamp", () => {
    (0, vitest_1.it)("line-clamp-1", () => expectContains("line-clamp-1", "-webkit-line-clamp: 1"));
    (0, vitest_1.it)("line-clamp-3", () => expectContains("line-clamp-3", "-webkit-line-clamp: 3"));
    (0, vitest_1.it)("line-clamp-6", () => expectContains("line-clamp-6", "-webkit-line-clamp: 6"));
    (0, vitest_1.it)("line-clamp-none", () => expectContains("line-clamp-none", "-webkit-line-clamp: unset"));
});
// =====================================================================
// SR-ONLY
// =====================================================================
(0, vitest_1.describe)("screen reader", () => {
    (0, vitest_1.it)("sr-only", () => {
        expectContains("sr-only", "position: absolute");
        expectContains("sr-only", "width: 1px");
        expectContains("sr-only", "height: 1px");
    });
    (0, vitest_1.it)("not-sr-only", () => expectContains("not-sr-only", "position: static"));
});
// =====================================================================
// TEXT UTILITIES
// =====================================================================
(0, vitest_1.describe)("text utilities", () => {
    (0, vitest_1.it)("text-ellipsis", () => expectResult("text-ellipsis", "text-overflow: ellipsis"));
    (0, vitest_1.it)("text-clip", () => expectResult("text-clip", "text-overflow: clip"));
    (0, vitest_1.it)("break-words", () => expectResult("break-words", "overflow-wrap: break-word"));
    (0, vitest_1.it)("break-all", () => expectResult("break-all", "word-break: break-all"));
    (0, vitest_1.it)("break-normal", () => expectContains("break-normal", "overflow-wrap: normal"));
    (0, vitest_1.it)("break-keep", () => expectResult("break-keep", "word-break: keep-all"));
});
// =====================================================================
// LIST STYLE
// =====================================================================
(0, vitest_1.describe)("list style", () => {
    (0, vitest_1.it)("list-none", () => expectResult("list-none", "list-style-type: none"));
    (0, vitest_1.it)("list-disc", () => expectResult("list-disc", "list-style-type: disc"));
    (0, vitest_1.it)("list-decimal", () => expectResult("list-decimal", "list-style-type: decimal"));
    (0, vitest_1.it)("list-inside", () => expectResult("list-inside", "list-style-position: inside"));
    (0, vitest_1.it)("list-outside", () => expectResult("list-outside", "list-style-position: outside"));
});
// =====================================================================
// OUTLINE
// =====================================================================
(0, vitest_1.describe)("outline", () => {
    (0, vitest_1.it)("outline", () => expectContains("outline", "outline-style: solid"));
    (0, vitest_1.it)("outline-none", () => expectContains("outline-none", "outline"));
    (0, vitest_1.it)("outline-dashed", () => expectResult("outline-dashed", "outline-style: dashed"));
    (0, vitest_1.it)("outline-dotted", () => expectResult("outline-dotted", "outline-style: dotted"));
    (0, vitest_1.it)("outline-double", () => expectResult("outline-double", "outline-style: double"));
    (0, vitest_1.it)("outline-1", () => expectContains("outline-1", "outline-width: 1px"));
    (0, vitest_1.it)("outline-2", () => expectContains("outline-2", "outline-width: 2px"));
    (0, vitest_1.it)("outline-4", () => expectContains("outline-4", "outline-width: 4px"));
    (0, vitest_1.it)("outline-offset-2", () => expectContains("outline-offset-2", "outline-offset: 2px"));
    (0, vitest_1.it)("outline-offset-4", () => expectContains("outline-offset-4", "outline-offset: 4px"));
});
// =====================================================================
// COLUMNS / INDENT
// =====================================================================
(0, vitest_1.describe)("columns and indent", () => {
    (0, vitest_1.it)("columns-1", () => expectContains("columns-1", "columns: 1"));
    (0, vitest_1.it)("columns-3", () => expectContains("columns-3", "columns: 3"));
    (0, vitest_1.it)("columns-auto", () => expectContains("columns-auto", "columns: auto"));
    (0, vitest_1.it)("indent-4", () => expectContains("indent-4", "text-indent: 1rem"));
    (0, vitest_1.it)("indent-8", () => expectContains("indent-8", "text-indent: 2rem"));
    (0, vitest_1.it)("indent-px", () => expectContains("indent-px", "text-indent: 1px"));
    (0, vitest_1.it)("-indent-4", () => expectContains("-indent-4", "text-indent: -1rem"));
});
// =====================================================================
// DECORATION
// =====================================================================
(0, vitest_1.describe)("text decoration", () => {
    (0, vitest_1.it)("underline-offset-auto", () => expectContains("underline-offset-auto", "text-underline-offset: auto"));
    (0, vitest_1.it)("underline-offset-2", () => expectContains("underline-offset-2", "text-underline-offset: 2px"));
    (0, vitest_1.it)("underline-offset-4", () => expectContains("underline-offset-4", "text-underline-offset: 4px"));
    (0, vitest_1.it)("decoration-solid", () => expectContains("decoration-solid", "text-decoration-style: solid"));
    (0, vitest_1.it)("decoration-dashed", () => expectContains("decoration-dashed", "text-decoration-style: dashed"));
    (0, vitest_1.it)("decoration-wavy", () => expectContains("decoration-wavy", "text-decoration-style: wavy"));
    (0, vitest_1.it)("decoration-dotted", () => expectContains("decoration-dotted", "text-decoration-style: dotted"));
    (0, vitest_1.it)("decoration-double", () => expectContains("decoration-double", "text-decoration-style: double"));
    (0, vitest_1.it)("decoration-1", () => expectContains("decoration-1", "text-decoration-thickness: 1px"));
    (0, vitest_1.it)("decoration-2", () => expectContains("decoration-2", "text-decoration-thickness: 2px"));
    (0, vitest_1.it)("decoration-auto", () => expectContains("decoration-auto", "text-decoration-thickness: auto"));
    (0, vitest_1.it)("decoration-from-font", () => expectContains("decoration-from-font", "text-decoration-thickness: from-font"));
});
// =====================================================================
// WILL CHANGE / TOUCH / APPEARANCE
// =====================================================================
(0, vitest_1.describe)("interactivity", () => {
    (0, vitest_1.it)("will-change-auto", () => expectResult("will-change-auto", "will-change: auto"));
    (0, vitest_1.it)("will-change-scroll", () => expectResult("will-change-scroll", "will-change: scroll-position"));
    (0, vitest_1.it)("will-change-contents", () => expectResult("will-change-contents", "will-change: contents"));
    (0, vitest_1.it)("will-change-transform", () => expectResult("will-change-transform", "will-change: transform"));
    (0, vitest_1.it)("touch-auto", () => expectResult("touch-auto", "touch-action: auto"));
    (0, vitest_1.it)("touch-none", () => expectResult("touch-none", "touch-action: none"));
    (0, vitest_1.it)("touch-pan-x", () => expectResult("touch-pan-x", "touch-action: pan-x"));
    (0, vitest_1.it)("touch-pan-y", () => expectResult("touch-pan-y", "touch-action: pan-y"));
    (0, vitest_1.it)("touch-manipulation", () => expectResult("touch-manipulation", "touch-action: manipulation"));
    (0, vitest_1.it)("touch-pinch-zoom", () => expectResult("touch-pinch-zoom", "touch-action: pinch-zoom"));
    (0, vitest_1.it)("appearance-none", () => expectResult("appearance-none", "appearance: none"));
    (0, vitest_1.it)("appearance-auto", () => expectResult("appearance-auto", "appearance: auto"));
});
// =====================================================================
// MIX BLEND / VERTICAL ALIGN
// =====================================================================
(0, vitest_1.describe)("mix blend and vertical align", () => {
    (0, vitest_1.it)("mix-blend-normal", () => expectResult("mix-blend-normal", "mix-blend-mode: normal"));
    (0, vitest_1.it)("mix-blend-multiply", () => expectResult("mix-blend-multiply", "mix-blend-mode: multiply"));
    (0, vitest_1.it)("mix-blend-screen", () => expectResult("mix-blend-screen", "mix-blend-mode: screen"));
    (0, vitest_1.it)("mix-blend-overlay", () => expectResult("mix-blend-overlay", "mix-blend-mode: overlay"));
    (0, vitest_1.it)("mix-blend-darken", () => expectResult("mix-blend-darken", "mix-blend-mode: darken"));
    (0, vitest_1.it)("mix-blend-lighten", () => expectResult("mix-blend-lighten", "mix-blend-mode: lighten"));
    (0, vitest_1.it)("mix-blend-color-dodge", () => expectResult("mix-blend-color-dodge", "mix-blend-mode: color-dodge"));
    (0, vitest_1.it)("mix-blend-color-burn", () => expectResult("mix-blend-color-burn", "mix-blend-mode: color-burn"));
    (0, vitest_1.it)("mix-blend-hard-light", () => expectResult("mix-blend-hard-light", "mix-blend-mode: hard-light"));
    (0, vitest_1.it)("mix-blend-soft-light", () => expectResult("mix-blend-soft-light", "mix-blend-mode: soft-light"));
    (0, vitest_1.it)("mix-blend-difference", () => expectResult("mix-blend-difference", "mix-blend-mode: difference"));
    (0, vitest_1.it)("mix-blend-exclusion", () => expectResult("mix-blend-exclusion", "mix-blend-mode: exclusion"));
    (0, vitest_1.it)("mix-blend-hue", () => expectResult("mix-blend-hue", "mix-blend-mode: hue"));
    (0, vitest_1.it)("mix-blend-saturation", () => expectResult("mix-blend-saturation", "mix-blend-mode: saturation"));
    (0, vitest_1.it)("mix-blend-color", () => expectResult("mix-blend-color", "mix-blend-mode: color"));
    (0, vitest_1.it)("mix-blend-luminosity", () => expectResult("mix-blend-luminosity", "mix-blend-mode: luminosity"));
    (0, vitest_1.it)("align-baseline", () => expectResult("align-baseline", "vertical-align: baseline"));
    (0, vitest_1.it)("align-top", () => expectResult("align-top", "vertical-align: top"));
    (0, vitest_1.it)("align-middle", () => expectResult("align-middle", "vertical-align: middle"));
    (0, vitest_1.it)("align-bottom", () => expectResult("align-bottom", "vertical-align: bottom"));
    (0, vitest_1.it)("align-text-top", () => expectResult("align-text-top", "vertical-align: text-top"));
    (0, vitest_1.it)("align-text-bottom", () => expectResult("align-text-bottom", "vertical-align: text-bottom"));
    (0, vitest_1.it)("align-sub", () => expectResult("align-sub", "vertical-align: sub"));
    (0, vitest_1.it)("align-super", () => expectResult("align-super", "vertical-align: super"));
});
// =====================================================================
// SNAP / SCROLL
// =====================================================================
(0, vitest_1.describe)("scroll snap and scroll spacing", () => {
    (0, vitest_1.it)("snap-start", () => expectResult("snap-start", "scroll-snap-align: start"));
    (0, vitest_1.it)("snap-end", () => expectResult("snap-end", "scroll-snap-align: end"));
    (0, vitest_1.it)("snap-center", () => expectResult("snap-center", "scroll-snap-align: center"));
    (0, vitest_1.it)("snap-align-none", () => expectResult("snap-align-none", "scroll-snap-align: none"));
    (0, vitest_1.it)("snap-none", () => expectResult("snap-none", "scroll-snap-type: none"));
    (0, vitest_1.it)("snap-x", () => expectContains("snap-x", "scroll-snap-type"));
    (0, vitest_1.it)("snap-y", () => expectContains("snap-y", "scroll-snap-type"));
    (0, vitest_1.it)("snap-both", () => expectContains("snap-both", "scroll-snap-type"));
    (0, vitest_1.it)("snap-mandatory", () => expectContains("snap-mandatory", "mandatory"));
    (0, vitest_1.it)("snap-proximity", () => expectContains("snap-proximity", "proximity"));
    (0, vitest_1.it)("snap-normal", () => expectContains("snap-normal", "scroll-snap-stop: normal"));
    (0, vitest_1.it)("snap-always", () => expectContains("snap-always", "scroll-snap-stop: always"));
    (0, vitest_1.it)("scroll-mt-4", () => expectContains("scroll-mt-4", "scroll-margin-top: 1rem"));
    (0, vitest_1.it)("scroll-pb-2", () => expectContains("scroll-pb-2", "scroll-padding-bottom: 0.5rem"));
    (0, vitest_1.it)("scroll-px-8", () => expectContains("scroll-px-8", "scroll-padding"));
});
// =====================================================================
// BG UTILITIES
// =====================================================================
(0, vitest_1.describe)("background utilities", () => {
    (0, vitest_1.it)("bg-fixed", () => expectResult("bg-fixed", "background-attachment: fixed"));
    (0, vitest_1.it)("bg-local", () => expectResult("bg-local", "background-attachment: local"));
    (0, vitest_1.it)("bg-scroll", () => expectResult("bg-scroll", "background-attachment: scroll"));
    (0, vitest_1.it)("bg-cover", () => expectResult("bg-cover", "background-size: cover"));
    (0, vitest_1.it)("bg-contain", () => expectResult("bg-contain", "background-size: contain"));
    (0, vitest_1.it)("bg-center", () => expectResult("bg-center", "background-position: center"));
    (0, vitest_1.it)("bg-top", () => expectResult("bg-top", "background-position: top"));
    (0, vitest_1.it)("bg-bottom", () => expectResult("bg-bottom", "background-position: bottom"));
    (0, vitest_1.it)("bg-left", () => expectResult("bg-left", "background-position: left"));
    (0, vitest_1.it)("bg-right", () => expectResult("bg-right", "background-position: right"));
    (0, vitest_1.it)("bg-no-repeat", () => expectResult("bg-no-repeat", "background-repeat: no-repeat"));
    (0, vitest_1.it)("bg-repeat", () => expectResult("bg-repeat", "background-repeat: repeat"));
    (0, vitest_1.it)("bg-repeat-x", () => expectResult("bg-repeat-x", "background-repeat: repeat-x"));
    (0, vitest_1.it)("bg-repeat-y", () => expectResult("bg-repeat-y", "background-repeat: repeat-y"));
});
// =====================================================================
// ANIMATE
// =====================================================================
(0, vitest_1.describe)("animation", () => {
    (0, vitest_1.it)("animate-spin", () => expectContains("animate-spin", "animation"));
    (0, vitest_1.it)("animate-ping", () => expectContains("animate-ping", "animation"));
    (0, vitest_1.it)("animate-pulse", () => expectContains("animate-pulse", "animation"));
    (0, vitest_1.it)("animate-bounce", () => expectContains("animate-bounce", "animation"));
    (0, vitest_1.it)("animate-none", () => expectResult("animate-none", "animation: none"));
});
// =====================================================================
// PLACE UTILITIES
// =====================================================================
(0, vitest_1.describe)("place utilities", () => {
    (0, vitest_1.it)("place-content-center", () => expectResult("place-content-center", "place-content: center"));
    (0, vitest_1.it)("place-content-start", () => expectResult("place-content-start", "place-content: start"));
    (0, vitest_1.it)("place-content-end", () => expectResult("place-content-end", "place-content: end"));
    (0, vitest_1.it)("place-content-between", () => expectResult("place-content-between", "place-content: space-between"));
    (0, vitest_1.it)("place-content-around", () => expectResult("place-content-around", "place-content: space-around"));
    (0, vitest_1.it)("place-content-evenly", () => expectResult("place-content-evenly", "place-content: space-evenly"));
    (0, vitest_1.it)("place-content-stretch", () => expectResult("place-content-stretch", "place-content: stretch"));
    (0, vitest_1.it)("place-items-center", () => expectResult("place-items-center", "place-items: center"));
    (0, vitest_1.it)("place-items-start", () => expectResult("place-items-start", "place-items: start"));
    (0, vitest_1.it)("place-items-end", () => expectResult("place-items-end", "place-items: end"));
    (0, vitest_1.it)("place-items-stretch", () => expectResult("place-items-stretch", "place-items: stretch"));
    (0, vitest_1.it)("place-self-center", () => expectResult("place-self-center", "place-self: center"));
    (0, vitest_1.it)("place-self-auto", () => expectResult("place-self-auto", "place-self: auto"));
    (0, vitest_1.it)("place-self-start", () => expectResult("place-self-start", "place-self: start"));
    (0, vitest_1.it)("place-self-end", () => expectResult("place-self-end", "place-self: end"));
    (0, vitest_1.it)("place-self-stretch", () => expectResult("place-self-stretch", "place-self: stretch"));
});
// =====================================================================
// OVERSCROLL
// =====================================================================
(0, vitest_1.describe)("overscroll", () => {
    (0, vitest_1.it)("overscroll-auto", () => expectResult("overscroll-auto", "overscroll-behavior: auto"));
    (0, vitest_1.it)("overscroll-contain", () => expectResult("overscroll-contain", "overscroll-behavior: contain"));
    (0, vitest_1.it)("overscroll-none", () => expectResult("overscroll-none", "overscroll-behavior: none"));
    (0, vitest_1.it)("overscroll-x-auto", () => expectResult("overscroll-x-auto", "overscroll-behavior-x: auto"));
    (0, vitest_1.it)("overscroll-x-contain", () => expectResult("overscroll-x-contain", "overscroll-behavior-x: contain"));
    (0, vitest_1.it)("overscroll-x-none", () => expectResult("overscroll-x-none", "overscroll-behavior-x: none"));
    (0, vitest_1.it)("overscroll-y-auto", () => expectResult("overscroll-y-auto", "overscroll-behavior-y: auto"));
    (0, vitest_1.it)("overscroll-y-contain", () => expectResult("overscroll-y-contain", "overscroll-behavior-y: contain"));
    (0, vitest_1.it)("overscroll-y-none", () => expectResult("overscroll-y-none", "overscroll-behavior-y: none"));
});
// =====================================================================
// FLEX BASIS
// =====================================================================
(0, vitest_1.describe)("flex basis", () => {
    (0, vitest_1.it)("basis-0", () => expectContains("basis-0", "flex-basis: 0px"));
    (0, vitest_1.it)("basis-4", () => expectContains("basis-4", "flex-basis: 1rem"));
    (0, vitest_1.it)("basis-full", () => expectContains("basis-full", "flex-basis: 100%"));
    (0, vitest_1.it)("basis-auto", () => expectContains("basis-auto", "flex-basis: auto"));
    (0, vitest_1.it)("basis-1/2", () => expectContains("basis-1/2", "flex-basis: 50%"));
    (0, vitest_1.it)("basis-1/3", () => {
        const result = (0, tailwindToCss_1.tailwindClassToCss)("basis-1/3");
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result).toContain("flex-basis");
        (0, vitest_1.expect)(result).toContain("33.3333");
    });
    (0, vitest_1.it)("basis-px", () => expectContains("basis-px", "flex-basis: 1px"));
});
// =====================================================================
// CONTAINER
// =====================================================================
(0, vitest_1.describe)("container", () => {
    (0, vitest_1.it)("container", () => expectContains("container", "width: 100%"));
});
// =====================================================================
// ISOLATION / BOX DECORATION / MISC
// =====================================================================
(0, vitest_1.describe)("miscellaneous", () => {
    (0, vitest_1.it)("isolate", () => expectResult("isolate", "isolation: isolate"));
    (0, vitest_1.it)("isolation-auto", () => expectResult("isolation-auto", "isolation: auto"));
    (0, vitest_1.it)("box-decoration-clone", () => expectResult("box-decoration-clone", "box-decoration-break: clone"));
    (0, vitest_1.it)("box-decoration-slice", () => expectResult("box-decoration-slice", "box-decoration-break: slice"));
});
//# sourceMappingURL=tailwindToCss.test.js.map