<script lang="ts">
  import { onMount } from "svelte";
  import {
    massageBinaryInput,
    parseGödelNumberString,
    parseGödelNumberToTuringMachine,
  } from "./lib/goedel";
  import GödelNumberInput from "./lib/GödelNumberInput.svelte";
  import TuringMachineDiagram from "./lib/diagram/TuringMachineDiagram.svelte";
  import type { TuringMachineDefinition } from "./lib/types";
  import { getInitialConfiguration } from "./lib/utm";
  import { fly } from "svelte/transition";
  import Footer from "./lib/Footer.svelte";
  import Player from "./lib/Player.svelte";
  import Dropzone from "./lib/Dropzone.svelte";
  import * as Flaci from "./lib/flaci";

  import QuestionMarkCircle from "~icons/heroicons/question-mark-circle";

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
      window.history.pushState(null, "", `?goedel=${tm.goedel.toString(16)}`);
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("goedel");
      window.history.pushState(null, "", url.href);
    }
  });

  function handleTextFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const textContent = reader.result;
      if (typeof textContent !== "string") {
        alert("Could not read text file");
        return;
      }

      // Massage the input so it's more likely to be accepted
      const content = massageBinaryInput(textContent);
      const result = parseGödelNumberString(content, 2);

      if (result.success) {
        description_number = result.result.goedel;
      } else {
        alert(result.error);
      }
    };

    reader.readAsText(file);
  }

  function handleJSONFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const textContent = reader.result;
      if (typeof textContent !== "string") {
        alert("Could not read JSON file");
        return;
      }

      let object: unknown;

      try {
        object = JSON.parse(textContent);
      } catch (e) {
        console.error(e);
        alert("Could not parse JSON file");
        return;
      }

      const isFlaci = Flaci.isValidFlaciTM(object);
      if(!isFlaci) {
        alert("JSON file does not contain a valid Flaci Turing Machine definition");
        return;
      } else{
        description_number = Flaci.generateGodelNumber(object as any);
      }
    };

    reader.readAsText(file);
  }
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-6 md:pb-12">
  <section class="mx-auto max-w-3xl">
    <h1 class="text-2xl md:text-4xl font-bold mb-6 md:mb-10">
      Universal Turing Machine Simulator
    </h1>

    <div class="pb-5">
      <h3 class="text-base font-semibold text-gray-900">
        Enter a Description Number

        <a 
          href="https://en.wikipedia.org/wiki/Description_number" 
          class="text-sm text-indigo-600"
          title="Learn more about description numbers"
        >
          <QuestionMarkCircle class="inline" />
        </a>

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

{#if configuration}
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
    {#key configuration.tm.goedel_without_input}
      <section
        class="w-full mx-auto max-w-6xl h-140"
        in:fly|global={{ duration: 1500, opacity: 0, y: 200, delay: 200 }}
      >
        <TuringMachineDiagram
          tm={configuration.tm}
          highlighted_state={configuration
            ? configuration.current_state
            : undefined}
        />
      </section>
    {/key}
  </div>

  <Player bind:configuration />

  <Footer />
{/if}

<Dropzone
  allow={["text/plain", "application/json"]}
  onFileDrop={(file) => {
    if (file.type === "text/plain") handleTextFile(file);
    else handleJSONFile(file);
  }}
/>
