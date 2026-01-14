<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  interface AxisYProps {
    tickMarks?: boolean;
    labelPosition?: 'even' | 'above';
    snapBaselineLabel?: boolean;
    gridlines?: boolean;
    tickMarkLength?: number;
    format?: (d: unknown) => string;
    ticks?: number | number[] | ((values: number[]) => number[]);
    tickGutter?: number;
    labelGutter?: number;
    dx?: number;
    dy?: number;
    charPixelWidth?: number;
    baseline?: boolean;
    position?: 'left' | 'right';
  }

  type TickValue = unknown;

  // LayerCake context exposes scale and layout stores.
  const layerCake = getContext<LayerCakeContext>('LayerCake');
  const { xRange, yScale, width } = layerCake;

  function defaultFormat(value: unknown): string {
    return String(value);
  }

  let {
    tickMarks = false,
    labelPosition = 'even',
    snapBaselineLabel = false,
    gridlines = true,
    tickMarkLength = undefined,
    format = defaultFormat,
    ticks = 4,
    tickGutter = 0,
    labelGutter = 0,
    dx = 0,
    dy = 0,
    charPixelWidth = 7.25,
    baseline = false,
    position = 'left',
  }: AxisYProps = $props();

  function measureLabelWidth(sum: number, char: string): number {
    if (char === ',' || char === '.') {
      return sum + charPixelWidth * 0.5;
    }

    return sum + charPixelWidth;
  }

  function getLabelDy(tickValuePx: number): number {
    const shouldSnap = snapBaselineLabel === true && tickValuePx === maxTickValPx;

    if (labelPosition === 'above' || shouldSnap) {
      return dy - 3;
    }

    return dy + 4;
  }

  let isBandwidth = $derived(typeof $yScale.bandwidth === 'function');

  let tickVals = $derived.by(function (): TickValue[] {
    if (Array.isArray(ticks)) {
      return ticks;
    }

    if (isBandwidth) {
      return $yScale.domain();
    }

    if (typeof ticks === 'function') {
      return ticks($yScale.ticks());
    }

    return $yScale.ticks(ticks);
  });

  let widestTickLen = $derived(
    Math.max(
      10,
      Math.max(
        ...tickVals.map(function (tick: TickValue) {
          return format(tick).toString().split('').reduce(measureLabelWidth, 0);
        })
      )
    )
  );

  let tickLen = $derived.by(function (): number {
    if (tickMarks !== true) {
      return 0;
    }

    if (labelPosition === 'above') {
      return tickMarkLength ?? widestTickLen;
    }

    return tickMarkLength ?? 6;
  });

  let tickDirection = $derived(position === 'right' ? 1 : -1);
  let tickOffset = $derived(labelPosition === 'above' ? widestTickLen : tickLen);
  let tickX1 = $derived(tickDirection * tickGutter);
  let tickX2 = $derived(tickDirection * (tickGutter + tickLen));
  let labelX = $derived(tickDirection * (tickGutter + tickOffset + labelGutter));
  let labelDx = $derived(labelPosition === 'even' ? dx - 3 : dx);
  let labelAnchor = $derived(position === 'right' || labelPosition === 'above' ? 'start' : 'end');
  let axisX = $derived(position === 'right' ? $xRange[1] : $xRange[0]);
  let y = $derived(isBandwidth ? $yScale.bandwidth() / 2 : 0);
  let maxTickValPx = $derived(
    Math.max(
      ...tickVals.map(function (tick: TickValue) {
        return $yScale(tick);
      })
    )
  );

  let yRange = $derived($yScale.range());
  let gridlineX2 = $derived(position === 'right' ? -$width : $width);

  function getTickTransform(tickValuePx: number): string {
    return `translate(${axisX}, ${tickValuePx})`;
  }
</script>

<g class="axis y-axis">
  {#if baseline}
    <line class="baseline" x1={axisX} x2={axisX} y1={yRange[0]} y2={yRange[1]} />
  {/if}

  {#each tickVals as tick (tick)}
    {@const tickValPx = $yScale(tick)}
    <g class={`tick tick-${tick}`} transform={getTickTransform(tickValPx)}>
      {#if gridlines === true}
        <line class="gridline" x1="0" x2={gridlineX2} y1={y} y2={y} />
      {/if}
      {#if tickMarks === true}
        <line class="tick-mark" x1={tickX1} x2={tickX2} y1={y} y2={y} />
      {/if}
      <text x={labelX} {y} dx={labelDx} text-anchor={labelAnchor} dy={getLabelDy(tickValPx)}>
        {format(tick)}
      </text>
    </g>
  {/each}
</g>

<style>
  .tick {
    font-size: 11px;
  }

  .tick line {
    stroke: #e2e8f0;
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
    stroke: #94a3b8;
    stroke-width: 2;
  }
</style>
