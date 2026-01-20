<script lang="ts">
	interface Props {
		class?: string;
		width?: string;
		height?: string;
		rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
	}

	let { 
		class: className = '', 
		width = '100%', 
		height = '1rem',
		rounded = 'md'
	}: Props = $props();

	const roundedClasses = {
		none: '',
		sm: 'rounded-sm',
		md: 'rounded-md',
		lg: 'rounded-lg',
		full: 'rounded-full'
	};
</script>

<div
	class="animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] {roundedClasses[rounded]} {className}"
	style="width: {width}; height: {height};"
></div>

<style>
	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
	
	.animate-pulse {
		animation: shimmer 1.5s ease-in-out infinite;
	}
</style>
