<script lang="ts">
  import { fly } from "svelte/transition";
  import type { TuringMachineDefinition } from "./types";

  let { tm }: { tm: TuringMachineDefinition } = $props();

  const duration = 1000;
  const delay_between_transitions = $derived(duration / tm.transitions.length);
</script>

<ul class="min-w-50">
  {#each tm.transitions as transition, i}
    {@const readSymbol = tm.alphabet[transition[1] - 1]}
    {@const writeSymbol = tm.alphabet[transition[3] - 1]}

    <li 
        in:fly|global={{ duration: 1000, opacity: 0, x: -100, delay: i * delay_between_transitions }}
        class=" text-gray-500 hover:text-gray-900 whitespace-nowrap py-0.5 text-sm"
        >
      δ(q{transition[0]}, {readSymbol}) = (q{transition[2]}, {writeSymbol}, {transition[4]})
    </li>
  {/each}
</ul>
