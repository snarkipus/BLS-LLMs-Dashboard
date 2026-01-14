<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  const ctx = getContext<LayerCakeContext>('LayerCake');
  const { width, height, xScale, yRange } = ctx;

  interface AxisXProps {
    tickMarks?: boolean;
    gridlines?: boolean;
    tickMarkLength?: number;
    baseline?: boolean;
    snapLabels?: boolean;
    format?: (d: unknown) => string;
    ticks?: number | number[] | ((values: number[]) => number[]);
    tickGutter?: number;
    dx?: number;
    dy?: number;
  }

  function defaultFormat(value: unknown): string {
    return String(value);
  }

  let {
    tickMarks = false,
    gridlines = true,
    tickMarkLength = 6,
    baseline = false,
    snapLabels = false,
    format = defaultFormat,
    ticks = undefined,
    tickGutter = 0,
    dx = 0,
    dy = 12,
  }: AxisXProps = $props();

  function textAnchor(index: number, shouldSnap: boolean): string {
    if (shouldSnap === true) {
      if (index === 0) {
        return 'start';
      }
      if (index === tickVals.length - 1) {
        return 'end';
      }
    }
    return 'middle';
  }

  let tickLen = $derived(tickMarks === true ? tickMarkLength : 0);

  // `xScale` from LayerCake uses bandwidth when it's a band scale.
  let isBandwidth = $derived(typeof $xScale.bandwidth === 'function');

  // Resolve tick values once, keeping band scales aligned with their domain.
  let tickVals = $derived.by((): unknown[] => {
    if (Array.isArray(ticks)) {
      return ticks;
    }
    if (isBandwidth) {
      return $xScale.domain();
    }
    if (typeof ticks === 'function') {
      return ticks($xScale.ticks());
    }
    return $xScale.ticks(ticks);
  });

  let halfBand = $derived(isBandwidth ? $xScale.bandwidth() / 2 : 0);

  let axisY = $derived(Math.max(...$yRange));

  function getTickTransform(tick: unknown): string {
    return `translate(${$xScale(tick)},${axisY})`;
  }
</script>

<g class="axis x-axis" class:snapLabels>
  {#if baseline === true}
    <line class="baseline" y1={$height} y2={$height} x1="0" x2={$width} />
  {/if}

  {#each tickVals as tick, i (tick)}
    <g class={`tick tick-${i}`} transform={getTickTransform(tick)}>
      {#if gridlines === true}
        <line class="gridline" x1={halfBand} x2={halfBand} y1={-$height} y2="0" />
      {/if}
      {#if tickMarks === true}
        <line
          class="tick-mark"
          x1={halfBand}
          x2={halfBand}
          y1={tickGutter}
          y2={tickGutter + tickLen}
        />
      {/if}
      <text x={halfBand} y={tickGutter + tickLen} {dx} {dy} text-anchor={textAnchor(i, snapLabels)}>
        {format(tick)}
      </text>
    </g>
  {/each}
</g>

<style>
  .tick {
    font-size: 11px;
  }

  line,
  .tick line {
    stroke: #e2e8f0;
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #666;
  }

  .tick .tick-mark,
  .baseline {
    stroke-dasharray: 0;
  }

  .axis.snapLabels .tick:last-child text {
    transform: translateX(3px);
  }

  .axis.snapLabels .tick.tick-0 text {
    transform: translateX(-3px);
  }
</style>
