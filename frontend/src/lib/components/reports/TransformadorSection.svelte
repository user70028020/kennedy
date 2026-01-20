<script lang="ts">
	import { browser } from '$app/environment';

	// Props
	let { 
		values = $bindable<Record<string, any>>({}),
		onchange
	}: {
		values?: Record<string, any>;
		onchange?: (values: Record<string, any>) => void;
	} = $props();

	// Seções expandidas/colapsadas
	let expandedSections = $state<Record<string, boolean>>({
		'resistencia-ohmica': true,
		'resistencia-isolamento': true
	});

	function toggleSection(sectionId: string) {
		expandedSections[sectionId] = !expandedSections[sectionId];
	}

	function handleFieldChange(fieldId: string, value: any) {
		values = { ...values, [fieldId]: value };
		onchange?.(values);
	}

	function getFieldValue(fieldId: string, defaultValue: any = ''): any {
		return values[fieldId] ?? defaultValue;
	}

	// Dados para Resistência Ôhmica
	const resistenciaOhmicaGroups = [
		{
			title: 'Alta Tensão (AT)',
			subtitle: 'Enrolamentos H1, H2, H3',
			icon: '⚡',
			color: '#ef4444',
			fields: [
				{ id: 'resOhmicaH1H2', label: 'H1-H2', unitId: 'resOhmicaH1H2Unidade' },
				{ id: 'resOhmicaH2H3', label: 'H2-H3', unitId: 'resOhmicaH2H3Unidade' },
				{ id: 'resOhmicaH3H1', label: 'H3-H1', unitId: 'resOhmicaH3H1Unidade' }
			]
		},
		{
			title: 'Baixa Tensão (BT)',
			subtitle: 'Enrolamentos X1, X2, X3',
			icon: '🔌',
			color: '#3b82f6',
			fields: [
				{ id: 'resOhmicaX1X0', label: 'X1-X0', unitId: 'resOhmicaX1X0Unidade' },
				{ id: 'resOhmicaX2X0', label: 'X2-X0', unitId: 'resOhmicaX2X0Unidade' },
				{ id: 'resOhmicaX3X0', label: 'X3-X0', unitId: 'resOhmicaX3X0Unidade' }
			]
		}
	];

	const unidadeOptions = [
		{ value: 'mΩ', label: 'mΩ (miliohm)' },
		{ value: 'µΩ', label: 'µΩ (microohm)' },
		{ value: 'Ω', label: 'Ω (ohm)' }
	];

	const resistenciaIsolamentoFields = [
		{
			id: 'resIsolATBTMassa',
			label: 'AT – BT – MASSA',
			subtitle: 'Alta Tensão, Baixa Tensão e Massa',
			voltage: '5.000 VCC',
			unit: 'MΩ',
			icon: '🔺',
			color: '#ef4444'
		},
		{
			id: 'resIsolATMassaBT',
			label: 'AT – MASSA – BT',
			subtitle: 'Alta Tensão, Massa e Baixa Tensão',
			voltage: '5.000 VCC',
			unit: 'MΩ',
			icon: '🔶',
			color: '#f59e0b'
		},
		{
			id: 'resIsolBTMassaAT',
			label: 'BT – MASSA – AT',
			subtitle: 'Baixa Tensão, Massa e Alta Tensão',
			voltage: '500 VCC',
			unit: 'MΩ',
			icon: '🔷',
			color: '#3b82f6'
		}
	];
</script>

<div class="transformador-section space-y-6">
	<!-- Resistência Ôhmica - Enrolamentos -->
	<div class="section-card">
		<button
			type="button"
			class="section-header"
			onclick={() => toggleSection('resistencia-ohmica')}
		>
			<div class="flex items-center gap-3">
				<div class="section-icon" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
					⚙️
				</div>
				<div class="text-left">
					<h3 class="section-title">Resistência Ôhmica - Enrolamentos</h3>
					<p class="section-subtitle">Medição da resistência dos enrolamentos do transformador</p>
				</div>
			</div>
			<svg
				class="chevron"
				class:rotated={expandedSections['resistencia-ohmica']}
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
			</svg>
		</button>

		{#if expandedSections['resistencia-ohmica']}
			<div class="section-content">
				<div class="info-banner">
					<span class="info-icon">💡</span>
					<p class="info-text">
						Meça a resistência entre os terminais indicados. Valores muito diferentes podem indicar problemas nos enrolamentos.
					</p>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{#each resistenciaOhmicaGroups as group}
						<div class="measurement-group">
							<div class="group-header" style="border-left-color: {group.color};">
								<span class="group-icon">{group.icon}</span>
								<div>
									<h4 class="group-title">{group.title}</h4>
									<p class="group-subtitle">{group.subtitle}</p>
								</div>
							</div>

							<div class="space-y-3">
								{#each group.fields as field}
									<div class="measurement-row">
										<label class="measurement-label">{field.label}</label>
										<div class="measurement-inputs">
											<input
												type="text"
												inputmode="decimal"
												value={getFieldValue(field.id, '')}
												oninput={(e) => handleFieldChange(field.id, e.currentTarget.value)}
												placeholder="0.00"
												class="measurement-input"
											/>
											<select
												value={getFieldValue(field.unitId, 'mΩ')}
												onchange={(e) => handleFieldChange(field.unitId, e.currentTarget.value)}
												class="unit-select"
											>
												{#each unidadeOptions as option}
													<option value={option.value}>{option.label}</option>
												{/each}
											</select>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Resistência de Isolamento - Megômetro -->
	<div class="section-card">
		<button
			type="button"
			class="section-header"
			onclick={() => toggleSection('resistencia-isolamento')}
		>
			<div class="flex items-center gap-3">
				<div class="section-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
					🔬
				</div>
				<div class="text-left">
					<h3 class="section-title">Resistência de Isolamento - Megômetro</h3>
					<p class="section-subtitle">Teste de isolamento entre enrolamentos e massa</p>
				</div>
			</div>
			<svg
				class="chevron"
				class:rotated={expandedSections['resistencia-isolamento']}
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
			</svg>
		</button>

		{#if expandedSections['resistencia-isolamento']}
			<div class="section-content">
				<div class="info-banner">
					<span class="info-icon">💡</span>
					<p class="info-text">
						Use o megômetro na tensão indicada. Valores baixos (&lt; 1 MΩ) indicam problemas de isolamento.
					</p>
				</div>

				<div class="space-y-4">
					{#each resistenciaIsolamentoFields as field}
						<div class="isolation-card">
							<div class="isolation-header">
								<span class="isolation-icon" style="color: {field.color};">{field.icon}</span>
								<div class="flex-1">
									<h4 class="isolation-title">{field.label}</h4>
									<p class="isolation-subtitle">{field.subtitle}</p>
								</div>
								<div class="voltage-badge">{field.voltage}</div>
							</div>
							<div class="isolation-input-wrapper">
								<input
									type="text"
									inputmode="decimal"
									value={getFieldValue(field.id, '')}
									oninput={(e) => handleFieldChange(field.id, e.currentTarget.value)}
									placeholder="0.00"
									class="isolation-input"
								/>
								<span class="isolation-unit">{field.unit}</span>
							</div>
						</div>
					{/each}
				</div>

				<div class="reference-table">
					<h5 class="reference-title">📊 Valores de Referência</h5>
					<div class="reference-grid">
						<div class="reference-item good">
							<span class="reference-icon">✅</span>
							<div>
								<p class="reference-label">Bom</p>
								<p class="reference-value">&gt; 1000 MΩ</p>
							</div>
						</div>
						<div class="reference-item warning">
							<span class="reference-icon">⚠️</span>
							<div>
								<p class="reference-label">Atenção</p>
								<p class="reference-value">100 - 1000 MΩ</p>
							</div>
						</div>
						<div class="reference-item danger">
							<span class="reference-icon">❌</span>
							<div>
								<p class="reference-label">Crítico</p>
								<p class="reference-value">&lt; 100 MΩ</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.transformador-section {
		width: 100%;
		max-width: 100%;
	}

	/* Section Card */
	.section-card {
		background-color: var(--bg-secondary);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		border: 1px solid var(--border-color);
	}

	.section-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem;
		background-color: var(--bg-secondary);
		border: none;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.section-header:hover {
		background-color: var(--bg-hover);
	}

	.section-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		flex-shrink: 0;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.section-subtitle {
		font-size: 0.875rem;
		color: var(--text-muted);
		margin: 0.25rem 0 0 0;
	}

	.chevron {
		color: var(--text-muted);
		transition: transform 0.3s ease;
		flex-shrink: 0;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.section-content {
		padding: 1.5rem;
		border-top: 1px solid var(--border-color);
	}

	/* Info Banner */
	.info-banner {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
		border-radius: 12px;
		border: 1px solid rgba(59, 130, 246, 0.2);
		margin-bottom: 1.5rem;
	}

	.info-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.info-text {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	/* Measurement Group */
	.measurement-group {
		background-color: var(--bg-primary);
		border-radius: 12px;
		padding: 1.25rem;
		border: 1px solid var(--border-color);
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
		border-left: 4px solid;
		padding-left: 0.75rem;
	}

	.group-icon {
		font-size: 1.5rem;
	}

	.group-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.group-subtitle {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin: 0.25rem 0 0 0;
	}

	/* Measurement Row */
	.measurement-row {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.measurement-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.measurement-inputs {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.5rem;
	}

	.measurement-input {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 1rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.measurement-input:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.unit-select {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.875rem;
		cursor: pointer;
		min-width: 140px;
	}

	/* Isolation Card */
	.isolation-card {
		background-color: var(--bg-primary);
		border-radius: 12px;
		padding: 1.25rem;
		border: 1px solid var(--border-color);
	}

	.isolation-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.isolation-icon {
		font-size: 1.5rem;
	}

	.isolation-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.isolation-subtitle {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin: 0.25rem 0 0 0;
	}

	.voltage-badge {
		padding: 0.375rem 0.75rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.isolation-input-wrapper {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.75rem;
		align-items: center;
	}

	.isolation-input {
		padding: 0.875rem;
		border: 2px solid var(--border-color);
		border-radius: 8px;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 1.125rem;
		font-weight: 600;
		transition: all 0.2s;
	}

	.isolation-input:focus {
		outline: none;
		border-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	.isolation-unit {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-secondary);
		padding: 0.875rem;
		background-color: var(--bg-secondary);
		border-radius: 8px;
		border: 1px solid var(--border-color);
		min-width: 60px;
		text-align: center;
	}

	/* Reference Table */
	.reference-table {
		margin-top: 1.5rem;
		padding: 1.25rem;
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%);
		border-radius: 12px;
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	.reference-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
	}

	.reference-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.reference-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: 8px;
		border: 1px solid;
	}

	.reference-item.good {
		background-color: rgba(16, 185, 129, 0.1);
		border-color: rgba(16, 185, 129, 0.3);
	}

	.reference-item.warning {
		background-color: rgba(245, 158, 11, 0.1);
		border-color: rgba(245, 158, 11, 0.3);
	}

	.reference-item.danger {
		background-color: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.3);
	}

	.reference-icon {
		font-size: 1.25rem;
	}

	.reference-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.reference-value {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin: 0;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.section-icon {
			width: 40px;
			height: 40px;
			font-size: 20px;
		}

		.section-title {
			font-size: 1rem;
		}

		.section-subtitle {
			font-size: 0.75rem;
		}

		.section-content {
			padding: 1rem;
		}

		.measurement-group {
			padding: 1rem;
		}

		.unit-select {
			min-width: 100px;
			font-size: 0.75rem;
		}

		.voltage-badge {
			font-size: 0.625rem;
			padding: 0.25rem 0.5rem;
		}

		.reference-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
