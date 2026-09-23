<script lang="ts">
  /** Live status card with a pastel waveform strip. */
  import { Download, Loader2, PartyPopper, Trash2, X } from 'lucide-svelte';
  import { cancelJob } from '../lib/api';
  import type { TrackedJob } from '../lib/state.svelte';
  import { say } from '../lib/state.svelte';

  let { job }: { job: TrackedJob } = $props();

  const pct = $derived(Math.min(100, Math.round(job.progress_pct)));

  function bytes(n: number): string {
    if (!n) return '-';
    if (n > 1 << 20) return `${(n / (1 << 20)).toFixed(2)} MB`;
    return `${Math.max(1, Math.round(n / 1024))} KB`;
  }

  const tone = $derived(
    job.status === 'completed'
      ? 'from-mint/25 to-babysky/25'
      : job.status === 'failed'
        ? 'from-peach/30 to-cotton/25'
        : 'from-lavender to-periwinkle/60',
  );

  function defaultQuip(entry: TrackedJob): string {
    if (entry.quip) return entry.quip;
    if (entry.status === 'queued') return say.queued();
    if (entry.status === 'processing') return say.baking();
    if (entry.status === 'completed') return say.done();
    return say.failed(entry.error || 'unknown');
  }
</script>

<article class="card bg-gradient-to-br {tone} p-4">
  <div class="flex items-start gap-3">
    <span class="grid size-11 shrink-0 place-items-center rounded-full bg-cream/80 text-lilac">
      {#if job.status === 'processing' || job.status === 'queued'}
        <Loader2 size="20" class="animate-spin" />
      {:else if job.status === 'completed'}
        <PartyPopper size="20" />
      {:else}
        <X size="20" />
      {/if}
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex items-baseline justify-between gap-2">
        <h3 class="truncate font-extrabold text-[#4a3557]">{job.nickname}</h3>
        <span class="shrink-0 text-xs font-bold text-[#8a6f9b]">{bytes(job.output_size)}</span>
      </div>

      <p class="mt-0.5 text-xs font-medium text-[#7c6290]">
        {job.source_format || 'unknown'} → {job.target_format}
      </p>

      <p class="mt-1.5 text-sm text-[#6b4a8a]">{job.quip || defaultQuip(job)}</p>

      {#if job.status === 'processing' || job.status === 'queued'}
        <div class="progress-track mt-2.5">
          <div class="progress-bar" style="width: {Math.max(4, pct)}%"></div>
        </div>
        <p class="mt-1 text-right text-[11px] font-bold text-[#9c85ab]">{pct}%</p>
      {/if}

      {#if job.peaks?.length}
        <!-- The Go service reduces PCM into buckets; this is just a drawing. -->
        <div class="mt-2 flex h-8 items-end gap-[2px]" aria-hidden="true">
          {#each job.peaks as peak, i (i)}
            <span
              class="flex-1 rounded-t-full bg-gradient-to-t from-babysky/70 to-bubblegum/80"
              style="height: {Math.max(6, Math.round(peak * 100))}%"
            ></span>
          {/each}
        </div>
      {/if}
    </div>

    <div class="flex shrink-0 flex-col gap-1.5">
      {#if job.status === 'completed'}
        <a
          class="icon-btn no-underline text-[#0c4a44]"
          href={job.download_url}
          download={job.nickname}
          aria-label="Save {job.nickname}"
          title="Save {job.nickname}"
        >
          <Download size="16" />
        </a>
      {:else if job.status === 'failed'}
        <button
          class="icon-btn"
          onclick={() => cancelJob(job.id)}
          aria-label="Discard {job.nickname}"
          title="Discard {job.nickname}"
        >
          <Trash2 size="16" />
        </button>
      {:else}
        <button
          class="icon-btn"
          onclick={() => cancelJob(job.id)}
          aria-label="Stop {job.nickname}"
          title="Stop {job.nickname}"
        >
          <X size="16" />
        </button>
      {/if}
    </div>
  </div>

  {#if job.error}
    <p class="mt-2 rounded-2xl bg-cream/70 px-3 py-2 text-xs text-[#a03a5f]">{job.error}</p>
  {/if}
</article>
