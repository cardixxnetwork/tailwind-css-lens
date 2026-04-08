"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssEditorPanel = void 0;
const vscode = __importStar(require("vscode"));
const tailwindToCss_1 = require("./tailwindToCss");
const cssToTailwind_1 = require("./cssToTailwind");
function getNonce() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
class CssEditorPanel {
    constructor(panel, extensionUri, editContext, initialCss) {
        this.disposables = [];
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.editContext = editContext;
        this.panel.webview.html = this.getHtml(initialCss);
        this.panel.webview.onDidReceiveMessage((msg) => this.handleMessage(msg), null, this.disposables);
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }
    static show(extensionUri, editContext, existingClasses) {
        const cssDeclarations = (0, tailwindToCss_1.tailwindClassesToCssDeclarations)(existingClasses);
        if (CssEditorPanel.currentPanel) {
            CssEditorPanel.currentPanel.editContext = editContext;
            CssEditorPanel.currentPanel.panel.webview.html =
                CssEditorPanel.currentPanel.getHtml(cssDeclarations);
            CssEditorPanel.currentPanel.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }
        const panel = vscode.window.createWebviewPanel("cssTailwindEditor", "CSS Editor", vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, "out", "webview"),
            ],
        });
        CssEditorPanel.currentPanel = new CssEditorPanel(panel, extensionUri, editContext, cssDeclarations);
    }
    async handleMessage(msg) {
        if (msg.type === "apply" && msg.css !== undefined) {
            await this.applyCss(msg.css);
        }
        else if (msg.type === "cancel") {
            this.panel.dispose();
        }
    }
    async applyCss(cssInput) {
        const trimmed = cssInput.trim();
        if (!trimmed) {
            vscode.window.showWarningMessage("No CSS to apply.");
            return;
        }
        const result = (0, cssToTailwind_1.convertCssToTailwind)(trimmed);
        if (!result.success) {
            vscode.window.showWarningMessage(`CSS to Tailwind: ${result.warnings.join(", ")}`);
            return;
        }
        if (result.warnings.length > 0) {
            vscode.window.showInformationMessage(`Some properties used arbitrary values: ${result.warnings.join("; ")}`);
        }
        const documentUri = vscode.Uri.parse(this.editContext.documentUri);
        const edit = new vscode.WorkspaceEdit();
        const range = new vscode.Range(this.editContext.line, this.editContext.valueStart, this.editContext.line, this.editContext.valueEnd);
        edit.replace(documentUri, range, result.classes);
        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
            this.editContext.valueEnd =
                this.editContext.valueStart + result.classes.length;
            vscode.window.showInformationMessage(`Applied: ${result.classes}`);
        }
        else {
            vscode.window.showErrorMessage("Failed to apply edit.");
        }
    }
    getHtml(initialCss) {
        const webview = this.panel.webview;
        const nonce = getNonce();
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "out", "webview", "cssEditor.js"));
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
    dispose() {
        CssEditorPanel.currentPanel = undefined;
        for (const d of this.disposables) {
            d.dispose();
        }
        this.disposables = [];
        this.panel.dispose();
    }
}
exports.CssEditorPanel = CssEditorPanel;
//# sourceMappingURL=cssEditorPanel.js.map