import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { cssLanguage, cssCompletionSource } from "@codemirror/lang-css";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { LanguageSupport } from "@codemirror/language";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { cssValueCompletionSource } from "./cssCompletions";
import { tags } from "@lezer/highlight";

declare function acquireVsCodeApi(): { postMessage(msg: unknown): void };
const vscode = acquireVsCodeApi();

// Configure CSS parser for declaration-only mode (no selectors/at-rules)
const cssDeclarationsLanguage = cssLanguage.configure({ top: "Styles" });

// Combined completion source: value completions take priority over property names
function combinedCssCompletion(context: CompletionContext) {
  const valueResult = cssValueCompletionSource(context);
  if (valueResult) {
    return valueResult;
  }
  return cssCompletionSource(context);
}

const cssDeclarations = new LanguageSupport(
  cssDeclarationsLanguage,
  [] // no built-in autocomplete — we provide our own via override
);

// Theme that reads VS Code CSS variables — works for any VS Code theme
const vscodeEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--vscode-editor-background)",
    color: "var(--vscode-editor-foreground)",
    fontSize: "var(--vscode-editor-font-size, 13px)",
    fontFamily: "var(--vscode-editor-font-family, monospace)",
    height: "100%",
    flex: "1",
  },
  ".cm-gutters": {
    backgroundColor:
      "var(--vscode-editorGutter-background, var(--vscode-editor-background))",
    color: "var(--vscode-editorLineNumber-foreground)",
    border: "none",
  },
  ".cm-activeLineGutter": {
    backgroundColor:
      "var(--vscode-editor-lineHighlightBackground, transparent)",
  },
  ".cm-activeLine": {
    backgroundColor:
      "var(--vscode-editor-lineHighlightBackground, transparent)",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "var(--vscode-editorCursor-foreground)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor:
      "var(--vscode-editor-selectionBackground, rgba(0,120,215,0.3))",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--vscode-editorWidget-background)",
    border: "1px solid var(--vscode-editorWidget-border, #454545)",
    color: "var(--vscode-editorWidget-foreground)",
  },
  ".cm-tooltip-autocomplete": {
    backgroundColor: "var(--vscode-editorSuggestWidget-background)",
  },
  ".cm-tooltip-autocomplete ul li": {
    color: "var(--vscode-editorSuggestWidget-foreground)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor:
      "var(--vscode-editorSuggestWidget-selectedBackground)",
    color: "var(--vscode-editorSuggestWidget-selectedForeground)",
  },
  ".cm-matchingBracket": {
    backgroundColor:
      "var(--vscode-editorBracketMatch-background, rgba(0,100,200,0.3))",
    outline:
      "1px solid var(--vscode-editorBracketMatch-border, transparent)",
  },
  ".cm-selectionMatch": {
    backgroundColor:
      "var(--vscode-editor-selectionHighlightBackground, rgba(200,200,200,0.2))",
  },
  ".cm-searchMatch": {
    backgroundColor:
      "var(--vscode-editor-findMatchHighlightBackground, rgba(234,184,0,0.3))",
  },
  ".cm-content": {
    caretColor: "var(--vscode-editorCursor-foreground)",
  },
  ".cm-scroller": { overflow: "auto" },
});

// Syntax highlighting using VS Code's semantic token colors
const vscodeHighlightStyle = HighlightStyle.define([
  // CSS property names → use the VS Code "support.type.property-name" color
  {
    tag: tags.propertyName,
    color: "var(--vscode-debugTokenExpression-name, #9cdcfe)",
  },
  // Values: strings
  {
    tag: tags.string,
    color: "var(--vscode-debugTokenExpression-string, #ce9178)",
  },
  // Values: numbers and units
  {
    tag: tags.number,
    color: "var(--vscode-debugTokenExpression-number, #b5cea8)",
  },
  {
    tag: tags.unit,
    color: "var(--vscode-debugTokenExpression-number, #b5cea8)",
  },
  // Keywords (inherit, auto, flex, etc.)
  {
    tag: tags.keyword,
    color: "var(--vscode-debugTokenExpression-name, #569cd6)",
  },
  // Color values (#fff, rgb(), etc.)
  {
    tag: tags.color,
    color: "var(--vscode-debugTokenExpression-number, #ce9178)",
  },
  // Comments
  {
    tag: tags.comment,
    color: "var(--vscode-editorLineNumber-foreground, #6a9955)",
    fontStyle: "italic",
  },
  // Punctuation (: ; { })
  {
    tag: tags.punctuation,
    color: "var(--vscode-editor-foreground)",
  },
  // Important (!)
  {
    tag: tags.modifier,
    color: "var(--vscode-editorWarning-foreground, #ff0000)",
  },
]);

// Read initial CSS from data attribute
const initialCss = document.body.dataset.initialCss ?? "";

const editorContainer = document.getElementById("editor")!;
const applyBtn = document.getElementById("applyBtn")!;
const cancelBtn = document.getElementById("cancelBtn")!;

const state = EditorState.create({
  doc: initialCss,
  extensions: [
    basicSetup,
    cssDeclarations,
    autocompletion({
      activateOnTyping: true,
      override: [combinedCssCompletion],
    }),
    vscodeEditorTheme,
    syntaxHighlighting(vscodeHighlightStyle),
    keymap.of([
      {
        key: "Mod-Enter",
        run: () => {
          vscode.postMessage({
            type: "apply",
            css: view.state.doc.toString(),
          });
          return true;
        },
      },
    ]),
  ],
});

const view = new EditorView({ state, parent: editorContainer });

applyBtn.addEventListener("click", () => {
  vscode.postMessage({ type: "apply", css: view.state.doc.toString() });
});

cancelBtn.addEventListener("click", () => {
  vscode.postMessage({ type: "cancel" });
});

view.focus();
