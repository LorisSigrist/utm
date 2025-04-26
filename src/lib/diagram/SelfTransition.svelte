<script lang="ts" module>
</script>

<script lang="ts">
  import Labels from "./Labels.svelte";
import type { SelfTransitionNode } from "./simulation.svelte";
  import {
    addVectors,
    normalizeVector,
    rotateVector,
    difference,
    type Vector2D,
    scale,
    vectorLength
  } from "./vectors";

  let { transition }: { transition: SelfTransitionNode } = $props();

  let labelPosition: Vector2D = $derived({ x: transition.x, y: transition.y });
  let nodePosition: Vector2D = $derived({
    x: transition.data.node.x,
    y: transition.data.node.y,
  });

  // A vector pointing to the label from the node
  let nodeToLabel = $derived(difference(labelPosition, nodePosition));
  let normalisedNodeToLabel = $derived(normalizeVector(nodeToLabel));

  let handleLength = $derived(vectorLength(nodeToLabel));

  // Rotate 30° left
  let outDirection = $derived(rotateVector(normalisedNodeToLabel, -Math.PI / 6));

  let outStart = $derived(addVectors(nodePosition, scale(outDirection, 30)));
  let outHandle = $derived(addVectors(nodePosition, scale(outDirection, handleLength)));

  // Rotate 30° right
  let inDirection = $derived(rotateVector(normalisedNodeToLabel, Math.PI / 6));

  let inEnd = $derived(addVectors(nodePosition, scale(inDirection, 30)));
  let inHandle = $derived(addVectors(nodePosition, scale(inDirection, handleLength)));
</script>

<g id="self-transition-{transition.data.id}">
  <path
    d="M {outStart.x} {outStart.y} C {outHandle.x} {outHandle.y} {inHandle.x} {inHandle.y} {inEnd.x} {inEnd.y}"
    stroke="black"
    stroke-width="2"
    fill="none"
    marker-end="url(#arrowhead)"
  />

  <Labels labels={transition.data.labels} x={transition.x} y={transition.y} />
</g>
