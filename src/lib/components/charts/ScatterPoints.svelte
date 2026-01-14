<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  type DataPoint = { x: number; y: number; color?: string; r?: number };
  type FillAccessor = (d: DataPoint) => string;
  type RadiusAccessor = (d: DataPoint) => number;
  type HoverHandler = (d: DataPoint, event: MouseEvent) => void;
  type BooleanAccessor = (d: DataPoint) => boolean;
  type ActiveAccessor = BooleanAccessor;
  type VisibleAccessor = BooleanAccessor;

  interface ScatterPointsProps {
    r?: number | RadiusAccessor;
    fill?: string | FillAccessor;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
    onHover?: HoverHandler;
    onLeave?: () => void;
    isActive?: ActiveAccessor;
    isVisible?: VisibleAccessor;
    activeStroke?: string;
    activeStrokeWidth?: number;
    activeRadiusOffset?: number;
  }

  function resolveAccessor<TValue>(
    value: TValue | ((d: DataPoint) => TValue)
  ): (d: DataPoint) => TValue {
    if (typeof value === 'function') {
      return value as (d: DataPoint) => TValue;
    }

    return function constantAccessor(): TValue {
      return value;
    };
  }

  function resolveBooleanAccessor(
    value: BooleanAccessor | undefined,
    fallback: boolean
  ): BooleanAccessor {
    if (typeof value === 'function') {
      return value;
    }

    return function constantAccessor(): boolean {
      return fallback;
    };
  }

  function getScaleOffset(scale: { bandwidth?: () => number } | null): number {
    if (!scale?.bandwidth) {
      return 0;
    }

    return scale.bandwidth() / 2;
  }

  function handleHover(d: DataPoint, event: MouseEvent): void {
    onHover?.(d, event);
  }

  function handleLeave(): void {
    onLeave?.();
  }

  // LayerCake context provides scale accessors and data store.
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
    isVisible = undefined,
    activeStroke = '#ffffff',
    activeStrokeWidth = 2,
    activeRadiusOffset = 2,
  }: ScatterPointsProps = $props();

  let fillAccessor = $derived(resolveAccessor(fill));
  let radiusAccessor = $derived(resolveAccessor(r));
  let activeAccessor = $derived(resolveBooleanAccessor(isActive, false));
  let visibleAccessor = $derived(resolveBooleanAccessor(isVisible, true));

  // Center band scales so points align with bars/columns.
  let xCenterOffset = $derived(getScaleOffset($xScale));
  let yCenterOffset = $derived(getScaleOffset($yScale));
</script>

<g class="scatter-group">
  {#each $data as d, i (i)}
    {@const active = activeAccessor(d)}
    {@const visible = visibleAccessor(d)}
    {#if active}
      <circle
        cx={$xGet(d) + xCenterOffset}
        cy={$yGet(d) + yCenterOffset}
        r={radiusAccessor(d) + activeRadiusOffset}
        fill="none"
        stroke={activeStroke}
        stroke-width={activeStrokeWidth}
        class:opacity-0={!visible}
        class="transition-opacity duration-200 ease-in-out"
      />
    {/if}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <circle
      cx={$xGet(d) + xCenterOffset}
      cy={$yGet(d) + yCenterOffset}
      r={radiusAccessor(d)}
      fill={fillAccessor(d)}
      {stroke}
      stroke-width={strokeWidth}
      fill-opacity={fillOpacity}
      class:opacity-0={!visible}
      class="transition-opacity duration-300 ease-out"
      onmouseenter={(event) => handleHover(d, event)}
      onmousemove={(event) => handleHover(d, event)}
      onmouseleave={handleLeave}
    />
  {/each}
</g>
