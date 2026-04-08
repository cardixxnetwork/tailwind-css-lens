# Project Guidelines

## Testing

- Every new handling, bug fix, or feature must include corresponding tests.
- Tests live in `src/__tests__/` and use Vitest (`npm test` to run).
- Round-trip tests (Tailwind -> CSS -> Tailwind) go in `src/__tests__/cssToTailwind.test.ts`.
- Tailwind -> CSS mapping tests go in `src/__tests__/tailwindToCss.test.ts`.
