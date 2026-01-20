<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Header, TabNavigation } from '$lib/components/layout';
	import { SatisfactionSurveyModal, FinalizeOSModal } from '$lib/components/reports';

	let { children } = $props();
	let loading = $state(true);
	let showSurveyModal = $state(false);
	let showFinalizeOSModal = $state(false);
	let checked = $state(false);

	$effect(() => {
		if (browser && !checked) {
			checked = true;
			checkAuthentication();
		}
	});

	async function checkAuthentication() {
		try {
			if (!auth.token) {
				goto('/login');
				return;
			}

			const isAuth = await auth.checkAuth();
			
			if (!isAuth) {
				goto('/login');
				return;
			}

			// Admin e funcionário usam a mesma interface de relatórios
			loading = false;
		} catch (error) {
			console.error('Auth check failed:', error);
			goto('/login');
		}
	}

	function handleSurvey() {
		showSurveyModal = true;
	}

	function closeSurveyModal() {
		showSurveyModal = false;
	}

	function handleSurveySuccess() {
		// Could show a toast notification or update some state
		console.log('Pesquisa de satisfação enviada com sucesso');
	}

	function handleFinalizeOS() {
		showFinalizeOSModal = true;
	}

	function closeFinalizeOSModal() {
		showFinalizeOSModal = false;
	}

	function handleFinalizeOSSuccess() {
		console.log('OS finalizada com sucesso');
	}
</script>

{#if loading}
	<div class="min-h-screen flex items-center justify-center" style="background-color: var(--bg-primary);">
		<div class="flex flex-col items-center gap-4">
			<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
			<p class="text-theme-muted">Carregando...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex flex-col" style="background-color: var(--bg-primary);">
		<Header onSurvey={handleSurvey} onFinalizeOS={handleFinalizeOS} />
		<TabNavigation />

		<main class="flex-1 p-4 md:p-6">
			<div class="max-w-7xl mx-auto">
				{@render children()}
			</div>
		</main>
	</div>

	{#if showSurveyModal}
		<SatisfactionSurveyModal 
			onClose={closeSurveyModal}
			onSuccess={handleSurveySuccess}
		/>
	{/if}

	{#if showFinalizeOSModal}
		<FinalizeOSModal 
			onClose={closeFinalizeOSModal}
			onSuccess={handleFinalizeOSSuccess}
		/>
	{/if}
{/if}
