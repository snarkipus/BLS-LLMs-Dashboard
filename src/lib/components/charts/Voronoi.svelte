<script lang="ts">
  import { getContext } from 'svelte';
  import { uniques } from 'layercake';
  import { Delaunay } from 'd3-delaunay';

  import type { LayerCakeContext } from '$lib/types/layercake';

  type Point = [number, number] & { data?: unknown };
  type Props = {
    stroke?: string;
    onmouseover?: (event: MouseEvent, point: Point) => void;
    isVisible?: (datum: unknown) => boolean;
  };

  const { data, xGet, yGet, width, height } = getContext<LayerCakeContext>('LayerCake');

  let { stroke, onmouseover = () => {}, isVisible = () => true }: Props = $props();

  let points = $derived(
    $data
      .filter((datum: unknown) => isVisible(datum))
      .map((datum: unknown) => {
        const point: Point = [$xGet(datum), $yGet(datum)];
        point.data = datum;
        return point;
      })
      .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
  );

  let uniquePoints = $derived(uniques(points, (point: Point) => point.join(), false) ?? []);
  let voronoi = $derived.by(() => {
    if (!$width || !$height || $width <= 0 || $height <= 0 || uniquePoints.length === 0) {
      return null;
    }

    return Delaunay.from(uniquePoints).voronoi([0, 0, $width, $height]);
  });

  const handleHover = (event: MouseEvent, point: Point) => {
    onmouseover?.(event, point);
  };
</script>

{#if voronoi}
  {#each uniquePoints as point, i (point.join())}
    <!-- svelte-ignore a11y_mouse_events_have_key_events -->
    <path
      style="stroke: {stroke}"
      class="voronoi-cell"
      d={voronoi.renderCell(i)}
      onmouseover={(event) => handleHover(event, point)}
      onmousemove={(event) => handleHover(event, point)}
      role="tooltip"
    ></path>
  {/each}
{/if}

<style>
  .voronoi-cell {
    fill: none;
    stroke: none;
    pointer-events: all;
    outline: none;
  }
</style>
