<script lang="ts">
  import { scaleLog } from 'd3-scale';
  import { Html, LayerCake, Svg } from 'layercake';

  import Tooltip from './Tooltip.html.svelte';
  import Voronoi from './Voronoi.svelte';

  import ScatterPoints from './ScatterPoints.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';
  import XAxisTitle from './XAxisTitle.svelte';
  import YAxisTitle from './YAxisTitle.svelte';
  import ChartTitle from './ChartTitle.svelte';

  type DataPoint = {
    x: number;
    y: number;
    label?: string;
    color?: string;
    r?: number;
    wage?: number;
    probability?: number;
    employment?: number;
  };
  type Domain = [number | null, number | null];

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
  }: Props = $props();

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
    tooltipEvent = event;
    tooltipData = (point.data ?? null) as DataPoint | null;
  };

  const handleLeave = () => {
    tooltipEvent = null;
    tooltipData = null;
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="w-full h-[540px] bg-white p-6 rounded-lg shadow relative" onmouseleave={handleLeave}>
  <LayerCake
    {data}
    {xDomain}
    {yDomain}
    {yScale}
    x="x"
    y="y"
    padding={{ top: 40, right: 20, bottom: 45, left: 20 }}
  >
    <Svg>
      <ChartTitle text={title} offset={24} fontSize={22} align="left" inset={0} />
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
      <ScatterPoints
        r={(d) => d.r ?? 5}
        fill={(d) => d.color ?? '#3b82f6'}
        fillOpacity={0.7}
        isActive={(d) =>
          tooltipData?.label ? (d as { label?: string }).label === tooltipData.label : false}
        activeStroke="#0f172a"
        activeStrokeWidth={1.5}
        activeRadiusOffset={2}
      />
      <Voronoi onmouseover={handleHover} />
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
