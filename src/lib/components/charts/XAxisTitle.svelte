<script lang="ts">
  import { getContext } from 'svelte';

  const ctx = getContext('LayerCake') as any;
  const { width, height } = ctx;

  interface Props {
    text?: string;
    offset?: number;
    fontSize?: number;
    fontWeight?: string;
    fill?: string;
    [key: string]: any;
  }

  let {
    text = '',
    offset = 35,
    fontSize = 13,
    fontWeight = 'bold',
    fill = '#333',
    ...restProps
  }: Props = $props();
</script>

{#if text}
  <text
    x={$width / 2}
    y={$height + offset}
    text-anchor="middle"
    dominant-baseline="hanging"
    font-size={fontSize}
    font-weight={fontWeight}
    {fill}
    {...restProps}
  >
    {text}
  </text>
{/if}
