<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    event: MouseEvent;
    offset?: number;
    children?: Snippet;
  };

  let { event, offset = -35, children }: Props = $props();

  // Use layer coordinates so the tooltip follows the cursor inside the chart.
  let layerX = $derived(event?.layerX);
  let layerY = $derived(event?.layerY);
  let hasPosition = $derived(layerX !== undefined && layerY !== undefined);

  let tooltipStyle = $derived.by(() => {
    if (layerX === undefined || layerY === undefined) {
      return '';
    }

    return `top: ${layerY + offset}px; left: ${layerX}px;`;
  });
</script>

{#if hasPosition}
  <div class="tooltip" style={tooltipStyle}>
    {@render children?.()}
  </div>
{/if}

<style>
  .tooltip {
    position: absolute;
    width: 220px;
    border: 1px solid #e2e8f0;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.95);
    transform: translate(-50%, -100%);
    padding: 10px 12px;
    z-index: 15;
    border-radius: 8px;
    box-shadow: 0 12px 20px rgba(15, 23, 42, 0.12);
  }
</style>
