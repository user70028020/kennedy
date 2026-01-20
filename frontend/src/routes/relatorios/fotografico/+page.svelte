<script lang="ts">
	import PhotoCapture, { type Photo } from '$lib/components/reports/PhotoCapture.svelte';
	import { ModernSelect } from '$lib/components/ui';
	import { auth } from '$lib/stores/auth.svelte';

	const API_URL = 'http://localhost:3000/api';

	// Equipment types for dropdown
	const EQUIPMENT_TYPES = [
		{ value: 'transformador', label: 'Transformador' },
		{ value: 'transformador_instrumento', label: 'Transformador para Instrumentos' },
		{ value: 'disjuntor', label: 'Disjuntor' },
		{ value: 'para_raio', label: 'Para-raios' },
		{ value: 'rele_protecao', label: 'Relé de Proteção' },
		{ value: 'chave_seccionadora', label: 'Chave Seccionadora' },
		{ value: 'chave_religadora', label: 'Chave Religadora' },
		{ value: 'painel_religador', label: 'Painel Religador' },
		{ value: 'retificador_bateria', label: 'Retificador de Bateria' },
		{ value: 'banco_capacitores', label: 'Banco de Capacitores' },
		{ value: 'cabos', label: 'Cabos' },
		{ value: 'spda', label: 'SPDA' }
	];

	// Form state
	let template = $state<'nx_energy' | 'sercamp'>('nx_energy');
	let osNumber = $state('');
	let clientName = $state('');
	let location = $state('');
	let equipmentType = $state('');
	let serialNumber = $state('');
	let responsible = $state('');
	let reportDate = $state(new Date().toISOString().split('T')[0]);
	let observations = $state('');
	let photos = $state<Photo[]>([]);

	// UI state
	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		success = false;

		// Validation
		if (!osNumber.trim()) {
			error = 'Número da OS é obrigatório';
			return;
		}

		if (!clientName.trim()) {
			error = 'Nome do cliente é obrigatório';
			return;
		}

		if (photos.length === 0) {
			error = 'Adicione pelo menos uma foto';
			return;
		}

		loading = true;

		try {
			const response = await fetch(`${API_URL}/reports/fotografico`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`
				},
				body: JSON.stringify({
					template,
					osNumber,
					clientName,
					location,
					equipmentType,
					serialNumber,
					responsible,
					reportDate,
					observations,
					photos
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao gerar relatório');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `relatorio_fotografico_${osNumber}_${Date.now()}.docx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			success = true;

			setTimeout(() => {
				resetForm();
			}, 2000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao gerar relatório';
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		template = 'nx_energy';
		osNumber = '';
		clientName = '';
		location = '';
		equipmentType = '';
		serialNumber = '';
		responsible = '';
		reportDate = new Date().toISOString().split('T')[0];
		observations = '';
		photos = [];
		success = false;
		error = null;
	}
</script>

<div class="max-w-5xl mx-auto animate-in">
	<!-- Card Principal -->
	<div class="modern-card">
		<!-- Header do Card -->
		<div class="modern-card-header">
			<div class="modern-card-title">
				<div class="modern-card-title-icon">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				Relatório Fotográfico
			</div>
			<div class="text-sm" style="color: var(--text-muted);">
				Preencha os dados e adicione as fotos
			</div>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Template Selection -->
			<div class="form-group">
				<label class="modern-label">Template</label>
				<div class="radio-group">
					<label class="radio-label">
						<input
							type="radio"
							bind:group={template}
							value="nx_energy"
							class="modern-radio"
						/>
						<span style="color: var(--text-primary);">NX Energy</span>
					</label>
					<label class="radio-label">
						<input
							type="radio"
							bind:group={template}
							value="sercamp"
							class="modern-radio"
						/>
						<span style="color: var(--text-primary);">SERCAMP</span>
					</label>
				</div>
			</div>

			<!-- Grid de Campos -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
				<!-- OS Number -->
				<div class="form-group">
					<label for="osNumber" class="modern-label modern-label-required">
						Número da OS
					</label>
					<input
						id="osNumber"
						type="text"
						bind:value={osNumber}
						required
						class="modern-input"
						placeholder="Ex: OS-2024-001"
					/>
				</div>

				<!-- Client Name -->
				<div class="form-group">
					<label for="clientName" class="modern-label modern-label-required">
						Cliente
					</label>
					<input
						id="clientName"
						type="text"
						bind:value={clientName}
						required
						class="modern-input"
						placeholder="Nome do cliente"
					/>
				</div>

				<!-- Location -->
				<div class="form-group">
					<label for="location" class="modern-label">
						Local
					</label>
					<input
						id="location"
						type="text"
						bind:value={location}
						class="modern-input"
						placeholder="Local da inspeção"
					/>
				</div>

				<!-- Equipment Type (dropdown) -->
				<div class="form-group">
					<label for="equipmentType" class="modern-label">
						Equipamento
					</label>
					<ModernSelect
						id="equipmentType"
						options={EQUIPMENT_TYPES}
						bind:value={equipmentType}
						placeholder="Selecione o equipamento"
					/>
				</div>

				<!-- Serial Number -->
				<div class="form-group">
					<label for="serialNumber" class="modern-label">
						Número de Série
					</label>
					<input
						id="serialNumber"
						type="text"
						bind:value={serialNumber}
						class="modern-input"
						placeholder="Nº de série do equipamento"
					/>
				</div>

				<!-- Responsible -->
				<div class="form-group">
					<label for="responsible" class="modern-label">
						Responsável
					</label>
					<input
						id="responsible"
						type="text"
						bind:value={responsible}
						class="modern-input"
						placeholder="Nome do responsável"
					/>
				</div>

				<!-- Report Date -->
				<div class="form-group">
					<label for="reportDate" class="modern-label">
						Data
					</label>
					<input
						id="reportDate"
						type="date"
						bind:value={reportDate}
						class="modern-input"
					/>
				</div>
			</div>

			<!-- Observations -->
			<div class="form-group">
				<label for="observations" class="modern-label">
					Observações
				</label>
				<textarea
					id="observations"
					bind:value={observations}
					rows="4"
					class="modern-textarea"
					placeholder="Observações gerais sobre a inspeção..."
				></textarea>
			</div>

			<!-- Photo Capture -->
			<div class="form-group">
				<label class="modern-label modern-label-required">
					Fotos
				</label>
				<PhotoCapture bind:photos maxPhotos={30} />
			</div>

			<!-- Messages -->
			{#if error}
				<div class="modern-alert modern-alert-error animate-in">
					<svg class="modern-alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			{#if success}
				<div class="modern-alert modern-alert-success animate-in">
					<svg class="modern-alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Relatório gerado com sucesso! Download iniciado.</span>
				</div>
			{/if}

			<!-- Buttons -->
			<div class="flex flex-col sm:flex-row gap-3 pt-4">
				<button
					type="submit"
					disabled={loading}
					class="btn-modern btn-modern-primary flex-1 py-3.5"
				>
					{#if loading}
						<div class="loading-dots">
							<span></span>
							<span></span>
							<span></span>
						</div>
						<span>Gerando Relatório...</span>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span>Gerar Relatório</span>
					{/if}
				</button>

				<button
					type="button"
					onclick={resetForm}
					disabled={loading}
					class="btn-modern btn-modern-secondary py-3.5 sm:w-auto"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					<span>Limpar</span>
				</button>
			</div>
		</form>
	</div>
</div>
