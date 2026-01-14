<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  const ctx = getContext<LayerCakeContext>('LayerCake');
  const { width: chartWidth } = ctx;

  interface Props {
    text?: string;
    offset?: number;
    fontSize?: number;
    fontWeight?: string;
    fill?: string;
    align?: 'left' | 'center' | 'right';
    inset?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  let {
    text = '',
    offset = 30,
    fontSize = 20,
    fontWeight = 'bold',
    fill = '#222',
    align = 'center',
    inset = 0,
    ...restProps
  }: Props = $props();

  // Compute title position/anchor based on alignment.
  let titleX = $derived.by(() => {
    if (align === 'left') {
      return inset;
    }

    if (align === 'right') {
      return $chartWidth - inset;
    }

    return $chartWidth / 2;
  });

  let anchor = $derived.by(() => {
    if (align === 'left') {
      return 'start';
    }

    if (align === 'right') {
      return 'end';
    }

    return 'middle';
  });
</script>

{#if text}
  <text
    x={titleX}
    y={-offset}
    text-anchor={anchor}
    dominant-baseline="hanging"
    font-size={fontSize}
    font-weight={fontWeight}
    {fill}
    {...restProps}
  >
    {text}
  </text>
{/if}
