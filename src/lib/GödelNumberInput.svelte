<!--
    @component
    An Input field for a Gödel Number. Accepts either Binary or Decimal.
-->
<script lang="ts" module>
  export type GödelNumberInputProps = {
    value?: bigint;
    inputMode?: "binary" | "decimal";
  };

  /**
   * Validates that a string is a valid gödel number (binary)
   *
   * @param str The string to validate
   * @returns An error message if the string is invalid, null otherwise
   */
  function validateBinaryGödelNumber(str: string): string | null {
    if (str.length == 0) return "Please enter a binary number";
    if (!str.match(/^[01]+$/)) return "String should only contain 0s and 1s";
    return null;
  }

  /**
   * Validates that a string is a valid, gödel number (decimal)
   *
   * @param str The string to validate
   * @returns An error message if the string is invalid, null otherwise
   */
  function validateDecimalString(str: string): string | null {
    if (str.length == 0) return "Please enter a decimal number";
    if (!str.match(/^[0-9]+$/)) return "String should only contain numbers";
    return null;
  }
</script>

<script lang="ts">
  let {
    value = $bindable(0n),
    inputMode = $bindable("binary"),
  }: GödelNumberInputProps = $props();

  /**
   * The text-value of the input
   */
  let textValue = $state("");

  /**
   * The error message of the input
   * - null if the input is valid
   * - an error message if the input is invalid
   */
  let error: string | null = $derived(
    inputMode == "binary"
      ? validateBinaryGödelNumber(textValue)
      : validateDecimalString(textValue)
  );

  function maybeUpdateValue(
    textInput: string,
    inputMode: "binary" | "decimal",
    error: string | null
  ) {
    if (error == null) {
      const newValue =
        inputMode == "binary" ? BigInt("0b" + textInput) : BigInt(textInput);
      if (newValue != value) value = newValue;
    }
  }

  // update the text if the value changes for an external reason
  $effect(() => {
    console.log("value changed", value);
    textValue = inputMode == "binary" ? value.toString(2) : value.toString(10);
  });

  // update the value if the text is changed
  $effect(() => {
    maybeUpdateValue(textValue, inputMode, error);
  });

  
</script>

<div>
  <div
    class="group flex items-center"
    aria-orientation="horizontal"
    role="tablist"
  >
    <button
      id="tabs-1-tab-1"
      class="{inputMode == 'binary'
        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900'} 
        rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      aria-controls="tabs-1-panel-1"
      role="tab"
      type="button"
      onclick={() => (inputMode = "binary")}>Binary</button
    >

    <!-- Selected: "bg-gray-100 text-gray-900 hover:bg-gray-200", Not Selected: "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900" -->
    <button
      id="tabs-1-tab-2"
      class="{inputMode == 'decimal'
        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900'} 
        rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      aria-controls="tabs-1-panel-2"
      role="tab"
      onclick={() => (inputMode = "decimal")}
      type="button">Decimal</button
    >
  </div>
  <div class="mt-2">
    <div
      id="tabs-1-panel-1"
      class="-m-0.5 rounded-lg p-0.5"
      aria-labelledby="tabs-1-tab-1"
      role="tabpanel"
      tabindex="0"
    >
      <div>
        <label
          for="goedel-number"
          class="block text-sm font-medium text-gray-700">Gödel Number</label
        >

        <textarea
          rows="5"
          id="goedel-number"
          bind:value={textValue}
          class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          placeholder={inputMode == "binary"
            ? "1001101001..."
            : "7349101928734..."}
        ></textarea>
      </div>
    </div>
  </div>
</div>

{#if error}
  <p>{error}</p>
{/if}
