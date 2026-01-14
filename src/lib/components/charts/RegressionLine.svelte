<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  type Point = { x: number; y: number };

  interface LineCoordinates {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  type Props = {
    points: [Point, Point] | null;
    stroke?: string;
    strokeWidth?: number;
  };

  // LayerCake context provides reactive scale functions.
  const layerCake = getContext<LayerCakeContext<Point>>('LayerCake');
  const { xScale, yScale } = layerCake;

  let { points, stroke = '#111827', strokeWidth = 1 }: Props = $props();

  function toLineCoordinates(points: [Point, Point] | null): LineCoordinates | null {
    if (!points) {
      return null;
    }

    const [start, end] = points;

    return {
      x1: $xScale(start.x),
      y1: $yScale(start.y),
      x2: $xScale(end.x),
      y2: $yScale(end.y),
    };
  }

  let line = $derived(toLineCoordinates(points));
</script>

{#if line}
  <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} {stroke} stroke-width={strokeWidth} />
{/if}
