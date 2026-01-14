# AGENTS.md

This file guides agentic coding assistants working in this repository.

## Tech Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`, `$props`, `$bindable`)
- **SvelteKit** in SPA mode (Single Page Application)
- **TypeScript** with strict mode enabled
- **Tailwind CSS 4** for styling
- **D3.js** for data visualization helpers
- **LayerCake** for chart components
- **Vitest** for testing (minimal setup, expand as needed)
- **ESLint 9** with flat config for linting
- **Prettier** for code formatting

## Library Responsibilities

- **Svelte**: All DOM management and reactivity must use Svelte 5 runes and native Svelte events.
- **LayerCake**: Use LayerCake for chart layout/structure and prefer its context APIs for passing
  chart props. Chart primitives should be implemented in project code (enduser-owned components).
- **D3**: Use only when LayerCake lacks a required primitive/utility. Do not use D3 for DOM
  manipulation or direct browser events; rely on Svelte events and runes instead.

## Essential Commands

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality

- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without modifying

### Type Checking

- `npm run check` - Run Svelte type checker
- `npm run check:watch` - Run type checker in watch mode

### Testing

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI interface

### Single Test Execution

Run a specific test file:

```bash
npm test path/to/test.test.ts
```

Run tests matching a pattern:

```bash
npm test -- --grep "test name"
```

Run tests in a specific file with watch:

```bash
npm run test:watch path/to/test.test.ts
```

## Code Style Guidelines

### Svelte 5 Runes

- Use `$state()` for reactive state; use plain `let` for non-reactive locals
- Use `$derived()` for computed values instead of `$:` statements
- Use `$effect()` for side effects (API calls, DOM manipulation) - only run in browser
- Use `$props()` for component props (destructure: `let { prop } = $props()`)
- Use `$bindable()` for two-way bound props - use sparingly for predictable data flow
- Use `$inspect()` for debugging state changes (development only, becomes noop in production)
- Event handlers: use event attributes like `onclick`, `onchange` (no `on:` prefix)
- Component events: use callback props instead of `createEventDispatcher`
- Use `$derived.by()` for complex derivations that don't fit in a short expression
- Use `onMount()` for one-time initialization with cleanup on unmount
- Use `tick()` to ensure DOM is updated before continuing
- Use `$state.raw()` for large immutable arrays/objects that won't be mutated
- Use `$state.snapshot()` when passing state to external libraries that expect plain objects
- Use `$state.eager()` sparingly for immediate UI feedback in await expressions
- Export reactive logic from `.svelte.ts` files, but don't reassign exported state
- Prefer derived state over `$effect` for synchronizing state (avoid effect loops)
- Use `{#snippet}` for reusable markup blocks (replaces deprecated slots)
- Use `{@render}` to render snippets
- Use `$props.id()` for unique component instance IDs (useful for form labels)

### Component Structure

- Use `<script lang="ts">` for TypeScript
- Use `$props()` at top of script section
- Export reusable logic to `.svelte.ts` files in `$lib/stores/`
- Keep components focused on single responsibility

### TypeScript

- Use explicit type annotations for function parameters and return types
- Define interfaces for complex objects in `$lib/types/`
- Use `interface` for object shapes, `type` for unions/primitives
- Enable strict mode in tsconfig.json (already configured)

### Imports

- Use `$lib` alias for imports from `src/lib/`
- Use `$app/...` aliases for SvelteKit specific imports
- Group imports: Svelte/Kit, third-party, local
- Remove unused imports

### Naming Conventions

- Components: PascalCase (`ScatterPlot.svelte`, `DataTable.svelte`)
- Variables/functions: camelCase (`getUserData`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- Types: PascalCase interfaces (`User`, `ChartData`)
- Files: kebab-case or PascalCase for components (`scatter-plot.svelte`, `ScatterPlot.svelte`)

### Styling

- Use Tailwind utility classes for all layout and non-chart UI styling
- Use scoped `<style>` blocks for chart styling (SVG/HTML primitives)
- Avoid inline styles except for dynamic values
- Use `class:` directive for conditional classes
- Use `style:` directive for dynamic styles
- Use `@import "tailwindcss"` in global CSS (already in `app.css`)

### LayerCake Integration

- Import from `layercake`: `LayerCake`, `Svg`, `Html`, `Canvas`
- Provide data prop with array of objects
- Use string props for field access: `x="x"`, `y="y"`
- Layout components require explicit width/height on container
- Context is automatically provided to children

### Error Handling

- Use try-catch for async operations
- Provide meaningful error messages
- Use SvelteKit error boundaries `<svelte:boundary>` for component errors
- Log errors with context for debugging

### File Organization

```
src/
  lib/
    components/
      ui/          # Reusable UI primitives (buttons, inputs)
      charts/      # Visualization components
    stores/        # Svelte 5 rune-based stores (.svelte.ts files)
    utils/         # Utility functions
    types/         # TypeScript type definitions
    d3/            # D3-specific helpers and utilities
  routes/         # SvelteKit routes
  app.css         # Global styles with Tailwind import
  test-setup.ts   # Vitest setup file
```

## Project Configuration

### SPA Mode

This project is configured for Single Page Application mode:

- Uses `@sveltejs/adapter-static`
- `fallback: 'index.html'` in svelte.config.js
- Client-side routing only
- Suitable for deployment to static hosts

### ESLint Configuration

Located in `eslint.config.js`:

- Flat config format
- TypeScript support
- Svelte plugin
- Prettier integration
- Ignores: `.svelte-kit/`, `build/`, `node_modules/`

### Prettier Configuration

Located in `.prettierrc`:

- Single quotes
- Semicolons
- 2-space indentation
- 100 character line width
- Svelte plugin support

### TypeScript Configuration

Located in `tsconfig.json`:

- Strict mode enabled
- Path aliases handled by SvelteKit
- Extends generated `.svelte-kit/tsconfig.json`

## Development Workflow

1. Create feature branch from main
2. Make changes following code style guidelines
3. Run `npm run lint:fix` before committing
4. Run `npm run format` before committing
5. Run `npm test` to ensure tests pass
6. Run `npm run check` for type errors
7. Commit with descriptive message
8. Create pull request for review

## Testing

Tests are minimal setup using Vitest:

- Test files: `src/**/*.test.ts` or `src/**/*.spec.ts`
- Use `jsdom` environment for DOM testing
- Test setup in `src/test-setup.ts`
- Expand testing setup as needed

## Common Patterns

### Reactive State (Svelte 5)

```typescript
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log('Count changed:', count);
});
```

### Component Props

```typescript
let { data, title = 'Default' }: { data: number[]; title?: string } = $props();
```

### Two-Way Binding

```typescript
let { value = $bindable('') }: { value?: string } = $props();
```

### D3 Component Pattern

```typescript
onMount(() => {
  import('d3').then((d3) => {
    // Initialize D3 visualization
    return () => {
      // Cleanup function
    };
  });
});
```

## Notes

- SvelteKit auto-generates types in `.svelte-kit/` directory
- Don't manually edit generated files
- Use `svelte-kit sync` to refresh generated types
- Tailwind CSS 4 uses CSS imports instead of PostCSS config
- D3 types installed via `@types/d3`
- LayerCake provides scale and layout utilities
