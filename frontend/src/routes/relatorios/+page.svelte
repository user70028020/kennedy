<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	const moduleRoutes = [
		{ module: 'fotografico', route: '/relatorios/fotografico' },
		{ module: 'spda', route: '/relatorios/spda' },
		{ module: 'rdo', route: '/relatorios/rdo' },
		{ module: 'tecnico', route: '/relatorios/tecnico' },
		{ module: 'gastos', route: '/relatorios/gastos' }
	];

	let redirected = $state(false);

	$effect(() => {
		if (browser && !redirected) {
			redirected = true;
			console.log('[Relatorios Page] Redirecting to first available module');
			console.log('[Relatorios Page] User:', auth.user?.name);
			console.log('[Relatorios Page] IsAdmin:', auth.isAdmin);
			
			// Find first available module and redirect
			for (const { module, route } of moduleRoutes) {
				console.log('[Relatorios Page] Checking module:', module, 'hasModule:', auth.hasModule(module));
				if (auth.hasModule(module)) {
					console.log('[Relatorios Page] Redirecting to:', route);
					goto(route);
					return;
				}
			}
			console.log('[Relatorios Page] No module found, staying on page');
		}
	});
</script>

<div class="text-center py-12">
	<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
	<p class="text-theme-muted">Redirecionando...</p>
</div>
