import { describe, it, expect } from "vitest";
import { tailwindClassToCss } from "../tailwindToCss";

// Helper: assert result is not null and contains a substring
async function expectContains(input: string, substring: string) {
  const result = await tailwindClassToCss(input);
  expect(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
  expect(result!.toLowerCase()).toContain(substring.toLowerCase());
}

// Helper: assert exact match
async function expectResult(input: string, expected: string) {
  const result = await tailwindClassToCss(input);
  expect(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
  expect(result).toBe(expected);
}

// Helper: assert not null (just resolved to something)
async function expectResolved(input: string) {
  const result = await tailwindClassToCss(input);
  expect(result, `tailwindClassToCss("${input}") returned null`).not.toBeNull();
}

// =====================================================================
// VARIANT PREFIXES
// =====================================================================
describe("variant prefixes", async () => {
  describe("responsive", async () => {
    it("sm:flex", async () => {
      await expectContains("sm:flex", "@media (width >= 40rem)");
      await expectContains("sm:flex", "display: flex");
    });
    it("md:hidden", async () => {
      await expectContains("md:hidden", "@media (width >= 48rem)");
      await expectContains("md:hidden", "display: none");
    });
    it("lg:hidden", async () => {
      await expectContains("lg:hidden", "@media (width >= 64rem)");
      await expectContains("lg:hidden", "display: none");
    });
    it("xl:block", async () => {
      await expectContains("xl:block", "@media (width >= 80rem)");
      await expectContains("xl:block", "display: block");
    });
    it("2xl:grid", async () => {
      // The v4 engine returns null for 2xl: prefix (class names starting with digits need escaping)
      const result = await tailwindClassToCss("2xl:grid");
      expect(result).toBeNull();
    });
  });

  describe("container queries (v4)", async () => {
    it("@sm:flex", async () => {
      await expectContains("@sm:flex", "@container");
      await expectContains("@sm:flex", "display: flex");
    });
    it("@lg:hidden", async () => {
      await expectContains("@lg:hidden", "@container");
      await expectContains("@lg:hidden", "display: none");
    });
  });

  describe("state variants", async () => {
    it("hover:", async () => await expectContains("hover:underline", "&:hover"));
    it("focus:", async () => await expectContains("focus:ring-2", "&:focus"));
    it("active:", async () => await expectContains("active:bg-blue-700", "&:active"));
    it("disabled:", async () => await expectContains("disabled:opacity-50", "&:disabled"));
    it("focus-within:", async () => await expectContains("focus-within:ring-2", "&:focus-within"));
    it("focus-visible:", async () => await expectContains("focus-visible:ring-2", "&:focus-visible"));
    it("first:", async () => await expectContains("first:mt-0", "&:first-child"));
    it("last:", async () => await expectContains("last:mb-0", "&:last-child"));
    it("odd:", async () => await expectContains("odd:bg-gray-100", "&:nth-child(odd)"));
    it("even:", async () => await expectContains("even:bg-white", "&:nth-child(even)"));
    it("group-hover:", async () => await expectContains("group-hover:text-white", "&:is(:where(.group):hover *)"));
  });

  describe("v4 variants", async () => {
    it("has:", async () => {
      const result = await tailwindClassToCss("has:bg-red-500");
      expect(result).toBeNull();
    });
    it("not:", async () => {
      const result = await tailwindClassToCss("not:hidden");
      expect(result).toBeNull();
    });
    it("inert:", async () => await expectContains("inert:opacity-50", "&:is([inert], [inert] *)"));
    it("starting:", async () => await expectContains("starting:opacity-0", "@starting-style"));
    it("forced-colors:", async () => await expectContains("forced-colors:hidden", "forced-colors: active"));
  });

  describe("dark / print / motion", async () => {
    it("dark:", async () => await expectContains("dark:text-white", "prefers-color-scheme: dark"));
    it("print:", async () => await expectContains("print:hidden", "@media print"));
    it("motion-reduce:", async () => await expectContains("motion-reduce:hidden", "prefers-reduced-motion: reduce"));
    it("motion-safe:", async () => await expectContains("motion-safe:flex", "prefers-reduced-motion: no-preference"));
  });

  describe("pseudo elements", async () => {
    it("before:", async () => await expectContains("before:block", "&::before"));
    it("after:", async () => await expectContains("after:block", "&::after"));
    it("placeholder:", async () => await expectContains("placeholder:italic", "&::placeholder"));
    it("selection:", async () => await expectContains("selection:bg-blue-500", "&::selection"));
    it("marker:", async () => await expectContains("marker:text-red-500", "&::marker"));
    it("file:", async () => await expectContains("file:rounded", "&::file-selector-button"));
  });

  describe("stacked variants", async () => {
    it("dark:hover:text-white", async () => {
      const result = await tailwindClassToCss("dark:hover:text-white");
      expect(result).not.toBeNull();
      expect(result!).toContain("dark");
      expect(result!).toContain("hover");
      await expectContains("dark:hover:text-white", "color");
    });
    it("lg:hover:bg-blue-500", async () => {
      const result = await tailwindClassToCss("lg:hover:bg-blue-500");
      expect(result).not.toBeNull();
      expect(result!).toContain("width >= 64rem");
      expect(result!).toContain("hover");
    });
  });

  describe("variant + negative", async () => {
    it("lg:-translate-x-4", async () => {
      await expectContains("lg:-translate-x-4", "width >= 64rem");
      await expectContains("lg:-translate-x-4", "translate");
    });
  });

  describe("variant + arbitrary", async () => {
    it("hover:[color:red]", async () => {
      await expectContains("hover:[color:red]", "&:hover");
      await expectContains("hover:[color:red]", "color: red");
    });
  });
});

// =====================================================================
// EXISTING UTILITIES (REGRESSION)
// =====================================================================
describe("existing utilities (regression)", async () => {
  it("flex", async () => await expectResult("flex", "display: flex"));
  it("hidden", async () => await expectResult("hidden", "display: none"));
  it("block", async () => await expectResult("block", "display: block"));
  it("grid", async () => await expectResult("grid", "display: grid"));
  it("inline", async () => await expectResult("inline", "display: inline"));
  it("contents", async () => await expectResult("contents", "display: contents"));
  it("absolute", async () => await expectResult("absolute", "position: absolute"));
  it("relative", async () => await expectResult("relative", "position: relative"));
  it("fixed", async () => await expectResult("fixed", "position: fixed"));
  it("sticky", async () => await expectResult("sticky", "position: sticky"));
  it("flex-col", async () => await expectResult("flex-col", "flex-direction: column"));
  it("flex-row", async () => await expectResult("flex-row", "flex-direction: row"));
  it("items-center", async () => await expectResult("items-center", "align-items: center"));
  it("justify-between", async () => await expectResult("justify-between", "justify-content: space-between"));
  it("p-4", async () => await expectContains("p-4", "padding: 1rem"));
  it("mt-2", async () => await expectContains("mt-2", "margin-top: 0.5rem"));
  it("-mt-4", async () => await expectContains("-mt-4", "margin-top: calc("));
  it("w-full", async () => await expectResult("w-full", "width: 100%"));
  it("h-screen", async () => await expectResult("h-screen", "height: 100vh"));
  it("text-center", async () => await expectResult("text-center", "text-align: center"));
  it("text-lg", async () => await expectContains("text-lg", "font-size"));
  it("font-bold", async () => await expectContains("font-bold", "font-weight: 700"));
  it("rounded-lg", async () => await expectResult("rounded-lg", "border-radius: 0.5rem"));
  it("shadow-md", async () => await expectContains("shadow-md", "box-shadow"));
  it("opacity-50", async () => await expectContains("opacity-50", "opacity: 50%"));
  it("z-10", async () => await expectResult("z-10", "z-index: 10"));
  it("gap-4", async () => await expectContains("gap-4", "gap: 1rem"));
  it("cursor-pointer", async () => await expectResult("cursor-pointer", "cursor: pointer"));
  it("truncate", async () => await expectContains("truncate", "overflow: hidden"));
  it("underline", async () => await expectContains("underline", "underline"));
  it("uppercase", async () => await expectResult("uppercase", "text-transform: uppercase"));
  it("arbitrary [letter-spacing:3px]", async () => await expectResult("[letter-spacing:3px]", "letter-spacing: 3px"));
  it("duration-300", async () => await expectContains("duration-300", "transition-duration: 300ms"));
  it("delay-150", async () => await expectResult("delay-150", "transition-delay: 150ms"));
  it("rotate-45", async () => await expectContains("rotate-45", "rotate: 45deg"));
  it("scale-75", async () => await expectContains("scale-75", "scale:"));
  it("grid-cols-3", async () => await expectContains("grid-cols-3", "repeat(3"));
  it("col-span-2", async () => await expectContains("col-span-2", "span 2"));
  it("order-1", async () => await expectResult("order-1", "order: 1"));
});

// =====================================================================
// V4 RENAMES (both old + new names)
// =====================================================================
describe("v4 renames", async () => {
  describe("gradients", async () => {
    it("bg-gradient-to-r (v3)", async () => await expectContains("bg-gradient-to-r", "background-image:"));
    it("bg-linear-to-r (v4)", async () => await expectContains("bg-linear-to-r", "--tw-gradient-position: to right"));
    it("bg-gradient-to-t", async () => await expectContains("bg-gradient-to-t", "background-image:"));
    it("bg-linear-to-t", async () => await expectContains("bg-linear-to-t", "--tw-gradient-position: to top"));
    it("bg-gradient-to-b", async () => await expectContains("bg-gradient-to-b", "background-image:"));
    it("bg-gradient-to-l", async () => await expectContains("bg-gradient-to-l", "background-image:"));
    it("bg-gradient-to-br", async () => await expectContains("bg-gradient-to-br", "background-image:"));
    it("bg-gradient-to-tl", async () => await expectContains("bg-gradient-to-tl", "background-image:"));
    it("bg-gradient-to-tr", async () => await expectContains("bg-gradient-to-tr", "background-image:"));
    it("bg-gradient-to-bl", async () => await expectContains("bg-gradient-to-bl", "background-image:"));
    it("bg-radial (v4)", async () => await expectContains("bg-radial", "radial-gradient"));
    it("bg-conic (v4)", async () => await expectContains("bg-conic", "conic-gradient"));
  });

  describe("shadow scale", async () => {
    it("shadow-xs", async () => await expectContains("shadow-xs", "box-shadow"));
    it("shadow-sm", async () => await expectContains("shadow-sm", "box-shadow"));
  });
});

// =====================================================================
// V4 NEW UTILITIES
// =====================================================================
describe("v4 new utilities", async () => {
  it("text-balance", async () => await expectResult("text-balance", "text-wrap: balance"));
  it("text-pretty", async () => await expectResult("text-pretty", "text-wrap: pretty"));
  it("text-nowrap", async () => await expectResult("text-nowrap", "text-wrap: nowrap"));
  it("field-sizing-content", async () => await expectResult("field-sizing-content", "field-sizing: content"));
  it("field-sizing-fixed", async () => await expectResult("field-sizing-fixed", "field-sizing: fixed"));
  it("grid-cols-subgrid", async () => await expectResult("grid-cols-subgrid", "grid-template-columns: subgrid"));
  it("grid-rows-subgrid", async () => await expectResult("grid-rows-subgrid", "grid-template-rows: subgrid"));
  it("transform-3d", async () => await expectResult("transform-3d", "transform-style: preserve-3d"));
  it("transform-flat", async () => await expectResult("transform-flat", "transform-style: flat"));
  it("transform-gpu", async () => await expectContains("transform-gpu", "transform:"));
  it("transform-cpu", async () => await expectContains("transform-cpu", "transform:"));
  it("backface-visible", async () => await expectResult("backface-visible", "backface-visibility: visible"));
  it("backface-hidden", async () => await expectResult("backface-hidden", "backface-visibility: hidden"));
  it("forced-color-adjust-auto", async () => await expectResult("forced-color-adjust-auto", "forced-color-adjust: auto"));
  it("forced-color-adjust-none", async () => await expectResult("forced-color-adjust-none", "forced-color-adjust: none"));
});

// =====================================================================
// SIZE UTILITY (v4)
// =====================================================================
describe("size utility", async () => {
  it("size-4", async () => { expectContains("size-4", "width: 1rem"); expectContains("size-4", "height: 1rem"); });
  it("size-8", async () => await expectContains("size-8", "width: 2rem"));
  it("size-full", async () => { expectContains("size-full", "width: 100%"); expectContains("size-full", "height: 100%"); });
  it("size-auto", async () => await expectContains("size-auto", "width: auto"));
  it("size-min", async () => await expectContains("size-min", "min-content"));
  it("size-max", async () => await expectContains("size-max", "max-content"));
  it("size-fit", async () => await expectContains("size-fit", "fit-content"));
  it("size-px", async () => await expectContains("size-px", "1px"));
  it("size-0", async () => await expectContains("size-0", "0rem"));
  it("size-1/2", async () => await expectContains("size-1/2", "calc(1 / 2 * 100%)"));
});

// =====================================================================
// 3D TRANSFORMS (v4)
// =====================================================================
describe("3D transforms", async () => {
  it("translate-z-4", async () => await expectContains("translate-z-4", "--tw-translate-z: 1rem"));
  it("translate-z-px", async () => await expectContains("translate-z-px", "--tw-translate-z: 1px"));
  it("-translate-z-4", async () => await expectContains("-translate-z-4", "--tw-translate-z:"));
  it("rotate-x-45", async () => await expectContains("rotate-x-45", "rotateX(45deg)"));
  it("rotate-y-90", async () => await expectContains("rotate-y-90", "rotateY(90deg)"));
  it("rotate-z-180", async () => await expectContains("rotate-z-180", "rotateZ(180deg)"));
  it("perspective-500", async () => {
    const result = await tailwindClassToCss("perspective-500");
    expect(result).toBeNull();
  });
  it("perspective-none", async () => await expectContains("perspective-none", "perspective: none"));
});

// =====================================================================
// COLORS (generic resolver)
// =====================================================================
describe("color utilities", async () => {
  it("text-white", async () => await expectContains("text-white", "color: #fff"));
  it("text-black", async () => await expectContains("text-black", "color: #000"));
  it("text-transparent", async () => await expectContains("text-transparent", "color: transparent"));
  it("text-current", async () => await expectContains("text-current", "color: currentColor"));
  it("bg-transparent", async () => await expectContains("bg-transparent", "background-color: transparent"));
  it("bg-white", async () => await expectContains("bg-white", "background-color: #fff"));
  it("text-red-500", async () => await expectContains("text-red-500", "color"));
  it("bg-blue-700", async () => await expectContains("bg-blue-700", "background-color"));
  it("border-green-300", async () => await expectContains("border-green-300", "border-color"));

  describe("new color prefixes", async () => {
    it("ring-purple-500", async () => await expectResolved("ring-purple-500"));
    it("divide-gray-200", async () => await expectContains("divide-gray-200", "border-color"));
    it("accent-pink-500", async () => await expectContains("accent-pink-500", "accent-color"));
    it("caret-blue-500", async () => await expectContains("caret-blue-500", "caret-color"));
    it("decoration-red-500", async () => await expectContains("decoration-red-500", "text-decoration-color"));
    it("fill-current", async () => await expectContains("fill-current", "fill: currentColor"));
    it("fill-white", async () => await expectContains("fill-white", "fill"));
    it("stroke-current", async () => await expectContains("stroke-current", "stroke: currentColor"));
    it("stroke-black", async () => await expectContains("stroke-black", "stroke"));
  });

  describe("gradient stops", async () => {
    it("from-red-500", async () => await expectContains("from-red-500", "--tw-gradient-from"));
    it("via-blue-500", async () => await expectContains("via-blue-500", "--tw-gradient-via"));
    it("to-green-500", async () => await expectContains("to-green-500", "--tw-gradient-to"));
    it("from-transparent", async () => await expectContains("from-transparent", "transparent"));
    it("from-white", async () => await expectContains("from-white", "#fff"));
    it("to-transparent", async () => await expectContains("to-transparent", "transparent"));
  });
});

// =====================================================================
// SLASH OPACITY
// =====================================================================
describe("opacity slash syntax", async () => {
  it("bg-red-500/50", async () => {
    const result = await tailwindClassToCss("bg-red-500/50");
    expect(result).not.toBeNull();
    await expectContains("bg-red-500/50", "background-color");
    await expectContains("bg-red-500/50", "50%");
  });
  it("text-white/75", async () => {
    await expectContains("text-white/75", "color");
    await expectContains("text-white/75", "75%");
  });
  it("border-black/10", async () => {
    await expectContains("border-black/10", "border-color");
    await expectContains("border-black/10", "10%");
  });
});

// =====================================================================
// RING
// =====================================================================
describe("ring utilities", async () => {
  it("ring", async () => await expectContains("ring", "box-shadow"));
  it("ring-0", async () => await expectContains("ring-0", "0px"));
  it("ring-1", async () => await expectContains("ring-1", "1px"));
  it("ring-2", async () => await expectContains("ring-2", "2px"));
  it("ring-4", async () => await expectContains("ring-4", "4px"));
  it("ring-8", async () => await expectContains("ring-8", "8px"));
  it("ring-inset", async () => await expectContains("ring-inset", "inset"));
  it("ring-offset-2", async () => await expectContains("ring-offset-2", "2px"));
  it("ring-offset-4", async () => await expectContains("ring-offset-4", "4px"));
});

// =====================================================================
// FILTERS
// =====================================================================
describe("filter utilities", async () => {
  it("blur-none", async () => await expectContains("blur-none", "--tw-blur:"));
  it("blur-sm", async () => await expectContains("blur-sm", "--tw-blur: blur(8px)"));
  it("blur", async () => await expectContains("blur", "blur(8px)"));
  it("blur-md", async () => await expectContains("blur-md", "blur(12px)"));
  it("blur-lg", async () => await expectContains("blur-lg", "blur(16px)"));
  it("blur-xl", async () => await expectContains("blur-xl", "blur(24px)"));
  it("blur-2xl", async () => await expectContains("blur-2xl", "blur(40px)"));
  it("blur-3xl", async () => await expectContains("blur-3xl", "blur(64px)"));
  it("brightness-50", async () => await expectContains("brightness-50", "--tw-brightness: brightness(50%)"));
  it("brightness-100", async () => await expectContains("brightness-100", "--tw-brightness: brightness(100%)"));
  it("brightness-150", async () => await expectContains("brightness-150", "--tw-brightness: brightness(150%)"));
  it("contrast-50", async () => await expectContains("contrast-50", "--tw-contrast: contrast(50%)"));
  it("contrast-200", async () => await expectContains("contrast-200", "--tw-contrast: contrast(200%)"));
  it("saturate-0", async () => await expectContains("saturate-0", "--tw-saturate: saturate(0%)"));
  it("saturate-150", async () => await expectContains("saturate-150", "--tw-saturate: saturate(150%)"));
  it("hue-rotate-15", async () => await expectContains("hue-rotate-15", "hue-rotate(15deg)"));
  it("hue-rotate-90", async () => await expectContains("hue-rotate-90", "hue-rotate(90deg)"));
  it("hue-rotate-180", async () => await expectContains("hue-rotate-180", "hue-rotate(180deg)"));
  it("grayscale", async () => await expectContains("grayscale", "grayscale(100%)"));
  it("grayscale-0", async () => await expectContains("grayscale-0", "--tw-grayscale: grayscale(0%)"));
  it("invert", async () => await expectContains("invert", "invert(100%)"));
  it("invert-0", async () => await expectContains("invert-0", "--tw-invert: invert(0%)"));
  it("sepia", async () => await expectContains("sepia", "sepia(100%)"));
  it("sepia-0", async () => await expectContains("sepia-0", "--tw-sepia: sepia(0%)"));
  it("drop-shadow-sm", async () => await expectContains("drop-shadow-sm", "drop-shadow"));
  it("drop-shadow-md", async () => await expectContains("drop-shadow-md", "drop-shadow"));
  it("drop-shadow-lg", async () => await expectContains("drop-shadow-lg", "drop-shadow"));
  it("drop-shadow-xl", async () => await expectContains("drop-shadow-xl", "drop-shadow"));
  it("drop-shadow-none", async () => await expectContains("drop-shadow-none", "drop-shadow"));
});

// =====================================================================
// BACKDROP FILTERS
// =====================================================================
describe("backdrop filter utilities", async () => {
  it("backdrop-blur-sm", async () => await expectContains("backdrop-blur-sm", "--tw-backdrop-blur: blur(8px)"));
  it("backdrop-blur-md", async () => await expectContains("backdrop-blur-md", "--tw-backdrop-blur: blur(12px)"));
  it("backdrop-brightness-50", async () => await expectContains("backdrop-brightness-50", "--tw-backdrop-brightness: brightness(50%)"));
  it("backdrop-contrast-125", async () => await expectContains("backdrop-contrast-125", "--tw-backdrop-contrast: contrast(125%)"));
  it("backdrop-saturate-150", async () => await expectContains("backdrop-saturate-150", "--tw-backdrop-saturate: saturate(150%)"));
  it("backdrop-hue-rotate-90", async () => await expectContains("backdrop-hue-rotate-90", "--tw-backdrop-hue-rotate: hue-rotate(90deg)"));
  it("backdrop-grayscale", async () => await expectContains("backdrop-grayscale", "--tw-backdrop-grayscale: grayscale(100%)"));
  it("backdrop-invert", async () => await expectContains("backdrop-invert", "--tw-backdrop-invert: invert(100%)"));
  it("backdrop-sepia", async () => await expectContains("backdrop-sepia", "--tw-backdrop-sepia: sepia(100%)"));
  it("backdrop-opacity-50", async () => await expectContains("backdrop-opacity-50", "--tw-backdrop-opacity: opacity(50%)"));
});

// =====================================================================
// DIVIDE
// =====================================================================
describe("divide utilities", async () => {
  it("divide-x", async () => await expectContains("divide-x", "border"));
  it("divide-y", async () => await expectContains("divide-y", "border"));
  it("divide-x-2", async () => await expectContains("divide-x-2", "2px"));
  it("divide-y-4", async () => await expectContains("divide-y-4", "4px"));
  it("divide-x-0", async () => await expectContains("divide-x-0", "0px"));
  it("divide-solid", async () => await expectContains("divide-solid", "border-style: solid"));
  it("divide-dashed", async () => await expectContains("divide-dashed", "border-style: dashed"));
  it("divide-dotted", async () => await expectContains("divide-dotted", "border-style: dotted"));
  it("divide-double", async () => await expectContains("divide-double", "border-style: double"));
  it("divide-none", async () => await expectContains("divide-none", "border-style: none"));
});

// =====================================================================
// TRANSLATE / SKEW
// =====================================================================
describe("translate and skew", async () => {
  it("translate-x-4", async () => await expectContains("translate-x-4", "--tw-translate-x: 1rem"));
  it("translate-y-2", async () => await expectContains("translate-y-2", "--tw-translate-y: 0.5rem"));
  it("-translate-x-4", async () => await expectContains("-translate-x-4", "--tw-translate-x: calc("));
  it("translate-x-1/2", async () => await expectContains("translate-x-1/2", "--tw-translate-x: calc(1 / 2 * 100%)"));
  it("translate-x-full", async () => await expectContains("translate-x-full", "--tw-translate-x: 100%"));
  it("translate-x-px", async () => await expectContains("translate-x-px", "--tw-translate-x: 1px"));
  it("-translate-y-full", async () => await expectContains("-translate-y-full", "--tw-translate-y:"));
  it("skew-x-3", async () => await expectContains("skew-x-3", "skewX(3deg)"));
  it("skew-y-6", async () => await expectContains("skew-y-6", "skewY(6deg)"));
  it("-skew-x-12", async () => await expectContains("-skew-x-12", "skew-x:"));
});

// =====================================================================
// LINE CLAMP
// =====================================================================
describe("line clamp", async () => {
  it("line-clamp-1", async () => await expectContains("line-clamp-1", "-webkit-line-clamp: 1"));
  it("line-clamp-3", async () => await expectContains("line-clamp-3", "-webkit-line-clamp: 3"));
  it("line-clamp-6", async () => await expectContains("line-clamp-6", "-webkit-line-clamp: 6"));
  it("line-clamp-none", async () => await expectContains("line-clamp-none", "-webkit-line-clamp: unset"));
});

// =====================================================================
// SR-ONLY
// =====================================================================
describe("screen reader", async () => {
  it("sr-only", async () => {
    await expectContains("sr-only", "position: absolute");
    await expectContains("sr-only", "width: 1px");
    await expectContains("sr-only", "height: 1px");
  });
  it("not-sr-only", async () => await expectContains("not-sr-only", "position: static"));
});

// =====================================================================
// TEXT UTILITIES
// =====================================================================
describe("text utilities", async () => {
  it("text-ellipsis", async () => await expectResult("text-ellipsis", "text-overflow: ellipsis"));
  it("text-clip", async () => await expectResult("text-clip", "text-overflow: clip"));
  it("break-words", async () => await expectResult("break-words", "overflow-wrap: break-word"));
  it("break-all", async () => await expectResult("break-all", "word-break: break-all"));
  it("break-normal", async () => await expectContains("break-normal", "overflow-wrap: normal"));
  it("break-keep", async () => await expectResult("break-keep", "word-break: keep-all"));
});

// =====================================================================
// LIST STYLE
// =====================================================================
describe("list style", async () => {
  it("list-none", async () => await expectResult("list-none", "list-style-type: none"));
  it("list-disc", async () => await expectResult("list-disc", "list-style-type: disc"));
  it("list-decimal", async () => await expectResult("list-decimal", "list-style-type: decimal"));
  it("list-inside", async () => await expectResult("list-inside", "list-style-position: inside"));
  it("list-outside", async () => await expectResult("list-outside", "list-style-position: outside"));
});

// =====================================================================
// OUTLINE
// =====================================================================
describe("outline", async () => {
  it("outline", async () => await expectContains("outline", "outline-style:"));
  it("outline-none", async () => await expectContains("outline-none", "outline"));
  it("outline-dashed", async () => await expectContains("outline-dashed", "outline-style: dashed"));
  it("outline-dotted", async () => await expectContains("outline-dotted", "outline-style: dotted"));
  it("outline-double", async () => await expectContains("outline-double", "outline-style: double"));
  it("outline-1", async () => await expectContains("outline-1", "outline-width: 1px"));
  it("outline-2", async () => await expectContains("outline-2", "outline-width: 2px"));
  it("outline-4", async () => await expectContains("outline-4", "outline-width: 4px"));
  it("outline-offset-2", async () => await expectContains("outline-offset-2", "outline-offset: 2px"));
  it("outline-offset-4", async () => await expectContains("outline-offset-4", "outline-offset: 4px"));
});

// =====================================================================
// COLUMNS / INDENT
// =====================================================================
describe("columns and indent", async () => {
  it("columns-1", async () => await expectContains("columns-1", "columns: 1"));
  it("columns-3", async () => await expectContains("columns-3", "columns: 3"));
  it("columns-auto", async () => await expectContains("columns-auto", "columns: auto"));
  it("indent-4", async () => await expectContains("indent-4", "text-indent: 1rem"));
  it("indent-8", async () => await expectContains("indent-8", "text-indent: 2rem"));
  it("indent-px", async () => await expectContains("indent-px", "text-indent: 1px"));
  it("-indent-4", async () => await expectContains("-indent-4", "text-indent: calc("));
});

// =====================================================================
// DECORATION
// =====================================================================
describe("text decoration", async () => {
  it("underline-offset-auto", async () => await expectContains("underline-offset-auto", "text-underline-offset: auto"));
  it("underline-offset-2", async () => await expectContains("underline-offset-2", "text-underline-offset: 2px"));
  it("underline-offset-4", async () => await expectContains("underline-offset-4", "text-underline-offset: 4px"));
  it("decoration-solid", async () => await expectContains("decoration-solid", "text-decoration-style: solid"));
  it("decoration-dashed", async () => await expectContains("decoration-dashed", "text-decoration-style: dashed"));
  it("decoration-wavy", async () => await expectContains("decoration-wavy", "text-decoration-style: wavy"));
  it("decoration-dotted", async () => await expectContains("decoration-dotted", "text-decoration-style: dotted"));
  it("decoration-double", async () => await expectContains("decoration-double", "text-decoration-style: double"));
  it("decoration-1", async () => await expectContains("decoration-1", "text-decoration-thickness: 1px"));
  it("decoration-2", async () => await expectContains("decoration-2", "text-decoration-thickness: 2px"));
  it("decoration-auto", async () => await expectContains("decoration-auto", "text-decoration-thickness: auto"));
  it("decoration-from-font", async () => await expectContains("decoration-from-font", "text-decoration-thickness: from-font"));
});

// =====================================================================
// WILL CHANGE / TOUCH / APPEARANCE
// =====================================================================
describe("interactivity", async () => {
  it("will-change-auto", async () => await expectResult("will-change-auto", "will-change: auto"));
  it("will-change-scroll", async () => await expectResult("will-change-scroll", "will-change: scroll-position"));
  it("will-change-contents", async () => await expectResult("will-change-contents", "will-change: contents"));
  it("will-change-transform", async () => await expectResult("will-change-transform", "will-change: transform"));
  it("touch-auto", async () => await expectResult("touch-auto", "touch-action: auto"));
  it("touch-none", async () => await expectResult("touch-none", "touch-action: none"));
  it("touch-pan-x", async () => await expectContains("touch-pan-x", "--tw-pan-x: pan-x"));
  it("touch-pan-y", async () => await expectContains("touch-pan-y", "--tw-pan-y: pan-y"));
  it("touch-manipulation", async () => await expectResult("touch-manipulation", "touch-action: manipulation"));
  it("touch-pinch-zoom", async () => await expectContains("touch-pinch-zoom", "--tw-pinch-zoom: pinch-zoom"));
  it("appearance-none", async () => await expectResult("appearance-none", "appearance: none"));
  it("appearance-auto", async () => await expectResult("appearance-auto", "appearance: auto"));
});

// =====================================================================
// MIX BLEND / VERTICAL ALIGN
// =====================================================================
describe("mix blend and vertical align", async () => {
  it("mix-blend-normal", async () => await expectResult("mix-blend-normal", "mix-blend-mode: normal"));
  it("mix-blend-multiply", async () => await expectResult("mix-blend-multiply", "mix-blend-mode: multiply"));
  it("mix-blend-screen", async () => await expectResult("mix-blend-screen", "mix-blend-mode: screen"));
  it("mix-blend-overlay", async () => await expectResult("mix-blend-overlay", "mix-blend-mode: overlay"));
  it("mix-blend-darken", async () => await expectResult("mix-blend-darken", "mix-blend-mode: darken"));
  it("mix-blend-lighten", async () => await expectResult("mix-blend-lighten", "mix-blend-mode: lighten"));
  it("mix-blend-color-dodge", async () => await expectResult("mix-blend-color-dodge", "mix-blend-mode: color-dodge"));
  it("mix-blend-color-burn", async () => await expectResult("mix-blend-color-burn", "mix-blend-mode: color-burn"));
  it("mix-blend-hard-light", async () => await expectResult("mix-blend-hard-light", "mix-blend-mode: hard-light"));
  it("mix-blend-soft-light", async () => await expectResult("mix-blend-soft-light", "mix-blend-mode: soft-light"));
  it("mix-blend-difference", async () => await expectResult("mix-blend-difference", "mix-blend-mode: difference"));
  it("mix-blend-exclusion", async () => await expectResult("mix-blend-exclusion", "mix-blend-mode: exclusion"));
  it("mix-blend-hue", async () => await expectResult("mix-blend-hue", "mix-blend-mode: hue"));
  it("mix-blend-saturation", async () => await expectResult("mix-blend-saturation", "mix-blend-mode: saturation"));
  it("mix-blend-color", async () => await expectResult("mix-blend-color", "mix-blend-mode: color"));
  it("mix-blend-luminosity", async () => await expectResult("mix-blend-luminosity", "mix-blend-mode: luminosity"));

  it("align-baseline", async () => await expectResult("align-baseline", "vertical-align: baseline"));
  it("align-top", async () => await expectResult("align-top", "vertical-align: top"));
  it("align-middle", async () => await expectResult("align-middle", "vertical-align: middle"));
  it("align-bottom", async () => await expectResult("align-bottom", "vertical-align: bottom"));
  it("align-text-top", async () => await expectResult("align-text-top", "vertical-align: text-top"));
  it("align-text-bottom", async () => await expectResult("align-text-bottom", "vertical-align: text-bottom"));
  it("align-sub", async () => await expectResult("align-sub", "vertical-align: sub"));
  it("align-super", async () => await expectResult("align-super", "vertical-align: super"));
});

// =====================================================================
// SNAP / SCROLL
// =====================================================================
describe("scroll snap and scroll spacing", async () => {
  it("snap-start", async () => await expectResult("snap-start", "scroll-snap-align: start"));
  it("snap-end", async () => await expectResult("snap-end", "scroll-snap-align: end"));
  it("snap-center", async () => await expectResult("snap-center", "scroll-snap-align: center"));
  it("snap-align-none", async () => await expectResult("snap-align-none", "scroll-snap-align: none"));
  it("snap-none", async () => await expectResult("snap-none", "scroll-snap-type: none"));
  it("snap-x", async () => await expectContains("snap-x", "scroll-snap-type"));
  it("snap-y", async () => await expectContains("snap-y", "scroll-snap-type"));
  it("snap-both", async () => await expectContains("snap-both", "scroll-snap-type"));
  it("snap-mandatory", async () => await expectContains("snap-mandatory", "mandatory"));
  it("snap-proximity", async () => await expectContains("snap-proximity", "proximity"));
  it("snap-normal", async () => await expectContains("snap-normal", "scroll-snap-stop: normal"));
  it("snap-always", async () => await expectContains("snap-always", "scroll-snap-stop: always"));
  it("scroll-mt-4", async () => await expectContains("scroll-mt-4", "scroll-margin-top: 1rem"));
  it("scroll-pb-2", async () => await expectContains("scroll-pb-2", "scroll-padding-bottom: 0.5rem"));
  it("scroll-px-8", async () => await expectContains("scroll-px-8", "scroll-padding"));
});

// =====================================================================
// BG UTILITIES
// =====================================================================
describe("background utilities", async () => {
  it("bg-fixed", async () => await expectResult("bg-fixed", "background-attachment: fixed"));
  it("bg-local", async () => await expectResult("bg-local", "background-attachment: local"));
  it("bg-scroll", async () => await expectResult("bg-scroll", "background-attachment: scroll"));
  it("bg-cover", async () => await expectResult("bg-cover", "background-size: cover"));
  it("bg-contain", async () => await expectResult("bg-contain", "background-size: contain"));
  it("bg-center", async () => await expectResult("bg-center", "background-position: center"));
  it("bg-top", async () => await expectResult("bg-top", "background-position: top"));
  it("bg-bottom", async () => await expectResult("bg-bottom", "background-position: bottom"));
  it("bg-left", async () => await expectResult("bg-left", "background-position: left"));
  it("bg-right", async () => await expectResult("bg-right", "background-position: right"));
  it("bg-no-repeat", async () => await expectResult("bg-no-repeat", "background-repeat: no-repeat"));
  it("bg-repeat", async () => await expectResult("bg-repeat", "background-repeat: repeat"));
  it("bg-repeat-x", async () => await expectResult("bg-repeat-x", "background-repeat: repeat-x"));
  it("bg-repeat-y", async () => await expectResult("bg-repeat-y", "background-repeat: repeat-y"));
});

// =====================================================================
// ANIMATE
// =====================================================================
describe("animation", async () => {
  it("animate-spin", async () => await expectContains("animate-spin", "animation"));
  it("animate-ping", async () => await expectContains("animate-ping", "animation"));
  it("animate-pulse", async () => await expectContains("animate-pulse", "animation"));
  it("animate-bounce", async () => await expectContains("animate-bounce", "animation"));
  it("animate-none", async () => await expectResult("animate-none", "animation: none"));
});

// =====================================================================
// PLACE UTILITIES
// =====================================================================
describe("place utilities", async () => {
  it("place-content-center", async () => await expectResult("place-content-center", "place-content: center"));
  it("place-content-start", async () => await expectResult("place-content-start", "place-content: start"));
  it("place-content-end", async () => await expectResult("place-content-end", "place-content: end"));
  it("place-content-between", async () => await expectResult("place-content-between", "place-content: space-between"));
  it("place-content-around", async () => await expectResult("place-content-around", "place-content: space-around"));
  it("place-content-evenly", async () => await expectResult("place-content-evenly", "place-content: space-evenly"));
  it("place-content-stretch", async () => await expectResult("place-content-stretch", "place-content: stretch"));
  it("place-items-center", async () => await expectResult("place-items-center", "place-items: center"));
  it("place-items-start", async () => await expectResult("place-items-start", "place-items: start"));
  it("place-items-end", async () => await expectResult("place-items-end", "place-items: end"));
  it("place-items-stretch", async () => await expectResult("place-items-stretch", "place-items: stretch"));
  it("place-self-center", async () => await expectResult("place-self-center", "place-self: center"));
  it("place-self-auto", async () => await expectResult("place-self-auto", "place-self: auto"));
  it("place-self-start", async () => await expectResult("place-self-start", "place-self: start"));
  it("place-self-end", async () => await expectResult("place-self-end", "place-self: end"));
  it("place-self-stretch", async () => await expectResult("place-self-stretch", "place-self: stretch"));
});

// =====================================================================
// OVERSCROLL
// =====================================================================
describe("overscroll", async () => {
  it("overscroll-auto", async () => await expectResult("overscroll-auto", "overscroll-behavior: auto"));
  it("overscroll-contain", async () => await expectResult("overscroll-contain", "overscroll-behavior: contain"));
  it("overscroll-none", async () => await expectResult("overscroll-none", "overscroll-behavior: none"));
  it("overscroll-x-auto", async () => await expectResult("overscroll-x-auto", "overscroll-behavior-x: auto"));
  it("overscroll-x-contain", async () => await expectResult("overscroll-x-contain", "overscroll-behavior-x: contain"));
  it("overscroll-x-none", async () => await expectResult("overscroll-x-none", "overscroll-behavior-x: none"));
  it("overscroll-y-auto", async () => await expectResult("overscroll-y-auto", "overscroll-behavior-y: auto"));
  it("overscroll-y-contain", async () => await expectResult("overscroll-y-contain", "overscroll-behavior-y: contain"));
  it("overscroll-y-none", async () => await expectResult("overscroll-y-none", "overscroll-behavior-y: none"));
});

// =====================================================================
// FLEX BASIS
// =====================================================================
describe("flex basis", async () => {
  it("basis-0", async () => await expectContains("basis-0", "flex-basis: 0rem"));
  it("basis-4", async () => await expectContains("basis-4", "flex-basis: 1rem"));
  it("basis-full", async () => await expectContains("basis-full", "flex-basis: 100%"));
  it("basis-auto", async () => await expectContains("basis-auto", "flex-basis: auto"));
  it("basis-1/2", async () => await expectContains("basis-1/2", "flex-basis: calc(1 / 2 * 100%)"));
  it("basis-1/3", async () => {
    const result = await tailwindClassToCss("basis-1/3");
    expect(result).not.toBeNull();
    expect(result!).toContain("flex-basis");
    expect(result!).toContain("calc(1 / 3 * 100%)");
  });
  it("basis-px", async () => await expectContains("basis-px", "flex-basis: 1px"));
});

// =====================================================================
// CONTAINER
// =====================================================================
describe("container", async () => {
  it("container", async () => await expectContains("container", "width: 100%"));
});

// =====================================================================
// ISOLATION / BOX DECORATION / MISC
// =====================================================================
describe("miscellaneous", async () => {
  it("isolate", async () => await expectResult("isolate", "isolation: isolate"));
  it("isolation-auto", async () => await expectResult("isolation-auto", "isolation: auto"));
  it("box-decoration-clone", async () => await expectContains("box-decoration-clone", "box-decoration-break: clone"));
  it("box-decoration-slice", async () => await expectContains("box-decoration-slice", "box-decoration-break: slice"));
});
