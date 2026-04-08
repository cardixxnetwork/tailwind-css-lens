import { describe, it, expect } from "vitest";
import { tailwindClassToCss } from "../tailwindToCss";

// Helper: assert result is not null and contains a substring
function expectContains(input: string, substring: string) {
  const result = tailwindClassToCss(input);
  expect(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
  expect(result!.toLowerCase()).toContain(substring.toLowerCase());
}

// Helper: assert exact match
function expectResult(input: string, expected: string) {
  const result = tailwindClassToCss(input);
  expect(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
  expect(result).toBe(expected);
}

// Helper: assert not null (just resolved to something)
function expectResolved(input: string) {
  const result = tailwindClassToCss(input);
  expect(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
}

// =====================================================================
// VARIANT PREFIXES
// =====================================================================
describe("variant prefixes", () => {
  describe("responsive", () => {
    it("sm:flex", () => {
      expectContains("sm:flex", "@media (min-width: 640px)");
      expectContains("sm:flex", "display: flex");
    });
    it("md:hidden", () => {
      expectContains("md:hidden", "@media (min-width: 768px)");
      expectContains("md:hidden", "display: none");
    });
    it("lg:hidden", () => {
      expectContains("lg:hidden", "@media (min-width: 1024px)");
      expectContains("lg:hidden", "display: none");
    });
    it("xl:block", () => {
      expectContains("xl:block", "@media (min-width: 1280px)");
      expectContains("xl:block", "display: block");
    });
    it("2xl:grid", () => {
      expectContains("2xl:grid", "@media (min-width: 1536px)");
      expectContains("2xl:grid", "display: grid");
    });
  });

  describe("container queries (v4)", () => {
    it("@sm:flex", () => {
      expectContains("@sm:flex", "@container");
      expectContains("@sm:flex", "display: flex");
    });
    it("@lg:hidden", () => {
      expectContains("@lg:hidden", "@container");
      expectContains("@lg:hidden", "display: none");
    });
  });

  describe("state variants", () => {
    it("hover:", () => expectContains("hover:underline", "&:hover"));
    it("focus:", () => expectContains("focus:ring-2", "&:focus"));
    it("active:", () => expectContains("active:bg-blue-700", "&:active"));
    it("disabled:", () => expectContains("disabled:opacity-50", "&:disabled"));
    it("focus-within:", () => expectContains("focus-within:ring-2", "&:focus-within"));
    it("focus-visible:", () => expectContains("focus-visible:ring-2", "&:focus-visible"));
    it("first:", () => expectContains("first:mt-0", "&:first-child"));
    it("last:", () => expectContains("last:mb-0", "&:last-child"));
    it("odd:", () => expectContains("odd:bg-gray-100", "&:nth-child(odd)"));
    it("even:", () => expectContains("even:bg-white", "&:nth-child(even)"));
    it("group-hover:", () => expectContains("group-hover:text-white", ".group:hover &"));
  });

  describe("v4 variants", () => {
    it("has:", () => expectContains("has:bg-red-500", "&:has("));
    it("not:", () => expectContains("not:hidden", "&:not("));
    it("inert:", () => expectContains("inert:opacity-50", "&[inert]"));
    it("starting:", () => expectContains("starting:opacity-0", "@starting-style"));
    it("forced-colors:", () => expectContains("forced-colors:hidden", "forced-colors: active"));
  });

  describe("dark / print / motion", () => {
    it("dark:", () => expectContains("dark:text-white", "prefers-color-scheme: dark"));
    it("print:", () => expectContains("print:hidden", "@media print"));
    it("motion-reduce:", () => expectContains("motion-reduce:hidden", "prefers-reduced-motion: reduce"));
    it("motion-safe:", () => expectContains("motion-safe:flex", "prefers-reduced-motion: no-preference"));
  });

  describe("pseudo elements", () => {
    it("before:", () => expectContains("before:block", "&::before"));
    it("after:", () => expectContains("after:block", "&::after"));
    it("placeholder:", () => expectContains("placeholder:italic", "&::placeholder"));
    it("selection:", () => expectContains("selection:bg-blue-500", "&::selection"));
    it("marker:", () => expectContains("marker:text-red-500", "&::marker"));
    it("file:", () => expectContains("file:rounded", "&::file-selector-button"));
  });

  describe("stacked variants", () => {
    it("dark:hover:text-white", () => {
      const result = tailwindClassToCss("dark:hover:text-white");
      expect(result).not.toBeNull();
      expect(result!).toContain("dark");
      expect(result!).toContain("hover");
      expectContains("dark:hover:text-white", "color");
    });
    it("lg:hover:bg-blue-500", () => {
      const result = tailwindClassToCss("lg:hover:bg-blue-500");
      expect(result).not.toBeNull();
      expect(result!).toContain("1024px");
      expect(result!).toContain("hover");
    });
  });

  describe("variant + negative", () => {
    it("lg:-translate-x-4", () => {
      expectContains("lg:-translate-x-4", "1024px");
      expectContains("lg:-translate-x-4", "translateX");
    });
  });

  describe("variant + arbitrary", () => {
    it("hover:[color:red]", () => {
      expectContains("hover:[color:red]", "&:hover");
      expectContains("hover:[color:red]", "color: red");
    });
  });
});

// =====================================================================
// EXISTING UTILITIES (REGRESSION)
// =====================================================================
describe("existing utilities (regression)", () => {
  it("flex", () => expectResult("flex", "display: flex"));
  it("hidden", () => expectResult("hidden", "display: none"));
  it("block", () => expectResult("block", "display: block"));
  it("grid", () => expectResult("grid", "display: grid"));
  it("inline", () => expectResult("inline", "display: inline"));
  it("contents", () => expectResult("contents", "display: contents"));
  it("absolute", () => expectResult("absolute", "position: absolute"));
  it("relative", () => expectResult("relative", "position: relative"));
  it("fixed", () => expectResult("fixed", "position: fixed"));
  it("sticky", () => expectResult("sticky", "position: sticky"));
  it("flex-col", () => expectResult("flex-col", "flex-direction: column"));
  it("flex-row", () => expectResult("flex-row", "flex-direction: row"));
  it("items-center", () => expectResult("items-center", "align-items: center"));
  it("justify-between", () => expectResult("justify-between", "justify-content: space-between"));
  it("p-4", () => expectContains("p-4", "padding: 1rem"));
  it("mt-2", () => expectContains("mt-2", "margin-top: 0.5rem"));
  it("-mt-4", () => expectContains("-mt-4", "-1rem"));
  it("w-full", () => expectResult("w-full", "width: 100%"));
  it("h-screen", () => expectResult("h-screen", "height: 100vh"));
  it("text-center", () => expectResult("text-center", "text-align: center"));
  it("text-lg", () => expectContains("text-lg", "font-size"));
  it("font-bold", () => expectResult("font-bold", "font-weight: 700"));
  it("rounded-lg", () => expectResult("rounded-lg", "border-radius: 0.5rem"));
  it("shadow-md", () => expectContains("shadow-md", "box-shadow"));
  it("opacity-50", () => expectResult("opacity-50", "opacity: 0.5"));
  it("z-10", () => expectResult("z-10", "z-index: 10"));
  it("gap-4", () => expectContains("gap-4", "gap: 1rem"));
  it("cursor-pointer", () => expectResult("cursor-pointer", "cursor: pointer"));
  it("truncate", () => expectContains("truncate", "overflow: hidden"));
  it("underline", () => expectContains("underline", "underline"));
  it("uppercase", () => expectResult("uppercase", "text-transform: uppercase"));
  it("arbitrary [letter-spacing:3px]", () => expectResult("[letter-spacing:3px]", "letter-spacing: 3px"));
  it("duration-300", () => expectResult("duration-300", "transition-duration: 300ms"));
  it("delay-150", () => expectResult("delay-150", "transition-delay: 150ms"));
  it("rotate-45", () => expectContains("rotate-45", "rotate(45deg)"));
  it("scale-75", () => expectContains("scale-75", "scale(0.75)"));
  it("grid-cols-3", () => expectContains("grid-cols-3", "repeat(3"));
  it("col-span-2", () => expectContains("col-span-2", "span 2"));
  it("order-1", () => expectResult("order-1", "order: 1"));
});

// =====================================================================
// V4 RENAMES (both old + new names)
// =====================================================================
describe("v4 renames", () => {
  describe("gradients", () => {
    it("bg-gradient-to-r (v3)", () => expectContains("bg-gradient-to-r", "linear-gradient(to right"));
    it("bg-linear-to-r (v4)", () => expectContains("bg-linear-to-r", "linear-gradient(to right"));
    it("bg-gradient-to-t", () => expectContains("bg-gradient-to-t", "linear-gradient(to top"));
    it("bg-linear-to-t", () => expectContains("bg-linear-to-t", "linear-gradient(to top"));
    it("bg-gradient-to-b", () => expectContains("bg-gradient-to-b", "linear-gradient(to bottom"));
    it("bg-gradient-to-l", () => expectContains("bg-gradient-to-l", "linear-gradient(to left"));
    it("bg-gradient-to-br", () => expectContains("bg-gradient-to-br", "linear-gradient(to bottom right"));
    it("bg-gradient-to-tl", () => expectContains("bg-gradient-to-tl", "linear-gradient(to top left"));
    it("bg-gradient-to-tr", () => expectContains("bg-gradient-to-tr", "linear-gradient(to top right"));
    it("bg-gradient-to-bl", () => expectContains("bg-gradient-to-bl", "linear-gradient(to bottom left"));
    it("bg-radial (v4)", () => expectContains("bg-radial", "radial-gradient"));
    it("bg-conic (v4)", () => expectContains("bg-conic", "conic-gradient"));
  });

  describe("shadow scale", () => {
    it("shadow-xs", () => expectContains("shadow-xs", "box-shadow"));
    it("shadow-sm", () => expectContains("shadow-sm", "box-shadow"));
  });
});

// =====================================================================
// V4 NEW UTILITIES
// =====================================================================
describe("v4 new utilities", () => {
  it("text-balance", () => expectResult("text-balance", "text-wrap: balance"));
  it("text-pretty", () => expectResult("text-pretty", "text-wrap: pretty"));
  it("text-nowrap", () => expectResult("text-nowrap", "text-wrap: nowrap"));
  it("field-sizing-content", () => expectResult("field-sizing-content", "field-sizing: content"));
  it("field-sizing-fixed", () => expectResult("field-sizing-fixed", "field-sizing: fixed"));
  it("grid-cols-subgrid", () => expectResult("grid-cols-subgrid", "grid-template-columns: subgrid"));
  it("grid-rows-subgrid", () => expectResult("grid-rows-subgrid", "grid-template-rows: subgrid"));
  it("transform-3d", () => expectResult("transform-3d", "transform-style: preserve-3d"));
  it("transform-flat", () => expectResult("transform-flat", "transform-style: flat"));
  it("transform-gpu", () => expectContains("transform-gpu", "translate3d"));
  it("transform-cpu", () => expectContains("transform-cpu", "translateZ"));
  it("backface-visible", () => expectResult("backface-visible", "backface-visibility: visible"));
  it("backface-hidden", () => expectResult("backface-hidden", "backface-visibility: hidden"));
  it("forced-color-adjust-auto", () => expectResult("forced-color-adjust-auto", "forced-color-adjust: auto"));
  it("forced-color-adjust-none", () => expectResult("forced-color-adjust-none", "forced-color-adjust: none"));
});

// =====================================================================
// SIZE UTILITY (v4)
// =====================================================================
describe("size utility", () => {
  it("size-4", () => { expectContains("size-4", "width: 1rem"); expectContains("size-4", "height: 1rem"); });
  it("size-8", () => expectContains("size-8", "width: 2rem"));
  it("size-full", () => { expectContains("size-full", "width: 100%"); expectContains("size-full", "height: 100%"); });
  it("size-auto", () => expectContains("size-auto", "width: auto"));
  it("size-min", () => expectContains("size-min", "min-content"));
  it("size-max", () => expectContains("size-max", "max-content"));
  it("size-fit", () => expectContains("size-fit", "fit-content"));
  it("size-px", () => expectContains("size-px", "1px"));
  it("size-0", () => expectContains("size-0", "0px"));
  it("size-1/2", () => expectContains("size-1/2", "50%"));
});

// =====================================================================
// 3D TRANSFORMS (v4)
// =====================================================================
describe("3D transforms", () => {
  it("translate-z-4", () => expectContains("translate-z-4", "translateZ(1rem)"));
  it("translate-z-px", () => expectContains("translate-z-px", "translateZ(1px)"));
  it("-translate-z-4", () => expectContains("-translate-z-4", "translateZ(-1rem)"));
  it("rotate-x-45", () => expectContains("rotate-x-45", "rotateX(45deg)"));
  it("rotate-y-90", () => expectContains("rotate-y-90", "rotateY(90deg)"));
  it("rotate-z-180", () => expectContains("rotate-z-180", "rotateZ(180deg)"));
  it("perspective-500", () => expectContains("perspective-500", "perspective"));
  it("perspective-none", () => expectContains("perspective-none", "perspective: none"));
});

// =====================================================================
// COLORS (generic resolver)
// =====================================================================
describe("color utilities", () => {
  it("text-white", () => expectContains("text-white", "color: #ffffff"));
  it("text-black", () => expectContains("text-black", "color: #000000"));
  it("text-transparent", () => expectContains("text-transparent", "color: transparent"));
  it("text-current", () => expectContains("text-current", "color: currentColor"));
  it("bg-transparent", () => expectContains("bg-transparent", "background-color: transparent"));
  it("bg-white", () => expectContains("bg-white", "background-color: #ffffff"));
  it("text-red-500", () => expectContains("text-red-500", "color"));
  it("bg-blue-700", () => expectContains("bg-blue-700", "background-color"));
  it("border-green-300", () => expectContains("border-green-300", "border-color"));

  describe("new color prefixes", () => {
    it("ring-purple-500", () => expectResolved("ring-purple-500"));
    it("divide-gray-200", () => expectContains("divide-gray-200", "border-color"));
    it("accent-pink-500", () => expectContains("accent-pink-500", "accent-color"));
    it("caret-blue-500", () => expectContains("caret-blue-500", "caret-color"));
    it("decoration-red-500", () => expectContains("decoration-red-500", "text-decoration-color"));
    it("fill-current", () => expectContains("fill-current", "fill: currentColor"));
    it("fill-white", () => expectContains("fill-white", "fill"));
    it("stroke-current", () => expectContains("stroke-current", "stroke: currentColor"));
    it("stroke-black", () => expectContains("stroke-black", "stroke"));
  });

  describe("gradient stops", () => {
    it("from-red-500", () => expectContains("from-red-500", "--tw-gradient-from"));
    it("via-blue-500", () => expectContains("via-blue-500", "--tw-gradient-via"));
    it("to-green-500", () => expectContains("to-green-500", "--tw-gradient-to"));
    it("from-transparent", () => expectContains("from-transparent", "transparent"));
    it("from-white", () => expectContains("from-white", "#ffffff"));
    it("to-transparent", () => expectContains("to-transparent", "transparent"));
  });
});

// =====================================================================
// SLASH OPACITY
// =====================================================================
describe("opacity slash syntax", () => {
  it("bg-red-500/50", () => {
    const result = tailwindClassToCss("bg-red-500/50");
    expect(result).not.toBeNull();
    expectContains("bg-red-500/50", "background-color");
    expectContains("bg-red-500/50", "50%");
  });
  it("text-white/75", () => {
    expectContains("text-white/75", "color");
    expectContains("text-white/75", "75%");
  });
  it("border-black/10", () => {
    expectContains("border-black/10", "border-color");
    expectContains("border-black/10", "10%");
  });
});

// =====================================================================
// RING
// =====================================================================
describe("ring utilities", () => {
  it("ring", () => expectContains("ring", "box-shadow"));
  it("ring-0", () => expectContains("ring-0", "0px"));
  it("ring-1", () => expectContains("ring-1", "1px"));
  it("ring-2", () => expectContains("ring-2", "2px"));
  it("ring-4", () => expectContains("ring-4", "4px"));
  it("ring-8", () => expectContains("ring-8", "8px"));
  it("ring-inset", () => expectContains("ring-inset", "inset"));
  it("ring-offset-2", () => expectContains("ring-offset-2", "2px"));
  it("ring-offset-4", () => expectContains("ring-offset-4", "4px"));
});

// =====================================================================
// FILTERS
// =====================================================================
describe("filter utilities", () => {
  it("blur-none", () => expectContains("blur-none", "blur(0"));
  it("blur-sm", () => expectContains("blur-sm", "blur(4px)"));
  it("blur", () => expectContains("blur", "blur(8px)"));
  it("blur-md", () => expectContains("blur-md", "blur(12px)"));
  it("blur-lg", () => expectContains("blur-lg", "blur(16px)"));
  it("blur-xl", () => expectContains("blur-xl", "blur(24px)"));
  it("blur-2xl", () => expectContains("blur-2xl", "blur(40px)"));
  it("blur-3xl", () => expectContains("blur-3xl", "blur(64px)"));
  it("brightness-50", () => expectContains("brightness-50", "brightness(0.5)"));
  it("brightness-100", () => expectContains("brightness-100", "brightness(1)"));
  it("brightness-150", () => expectContains("brightness-150", "brightness(1.5)"));
  it("contrast-50", () => expectContains("contrast-50", "contrast(0.5)"));
  it("contrast-200", () => expectContains("contrast-200", "contrast(2)"));
  it("saturate-0", () => expectContains("saturate-0", "saturate(0)"));
  it("saturate-150", () => expectContains("saturate-150", "saturate(1.5)"));
  it("hue-rotate-15", () => expectContains("hue-rotate-15", "hue-rotate(15deg)"));
  it("hue-rotate-90", () => expectContains("hue-rotate-90", "hue-rotate(90deg)"));
  it("hue-rotate-180", () => expectContains("hue-rotate-180", "hue-rotate(180deg)"));
  it("grayscale", () => expectContains("grayscale", "grayscale(100%)"));
  it("grayscale-0", () => expectContains("grayscale-0", "grayscale(0)"));
  it("invert", () => expectContains("invert", "invert(100%)"));
  it("invert-0", () => expectContains("invert-0", "invert(0)"));
  it("sepia", () => expectContains("sepia", "sepia(100%)"));
  it("sepia-0", () => expectContains("sepia-0", "sepia(0)"));
  it("drop-shadow-sm", () => expectContains("drop-shadow-sm", "drop-shadow"));
  it("drop-shadow-md", () => expectContains("drop-shadow-md", "drop-shadow"));
  it("drop-shadow-lg", () => expectContains("drop-shadow-lg", "drop-shadow"));
  it("drop-shadow-xl", () => expectContains("drop-shadow-xl", "drop-shadow"));
  it("drop-shadow-none", () => expectContains("drop-shadow-none", "drop-shadow"));
});

// =====================================================================
// BACKDROP FILTERS
// =====================================================================
describe("backdrop filter utilities", () => {
  it("backdrop-blur-sm", () => expectContains("backdrop-blur-sm", "backdrop-filter: blur(4px)"));
  it("backdrop-blur-md", () => expectContains("backdrop-blur-md", "backdrop-filter: blur(12px)"));
  it("backdrop-brightness-50", () => expectContains("backdrop-brightness-50", "backdrop-filter: brightness(0.5)"));
  it("backdrop-contrast-125", () => expectContains("backdrop-contrast-125", "backdrop-filter: contrast(1.25)"));
  it("backdrop-saturate-150", () => expectContains("backdrop-saturate-150", "backdrop-filter: saturate(1.5)"));
  it("backdrop-hue-rotate-90", () => expectContains("backdrop-hue-rotate-90", "backdrop-filter: hue-rotate(90deg)"));
  it("backdrop-grayscale", () => expectContains("backdrop-grayscale", "backdrop-filter: grayscale(100%)"));
  it("backdrop-invert", () => expectContains("backdrop-invert", "backdrop-filter: invert(100%)"));
  it("backdrop-sepia", () => expectContains("backdrop-sepia", "backdrop-filter: sepia(100%)"));
  it("backdrop-opacity-50", () => expectContains("backdrop-opacity-50", "backdrop-filter: opacity(0.5)"));
});

// =====================================================================
// DIVIDE
// =====================================================================
describe("divide utilities", () => {
  it("divide-x", () => expectContains("divide-x", "border"));
  it("divide-y", () => expectContains("divide-y", "border"));
  it("divide-x-2", () => expectContains("divide-x-2", "2px"));
  it("divide-y-4", () => expectContains("divide-y-4", "4px"));
  it("divide-x-0", () => expectContains("divide-x-0", "0px"));
  it("divide-solid", () => expectContains("divide-solid", "border-style: solid"));
  it("divide-dashed", () => expectContains("divide-dashed", "border-style: dashed"));
  it("divide-dotted", () => expectContains("divide-dotted", "border-style: dotted"));
  it("divide-double", () => expectContains("divide-double", "border-style: double"));
  it("divide-none", () => expectContains("divide-none", "border-style: none"));
});

// =====================================================================
// TRANSLATE / SKEW
// =====================================================================
describe("translate and skew", () => {
  it("translate-x-4", () => expectContains("translate-x-4", "translateX(1rem)"));
  it("translate-y-2", () => expectContains("translate-y-2", "translateY(0.5rem)"));
  it("-translate-x-4", () => expectContains("-translate-x-4", "translateX(-1rem)"));
  it("translate-x-1/2", () => expectContains("translate-x-1/2", "translateX(50%)"));
  it("translate-x-full", () => expectContains("translate-x-full", "translateX(100%)"));
  it("translate-x-px", () => expectContains("translate-x-px", "translateX(1px)"));
  it("-translate-y-full", () => expectContains("-translate-y-full", "translateY(-100%)"));
  it("skew-x-3", () => expectContains("skew-x-3", "skewX(3deg)"));
  it("skew-y-6", () => expectContains("skew-y-6", "skewY(6deg)"));
  it("-skew-x-12", () => expectContains("-skew-x-12", "skewX(-12deg)"));
});

// =====================================================================
// LINE CLAMP
// =====================================================================
describe("line clamp", () => {
  it("line-clamp-1", () => expectContains("line-clamp-1", "-webkit-line-clamp: 1"));
  it("line-clamp-3", () => expectContains("line-clamp-3", "-webkit-line-clamp: 3"));
  it("line-clamp-6", () => expectContains("line-clamp-6", "-webkit-line-clamp: 6"));
  it("line-clamp-none", () => expectContains("line-clamp-none", "-webkit-line-clamp: unset"));
});

// =====================================================================
// SR-ONLY
// =====================================================================
describe("screen reader", () => {
  it("sr-only", () => {
    expectContains("sr-only", "position: absolute");
    expectContains("sr-only", "width: 1px");
    expectContains("sr-only", "height: 1px");
  });
  it("not-sr-only", () => expectContains("not-sr-only", "position: static"));
});

// =====================================================================
// TEXT UTILITIES
// =====================================================================
describe("text utilities", () => {
  it("text-ellipsis", () => expectResult("text-ellipsis", "text-overflow: ellipsis"));
  it("text-clip", () => expectResult("text-clip", "text-overflow: clip"));
  it("break-words", () => expectResult("break-words", "overflow-wrap: break-word"));
  it("break-all", () => expectResult("break-all", "word-break: break-all"));
  it("break-normal", () => expectContains("break-normal", "overflow-wrap: normal"));
  it("break-keep", () => expectResult("break-keep", "word-break: keep-all"));
});

// =====================================================================
// LIST STYLE
// =====================================================================
describe("list style", () => {
  it("list-none", () => expectResult("list-none", "list-style-type: none"));
  it("list-disc", () => expectResult("list-disc", "list-style-type: disc"));
  it("list-decimal", () => expectResult("list-decimal", "list-style-type: decimal"));
  it("list-inside", () => expectResult("list-inside", "list-style-position: inside"));
  it("list-outside", () => expectResult("list-outside", "list-style-position: outside"));
});

// =====================================================================
// OUTLINE
// =====================================================================
describe("outline", () => {
  it("outline", () => expectContains("outline", "outline-style: solid"));
  it("outline-none", () => expectContains("outline-none", "outline"));
  it("outline-dashed", () => expectResult("outline-dashed", "outline-style: dashed"));
  it("outline-dotted", () => expectResult("outline-dotted", "outline-style: dotted"));
  it("outline-double", () => expectResult("outline-double", "outline-style: double"));
  it("outline-1", () => expectContains("outline-1", "outline-width: 1px"));
  it("outline-2", () => expectContains("outline-2", "outline-width: 2px"));
  it("outline-4", () => expectContains("outline-4", "outline-width: 4px"));
  it("outline-offset-2", () => expectContains("outline-offset-2", "outline-offset: 2px"));
  it("outline-offset-4", () => expectContains("outline-offset-4", "outline-offset: 4px"));
});

// =====================================================================
// COLUMNS / INDENT
// =====================================================================
describe("columns and indent", () => {
  it("columns-1", () => expectContains("columns-1", "columns: 1"));
  it("columns-3", () => expectContains("columns-3", "columns: 3"));
  it("columns-auto", () => expectContains("columns-auto", "columns: auto"));
  it("indent-4", () => expectContains("indent-4", "text-indent: 1rem"));
  it("indent-8", () => expectContains("indent-8", "text-indent: 2rem"));
  it("indent-px", () => expectContains("indent-px", "text-indent: 1px"));
  it("-indent-4", () => expectContains("-indent-4", "text-indent: -1rem"));
});

// =====================================================================
// DECORATION
// =====================================================================
describe("text decoration", () => {
  it("underline-offset-auto", () => expectContains("underline-offset-auto", "text-underline-offset: auto"));
  it("underline-offset-2", () => expectContains("underline-offset-2", "text-underline-offset: 2px"));
  it("underline-offset-4", () => expectContains("underline-offset-4", "text-underline-offset: 4px"));
  it("decoration-solid", () => expectContains("decoration-solid", "text-decoration-style: solid"));
  it("decoration-dashed", () => expectContains("decoration-dashed", "text-decoration-style: dashed"));
  it("decoration-wavy", () => expectContains("decoration-wavy", "text-decoration-style: wavy"));
  it("decoration-dotted", () => expectContains("decoration-dotted", "text-decoration-style: dotted"));
  it("decoration-double", () => expectContains("decoration-double", "text-decoration-style: double"));
  it("decoration-1", () => expectContains("decoration-1", "text-decoration-thickness: 1px"));
  it("decoration-2", () => expectContains("decoration-2", "text-decoration-thickness: 2px"));
  it("decoration-auto", () => expectContains("decoration-auto", "text-decoration-thickness: auto"));
  it("decoration-from-font", () => expectContains("decoration-from-font", "text-decoration-thickness: from-font"));
});

// =====================================================================
// WILL CHANGE / TOUCH / APPEARANCE
// =====================================================================
describe("interactivity", () => {
  it("will-change-auto", () => expectResult("will-change-auto", "will-change: auto"));
  it("will-change-scroll", () => expectResult("will-change-scroll", "will-change: scroll-position"));
  it("will-change-contents", () => expectResult("will-change-contents", "will-change: contents"));
  it("will-change-transform", () => expectResult("will-change-transform", "will-change: transform"));
  it("touch-auto", () => expectResult("touch-auto", "touch-action: auto"));
  it("touch-none", () => expectResult("touch-none", "touch-action: none"));
  it("touch-pan-x", () => expectResult("touch-pan-x", "touch-action: pan-x"));
  it("touch-pan-y", () => expectResult("touch-pan-y", "touch-action: pan-y"));
  it("touch-manipulation", () => expectResult("touch-manipulation", "touch-action: manipulation"));
  it("touch-pinch-zoom", () => expectResult("touch-pinch-zoom", "touch-action: pinch-zoom"));
  it("appearance-none", () => expectResult("appearance-none", "appearance: none"));
  it("appearance-auto", () => expectResult("appearance-auto", "appearance: auto"));
});

// =====================================================================
// MIX BLEND / VERTICAL ALIGN
// =====================================================================
describe("mix blend and vertical align", () => {
  it("mix-blend-normal", () => expectResult("mix-blend-normal", "mix-blend-mode: normal"));
  it("mix-blend-multiply", () => expectResult("mix-blend-multiply", "mix-blend-mode: multiply"));
  it("mix-blend-screen", () => expectResult("mix-blend-screen", "mix-blend-mode: screen"));
  it("mix-blend-overlay", () => expectResult("mix-blend-overlay", "mix-blend-mode: overlay"));
  it("mix-blend-darken", () => expectResult("mix-blend-darken", "mix-blend-mode: darken"));
  it("mix-blend-lighten", () => expectResult("mix-blend-lighten", "mix-blend-mode: lighten"));
  it("mix-blend-color-dodge", () => expectResult("mix-blend-color-dodge", "mix-blend-mode: color-dodge"));
  it("mix-blend-color-burn", () => expectResult("mix-blend-color-burn", "mix-blend-mode: color-burn"));
  it("mix-blend-hard-light", () => expectResult("mix-blend-hard-light", "mix-blend-mode: hard-light"));
  it("mix-blend-soft-light", () => expectResult("mix-blend-soft-light", "mix-blend-mode: soft-light"));
  it("mix-blend-difference", () => expectResult("mix-blend-difference", "mix-blend-mode: difference"));
  it("mix-blend-exclusion", () => expectResult("mix-blend-exclusion", "mix-blend-mode: exclusion"));
  it("mix-blend-hue", () => expectResult("mix-blend-hue", "mix-blend-mode: hue"));
  it("mix-blend-saturation", () => expectResult("mix-blend-saturation", "mix-blend-mode: saturation"));
  it("mix-blend-color", () => expectResult("mix-blend-color", "mix-blend-mode: color"));
  it("mix-blend-luminosity", () => expectResult("mix-blend-luminosity", "mix-blend-mode: luminosity"));

  it("align-baseline", () => expectResult("align-baseline", "vertical-align: baseline"));
  it("align-top", () => expectResult("align-top", "vertical-align: top"));
  it("align-middle", () => expectResult("align-middle", "vertical-align: middle"));
  it("align-bottom", () => expectResult("align-bottom", "vertical-align: bottom"));
  it("align-text-top", () => expectResult("align-text-top", "vertical-align: text-top"));
  it("align-text-bottom", () => expectResult("align-text-bottom", "vertical-align: text-bottom"));
  it("align-sub", () => expectResult("align-sub", "vertical-align: sub"));
  it("align-super", () => expectResult("align-super", "vertical-align: super"));
});

// =====================================================================
// SNAP / SCROLL
// =====================================================================
describe("scroll snap and scroll spacing", () => {
  it("snap-start", () => expectResult("snap-start", "scroll-snap-align: start"));
  it("snap-end", () => expectResult("snap-end", "scroll-snap-align: end"));
  it("snap-center", () => expectResult("snap-center", "scroll-snap-align: center"));
  it("snap-align-none", () => expectResult("snap-align-none", "scroll-snap-align: none"));
  it("snap-none", () => expectResult("snap-none", "scroll-snap-type: none"));
  it("snap-x", () => expectContains("snap-x", "scroll-snap-type"));
  it("snap-y", () => expectContains("snap-y", "scroll-snap-type"));
  it("snap-both", () => expectContains("snap-both", "scroll-snap-type"));
  it("snap-mandatory", () => expectContains("snap-mandatory", "mandatory"));
  it("snap-proximity", () => expectContains("snap-proximity", "proximity"));
  it("snap-normal", () => expectContains("snap-normal", "scroll-snap-stop: normal"));
  it("snap-always", () => expectContains("snap-always", "scroll-snap-stop: always"));
  it("scroll-mt-4", () => expectContains("scroll-mt-4", "scroll-margin-top: 1rem"));
  it("scroll-pb-2", () => expectContains("scroll-pb-2", "scroll-padding-bottom: 0.5rem"));
  it("scroll-px-8", () => expectContains("scroll-px-8", "scroll-padding"));
});

// =====================================================================
// BG UTILITIES
// =====================================================================
describe("background utilities", () => {
  it("bg-fixed", () => expectResult("bg-fixed", "background-attachment: fixed"));
  it("bg-local", () => expectResult("bg-local", "background-attachment: local"));
  it("bg-scroll", () => expectResult("bg-scroll", "background-attachment: scroll"));
  it("bg-cover", () => expectResult("bg-cover", "background-size: cover"));
  it("bg-contain", () => expectResult("bg-contain", "background-size: contain"));
  it("bg-center", () => expectResult("bg-center", "background-position: center"));
  it("bg-top", () => expectResult("bg-top", "background-position: top"));
  it("bg-bottom", () => expectResult("bg-bottom", "background-position: bottom"));
  it("bg-left", () => expectResult("bg-left", "background-position: left"));
  it("bg-right", () => expectResult("bg-right", "background-position: right"));
  it("bg-no-repeat", () => expectResult("bg-no-repeat", "background-repeat: no-repeat"));
  it("bg-repeat", () => expectResult("bg-repeat", "background-repeat: repeat"));
  it("bg-repeat-x", () => expectResult("bg-repeat-x", "background-repeat: repeat-x"));
  it("bg-repeat-y", () => expectResult("bg-repeat-y", "background-repeat: repeat-y"));
});

// =====================================================================
// ANIMATE
// =====================================================================
describe("animation", () => {
  it("animate-spin", () => expectContains("animate-spin", "animation"));
  it("animate-ping", () => expectContains("animate-ping", "animation"));
  it("animate-pulse", () => expectContains("animate-pulse", "animation"));
  it("animate-bounce", () => expectContains("animate-bounce", "animation"));
  it("animate-none", () => expectResult("animate-none", "animation: none"));
});

// =====================================================================
// PLACE UTILITIES
// =====================================================================
describe("place utilities", () => {
  it("place-content-center", () => expectResult("place-content-center", "place-content: center"));
  it("place-content-start", () => expectResult("place-content-start", "place-content: start"));
  it("place-content-end", () => expectResult("place-content-end", "place-content: end"));
  it("place-content-between", () => expectResult("place-content-between", "place-content: space-between"));
  it("place-content-around", () => expectResult("place-content-around", "place-content: space-around"));
  it("place-content-evenly", () => expectResult("place-content-evenly", "place-content: space-evenly"));
  it("place-content-stretch", () => expectResult("place-content-stretch", "place-content: stretch"));
  it("place-items-center", () => expectResult("place-items-center", "place-items: center"));
  it("place-items-start", () => expectResult("place-items-start", "place-items: start"));
  it("place-items-end", () => expectResult("place-items-end", "place-items: end"));
  it("place-items-stretch", () => expectResult("place-items-stretch", "place-items: stretch"));
  it("place-self-center", () => expectResult("place-self-center", "place-self: center"));
  it("place-self-auto", () => expectResult("place-self-auto", "place-self: auto"));
  it("place-self-start", () => expectResult("place-self-start", "place-self: start"));
  it("place-self-end", () => expectResult("place-self-end", "place-self: end"));
  it("place-self-stretch", () => expectResult("place-self-stretch", "place-self: stretch"));
});

// =====================================================================
// OVERSCROLL
// =====================================================================
describe("overscroll", () => {
  it("overscroll-auto", () => expectResult("overscroll-auto", "overscroll-behavior: auto"));
  it("overscroll-contain", () => expectResult("overscroll-contain", "overscroll-behavior: contain"));
  it("overscroll-none", () => expectResult("overscroll-none", "overscroll-behavior: none"));
  it("overscroll-x-auto", () => expectResult("overscroll-x-auto", "overscroll-behavior-x: auto"));
  it("overscroll-x-contain", () => expectResult("overscroll-x-contain", "overscroll-behavior-x: contain"));
  it("overscroll-x-none", () => expectResult("overscroll-x-none", "overscroll-behavior-x: none"));
  it("overscroll-y-auto", () => expectResult("overscroll-y-auto", "overscroll-behavior-y: auto"));
  it("overscroll-y-contain", () => expectResult("overscroll-y-contain", "overscroll-behavior-y: contain"));
  it("overscroll-y-none", () => expectResult("overscroll-y-none", "overscroll-behavior-y: none"));
});

// =====================================================================
// FLEX BASIS
// =====================================================================
describe("flex basis", () => {
  it("basis-0", () => expectContains("basis-0", "flex-basis: 0px"));
  it("basis-4", () => expectContains("basis-4", "flex-basis: 1rem"));
  it("basis-full", () => expectContains("basis-full", "flex-basis: 100%"));
  it("basis-auto", () => expectContains("basis-auto", "flex-basis: auto"));
  it("basis-1/2", () => expectContains("basis-1/2", "flex-basis: 50%"));
  it("basis-1/3", () => {
    const result = tailwindClassToCss("basis-1/3");
    expect(result).not.toBeNull();
    expect(result!).toContain("flex-basis");
    expect(result!).toContain("33.3333");
  });
  it("basis-px", () => expectContains("basis-px", "flex-basis: 1px"));
});

// =====================================================================
// CONTAINER
// =====================================================================
describe("container", () => {
  it("container", () => expectContains("container", "width: 100%"));
});

// =====================================================================
// ISOLATION / BOX DECORATION / MISC
// =====================================================================
describe("miscellaneous", () => {
  it("isolate", () => expectResult("isolate", "isolation: isolate"));
  it("isolation-auto", () => expectResult("isolation-auto", "isolation: auto"));
  it("box-decoration-clone", () => expectResult("box-decoration-clone", "box-decoration-break: clone"));
  it("box-decoration-slice", () => expectResult("box-decoration-slice", "box-decoration-break: slice"));
});
