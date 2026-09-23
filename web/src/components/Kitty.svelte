<script lang="ts">
  /**
   * Elive, the house kitty.
   *
   * Inline SVG rather than an image file: it inherits the pastel theme tokens,
   * stays crisp on a phone, and costs no extra asset in the APK. Ears are drawn
   * behind the head so their seams hide under the face, and every joint is
   * rounded -- pointy corners on a mascot is exactly what this app is not.
   */
  let {
    size = 46,
    label = '',
    class: klass = '',
  }: {
    size?: number | string;
    label?: string;
    class?: string;
  } = $props();

  const outline = '#c084fc';
  const fur = '#faf7fd';
  const ink = '#4a3557';
</script>

<svg
  viewBox="0 0 64 64"
  width={size}
  height={size}
  class={klass}
  role={label ? 'img' : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : 'true'}
  focusable="false"
>
  <g stroke={outline} stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
    <path fill={fur} d="M17 25 12 7.5 28.5 16.5Z" />
    <path fill={fur} d="M47 25 52 7.5 35.5 16.5Z" />
    <ellipse cx="32" cy="36" rx="21" ry="18" fill={fur} />
  </g>

  <!-- Inner ears sit near the tips so the head never covers them. -->
  <path fill="#ffa6d5" d="M17.8 21.6 15.4 12.6 23.4 16.8Z" />
  <path fill="#ffa6d5" d="M46.2 21.6 48.6 12.6 40.6 16.8Z" />

  <ellipse cx="20.6" cy="41.4" rx="4.1" ry="2.4" fill="#ffa6d5" opacity="0.75" />
  <ellipse cx="43.4" cy="41.4" rx="4.1" ry="2.4" fill="#ffa6d5" opacity="0.75" />

  <ellipse cx="25" cy="35" rx="3.1" ry="4.1" fill={ink} />
  <ellipse cx="39" cy="35" rx="3.1" ry="4.1" fill={ink} />
  <circle cx="26.2" cy="33.2" r="1.2" fill="#fff" />
  <circle cx="40.2" cy="33.2" r="1.2" fill="#fff" />

  <path
    fill="#ff62a5"
    d="M32 40.4 34.3 42.9a1.15 1.15 0 0 1-.9 1.9h-2.8a1.15 1.15 0 0 1-.9-1.9Z"
  />

  <!-- The ":3" mouth. -->
  <g fill="none" stroke={ink} stroke-width="1.6" stroke-linecap="round">
    <path d="M32 44.9v1.3" />
    <path d="M32 46.2q-3.1 3.3-6.5.4" />
    <path d="M32 46.2q3.1 3.3 6.5.4" />
  </g>

  <g stroke={outline} stroke-width="1.4" stroke-linecap="round" opacity="0.8">
    <path d="M2.6 31.6l9.6 1.9" />
    <path d="M2.6 39.4l9.6-1.6" />
    <path d="M61.4 31.6l-9.6 1.9" />
    <path d="M61.4 39.4l-9.6-1.6" />
  </g>
</svg>
