export interface StringLiteralMatch {
  line: number;
  valueStart: number;
  valueEnd: number;
  content: string;
  quoteChar: string;
}

/**
 * Scans a line of text for className/class attributes and extracts
 * all string literals found within the attribute expression.
 * Works for single-line cases like className="flex gap-2".
 */
export function findStringLiterals(
  text: string,
  lineNum: number
): StringLiteralMatch[] {
  const results: StringLiteralMatch[] = [];
  const attrRegex = /\bclass(?:Name)?\s*=\s*/g;

  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = attrRegex.exec(text)) !== null) {
    const searchStart = attrMatch.index + attrMatch[0].length;
    scanStrings(text, searchStart, lineNum, results);
  }

  return results;
}

/**
 * Scans a single line for string literals (without requiring className= on the same line).
 * Used when we already know the line is inside a className expression.
 */
export function findStringLiteralsInLine(
  text: string,
  lineNum: number
): StringLiteralMatch[] {
  const results: StringLiteralMatch[] = [];
  scanInsideExpression(text, 0, lineNum, results);
  return results;
}

function scanStrings(
  text: string,
  start: number,
  lineNum: number,
  results: StringLiteralMatch[]
): void {
  let i = start;

  const firstChar = text[i];
  if (firstChar === "{") {
    i++;
    scanInsideExpression(text, i, lineNum, results, 1);
  } else if (firstChar === '"' || firstChar === "'" || firstChar === "`") {
    extractStringLiteral(text, i, lineNum, results);
  }
}

function scanInsideExpression(
  text: string,
  start: number,
  lineNum: number,
  results: StringLiteralMatch[],
  braceDepth?: number
): void {
  let i = start;

  while (i < text.length) {
    const ch = text[i];

    if (braceDepth !== undefined) {
      if (ch === "{") {
        braceDepth++;
        i++;
        continue;
      } else if (ch === "}") {
        braceDepth--;
        if (braceDepth <= 0) break;
        i++;
        continue;
      }
    }

    if (ch === "(" || ch === ")") {
      i++;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      i = extractStringLiteral(text, i, lineNum, results);
    } else {
      i++;
    }
  }
}

/**
 * Extracts a string literal starting at position `start` (the opening quote).
 * Returns the index after the closing quote.
 */
function extractStringLiteral(
  text: string,
  start: number,
  lineNum: number,
  results: StringLiteralMatch[]
): number {
  const quoteChar = text[start];
  let i = start + 1;
  let content = "";

  while (i < text.length) {
    const ch = text[i];

    if (ch === "\\" && i + 1 < text.length) {
      content += text[i + 1];
      i += 2;
      continue;
    }

    if (quoteChar === "`" && ch === "$" && text[i + 1] === "{") {
      let depth = 1;
      i += 2;
      while (i < text.length && depth > 0) {
        if (text[i] === "{") {
          depth++;
        } else if (text[i] === "}") {
          depth--;
        } else if (text[i] === '"' || text[i] === "'" || text[i] === "`") {
          const nestedQuote = text[i];
          i++;
          while (i < text.length && text[i] !== nestedQuote) {
            if (text[i] === "\\" && i + 1 < text.length) i++;
            i++;
          }
          if (i < text.length) i++;
          continue;
        }
        i++;
      }
      content += " ";
      continue;
    }

    if (ch === quoteChar) {
      const valueStart = start + 1;
      const valueEnd = i;
      const trimmed = content.trim();
      if (trimmed.length > 0) {
        results.push({
          line: lineNum,
          valueStart,
          valueEnd,
          content,
          quoteChar,
        });
      }
      return i + 1;
    }

    content += ch;
    i++;
  }

  const valueStart = start + 1;
  const valueEnd = i;
  const trimmed = content.trim();
  if (trimmed.length > 0) {
    results.push({
      line: lineNum,
      valueStart,
      valueEnd,
      content,
      quoteChar,
    });
  }
  return i;
}
