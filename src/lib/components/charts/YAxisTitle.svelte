<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

  function getLayerCakeContext(): LayerCakeContext {
    return getContext<LayerCakeContext>('LayerCake');
  }

  // LayerCake provides reactive stores for chart dimensions and scales.
  const layerCake = getLayerCakeContext();
  const { height, width, yRange } = layerCake;

  interface Props {
    text?: string;
    offset?: number;
    inset?: number;
    fontSize?: number;
    fontWeight?: string;
    fill?: string;
    position?: 'left' | 'right';
    orientation?: 'vertical' | 'horizontal';
    [key: string]: unknown;
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

  function getRotation(isRight: boolean): number {
    return isRight ? 90 : -90;
  }

  function getTitleX(heightValue: number, isRight: boolean): number {
    return (isRight ? 1 : -1) * (heightValue / 2);
  }

  function getTitleY(widthValue: number, offsetValue: number, isRight: boolean): number {
    return isRight ? -(widthValue + offsetValue) : -offsetValue;
  }

  function getHorizontalX(widthValue: number, insetValue: number, isRight: boolean): number {
    return isRight ? widthValue - insetValue : insetValue;
  }

  function getHorizontalAnchor(isRight: boolean): 'start' | 'end' {
    return isRight ? 'end' : 'start';
  }

  let isRight = $derived(position === 'right');
  let isHorizontal = $derived(orientation === 'horizontal');

  // Vertical title layout uses rotation around the chart center.
  let rotation = $derived(getRotation(isRight));
  let titleX = $derived(getTitleX($height, isRight));
  let titleY = $derived(getTitleY($width, offset, isRight));

  // Horizontal title layout anchors at the top of the y-range.
  let yTop = $derived(Math.min(...$yRange));
  let horizontalX = $derived(getHorizontalX($width, inset, isRight));
  let horizontalY = $derived(yTop - offset);
  let horizontalAnchor = $derived(getHorizontalAnchor(isRight));
</script>

{#if text}
  {#if isHorizontal}
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
