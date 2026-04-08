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
exports.CssToTailwindCodeLensProvider = void 0;
const vscode = __importStar(require("vscode"));
class CssToTailwindCodeLensProvider {
    constructor() {
        this._onDidChangeCodeLenses = new vscode.EventEmitter();
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
    }
    refresh() {
        this._onDidChangeCodeLenses.fire();
    }
    provideCodeLenses(document) {
        const config = vscode.workspace.getConfiguration("cssTailwind");
        if (!config.get("showCodeLens", true)) {
            return [];
        }
        const lenses = [];
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const match = this.findClassAttribute(line.text, i);
            if (!match) {
                continue;
            }
            const range = new vscode.Range(i, 0, i, line.text.length);
            lenses.push(new vscode.CodeLens(range, {
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
            }));
        }
        return lenses;
    }
    findClassAttribute(text, lineNum) {
        // 1. Dynamic JSX expression: className={...} (not a template literal)
        const dynamicRegex = /\bclass(?:Name)?\s*=\s*\{(?![\s]*`)/;
        if (dynamicRegex.test(text)) {
            const templateRegex = /\bclass(?:Name)?\s*=\s*\{\s*`([^`]*)`\s*\}/;
            const templateMatch = templateRegex.exec(text);
            if (templateMatch) {
                const fullMatchIndex = templateMatch.index;
                const beforeValue = text.substring(0, fullMatchIndex) +
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
exports.CssToTailwindCodeLensProvider = CssToTailwindCodeLensProvider;
//# sourceMappingURL=codeLensProvider.js.map