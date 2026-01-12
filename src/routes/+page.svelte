<script lang="ts">
  import { scaleSqrt } from 'd3-scale';
  import LayerCakeChart from '$lib/components/charts/LayerCakeChart.svelte';
  import occpoints from '$lib/stores/oews_2024_gpt_exposure_soc2018.json';
  import type { OccPoint } from '$lib/types/occpoints';

  const occPointData: OccPoint[] = occpoints;
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

  const getEducationColor = (education?: string) =>
    education ? (educationColorMap[education] ?? '#94a3b8') : '#94a3b8';

  const wageValues = occPointData.map((point) => point.median_annual_wage);
  const minWage = Math.min(...wageValues);
  const maxWage = Math.max(...wageValues);

  const employmentValues = occPointData.map((point) => point.employment);
  const minEmployment = Math.min(...employmentValues);
  const maxEmployment = Math.max(...employmentValues);

  const radiusScale = scaleSqrt().domain([minEmployment, maxEmployment]).range([3, 30]);

  const scatterData = occPointData.map((point) => ({
    x: point.exposure_human_gamma,
    y: point.median_annual_wage,
    label: point.soc_title,
    color: getEducationColor(point.education),
    r: radiusScale(point.employment),
    wage: point.median_annual_wage,
    probability: point.exposure_human_gamma,
    employment: point.employment,
  }));

  const xDomain: [number, number] = [-0.1, 1.1];
  const xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1];

  const wageStep = 25000;
  const yDomainMin = Math.floor(minWage / wageStep) * wageStep;
  const yDomainMax = Math.ceil(maxWage / wageStep) * wageStep;
  const yTickCandidates = [25000, 50000, 100000, 200000, 250000];
  const yTicks = yTickCandidates.filter((tick) => tick >= yDomainMin && tick <= yDomainMax);
  const yDomain: [number, number] = [yDomainMin, yDomainMax];
</script>

<div class="min-h-screen bg-gray-50 py-10">
  <div class="mx-auto w-full max-w-[1300px] px-6">
    <section>
      <LayerCakeChart
        data={scatterData}
        title="Which Occupations Are Most Exposed to LLMs—and How Much Do They Pay?"
        xLabelLeft="← Least likely to be effected"
        xLabelRight="Most likely to be effected →"
        yLabel="Average annual wage"
        {xDomain}
        {yDomain}
        {xTicks}
        {yTicks}
      />
    </section>
  </div>
</div>
