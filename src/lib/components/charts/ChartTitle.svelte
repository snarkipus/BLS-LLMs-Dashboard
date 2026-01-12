<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  const ctx = getContext<LayerCakeContext>('LayerCake');
  const { width } = ctx;

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

  let titleX = $derived(align === 'left' ? inset : align === 'right' ? $width - inset : $width / 2);
  let anchor = $derived(align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle');
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
