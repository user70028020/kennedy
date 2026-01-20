<script lang="ts">
	/**
	 * StatusSelector Component
	 * Seleção de status do equipamento com indicadores de cor
	 * Requirements: 2.5
	 */

	export type StatusValue = 'conforme' | 'alerta' | 'corretiva' | '';

	interface StatusOption {
		value: StatusValue;
		label: string;
		color: string;
		bgColor: string;
		borderColor: string;
		description: string;
	}

	const STATUS_OPTIONS: StatusOption[] = [
		{
			value: 'conforme',
			label: 'Conforme',
			color: 'text-green-400',
			bgColor: 'bg-green-900/30',
			borderColor: 'border-green-500',
			description: 'Equipamento em condições normais de operação'
		},
		{
			value: 'alerta',
			label: 'Alerta',
			color: 'text-yellow-400',
			bgColor: 'bg-yellow-900/30',
			borderColor: 'border-yellow-500',
			description: 'Equipamento requer atenção ou manutenção preventiva'
		},
		{
			value: 'corretiva',
			label: 'Corretiva',
			color: 'text-red-400',
			bgColor: 'bg-red-900/30',
			borderColor: 'border-red-500',
			description: 'Equipamento requer manutenção corretiva imediata'
		}
	];

	interface Props {
		value?: StatusValue;
		required?: boolean;
		disabled?: boolean;
		onchange?: (status: StatusValue) => void;
	}

	let { 
		value = $bindable(''), 
		required = false, 
		disabled = false,
		onchange 
	}: Props = $props();

	function handleSelect(status: StatusValue) {
		if (disabled) return;
		value = status;
		onchange?.(status);
	}

	function getSelectedOption(): StatusOption | undefined {
		return STATUS_OPTIONS.find(opt => opt.value === value);
	}
</script>

<div class="status-selector">
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
		{#each STATUS_OPTIONS as option}
			<button
				type="button"
				onclick={() => handleSelect(option.value)}
				disabled={disabled}
				class="relative p-4 rounded-xl transition-all duration-200 {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
				style="background-color: {value === option.value ? (option.value === 'conforme' ? 'rgba(16, 185, 129, 0.15)' : option.value === 'alerta' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'var(--bg-secondary)'}; border: 2px solid {value === option.value ? (option.value === 'conforme' ? 'var(--color-success)' : option.value === 'alerta' ? 'var(--color-warning)' : 'var(--color-danger)') : 'var(--border-color)'};"
			>
				<!-- Status indicator dot -->
				<div class="flex items-center gap-3">
					<div class="w-4 h-4 rounded-full" style="background-color: {option.value === 'conforme' ? 'var(--color-success)' : option.value === 'alerta' ? 'var(--color-warning)' : 'var(--color-danger)'};"></div>
					<span class="font-medium" style="color: {option.value === 'conforme' ? 'var(--color-success)' : option.value === 'alerta' ? 'var(--color-warning)' : 'var(--color-danger)'};">{option.label}</span>
				</div>
				
				<!-- Description -->
				<p class="mt-2 text-xs text-left" style="color: var(--text-muted);">
					{option.description}
				</p>

				<!-- Selected checkmark -->
				{#if value === option.value}
					<div class="absolute top-2 right-2" style="color: {option.value === 'conforme' ? 'var(--color-success)' : option.value === 'alerta' ? 'var(--color-warning)' : 'var(--color-danger)'};">
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					</div>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Hidden input for form validation -->
	{#if required}
		<input
			type="hidden"
			{required}
			value={value}
			class="sr-only"
		/>
	{/if}

	<!-- Selected status summary -->
	{#if value}
		{@const selected = getSelectedOption()}
		{#if selected}
			<div class="mt-3 p-3 rounded-xl" style="background-color: {selected.value === 'conforme' ? 'rgba(16, 185, 129, 0.1)' : selected.value === 'alerta' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 1px solid {selected.value === 'conforme' ? 'rgba(16, 185, 129, 0.3)' : selected.value === 'alerta' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'};">
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 rounded-full" style="background-color: {selected.value === 'conforme' ? 'var(--color-success)' : selected.value === 'alerta' ? 'var(--color-warning)' : 'var(--color-danger)'};"></div>
					<span class="text-sm font-medium" style="color: {selected.value === 'conforme' ? 'var(--color-success)' : selected.value === 'alerta' ? 'var(--color-warning)' : 'var(--color-danger)'};">
						Status selecionado: {selected.label}
					</span>
				</div>
			</div>
		{/if}
	{/if}
</div>
