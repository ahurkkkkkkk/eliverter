<script lang="ts">
  /**
   * Background erasure control.
   *
   * Auto is the honest default: it samples the backdrop colour from the upload
   * itself, which matters because a "green" screen is really 0x007F00 once it has
   * round-tripped through YUV. Picking a colour is the escape hatch for when the
   * backdrop is not flat and the sampler refuses to guess.
   */
  import { Wand2, Pipette } from 'lucide-svelte';
  import { bubbleHover } from '../lib/audio';

  let {
    enabled = $bindable(false),
    mode = $bindable<'auto' | 'color'>('auto'),
    color = $bindable('#00ff00'),
    onpulse = () => {},
  }: {
    enabled?: boolean;
    mode?: 'auto' | 'color';
    color?: string;
    onpulse?: () => void;
  } = $props();

  const targets = ['webm', 'gif', 'webp', 'png', 'apng'];
</script>

<div class="mt-3 flex flex-wrap items-center gap-2">
  <button
    type="button"
    class="pill flex items-center gap-1.5 transition-colors {enabled
      ? 'bg-mint/60 text-[#0c4a44]'
      : 'bg-cream/80 text-[#6b4a8a]'}"
    aria-pressed={enabled}
    onclick={() => {
      enabled = !enabled;
      onpulse();
    }}
    onmouseenter={bubbleHover}
    title="key the background out and keep transparency"
  >
    <Wand2 size="14" />
    <span>pop the background out</span>
  </button>

  {#if enabled}
    <div
      class="flex w-full flex-wrap items-center gap-2 rounded-2xl bg-lavender/40 px-3 py-2"
    >
      <div class="flex items-center gap-1" role="group" aria-label="how to find the background">
        <button
          type="button"
          class="pill text-xs {mode === 'auto' ? 'bg-bubblegum/70 text-white' : 'bg-cream/70 text-[#6b4a8a]'}"
          aria-pressed={mode === 'auto'}
          onclick={() => (mode = 'auto')}
        >
          find it for me
        </button>
        <button
          type="button"
          class="pill flex items-center gap-1 text-xs {mode === 'color'
            ? 'bg-bubblegum/70 text-white'
            : 'bg-cream/70 text-[#6b4a8a]'}"
          aria-pressed={mode === 'color'}
          onclick={() => (mode = 'color')}
        >
          <Pipette size="12" />
          <span>this colour</span>
        </button>
      </div>

      {#if mode === 'color'}
        <label class="flex items-center gap-2 text-xs font-bold text-[#6b4a8a]">
          <span class="sr-only">background colour to remove</span>
          <input
            type="color"
            bind:value={color}
            class="h-7 w-10 cursor-pointer rounded-md border-0 bg-transparent p-0"
          />
          <span class="font-mono normal-case">{color}</span>
        </label>
      {:else}
        <p class="text-xs text-[#7c6290]">
          reads the edge of your file, so it wants a fairly flat backdrop
        </p>
      {/if}
    </div>

    <p class="w-full text-[11px] text-[#9c85ab]">
      transparency survives in {targets.join(', ')}, so pick one of those to turn this on
    </p>
  {/if}
</div>
