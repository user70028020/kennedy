<script lang="ts">
	import { browser } from '$app/environment';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		id?: string;
		onchange?: (value: string) => void;
	}

	let { 
		options, 
		value = $bindable(''), 
		placeholder = 'Selecione uma opção', 
		required = false,
		disabled = false,
		id = '',
		onchange
	}: Props = $props();

	let isOpen = $state(false);
	let searchQuery = $state('');
	let highlightedIndex = $state(-1);
	let containerRef: HTMLDivElement;
	let initialized = $state(false);

	// Get selected option label
	let selectedLabel = $derived(
		options.find(opt => opt.value === value)?.label || ''
	);

	// Filter options based on search
	let filteredOptions = $derived(
		searchQuery 
			? options.filter(opt => 
				opt.label.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: options
	);

	// Close dropdown when clicking outside
	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			
			function handleClickOutside(e: MouseEvent) {
				if (containerRef && !containerRef.contains(e.target as Node)) {
					closeDropdown();
				}
			}

			document.addEventListener('click', handleClickOutside);
			
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});

	function toggleDropdown() {
		if (disabled) return;
		
		if (isOpen) {
			closeDropdown();
		} else {
			openDropdown();
		}
	}

	function openDropdown() {
		isOpen = true;
		searchQuery = '';
		highlightedIndex = options.findIndex(opt => opt.value === value);
	}

	function closeDropdown() {
		isOpen = false;
		searchQuery = '';
		highlightedIndex = -1;
	}

	function selectOption(option: Option) {
		value = option.value;
		onchange?.(option.value);
		closeDropdown();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
				e.preventDefault();
				openDropdown();
			}
			return;
		}

		switch (e.key) {
			case 'Escape':
				e.preventDefault();
				closeDropdown();
				break;
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex = Math.min(highlightedIndex + 1, filteredOptions.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex = Math.max(highlightedIndex - 1, 0);
				break;
			case 'Enter':
				e.preventDefault();
				if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
					selectOption(filteredOptions[highlightedIndex]);
				}
				break;
		}
	}
</script>

<div 
	bind:this={containerRef}
	class="relative w-full"
	{id}
>
	<!-- Trigger Button -->
	<button
		type="button"
		onclick={toggleDropdown}
		onkeydown={handleKeydown}
		{disabled}
		class="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left transition-all duration-200 {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
		style="background-color: var(--bg-input); border: 2px solid {isOpen ? 'var(--color-primary)' : 'var(--border-color)'}; color: var(--text-primary); box-shadow: {isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none'};"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<span class="{selectedLabel ? '' : 'opacity-50'}">
			{selectedLabel || placeholder}
		</span>
		
		<!-- Arrow Icon -->
		<svg 
			class="w-5 h-5 transition-transform duration-300 {isOpen ? 'rotate-180' : ''}" 
			style="color: var(--text-muted);"
			fill="none" 
			stroke="currentColor" 
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Hidden input for form submission -->
	{#if required}
		<input type="hidden" {value} {required} />
	{/if}

	<!-- Dropdown -->
	{#if isOpen}
		<div 
			class="absolute z-50 w-full mt-2 rounded-xl shadow-2xl overflow-hidden dropdown-animate"
			style="background-color: var(--bg-card); border: 1px solid var(--border-color);"
			role="listbox"
		>
			<!-- Search Input (for lists with many options) -->
			{#if options.length > 5}
				<div class="p-2" style="border-bottom: 1px solid var(--border-color);">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Buscar..."
						class="w-full px-3 py-2 rounded-lg text-sm transition-all duration-200"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary);"
					/>
				</div>
			{/if}

			<!-- Options List -->
			<div class="max-h-60 overflow-y-auto py-1">
				{#if filteredOptions.length === 0}
					<div class="px-4 py-3 text-sm" style="color: var(--text-muted);">
						Nenhuma opção encontrada
					</div>
				{:else}
					{#each filteredOptions as option, index}
						<button
							type="button"
							onclick={() => selectOption(option)}
							onmouseenter={() => highlightedIndex = index}
							class="w-full px-4 py-2.5 text-left text-sm transition-all duration-150 flex items-center gap-3"
							style="background-color: {highlightedIndex === index ? 'var(--bg-hover)' : 'transparent'}; color: {value === option.value ? 'var(--color-primary)' : 'var(--text-primary)'};"
							role="option"
							aria-selected={value === option.value}
						>
							<!-- Check Icon -->
							{#if value === option.value}
								<svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							{:else}
								<span class="w-4"></span>
							{/if}
							
							<span class="flex-1">{option.label}</span>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.dropdown-animate {
		animation: dropdownSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		transform-origin: top center;
	}

	@keyframes dropdownSlideIn {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
