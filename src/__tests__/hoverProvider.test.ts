import { describe, it, expect } from "vitest";
import { findStringLiterals, findStringLiteralsInLine, StringLiteralMatch } from "../classStringParser";

describe("findStringLiterals", () => {
  it("finds a simple double-quoted className", () => {
    const matches = findStringLiterals('className="flex gap-2"', 0);
    expect(matches).toEqual([
      {
        line: 0,
        valueStart: 11,
        valueEnd: 21,
        content: "flex gap-2",
        quoteChar: '"',
      },
    ]);
  });

  it("finds a single-quoted class", () => {
    const matches = findStringLiterals("class='flex gap-2'", 0);
    expect(matches).toEqual([
      {
        line: 0,
        valueStart: 7,
        valueEnd: 17,
        content: "flex gap-2",
        quoteChar: "'",
      },
    ]);
  });

  it("finds a backtick template literal", () => {
    const matches = findStringLiterals("className={`flex gap-2`}", 0);
    expect(matches).toEqual([
      {
        line: 0,
        valueStart: 12,
        valueEnd: 22,
        content: "flex gap-2",
        quoteChar: "`",
      },
    ]);
  });

  it("finds multiple strings inside cn()", () => {
    const text = 'className={cn("flex gap-2", isActive && "bg-blue-500")}';
    const matches = findStringLiterals(text, 5);
    expect(matches).toHaveLength(2);
    expect(matches[0].content).toBe("flex gap-2");
    expect(matches[0].quoteChar).toBe('"');
    expect(matches[1].content).toBe("bg-blue-500");
    expect(matches[1].quoteChar).toBe('"');
  });

  it("finds strings in a ternary expression", () => {
    const text = 'className={isMobile ? "h-12 px-5" : "h-12 w-[140px] px-5"}';
    const matches = findStringLiterals(text, 0);
    expect(matches).toHaveLength(2);
    expect(matches[0].content).toBe("h-12 px-5");
    expect(matches[1].content).toBe("h-12 w-[140px] px-5");
  });

  it("finds strings with mixed quote types", () => {
    const text = "className={cn('flex', \"gap-2\")}";
    const matches = findStringLiterals(text, 0);
    expect(matches).toHaveLength(2);
    expect(matches[0]).toMatchObject({ content: "flex", quoteChar: "'" });
    expect(matches[1]).toMatchObject({ content: "gap-2", quoteChar: '"' });
  });

  it("handles escaped quotes in strings", () => {
    const text = 'className="content-[\'hello\']"';
    const matches = findStringLiterals(text, 0);
    expect(matches).toHaveLength(1);
    expect(matches[0].content).toBe("content-['hello']");
  });

  it("handles template literal with interpolation", () => {
    const text = "className={`flex ${isActive ? 'block' : 'hidden'} gap-2`}";
    const matches = findStringLiterals(text, 0);
    expect(matches).toHaveLength(1);
    // Content should have the static portions with a space placeholder for interpolation
    expect(matches[0].content).toBe("flex   gap-2");
    expect(matches[0].quoteChar).toBe("`");
  });

  it("returns empty array for lines without className/class", () => {
    const matches = findStringLiterals('const x = "hello"', 0);
    expect(matches).toEqual([]);
  });

  it("returns empty array for empty className", () => {
    const matches = findStringLiterals('className=""', 0);
    expect(matches).toEqual([]);
  });

  it("preserves correct line number", () => {
    const matches = findStringLiterals('className="flex"', 42);
    expect(matches[0].line).toBe(42);
  });

  it("reports correct positions for cn() strings", () => {
    const text = 'className={cn("flex gap-2", isActive && "bg-blue-500")}';
    const matches = findStringLiterals(text, 0);

    // "flex gap-2" starts after cn(" at position 15
    expect(text.substring(matches[0].valueStart, matches[0].valueEnd)).toBe(
      "flex gap-2"
    );
    // "bg-blue-500" positions
    expect(text.substring(matches[1].valueStart, matches[1].valueEnd)).toBe(
      "bg-blue-500"
    );
  });

  it("finds strings in clsx()", () => {
    const text = 'className={clsx("base-class", condition && "active-class")}';
    const matches = findStringLiterals(text, 0);
    expect(matches).toHaveLength(2);
    expect(matches[0].content).toBe("base-class");
    expect(matches[1].content).toBe("active-class");
  });

  it("handles nested function calls", () => {
    const text =
      'className={cn(twMerge("flex", "gap-2"), isActive && "bg-blue-500")}';
    const matches = findStringLiterals(text, 0);
    expect(matches).toHaveLength(3);
    expect(matches[0].content).toBe("flex");
    expect(matches[1].content).toBe("gap-2");
    expect(matches[2].content).toBe("bg-blue-500");
  });

  it("works with HTML class attribute", () => {
    const matches = findStringLiterals('class="flex items-center"', 0);
    expect(matches).toHaveLength(1);
    expect(matches[0].content).toBe("flex items-center");
  });

  it("finds class with leading whitespace/indentation", () => {
    const text = '    className="flex gap-2"';
    const matches = findStringLiterals(text, 0);
    expect(matches).toHaveLength(1);
    expect(matches[0].content).toBe("flex gap-2");
    expect(text.substring(matches[0].valueStart, matches[0].valueEnd)).toBe(
      "flex gap-2"
    );
  });
});

describe("findStringLiteralsInLine", () => {
  it("finds a string on a line inside a multi-line className", () => {
    // Simulates a line like:   "relative flex cursor-pointer",
    const text = '          "relative flex cursor-pointer",';
    const matches = findStringLiteralsInLine(text, 3);
    expect(matches).toHaveLength(1);
    expect(matches[0].content).toBe("relative flex cursor-pointer");
    expect(matches[0].line).toBe(3);
    expect(text.substring(matches[0].valueStart, matches[0].valueEnd)).toBe(
      "relative flex cursor-pointer"
    );
  });

  it("finds both strings in a ternary on a continuation line", () => {
    const text = '          isMobile ? "h-12 px-5" : "h-12 w-[140px] px-5",';
    const matches = findStringLiteralsInLine(text, 5);
    expect(matches).toHaveLength(2);
    expect(matches[0].content).toBe("h-12 px-5");
    expect(matches[1].content).toBe("h-12 w-[140px] px-5");
    expect(text.substring(matches[0].valueStart, matches[0].valueEnd)).toBe(
      "h-12 px-5"
    );
    expect(text.substring(matches[1].valueStart, matches[1].valueEnd)).toBe(
      "h-12 w-[140px] px-5"
    );
  });

  it("returns empty for a line with no string literals", () => {
    const matches = findStringLiteralsInLine("          isMobile &&", 2);
    expect(matches).toEqual([]);
  });

  it("finds single-quoted strings", () => {
    const text = "          'flex gap-2',";
    const matches = findStringLiteralsInLine(text, 1);
    expect(matches).toHaveLength(1);
    expect(matches[0].content).toBe("flex gap-2");
    expect(matches[0].quoteChar).toBe("'");
  });

  it("ignores empty strings", () => {
    const matches = findStringLiteralsInLine('          "",', 0);
    expect(matches).toEqual([]);
  });
});
