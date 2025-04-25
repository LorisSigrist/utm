<script lang="ts">
  import GödelNumberInput from "./lib/GödelNumberInput.svelte";

  let description_number : bigint = BigInt(0);
</script>

<main class="max-w-xl mx-auto px-4">
  <h1>Universal Turing Machine</h1>

   <GödelNumberInput bind:value={description_number} />

   <pre>
    {description_number}
   </pre>

   <button onclick={()=> description_number++}>Increment</button>
</main>
