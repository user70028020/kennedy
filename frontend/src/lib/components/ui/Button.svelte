<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: () => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		type = 'button',
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:focus:ring-offset-gray-900',
		secondary: 'bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-500 dark:focus:ring-offset-gray-900',
		danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:focus:ring-offset-gray-900',
		success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 dark:focus:ring-offset-gray-900',
		ghost: 'bg-transparent hover:bg-gray-700 text-gray-300 hover:text-white focus:ring-gray-500 dark:focus:ring-offset-gray-900'
	};

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
		md: 'px-4 py-2 text-sm rounded-lg gap-2',
		lg: 'px-6 py-3 text-base rounded-lg gap-2'
	};
</script>

<button
	{type}
	{onclick}
	disabled={disabled || loading}
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}"
>
	{#if loading}
		<svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
	{/if}
	{@render children()}
</button>
