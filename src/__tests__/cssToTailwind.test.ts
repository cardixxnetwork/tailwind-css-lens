import { describe, it, expect } from "vitest";
import { convertCssToTailwind } from "../cssToTailwind";
import { tailwindClassesToCssDeclarations } from "../tailwindToCss";

describe("convertCssToTailwind", async () => {
  describe("tagged round-trip (unchanged lines)", async () => {
    it("preserves original classes when CSS is unchanged", async () => {
      const original = "fixed inset-0 z-50 flex items-center justify-center bg-black/40";
      const css = await tailwindClassesToCssDeclarations(original);
      const result = await convertCssToTailwind(css);
      expect(result.success).toBe(true);
      // All original classes preserved exactly
      expect(result.classes).toBe(original);
    });

    it("preserves gradient + color stops unchanged", async () => {
      const original = "bg-linear-to-t from-white via-white/80 to-transparent px-6 pb-6 pt-10";
      const css = await tailwindClassesToCssDeclarations(original);
      const result = await convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });

    it("preserves variant prefixed classes", async () => {
      const original = "lg:hidden hover:underline dark:text-white";
      const css = await tailwindClassesToCssDeclarations(original);
      const result = await convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });

    it("preserves stacked variant classes", async () => {
      const original = "dark:hover:text-white lg:hover:bg-blue-500";
      const css = await tailwindClassesToCssDeclarations(original);
      const result = await convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });

    it("preserves complex class list unchanged", async () => {
      const original = "flex flex-col gap-4 p-4 rounded-lg shadow-md bg-white text-sm font-medium";
      const css = await tailwindClassesToCssDeclarations(original);
      const result = await convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });
  });

  describe("tagged round-trip (modified lines)", async () => {
    it("only re-converts changed lines, keeps unchanged", async () => {
      const original = "flex items-center p-4";
      const css = await tailwindClassesToCssDeclarations(original);
      // Change p-4 (padding: 1rem) to padding: 2rem (p-8)
      const modified = css.replace("padding: 1rem;", "padding: 2rem;");
      const result = await convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).toContain("items-center");
      expect(result.classes).toContain("p-8");
      expect(result.classes).not.toContain("p-4");
    });

    it("user modifies simple property value", async () => {
      const original = "flex items-center gap-3";
      const css = await tailwindClassesToCssDeclarations(original);
      // Change gap from 0.75rem (gap-3) to 1rem (gap-4)
      const modified = css.replace("gap: 0.75rem;", "gap: 1rem;");
      const result = await convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).toContain("items-center");
      expect(result.classes).toContain("gap-4");
      expect(result.classes).not.toContain("gap-3");
    });

    it("deleted line removes the class", async () => {
      const original = "flex items-center p-4";
      const css = await tailwindClassesToCssDeclarations(original);
      // Remove the padding line
      const modified = css
        .split("\n")
        .filter((l) => !l.includes("padding"))
        .join("\n");
      const result = await convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).toContain("items-center");
      expect(result.classes).not.toContain("p-4");
    });

    it("no duplicate arbitrary when translator produces arbitrary class", async () => {
      const original = "rounded-full bg-black";
      const css = await tailwindClassesToCssDeclarations(original);
      // User changes border-radius from 50% to 30%
      const modified = css.replace("border-radius: 50%;", "border-radius: 30%;");
      const result = await convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("bg-black");
      // Should not have duplicate border-radius entries
      const brClasses = result.classes.split(" ").filter((c) => c.includes("border-radius") || c.includes("rounded"));
      expect(brClasses.length).toBe(1);
    });
  });

  describe("untagged CSS (user adds new lines)", async () => {
    it("converts new plain CSS", async () => {
      const result = await convertCssToTailwind("display: flex;");
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
    });

    it("converts position: fixed", async () => {
      const result = await convertCssToTailwind("position: fixed;");
      expect(result.success).toBe(true);
      expect(result.classes).toContain("fixed");
    });

    it("handles empty input", async () => {
      const result = await convertCssToTailwind("");
      expect(result.success).toBe(false);
    });

    it("user adds a new line to existing tagged CSS", async () => {
      const original = "flex items-center";
      const css = await tailwindClassesToCssDeclarations(original);
      // User adds a new untagged line
      const modified = css + "\npadding: 1rem;";
      const result = await convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).toContain("items-center");
      // New line should be converted
      expect(result.classes).toContain("p-4");
    });
  });

  describe("real CSS variant blocks", async () => {
    it("responsive variant in tagged CSS round-trips", async () => {
      const original = "flex lg:hidden";
      const css = await tailwindClassesToCssDeclarations(original);
      const result = await convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toBe(original);
    });

    it("output format uses real CSS blocks for variants", async () => {
      const css = await tailwindClassesToCssDeclarations("lg:hidden");
      // Should be real CSS, not a comment
      expect(css).toContain("@media (width >= 64rem)");
      expect(css).toContain("{");
      expect(css).toContain("display: none;");
      expect(css).toContain("}");
      // Should NOT have comment-wrapped variant
      expect(css).not.toMatch(/\/\*\s*@media/);
    });

    it("stacked variant output uses nested CSS blocks", async () => {
      const css = await tailwindClassesToCssDeclarations("dark:hover:text-white");
      expect(css).toContain("@media (prefers-color-scheme: dark)");
      expect(css).toContain("&:hover");
      expect(css).toContain("{");
    });

    it("editing variant breakpoint changes the class", async () => {
      const original = "fixed inset-x-0 bottom-0 z-20 lg:hidden";
      const css = await tailwindClassesToCssDeclarations(original);
      // User changes 64rem to 100rem (engine format: width >= 64rem)
      const modified = css.replace("64rem", "100rem");
      const result = await convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      // Variant should change — no longer lg breakpoint
      expect(result.classes).not.toContain("lg:hidden");
      // Other classes unchanged
      expect(result.classes).toContain("fixed");
      expect(result.classes).toContain("inset-x-0");
      expect(result.classes).toContain("bottom-0");
      expect(result.classes).toContain("z-20");
    });

    it("editing variant to another known breakpoint", async () => {
      const original = "lg:hidden";
      const css = await tailwindClassesToCssDeclarations(original);
      // User changes 64rem (lg) to 48rem (md)
      const modified = css.replace("64rem", "48rem");
      const result = await convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("md:hidden");
    });

    it("mixed variant + non-variant lines", async () => {
      const css = [
        "position: fixed;",
        "left: 0px;",
        "z-index: 20;",
        "@media (width >= 64rem) { display: none; }",
      ].join("\n");
      const result = await convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("fixed");
      expect(result.classes).toContain("lg:hidden");
    });

    it("user adds new variant block as untagged CSS", async () => {
      const original = "flex";
      const css = await tailwindClassesToCssDeclarations(original);
      const modified = css + "\n@media (width >= 64rem) { display: none; }";
      const result = await convertCssToTailwind(modified);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).toContain("lg:hidden");
    });
  });

  describe("comment stripping safety", async () => {
    it("does not parse properties inside comments", async () => {
      const css = "/* min-width: 100px */ display: flex;";
      const result = await convertCssToTailwind(css);
      expect(result.success).toBe(true);
      expect(result.classes).toContain("flex");
      expect(result.classes).not.toContain("[min-width");
    });
  });
});
