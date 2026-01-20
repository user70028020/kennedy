<script lang="ts">
	/**
	 * EquipmentSelector Component
	 * Dropdown agrupado por categoria para seleção de tipo de equipamento
	 * Requirements: 2.1, 2.6
	 */

	export type EquipmentType = 
		| 'transformador'
		| 'transformador_instrumento'
		| 'disjuntor'
		| 'para_raio'
		| 'rele_protecao'
		| 'chave_seccionadora'
		| 'chave_religadora'
		| 'painel_religador'
		| 'retificador_bateria'
		| 'banco_capacitores'
		| 'cabos';

	export interface EquipmentOption {
		id: EquipmentType;
		name: string;
	}

	export interface EquipmentCategory {
		name: string;
		equipment: EquipmentOption[];
	}

	// Equipment categories matching backend EQUIPMENT_CATEGORIES
	const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
		{
			name: 'Transformadores',
			equipment: [
				{ id: 'transformador', name: 'Transformador' },
				{ id: 'transformador_instrumento', name: 'Transformador de Instrumentos (TC/TP)' }
			]
		},
		{
			name: 'Proteção e Controle',
			equipment: [
				{ id: 'disjuntor', name: 'Disjuntor' },
				{ id: 'rele_protecao', name: 'Relé de Proteção' },
				{ id: 'para_raio', name: 'Para-raios' }
			]
		},
		{
			name: 'Chaves e Religadores',
			equipment: [
				{ id: 'chave_seccionadora', name: 'Chave Seccionadora' },
				{ id: 'chave_religadora', name: 'Chave Religadora' },
				{ id: 'painel_religador', name: 'Painel Religador' }
			]
		},
		{
			name: 'Sistemas Auxiliares',
			equipment: [
				{ id: 'retificador_bateria', name: 'Retificador de Bateria' },
				{ id: 'banco_capacitores', name: 'Banco de Capacitores' }
			]
		},
		{
			name: 'Outros',
			equipment: [
				{ id: 'cabos', name: 'Cabos' }
			]
		}
	];

	interface Props {
		value?: EquipmentType | null;
		required?: boolean;
		disabled?: boolean;
		onchange?: (type: EquipmentType | null) => void;
	}

	let { 
		value = $bindable(null), 
		required = false, 
		disabled = false,
		onchange 
	}: Props = $props();

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newValue = target.value as EquipmentType | '';
		value = newValue || null;
		onchange?.(value);
	}

	// Get the display name for the selected equipment
	function getEquipmentName(id: EquipmentType | null): string {
		if (!id) return '';
		for (const category of EQUIPMENT_CATEGORIES) {
			const found = category.equipment.find(e => e.id === id);
			if (found) return found.name;
		}
		return id;
	}
</script>

<div class="equipment-selector">
	<select
		{required}
		{disabled}
		onchange={handleChange}
		class="modern-select"
	>
		<option value="">Selecione o tipo de equipamento</option>
		{#each EQUIPMENT_CATEGORIES as category}
			<optgroup label={category.name}>
				{#each category.equipment as equipment}
					<option value={equipment.id} selected={value === equipment.id}>
						{equipment.name}
					</option>
				{/each}
			</optgroup>
		{/each}
	</select>
</div>

<style>
	/* Custom styling for optgroup */
	select optgroup {
		font-weight: bold;
		color: var(--text-muted);
		background-color: var(--bg-secondary);
	}

	select option {
		font-weight: normal;
		color: var(--text-primary);
		background-color: var(--bg-card);
		padding: 8px;
	}
</style>
