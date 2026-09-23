/** Canvas confetti drawn from scratch: pastel hearts, twinkling stars, sparkles. */

type Shape = 'heart' | 'star' | 'sparkle' | 'bubble';

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  rotation: number;
  size: number;
  color: string;
  shape: Shape;
  life: number;
}

const PALETTE = ['#FF62A5', '#FFA6D5', '#6EE7B7', '#67E8F9', '#FDE047', '#C084FC', '#FDBA74'];
const SHAPES: Shape[] = ['heart', 'star', 'sparkle', 'bubble'];

let pieces: Piece[] = [];
let frame: number | null = null;
let canvas: HTMLCanvasElement | null = null;

function host(): HTMLCanvasElement {
  if (canvas) return canvas;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '50',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(canvas);
  const resize = (): void => {
    if (!canvas) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);
  return canvas;
}

function path(ctx: CanvasRenderingContext2D, p: Piece): void {
  const { size } = p;
  ctx.beginPath();
  switch (p.shape) {
    case 'heart': {
      const s = size / 16;
      ctx.moveTo(0, 4 * s);
      ctx.bezierCurveTo(-8 * s, -6 * s, -2 * s, -10 * s, 0, -4 * s);
      ctx.bezierCurveTo(2 * s, -10 * s, 8 * s, -6 * s, 0, 4 * s);
      break;
    }
    case 'star': {
      const spikes = 5;
      const outer = size / 2;
      const inner = outer * 0.45;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (Math.PI * i) / spikes - Math.PI / 2;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case 'sparkle': {
      const r = size / 2;
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.quadraticCurveTo(0, 0, 0, r);
      ctx.quadraticCurveTo(0, 0, -r, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r);
      break;
    }
    default:
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  }
}

function tick(): void {
  const el = host();
  const ctx = el.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  pieces = pieces.filter((p) => p.life > 0 && p.y < innerHeight + 60);
  for (const p of pieces) {
    p.vy += 0.16;
    p.vx *= 0.992;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.life -= 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    path(ctx, p);
    ctx.fill();
    ctx.restore();
  }

  if (pieces.length > 0) {
    frame = requestAnimationFrame(tick);
  } else {
    frame = null;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
}

/** Burst from a point, defaulting to the centre of the viewport. */
export function celebrate(count = 140, origin?: { x: number; y: number }): void {
  if (prefersReducedMotion()) return;
  const el = host();
  el.getContext('2d');
  const cx = origin?.x ?? innerWidth / 2;
  const cy = origin?.y ?? innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const power = 4 + Math.random() * 11;
    pieces.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * power,
      vy: Math.sin(angle) * power - 5,
      spin: (Math.random() - 0.5) * 0.32,
      rotation: Math.random() * Math.PI,
      size: 8 + Math.random() * 14,
      color: PALETTE[(Math.random() * PALETTE.length) | 0],
      shape: SHAPES[(Math.random() * SHAPES.length) | 0],
      life: 90 + Math.random() * 70,
    });
  }
  if (frame === null) frame = requestAnimationFrame(tick);
}

export function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
