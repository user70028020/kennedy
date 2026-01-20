<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let loading = $state(true);
	let checked = $state(false);

	$effect(() => {
		if (browser && !checked) {
			checked = true;
			checkAuthentication();
		}
	});

	async function checkAuthentication() {
		try {
			if (auth.token) {
				const isValid = await auth.checkAuth();
				
				if (isValid) {
					// Todos vão para relatórios (admin tem botão para acessar painel admin)
					goto('/relatorios');
					return;
				}
			}
		} catch (error) {
			console.error('Auth check failed:', error);
		}
		
		loading = false;
	}
</script>

{#if loading}
	<div class="min-h-screen bg-gray-900 flex items-center justify-center">
		<div class="flex flex-col items-center gap-4">
			<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
			<p class="text-gray-400">Carregando...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-900 flex items-center justify-center">
		<div class="text-center">
			<h1 class="text-4xl font-bold text-white mb-4">SERCAMP Relatórios</h1>
			<p class="text-gray-400 mb-8">Sistema de Relatórios Técnicos</p>
			<a 
				href="/login" 
				class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
			>
				Entrar
			</a>
		</div>
	</div>
{/if}
