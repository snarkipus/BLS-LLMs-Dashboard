<script lang="ts">
  import D3BarChart from '$lib/components/charts/D3BarChart.svelte';
  import LayerCakeChart from '$lib/components/charts/LayerCakeChart.svelte';

  const barData = [10, 25, 15, 30, 20, 35, 28];

  const scatterData = [
    { x: 10, y: 20 },
    { x: 20, y: 40 },
    { x: 30, y: 25 },
    { x: 40, y: 50 },
    { x: 50, y: 35 },
    { x: 60, y: 60 },
  ];

  let count = $state(0);

  const increment = () => {
    count += 1;
  };

  const doubled = $derived(count * 2);

  $effect(() => {
    console.log('Count changed:', count);
  });
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-6xl mx-auto">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">Svelte 5 + D3 + LayerCake Demo</h1>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Svelte 5 Runes</h2>
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-lg mb-4">
          Count: <span class="font-bold text-blue-600">{count}</span>
        </p>
        <p class="text-lg mb-4">
          Doubled: <span class="font-bold text-purple-600">{doubled}</span>
        </p>
        <button
          onclick={increment}
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Increment
        </button>
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">D3 Bar Chart</h2>
      <div class="bg-white p-6 rounded-lg shadow">
        <D3BarChart data={barData} />
      </div>
    </section>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">LayerCake Chart</h2>
      <div class="bg-white p-6 rounded-lg shadow">
        <LayerCakeChart data={scatterData} />
      </div>
    </section>
  </div>
</div>
