<script lang="ts">
  import { scaleSqrt } from 'd3-scale';
  import { onMount } from 'svelte';
  import LayerCakeChart from '$lib/components/charts/LayerCakeChart.svelte';
  import type { OccPoint } from '$lib/types/occpoints';

  type ScatterDatum = {
    x: number;
    y: number;
    label: string;
    color: string;
    category: string;
    r: number;
    wage: number;
    probability: number;
    employment: number;
  };

  const educationColorMap: Record<string, string> = {
    'Doctoral or professional degree': '#1f77b4',
    "Master's degree": '#1f77b4',
    "Bachelor's degree": '#22c55e',
    "Associate's degree": '#22c55e',
    'Postsecondary nondegree award': '#facc15',
    'No formal educational credential': '#ef4444',
    'High school diploma or equivalent': '#f59e0b',
    'Some college, no degree': '#f59e0b',
  };

  const legendItems = [
    {
      label: "Doctoral & Master's degree",
      color: educationColorMap['Doctoral or professional degree'],
      key: 'doctoral-masters',
      categories: ['Doctoral or professional degree', "Master's degree"],
    },
    {
      label: "Bachelor & Associate's degree",
      color: educationColorMap["Bachelor's degree"],
      key: 'bachelor-associate',
      categories: ["Bachelor's degree", "Associate's degree"],
    },
    {
      label: 'Postsecondary non-degree award',
      color: educationColorMap['Postsecondary nondegree award'],
      key: 'postsecondary',
      categories: ['Postsecondary nondegree award'],
    },
    {
      label: 'No formal education',
      color: educationColorMap['No formal educational credential'],
      key: 'no-formal',
      categories: ['No formal educational credential'],
    },
    {
      label: 'High school diploma or equivalent',
      color: educationColorMap['High school diploma or equivalent'],
      key: 'high-school',
      categories: ['High school diploma or equivalent', 'Some college, no degree'],
    },
  ];

  const getEducationColor = (education?: string) =>
    education ? (educationColorMap[education] ?? '#94a3b8') : '#94a3b8';

  const DATA_URL = '/data/oews_2024_gpt_exposure_soc2018.json';
  const RADIAL_LEGEND_VALUES = [500_000, 100_000, 7_500];

  let occPointData = $state<OccPoint[] | null>(null);
  let loadError = $state<string | null>(null);

  function buildRadialLegendValues(values: number[]): number[] {
    if (!values.length) {
      return [];
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return RADIAL_LEGEND_VALUES.filter(
      (value) => Number.isFinite(value) && value >= minValue && value <= maxValue
    ).sort((first, second) => second - first);
  }

  onMount(async () => {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) {
        throw new Error(`Failed to load data (${response.status} ${response.statusText})`);
      }

      const json = (await response.json()) as unknown;
      if (!Array.isArray(json)) {
        throw new Error('Data format mismatch (expected an array)');
      }

      occPointData = json as OccPoint[];
    } catch (err) {
      loadError = err instanceof Error ? err.message : String(err);
    }
  });

  const xDomain: [number, number] = [-0.1, 1.1];
  const xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1];

  let employmentValues = $derived.by((): number[] => {
    if (!occPointData) return [];
    return occPointData.map((point) => point.employment).filter((value) => Number.isFinite(value));
  });

  let radiusScale = $derived.by(() => {
    if (!employmentValues.length) return null;

    const minEmployment = Math.min(...employmentValues);
    const maxEmployment = Math.max(...employmentValues);

    return scaleSqrt().domain([minEmployment, maxEmployment]).range([3, 30]);
  });

  let radialLegendScale = $derived.by(() => {
    if (!employmentValues.length) return null;

    const minEmployment = Math.min(...employmentValues);
    const maxEmployment = Math.max(...employmentValues);

    return scaleSqrt().domain([minEmployment, maxEmployment]).range([4, 52]);
  });

  let radialLegendValues = $derived.by(() => buildRadialLegendValues(employmentValues));

  let scatterData = $derived.by((): ScatterDatum[] => {
    if (!occPointData || !radiusScale) return [];

    return occPointData.map((point) => ({
      x: point.exposure_human_gamma,
      y: point.median_annual_wage,
      label: point.soc_title,
      color: getEducationColor(point.education),
      category: point.education ?? 'Other',
      r: radiusScale(point.employment),
      wage: point.median_annual_wage,
      probability: point.exposure_human_gamma,
      employment: point.employment,
    }));
  });

  let yDerived = $derived.by(() => {
    if (!occPointData) {
      return {
        yDomain: [0, 1] as [number, number],
        yTicks: [] as number[],
      };
    }

    const wageValues = occPointData.map((point) => point.median_annual_wage);
    const minWage = Math.min(...wageValues);
    const maxWage = Math.max(...wageValues);

    const wageStep = 25000;
    const yDomainMin = Math.floor(minWage / wageStep) * wageStep;
    const yDomainMax = Math.ceil(maxWage / wageStep) * wageStep;
    const yTickCandidates = [25000, 50000, 100000, 200000, 250000];
    const yTicks = yTickCandidates.filter((tick) => tick >= yDomainMin && tick <= yDomainMax);

    return {
      yDomain: [yDomainMin, yDomainMax] as [number, number],
      yTicks,
    };
  });

  let yDomain = $derived.by(() => yDerived.yDomain);
  let yTicks = $derived.by(() => yDerived.yTicks);
</script>

<div class="min-h-screen bg-gray-50 py-10">
  <div class="mx-auto w-full max-w-[1300px] px-6">
    <section>
      {#if loadError}
        <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Failed to load data: {loadError}
        </div>
      {:else if !occPointData}
        <div class="rounded-xl border border-gray-200 bg-white p-6">
          <div class="h-6 w-2/3 animate-pulse rounded bg-gray-100"></div>
          <div class="mt-4 h-[520px] w-full animate-pulse rounded bg-gray-100"></div>
          <p class="mt-4 text-sm text-gray-600">Loading dataset…</p>
        </div>
      {:else}
        <LayerCakeChart
          data={scatterData}
          title="Which Occupations Are Most Exposed to LLMs ... and How Much Do They Pay?"
          xLabelLeft="← Least likely to be effected"
          xLabelRight="Most likely to be effected →"
          yLabel="Average annual wage"
          {xDomain}
          {yDomain}
          {xTicks}
          {yTicks}
          {legendItems}
          radiusScale={radiusScale ?? undefined}
          radialLegendScale={radialLegendScale ?? undefined}
          {radialLegendValues}
          radialLegendLabel="Employment"
          radialLegendAlign="left"
          radialLegendInset={40}
          radialLegendY={60}
          radialLegendX={40}
        />
      {/if}
    </section>
  </div>
</div>
