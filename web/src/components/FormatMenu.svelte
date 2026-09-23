<script lang="ts">
  /** Popping-bubble format selector: inflates from the trigger, pills ripple in. */
  import { Check, ChevronDown, Layers } from 'lucide-svelte';
  import { bubbleHover, formatPop, unlock } from '../lib/audio';

  export interface Option {
    key: string;
    label: string;
    hint?: string;
  }

  let {
    options,
    value = 'webm',
    onchange,
    label = 'turn it into',
    open = $bindable(false),
  }: {
    options: Option[];
    value?: string;
    onchange: (key: string) => void;
    label?: string;
    open?: boolean;
  } = $props();

  // The parent card owns the stacking order, so it has to know the bubble is
  // out: .card sets backdrop-filter, which makes every sibling card its own
  // stacking context, and a later sibling paints over this z-30 unless the
  // section holding it is lifted too.
  let root: HTMLDivElement | undefined = $state();
  let trigger: HTMLButtonElement | undefined = $state();
  let drop = $state<'down' | 'up'>('down');
  let maxHeight = $state('20rem');

  let chosen = $state<string | null>(null);
  // A local override is kept separately rather than snapshotting a prop into
  // state, which would go stale on the next parent render.
  let current = $derived(chosen ?? value);

  let selected = $derived(
    options.find((o) => o.key === current) ?? { key: current, label: current.toUpperCase() },
  );

  /** Fit the bubble in the space that is actually left on screen. */
  function measure(): void {
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    // The floating status line is z-40 like this card, and later in the DOM, so
    // the bubble has to stop above it rather than trade pixels with it.
    const bar = document.querySelector<HTMLElement>('[aria-live="polite"]')?.offsetHeight ?? 0;
    const below = innerHeight - r.bottom - 20 - bar;
    const above = r.top - 20;
    drop = below < 160 && above > below ? 'up' : 'down';
    const room = drop === 'up' ? above : below;
    maxHeight = `${Math.round(Math.min(320, Math.max(160, room)))}px`;
  }

  function toggle(): void {
    unlock();
    open = !open;
    if (open) formatPop();
  }

  function choose(key: string): void {
    chosen = key;
    open = false;
    formatPop();
    onchange(key);
  }

  function onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') open = false;
    if (event.key === 'ArrowDown' && !open) {
      event.preventDefault();
      open = true;
    }
  }

  $effect(() => {
    if (open) measure();
  });

  $effect(() => {
    if (!open) return;
    const away = (e: PointerEvent): void => {
      if (root && !root.contains(e.target as Node)) open = false;
    };
    addEventListener('pointerdown', away);
    return () => removeEventListener('pointerdown', away);
  });
</script>

<div bind:this={root} class="relative">
  <span class="block mb-1 text-xs font-bold uppercase tracking-wider text-[#a98fb8]">
    {label}
  </span>

  <button
    type="button"
    bind:this={trigger}
    class="btn flex items-center gap-2 min-w-52 justify-between"
    aria-haspopup="true"
    aria-expanded={open}
    onclick={toggle}
    onkeydown={onKey}
    onmouseenter={bubbleHover}
  >
    <span class="flex items-center gap-2 truncate">
      <Layers size="18" strokeWidth={2.4} />
      {selected.label}
    </span>
    <ChevronDown
      size="18"
      strokeWidth={2.6}
      class="transition-transform duration-300 [transition-timing-function:var(--ease-jelly)] {open ? 'rotate-180' : ''}"
    />
  </button>

  {#if open}
    <ul
      aria-label={label}
      class="card absolute z-30 w-full min-w-64 overflow-y-auto p-2 list-none {drop === 'up'
        ? 'bottom-full mb-2'
        : 'mt-2'}"
      style="transform-origin: {drop === 'up' ? 'bottom' : 'top'} center; max-height: {maxHeight};"
    >
      {#each options as option, i (option.key)}
        <li class="stagger" style="--i: {i}">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-[background,transform] duration-200 hover:bg-lavender active:scale-[0.97]"
            aria-current={option.key === current ? 'true' : undefined}
            onclick={() => choose(option.key)}
            onmouseenter={bubbleHover}
          >
            <span class="min-w-0">
              <span class="block truncate font-bold text-[#5b3a6b]">{option.label}</span>
              {#if option.hint}
                <span class="block truncate text-xs text-[#9c85ab]">{option.hint}</span>
              {/if}
            </span>
            {#if option.key === current}
              <span class="grid size-7 shrink-0 place-items-center rounded-full bg-mint/30 text-[#0c4a44]">
                <Check size="16" strokeWidth={3} />
              </span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
