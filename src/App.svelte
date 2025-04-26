<script lang="ts">
  import { onMount } from "svelte";
  import {
    parseGödelNumberString,
    parseGödelNumberToTuringMachine,
  } from "./lib/goedel";
  import GödelNumberInput from "./lib/GödelNumberInput.svelte";
  import TuringMachineDiagram from "./lib/diagram/TuringMachineDiagram.svelte";
  import type {
    TuringMachineDefinition,
  } from "./lib/types";
  import { getInitialConfiguration, getNextConfiguration } from "./lib/utm";
  import {  fly } from "svelte/transition";
  import Tape from "./lib/Tape.svelte";

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

  let configuration = $derived(tm == null ? null : getInitialConfiguration(tm));

  $effect(() => {
    if (tm) {
      window.history.replaceState(
        null,
        "",
        `?goedel=${tm.goedel.toString(16)}`
      );
    }
  });

  function takeStep() {
    if (!configuration || configuration.finished) return;
    configuration = getNextConfiguration(configuration);
  }

  function runToCompletion() {
    if (!configuration || configuration.finished) return;

    for(let i = 0; i < 1_000_000; i++) {
      configuration = getNextConfiguration(configuration);
      if (configuration.finished) return;
    }

    alert("Machine timed out after 1,000,000 steps");
  }

  function reset() {
    if(!tm) return;
    configuration = getInitialConfiguration(tm);
  }
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-6 md:pb-12">
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
</div>

{#if tm}
  <div
    class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
  >
    {#key tm.goedel}
      <section class="w-full mx-auto max-w-6xl"
        in:fly|global={{ duration: 1500, opacity: 0, y: 200, delay: 200 }}
      >
        <TuringMachineDiagram
          {tm}
          highlighted_state={configuration
            ? configuration.current_state
            : undefined}
        />
      </section>
    {/key}
  </div>

  <div
    class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
  >
    <section class="mx-auto max-w-3xl">
      <div class="pb-5">
        <h3 class="text-base font-semibold text-gray-900">Run</h3>
        <p class="mt-2 max-w-4xl text-sm text-gray-500">
          Or drop a file. The Input should be entered after <code>111</code>
        </p>
      </div>

      <button
        type="button"
        class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        onclick={reset}
        >Reset</button
      >

      <button
        type="button"
        class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
        onclick={runToCompletion}
        >Run To Completion</button
      >

      <button
        type="button"
        class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onclick={takeStep}
        disabled={!configuration || configuration.finished}
        >Take Step →
      </button>

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-12">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
      </svg>

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-12">
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
      </svg>
      
      
    </section>
  </div>

  {#if configuration}
    <Tape configuration={configuration} />
  {/if}
{/if}
