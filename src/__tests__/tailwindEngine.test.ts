import { describe, it, expect, beforeEach } from "vitest";
import { resolveClass, resolveClasses, clearCache, _testing } from "../tailwindEngine";

const { extractThemeVars, resolveVars, resolveCalc, parseDeclarations, unescapeSelector } = _testing;

beforeEach(() => {
  // Don't clear cache between tests — engine init is expensive
});

describe("tailwindEngine", () => {
  describe("resolveClass", () => {
    it("resolves display utilities", async () => {
      expect(await resolveClass("flex")).toBe("display: flex");
      expect(await resolveClass("hidden")).toBe("display: none");
      expect(await resolveClass("block")).toBe("display: block");
      expect(await resolveClass("inline")).toBe("display: inline");
      expect(await resolveClass("grid")).toBe("display: grid");
    });

    it("resolves spacing utilities", async () => {
      const p4 = await resolveClass("p-4");
      expect(p4).toContain("padding");
      expect(p4).toContain("1rem");

      const px6 = await resolveClass("px-6");
      expect(px6).toContain("padding");
      expect(px6).toContain("1.5rem");
    });

    it("resolves color utilities", async () => {
      const text = await resolveClass("text-red-500");
      expect(text).toContain("color:");

      const bg = await resolveClass("bg-blue-500");
      expect(bg).toContain("background-color:");
    });

    it("resolves font utilities", async () => {
      const bold = await resolveClass("font-bold");
      expect(bold).toContain("font-weight");
      expect(bold).toContain("700");

      const semibold = await resolveClass("font-semibold");
      expect(semibold).toContain("font-weight");
      expect(semibold).toContain("600");
    });

    it("resolves border-radius", async () => {
      const lg = await resolveClass("rounded-lg");
      expect(lg).toContain("border-radius");
      expect(lg).toContain("0.5rem");

      const full = await resolveClass("rounded-full");
      expect(full).toContain("border-radius");
    });

    it("resolves sizing utilities", async () => {
      expect(await resolveClass("w-full")).toBe("width: 100%");
      const h10 = await resolveClass("h-10");
      expect(h10).toContain("height");
    });

    it("returns null for unknown classes", async () => {
      expect(await resolveClass("nonexistent-class")).toBeNull();
      expect(await resolveClass("totally-fake")).toBeNull();
    });

    it("resolves variant classes with nested CSS blocks", async () => {
      const lgHidden = await resolveClass("lg:hidden");
      expect(lgHidden).toContain("@media");
      expect(lgHidden).toContain("display: none");

      const hoverUnderline = await resolveClass("hover:underline");
      expect(hoverUnderline).toContain("&:hover");
      expect(hoverUnderline).toContain("text-decoration-line: underline");
    });

    it("resolves opacity classes with color-mix", async () => {
      const bgBlack40 = await resolveClass("bg-black/40");
      expect(bgBlack40).toContain("background-color");
      expect(bgBlack40).toContain("color-mix");
      expect(bgBlack40).toContain("40%");
    });
  });

  describe("resolveClasses (batch)", () => {
    it("resolves multiple classes at once", async () => {
      const results = await resolveClasses(["flex", "hidden", "p-4", "nonexistent"]);
      expect(results.get("flex")).toBe("display: flex");
      expect(results.get("hidden")).toBe("display: none");
      expect(results.get("p-4")).toContain("padding");
      expect(results.get("nonexistent")).toBeNull();
    });
  });

  describe("internal helpers", () => {
    it("resolveCalc handles multiplication", () => {
      expect(resolveCalc("calc(0.25rem * 4)")).toBe("1rem");
      expect(resolveCalc("calc(0.25rem * 8)")).toBe("2rem");
    });

    it("resolveCalc handles division", () => {
      expect(resolveCalc("calc(1.25 / 0.875)")).toBe("1.42857");
    });

    it("resolveVars resolves known variables", () => {
      const vars = new Map([
        ["--spacing", "0.25rem"],
        ["--color-red-500", "oklch(63.7% 0.237 25.331)"],
      ]);
      expect(resolveVars("var(--spacing)", vars)).toBe("0.25rem");
      expect(resolveVars("var(--color-red-500)", vars)).toBe("oklch(63.7% 0.237 25.331)");
    });

    it("resolveVars uses fallback for unknown variables", () => {
      const vars = new Map<string, string>();
      expect(resolveVars("var(--unknown, 10px)", vars)).toBe("10px");
    });

    it("resolveVars handles nested var() in fallback", () => {
      const vars = new Map([
        ["--text-sm--line-height", "calc(1.25 / 0.875)"],
      ]);
      expect(resolveVars("var(--tw-leading, var(--text-sm--line-height))", vars)).toBe("1.42857");
    });

    it("unescapeSelector removes backslashes", () => {
      expect(unescapeSelector(".hover\\:underline")).toBe("hover:underline");
      expect(unescapeSelector(".w-1\\/2")).toBe("w-1/2");
      expect(unescapeSelector(".bg-black\\/40")).toBe("bg-black/40");
    });

    it("parseDeclarations extracts property-value pairs", () => {
      expect(parseDeclarations("{ display: flex; }")).toBe("display: flex");
      expect(parseDeclarations("{ font-weight: 700; color: red; }")).toBe("font-weight: 700; color: red");
    });
  });
});
