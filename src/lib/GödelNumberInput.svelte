<!--
    @component
    An Input field for a Gödel Number. Accepts either Binary or Decimal.
-->
<script lang="ts" module>
  export type GödelNumberInputProps = {
    /**
     * A valid gödel number, including the initial tape.
     * null otherwise
     */
    value: bigint | null;
    /**
     * If the input should be a binary or decimal number
     */
    inputMode?: "binary" | "decimal";
  };

  /**
   * A regex for the binary representation of a Gödel number, including the input
   */
  const GODEL_NUMBER_REGEX = /^1(0+10+10+10+10+11)*(0+10+10+10+10+)111(0|1)*$/;

  /**
   * A regex for the binary representation of a Gödel number, excluding the input.
   * Used to detect if the input is valid, but missing the input
   */
  const GODEL_NUMBER_REGEX_WITHOUT_INPUT =
    /^1(0+10+10+10+10+11)*(0+10+10+10+10+)$/;

  /**
   * Validates that a string is a valid gödel number (binary)
   *
   * @param str The string to validate
   * @returns An error message if the string is invalid, null otherwise
   */
  function validateBinaryGödelNumber(str: string): string | null {
    if (str.length == 0) return "Please enter a binary number";
    if (!str.match(/^[01]+$/)) return "Input should only contain 0s and 1s";

    const valid_goedel_number = str.match(GODEL_NUMBER_REGEX);
    const valid_goedel_number_without_input = str.match(
      GODEL_NUMBER_REGEX_WITHOUT_INPUT
    );

    if (!valid_goedel_number && !valid_goedel_number_without_input)
      return "Not a valid Gödel number";
    if (!valid_goedel_number && valid_goedel_number_without_input)
      return "Input is missing. Add it after the delimiter 111";

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
    if (!str.match(/^[0-9]+$/)) return "Input should only contain digits 0-9";

    const binary = BigInt(str).toString(2);
    const valid_goedel_number = binary.match(GODEL_NUMBER_REGEX);
    const valid_goedel_number_without_input = binary.match(
      GODEL_NUMBER_REGEX_WITHOUT_INPUT
    );

    if (!valid_goedel_number && !valid_goedel_number_without_input)
      return "Not a valid Gödel number";
    if (!valid_goedel_number && valid_goedel_number_without_input)
      return "Valid gödel number, but the input is missing";

    return null;
  }

</script>

<script lang="ts">
  let {
    value = $bindable(null),
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

  let touched = $state(false);
  let showError = $derived(error != null && touched);

  /**
   * Updates the `value` prop if the textInput is a valid gödel number
   *
   * @param textInput
   * @param inputMode
   * @param error
   */
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
    if (value == null) textValue = "";
    else
      textValue =
        inputMode == "binary" ? value.toString(2) : value.toString(10);
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
        <textarea
          rows="5"
          id="goedel-number"
          bind:value={textValue}
          onblur={() => (touched = true)}
          class="block w-full rounded-md bg-white px-3 py-1.5
          {showError
            ? 'text-red-900 outline-red-300 placeholder:text-red-300 focus:outline-red-600'
            : 'text-gray-900 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600'} 
            text-base outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
          placeholder={inputMode == "binary"
            ? "1001101001..."
            : "7349101928734..."}
        ></textarea>
      </div>
    </div>
  </div>
</div>

{#if showError}
  <p class="mt-2 text-sm text-red-600">{error}</p>
{/if}
