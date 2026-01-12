<script lang="ts">
  import { scaleLog } from 'd3-scale';
  import { Html, LayerCake, Svg } from 'layercake';

  import Tooltip from './Tooltip.html.svelte';
  import Voronoi from './Voronoi.svelte';

  import RegressionLine from './RegressionLine.svelte';
  import ScatterPoints from './ScatterPoints.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';
  import XAxisTitle from './XAxisTitle.svelte';
  import YAxisTitle from './YAxisTitle.svelte';

  type DataPoint = {
    x: number;
    y: number;
    label?: string;
    color?: string;
    category?: string;
    r?: number;
    wage?: number;
    probability?: number;
    employment?: number;
  };
  type Domain = [number | null, number | null];

  type LegendItem = { label: string; color: string; categories: string[]; key: string };

  type Props = {
    data: Array<DataPoint>;
    title?: string;
    xLabelLeft?: string;
    xLabelRight?: string;
    yLabel?: string;
    xDomain?: Domain;
    yDomain?: Domain;
    xTicks?: number[];
    yTicks?: number[];
    legendItems?: LegendItem[];
  };

  let {
    data,
    title = 'My Awesome Scatter Plot',
    xLabelLeft = '',
    xLabelRight = '',
    yLabel = 'Y Axis Title',
    xDomain = [0, 1],
    yDomain = [1, null],
    xTicks = undefined,
    yTicks = undefined,
    legendItems = [],
  }: Props = $props();

  let activeLegendKey = $state<string | null>(null);
  let selectedLegendKeys = $state<string[]>([]);

  const categoriesForKeys = (keys: string[]) =>
    legendItems.filter((item) => keys.includes(item.key)).flatMap((item) => item.categories);

  let visibleLegendCategories = $derived.by(() => {
    if (selectedLegendKeys.length) return categoriesForKeys(selectedLegendKeys);
    if (activeLegendKey) return categoriesForKeys([activeLegendKey]);
    return null;
  });

  const yScale = scaleLog().base(10);
  const wageFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 0,
    notation: 'compact',
    compactDisplay: 'short',
  });
  const formatCurrency = (value: unknown) =>
    typeof value === 'number' ? wageFormatter.format(value).toLowerCase() : String(value);

  const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 0,
  });
  const formatPercent = (value: unknown) =>
    typeof value === 'number' ? percentFormatter.format(value) : String(value);

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

  const formatTooltipWage = (value?: number) =>
    typeof value === 'number' ? tooltipWageFormatter.format(value) : 'N/A';
  const formatTooltipPercent = (value?: number) =>
    typeof value === 'number' ? tooltipPercentFormatter.format(value) : 'N/A';
  const formatTooltipNumber = (value?: number) =>
    typeof value === 'number' ? tooltipNumberFormatter.format(value) : 'N/A';

  type HoverPoint = [number, number] & { data?: DataPoint | unknown };

  let tooltipEvent = $state<MouseEvent | null>(null);
  let tooltipData = $state<DataPoint | null>(null);

  const handleHover = (event: MouseEvent, point: HoverPoint) => {
    const dataPoint = (point.data ?? null) as DataPoint | null;
    if (
      dataPoint &&
      visibleLegendCategories &&
      !visibleLegendCategories.includes(dataPoint.category ?? '')
    ) {
      tooltipEvent = null;
      tooltipData = null;
      return;
    }

    tooltipEvent = event;
    tooltipData = dataPoint;
  };

  const handleLeave = () => {
    tooltipEvent = null;
    tooltipData = null;
  };

  const handleLegendEnter = (item: LegendItem) => {
    if (selectedLegendKeys.length) return;
    activeLegendKey = item.key;
  };

  const handleLegendLeave = () => {
    if (selectedLegendKeys.length) return;
    activeLegendKey = null;
  };

  const handleLegendClick = (item: LegendItem) => {
    if (selectedLegendKeys.includes(item.key)) {
      selectedLegendKeys = selectedLegendKeys.filter((key) => key !== item.key);
    } else {
      selectedLegendKeys = [...selectedLegendKeys, item.key];
    }

    if (!selectedLegendKeys.length) {
      activeLegendKey = null;
    }
  };

  type RegressionPoint = { x: number; y: number };
  type RegressionResult = {
    points: [RegressionPoint, RegressionPoint];
    slope: number;
    intercept: number;
    rSquared: number;
  };

  let regressionLine = $derived.by(() => {
    const validPoints = data
      .filter(
        (point) =>
          typeof point.x === 'number' &&
          typeof point.y === 'number' &&
          Number.isFinite(point.x) &&
          Number.isFinite(point.y) &&
          point.y > 0
      )
      .map((point) => ({
        x: point.x,
        y: point.y,
        weight: point.employment ?? 1,
      }));

    if (validPoints.length < 2) return null;

    const xValues = validPoints.map((point) => point.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    const xStart = xDomain[0] ?? minX;
    const xEnd = xDomain[1] ?? maxX;

    // Weighted least squares in log space for log-scaled wages.
    const logYValues = validPoints.map((point) => ({
      x: point.x,
      y: Math.log10(point.y),
      w: Math.max(point.weight, 0),
    }));

    const sumW = logYValues.reduce((acc, point) => acc + point.w, 0);
    const sumWX = logYValues.reduce((acc, point) => acc + point.w * point.x, 0);
    const sumWY = logYValues.reduce((acc, point) => acc + point.w * point.y, 0);
    const sumWXY = logYValues.reduce((acc, point) => acc + point.w * point.x * point.y, 0);
    const sumWX2 = logYValues.reduce((acc, point) => acc + point.w * point.x * point.x, 0);

    const denominator = sumW * sumWX2 - sumWX * sumWX;
    if (denominator === 0 || sumW === 0) return null;

    const slope = (sumW * sumWXY - sumWX * sumWY) / denominator;
    const intercept = (sumWY - slope * sumWX) / sumW;

    // Weighted R² computed in log space to match the regression fit.
    const meanY = sumWY / sumW;
    const totalSumSquares = logYValues.reduce(
      (acc, point) => acc + point.w * Math.pow(point.y - meanY, 2),
      0
    );
    const residualSumSquares = logYValues.reduce(
      (acc, point) => acc + point.w * Math.pow(point.y - (intercept + slope * point.x), 2),
      0
    );
    const rSquared = totalSumSquares > 0 ? 1 - residualSumSquares / totalSumSquares : 0;

    // Convert back from log10 space for plotting.
    const startY = Math.pow(10, intercept + slope * xStart);
    const endY = Math.pow(10, intercept + slope * xEnd);

    return {
      points: [
        { x: xStart, y: startY },
        { x: xEnd, y: endY },
      ],
      slope,
      intercept,
      rSquared,
    } satisfies RegressionResult;
  });
</script>

<div class="w-full bg-white p-6 rounded-lg shadow">
  <div class="mb-4 flex flex-col gap-2">
    {#if title}
      <h2 class="text-2xl font-semibold text-slate-900">
        {title}
      </h2>
    {/if}
    {#if legendItems.length}
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
        {#each legendItems as item (item.label)}
          <button
            type="button"
            class="flex items-center gap-2 rounded px-1 py-0.5 font-semibold text-slate-600 transition duration-200 ease-in-out"
            class:text-slate-900={selectedLegendKeys.includes(item.key)}
            class:bg-slate-100={selectedLegendKeys.includes(item.key)}
            onmouseenter={() => handleLegendEnter(item)}
            onmouseleave={handleLegendLeave}
            onclick={() => handleLegendClick(item)}
          >
            <span class="h-3 w-3 rounded-full" style="background-color: {item.color};"></span>
            <span
              class:opacity-50={visibleLegendCategories !== null &&
                !item.categories.some((category) => visibleLegendCategories.includes(category))}
            >
              {item.label}
            </span>
          </button>
        {/each}
        <button
          type="button"
          class="rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition duration-200 ease-in-out hover:text-slate-800"
          class:opacity-0={selectedLegendKeys.length === 0}
          class:pointer-events-none={selectedLegendKeys.length === 0}
          onclick={() => {
            selectedLegendKeys = [];
            activeLegendKey = null;
          }}
        >
          Clear all
        </button>
      </div>
    {/if}
  </div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="relative h-[600px] w-full"
    style="height: 600px; min-height: 600px;"
    onmouseleave={handleLeave}
  >
    <LayerCake
      position="absolute"
      height={600}
      {data}
      {xDomain}
      {yDomain}
      {yScale}
      x="x"
      y="y"
      padding={{ top: 20, right: 20, bottom: 45, left: 20 }}
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
          r={(d) => d.r ?? 5}
          fill={(d) => d.color ?? '#3b82f6'}
          fillOpacity={0.7}
          isActive={(d) =>
            tooltipData?.label ? (d as { label?: string }).label === tooltipData.label : false}
          isVisible={(d) =>
            visibleLegendCategories
              ? visibleLegendCategories.includes((d as { category?: string }).category ?? '')
              : true}
          activeStroke="#0f172a"
          activeStrokeWidth={1.5}
          activeRadiusOffset={2}
        />

        <Voronoi
          onmouseover={handleHover}
          isVisible={(datum) =>
            visibleLegendCategories
              ? visibleLegendCategories.includes((datum as { category?: string }).category ?? '')
              : true}
        />
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

<style>
  :global(.layercake-container) {
    height: 100%;
    min-height: 600px;
    width: 100%;
  }

  :global(.layercake-layout-svg),
  :global(.layercake-layout-html) {
    width: 100%;
    height: 100%;
  }
</style>
