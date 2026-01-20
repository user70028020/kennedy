<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import { ThemeToggle } from '$lib/components/ui';
	import { themeStore } from '$lib/stores/theme.svelte';

	interface Props {
		onSurvey?: () => void;
		onFinalizeOS?: () => void;
	}

	let { onSurvey, onFinalizeOS }: Props = $props();

	function handleLogout() {
		auth.logout();
		window.location.href = '/login';
	}
</script>

<header class="modern-header">
	<div class="flex items-center justify-between max-w-7xl mx-auto">
		<!-- Logo -->
		<div class="flex items-center">
			{#if themeStore.isDark}
				<img src="/logoescuro.png" alt="SERCAMP" class="h-8 w-auto" />
			{:else}
				<img src="/logoclaro.png" alt="SERCAMP" class="h-8 w-auto" />
			{/if}
		</div>

		<!-- Right side: Actions, Theme toggle & Logout -->
		<div class="flex items-center gap-2">
			{#if onFinalizeOS}
				<button
					onclick={onFinalizeOS}
					class="header-btn header-btn-orange hidden sm:flex"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Finalizar OS</span>
				</button>
			{/if}

			{#if onSurvey}
				<button
					onclick={onSurvey}
					class="header-btn header-btn-green hidden sm:flex"
				>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
					</svg>
					<span>Pesquisa</span>
				</button>
			{/if}

			{#if auth.isAdmin}
				<a href="/admin" class="header-btn header-btn-blue">
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span class="hidden sm:inline">Admin</span>
				</a>
			{/if}

			<div class="w-px h-5 mx-1" style="background-color: var(--border-color);"></div>

			<ThemeToggle />

			<button
				onclick={handleLogout}
				class="p-1.5 rounded-lg transition-all duration-200 hover:bg-red-500/20"
				style="color: var(--text-muted);"
				title="Sair"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
				</svg>
			</button>
		</div>
	</div>
</header>

<style>
	.header-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		transition: all 0.2s ease;
		border: 1px solid;
	}

	.header-btn:hover {
		transform: translateY(-1px);
	}

	.header-btn:active {
		transform: translateY(0);
	}

	.header-btn-orange {
		background-color: rgba(249, 115, 22, 0.15);
		color: #f97316;
		border-color: rgba(249, 115, 22, 0.3);
	}

	.header-btn-orange:hover {
		background-color: rgba(249, 115, 22, 0.25);
		border-color: rgba(249, 115, 22, 0.5);
	}

	.header-btn-green {
		background-color: rgba(16, 185, 129, 0.15);
		color: #10b981;
		border-color: rgba(16, 185, 129, 0.3);
	}

	.header-btn-green:hover {
		background-color: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.5);
	}

	.header-btn-blue {
		background-color: rgba(59, 130, 246, 0.15);
		color: #3b82f6;
		border-color: rgba(59, 130, 246, 0.3);
	}

	.header-btn-blue:hover {
		background-color: rgba(59, 130, 246, 0.25);
		border-color: rgba(59, 130, 246, 0.5);
	}
</style>
