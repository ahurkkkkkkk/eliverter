/** Shared reactive state (Svelte 5 runes) plus the mascot's voice. */

import type { ConvertOptions, Job, JobEvent, MediaInfo, Pack } from './api';
import { listJobs, packs as fetchPacks, upload, uploadSticker, watchEvents } from './api';
import { completeFanfare, filePlop, formatPop, sadBoop } from './audio';
import { celebrate } from './fx';

export const MASCOT = 'Elive';

/** Status copy. Elive talks like a best friend who is having a great day. */
export const say = {
  loaded: () => 'Yay! What an adorable file! Let’s give it a makeover!',
  baking: () => pick([
    'Whipping up cute frames… adding fairy dust…',
    'Baking your stickers in the pastel oven…',
    'Tucking every pixel into its little bed…',
    'Sprinkling a bit more sparkle on this one…',
  ]),
  done: () => pick([
    'Tada! All dressed up and ready to sparkle in your chats!',
    'It’s perfect now! Go show your group chat.',
    'Wrapped with a bow and everything. Yours!',
  ]),
  tooBig: () =>
    'Uh-oh, Telegram says this sticker ate too many treats! Let me trim it down so it fits perfectly!',
  failed: (reason: string) =>
    pick([
      `Oops, that one got away from me: ${reason}`,
      `Hmm, I tripped over this one: ${reason}`,
    ]),
  queued: () => 'Saving a spot for your file, one sec!',
};

function pick<T>(items: T[]): T {
  return items[(Math.random() * items.length) | 0];
}

export interface TrackedJob extends Job {
  nickname: string;
  quip: string;
  peaks?: number[];
}

function createAppState() {
  let jobs = $state<TrackedJob[]>([]);
  let available = $state<Pack[]>([]);
  let busy = $state(false);
  let statusLine = $state('Drop anything and I’ll make it fit ♡');
  let lastInfo = $state<MediaInfo | null>(null);
  let mutesAudio = $state(false);
  let error = $state('');

  // TrackedJob, not Job: the local-only fields (quip, nickname, peaks) are what
  // the progress events actually carry.
  const upsert = (patch: Partial<TrackedJob> & { id: string }): void => {
    const at = jobs.findIndex((j) => j.id === patch.id);
    if (at === -1) return;
    jobs[at] = { ...jobs[at], ...patch };
  };

  const onEvent = (e: JobEvent): void => {
    if (!e.job_id) return;
    switch (e.type) {
      case 'queued':
        upsert({ id: e.job_id, status: 'queued', quip: say.queued() });
        break;
      case 'started':
        upsert({ id: e.job_id, status: 'processing', quip: say.baking() });
        break;
      case 'progress':
        upsert({
          id: e.job_id,
          status: 'processing',
          progress_pct: e.pct ?? 0,
          output_size: e.size_bytes ?? 0,
        });
        break;
      case 'waveform':
        upsert({ id: e.job_id, peaks: e.peaks });
        break;
      case 'complete': {
        const done = jobs.find((j) => j.id === e.job_id);
        upsert({
          id: e.job_id,
          status: 'completed',
          progress_pct: 100,
          output_size: e.size_bytes ?? done?.output_size ?? 0,
          quip: say.done(),
        });
        completeFanfare();
        celebrate();
        statusLine = say.done();
        break;
      }
      case 'error':
        upsert({ id: e.job_id, status: 'failed', error: e.message ?? 'unknown' });
        sadBoop();
        error = e.message ?? 'something went sideways';
        statusLine = say.failed(error);
        break;
    }
  };

  // Opened once for the life of the page: `app` is a module singleton, so there is
  // nothing to tear down and every job card depends on this stream.
  watchEvents(onEvent, resync);

  /**
   * Re-reads the server's view of the jobs already on screen. Used after a
   * websocket reconnect: the missed frames are gone for good, so the only way to
   * settle a job that finished while the tab was asleep is to ask again.
   */
  async function resync(): Promise<void> {
    try {
      const history = await listJobs(60);
      for (const j of history.jobs) upsert(j);
    } catch {
      /* the socket retries on its own; a failed re-sync is not worth a toast */
    }
  }

  const hydrate = async (): Promise<void> => {
    const [history, packList] = await Promise.all([listJobs(60), fetchPacks()]);
    jobs = history.jobs.map((j) => ({ ...j, nickname: j.source_filename, quip: '' }));
    available = packList;
  };

  const submit = async (
    file: File,
    targetFormat: string,
    options: Record<string, string | number | boolean> = {},
  ): Promise<void> => {
    error = '';
    busy = true;
    statusLine = say.loaded();
    filePlop();
    try {
      const job = await upload(file, { target_format: targetFormat, ...options });
      jobs = [{ ...job, nickname: file.name, quip: say.queued() }, ...jobs];
    } catch (err) {
      handleError(err);
    } finally {
      busy = false;
    }
  };

  const submitPack = async (
    file: File,
    packId: string,
    options: Partial<ConvertOptions> = {},
  ): Promise<void> => {
    error = '';
    busy = true;
    formatPop();
    statusLine = say.baking();
    try {
      const job = await uploadSticker(file, packId, options);
      jobs = [{ ...job, nickname: file.name, quip: say.queued() }, ...jobs];
    } catch (err) {
      handleError(err);
    } finally {
      busy = false;
    }
  };

  const handleError = (err: unknown): void => {
    const reason = err instanceof Error ? err.message : String(err);
    error = reason;
    statusLine = /too large|size limit/i.test(reason)
      ? say.tooBig()
      : say.failed(reason);
    sadBoop();
  };

  return {
    get jobs() {
      return jobs;
    },
    get available() {
      return available;
    },
    get busy() {
      return busy;
    },
    get statusLine() {
      return statusLine;
    },
    set statusLine(next: string) {
      statusLine = next;
    },
    get lastInfo() {
      return lastInfo;
    },
    set lastInfo(next: MediaInfo | null) {
      lastInfo = next;
    },
    get error() {
      return error;
    },
    get mutesAudio() {
      return mutesAudio;
    },
    set mutesAudio(next: boolean) {
      mutesAudio = next;
    },
    hydrate,
    submit,
    submitPack,
  };
}

export const app = createAppState();
