<script lang="ts" module>
  import { onMount } from "svelte";
  import Tape from "./Tape.svelte";
  import type { TuringMachineConfiguration } from "./types";
  import { getInitialConfiguration, getNextConfiguration, stringifyTape } from "./utm";

  import PlayIcon from "~icons/heroicons/play-16-solid";
  import PauseIcon from "~icons/heroicons/pause-16-solid";
  import ResetIcon from "~icons/heroicons/arrow-uturn-left-16-solid";
  import ArrowRight from "~icons/heroicons/arrow-right-16-solid";
  import ArrowRightCircle from "~icons/heroicons/arrow-right-circle";
  import { scale } from "svelte/transition";

  export type PlayerProps = {
    configuration: TuringMachineConfiguration;
  };
</script>

<script lang="ts">
  let { configuration = $bindable() }: PlayerProps = $props();

  let tape: Tape | undefined = $state(undefined);
  let playing = $state(false);
  let speed = $state(2);

  function takeStep() {
    if (!configuration || configuration.finished) return;
    configuration = getNextConfiguration(configuration);
    console.log(stringifyTape(configuration));
    if (tape) tape.scrollToPosition(configuration.current_position);

    if (configuration.finished) stop();
  }

  function runToCompletion() {
    if (!configuration || configuration.finished) return;
    stop(); // stop animation

    const TIMEOUT = 5_000_000;

    let cfg = structuredClone(
      $state.snapshot(configuration)
    ) as any as TuringMachineConfiguration;

    for (let i = 0; i < TIMEOUT; i++) {
       cfg = getNextConfiguration(cfg);
      if (cfg.finished) {
        configuration = cfg;
        console.log(stringifyTape(configuration));
        if (tape) tape.scrollToPosition(cfg.current_position);
        return;
      }
    }

    configuration = cfg;

    const formattedTimout = new Intl.NumberFormat("en-US", {
      notation: "standard",
    }).format(TIMEOUT);

    alert(`Paused Execution after ${formattedTimout} steps`);
    if (tape) tape.scrollToPosition(configuration.current_position);
  }

  function reset() {
    playing = false;
    if (interval) clearInterval(interval);
    configuration = getInitialConfiguration(configuration.tm);
    console.log(stringifyTape(configuration));
    if (tape) tape.scrollToPosition(configuration.current_position);
  }

  let interval: number | null = null;

  function play() {
    playing = true;
    if (interval) clearInterval(interval);

    // reset if the machine is already finished
    if (configuration.finished) {
      configuration = getInitialConfiguration(configuration.tm);
    }

    takeStep();
    interval = setInterval(takeStep, 1000 / speed);
  }

  function stop() {
    playing = false;
    if (interval) clearInterval(interval);
  }

  onMount(() => {
    reset();
    return () => {
      if (interval) clearInterval(interval);
    };
  });

  function onSpeedChange() {
    if (!playing) return;

    if (interval) clearInterval(interval);
    interval = setInterval(takeStep, 1000 / speed);
  }

  function handleKeydown(e: KeyboardEvent) {
    // only handle events if nothing is focused (or a button is focussed)
    if (
      document.activeElement &&
      document.activeElement !== document.body &&
      !(document.activeElement instanceof HTMLButtonElement)
    )
      return;

    // on right-arrow: take step
    // or run to completion if ctrl/cmd is pressed
    if (e.key === "ArrowRight") {
      if (e.ctrlKey || e.metaKey) runToCompletion();
      else takeStep();
      e.preventDefault();
    }

    // on space & no input is focused -> play/pause
    if (e.key === " ") {
      if(document.activeElement instanceof HTMLButtonElement) return; // avoid conflicts
      playing ? stop() : play();
      e.preventDefault();
    }

    // on cmd/ctrl + LeftArrow -> reset
    if (e.key === "ArrowLeft" && (e.ctrlKey || e.metaKey)) {
      reset();
      e.preventDefault();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
  <section class="mx-auto max-w-3xl">
    <!-- Controls -->
    <div class="w-full flex flex-row items-center justify-between">
      <div class="flex-1/3 flex flex-row justify-start">
        <span class="text-gray-700 gap-4 items-center w-20">
          Step {configuration.steps}
        </span>
      </div>

      <!-- Center -->
      <div class="flex-1/3 flex flex-row gap-6 justify-center">
        <button
          onclick={reset}
          title="Reset"
          class="text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
          disabled={configuration.steps === 0}
        >
          <ResetIcon class="size-6" />
        </button>
        <button
          onclick={playing ? stop : play}
          title={playing ? "Pause" : "Play"}
          class="size-12 relative"
        >
          {#if playing}
            <div
              class="absolute inset-0"
              transition:scale={{ duration: 100, start: 0.4, opacity: 0 }}
            >
              <PauseIcon class="size-12 text-gray-700" />
            </div>
          {:else}
            <div
              class="absolute inset-0"
              transition:scale={{ duration: 100, start: 0.4, opacity: 0 }}
            >
              <PlayIcon class="size-12 text-gray-700" />
            </div>
          {/if}
        </button>
        <button
          class="text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
          onclick={takeStep}
          disabled={configuration.finished}
          title="Take a single step"
        >
          <ArrowRight class="size-6" />
        </button>
      </div>

      <!-- Right -->
      <div class="flex-1/3 flex flex-row justify-end">
        <button
          type="button"
          class="
          rounded-md
          hover:bg-gray-100
          px-2.5 py-1.5 text-sm font-semibold text-gray-600 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed flex flex-row gap-2 items-center"
          onclick={runToCompletion}
          disabled={configuration.finished}
        >
          <span>Run to Completion</span>
          <ArrowRightCircle class="inline size-6" />
        </button>
      </div>
    </div>
  </section>
</div>

<div class="pb-12">
  <Tape bind:this={tape} {configuration} {speed} />
</div>
