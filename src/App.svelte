<script lang="ts">
  import { onMount } from "svelte";
  import {
    parseGödelNumberString,
    parseGödelNumberToTuringMachine,
  } from "./lib/goedel";
  import GödelNumberInput from "./lib/GödelNumberInput.svelte";
  import TuringMachineDiagram from "./lib/TuringMachineDiagram.svelte";
  import type { TuringMachineDefinition } from "./lib/types";
  import { executeTuringMachine, stringifyTape } from "./lib/utm";

  let description_number: bigint | null = $state(null);

  onMount(() => {
    // get the "goedel" parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const goedel = urlParams.get("goedel");
    if (!goedel) return;

    const parseResult = parseGödelNumberString(goedel, 16);
    if (parseResult.success) description_number = parseResult.result.goedel;
  });

  let tm: TuringMachineDefinition | null = $derived(
    description_number == null
      ? null
      : parseGödelNumberToTuringMachine(description_number).result!
  );

  $effect(() => {
    if (tm) {
      window.history.replaceState(
        null,
        "",
        `?goedel=${tm.goedel.toString(16)}`
      );
    }
  });

  let output = $state("");
  function runTM() {
    if (!tm) return;

    output = "";

    const iterator = executeTuringMachine(tm);
    requestAnimationFrame(function next() {
      const iter = iterator.next();
      output += stringifyTape(iter.value) + "\n";
      if (iter.done) return;
      requestAnimationFrame(next);
    });
  }
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
  <main class="mx-auto max-w-3xl py-8 md:py-24 pb-6 md:pb-12">
    <h1 class="text-2xl md:text-4xl font-bold mb-6 md:mb-10">
      Universal Turing Machine Simulator
    </h1>

    <div class="pb-5">
      <h3 class="text-base font-semibold text-gray-900">
        Enter a Gödel Number
      </h3>
      <p class="mt-2 max-w-4xl text-sm text-gray-500">
        Or drop a file. The Input should be entered after <code>111</code>
      </p>
    </div>

    <section class="mb-8">
      <GödelNumberInput bind:value={description_number} />
    </section>

    {#if tm}
      <TuringMachineDiagram {tm} />

      <button onclick={runTM}>Run TM</button>

      <pre>{output}</pre>
    {/if}
  </main>
</div>
