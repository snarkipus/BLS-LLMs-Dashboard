<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  const ctx = getContext<LayerCakeContext>('LayerCake');
  const { width, height, xScale, yRange } = ctx;

  let {
    tickMarks = false,
    gridlines = true,
    tickMarkLength = 6,
    baseline = false,
    snapLabels = false,
    format = (d: unknown) => String(d),
    ticks = undefined,
    tickGutter = 0,
    dx = 0,
    dy = 12,
  }: {
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
  } = $props();

  function textAnchor(i: number, sl: boolean) {
    if (sl === true) {
      if (i === 0) {
        return 'start';
      }
      if (i === tickVals.length - 1) {
        return 'end';
      }
    }
    return 'middle';
  }

  let tickLen = $derived(tickMarks === true ? tickMarkLength : 0);

  let isBandwidth = $derived(typeof $xScale.bandwidth === 'function');

  let tickVals = $derived(
    Array.isArray(ticks)
      ? ticks
      : isBandwidth
        ? $xScale.domain()
        : typeof ticks === 'function'
          ? ticks($xScale.ticks())
          : $xScale.ticks(ticks)
  );

  let halfBand = $derived(isBandwidth ? $xScale.bandwidth() / 2 : 0);
</script>

<g class="axis x-axis" class:snapLabels>
  {#if baseline === true}
    <line class="baseline" y1={$height} y2={$height} x1="0" x2={$width} />
  {/if}

  {#each tickVals as tick, i (tick)}
    <g class="tick tick-{i}" transform="translate({$xScale(tick)},{Math.max(...$yRange)})">
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
      <text x={halfBand} y={tickGutter + tickLen} {dx} {dy} text-anchor={textAnchor(i, snapLabels)}
        >{format(tick)}</text
      >
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
