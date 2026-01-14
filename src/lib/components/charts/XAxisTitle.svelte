<script lang="ts">
  import { getContext } from 'svelte';
  import type { LayerCakeContext } from '$lib/types/layercake';

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

  const layerCake = getContext<LayerCakeContext>('LayerCake');
  const { width, height, xScale } = layerCake;

  type ScaleLike = {
    (value: number): number;
    bandwidth?: () => number;
  };

  function getScaleBandOffset(scale: ScaleLike): number {
    if (typeof scale.bandwidth === 'function') {
      return scale.bandwidth() / 2;
    }

    return 0;
  }

  // Center on the tick if provided, accounting for band scales.
  function getTickOffset(value: number | undefined, scale: ScaleLike): number | null {
    if (typeof value !== 'number') {
      return null;
    }

    return scale(value) + getScaleBandOffset(scale);
  }

  function getAlignedX(align: Props['align'], inset: number, width: number): number {
    switch (align) {
      case 'left':
        return inset;
      case 'right':
        return width - inset;
      default:
        return width / 2;
    }
  }

  function getTextAnchor(align: Props['align']): 'start' | 'middle' | 'end' {
    switch (align) {
      case 'left':
        return 'start';
      case 'right':
        return 'end';
      default:
        return 'middle';
    }
  }

  let tickOffset = $derived.by(function (): number | null {
    return getTickOffset(tick, $xScale as ScaleLike);
  });

  // Fall back to alignment when no specific tick is targeted.
  let titleX = $derived.by(function (): number {
    if (tickOffset !== null) {
      return tickOffset;
    }

    return getAlignedX(align, inset, $width);
  });

  let anchor = $derived.by(function (): 'start' | 'middle' | 'end' {
    return getTextAnchor(align);
  });
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
