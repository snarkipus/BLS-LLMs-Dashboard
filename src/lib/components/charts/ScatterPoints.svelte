<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  type DataPoint = { x: number; y: number };

  const ctx = getContext<LayerCakeContext<DataPoint>>('LayerCake');
  const { data, xGet, yGet, xScale, yScale } = ctx;

  let { r = 5, fill = '#0cf', stroke = '#000', strokeWidth = 0, fillOpacity = 1 } = $props();
</script>

<g class="scatter-group">
  {#each $data as d, i (i)}
    <circle
      cx={$xGet(d) + ($xScale.bandwidth ? $xScale.bandwidth() / 2 : 0)}
      cy={$yGet(d) + ($yScale.bandwidth ? $yScale.bandwidth() / 2 : 0)}
      {r}
      {fill}
      {stroke}
      stroke-width={strokeWidth}
      fill-opacity={fillOpacity}
    />
  {/each}
</g>
