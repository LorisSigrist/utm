<script lang="ts">
  import GödelNumberInput from "./lib/GödelNumberInput.svelte";
  import TuringMachineDiagram from "./lib/TuringMachineDiagram.svelte";

  let description_number: bigint | null = $state(null);
  $effect(() => console.log(description_number));
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
  <main class="mx-auto max-w-3xl">
    <h1 class="text-2xl md:text-4xl font-bold mt-8 mb-6 md:mt-24 md:mb-10">
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

    <section>
      <TuringMachineDiagram />
    </section>
  </main>
</div>
