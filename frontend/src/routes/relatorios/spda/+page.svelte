<script lang="ts">
	/**
	 * Relatório SPDA Page
	 * Página para geração de relatórios de Sistema de Proteção contra Descargas Atmosféricas
	 * Baseado 1:1 no PROJETO NEXT JS FOD/components/spda-report.tsx
	 */
	import PhotoCapture, { type Photo } from '$lib/components/reports/PhotoCapture.svelte';
	import { auth } from '$lib/stores/auth.svelte';
	import { browser } from '$app/environment';

	const API_URL = 'http://localhost:3000/api';

	// Status options
	type SPDAStatus = 'APROVADO' | 'REPROVADO' | 'REVISÃO' | '';
	const STATUS_OPTIONS: { value: SPDAStatus; label: string }[] = [
		{ value: 'APROVADO', label: 'Aprovado' },
		{ value: 'REPROVADO', label: 'Reprovado' },
		{ value: 'REVISÃO', label: 'Revisão' }
	];

	// Measurement point interface
	interface MeasurementPoint {
		id: string;
		number: number;
		value: string;
		photo: Photo | null;
	}

	// Inspection status type
	type InspectionStatus = 'OK' | 'NC' | 'NA' | '';

	// Form state - CAMPOS BÁSICOS
	let template = $state<'nx_energy' | 'sercamp'>('nx_energy');
	let osNumber = $state('');
	let clientName = $state('');
	let reportDate = $state(new Date().toISOString().split('T')[0]);
	let responsible = $state('');

	// TIPO DE SPDA (checkboxes múltiplos)
	let tipoSpdaFranklin = $state(false);
	let tipoSpdaGaiola = $state(false);
	let tipoSpdaEsfera = $state(false);
	let tipoSpdaEstrutural = $state(false);
	let tipoSpdaNaoEstrutural = $state(false);

	// EQUIPAMENTO DE MEDIÇÃO (checkboxes múltiplos)
	let equipTermometroDigital = $state(false);
	let equipAlicateTermometro = $state(false);

	// INSPEÇÕES GERAIS (OK/NC/NA)
	let inspecaoProjetoSpda = $state<InspectionStatus>('');
	let inspecaoIntegridadeCondutores = $state<InspectionStatus>('');
	let inspecaoSubsistemaCaptacao = $state<InspectionStatus>('');
	let inspecaoSubsistemaCondutores = $state<InspectionStatus>('');
	let inspecaoCaixaInspecao = $state<InspectionStatus>('');
	let inspecaoSubsistemaConexoes = $state<InspectionStatus>('');
	let inspecaoIsoladores = $state<InspectionStatus>('');
	let inspecaoCondicaoEquipotencializacoes = $state<InspectionStatus>('');
	let inspecaoEletrodutoPcv = $state<InspectionStatus>('');
	let inspecaoSubsistemaAterramento = $state<InspectionStatus>('');
	let inspecaoPontoRuptura = $state<'SIM' | 'NÃO' | ''>('');

	// PONTOS DE MEDIÇÃO
	let measurementPoints = $state<MeasurementPoint[]>([]);

	// CROQUI
	let sketchData = $state<string | null>(null);

	// STATUS E CONCLUSÃO
	let status = $state<SPDAStatus>('');
	let conclusao = $state('');

	// UI state
	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);
	let searchingOS = $state(false);

	// Canvas for sketch
	let sketchCanvas: HTMLCanvasElement;
	let isDrawing = $state(false);
	let ctx: CanvasRenderingContext2D | null = null;

	// Initialize canvas - Svelte action
	function initCanvas(node: HTMLCanvasElement) {
		if (!browser) return {};
		ctx = node.getContext('2d');
		if (ctx) {
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2;
			ctx.lineCap = 'round';
			ctx.fillStyle = '#1f2937';
			ctx.fillRect(0, 0, node.width, node.height);
		}
		return {};
	}

	// Canvas drawing functions
	function startDrawing(e: MouseEvent | TouchEvent) {
		if (!ctx) return;
		isDrawing = true;
		const pos = getPosition(e);
		ctx.beginPath();
		ctx.moveTo(pos.x, pos.y);
	}

	function draw(e: MouseEvent | TouchEvent) {
		if (!isDrawing || !ctx) return;
		const pos = getPosition(e);
		ctx.lineTo(pos.x, pos.y);
		ctx.stroke();
	}

	function stopDrawing() {
		isDrawing = false;
		saveSketch();
	}

	function getPosition(e: MouseEvent | TouchEvent): { x: number; y: number } {
		const rect = sketchCanvas.getBoundingClientRect();
		// Calculate scale factor between canvas internal size and displayed size
		const scaleX = sketchCanvas.width / rect.width;
		const scaleY = sketchCanvas.height / rect.height;
		
		if ('touches' in e) {
			return {
				x: (e.touches[0].clientX - rect.left) * scaleX,
				y: (e.touches[0].clientY - rect.top) * scaleY
			};
		}
		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY
		};
	}

	function clearSketch() {
		if (ctx) {
			ctx.fillStyle = '#1f2937';
			ctx.fillRect(0, 0, sketchCanvas.width, sketchCanvas.height);
			sketchData = null;
		}
	}

	function saveSketch() {
		if (sketchCanvas) {
			sketchData = sketchCanvas.toDataURL('image/png');
		}
	}

	// Measurement points functions
	function addMeasurementPoint() {
		const newPoint: MeasurementPoint = {
			id: `point_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
			number: measurementPoints.length + 1,
			value: '',
			photo: null
		};
		measurementPoints = [...measurementPoints, newPoint];
	}

	function removeMeasurementPoint(id: string) {
		measurementPoints = measurementPoints.filter(p => p.id !== id);
		// Renumber remaining points
		measurementPoints = measurementPoints.map((p, idx) => ({ ...p, number: idx + 1 }));
	}

	function updatePointValue(id: string, value: string) {
		measurementPoints = measurementPoints.map(p => 
			p.id === id ? { ...p, value } : p
		);
	}

	// Handle photo for measurement point
	async function handlePointPhoto(pointId: string, event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			const base64 = await fileToBase64(file);
			const photo: Photo = {
				id: `photo_${Date.now()}`,
				data: base64,
				name: file.name,
				description: ''
			};
			measurementPoints = measurementPoints.map(p =>
				p.id === pointId ? { ...p, photo } : p
			);
		} catch (err) {
			console.error('Error reading file:', err);
		}
		target.value = '';
	}

	function removePointPhoto(pointId: string) {
		measurementPoints = measurementPoints.map(p =>
			p.id === pointId ? { ...p, photo: null } : p
		);
	}

	function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	// Toggle protection method
	function toggleMethod(methodId: string) {
		if (selectedMethods.includes(methodId)) {
			selectedMethods = selectedMethods.filter(m => m !== methodId);
		} else {
			selectedMethods = [...selectedMethods, methodId];
		}
	}

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
				} else {
					error = 'OS não encontrada. Preencha os dados manualmente.';
				}
			}
		} catch (err) {
			console.error('Error searching OS:', err);
		} finally {
			searchingOS = false;
		}
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

		if (!status) {
			error = 'Selecione o status do SPDA';
			return;
		}

		// Validar tipo de SPDA
		const hasTipoSpda = tipoSpdaFranklin || tipoSpdaGaiola || tipoSpdaEsfera || tipoSpdaEstrutural || tipoSpdaNaoEstrutural;
		if (!hasTipoSpda) {
			error = 'Selecione pelo menos um tipo de SPDA';
			return;
		}

		// Validar pontos de medição
		if (measurementPoints.length === 0) {
			error = 'Adicione pelo menos um ponto de medição';
			return;
		}

		const incompletePoints = measurementPoints.filter(p => !p.value || !p.photo);
		if (incompletePoints.length > 0) {
			error = `Complete os pontos de medição: ${incompletePoints.map(p => p.number).join(', ')}`;
			return;
		}

		loading = true;

		try {
			// Montar array de tipos de SPDA
			const tipoSpdaArray: string[] = [];
			if (tipoSpdaFranklin) tipoSpdaArray.push('Método de Franklin');
			if (tipoSpdaGaiola) tipoSpdaArray.push('Método Gaiola de Faraday ou Malha');
			if (tipoSpdaEsfera) tipoSpdaArray.push('Método da esfera rolante');
			if (tipoSpdaEstrutural) tipoSpdaArray.push('SPDA Estrutural');
			if (tipoSpdaNaoEstrutural) tipoSpdaArray.push('SPDA Não Estrutural');

			// Montar array de equipamentos
			const equipamentoArray: string[] = [];
			if (equipTermometroDigital) equipamentoArray.push('Termômetro Digital');
			if (equipAlicateTermometro) equipamentoArray.push('Alicate Termômetro');

			const requestBody = {
				template,
				ordem_servico: osNumber,
				cliente: clientName,
				data: reportDate,
				equipe_tecnica: responsible,
				status,
				tipo_spda: tipoSpdaArray,
				equipamento_medicao: equipamentoArray,
				// Inspeções
				projeto_spda: inspecaoProjetoSpda || undefined,
				integridade_condutores: inspecaoIntegridadeCondutores || undefined,
				subsistema_captacao: inspecaoSubsistemaCaptacao || undefined,
				subsistema_condutores: inspecaoSubsistemaCondutores || undefined,
				caixa_inspecao: inspecaoCaixaInspecao || undefined,
				subsistema_conexoes: inspecaoSubsistemaConexoes || undefined,
				isoladores: inspecaoIsoladores || undefined,
				condicao_equipotencializacoes: inspecaoCondicaoEquipotencializacoes || undefined,
				eletroduto_pcv: inspecaoEletrodutoPcv || undefined,
				subsistema_aterramento: inspecaoSubsistemaAterramento || undefined,
				ponto_ruptura: inspecaoPontoRuptura || undefined,
				// Pontos de medição
				pontos: measurementPoints.map(p => ({
					id: p.id,
					number: String(p.number).padStart(2, '0'),
					valor: p.value,
					foto: p.photo?.data || '',
					nFoto: String(p.number).padStart(2, '0')
				})),
				// Croqui
				croqui: sketchData || undefined,
				// Conclusão
				conclusao_observacoes: conclusao
			};

			// DEBUG: Log dos dados que serão enviados
			console.log('=== DADOS ENVIADOS PARA O BACKEND ===');
			console.log('subsistema_condutores:', requestBody.subsistema_condutores);
			console.log('subsistema_conexoes:', requestBody.subsistema_conexoes);
			console.log('condicao_equipotencializacoes:', requestBody.condicao_equipotencializacoes);
			console.log('=====================================');

			const response = await fetch(`${API_URL}/reports/spda`, {
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
			a.download = `relatorio_spda_${osNumber}_${Date.now()}.docx`;
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
		reportDate = new Date().toISOString().split('T')[0];
		responsible = '';
		tipoSpdaFranklin = false;
		tipoSpdaGaiola = false;
		tipoSpdaEsfera = false;
		tipoSpdaEstrutural = false;
		tipoSpdaNaoEstrutural = false;
		equipTermometroDigital = false;
		equipAlicateTermometro = false;
		inspecaoProjetoSpda = '';
		inspecaoIntegridadeCondutores = '';
		inspecaoSubsistemaCaptacao = '';
		inspecaoSubsistemaCondutores = '';
		inspecaoCaixaInspecao = '';
		inspecaoSubsistemaConexoes = '';
		inspecaoIsoladores = '';
		inspecaoCondicaoEquipotencializacoes = '';
		inspecaoEletrodutoPcv = '';
		inspecaoSubsistemaAterramento = '';
		inspecaoPontoRuptura = '';
		measurementPoints = [];
		sketchData = null;
		status = '';
		conclusao = '';
		success = false;
		error = null;
		clearSketch();
	}
</script>


<div class="max-w-5xl mx-auto animate-in">
	<div class="modern-card">
		<!-- Header do Card -->
		<div class="modern-card-header">
			<div class="modern-card-title">
				<div class="modern-card-title-icon" style="background: var(--gradient-warning);">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				Relatório SPDA
			</div>
			<div class="text-sm" style="color: var(--text-muted);">
				Sistema de Proteção contra Descargas Atmosféricas
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
							Equipe Técnica
						</label>
						<input
							id="responsible"
							type="text"
							bind:value={responsible}
							class="modern-input"
							placeholder="Nome1 | Nome2 | Nome3"
						/>
					</div>
				</div>
			</section>

			<!-- Section 3: Tipo de SPDA -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Tipo de SPDA <span style="color: var(--color-danger);">*</span>
				</h3>
				<div class="space-y-3">
					<label class="checkbox-label cursor-pointer" style="background-color: {tipoSpdaFranklin ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)'}; border-color: {tipoSpdaFranklin ? 'var(--color-primary)' : 'transparent'};">
						<input type="checkbox" bind:checked={tipoSpdaFranklin} class="modern-checkbox" />
						<span class="text-sm" style="color: var(--text-primary);">Método de Franklin</span>
					</label>
					<label class="checkbox-label cursor-pointer" style="background-color: {tipoSpdaGaiola ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)'}; border-color: {tipoSpdaGaiola ? 'var(--color-primary)' : 'transparent'};">
						<input type="checkbox" bind:checked={tipoSpdaGaiola} class="modern-checkbox" />
						<span class="text-sm" style="color: var(--text-primary);">Método Gaiola de Faraday ou Malha</span>
					</label>
					<label class="checkbox-label cursor-pointer" style="background-color: {tipoSpdaEsfera ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)'}; border-color: {tipoSpdaEsfera ? 'var(--color-primary)' : 'transparent'};">
						<input type="checkbox" bind:checked={tipoSpdaEsfera} class="modern-checkbox" />
						<span class="text-sm" style="color: var(--text-primary);">Método da esfera rolante</span>
					</label>
					<label class="checkbox-label cursor-pointer" style="background-color: {tipoSpdaEstrutural ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)'}; border-color: {tipoSpdaEstrutural ? 'var(--color-primary)' : 'transparent'};">
						<input type="checkbox" bind:checked={tipoSpdaEstrutural} class="modern-checkbox" />
						<span class="text-sm" style="color: var(--text-primary);">SPDA Estrutural</span>
					</label>
					<label class="checkbox-label cursor-pointer" style="background-color: {tipoSpdaNaoEstrutural ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)'}; border-color: {tipoSpdaNaoEstrutural ? 'var(--color-primary)' : 'transparent'};">
						<input type="checkbox" bind:checked={tipoSpdaNaoEstrutural} class="modern-checkbox" />
						<span class="text-sm" style="color: var(--text-primary);">SPDA Não Estrutural</span>
					</label>
				</div>
			</section>

			<!-- Section 4: Equipamento de Medição -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Equipamento de Medição
				</h3>
				<div class="space-y-3">
					<label class="checkbox-label cursor-pointer" style="background-color: {equipTermometroDigital ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)'}; border-color: {equipTermometroDigital ? 'var(--color-primary)' : 'transparent'};">
						<input type="checkbox" bind:checked={equipTermometroDigital} class="modern-checkbox" />
						<span class="text-sm" style="color: var(--text-primary);">Termômetro Digital</span>
					</label>
					<label class="checkbox-label cursor-pointer" style="background-color: {equipAlicateTermometro ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)'}; border-color: {equipAlicateTermometro ? 'var(--color-primary)' : 'transparent'};">
						<input type="checkbox" bind:checked={equipAlicateTermometro} class="modern-checkbox" />
						<span class="text-sm" style="color: var(--text-primary);">Alicate Termômetro</span>
					</label>
				</div>
			</section>

			<!-- Section 5: Inspeções Gerais (OK/NC/NA) -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Inspeções Gerais
				</h3>
				<div class="space-y-4">
					<!-- Projeto SPDA -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Projeto SPDA</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoProjetoSpda = 'OK'} class="inspection-btn" class:active={inspecaoProjetoSpda === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoProjetoSpda = 'NC'} class="inspection-btn" class:active={inspecaoProjetoSpda === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoProjetoSpda = 'NA'} class="inspection-btn" class:active={inspecaoProjetoSpda === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Integridade física dos condutores -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Integridade física dos condutores</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoIntegridadeCondutores = 'OK'} class="inspection-btn" class:active={inspecaoIntegridadeCondutores === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoIntegridadeCondutores = 'NC'} class="inspection-btn" class:active={inspecaoIntegridadeCondutores === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoIntegridadeCondutores = 'NA'} class="inspection-btn" class:active={inspecaoIntegridadeCondutores === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Subsistema de Captação -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Subsistema de Captação</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoSubsistemaCaptacao = 'OK'} class="inspection-btn" class:active={inspecaoSubsistemaCaptacao === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoSubsistemaCaptacao = 'NC'} class="inspection-btn" class:active={inspecaoSubsistemaCaptacao === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoSubsistemaCaptacao = 'NA'} class="inspection-btn" class:active={inspecaoSubsistemaCaptacao === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Subsistema de Descida: CONDUTORES -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Subsistema de Descida: CONDUTORES</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoSubsistemaCondutores = 'OK'} class="inspection-btn" class:active={inspecaoSubsistemaCondutores === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoSubsistemaCondutores = 'NC'} class="inspection-btn" class:active={inspecaoSubsistemaCondutores === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoSubsistemaCondutores = 'NA'} class="inspection-btn" class:active={inspecaoSubsistemaCondutores === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Caixa de inspeção -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Caixa de inspeção</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoCaixaInspecao = 'OK'} class="inspection-btn" class:active={inspecaoCaixaInspecao === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoCaixaInspecao = 'NC'} class="inspection-btn" class:active={inspecaoCaixaInspecao === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoCaixaInspecao = 'NA'} class="inspection-btn" class:active={inspecaoCaixaInspecao === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Subsistema de Descida: CONEXÕES -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Subsistema de Descida: CONEXÕES</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoSubsistemaConexoes = 'OK'} class="inspection-btn" class:active={inspecaoSubsistemaConexoes === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoSubsistemaConexoes = 'NC'} class="inspection-btn" class:active={inspecaoSubsistemaConexoes === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoSubsistemaConexoes = 'NA'} class="inspection-btn" class:active={inspecaoSubsistemaConexoes === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Isoladores -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Isoladores</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoIsoladores = 'OK'} class="inspection-btn" class:active={inspecaoIsoladores === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoIsoladores = 'NC'} class="inspection-btn" class:active={inspecaoIsoladores === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoIsoladores = 'NA'} class="inspection-btn" class:active={inspecaoIsoladores === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Condição das Equipotencializações -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Condição das Equipotencializações</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoCondicaoEquipotencializacoes = 'OK'} class="inspection-btn" class:active={inspecaoCondicaoEquipotencializacoes === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoCondicaoEquipotencializacoes = 'NC'} class="inspection-btn" class:active={inspecaoCondicaoEquipotencializacoes === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoCondicaoEquipotencializacoes = 'NA'} class="inspection-btn" class:active={inspecaoCondicaoEquipotencializacoes === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Eletroduto de PCV -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Eletroduto de PCV</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoEletrodutoPcv = 'OK'} class="inspection-btn" class:active={inspecaoEletrodutoPcv === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoEletrodutoPcv = 'NC'} class="inspection-btn" class:active={inspecaoEletrodutoPcv === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoEletrodutoPcv = 'NA'} class="inspection-btn" class:active={inspecaoEletrodutoPcv === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Subsistema de Aterramento -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Subsistema de Aterramento</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoSubsistemaAterramento = 'OK'} class="inspection-btn" class:active={inspecaoSubsistemaAterramento === 'OK'} style="--btn-color: var(--color-success);">OK</button>
							<button type="button" onclick={() => inspecaoSubsistemaAterramento = 'NC'} class="inspection-btn" class:active={inspecaoSubsistemaAterramento === 'NC'} style="--btn-color: var(--color-danger);">NC</button>
							<button type="button" onclick={() => inspecaoSubsistemaAterramento = 'NA'} class="inspection-btn" class:active={inspecaoSubsistemaAterramento === 'NA'} style="--btn-color: var(--color-warning);">NA</button>
						</div>
					</div>

					<!-- Ponto de ruptura (SIM/NÃO) -->
					<div class="inspection-row">
						<label class="text-sm font-medium" style="color: var(--text-primary);">Identificado algum ponto de ruptura?</label>
						<div class="inspection-buttons">
							<button type="button" onclick={() => inspecaoPontoRuptura = 'SIM'} class="inspection-btn" class:active={inspecaoPontoRuptura === 'SIM'} style="--btn-color: var(--color-danger);">SIM</button>
							<button type="button" onclick={() => inspecaoPontoRuptura = 'NÃO'} class="inspection-btn" class:active={inspecaoPontoRuptura === 'NÃO'} style="--btn-color: var(--color-success);">NÃO</button>
						</div>
					</div>
				</div>
			</section>

			<!-- Section 6: Measurement Points -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Pontos de Medição <span style="color: var(--color-danger);">*</span>
				</h3>
				
				<div class="space-y-4">
					{#each measurementPoints as point (point.id)}
						<div class="p-4 rounded-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
							<div class="flex items-start gap-4">
								<div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: var(--gradient-primary);">
									{point.number}
								</div>
								
								<div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="form-group">
										<label for="point-value-{point.id}" class="modern-label">
											Valor da Medição (Ω)
										</label>
										<input
											id="point-value-{point.id}"
											type="text"
											value={point.value}
											oninput={(e) => updatePointValue(point.id, e.currentTarget.value)}
											class="modern-input"
											placeholder="Ex: 5.2"
										/>
									</div>
									
									<div class="form-group">
										<span class="modern-label">
											Foto do Ponto
										</span>
										{#if point.photo}
											<div class="flex items-center gap-2 p-2 rounded-lg" style="background-color: var(--bg-tertiary);">
												<img src={point.photo.data} alt="Ponto {point.number}" class="w-16 h-16 object-cover rounded-lg" />
												<button
													type="button"
													onclick={() => removePointPhoto(point.id)}
													class="p-1.5 rounded-lg transition-colors"
													style="color: var(--color-danger);"
													title="Remover foto"
												>
													<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
													</svg>
												</button>
											</div>
										{:else}
											<label class="flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200" style="background-color: var(--bg-tertiary); border: 2px dashed var(--border-color); color: var(--text-muted);">
												<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
												<span class="text-sm">Adicionar foto</span>
												<input
													type="file"
													accept="image/*"
													onchange={(e) => handlePointPhoto(point.id, e)}
													class="hidden"
												/>
											</label>
										{/if}
									</div>
								</div>
								
								<button
									type="button"
									onclick={() => removeMeasurementPoint(point.id)}
									class="p-2 rounded-lg transition-all duration-200"
									style="color: var(--color-danger);"
									title="Remover ponto"
								>
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>
					{/each}
					
					<button
						type="button"
						onclick={addMeasurementPoint}
						class="w-full py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
						style="border: 2px dashed var(--border-color); color: var(--text-muted); background-color: transparent;"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Adicionar Ponto de Medição
					</button>
				</div>
			</section>


			<!-- Section 7: Sketch/Croqui -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Croqui / Desenho
				</h3>
				<div class="p-4 rounded-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
					<p class="text-sm mb-3" style="color: var(--text-muted);">
						Desenhe o croqui do sistema SPDA (opcional)
					</p>
					<div class="relative">
						<canvas
							bind:this={sketchCanvas}
							width="600"
							height="400"
							class="w-full rounded-xl cursor-crosshair touch-none"
							style="border: 1px solid var(--border-color);"
							onmousedown={startDrawing}
							onmousemove={draw}
							onmouseup={stopDrawing}
							onmouseleave={stopDrawing}
							ontouchstart={startDrawing}
							ontouchmove={draw}
							ontouchend={stopDrawing}
							use:initCanvas
						></canvas>
					</div>
					<div class="flex gap-3 mt-4">
						<button
							type="button"
							onclick={clearSketch}
							class="btn-modern btn-modern-secondary"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							Limpar Desenho
						</button>
						{#if sketchData}
							<span class="flex items-center text-sm" style="color: var(--color-success);">
								<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
								</svg>
								Croqui salvo
							</span>
						{/if}
					</div>
				</div>
			</section>

			<!-- Section 8: Status -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Status do SPDA <span style="color: var(--color-danger);">*</span>
				</h3>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{#each STATUS_OPTIONS as option}
						<button
							type="button"
							onclick={() => status = option.value}
							class="relative p-4 rounded-xl transition-all duration-200"
							style="background-color: {status === option.value ? (option.value === 'APROVADO' ? 'rgba(16, 185, 129, 0.15)' : option.value === 'REPROVADO' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)') : 'var(--bg-secondary)'}; border: 2px solid {status === option.value ? (option.value === 'APROVADO' ? 'var(--color-success)' : option.value === 'REPROVADO' ? 'var(--color-danger)' : 'var(--color-warning)') : 'var(--border-color)'}; color: {status === option.value ? (option.value === 'APROVADO' ? 'var(--color-success)' : option.value === 'REPROVADO' ? 'var(--color-danger)' : 'var(--color-warning)') : 'var(--text-secondary)'};"
						>
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full" style="background-color: {option.value === 'APROVADO' ? 'var(--color-success)' : option.value === 'REPROVADO' ? 'var(--color-danger)' : 'var(--color-warning)'};"></div>
								<span class="font-medium">{option.label}</span>
							</div>
							
							{#if status === option.value}
								<div class="absolute top-2 right-2">
									<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
									</svg>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</section>

			<!-- Section 9: Conclusão -->
			<section>
				<h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
					Conclusão / Observações / Recomendações
				</h3>
				<textarea
					bind:value={conclusao}
					rows="4"
					class="modern-textarea"
					placeholder="Conclusão técnica sobre o sistema SPDA..."
				></textarea>
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
					<span>Relatório SPDA gerado com sucesso! Download iniciado.</span>
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
						<span>Gerar Relatório SPDA</span>
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


<style>
	.inspection-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem;
		border-radius: 0.75rem;
		background-color: var(--bg-secondary);
		border: 1px solid var(--border-color);
	}

	.inspection-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.inspection-btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: 2px solid var(--border-color);
		background-color: var(--bg-tertiary);
		color: var(--text-secondary);
		transition: all 0.2s;
		cursor: pointer;
	}

	.inspection-btn:hover {
		border-color: var(--btn-color);
		color: var(--btn-color);
	}

	.inspection-btn.active {
		border-color: var(--btn-color);
		background-color: var(--btn-color);
		color: white;
	}
</style>
