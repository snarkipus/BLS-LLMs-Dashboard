<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  const ctx = getContext<LayerCakeContext>('LayerCake');
  const { xRange, yScale, width } = ctx;

  let {
    tickMarks = false,
    labelPosition = 'even',
    snapBaselineLabel = false,
    gridlines = true,
    tickMarkLength = undefined,
    format = (d: unknown) => String(d),
    ticks = 4,
    tickGutter = 0,
    labelGutter = 0,
    dx = 0,
    dy = 0,
    charPixelWidth = 7.25,
    baseline = false,
  } = $props();

  function calcStringLength(sum: number, val: string) {
    if (val === ',' || val === '.') return sum + charPixelWidth * 0.5;
    return sum + charPixelWidth;
  }

  let isBandwidth = $derived(typeof $yScale.bandwidth === 'function');

  let tickVals = $derived(
    Array.isArray(ticks)
      ? ticks
      : isBandwidth
        ? $yScale.domain()
        : typeof ticks === 'function'
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ticks as (v: any[]) => any[])($yScale.ticks())
          : $yScale.ticks(ticks)
  );

  let widestTickLen = $derived(
    Math.max(
      10,
      Math.max(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...tickVals.map((d: any) => format(d).toString().split('').reduce(calcStringLength, 0))
      )
    )
  );

  let tickLen = $derived(
    tickMarks === true
      ? labelPosition === 'above'
        ? (tickMarkLength ?? widestTickLen)
        : (tickMarkLength ?? 6)
      : 0
  );

  let x1 = $derived(-tickGutter - (labelPosition === 'above' ? widestTickLen : tickLen));

  let labelX = $derived(x1 - labelGutter);
  let y = $derived(isBandwidth ? $yScale.bandwidth() / 2 : 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let maxTickValPx = $derived(Math.max(...tickVals.map((d: any) => $yScale(d))));

  let yRange = $derived($yScale.range());
</script>

<g class="axis y-axis">
  {#if baseline}
    <line class="baseline" x1={$xRange[0]} x2={$xRange[0]} y1={yRange[0]} y2={yRange[1]} />
  {/if}

  {#each tickVals as tick (tick)}
    {@const tickValPx = $yScale(tick)}
    <g class="tick tick-{tick}" transform="translate({$xRange[0]}, {tickValPx})">
      {#if gridlines === true}
        <line class="gridline" {x1} x2={$width} y1={y} y2={y}></line>
      {/if}
      {#if tickMarks === true}
        <line class="tick-mark" {x1} x2={x1 + tickLen} y1={y} y2={y}></line>
      {/if}
      <text
        x={labelX}
        {y}
        dx={dx + (labelPosition === 'even' ? -3 : 0)}
        text-anchor={labelPosition === 'above' ? 'start' : 'end'}
        dy={dy +
          (labelPosition === 'above' || (snapBaselineLabel === true && tickValPx === maxTickValPx)
            ? -3
            : 4)}>{format(tick)}</text
      >
    </g>
  {/each}
</g>

<style>
  .tick {
    font-size: 11px;
  }

  .tick line {
    stroke: #aaa;
  }

  .tick .gridline {
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #666;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }

  .baseline {
    stroke: #aaa;
    stroke-width: 1;
    /* Adjust thickness/color as needed; matches tick/grid color */
  }
</style>
