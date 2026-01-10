<script lang="ts">
  import { LayerCake, Svg } from 'layercake';

  type DataPoint = { x: number; y: number };

  let { data }: { data: Array<DataPoint> } = $props();
</script>

<div class="w-full h-80 bg-white p-4 rounded-lg shadow">
  <LayerCake {data} x="x" y="y">
    <Svg>
      <circle cx={100} cy={100} r="10" fill="#3b82f6" />
    </Svg>
  </LayerCake>
</div>
