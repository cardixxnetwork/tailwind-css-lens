import * as vscode from "vscode";
import { tailwindClassesToCssDeclarations } from "./tailwindToCss";
import { convertCssToTailwind } from "./cssToTailwind";

interface EditContext {
  documentUri: string;
  line: number;
  valueStart: number;
  valueEnd: number;
  quoteChar: string;
}

function getNonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class CssEditorPanel {
  private static currentPanel: CssEditorPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private editContext: EditContext;
  private disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    editContext: EditContext,
    initialCss: string
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.editContext = editContext;

    this.panel.webview.html = this.getHtml(initialCss);

    this.panel.webview.onDidReceiveMessage(
      (msg) => this.handleMessage(msg),
      null,
      this.disposables
    );

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  static show(
    extensionUri: vscode.Uri,
    editContext: EditContext,
    existingClasses: string
  ): void {
    const cssDeclarations = tailwindClassesToCssDeclarations(existingClasses);

    if (CssEditorPanel.currentPanel) {
      CssEditorPanel.currentPanel.editContext = editContext;
      CssEditorPanel.currentPanel.panel.webview.html =
        CssEditorPanel.currentPanel.getHtml(cssDeclarations);
      CssEditorPanel.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "cssTailwindEditor",
      "CSS Editor",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "out", "webview"),
        ],
      }
    );

    CssEditorPanel.currentPanel = new CssEditorPanel(
      panel,
      extensionUri,
      editContext,
      cssDeclarations
    );
  }

  private async handleMessage(msg: {
    type: string;
    css?: string;
  }): Promise<void> {
    if (msg.type === "apply" && msg.css !== undefined) {
      await this.applyCss(msg.css);
    } else if (msg.type === "cancel") {
      this.panel.dispose();
    }
  }

  private async applyCss(cssInput: string): Promise<void> {
    const trimmed = cssInput.trim();

    if (!trimmed) {
      vscode.window.showWarningMessage("No CSS to apply.");
      return;
    }

    const result = convertCssToTailwind(trimmed);

    if (!result.success) {
      vscode.window.showWarningMessage(
        `CSS to Tailwind: ${result.warnings.join(", ")}`
      );
      return;
    }

    if (result.warnings.length > 0) {
      vscode.window.showInformationMessage(
        `Some properties used arbitrary values: ${result.warnings.join("; ")}`
      );
    }

    const documentUri = vscode.Uri.parse(this.editContext.documentUri);
    const edit = new vscode.WorkspaceEdit();
    const range = new vscode.Range(
      this.editContext.line,
      this.editContext.valueStart,
      this.editContext.line,
      this.editContext.valueEnd
    );
    edit.replace(documentUri, range, result.classes);

    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
      this.editContext.valueEnd =
        this.editContext.valueStart + result.classes.length;
      vscode.window.showInformationMessage(`Applied: ${result.classes}`);
    } else {
      vscode.window.showErrorMessage("Failed to apply edit.");
    }
  }

  private getHtml(initialCss: string): string {
    const webview = this.panel.webview;
    const nonce = getNonce();

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "out", "webview", "cssEditor.js")
    );

    const escapedCss = initialCss
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
      `font-src ${webview.cspSource}`,
    ].join("; ");

    return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <title>CSS Editor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
      background: var(--vscode-editor-background, #1e1e1e);
      color: var(--vscode-editor-foreground, #d4d4d4);
      padding: 16px;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    h2 {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--vscode-foreground, #ccc);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    #editor {
      flex: 1;
      min-height: 200px;
      border: 1px solid var(--vscode-input-border, #3e3e3e);
      border-radius: 4px;
      overflow: hidden;
    }

    .hint {
      font-size: 11px;
      color: var(--vscode-descriptionForeground, #888);
      margin-top: 8px;
      margin-bottom: 12px;
    }

    .hint code {
      font-family: var(--vscode-editor-font-family, monospace);
      background: var(--vscode-textCodeBlock-background, rgba(255,255,255,0.1));
      padding: 1px 4px;
      border-radius: 3px;
    }

    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding-top: 12px;
      border-top: 1px solid var(--vscode-panel-border, #333);
    }

    button {
      padding: 6px 16px;
      font-size: 13px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-family: var(--vscode-font-family);
    }

    .btn-apply {
      background: var(--vscode-button-background, #007acc);
      color: var(--vscode-button-foreground, #fff);
    }
    .btn-apply:hover {
      background: var(--vscode-button-hoverBackground, #005a9e);
    }

    .btn-cancel {
      background: var(--vscode-button-secondaryBackground, #3a3d41);
      color: var(--vscode-button-secondaryForeground, #ccc);
    }
    .btn-cancel:hover {
      background: var(--vscode-button-secondaryHoverBackground, #505050);
    }
  </style>
</head>
<body data-initial-css="${escapedCss}">
  <h2>CSS Editor</h2>
  <div id="editor"></div>
  <p class="hint">Write CSS properties (e.g. <code>display: flex; gap: 16px;</code>). Press <code>Ctrl+Space</code> for autocomplete, <code>Cmd/Ctrl+Enter</code> to apply.</p>
  <div class="actions">
    <button class="btn-cancel" id="cancelBtn">Cancel</button>
    <button class="btn-apply" id="applyBtn">Apply</button>
  </div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private dispose(): void {
    CssEditorPanel.currentPanel = undefined;
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
    this.panel.dispose();
  }
}
