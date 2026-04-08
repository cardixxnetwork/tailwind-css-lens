# Tailwind CSS Lens

Inspect and edit Tailwind utility classes as plain CSS in an interactive CodeLens-powered editor. Click a class attribute, tweak the CSS, and apply — your Tailwind classes update automatically.

## Features

- **CodeLens integration** — A clickable "Edit CSS" lens appears above every `className` or `class` attribute
- **Real CSS editor** — Full CodeMirror 6 editor with syntax highlighting and autocomplete
- **Tailwind CSS v4 engine** — Uses the real Tailwind compiler for pixel-perfect CSS output
- **Bidirectional conversion** — Edit CSS and get Tailwind classes back; classes you didn't touch are preserved exactly
- **Variant support** — Responsive (`lg:hidden`), state (`hover:underline`), dark mode, and stacked variants rendered as real CSS blocks

## Usage

1. Open a file containing `className` or `class` attributes (JSX, TSX, HTML, Vue)
2. Click the **Edit CSS** CodeLens that appears above the attribute
3. A CSS editor opens showing the current Tailwind classes as plain CSS
4. Edit the CSS — change values, add new properties, or remove lines
5. Click **Apply** to convert back to Tailwind classes

## Supported Languages

- JavaScript React (JSX)
- TypeScript React (TSX)
- HTML
- Vue

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `cssTailwind.showCodeLens` | `true` | Show/hide the "Edit CSS" CodeLens |
| `cssTailwind.tailwindConfigPath` | `""` | Path to a custom `tailwind.config.js` |

## License

[MIT](LICENSE)
