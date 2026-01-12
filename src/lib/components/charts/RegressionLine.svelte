<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  type Point = { x: number; y: number };

  type Props = {
    points: [Point, Point] | null;
    stroke?: string;
    strokeWidth?: number;
  };

  const ctx = getContext<LayerCakeContext<Point>>('LayerCake');
  const { xScale, yScale } = ctx;

  let { points, stroke = '#111827', strokeWidth = 1 }: Props = $props();

  let line = $derived(
    points
      ? {
          x1: $xScale(points[0].x),
          y1: $yScale(points[0].y),
          x2: $xScale(points[1].x),
          y2: $yScale(points[1].y),
        }
      : null
  );
</script>

{#if line}
  <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} {stroke} stroke-width={strokeWidth} />
{/if}
