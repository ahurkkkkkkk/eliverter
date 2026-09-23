<script lang="ts">
  /** Jelly dropzone: bobs idle, squashes on drag-over, wobbles on drop. */
  import { CloudSun, Sparkles } from 'lucide-svelte';
  import { bubbleHover, filePlop, unlock } from '../lib/audio';

  let {
    onfiles,
  }: { onfiles: (files: File[]) => void } = $props();

  let over = $state(false);
  let justDropped = $state(false);
  let input: HTMLInputElement | undefined = $state();

  function take(list: FileList | null): void {
    if (!list?.length) return;
    onfiles([...list]);
  }

  function onDrop(event: DragEvent): void {
    event.preventDefault();
    over = false;
    justDropped = true;
    unlock();
    filePlop();
    take(event.dataTransfer?.files ?? null);
    setTimeout(() => (justDropped = false), 640);
  }

  function onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!over) {
      over = true;
      bubbleHover();
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  aria-label="Choose a media file to convert"
  data-over={over}
  data-dropped={justDropped}
  class="dropzone relative flex flex-col items-center justify-center gap-3 px-6 py-14 text-center cursor-pointer select-none"
  ondragover={onDragOver}
  ondragleave={() => (over = false)}
  ondrop={onDrop}
  onclick={() => (unlock(), input?.click())}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input?.click();
    }
  }}
  onmouseenter={bubbleHover}
>
  <div class="relative">
    <div
      class="grid place-items-center size-20 rounded-full bg-gradient-to-br from-cotton/40 to-babysky/40 text-bubblegum"
      style="box-shadow: var(--shadow-rest);"
    >
      {#if over}
        <Sparkles size="34" strokeWidth={2.2} />
      {:else}
        <CloudSun size="32" strokeWidth={2.1} />
      {/if}
    </div>
    {#if justDropped}
      <span
        class="absolute inset-0 rounded-full border-4 border-bubblegum/60 animate-ripple"
      ></span>
    {/if}
  </div>

  <p class="text-xl font-extrabold text-[#5b3a6b]">
    {over ? 'Yes yes yes — let it go!' : 'Toss your file in here ♡'}
  </p>
  <p class="max-w-sm text-sm text-[#8a6f9b]">
    Video, audio, GIF, PNG or one of those mysterious retro files from an old
    game. I know a surprising number of formats.
  </p>
  <span class="pill mt-1">tap to choose instead</span>

  <input
    bind:this={input}
    type="file"
    class="hidden"
    multiple
    accept="video/*,audio/*,image/*,.bik,.smk,.mve,.vqa,.cin,.cmv,.anm,.nut,.ogm,.rm,.rmvb,.wtv,.mxf,.gxf,.dv,.jxl,.avif,.heic,.exr,.dpx,.fits,.ras,.3gp,.3g2,.mts,.m2ts,.vob,.f4v,.mpc,.vqf,.ape,.wv,.tta,.tak,.shn,.s3m,.it,.mod,.xm"
    onchange={(e) => take(e.currentTarget.files)}
  />
</div>
