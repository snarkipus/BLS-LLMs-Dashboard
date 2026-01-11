<script lang="ts">
  import { LayerCake, Svg } from 'layercake';

  import ScatterPoints from './ScatterPoints.svelte';
  import AxisX from './AxisX.svelte';
  import AxisY from './AxisY.svelte';
  import XAxisTitle from './XAxisTitle.svelte';
  import YAxisTitle from './YAxisTitle.svelte';
  import ChartTitle from './ChartTitle.svelte';

  type DataPoint = { x: number; y: number };

  let { data }: { data: Array<DataPoint> } = $props();
</script>

<div class="w-full h-80 bg-white p-4 rounded-lg shadow">
  <LayerCake
    {data}
    yDomain={[0, null]}
    xDomain={[0, null]}
    x="x"
    y="y"
    padding={{ top: 20, right: 20, bottom: 45, left: 45 }}
  >
    <Svg>
      <ChartTitle text="My Awesome Scatter Plot" offset={40} fontSize={22} />
      <AxisX gridlines={false} baseline={true} tickMarks={true} />
      <AxisY gridlines={false} baseline={true} tickMarks={true} />
      <ScatterPoints r={5} fill="#3b82f6" fillOpacity={0.7} />
      <XAxisTitle text="X Axis Title" offset={40} />
      <YAxisTitle text="Y Axis Title" offset={40} />
    </Svg>
  </LayerCake>
</div>
