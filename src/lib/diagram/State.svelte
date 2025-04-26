<script lang="ts">
  import type { Action } from "svelte/action";
  import type { StateNode } from "./simulation.svelte";

  let { state : node }: { state: StateNode } = $props();

  let is_starting = $derived(node.data.is_starting);
  let is_accepting = $derived(node.data.is_accepting);

  let cx = $derived(node.x);
  let cy = $derived(node.y);

  let id = $derived(node.data.id);

</script>

<g id="state-{id}">
  {#if is_starting}
    <line
      x1={cx - 100}
      y1={cy}
      x2={cx - 30}
      y2={cy}
      stroke="black"
      stroke-width="2"
      marker-end="url(#arrowhead)"
    ></line>
  {/if}

  <circle {cx} {cy} r="30" fill="white" stroke="black" stroke-width="2"
  ></circle>

  {#if is_accepting}
    <circle {cx} {cy} r="25" fill="transparent" stroke="black" stroke-width="2"
    ></circle>
  {/if}

  <text x={cx} y={cy} text-anchor="middle" dominant-baseline="middle">{id}</text
  >
</g>
