import * as vscode from "vscode";
import {
  findStringLiterals,
  findStringLiteralsInLine,
  StringLiteralMatch,
} from "./classStringParser";

export { findStringLiterals, findStringLiteralsInLine, StringLiteralMatch } from "./classStringParser";

export class CssToTailwindHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Hover | null {
    const lineText = document.lineAt(position.line).text;

    // First: check if className= is on this line (single-line case)
    const sameLineMatches = findStringLiterals(lineText, position.line);
    const hit = sameLineMatches.find(
      (m) =>
        position.character >= m.valueStart &&
        position.character <= m.valueEnd
    );
    if (hit) {
      return this.buildHover(document, hit);
    }

    // Second: check if we're inside a multi-line className expression
    if (this.isInsideClassNameExpression(document, position.line)) {
      const multiLineMatches = findStringLiteralsInLine(
        lineText,
        position.line
      );
      const multiHit = multiLineMatches.find(
        (m) =>
          position.character >= m.valueStart &&
          position.character <= m.valueEnd
      );
      if (multiHit) {
        return this.buildHover(document, multiHit);
      }
    }

    return null;
  }

  /**
   * Scans backwards from the given line to determine if we're inside
   * an open className={...} expression that started on a previous line.
   * Tracks brace/paren depth and skips string literals.
   */
  private isInsideClassNameExpression(
    document: vscode.TextDocument,
    line: number
  ): boolean {
    const maxLookback = 20;
    const startLine = Math.max(0, line - maxLookback);

    // Collect all text from startLine to (but not including) the current line
    let accumulated = "";
    for (let i = startLine; i < line; i++) {
      accumulated += document.lineAt(i).text + "\n";
    }

    // Find the last className/class attribute opening in the accumulated text
    const attrRegex = /\bclass(?:Name)?\s*=\s*\{/g;
    let lastAttrIndex = -1;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(accumulated)) !== null) {
      lastAttrIndex = m.index + m[0].length;
    }

    if (lastAttrIndex === -1) {
      return false;
    }

    // Scan from the opening brace to the end of accumulated text
    // to see if the expression is still open (braces not balanced)
    const remaining = accumulated.substring(lastAttrIndex);
    let braceDepth = 1;

    for (let i = 0; i < remaining.length; i++) {
      const ch = remaining[i];

      if (ch === '"' || ch === "'" || ch === "`") {
        // Skip over string literals
        const quote = ch;
        i++;
        while (i < remaining.length && remaining[i] !== quote) {
          if (remaining[i] === "\\" && i + 1 < remaining.length) i++;
          if (
            quote === "`" &&
            remaining[i] === "$" &&
            remaining[i + 1] === "{"
          ) {
            // Skip template interpolation
            let depth = 1;
            i += 2;
            while (i < remaining.length && depth > 0) {
              if (remaining[i] === "{") depth++;
              else if (remaining[i] === "}") depth--;
              else if (
                remaining[i] === '"' ||
                remaining[i] === "'" ||
                remaining[i] === "`"
              ) {
                const nq = remaining[i];
                i++;
                while (i < remaining.length && remaining[i] !== nq) {
                  if (remaining[i] === "\\" && i + 1 < remaining.length) i++;
                  i++;
                }
              }
              i++;
            }
            continue;
          }
          i++;
        }
        continue;
      }

      if (ch === "{") {
        braceDepth++;
      } else if (ch === "}") {
        braceDepth--;
        if (braceDepth <= 0) {
          return false; // Expression closed before our line
        }
      }
    }

    // If braceDepth > 0, the expression is still open at our line
    return braceDepth > 0;
  }

  private buildHover(
    document: vscode.TextDocument,
    match: StringLiteralMatch
  ): vscode.Hover {
    const args = encodeURIComponent(
      JSON.stringify([
        document.uri.toString(),
        match.line,
        match.valueStart,
        match.valueEnd,
        match.content,
        match.quoteChar,
      ])
    );

    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.appendMarkdown(
      `[✏️ Edit CSS](command:cssTailwind.editCss?${args})`
    );

    const range = new vscode.Range(
      match.line,
      match.valueStart,
      match.line,
      match.valueEnd
    );

    return new vscode.Hover(md, range);
  }
}
