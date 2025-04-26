<script lang="ts">
  import { onMount } from "svelte";
  import {
    parseGödelNumberString,
    parseGödelNumberToTuringMachine,
  } from "./lib/goedel";
  import GödelNumberInput from "./lib/GödelNumberInput.svelte";
  import TuringMachineDiagram from "./lib/diagram/TuringMachineDiagram.svelte";
  import type { TuringMachineDefinition } from "./lib/types";
  import { executeTuringMachine, stringifyTape } from "./lib/utm";
  import { fade, fly } from "svelte/transition";

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

  let execution: undefined | ReturnType<typeof executeTuringMachine> =
    $state(undefined);
  let currentConfiguration: undefined | number = $state(undefined);

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

<main
  class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-6 md:pb-12"
>
  <section class="mx-auto max-w-3xl">
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

    <section class="mb-4">
      <GödelNumberInput bind:value={description_number} />
    </section>
  </section>

  {#if tm}
    {#key tm}
      <section
        class="w-full mx-auto max-w-6xl"
        in:fly|global={{ duration: 1500, opacity: 0, y: 200, delay: 200 }}
      >
        <TuringMachineDiagram {tm} highlighted_state={2} />
      </section>
    {/key}

    <section class="mx-auto max-w-3xl">
      <div class="pb-5">
        <h3 class="text-base font-semibold text-gray-900">Run</h3>
        <p class="mt-2 max-w-4xl text-sm text-gray-500">
          Or drop a file. The Input should be entered after <code>111</code>
        </p>
      </div>

      <button onclick={runTM}>Run TM</button>

      <pre>{output}</pre>
    </section>
  {/if}
</main>
