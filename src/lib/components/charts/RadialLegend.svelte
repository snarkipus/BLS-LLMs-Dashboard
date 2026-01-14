<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  type Props = {
    radiusScale?: (value: number) => number;
    values?: number[];
    label?: string;
    format?: (value: number) => string;
    align?: 'left' | 'right';
    inset?: number;
    y?: number;
    lineLength?: number;
    labelOffset?: number;
    labelPadding?: number;
    x?: number;
  };

  const layerCake = getContext<LayerCakeContext>('LayerCake');
  const { width } = layerCake;

  const defaultFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  function defaultFormat(value: number): string {
    return defaultFormatter.format(value);
  }

  let {
    radiusScale,
    values = [],
    label = 'Size',
    format = defaultFormat,
    align = 'right',
    inset = 24,
    y = 120,
    lineLength = 32,
    labelOffset = 3,
    labelPadding = 56,
    x = undefined,
  }: Props = $props();

  function getSanitizedValues(): number[] {
    return values
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((first, second) => second - first);
  }

  let sanitizedValues = $derived.by(getSanitizedValues);

  let resolvedScale = $derived(radiusScale ?? ((_value: number) => 0));

  function getLegendX(): number {
    if (typeof x === 'number') {
      return x;
    }

    if (align === 'right') {
      return $width - inset - lineLength - labelPadding;
    }

    return inset;
  }

  let legendX = $derived.by(getLegendX);

  function getCircleY(value: number): number {
    return 10 - resolvedScale(value);
  }

  function getLineY(value: number): number {
    return 10 - resolvedScale(value) * 2;
  }

  function getLabelY(value: number): number {
    return getLineY(value) + labelOffset;
  }
</script>

{#if radiusScale && sanitizedValues.length}
  <g class="radial-legend pointer-events-none" transform={`translate(${legendX}, ${y})`}>
    <text class="text-sm font-semibold fill-slate-600" x="0" y="-42" text-anchor="middle">
      {label}
    </text>
    {#each sanitizedValues as value (value)}
      <circle
        class="radial-legend-circle stroke-slate-300"
        cx="0"
        cy={getCircleY(value)}
        r={resolvedScale(value)}
      />
      <text class="text-xs fill-slate-600" x={lineLength + 6} y={getLabelY(value)}>
        {format(value)}
      </text>
      <line
        class="radial-legend-line stroke-slate-300"
        x1="0"
        x2={lineLength}
        y1={getLineY(value)}
        y2={getLineY(value)}
      />
    {/each}
  </g>
{/if}

<style>
  .radial-legend-circle {
    fill: none;
    stroke-dasharray: 2 2;
  }

  .radial-legend-line {
    stroke-width: 1;
  }
</style>
