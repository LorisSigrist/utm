<script lang="ts">
  import type { TransitionNode } from "./simulation.svelte";
  import Labels from "./Labels.svelte";
  import {
    type Vector2D,
    difference,
    normalizeVector,
    scale,
    addVectors,
  } from "./vectors";

  let { transition }: { transition: TransitionNode } = $props();

  let from: Vector2D = $derived({
    x: transition.data.from.x,
    y: transition.data.from.y,
  });
  let to: Vector2D = $derived({
    x: transition.data.to.x,
    y: transition.data.to.y,
  });
  let label: Vector2D = $derived({ x: transition.x, y: transition.y });

  let start = $derived(
    addVectors(scale(normalizeVector(difference(from, label)), 30), from)
  );
  let end = $derived(
    addVectors(scale(normalizeVector(difference(to, label)), -30), to)
  );
</script>

<g id="transition-{transition.data.id}">
  <path
    d="M {start.x} {start.y} Q {label.x} {label.y} {end.x} {end.y}"
    stroke="black"
    stroke-width="2"
    fill="none"
    marker-end="url(#arrowhead)"
  />

  <Labels labels={transition.data.labels} x={label.x} y={label.y} />
</g>
