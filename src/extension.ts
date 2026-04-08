import * as vscode from "vscode";
import { CssToTailwindHoverProvider } from "./hoverProvider";
import { CssEditorPanel } from "./cssEditorPanel";

export function activate(context: vscode.ExtensionContext): void {
  const documentSelectors: vscode.DocumentSelector = [
    { language: "javascriptreact" },
    { language: "typescriptreact" },
    { language: "html" },
    { language: "vue" },
  ];

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      documentSelectors,
      new CssToTailwindHoverProvider()
    )
  );

  // Command: Edit CSS — opens the webview CSS editor panel
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "cssTailwind.editCss",
      (
        uriString: string,
        line: number,
        valueStart: number,
        valueEnd: number,
        existingClasses: string,
        quoteChar: string
      ) => {
        CssEditorPanel.show(
          context.extensionUri,
          {
            documentUri: uriString,
            line,
            valueStart,
            valueEnd,
            quoteChar,
          },
          existingClasses
        );
      }
    )
  );
}

export function deactivate(): void {
  // Cleanup handled by disposables
}
