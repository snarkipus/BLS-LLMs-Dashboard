<script lang="ts">
  import { scaleLog } from 'd3-scale';
  import { Html, LayerCake, Svg } from 'layercake';

  import { computeLogWageRegressionLine } from '$lib/d3/wage-regression';
  import type {
    Domain,
    LayerCakeChartDatum,
    LegendItem,
    RadiusScale,
  } from '$lib/types/layercake-chart';

  import Tooltip from './Tooltip.html.svelte';
  import Voronoi from './Voronoi.svelte';

  import RegressionLine from './RegressionLine.svelte';
  import ScatterPoints from './ScatterPoints.svelte';
  import RadialLegend from './RadialLegend.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';
  import XAxisTitle from './XAxisTitle.svelte';
  import YAxisTitle from './YAxisTitle.svelte';

  /**
   * LayerCake scatter plot wrapper with log-scaled wages.
   * Child components read scales/accessors from LayerCake context.
   */
  type Props = {
    data: Array<LayerCakeChartDatum>;
    title?: string;
    xLabelLeft?: string;
    xLabelRight?: string;
    yLabel?: string;
    xDomain?: Domain;
    yDomain?: Domain;
    xTicks?: number[];
    yTicks?: number[];
    legendItems?: LegendItem[];
    radiusScale?: RadiusScale;
    radialLegendScale?: RadiusScale;
    radialLegendValues?: number[];
    radialLegendLabel?: string;
    radialLegendFormat?: (value: number) => string;
    radialLegendAlign?: 'left' | 'right';
    radialLegendInset?: number;
    radialLegendY?: number;
    radialLegendX?: number;
  };

  const CHART_HEIGHT = 600;
  const CHART_PADDING = { top: 20, right: 20, bottom: 45, left: 20 };

  let {
    data,
    title = 'My Awesome Scatter Plot',
    xLabelLeft = '',
    xLabelRight = '',
    yLabel = 'Y Axis Title',
    xDomain = [0, 1],
    yDomain = [1, null],
    xTicks,
    yTicks,
    legendItems = [],
    radiusScale,
    radialLegendScale,
    radialLegendValues = [],
    radialLegendLabel = 'Size',
    radialLegendFormat,
    radialLegendAlign = 'right',
    radialLegendInset = 24,
    radialLegendY = 120,
    radialLegendX,
  }: Props = $props();

  // Legend hover/selection drives category visibility in the chart.
  let activeLegendKey = $state<string | null>(null);
  let selectedLegendKeys = $state<string[]>([]);

  function getOrderedLegendItems(): LegendItem[] {
    const index = legendItems.findIndex((item) => item.label === 'No formal education');
    if (index === -1 || index === legendItems.length - 1) {
      return legendItems;
    }

    const items = [...legendItems];
    const [match] = items.splice(index, 1);
    items.push(match);
    return items;
  }

  let orderedLegendItems = $derived.by(getOrderedLegendItems);

  function getVisibleLegendCategories(): string[] | null {
    if (selectedLegendKeys.length) {
      return legendItems
        .filter((item) => selectedLegendKeys.includes(item.key))
        .flatMap((item) => item.categories);
    }

    if (activeLegendKey) {
      return legendItems
        .filter((item) => item.key === activeLegendKey)
        .flatMap((item) => item.categories);
    }

    return null;
  }

  let visibleLegendCategories = $derived.by(getVisibleLegendCategories);

  let hasLegendSelection = $derived(selectedLegendKeys.length > 0);
  let resolvedLegendScale = $derived(radialLegendScale ?? radiusScale);
  let showRadialLegend = $derived(Boolean(resolvedLegendScale && radialLegendValues.length));

  function isCategoryVisible(category?: string): boolean {
    if (!visibleLegendCategories) return true;
    return visibleLegendCategories.includes(category ?? '');
  }

  function isLegendSelected(key: string): boolean {
    return selectedLegendKeys.includes(key);
  }

  function isLegendItemMuted(item: LegendItem): boolean {
    if (!visibleLegendCategories) return false;
    return !item.categories.some((category) => visibleLegendCategories.includes(category));
  }

  // Chart scales and display formatters.
  const yScale = scaleLog().base(10);
  const wageFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 0,
    notation: 'compact',
    compactDisplay: 'short',
  });

  function formatCurrency(value: unknown): string {
    return typeof value === 'number' ? wageFormatter.format(value).toLowerCase() : String(value);
  }

  const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 0,
  });

  function formatPercent(value: unknown): string {
    return typeof value === 'number' ? percentFormatter.format(value) : String(value);
  }

  // Tooltip formatters keep unavailable values explicit.
  const tooltipWageFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  const tooltipNumberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  });
  const tooltipPercentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 0,
  });

  function formatTooltipWage(value?: number): string {
    return typeof value === 'number' ? tooltipWageFormatter.format(value) : 'N/A';
  }

  function formatTooltipPercent(value?: number): string {
    return typeof value === 'number' ? tooltipPercentFormatter.format(value) : 'N/A';
  }

  function formatTooltipNumber(value?: number): string {
    return typeof value === 'number' ? tooltipNumberFormatter.format(value) : 'N/A';
  }

  type HoverPoint = [number, number] & { data?: LayerCakeChartDatum | unknown };

  // Tooltip state pairs the mouse event with the hovered datum.
  let tooltipEvent = $state<MouseEvent | null>(null);
  let tooltipData = $state<LayerCakeChartDatum | null>(null);

  function resetTooltip(): void {
    tooltipEvent = null;
    tooltipData = null;
  }

  function handleHover(event: MouseEvent, point: HoverPoint): void {
    const dataPoint = (point.data ?? null) as LayerCakeChartDatum | null;
    if (dataPoint && !isCategoryVisible(dataPoint.category)) {
      resetTooltip();
      return;
    }

    tooltipEvent = event;
    tooltipData = dataPoint;
  }

  function handleLeave(): void {
    resetTooltip();
  }

  function handleLegendEnter(item: LegendItem): void {
    if (hasLegendSelection) return;
    activeLegendKey = item.key;
  }

  function handleLegendLeave(): void {
    if (hasLegendSelection) return;
    activeLegendKey = null;
  }

  function toggleLegendKey(key: string): void {
    if (selectedLegendKeys.includes(key)) {
      selectedLegendKeys = selectedLegendKeys.filter((item) => item !== key);
    } else {
      selectedLegendKeys = [...selectedLegendKeys, key];
    }

    if (!selectedLegendKeys.length) {
      activeLegendKey = null;
    }
  }

  function handleLegendClick(item: LegendItem): void {
    toggleLegendKey(item.key);
  }

  function clearLegendSelection(): void {
    selectedLegendKeys = [];
    activeLegendKey = null;
  }

  function getPointRadius(point: unknown): number {
    const dataPoint = point as LayerCakeChartDatum;
    if (typeof dataPoint.r === 'number') {
      return dataPoint.r;
    }

    if (radiusScale && typeof dataPoint.employment === 'number') {
      return radiusScale(dataPoint.employment);
    }

    return 5;
  }

  function getPointFill(point: unknown): string {
    const dataPoint = point as LayerCakeChartDatum;
    return dataPoint.color ?? '#3b82f6';
  }

  function isPointActive(point: unknown): boolean {
    const dataPoint = point as LayerCakeChartDatum;
    if (!tooltipData?.label) return false;
    return dataPoint.label === tooltipData.label;
  }

  function isPointVisible(point: unknown): boolean {
    const dataPoint = point as LayerCakeChartDatum;
    return isCategoryVisible(dataPoint.category);
  }

  // D3 helper computes weighted regression in log space.
  let regressionLine = $derived.by(() => computeLogWageRegressionLine(data, xDomain));
</script>

<div class="w-full bg-white p-6 rounded-lg shadow">
  <div class="mb-4 flex flex-col gap-2">
    {#if title}
      <h2 class="text-2xl font-semibold text-slate-900">
        {title}
      </h2>
    {/if}
    {#if orderedLegendItems.length}
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
        {#each orderedLegendItems as item (item.label)}
          <button
            type="button"
            class="flex items-center gap-2 rounded px-1 py-0.5 font-semibold text-slate-600 transition duration-200 ease-in-out"
            class:text-slate-900={isLegendSelected(item.key)}
            class:bg-slate-100={isLegendSelected(item.key)}
            onmouseenter={() => handleLegendEnter(item)}
            onmouseleave={handleLegendLeave}
            onclick={() => handleLegendClick(item)}
          >
            <span class="h-3 w-3 rounded-full" style="background-color: {item.color};"></span>
            <span class:opacity-50={isLegendItemMuted(item)}>
              {item.label}
            </span>
          </button>
        {/each}
        <button
          type="button"
          class="rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition duration-200 ease-in-out hover:text-slate-800"
          class:opacity-0={!hasLegendSelection}
          class:pointer-events-none={!hasLegendSelection}
          onclick={clearLegendSelection}
        >
          Clear all
        </button>
      </div>
    {/if}
  </div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="relative w-full"
    style={`height: ${CHART_HEIGHT}px; min-height: ${CHART_HEIGHT}px;`}
    onmouseleave={handleLeave}
  >
    <!-- LayerCake provides scale context for chart primitives below. -->
    <LayerCake
      position="absolute"
      height={CHART_HEIGHT}
      {data}
      {xDomain}
      {yDomain}
      {yScale}
      x="x"
      y="y"
      padding={CHART_PADDING}
    >
      <Svg>
        <AxisX
          gridlines={true}
          baseline={false}
          tickMarks={true}
          ticks={xTicks}
          format={formatPercent}
        />
        <AxisY
          gridlines={true}
          baseline={true}
          tickMarks={true}
          ticks={yTicks}
          format={formatCurrency}
          position="right"
          labelGutter={6}
        />
        {#if regressionLine && !visibleLegendCategories}
          <RegressionLine points={regressionLine.points} strokeWidth={1} />
        {/if}
        <ScatterPoints
          r={getPointRadius}
          fill={getPointFill}
          fillOpacity={0.7}
          isActive={isPointActive}
          isVisible={isPointVisible}
          activeStroke="#0f172a"
          activeStrokeWidth={1.5}
          activeRadiusOffset={2}
        />

        {#if showRadialLegend}
          <RadialLegend
            radiusScale={resolvedLegendScale}
            values={radialLegendValues}
            label={radialLegendLabel}
            format={radialLegendFormat}
            align={radialLegendAlign}
            inset={radialLegendInset}
            y={radialLegendY}
            x={radialLegendX}
          />
        {/if}

        <Voronoi onmouseover={handleHover} isVisible={isPointVisible} />
        <XAxisTitle text={xLabelLeft} offset={32} align="left" tick={0} />
        <XAxisTitle text={xLabelRight} offset={32} align="right" tick={1} />
        <YAxisTitle text={yLabel} offset={0} inset={8} position="right" orientation="horizontal" />
      </Svg>

      <Html pointerEvents={false}>
        {#if tooltipEvent && tooltipData}
          <Tooltip event={tooltipEvent} offset={-12}>
            <div class="text-sm font-semibold text-slate-900">{tooltipData.label ?? 'Unknown'}</div>
            <div class="mt-1">Income: {formatTooltipWage(tooltipData.wage)}</div>
            <div>Probability: {formatTooltipPercent(tooltipData.probability)}</div>
            <div>Number employed: {formatTooltipNumber(tooltipData.employment)}</div>
          </Tooltip>
        {/if}
      </Html>
    </LayerCake>
  </div>
</div>
