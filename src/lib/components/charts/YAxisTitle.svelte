<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  const ctx = getContext<LayerCakeContext>('LayerCake');
  const { height } = ctx;

  interface Props {
    text?: string;
    offset?: number;
    fontSize?: number;
    fontWeight?: string;
    fill?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  let {
    text = '',
    offset = 45,
    fontSize = 13,
    fontWeight = 'bold',
    fill = '#333',
    ...restProps
  }: Props = $props();
</script>

{#if text}
  <text
    transform="rotate(-90)"
    x={-$height / 2}
    y={-offset}
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
