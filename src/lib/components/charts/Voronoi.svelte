<script lang="ts">
  import { getContext } from 'svelte';
  import { uniques } from 'layercake';
  import { Delaunay } from 'd3-delaunay';

  import type { LayerCakeContext } from '$lib/types/layercake';

  type Point = [number, number] & { data?: unknown };
  type HoverHandler = (event: MouseEvent, point: Point) => void;
  type Props = {
    stroke?: string;
    onmouseover?: HoverHandler;
    isVisible?: (datum: unknown) => boolean;
  };

  // LayerCake provides stores for data, accessors, and dimensions.
  const layerCake = getContext<LayerCakeContext>('LayerCake');
  const { data, xGet, yGet, width, height } = layerCake;

  let { stroke, onmouseover = noopHover, isVisible = alwaysVisible }: Props = $props();

  let points = $derived($data.filter(isVisibleDatum).map(createPoint).filter(isFinitePoint));

  // Deduplicate to keep Voronoi stable when data repeats.
  let uniquePoints = $derived(uniques(points, pointKey, false) ?? []);
  let voronoi = $derived.by(() => {
    if (!$width || !$height || $width <= 0 || $height <= 0 || uniquePoints.length === 0) {
      return null;
    }

    return Delaunay.from(uniquePoints).voronoi([0, 0, $width, $height]);
  });

  function noopHover(_event: MouseEvent, _point: Point): void {}

  function alwaysVisible(): boolean {
    return true;
  }

  function isVisibleDatum(datum: unknown): boolean {
    return isVisible(datum);
  }

  function createPoint(datum: unknown): Point {
    const point: Point = [$xGet(datum), $yGet(datum)];
    point.data = datum;
    return point;
  }

  function isFinitePoint(point: Point): boolean {
    return Number.isFinite(point[0]) && Number.isFinite(point[1]);
  }

  function pointKey(point: Point): string {
    return point.join();
  }

  function handleHover(event: MouseEvent, point: Point): void {
    onmouseover?.(event, point);
  }
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
