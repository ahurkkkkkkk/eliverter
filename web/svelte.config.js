import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * svelte-check reads this file to learn how to preprocess `.svelte` sources.
 * Without it the checker silently skips every component, so real type errors in
 * `<script lang="ts">` blocks go unnoticed while the Vite build still passes.
 */
export default {
  preprocess: vitePreprocess(),
};
