import * as vscode from "vscode";

export interface ClassMatch {
  line: number;
  valueStart: number;
  valueEnd: number;
  existingClasses: string;
  quoteChar: string;
  isDynamic: boolean;
}

export class CssToTailwindCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  refresh(): void {
    this._onDidChangeCodeLenses.fire();
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const config = vscode.workspace.getConfiguration("cssTailwind");
    if (!config.get<boolean>("showCodeLens", true)) {
      return [];
    }

    const lenses: vscode.CodeLens[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const match = this.findClassAttribute(line.text, i);
      if (!match) {
        continue;
      }

      const range = new vscode.Range(i, 0, i, line.text.length);

      lenses.push(
        new vscode.CodeLens(range, {
          title: "✏️ Edit CSS",
          command: "cssTailwind.editCss",
          arguments: [
            document.uri.toString(),
            match.line,
            match.valueStart,
            match.valueEnd,
            match.existingClasses,
            match.quoteChar,
            match.isDynamic,
          ],
        })
      );
    }

    return lenses;
  }

  findClassAttribute(text: string, lineNum: number): ClassMatch | null {
    // 1. Dynamic JSX expression: className={...} (not a template literal)
    const dynamicRegex = /\bclass(?:Name)?\s*=\s*\{(?![\s]*`)/;
    if (dynamicRegex.test(text)) {
      const templateRegex = /\bclass(?:Name)?\s*=\s*\{\s*`([^`]*)`\s*\}/;
      const templateMatch = templateRegex.exec(text);
      if (templateMatch) {
        const fullMatchIndex = templateMatch.index;
        const beforeValue =
          text.substring(0, fullMatchIndex) +
          text.substring(fullMatchIndex).split("`")[0] +
          "`";
        const valueStart = beforeValue.length;
        const valueEnd = valueStart + templateMatch[1].length;
        return {
          line: lineNum,
          valueStart,
          valueEnd,
          existingClasses: templateMatch[1],
          quoteChar: "`",
          isDynamic: false,
        };
      }

      return {
        line: lineNum,
        valueStart: 0,
        valueEnd: 0,
        existingClasses: "",
        quoteChar: "",
        isDynamic: true,
      };
    }

    // 2. Static string: className="..." or class='...'
    const staticRegex = /\bclass(?:Name)?\s*=\s*(["'`])([\s\S]*?)\1/;
    const staticMatch = staticRegex.exec(text);
    if (staticMatch) {
      const quoteChar = staticMatch[1];
      const existingClasses = staticMatch[2];
      const matchStart = staticMatch.index;
      const prefix = text.substring(matchStart, matchStart + staticMatch[0].length);
      const quoteOpenIndex = matchStart + prefix.indexOf(quoteChar);
      const valueStart = quoteOpenIndex + 1;
      const valueEnd = valueStart + existingClasses.length;

      return {
        line: lineNum,
        valueStart,
        valueEnd,
        existingClasses,
        quoteChar,
        isDynamic: false,
      };
    }

    return null;
  }
}
