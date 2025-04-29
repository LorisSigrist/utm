<script lang="ts" module>
  export type LoadExampleDropdownProps = {
    /**
     * Callback to call when an example is selected
     */
    onselect?: (example: bigint) => void;
  };
</script>

<script lang="ts">
  import { scale } from "svelte/transition";
  import { clickoutside } from "@svelte-put/clickoutside";
  import BookOpenIcon from "~icons/heroicons/book-open";

  let { onselect }: LoadExampleDropdownProps = $props();

  let open = $state(false);

  const Examples: Record<string, bigint> = {
    "Contains 00": BigInt(
      "0b10101000101001101001010010011000101000010100110001001010010011000010100001010011000010010000100100110000100010010001001111001"
    ),
    "Modulo 2": BigInt(
      "0b101010100010011010010001000100110100010010101100010101000100110001001000100010011000100010010010111"
    ),
    "Modulo 3": BigInt(
      "0b10101010001001101001000001000100110100010010101100000100101000100110000010100010001001100000100010010010110001001000100010011000101000001000100110001000100001010110000100010010010111"
    ),
    "Square Number": BigInt(
      "0b100010100001000010110001000001000010000001011000100001000100001001100010000001000100000010011000100010100010110000100001000010000101100001000000100001000000101100001000100010000100110100001010101101000000100000100000010011010100000000100000010011010001001000100110100000100100000100110000010100000000100000010011000000100000010000001000001011000000100000100000010000010110000001000010001000010011000000100010001000100110000000100001000000010101100000001000000100000001010110000000100010010001001100000001000001001000001001100000001010010100110000000010100000010101100000000100010000000100010111"
    ),
    "Infinite Loop": BigInt("0b101000101000100111"),
  };

  function handleClick(example: bigint) {
    open = false;
    if (onselect) onselect(example);
  }
</script>

<div class="relative inline-block text-left">
  <button
    type="button"
    class="flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-hidden"
    id="menu-button"
    aria-expanded="true"
    aria-haspopup="true"
    onclick={(e) => {
      open = !open;
      e.cancelBubble = true;
    }}
  >
    <span class="sr-only">Open Examples</span>
    <BookOpenIcon class="size-6" />
  </button>

  {#if open}
    <div
      class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabindex="-1"
      in:scale={{ duration: 100, start: 0.95, opacity: 0 }}
      out:scale={{ duration: 75, start: 0.95, opacity: 0 }}
      use:clickoutside
      onclickoutside={() => (open = false)}
    >
      <div class="py-1 divide-y divide-gray-100" role="none">
        <div class="px-4 py-3" role="none">
          <p class="text-sm font-medium text-gray-900" role="none">
            Load Example
          </p>
        </div>

        {#each Object.entries(Examples) as [name, godel]}
          <!-- Active: "bg-gray-100 text-gray-900 outline-hidden", Not Active: "text-gray-700" -->

          <button
            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 outline-hidden"
            role="menuitem"
            onclick={() => handleClick(godel)}
            tabindex="-1"
            id="menu-item-0">{name}</button
          >
        {/each}
      </div>
    </div>
  {/if}
</div>
