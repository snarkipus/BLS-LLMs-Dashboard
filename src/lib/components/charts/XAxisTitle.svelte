<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  const ctx = getContext<LayerCakeContext>('LayerCake');
  const { width, height, xScale } = ctx;

  interface Props {
    text?: string;
    offset?: number;
    fontSize?: number;
    fontWeight?: string;
    fill?: string;
    align?: 'left' | 'center' | 'right';
    inset?: number;
    tick?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  let {
    text = '',
    offset = 35,
    fontSize = 13,
    fontWeight = 'bold',
    fill = '#333',
    align = 'center',
    inset = 0,
    tick = undefined,
    ...restProps
  }: Props = $props();

  let tickOffset = $derived(
    typeof tick === 'number'
      ? $xScale(tick) + (typeof $xScale.bandwidth === 'function' ? $xScale.bandwidth() / 2 : 0)
      : null
  );
  let titleX = $derived(
    tickOffset ?? (align === 'left' ? inset : align === 'right' ? $width - inset : $width / 2)
  );
  let anchor = $derived(align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle');
</script>

{#if text}
  <text
    x={titleX}
    y={$height + offset}
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
