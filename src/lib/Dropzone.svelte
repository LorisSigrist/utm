<script lang="ts" module>
  export type DropzoneProps<Allow extends string> = {
    /** The list of allowed mime-types. If not specified, all mime-types are allowed */
    allow?: Allow[];

    /**
     * Handle a file drop
     * @param file The dropped file. Guaranteed to have an allowed mime-types
     */
    onFileDrop?: (file: File & { type: NoInfer<Allow> }) => void;
  };
</script>

<script lang="ts" generics="Allow extends string">
  let { allow: allowedMimeTypes, onFileDrop }: DropzoneProps<Allow> = $props();

  let hovering = $state(false);

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    hovering = true;
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    hovering = false;
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    hovering = false;

    if (!("dataTransfer" in e) || !(e.dataTransfer instanceof DataTransfer))
      return;

    const files = e.dataTransfer.files;
    if (files.length > 1) {
      alert("Only drop one file at a time");
      return;
    }

    const file = files[0];
    if (!file) return;

    if (allowedMimeTypes && !allowedMimeTypes.includes(file.type as any)) {
      alert("File type not allowed - Allowed: " + allowedMimeTypes.join(", "));
      return;
    }

    if(onFileDrop) {
      onFileDrop(file as any);
    }
  }
</script>

<svelte:window
  ondrop={onDrop}
  ondragover={onDragOver}
  ondragleave={onDragLeave}
/>

{#if hovering}
  <div class="fixed inset-0">
    <div class="absolute inset-0 bg-gray-900 opacity-50"></div>
    <div class="absolute inset-0 grid place-items-center">
      <p class="text-white text-2xl">Drop</p>
    </div>
  </div>
{/if}
