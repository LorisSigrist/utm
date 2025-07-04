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

    /**
     * Handle file upload
     */
    onFileUpload?: (file: File) => void;
  };
</script>

<script lang="ts">
  import { massageBinaryInput, parseGödelNumberString } from "./goedel";
  import LoadExampleDropdown from "./LoadExampleDropdown.svelte";
  import UploadIcon from "~icons/heroicons/arrow-up-tray-solid";
  import DownloadIcon from "~icons/heroicons/arrow-down-tray-solid";
  import { goedelToFlaci } from "./flaci";

  let {
    value = $bindable(null),
    inputMode = $bindable("binary"),
    onFileUpload
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
  let error: string | null = $derived.by(() => {
    const result = parseGödelNumberString(
      textValue,
      inputMode == "binary" ? 2 : 10
    );
    return result.success ? null : result.error;
  });

  let touched = $state(value !== null);
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
    if (textInput.length == 0) value = null;
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

  function onPaste(event: ClipboardEvent) {
    const input = event.target;
    if (!(input instanceof HTMLTextAreaElement)) return;

    const pasted = event.clipboardData?.getData("text") ?? "";
    if (inputMode != "binary") return;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? textValue.length;

    const newValue = textValue.slice(0, start) + pasted + textValue.slice(end);
    const massagedText = massageBinaryInput(newValue);
    textValue = massagedText;
    event.preventDefault();
  }


  function startFileUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "text/plain, application/json";
    input.onchange = () => {
      if (input.files == null) return;
      const file = input.files[0];
      if(onFileUpload) onFileUpload(file);
    };
    input.click();
  }

  function downloadGoedelAsFlaciFile() {
    if(!value) {alert("Enter a valid value to download"); return}
    const flaci = goedelToFlaci(value);

    const json = JSON.stringify(flaci);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flaci.json";
    link.click();

    URL.revokeObjectURL(url);
    link.remove();
  }
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

    <div class="ml-auto items-center space-x-5 flex">
      <button
        type="button"
        class="size-6 not-first:flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-hidden"
        id="menu-button"
        aria-expanded="true"
        aria-haspopup="true"
        onclick={startFileUpload}
      >
        <span class="sr-only">Open file</span>
        <UploadIcon class="size-6" />
      </button>

      <button
      type="button"
      class="size-6 not-first:flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 focus:outline-hidden"
      id="menu-button"
      aria-expanded="true"
      aria-haspopup="true"
      disabled={!value}
      onclick={downloadGoedelAsFlaciFile}
    >
      <span class="sr-only">Open file</span>
      <DownloadIcon class="size-6" />
    </button>

      <LoadExampleDropdown onselect={(selected) => (value = selected)} />
    </div>
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
          onpaste={onPaste}
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
