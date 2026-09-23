<script lang="ts">
  import { Heart, Sparkle, Volume2, VolumeX } from 'lucide-svelte';
  import BackgroundToggle from './components/BackgroundToggle.svelte';
  import Dropzone from './components/Dropzone.svelte';
  import FormatMenu, { type Option } from './components/FormatMenu.svelte';
  import JobCard from './components/JobCard.svelte';
  import Sparkles from './components/Sparkles.svelte';
  import { probe } from './lib/api';
  import { app, MASCOT, say } from './lib/state.svelte';
  import { isMuted, setMuted, unlock } from './lib/audio';

  const formats: Option[] = [
    { key: 'mp4', label: 'MP4', hint: 'H.264 · plays anywhere' },
    { key: 'webm', label: 'WebM', hint: 'VP9 · tiny and transparent' },
    { key: 'mkv', label: 'Matroska', hint: 'everything in one tin' },
    { key: 'mov', label: 'QuickTime', hint: 'ProRes friendly' },
    { key: 'gif', label: 'GIF', hint: 'looping, palette-quantised' },
    { key: 'webp', label: 'WebP', hint: 'sticker-grade still or animated' },
    { key: 'png', label: 'PNG', hint: 'lossless with alpha' },
    { key: 'avif', label: 'AVIF', hint: 'newest image format' },
    { key: 'mp3', label: 'MP3', hint: 'LAME VBR' },
    { key: 'm4a', label: 'M4A / AAC', hint: 'clean and small' },
    { key: 'opus', label: 'Opus in Ogg', hint: 'best quality per byte' },
    { key: 'flac', label: 'FLAC', hint: 'lossless audio' },
    { key: 'wav', label: 'WAV', hint: 'raw PCM, no thinking required' },
  ];

  let target = $state('webm');
  let staged = $state<File[]>([]);
  let rejected = $state<string[]>([]);
  let muted = $state(isMuted());
  let erasing = $state(false);
  let eraseMode = $state<'auto' | 'color'>('auto');
  let keyColor = $state('#00ff00');

  // Only the alpha-capable targets can keep an erased background, so the option
  // is dropped rather than sent and silently ignored by the server.
  const ALPHA = new Set(['webm', 'gif', 'webp', 'png', 'apng']);
  const canErase = $derived(ALPHA.has(target));
  const options = $derived(
    erasing && canErase
      ? {
          erase_background: true,
          erase_mode: eraseMode,
          ...(eraseMode === 'color' ? { key_color: keyColor } : {}),
        }
      : {},
  );

  // No teardown: `app` is a page-lifetime singleton and the WebSocket it opens is
  // the only thing carrying job progress. Closing it on unmount would leave a
  // remount permanently stuck showing "queued".
  $effect(() => {
    void app.hydrate();
  });

  async function onFiles(files: File[]): Promise<void> {
    unlock();
    rejected = [];
    app.lastInfo = null;
    const usable: File[] = [];

    for (const file of files) {
      try {
        const { info } = await probe(file);
        app.lastInfo = info;
        usable.push(file);
      } catch (err) {
        // A file that cannot be probed can never be converted, so it must not
        // sit in the waiting list inviting the user to retry the same failure.
        const reason = err instanceof Error ? err.message : String(err);
        rejected = [...rejected, `${file.name} — ${reason}`];
      }
    }

    staged = usable;
    if (usable.length === 0) {
      app.statusLine = say.failed(rejected[0] ?? 'nothing readable was chosen');
      return;
    }
    if (usable.length === 1) void app.submit(usable[0], target, options);
  }

  function convertAll(): void {
    for (const file of staged) void app.submit(file, target, options);
  }

  function makePack(packId: string): void {
    for (const file of staged) void app.submitPack(file, packId, options);
  }

  function toggleMute(): void {
    muted = !muted;
    setMuted(muted);
    app.mutesAudio = muted;
  }

  const packs = $derived(app.available);
  const jobs = $derived(app.jobs);

  function detailRows(info: NonNullable<typeof app.lastInfo>): Array<{ k: string; v: string }> {
    const size = `${info.width}×${info.height}`;
    return [
      { k: 'container', v: info.container || info.format.format_name },
      { k: 'length', v: `${info.duration_seconds.toFixed(2)}s` },
      { k: 'video', v: info.video_codec ? `${info.video_codec} ${size}` : '—' },
      { k: 'audio', v: info.audio_codec ? `${info.audio_codec} · ${info.sample_rate}Hz` : '—' },
    ];
  }
</script>

<svelte:head><title>Eliverter ✿ pastel media sanctuary</title></svelte:head>

<Sparkles />

<main class="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pb-24 pt-[max(2rem,env(safe-area-inset-top))]">
  <header class="flex items-center justify-between gap-4">
    <div>
      <h1 class="glow-text text-4xl font-black tracking-tight sm:text-5xl">Eliverter</h1>
      <p class="mt-1 text-sm font-semibold text-[#8a6f9b]">
        your pastel media sanctuary · {MASCOT} is in the oven
      </p>
    </div>

    <button
      type="button"
      class="pill flex shrink-0 items-center gap-2 whitespace-nowrap bg-cream/90 text-[#6b4a8a]"
      aria-pressed={muted}
      onclick={toggleMute}
      title={muted ? 'unmute the little sounds' : 'mute the little sounds'}
    >
      {#if muted}
        <VolumeX size="16" />
        <span>muted</span>
      {:else}
        <Volume2 size="16" />
        <span>sounds on</span>
      {/if}
    </button>
  </header>

  <Dropzone onfiles={onFiles} />

  {#if rejected.length}
    <section
      class="card border-2 border-peach/60 bg-gradient-to-br from-peach/20 to-cotton/15 p-4"
      role="alert"
    >
      <h2 class="text-sm font-black uppercase tracking-wider text-[#a03a5f]">
        I couldn’t read {rejected.length} file{rejected.length === 1 ? '' : 's'}
      </h2>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-xs text-[#7c3a52]">
        {#each rejected as item (item)}
          <li>{item}</li>
        {/each}
      </ul>
      <button
        type="button"
        class="pill mt-3 bg-cream/80 text-[#6b4a8a]"
        onclick={() => (rejected = [])}
      >
        okay, hide this
      </button>
    </section>
  {/if}

  <section class="card p-4">
    <div class="flex flex-wrap items-end gap-4">
      <FormatMenu options={formats} value={target} onchange={(k) => (target = k)} />

      <button
        type="button"
        class="btn ml-auto disabled:opacity-50"
        disabled={!staged.length || app.busy}
        onclick={convertAll}
      >
        <Sparkle size="18" class="mr-1.5 inline" />
        {app.busy ? 'working on it…' : `make ${staged.length || 'your'} file${staged.length === 1 ? '' : 's'} pretty`}
      </button>
    </div>

    {#if canErase}
      <BackgroundToggle
        bind:enabled={erasing}
        bind:mode={eraseMode}
        bind:color={keyColor}
        onpulse={() => unlock()}
      />
    {:else if erasing}
      <p class="mt-3 text-xs font-semibold text-[#a03a5f]">
        {target} cannot keep transparency, so the background stays put — switch to
        WebM, GIF, WebP or PNG to erase it
      </p>
    {/if}

    {#if staged.length}
      <p class="mt-3 text-xs font-semibold text-[#8a6f9b]">
        {staged.length} file{staged.length === 1 ? '' : 's'} waiting:
        <span class="text-[#6b4a8a]">{staged.map((f) => f.name).join(', ')}</span>
      </p>
    {/if}

    {#if app.lastInfo}
      <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
        {#each detailRows(app.lastInfo) as row (row.k)}
          <div>
            <dt class="font-bold uppercase tracking-wide text-[#a98fb8]">{row.k}</dt>
            <dd class="font-semibold text-[#5b3a6b]">{row.v}</dd>
          </div>
        {/each}
      </dl>
    {/if}
  </section>

  <section class="card p-4">
    <h2 class="flex items-center gap-2 text-lg font-black text-[#4a3557]">
      <Heart size="18" class="text-bubblegum" /> one-click ready packs
    </h2>
    <p class="mt-1 text-xs text-[#8a6f9b]">
      Exact platform rules, no guessing about sizes or codecs.
    </p>

    <div class="mt-3 grid gap-2 sm:grid-cols-2">
      {#each packs as pack, i (pack.id)}
        <button
          type="button"
          class="stagger group flex items-center justify-between gap-3 rounded-2xl bg-lavender/70 px-3.5 py-3 text-left transition-[transform,background] duration-200 hover:bg-periwinkle active:scale-[0.97] disabled:opacity-40"
          style="--i: {i}"
          disabled={!staged.length || app.busy}
          onclick={() => makePack(pack.id)}
        >
          <span class="min-w-0">
            <span class="block truncate text-sm font-extrabold text-[#4a3557]">{pack.label}</span>
            <span class="block truncate text-[11px] text-[#7c6290]">
              {pack.edge}px · {pack.limit} {pack.fps ? `· ${pack.fps}fps` : ''}
            </span>
          </span>
          <span class="pill shrink-0 bg-cream/80 text-[#0c4a44]">make</span>
        </button>
      {:else}
        <p class="col-span-full text-xs text-[#8a6f9b]">loading the pack rules…</p>
      {/each}
    </div>
  </section>

  <section class="flex flex-col gap-3">
    <h2 class="text-sm font-black uppercase tracking-wider text-[#a98fb8]">today’s batch</h2>
    {#each jobs as job (job.id)}
      <JobCard {job} />
    {:else}
      <p class="card p-5 text-center text-sm text-[#8a6f9b]">
        nothing yet — drop something in and I’ll get right on it ♡
      </p>
    {/each}
  </section>
  <footer class="card mt-2 flex flex-wrap items-center justify-between gap-3 p-4">
    <p class="text-xs font-semibold text-[#7c6290]">
      made by
      <a
        class="font-black text-[#6b4a8a] underline decoration-bubblegum decoration-2 underline-offset-4
               hover:text-bubblegum"
        href="https://ahura.site/resume"
        target="_blank"
        rel="noopener noreferrer">ahura</a
      >
      · everything happens on your phone, nothing is uploaded
    </p>
    <a
      class="pill bg-cream/80 text-[#6b4a8a]"
      href="https://ahura.site/resume"
      target="_blank"
      rel="noopener noreferrer"
    >
      ahura.site/resume
    </a>
  </footer>
</main>

<div
  class="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
  aria-live="polite"
>
  <p class="card max-w-full truncate px-4 py-2 text-[13px] font-bold text-[#5b3a6b] shadow-lift">
    {app.statusLine}
  </p>
</div>
