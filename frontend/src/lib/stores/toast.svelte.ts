import { browser } from '$app/environment';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration: number;
}

function createToastStore() {
	let toasts = $state<Toast[]>([]);

	function addToast(type: ToastType, message: string, duration = 4000): string {
		const id = Math.random().toString(36).substring(2, 9);
		const toast: Toast = { id, type, message, duration };
		toasts = [...toasts, toast];

		if (duration > 0 && browser) {
			setTimeout(() => removeToast(id), duration);
		}

		return id;
	}

	function removeToast(id: string) {
		toasts = toasts.filter(t => t.id !== id);
	}

	function clear() {
		toasts = [];
	}

	return {
		get toasts() { return toasts; },
		success: (message: string, duration?: number) => addToast('success', message, duration),
		error: (message: string, duration?: number) => addToast('error', message, duration),
		warning: (message: string, duration?: number) => addToast('warning', message, duration),
		info: (message: string, duration?: number) => addToast('info', message, duration),
		remove: removeToast,
		clear
	};
}

export const toast = createToastStore();
