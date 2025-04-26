<script lang="ts" module>
  import type { TuringMachineDefinition } from "../types";

  export type TuringMachineDiagramProps = {
    /**
     * The turing machine definition to render
     */
    tm: TuringMachineDefinition;


    /**
     * The state to highlight
     */
    highlighted_state?: number;
  };
</script>

<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  import * as d3 from "d3";
  import {
    getSimulationConfigForTuringMachine,
    type StateNode,
    type TransitionNode,
    type SelfTransitionNode,
  } from "./simulation.svelte";
  import State from "./State.svelte";
  import Transition from "./Transition.svelte";
  import SelfTransition from "./SelfTransition.svelte";

  let { tm, highlighted_state }: TuringMachineDiagramProps = $props();

  let width = $state(800);
  let height = $state(800);

  const { nodes, links } = getSimulationConfigForTuringMachine(tm);
  for (const node of nodes) {
    node.x += width / 2;
    node.y += height / 2;
  }
  type Node = (typeof nodes)[number];
  type Link = (typeof links)[number];

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink<Node, Link>(links)
        .id((d) => d.data.id)
        .distance((l) => l.data.desired_length)
        .strength(1)
    )
    .force(
      "charge",
      d3.forceManyBody<Node>().strength((d) => d.data.force_radius)
    );

  // change the simulation center whenever the window is resized
  $effect(() => {
    simulation.force(
      "center",
      d3.forceCenter(width / 2, height / 2).strength(0.1)
    );

    const padding = 80;

    const leftEdge = padding;
    const rightEdge = width - padding;
    const topEdge = padding;
    const bottomEdge = height - padding;

    // force nodes into the viewport
    simulation.force(
      "in-x",
      d3.forceX<Node>(leftEdge).strength((d) => (d.x < leftEdge ? 0.5 : 0))
    );
    simulation.force(
      "in-y",
      d3.forceY<Node>(topEdge).strength((d) => (d.y < topEdge ? 0.5 : 0))
    );
    simulation.force(
      "out-x",
      d3.forceX<Node>(rightEdge).strength((d) => (d.x >rightEdge? 0.5 : 0))
    );
    simulation.force(
      "out-y",
      d3.forceY<Node>(bottomEdge).strength((d) => (d.y >bottomEdge ? 0.5 : 0))
    );

    simulation.force(
      "starting_node_left",
      d3
        .forceX<Node>((d) =>
          d.data.type === "state" && d.data.is_starting ? 0 + 50 : 0
        )
        .strength((d) =>
          d.data.type === "state" && d.data.is_starting ? 0.1 : 0
        )
    );

    simulation.force(
      "accepting_node_right",
      d3
        .forceX<Node>((d) =>
          d.data.type === "state" && d.data.is_accepting ? width - 50 : 0
        )
        .strength((d) =>
          d.data.type === "state" && d.data.is_accepting ? 0.1 : 0
        )
    );
  });
</script>

<div class="w-full h-full" bind:clientWidth={width} bind:clientHeight={height}>
  <svg {width} {height} viewBox="0 0 {width} {height}">
    <defs>
      <marker
        id="arrowhead"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="8"
        markerHeight="8"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
    {#each nodes as node}
      {#if node.data.type == "state"}
        <State highlighted={!!highlighted_state && node.data.id == "q"+highlighted_state} state={node as StateNode} />
      {/if}

      {#if node.data.type == "self-transition"}
        <SelfTransition transition={node as SelfTransitionNode} />
      {/if}

      {#if node.data.type == "transition"}
        <Transition transition={node as TransitionNode} />
      {/if}
    {/each}
  </svg>
</div>
