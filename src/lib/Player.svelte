<script lang="ts" module>
  import { onMount } from "svelte";
  import Tape from "./Tape.svelte";
  import type { TuringMachineConfiguration } from "./types";
  import { getInitialConfiguration, getNextConfiguration } from "./utm";
  export type PlayerProps = {
    configuration: TuringMachineConfiguration;

    /** Whether the player is currently playing */
    playing?: boolean;

    /** How many Steps-per-second */
    speed?: number;
  };
</script>

<script lang="ts">
  let {
    configuration = $bindable(),
    playing = $bindable(false),
    speed = $bindable(1),
  }: PlayerProps = $props();

  let tape: Tape | undefined = $state(undefined);

  function takeStep() {
    if (!configuration || configuration.finished) return;
    configuration = getNextConfiguration(configuration);

    if (tape) tape.scrollToPosition(configuration.current_position);
  }

  function runToCompletion() {
    if (!configuration || configuration.finished) return;
    playing = false;

    const TIMEOUT = 500_000;

    for (let i = 0; i < TIMEOUT; i++) {
      configuration = getNextConfiguration(configuration);
      if (configuration.finished) {
        if (tape) tape.scrollToPosition(configuration.current_position);
        return;
      }
    }

    alert(`Machine timed out after ${TIMEOUT} steps`);
  }

  function reset() {
    playing = false;
    configuration = getInitialConfiguration(configuration.tm);

    if (tape) tape.scrollToPosition(configuration.current_position);
  }

  let interval: number | null = null;

  function play() {
    playing = true;

    interval = setInterval(takeStep, 1000 / speed);
  }

  function stop() {
    playing = false;
    if (interval) clearInterval(interval);
  }

  onMount(() => {
    console.log(tape);
    if (tape) tape.scrollToPosition(configuration.current_position);

    return () => {
      if (interval) clearInterval(interval);
    };
  });
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <section class="mx-auto max-w-3xl">


    <!-- Controls -->
    <div class="w-full flex flex-row items-center justify-between">
      <div class="flex-1/3">
        <button>Take Step</button>
      </div>

      <!-- Center -->
      <div class="flex-1/3 flex flex-row gap-4 justify-center">
        <button>Reset</button>
        <button>Play/Pause</button>
        <button>Take Step</button>
      </div>

      <!-- Right -->
      <div class="flex-1/3 flex flex-row justify-end">
        <button>Run to Completion</button>
      </div>
    </div>

    <button
      type="button"
      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
      onclick={reset}>Reset</button
    >

    <button
      type="button"
      class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
      onclick={runToCompletion}>Run To Completion</button
    >

    <button
      type="button"
      class="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      onclick={takeStep}
      disabled={!configuration || configuration.finished}
      >Take Step →
    </button>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="size-12"
      onclick={play}
    >
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
        clipRule="evenodd"
      />
    </svg>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="size-12"
      onclick={stop}
    >
      <path
        fillRule="evenodd"
        d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
        clipRule="evenodd"
      />
    </svg>
  </section>
</div>

<Tape bind:this={tape} {configuration} />
