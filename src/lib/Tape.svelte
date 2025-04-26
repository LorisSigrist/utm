<script lang="ts">
  import type { TuringMachineConfiguration } from "./types";
  import { readSymbol, readSymbolAtOffset } from "./utm";
  import VirtualList from "svelte-tiny-virtual-list";

  let { configuration }: { configuration: TuringMachineConfiguration } =
    $props();

  let width: number = $state(1000);

  const ITEM_SIZE = 32;

  let index_offset = 10_000;
  let tape_position = $state(0);
  let offset_px = $derived(
    ITEM_SIZE * (index_offset + tape_position) - width / 2 + ITEM_SIZE / 2
  );

  let list: VirtualList | undefined = $state(undefined);

  export function scrollToPosition(position: number) {
    if (!list) return;
    tape_position = position;
  }
</script>

<div class="w-full">
  <div class="w-full flex flex-row justify-center">
    <span>|</span>
  </div>

  <div
    bind:clientWidth={width}
    class="w-full flex flex-row justify-between my-10 border-y shadow-xl border-gray-100 overflow-hidden"
  >
    <VirtualList
      bind:this={list}
      height="{ITEM_SIZE}px"
      {width}
      scrollDirection="horizontal"
      scrollOffset={offset_px}
      scrollToBehaviour="smooth"
      itemCount={1000000}
      itemSize={ITEM_SIZE}
    >
      <div slot="item" let:index let:style {style}>
        {@const tapePosition = index - index_offset}
        {@render square(tapePosition)}
      </div>
    </VirtualList>
  </div>
</div>

{#snippet square(tapePosition: number)}
  {@const symbolID = readSymbol(configuration, tapePosition)}
  {@const symbol = configuration.tm.alphabet[symbolID - 1]}
  <div
    class="relative h-8 w-8 grid place-items-center text-black hover:bg-gray-200 duration-100 font-mono"
  >
    <span>{symbol}</span>

    {#if tapePosition === configuration.current_position}
      <div class="absolute top-0 left-1/2 h-4 w-4 bg-red-500 -translate-x-1/2 -translate-y-8" ></div>
    {/if}
  </div>
{/snippet}

<style>
  :global(.virtual-list-wrapper) {
    overflow-x: scroll;
    overflow-y: visible;

    /* hide scrollbar */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>
