<script lang="ts" module>
  import type { TuringMachineDefinition } from "./types";

  export type TuringMachineDiagramProps = {
    /**
     * The turing machine definition to render
     */
    tm: TuringMachineDefinition;
  };
</script>

<script lang="ts">
  import * as d3 from "d3";

  let { tm }: TuringMachineDiagramProps = $props();

  /**
   * Renders the Turing Machine diagram using d3.js
   *
   * @param svgElement
   */
  function utmGraph(svgElement: SVGSVGElement, tm: TuringMachineDefinition) {
    const nodes = [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }];

    const links = [
      { source: "A", target: "B", label: "AB" },
      { source: "A", target: "C", label: "AC" },
      { source: "B", target: "D", label: "BD" },
      { source: "C", target: "D", label: "CD" },
    ];

    const svg = d3.select(svgElement);

    const width = +svg.attr("width")!;
    const height = +svg.attr("height")!;

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10) // adjust this based on arrow position
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#333");

    const incomingArrow = svg
      .append("line")
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("stroke-width", 2);

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .call(drag(simulation));

    node.append("circle").attr("r", 10);

    node
      .append("text")
      .attr("x", 0)
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .text((d) => d.id);

    // Edge Labels
    const edgeLabels = svg
      .append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .text((d) => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);

      edgeLabels
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2);

      // update incoming arrow
      const target = nodes.find((d) => d.id === "A");

      if (target) {
        const dx = -40; // direction of the arrow (from the left)
        const spacing = 10;

        incomingArrow
          .attr("x1", target.x + dx)
          .attr("y1", target.y)
          .attr("x2", target.x - spacing)
          .attr("y2", target.y);
      }
    });

    function drag(simulation: d3.Simulation<any, undefined>) {
      return d3
        .drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }

    return {
      destroy: () => {
        simulation.stop();
      },
    };
  }

  let width = $state(800);
  let height = $state(600);
</script>

<div
  class="w-full h-100 border-1 border-amber-300"
  bind:clientWidth={width}
  bind:clientHeight={height}
>
  {#key [width, height, tm]}
    <svg {width} {height} use:utmGraph={tm}></svg>
  {/key}
</div>
