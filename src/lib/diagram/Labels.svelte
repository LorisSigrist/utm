<script lang="ts">
  let { labels, x, y }: { labels: string[]; x: number; y: number } = $props();

  let numLabels = $derived(labels.length);
  let LINE_HEIGHT = 20;
  let WIDHT = 50;
  let topLeft = $derived({
    x: x - WIDHT / 2,
    y: y - LINE_HEIGHT / 2,
  });
</script>

<rect
  x={topLeft.x}
  y={topLeft.y}
  width={WIDHT}
  height={numLabels * LINE_HEIGHT}
  fill="white"

  rx="5"
></rect>
{#each labels as label, i}
  <text
    x={topLeft.x + WIDHT / 2}
    y={topLeft.y + i * LINE_HEIGHT + LINE_HEIGHT / 2}
    text-anchor="middle"
    dominant-baseline="middle"
  >
    {label}
  </text>
{/each}
