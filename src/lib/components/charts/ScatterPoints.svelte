<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  type DataPoint = { x: number; y: number; color?: string; r?: number };
  type FillAccessor = (d: DataPoint) => string;
  type RadiusAccessor = (d: DataPoint) => number;
  type HoverHandler = (d: DataPoint, event: MouseEvent) => void;
  type ActiveAccessor = (d: DataPoint) => boolean;

  const ctx = getContext<LayerCakeContext<DataPoint>>('LayerCake');
  const { data, xGet, yGet, xScale, yScale } = ctx;

  let {
    r = 5,
    fill = '#0cf',
    stroke = '#000',
    strokeWidth = 0,
    fillOpacity = 1,
    onHover = undefined,
    onLeave = undefined,
    isActive = undefined,
    activeStroke = '#ffffff',
    activeStrokeWidth = 2,
    activeRadiusOffset = 2,
  }: {
    r?: number | RadiusAccessor;
    fill?: string | FillAccessor;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
    onHover?: HoverHandler;
    onLeave?: () => void;
    isActive?: ActiveAccessor;
    activeStroke?: string;
    activeStrokeWidth?: number;
    activeRadiusOffset?: number;
  } = $props();

  let fillAccessor = $derived(typeof fill === 'function' ? fill : (_: DataPoint) => fill);
  let radiusAccessor = $derived(typeof r === 'function' ? r : (_: DataPoint) => r);
  let activeAccessor = $derived(
    typeof isActive === 'function' ? isActive : (_: DataPoint) => false
  );

  const handleHover = (d: DataPoint, event: MouseEvent) => {
    onHover?.(d, event);
  };

  const handleLeave = () => {
    onLeave?.();
  };
</script>

<g class="scatter-group">
  {#each $data as d, i (i)}
    {@const active = activeAccessor(d)}
    {#if active}
      <circle
        cx={$xGet(d) + ($xScale.bandwidth ? $xScale.bandwidth() / 2 : 0)}
        cy={$yGet(d) + ($yScale.bandwidth ? $yScale.bandwidth() / 2 : 0)}
        r={radiusAccessor(d) + activeRadiusOffset}
        fill="none"
        stroke={activeStroke}
        stroke-width={activeStrokeWidth}
      />
    {/if}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <circle
      cx={$xGet(d) + ($xScale.bandwidth ? $xScale.bandwidth() / 2 : 0)}
      cy={$yGet(d) + ($yScale.bandwidth ? $yScale.bandwidth() / 2 : 0)}
      r={radiusAccessor(d)}
      fill={fillAccessor(d)}
      {stroke}
      stroke-width={strokeWidth}
      fill-opacity={fillOpacity}
      onmouseenter={(event) => handleHover(d, event)}
      onmousemove={(event) => handleHover(d, event)}
      onmouseleave={handleLeave}
    />
  {/each}
</g>
