<script lang="ts">
  import type { TuringMachineConfiguration } from "./types";
  import { readSymbolAtOffset } from "./utm";

  let { configuration }: { configuration: TuringMachineConfiguration } =
    $props();
</script>

<div class="w-full flex flex-row justify-between my-10  border-y shadow-xl  border-gray-100">
  {#each new Array(31) as _, i}
    {@const idx = i - 15}
    {@const symbolID = readSymbolAtOffset(configuration, idx)}
    {@const symbol = configuration.tm.alphabet[symbolID - 1]}
    <div class="px-4 py-2 hover:bg-gray-200 duration-100  font-mono">{symbol}</div>
  {/each}
</div>
