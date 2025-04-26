<script lang="ts">
  import { scale } from "svelte/transition";
  import { clickoutside } from "@svelte-put/clickoutside";

  let open = $state(false);

  const Examples: Record<string, bigint> = {
    "Contains 00": BigInt("0b10101000101001101001010010011000101000010100110001001010010011000010100001010011000010010000100100110000100010010001001111001"),
    "Modulo 2": BigInt(
      "0b101010100010011010010001000100110100010010101100010101000100110001001000100010011000100010010010111"
    ),
    "Modulo 3": BigInt(
      "0b10101010001001101001000001000100110100010010101100000100101000100110000010100010001001100000100010010010110001001000100010011000101000001000100110001000100001010110000100010010010111"
    ),
    "Square Number": BigInt(
      "0b10100001000100001001101001000010000010011010000001010010110001001000010000010011000010001001000101100001001000001001011000001000010000010000010110000010000010000010000010110000010000001000000100000010011000001000100000010001001100000010010000000100000010110000001000001000000010000101100000010000001000000100000010011000000100001000000100001001100000010001010001011000000010000001000000010000001011000000010000100000001000010110000000100010000001000000100110010000001001001011001000010010010110010000010010010111"
    ),
  };
</script>

<div class="relative inline-block text-left">
  <div>
   
    <button
      type="button"
      class="flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-hidden"
      id="menu-button"
      aria-expanded="true"
      aria-haspopup="true"
      onclick={e => {open = !open; e.cancelBubble = true}}
    >
      <span class="sr-only">Open Examples</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
        />
      </svg>
    </button>
  </div>

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
          <p class="text-sm font-medium text-gray-900" role="none">Load Example</p>
        </div>

        {#each Object.entries(Examples) as [name, godel]}
          <!-- Active: "bg-gray-100 text-gray-900 outline-hidden", Not Active: "text-gray-700" -->

          <a
            href="?goedel={godel.toString(16)}"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 outline-hidden"
            role="menuitem"
            tabindex="-1"
            id="menu-item-0">{name}</a
          >
        {/each}
      </div>
    </div>
  {/if}
</div>
