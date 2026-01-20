<script lang="ts">
	import '../app.css';
	import { ToastContainer } from '$lib/components/ui';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	let { children } = $props();

	onMount(() => {
		if (browser) {
			console.log('[Root Layout] Applying initial theme:', themeStore.theme);
			// Ensure theme is applied on mount
			const root = document.documentElement;
			root.classList.remove('dark', 'light');
			root.classList.add(themeStore.theme);
			root.setAttribute('data-theme', themeStore.theme);
			console.log('[Root Layout] HTML classes:', root.className);
		}
	});

	// Watch for theme changes
	$effect(() => {
		if (browser && themeStore.initialized) {
			console.log('[Root Layout] Theme changed to:', themeStore.theme);
			const root = document.documentElement;
			root.classList.remove('dark', 'light');
			root.classList.add(themeStore.theme);
			root.setAttribute('data-theme', themeStore.theme);
			console.log('[Root Layout] HTML classes after change:', root.className);
			
			// Force repaint
			void root.offsetHeight;
		}
	});
</script>

<ToastContainer />
{@render children()}
