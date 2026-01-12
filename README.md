# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Scatterplot Trendline

The chart renders a regression trendline in `src/lib/components/charts/LayerCakeChart.svelte` using
log-transformed wages. Because the y-axis uses a log scale, the regression is computed on
`log10(wage)` and then converted back to linear values for the line endpoints before rendering. The
implementation:

- Filters points to finite `x` values and positive `y` values (log scale requirement).
- Uses a weighted least-squares fit on `x` and `log10(y)` with `employment` as the weight.
- Extrapolates the line between the min/max x-domain bounds.
- Computes a weighted R² in log space (used for internal diagnostics).
- Renders the line via `src/lib/components/charts/RegressionLine.svelte`.
