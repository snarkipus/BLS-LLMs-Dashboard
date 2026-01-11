<script lang="ts">
  import { getContext } from 'svelte';

  const ctx = getContext('LayerCake') as any;
  const { height } = ctx;

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
