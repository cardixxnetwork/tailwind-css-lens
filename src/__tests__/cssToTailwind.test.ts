import { describe, it, expect } from "vitest";
import { convertCssToTailwind } from "../cssToTailwind";
import { tailwindClassesToCssDeclarations } from "../tailwindToCss";

describe("convertCssToTailwind", () => {
  describe("tagged round-trip (unchanged lines)", () => {
    it("preserves original classes when CSS is unchanged", () => {
      const original = "fixed inset-0 z-50 flex items-center justify-center bg-black/40";
      const css = tailwindClassesToCssDeclarations(original);
      const result = convertCssToTailwind(css);
      expect(result.success).toBe(true);
      // All original classes preserved exactly
      expect(result.classes).toBe(original);
    });

    it("preserves gradient + color stops unchanged", () => {
      const original = "bg-linear-to-t from-white via-white/80 to-transparent px-6 pb-6 pt-10";
      const css = tailwindClassesToCssDeclarations(original);
      const result = convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });

    it("preserves variant prefixed classes", () => {
      const original = "lg:hidden hover:underline dark:text-white";
      const css = tailwindClassesToCssDeclarations(original);
      const result = convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });

    it("preserves stacked variant classes", () => {
      const original = "dark:hover:text-white lg:hover:bg-blue-500";
      const css = tailwindClassesToCssDeclarations(original);
      const result = convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });

    it("preserves complex class list unchanged", () => {
      const original = "flex flex-col gap-4 p-4 rounded-lg shadow-md bg-white text-sm font-medium";
      const css = tailwindClassesToCssDeclarations(original);
      const result = convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });
  });

  describe("tagged round-trip (modified lines)", () => {
    it("only re-converts changed lines, keeps unchanged", () => {
      const original = "flex items-center p-4";
      const css = tailwindClassesToCssDeclarations(original);
      // Change p-4 (padding: 1rem) to padding: 2rem (p-8)
      const modified = css.replace("padding: 1rem;", "padding: 2rem;");
      const result = convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).toContain("items-center");
      expect(result.classes).toContain("p-8");
      expect(result.classes).not.toContain("p-4");
    });

    it("user modifies opacity: via-white/80 → via-white/20", () => {
      const original = "bg-linear-to-t from-white via-white/80 to-transparent px-6 pb-6 pt-10";
      const css = tailwindClassesToCssDeclarations(original);
      // Change "80% opacity" to "20% opacity"
      const modified = css.replace("80% opacity", "20% opacity");
      const result = convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      // Unchanged classes preserved
      expect(result.classes).toContain("bg-linear-to-t");
      expect(result.classes).toContain("from-white");
      expect(result.classes).toContain("to-transparent");
      expect(result.classes).toContain("px-6");
      expect(result.classes).toContain("pb-6");
      expect(result.classes).toContain("pt-10");
      // Opacity updated correctly
      expect(result.classes).toContain("via-white/20");
      expect(result.classes).not.toContain("via-white/80");
      // No bogus arbitrary values
      expect(result.classes).not.toContain("[background-image");
      expect(result.classes).not.toContain("bg-[");
      expect(result.classes).not.toContain("pl-6");
      expect(result.classes).not.toContain("pr-6");
    });

    it("deleted line removes the class", () => {
      const original = "flex items-center p-4";
      const css = tailwindClassesToCssDeclarations(original);
      // Remove the padding line
      const modified = css
        .split("\n")
        .filter((l) => !l.includes("padding"))
        .join("\n");
      const result = convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).toContain("items-center");
      expect(result.classes).not.toContain("p-4");
    });

    it("no duplicate arbitrary when translator produces arbitrary class", () => {
      const original = "rounded-full bg-black";
      const css = tailwindClassesToCssDeclarations(original);
      // User changes border-radius from 50% to 30%
      const modified = css.replace("border-radius: 50%;", "border-radius: 30%;");
      const result = convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("bg-black");
      // Should not have duplicate border-radius entries
      const brClasses = result.classes.split(" ").filter((c) => c.includes("border-radius") || c.includes("rounded"));
      expect(brClasses.length).toBe(1);
    });
  });

  describe("untagged CSS (user adds new lines)", () => {
    it("converts new plain CSS", () => {
      const result = convertCssToTailwind("display: flex;");
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
    });

    it("converts position: fixed", () => {
      const result = convertCssToTailwind("position: fixed;");
      expect(result.success).toBe(true);
      expect(result.classes).toContain("fixed");
    });

    it("handles empty input", () => {
      const result = convertCssToTailwind("");
      expect(result.success).toBe(false);
    });

    it("user adds a new line to existing tagged CSS", () => {
      const original = "flex items-center";
      const css = tailwindClassesToCssDeclarations(original);
      // User adds a new untagged line
      const modified = css + "\npadding: 1rem;";
      const result = convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).toContain("items-center");
      // New line should be converted
      expect(result.classes).toContain("p-4");
    });
  });

  describe("real CSS variant blocks", () => {
    it("responsive variant in tagged CSS round-trips", () => {
      const original = "flex lg:hidden";
      const css = tailwindClassesToCssDeclarations(original);
      const result = convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });

    it("output format uses real CSS blocks for variants", () => {
      const css = tailwindClassesToCssDeclarations("lg:hidden");
      // Should be real CSS, not a comment
      expect(css).toContain("@media (min-width: 1024px)");
      expect(css).toContain("{");
      expect(css).toContain("display: none;");
      expect(css).toContain("}");
      // Should NOT have comment-wrapped variant
      expect(css).not.toMatch(/\/\*\s*@media/);
    });

    it("stacked variant output uses nested CSS blocks", () => {
      const css = tailwindClassesToCssDeclarations("dark:hover:text-white");
      expect(css).toContain("@media (prefers-color-scheme: dark)");
      expect(css).toContain("&:hover");
      expect(css).toContain("{");
    });

    it("editing variant breakpoint changes the class", () => {
      const original = "fixed inset-x-0 bottom-0 z-20 lg:hidden";
      const css = tailwindClassesToCssDeclarations(original);
      // User changes 1024px to 2024px
      const modified = css.replace("1024px", "2024px");
      const result = convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      // Variant should change to arbitrary breakpoint
      expect(result.classes).toContain("min-[2024px]:hidden");
      expect(result.classes).not.toContain("lg:hidden");
      // Other classes unchanged
      expect(result.classes).toContain("fixed");
      expect(result.classes).toContain("inset-x-0");
      expect(result.classes).toContain("bottom-0");
      expect(result.classes).toContain("z-20");
    });

    it("editing variant to another known breakpoint", () => {
      const original = "lg:hidden";
      const css = tailwindClassesToCssDeclarations(original);
      // User changes 1024px to 768px (md breakpoint)
      const modified = css.replace("1024px", "768px");
      const result = convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("md:hidden");
    });

    it("mixed variant + non-variant lines", () => {
      const css = [
        "position: fixed;",
        "left: 0px;",
        "z-index: 20;",
        "@media (min-width: 1024px) { display: none; }",
      ].join("\n");
      const result = convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("fixed");
      expect(result.classes).toContain("lg:hidden");
    });

    it("user adds new variant block as untagged CSS", () => {
      const original = "flex";
      const css = tailwindClassesToCssDeclarations(original);
      const modified = css + "\n@media (min-width: 1024px) { display: none; }";
      const result = convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).toContain("lg:hidden");
    });
  });

  describe("comment stripping safety", () => {
    it("does not parse properties inside comments", () => {
      const css = "/* min-width: 100px */ display: flex;";
      const result = convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).not.toContain("[min-width");
    });
  });
});
