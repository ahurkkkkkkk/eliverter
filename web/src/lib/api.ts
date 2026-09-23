/** Typed client for the Go service, including the /ws/jobs event stream. */

export interface MediaInfo {
  duration_seconds: number;
  size_bytes: number;
  width: number;
  height: number;
  fps: number;
  pixel_format: string;
  video_codec: string;
  audio_codec: string;
  video_codec_key: string;
  audio_codec_key: string;
  container: string;
  channels: number;
  sample_rate: number;
  has_alpha: boolean;
  frame_count: number;
  is_animated_image: boolean;
  format: { format_name: string; format_long_name: string; filename: string };
  streams: Array<{ codec_type: string; codec_name: string }>;
}

export interface Pack {
  id: string;
  label: string;
  container: string;
  codec: string;
  edge: number;
  square: boolean;
  fps: number;
  max_duration_seconds: number;
  limit_bytes: number;
  limit: string;
  notes: string;
}

export interface Job {
  id: string;
  source_filename: string;
  source_format: string;
  target_format: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress_pct: number;
  output_size: number;
  error: string;
  download_url: string;
  created_at: string;
  completed_at: string;
}

export interface JobEvent {
  type: 'queued' | 'started' | 'progress' | 'complete' | 'error' | 'waveform' | 'pruned';
  job_id?: string;
  pct?: number;
  frame?: number;
  out_time_ms?: number;
  speed?: number;
  size_bytes?: number;
  phase?: string;
  message?: string;
  peaks?: number[];
  at?: number;
}

export interface ConvertOptions {
  target_format: string;
  video_codec?: string;
  audio_codec?: string;
  width?: number;
  height?: number;
  fps?: number;
  crf?: number;
  bitrate_kbps?: number;
  two_pass?: boolean;
  no_audio?: boolean;
  no_video?: boolean;
  strip_metadata?: boolean;
  filters?: string;
  preset_id?: string;
  erase_background?: boolean;
  erase_mode?: 'auto' | 'color';
  key_color?: string;
  similarity?: number;
  blend?: number;
  despill?: boolean;
}

const API = '';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {
      /* a non-JSON error body is fine, the status line is enough */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export function upload(
  file: File,
  opts: ConvertOptions,
  signal?: AbortSignal,
): Promise<Job> {
  const form = new FormData();
  form.append('file', file, file.name);
  for (const [key, value] of Object.entries(opts)) {
    if (value === undefined || value === null || value === false) continue;
    form.append(key, String(value));
  }
  return fetch(`${API}/api/jobs`, { method: 'POST', body: form, signal })
    .then(json<Job>);
}

export function uploadSticker(
  file: File,
  pack: string,
  opts: Partial<ConvertOptions> = {},
): Promise<Job> {
  const form = new FormData();
  form.append('file', file, file.name);
  form.append('pack', pack);
  // Packs take the keying options too, so a sprite can be cut out of its backdrop
  // in the same pass that sizes it for the platform.
  for (const [key, value] of Object.entries(opts)) {
    if (value === undefined || value === null || value === false) continue;
    form.append(key, String(value));
  }
  return fetch(`${API}/api/sticker-packs`, { method: 'POST', body: form }).then(json<Job>);
}

export function probe(file: File): Promise<{ info: MediaInfo; filename: string }> {
  const form = new FormData();
  form.append('file', file, file.name);
  return fetch(`${API}/api/probe`, { method: 'POST', body: form }).then(
    json<{ info: MediaInfo; filename: string }>,
  );
}

export function listJobs(limit = 50): Promise<{ jobs: Job[] }> {
  return fetch(`${API}/api/jobs?limit=${limit}`).then(json<{ jobs: Job[] }>);
}

export function packs(): Promise<Pack[]> {
  return fetch(`${API}/api/packs`).then(json<Pack[]>);
}

export function taxonomy(): Promise<unknown> {
  return fetch(`${API}/api/taxonomy`).then(json);
}

export function cancelJob(id: string): Promise<unknown> {
  return fetch(`${API}/api/jobs/${id}`, { method: 'DELETE' }).then(json);
}

/**
 * Subscribes to the milestone stream and reconnects on drop.
 *
 * onReconnect fires on every successful open after the first one, which is what
 * makes resume-on-wake real: a phone that sleeps mid-encode misses the complete
 * frame entirely, so without a re-sync the card would sit on "processing" forever.
 */
export function watchEvents(
  onEvent: (e: JobEvent) => void,
  onReconnect?: () => void,
): () => void {
  let socket: WebSocket | null = null;
  let closed = false;
  let everOpen = false;
  let retry = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const url = () => {
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${scheme}://${location.host}/ws/jobs`;
  };

  const connect = (): void => {
    if (closed) return;
    socket = new WebSocket(url());
    socket.onopen = () => {
      retry = 0;
      if (everOpen) onReconnect?.();
      everOpen = true;
    };
    socket.onmessage = (msg) => {
      try {
        onEvent(JSON.parse(msg.data as string) as JobEvent);
      } catch {
        /* a malformed frame must not break the loop */
      }
    };
    socket.onclose = () => {
      if (closed) return;
      retry = Math.min(retry + 1, 6);
      timer = setTimeout(connect, 400 * retry);
    };
    socket.onerror = () => socket?.close();
  };

  connect();
  return () => {
    closed = true;
    if (timer) clearTimeout(timer);
    socket?.close();
  };
}
