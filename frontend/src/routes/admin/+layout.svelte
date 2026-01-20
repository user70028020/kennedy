<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { AdminSidebar } from '$lib/components/layout';
	import { fadeIn } from '$lib/utils/animations';

	let { children } = $props();
	let loading = $state(true);
	let authError = $state<string | null>(null);
	let mainContent: HTMLElement | undefined = $state();
	let initialized = $state(false);

	// Log immediately when script runs
	console.log('[Admin Layout] Script loaded, browser:', browser);

	// Use $effect instead of onMount for Svelte 5
	$effect(() => {
		// Only run once
		if (initialized || !browser) return;
		initialized = true;
		
		console.log('[Admin Layout] Effect running');
		console.log('[Admin Layout] Token:', !!auth.token);
		console.log('[Admin Layout] User:', auth.user?.name);
		console.log('[Admin Layout] IsAdmin:', auth.isAdmin);
		
		// No token = redirect immediately
		if (!auth.token) {
			console.log('[Admin Layout] No token, redirecting to login');
			goto('/login');
			return;
		}

		// Has cached admin user = show immediately
		if (auth.user && auth.isAdmin) {
			console.log('[Admin Layout] Has cached admin user, showing page');
			loading = false;
			setTimeout(() => {
				if (mainContent) fadeIn(mainContent, { duration: 0.4 });
			}, 50);
			return;
		}

		// Not admin but has user = redirect
		if (auth.user && !auth.isAdmin) {
			console.log('[Admin Layout] User is not admin, redirecting');
			goto('/relatorios');
			return;
		}

		// Need to verify with server
		console.log('[Admin Layout] Verifying with server...');
		auth.checkAuth()
			.then((isAuth) => {
				console.log('[Admin Layout] Auth result:', isAuth);
				
				if (!isAuth) {
					console.log('[Admin Layout] Auth failed, redirecting to login');
					goto('/login');
					return;
				}

				if (!auth.isAdmin) {
					console.log('[Admin Layout] Not admin, redirecting to relatorios');
					goto('/relatorios');
					return;
				}

				console.log('[Admin Layout] Auth OK, showing page');
				loading = false;
				setTimeout(() => {
					if (mainContent) fadeIn(mainContent, { duration: 0.4 });
				}, 50);
			})
			.catch((error) => {
				console.error('[Admin Layout] Auth error:', error);
				// If we have cached admin data, use it despite error
				if (auth.user && auth.isAdmin) {
					console.log('[Admin Layout] Using cached admin data');
					loading = false;
					authError = 'Servidor indisponível. Usando dados em cache.';
				} else {
					console.log('[Admin Layout] No cached data, redirecting to login');
					goto('/login');
				}
			});
	});
</script>

{#if loading}
	<div class="min-h-screen flex items-center justify-center" style="background-color: var(--bg-primary);">
		<div class="flex flex-col items-center gap-4">
			<div class="relative">
				<div class="w-12 h-12 border-4 border-blue-500/30 rounded-full"></div>
				<div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
			</div>
			<p class="text-theme-secondary">Verificando autenticação...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex" style="background-color: var(--bg-primary);">
		<AdminSidebar />

		<main 
			bind:this={mainContent}
			class="flex-1 p-6 overflow-auto"
			style="background-color: var(--bg-primary);"
		>
			{#if authError}
				<div class="mb-4 px-4 py-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-sm flex items-center gap-2">
					<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					{authError}
				</div>
			{/if}
			{@render children()}
		</main>
	</div>
{/if}
