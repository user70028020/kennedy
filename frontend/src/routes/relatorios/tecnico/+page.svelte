<script lang="ts">
	/**
	 * Relatório Técnico Page
	 * Página para geração de relatórios técnicos por tipo de equipamento
	 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
	 */
	import PhotoCapture, { type Photo } from '$lib/components/reports/PhotoCapture.svelte';
	import EquipmentSelector, { type EquipmentType } from '$lib/components/reports/EquipmentSelector.svelte';
	import DynamicForm from '$lib/components/reports/DynamicForm.svelte';
	import StatusSelector, { type StatusValue } from '$lib/components/reports/StatusSelector.svelte';
	import { auth } from '$lib/stores/auth.svelte';

	const API_URL = 'http://localhost:3000/api';

	// Template options
	type TemplateType = 'nx_energy' | 'sercamp';

	// Form state - Basic info
	let template = $state<TemplateType>('nx_energy');
	let osNumber = $state('');
	let clientName = $state('');
	let location = $state('');
	let reportDate = $state(new Date().toISOString().split('T')[0]);
	let responsible = $state('');
	let observations = $state('');

	// Equipment selection
	let equipmentType = $state<EquipmentType | null>(null);

	// Dynamic form values
	let formValues = $state<Record<string, any>>({});

	// Status selection
	let status = $state<StatusValue>('');

	// Photos
	let photos = $state<Photo[]>([]);

	// UI state
	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);
	let searchingOS = $state(false);

	// OS search functionality
	async function searchOS() {
		if (!osNumber.trim()) {
			error = 'Digite o número da OS para buscar';
			return;
		}

		searchingOS = true;
		error = null;

		try {
			const response = await fetch(`${API_URL}/admin/service-orders?search=${encodeURIComponent(osNumber)}`, {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			});

			if (response.ok) {
				const orders = await response.json();
				if (orders.length > 0) {
					const os = orders[0];
					clientName = os.clientName || '';
					location = os.location || '';
					// Could also populate other fields from OS
				} else {
					error = 'OS não encontrada. Preencha os dados manualmente.';
				}
			}
		} catch (err) {
			console.error('Error searching OS:', err);
			// Silently fail - user can fill manually
		} finally {
			searchingOS = false;
		}
	}

	// Handle equipment type change
	function handleEquipmentChange(type: EquipmentType | null) {
		equipmentType = type;
		// Reset form values when equipment changes
		formValues = {};
	}

	// Form submission
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

		if (!equipmentType) {
			error = 'Selecione o tipo de equipamento';
			return;
		}

		if (!status) {
			error = 'Selecione o status do equipamento';
			return;
		}

		loading = true;

		try {
			// TC/TP usa endpoint específico
			const isTCTP = equipmentType === 'transformador_instrumento';
			const endpoint = isTCTP ? `${API_URL}/reports/tctp` : `${API_URL}/reports/tecnico`;
			
			let requestBody: any;
			
			if (isTCTP) {
				// Mapear dados do TCTPSection para o formato do endpoint
				requestBody = {
					template,
					osNumber,
					clientName,
					location,
					reportDate,
					responsible,
					observations,
					status, // ✅ ADICIONAR STATUS AQUI
					photos, // ✅ ADICIONAR FOTOS AQUI
					// Dados específicos do TC/TP vindos do formValues
					tipo: formValues.tipo || null,
					fabricante: formValues.fabricante || '',
					tipoEquipamento: formValues.tipo_equipamento || '',
					numeroSerieR: formValues.numeroSerieR || '',
					numeroSerieS: formValues.numeroSerieS || '',
					numeroSerieT: formValues.numeroSerieT || '',
					relacao: formValues.relacao || '',
					anoFabricacao: formValues.anoFabricacao || '',
					tensaoNominal: formValues.tensaoNominal || '',
					potenciaNominal: formValues.potenciaNominal || '',
					fatorServico: formValues.fatorServico || '',
					classePrecisao1: formValues.classePrecisao1 || '',
					classePrecisao2: formValues.classePrecisao2 || '',
					classePrecisao3: formValues.classePrecisao3 || '',
					classePrecisao4: formValues.classePrecisao4 || '',
					classePrecisao5: formValues.classePrecisao5 || '',
					verif01: formValues.verif01 || 'I',
					verif02: formValues.verif02 || 'I',
					verif03: formValues.verif03 || 'I',
					verif04: formValues.verif04 || 'I',
					verif05: formValues.verif05 || 'I',
					verif06: formValues.verif06 || 'I',
					tensaoAplicadaEm: formValues.tensaoAplicadaEm || 'primario',
					enrolAplicado: formValues.enrolAplicado || [],
					tensaoAplicada: formValues.tensaoAplicada || [],
					enrolMedido: formValues.enrolMedido || [],
					tensaoMedidaR: formValues.tensaoMedidaR || [],
					tensaoMedidaS: formValues.tensaoMedidaS || [],
					tensaoMedidaT: formValues.tensaoMedidaT || [],
					instrumentoUtilizado: formValues.instrumentoUtilizado || '',
					ensaiosDurante: formValues.ensaiosDurante || '1 minuto',
					temperaturaAmbiente: formValues.temperaturaAmbiente || '',
					umidadeRelativa: formValues.umidadeRelativa || '',
					enrolMedidoIsolamento: formValues.enrolMedidoRes?.filter((v: string) => v) || [],
					conexoesIsolamento: ['AT x Massa', 'AT x Sec', 'Sec x Massa', 'Sec x Massa'],
					tensaoAplicadaIsolamento: ['Vcc', 'Vcc', 'Vcc', 'Vcc'],
					resistIsoR: formValues.resistIsoR || [],
					resistIsoS: formValues.resistIsoS || [],
					resistIsoT: formValues.resistIsoT || [],
					enrolMedidoOhm: formValues.enrolMedidoOhm || [],
					resistOhmR: formValues.resistOhmR || '',
					resistOhmS: formValues.resistOhmS || '',
					resistOhmT: formValues.resistOhmT || '',
					resistOhmExtraR: ['-', '-', '-'],
					resistOhmExtraS: ['-', '-', '-'],
					resistOhmExtraT: ['-', '-', '-'],
					enrolMedidoPol: formValues.enrolMedidoPol || [],
					polaridadeR: formValues.polaridadeR || [],
					polaridadeS: formValues.polaridadeS || [],
					polaridadeT: formValues.polaridadeT || []
				};
			} else {
				// Outros equipamentos usam o formato padrão
				requestBody = {
					template,
					osNumber,
					clientName,
					location,
					reportDate,
					responsible,
					observations,
					equipmentType,
					status,
					formData: formValues,
					photos
				};
			}

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao gerar relatório');
			}

			// Download the generated file
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `relatorio_tecnico_${equipmentType}_${osNumber}_${Date.now()}.docx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			success = true;

			// Reset form after 2 seconds
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
		reportDate = new Date().toISOString().split('T')[0];
		responsible = '';
		observations = '';
		equipmentType = null;
		formValues = {};
		status = '';
		photos = [];
		success = false;
		error = null;
	}

	// Get equipment display name
	function getEquipmentName(type: EquipmentType | null): string {
		if (!type) return '';
		const names: Record<EquipmentType, string> = {
			transformador: 'Transformador',
			transformador_instrumento: 'Transformador para Instrumentos',
			disjuntor: 'Disjuntor',
			para_raio: 'Para-raios',
			rele_protecao: 'Relé de Proteção',
			chave_seccionadora: 'Chave Seccionadora',
			chave_religadora: 'Chave Religadora',
			painel_religador: 'Painel Religador',
			retificador_bateria: 'Retificador de Bateria',
			banco_capacitores: 'Banco de Capacitores',
			cabos: 'Cabos'
		};
		return names[type] || type;
	}
</script>

<div class="max-w-5xl mx-auto animate-in">
	<div class="modern-card">
		<!-- Header do Card -->
		<div class="modern-card-header">
			<div class="modern-card-title">
				<div class="modern-card-title-icon" style="background: var(--gradient-success);">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
					</svg>
				</div>
				Relatório Técnico
			</div>
			<div class="text-sm" style="color: var(--text-muted);">
				Inspeção de Equipamentos
			</div>
		</div>

		<form onsubmit={handleSubmit} class="space-y-8">
			<!-- Section 1: Template Selection -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Template
				</h3>
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
			</section>

			<!-- Section 2: Basic Information -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Informações Básicas
				</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<!-- OS Number with search -->
					<div class="form-group">
						<label for="osNumber" class="modern-label modern-label-required">
							Número da OS
						</label>
						<div class="flex gap-2">
							<input
								id="osNumber"
								type="text"
								bind:value={osNumber}
								required
								class="modern-input flex-1"
								placeholder="Ex: OS-2024-001"
							/>
							<button
								type="button"
								onclick={searchOS}
								disabled={searchingOS}
								class="btn-modern btn-modern-secondary px-3"
								title="Buscar OS"
							>
								{#if searchingOS}
									<svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
								{:else}
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								{/if}
							</button>
						</div>
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

					<!-- Report Date -->
					<div class="form-group">
						<label for="reportDate" class="modern-label">
							Data do Relatório
						</label>
						<input
							id="reportDate"
							type="date"
							bind:value={reportDate}
							class="modern-input"
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
				</div>
			</section>

			<!-- Section 3: Equipment Selection -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Tipo de Equipamento <span style="color: var(--color-danger);">*</span>
				</h3>
				<EquipmentSelector 
					bind:value={equipmentType} 
					required 
					onchange={handleEquipmentChange}
				/>
				{#if equipmentType}
					<p class="mt-3 text-sm" style="color: var(--color-primary);">
						<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style="background-color: rgba(59, 130, 246, 0.1);">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							Equipamento selecionado: {getEquipmentName(equipmentType)}
						</span>
					</p>
				{/if}
			</section>

			<!-- Section 4: Dynamic Form Fields -->
			{#if equipmentType}
				<section>
					<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
						Dados do Equipamento - {getEquipmentName(equipmentType)}
					</h3>
					<DynamicForm 
						{equipmentType} 
						bind:values={formValues}
					/>
				</section>
			{/if}

			<!-- Section 5: Status Selection -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Status do Equipamento <span style="color: var(--color-danger);">*</span>
				</h3>
				<StatusSelector bind:value={status} required />
			</section>

			<!-- Section 6: Photos -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Fotos
				</h3>
				<PhotoCapture bind:photos maxPhotos={30} />
			</section>

			<!-- Error Message -->
			{#if error}
				<div class="modern-alert modern-alert-error animate-in">
					<svg class="modern-alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			<!-- Success Message -->
			{#if success}
				<div class="modern-alert modern-alert-success animate-in">
					<svg class="modern-alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Relatório gerado com sucesso! Download iniciado.</span>
				</div>
			{/if}

			<!-- Submit Buttons -->
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
						<span>Gerar Relatório Técnico</span>
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
