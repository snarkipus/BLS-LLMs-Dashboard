<script lang="ts">
  import { getContext } from 'svelte';

  const ctx = getContext('LayerCake') as any;
  const { width } = ctx;

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
    offset = 30,
    fontSize = 20,
    fontWeight = 'bold',
    fill = '#222',
    ...restProps
  }: Props = $props();
</script>

{#if text}
  <text
    x={$width / 2}
    y={-offset}
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
