<script lang="ts">
  import { crossfade, fly } from "svelte/transition";
  import type { TuringMachineConfiguration } from "./types";
  import { readSymbol, readSymbolAtOffset } from "./utm";
  import VirtualList from "svelte-tiny-virtual-list";

  let {
    configuration,
    speed,
  }: { configuration: TuringMachineConfiguration; speed: number } = $props();

  let width: number = $state(1000);

  const ITEM_SIZE = 48;

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

  const [send, receive] = crossfade({});
</script>

<div
  bind:clientWidth={width}
  class="w-full h-12 flex flex-row justify-between border-y shadow-xl border-gray-100"
>
  <VirtualList
    bind:this={list}
    height="{ITEM_SIZE}px"
    {width}
    scrollDirection="horizontal"
    scrollOffset={offset_px}
    scrollToBehaviour="smooth"
    itemCount={1_000_000}
    itemSize={ITEM_SIZE}
  >
    <div slot="item" let:index let:style {style}>
      {@const tapePosition = index - index_offset}
      {@render square(tapePosition)}
    </div>
  </VirtualList>
</div>

{#snippet square(tapePosition: number)}
  {@const symbolID = readSymbol(configuration, tapePosition)}
  {@const symbol = configuration.tm.alphabet[symbolID - 1]}
  {@const isCurrent = tapePosition === configuration.current_position}
  <div
    class="relative w-full h-full font-mono cursor-pointer {!isCurrent
      ? 'text-black'
      : configuration.finished
        ? configuration.accepted
          ? 'text-white bg-green-600'
          : 'text-white bg-red-600'
        : 'text-black'}
      }"
    title="{tapePosition.toString(10)}"
  >
    {#if isCurrent && !configuration.finished}
      <div
        in:receive={{ duration: 300 / speed, key: "current", delay: 0 / speed }}
        out:send={{ duration: 300 / speed, key: "current", delay: 0 / speed }}
        class="absolute inset-0 bg-yellow-300"
      ></div>
    {/if}

    {#key symbol}
      <div
        class="absolute inset-0 grid place-items-center"
        in:fly={{ duration: 100, y: -ITEM_SIZE, opacity: 0 }}
        out:fly={{ duration: 100, y: ITEM_SIZE, opacity: 0 }}
      >
        <span>{symbol}</span>
      </div>
    {/key}
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
