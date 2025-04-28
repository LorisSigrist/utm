<script lang="ts">
  import type { StateNode } from "./simulation.svelte";

  let {
    state: node,
    highlighted = false,
    svg,
  }: { state: StateNode; highlighted?: boolean; svg?: SVGSVGElement } = $props();

  let is_starting = $derived(node.data.is_starting);
  let is_accepting = $derived(node.data.is_accepting);

  let cx = $derived(node.x);
  let cy = $derived(node.y);

  let id = $derived(node.data.id);

  let fillColor = $derived.by(() => {
    if (!highlighted) return "white";
    if (is_accepting) return "lime";
    return "yellow";
  });

  function getPositionInSVG(event: PointerEvent, svg: SVGSVGElement) {
    const svgRect = svg.getBoundingClientRect();
    return {
      x: event.clientX - svgRect.left,
      y: event.clientY - svgRect.top,
    };
  }

  // handle drag
  let dragging = $state(false);
  function startDrag(event: PointerEvent) {
    if(!svg) return;
    dragging = true;

    const position = getPositionInSVG(event, svg);
    node.fx = position.x;
    node.fy = position.y;
  }

  function ondrag(event: PointerEvent) {
    if(!svg) return;
    if (!dragging) return;

    const position = getPositionInSVG(event, svg);
    node.fx = position.x;
    node.fy = position.y;
  }

  function stopdrag(event: PointerEvent) {
    dragging = false;

    node.fx = undefined;
    node.fy = undefined;
  }
</script>

<svelte:window
  onpointerup={dragging ? stopdrag : undefined}
  onpointermove={dragging ? ondrag : undefined}
  onpointercancel={dragging ? stopdrag : undefined}
  onpointerleave={dragging ? stopdrag : undefined}
/>
<g
  id="state-{id}"
  onpointerdown={startDrag}
>
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

  <circle
    {cx}
    {cy}
    r="30"
    fill={fillColor}
    stroke="black"
    stroke-width="2"
  ></circle>

  {#if is_accepting}
    <circle {cx} {cy} r="25" fill="transparent" stroke="black" stroke-width="2"
    ></circle>
  {/if}

  <text x={cx} y={cy} text-anchor="middle" dominant-baseline="middle">{id}</text
  >
</g>

<style>
  g {
    pointer-events: auto;
    cursor: pointer;
  }

  text {
    pointer-events: none;
  }
</style>
