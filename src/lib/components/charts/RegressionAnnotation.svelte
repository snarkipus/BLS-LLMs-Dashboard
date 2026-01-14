<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  type Props = {
    lines: string[];
    inset?: number;
    offset?: number;
    lineHeight?: number;
    fontSize?: number;
    fontWeight?: string;
    fill?: string;
    align?: 'left' | 'right';
  };

  // LayerCake provides chart dimensions via context stores.
  const layerCake = getContext<LayerCakeContext>('LayerCake');
  const { width } = layerCake;

  let {
    lines,
    inset = 8,
    offset = 6,
    lineHeight = 14,
    fontSize = 12,
    fontWeight = 'normal',
    fill = '#475569',
    align = 'right',
  }: Props = $props();

  let isRightAligned = $derived(align === 'right');
  let anchor = $derived(isRightAligned ? 'end' : 'start');
  let x = $derived(isRightAligned ? $width - inset : inset);
</script>

{#if lines.length > 0}
  <g class="regression-annotation">
    {#each lines as line, i (line)}
      <text
        {x}
        y={offset + i * lineHeight}
        text-anchor={anchor}
        dominant-baseline="hanging"
        font-size={fontSize}
        font-weight={fontWeight}
        {fill}
      >
        {line}
      </text>
    {/each}
  </g>
{/if}
