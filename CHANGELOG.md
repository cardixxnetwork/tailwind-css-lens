# Changelog

## [1.0.0] - 2026-04-08

### Added
- CodeLens on `className` and `class` attributes in JSX, TSX, HTML, and Vue files
- CSS editor powered by CodeMirror 6 in a VS Code webview panel
- Tailwind CSS v4 engine for accurate class-to-CSS conversion
- Bidirectional CSS-to-Tailwind conversion with round-trip preservation
- Full variant support: responsive (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`), state (`hover:`, `focus:`, `active:`, etc.), dark mode, and stacked variants
- Real CSS output format for variant blocks (`@media`, `&:hover`, etc.)
- Configuration options: toggle CodeLens visibility, custom Tailwind config path
