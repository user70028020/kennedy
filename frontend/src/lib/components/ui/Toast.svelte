<script lang="ts">
	import { browser } from '$app/environment';

	export type ToastType = 'success' | 'error' | 'warning' | 'info';

	interface Toast {
		id: string;
		type: ToastType;
		message: string;
		duration?: number;
	}

	let toasts = $state<Toast[]>([]);

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

	function addToast(type: ToastType, message: string, duration = 4000) {
		const id = Math.random().toString(36).substring(2, 9);
		const toast: Toast = { id, type, message, duration };
		toasts = [...toasts, toast];

		if (duration > 0) {
			setTimeout(() => removeToast(id), duration);
		}

		return id;
	}

	function removeToast(id: string) {
		toasts = toasts.filter(t => t.id !== id);
	}

	// Export functions for external use
	export function success(message: string, duration?: number) {
		return addToast('success', message, duration);
	}

	export function error(message: string, duration?: number) {
		return addToast('error', message, duration);
	}

	export function warning(message: string, duration?: number) {
		return addToast('warning', message, duration);
	}

	export function info(message: string, duration?: number) {
		return addToast('info', message, duration);
	}
</script>

{#if browser}
	<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
		{#each toasts as toast (toast.id)}
			<div
				class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-white animate-slide-in {colors[toast.type]}"
				role="alert"
			>
				<span class="text-lg font-bold">{icons[toast.type]}</span>
				<span class="flex-1">{toast.message}</span>
				<button
					onclick={() => removeToast(toast.id)}
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
