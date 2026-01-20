<script lang="ts">
	import { browser } from '$app/environment';
	import { toast } from '$lib/stores/toast.svelte';

	const icons = {
		success: '✓',
		error: '✕',
		warning: '⚠',
		info: 'ℹ'
	};

	const colors = {
		success: 'bg-green-600 border-green-500',
		error: 'bg-red-600 border-red-500',
		warning: 'bg-yellow-600 border-yellow-500',
		info: 'bg-blue-600 border-blue-500'
	};
</script>

{#if browser}
	<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
		{#each toast.toasts as t (t.id)}
			<div
				class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-white animate-slide-in {colors[t.type]}"
				role="alert"
			>
				<span class="text-lg font-bold">{icons[t.type]}</span>
				<span class="flex-1">{t.message}</span>
				<button
					onclick={() => toast.remove(t.id)}
					class="text-white/70 hover:text-white transition-colors"
					aria-label="Fechar"
				>
					✕
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	@keyframes slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slide-in {
		animation: slide-in 0.3s ease-out;
	}
</style>
