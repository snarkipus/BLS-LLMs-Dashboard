# AGENTS.md

This file guides agentic coding assistants working in this repository.

## Tech Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$effect`, `$props`, `$bindable`)
- **SvelteKit** in SPA mode (Single Page Application)
- **TypeScript** with strict mode enabled
- **Tailwind CSS 4** for styling
- **D3.js** for data visualization
- **LayerCake** for chart components
- **Vitest** for testing (minimal setup, expand as needed)
- **ESLint 9** with flat config for linting
- **Prettier** for code formatting

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

- Use `$state()` for reactive state instead of `let` variables
- Use `$derived()` for computed values instead of `$:` statements
- Use `$effect()` for side effects (API calls, DOM manipulation) - only run in browser
- Use `$props()` for component props (destructure: `let { prop } = $props()`)
- Use `$bindable()` for two-way bound props - use sparingly for predictable data flow
- Use `$inspect()` for debugging state changes (development only, becomes noop in production)
- Event handlers: `onclick`, `onchange`, etc. (native events, no `on:` prefix)
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

- Components: PascalCase (`BarChart.svelte`, `DataTable.svelte`)
- Variables/functions: camelCase (`getUserData`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- Types: PascalCase interfaces (`User`, `ChartData`)
- Files: kebab-case or PascalCase for components (`bar-chart.svelte`, `BarChart.svelte`)

### Styling

- Use Tailwind utility classes for styling
- Avoid inline styles except for dynamic values
- Use `class:` directive for conditional classes
- Use `style:` directive for dynamic styles
- Keep styles in `<style>` block scoped to component
- Use `@import "tailwindcss"` in global CSS (already in `app.css`)

### D3 Integration

#### Performance Best Practices

- Use `onMount` lifecycle hook for D3 initialization
- Clean up D3 selections in onMount return function
- Use dynamic import for D3 to avoid type issues: `import('d3').then(d3 => ...)`
- Store D3 selections in variables for cleanup
- Use reactive state to trigger D3 updates

#### Enter-Update-Exit Pattern

```svelte
<script>
  let { data } = $props();
  let svgContainer: HTMLElement;

  onMount(() => {
    import('d3').then((d3) => {
      const svg = d3.select(svgContainer).append('svg');

      // ENTER phase
      const circles = svg
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('r', 5);

      // Return cleanup
      return () => {
        d3.select(svgContainer).selectAll('*').remove();
      };
    });
  });
</script>
```

#### Method Chaining

```javascript
// GOOD: Chain methods for readability
const bars = svg
  .selectAll('.bar')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d) => xScale(d.x))
  .attr('y', (d) => yScale(d.y));

// AVOID: Separate statements
const bars = svg.selectAll('.bar').data(data).enter();
bars.append('rect');
bars.attr('x', (d) => xScale(d.x));
bars.attr('y', (d) => yScale(d.y));
```

#### Data Optimization

- Simplify large datasets before passing to D3
- Use `d3.stratify()` for hierarchical data
- Leverage D3's data helpers: `d3.rollup()`, `d3.group()`, `d3.sort()`
- Consider canvas instead of SVG for large datasets (>10k points)
- Use `.data()` with key function for efficient updates

#### Scales and Axes

```javascript
// Explicit scale creation
const xScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => d.x)])
  .range([0, width]);

// Add axes with proper ticks
const xAxis = d3.axisBottom(xScale).ticks(10).tickSizeOuter(0);
```

#### Responsive Design

- Use `viewBox` instead of hardcoded dimensions
- Update chart on window resize with `onMount` + cleanup
- Consider `ResizeObserver` for container changes

#### Common Patterns

```javascript
// Arrow functions for pure transformations
const formatDate = (d) => new Date(d).toLocaleDateString();

// Data binding with join()
svg
  .selectAll('text')
  .data(data)
  .join(
    (enter) => enter.append('text').text((d) => d.label),
    (update) => update.text((d) => d.label),
    (exit) => exit.remove()
  );

// Use local variables in D3 selections
const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
```

#### Avoid

- Don't update state inside `$effect` (use derived instead)
- Avoid nested `d3.select()` calls inside loops
- Don't hardcode chart dimensions - use reactive bindings
- Don't mutate data passed to D3 - create copies if needed

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
