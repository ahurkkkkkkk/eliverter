<script lang="ts">
  /** Ambient pastel hearts, stars and bubbles drifting upward, nudged by the cursor. */
  import { onMount } from 'svelte';

  let layer: HTMLDivElement | undefined = $state();
  const glyphs = ['✦', '✧', '♡', '⋆', '✩', '❋'];
  const colors = ['#FFA6D5', '#6EE7B7', '#67E8F9', '#FDE047', '#C084FC', '#FDBA74'];

  const motes = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    glyph: glyphs[i % glyphs.length],
    color: colors[i % colors.length],
    left: `${(i * 37) % 100}%`,
    size: `${10 + ((i * 13) % 16)}px`,
    delay: `${-(i * 1.4).toFixed(2)}s`,
    duration: `${11 + ((i * 5) % 9)}s`,
  }));

  let pointer = $state({ x: 0.5, y: 0.5 });

  function onMove(event: PointerEvent): void {
    pointer = { x: event.clientX / innerWidth, y: event.clientY / innerHeight };
  }

  onMount(() => {
    addEventListener('pointermove', onMove, { passive: true });
    return () => removeEventListener('pointermove', onMove);
  });

  // Repulsion is a cheap parallax: the whole field shifts away from the cursor
  // slightly, which reads as depth without animating 26 nodes individually.
  $effect(() => {
    if (!layer) return;
    const dx = (pointer.x - 0.5) * -22;
    const dy = (pointer.y - 0.5) * -14;
    layer.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  });
</script>

<div
  bind:this={layer}
  class="pointer-events-none fixed inset-x-0 bottom-0 top-[max(env(safe-area-inset-top),2.5rem)] overflow-hidden transition-transform duration-500 ease-out"
  aria-hidden="true"
>
  {#each motes as m (m.id)}
    <span
      class="sparkle"
      style="left:{m.left}; font-size:{m.size}; color:{m.color};
             animation-delay:{m.delay}; animation-duration:{m.duration};"
    >{m.glyph}</span>
  {/each}
</div>
