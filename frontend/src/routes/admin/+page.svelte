<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let redirected = $state(false);

	$effect(() => {
		if (browser && !redirected) {
			redirected = true;
			console.log('[Admin Page] Redirecting to first available section');
			// Redirect to first available admin section
			if (auth.hasModule('gerenciar_usuarios')) {
				goto('/admin/usuarios');
			} else if (auth.hasModule('banco_dados')) {
				goto('/admin/os');
			} else {
				goto('/admin/usuarios');
			}
		}
	});
</script>

<div class="flex items-center justify-center py-12">
	<div class="text-center">
		<div class="relative inline-block mb-4">
			<div class="w-10 h-10 border-4 border-blue-500/30 rounded-full"></div>
			<div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
		</div>
		<p style="color: var(--text-muted);">Redirecionando...</p>
	</div>
</div>
