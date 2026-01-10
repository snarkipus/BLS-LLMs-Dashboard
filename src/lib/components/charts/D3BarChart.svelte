<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    data: number[];
    width?: number;
    height?: number;
  }

  let { data, width = 400, height = 300 }: Props = $props();

  let svgContainer: HTMLElement;

  onMount(() => {
    if (!svgContainer) return;

    import('d3').then((d3) => {
      const svg = d3.select(svgContainer).append('svg').attr('width', width).attr('height', height);

      const xScale = d3.scaleLinear().domain([0, data.length]).range([0, width]);

      const yScale = d3
        .scaleLinear()
        .domain([0, Math.max(...data) || 0])
        .range([height, 0]);

      svg
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (_d: unknown, i: number) => xScale(i)!)
        .attr('y', (d: number) => yScale(d))
        .attr('width', width / data.length - 2)
        .attr('height', (d: number) => height - yScale(d))
        .attr('fill', '#3b82f6');

      return () => {
        d3.select(svgContainer).selectAll('*').remove();
      };
    });
  });
</script>

<div bind:this={svgContainer} class="inline-block"></div>
