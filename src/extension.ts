import * as vscode from "vscode";
import { CssToTailwindCodeLensProvider } from "./codeLensProvider";
import { CssEditorPanel } from "./cssEditorPanel";

export function activate(context: vscode.ExtensionContext): void {
  const documentSelectors: vscode.DocumentSelector = [
    { language: "javascriptreact" },
    { language: "typescriptreact" },
    { language: "html" },
    { language: "vue" },
  ];

  const codeLensProvider = new CssToTailwindCodeLensProvider();

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(documentSelectors, codeLensProvider)
  );

  // Refresh CodeLens when settings change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("cssTailwind")) {
        codeLensProvider.refresh();
      }
    })
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
        _quoteChar: string,
        isDynamic: boolean
      ) => {
        if (isDynamic) {
          vscode.window.showErrorMessage(
            "Cannot edit dynamic className expressions. Use a static string instead."
          );
          return;
        }

        CssEditorPanel.show(
          context.extensionUri,
          {
            documentUri: uriString,
            line,
            valueStart,
            valueEnd,
            quoteChar: _quoteChar,
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
