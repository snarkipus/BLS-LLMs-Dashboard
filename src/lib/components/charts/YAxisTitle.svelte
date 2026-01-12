<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  const ctx = getContext<LayerCakeContext>('LayerCake');
  const { height, width, yRange } = ctx;

  interface Props {
    text?: string;
    offset?: number;
    inset?: number;
    fontSize?: number;
    fontWeight?: string;
    fill?: string;
    position?: 'left' | 'right';
    orientation?: 'vertical' | 'horizontal';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  let {
    text = '',
    offset = 45,
    inset = 8,
    fontSize = 13,
    fontWeight = 'bold',
    fill = '#333',
    position = 'left',
    orientation = 'vertical',
    ...restProps
  }: Props = $props();

  let rotation = $derived(position === 'right' ? 90 : -90);
  let titleX = $derived(position === 'right' ? $height / 2 : -$height / 2);
  let titleY = $derived(position === 'right' ? -($width + offset) : -offset);

  let yTop = $derived(Math.min(...$yRange));
  let horizontalX = $derived(position === 'right' ? $width - inset : inset);
  let horizontalY = $derived(yTop - offset);
  let horizontalAnchor = $derived(position === 'right' ? 'end' : 'start');
</script>

{#if text}
  {#if orientation === 'horizontal'}
    <text
      x={horizontalX}
      y={horizontalY}
      text-anchor={horizontalAnchor}
      dominant-baseline="hanging"
      font-size={fontSize}
      font-weight={fontWeight}
      {fill}
      {...restProps}
    >
      {text}
    </text>
  {:else}
    <text
      transform="rotate({rotation})"
      x={titleX}
      y={titleY}
      text-anchor="middle"
      dominant-baseline="middle"
      font-size={fontSize}
      font-weight={fontWeight}
      {fill}
      {...restProps}
    >
      {text}
    </text>
  {/if}
{/if}
