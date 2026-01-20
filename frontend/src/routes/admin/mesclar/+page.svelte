<script lang="ts">
	import { api } from '$lib/api';
	import { browser } from '$app/environment';

	// Types
	interface Report {
		id: string;
		type: string;
		osNumber: string;
		clientName: string;
		fileName: string;
		fileSize: number;
		template: string;
		createdAt: string;
	}

	interface Template {
		id: string;
		name: string;
		type: 'equipment' | 'merge';
		category: string;
		fileName: string;
	}

	interface ServiceOrder {
		id: string;
		osNumber: string;
		clientName: string;
		teamLeader: string;
		teamMembers: string[];
		location: string;
		periodStart: string;
		periodEnd: string;
	}

	interface Colaborador {
		id: string;
		nome: string;
		funcao: string;
	}

	interface EquipamentoUtilizado {
		nome: string;
		modelo: string;
		numeroSerie: string;
		certificadoCalibracao: string;
	}

	interface ItemInspecionado {
		equipamento: string;
		fabricante: string;
		local: string;
		numeroSerie: string;
		status: 'conforme' | 'corretiva' | 'alerta';
	}

	// State
	let reports = $state<Report[]>([]);
	let templates = $state<Template[]>([]);
	let serviceOrders = $state<ServiceOrder[]>([]);
	let colaboradores = $state<Colaborador[]>([]);
	let loading = $state(true);
	let generating = $state(false);
	let uploadingTemplate = $state(false);
	let error = $state('');
	let success = $state('');

	// Selected items
	let selectedReportIds = $state<string[]>([]);
	let selectedTemplateId = $state('');
	let selectedOsId = $state('');

	// Form data - Header fields
	let formData = $state({
		data: new Date().toISOString().split('T')[0],
		cliente: '',
		tituloServico: '',
		liderEquipe: '',
		logoCliente: '',
		periodo: '',
		numeroOSSercamp: '',
		localizacao: '',
		representanteCliente: '',
		setorCliente: '',
		acompanhantes: [''],
		colaboradoresSelecionados: [] as string[],
		dataIda: '',
		dataVolta: '',
		datasAtividades: '',
		equipamentosUtilizados: [{ nome: '', modelo: '', numeroSerie: '', certificadoCalibracao: '' }] as EquipamentoUtilizado[],
		itensInspecionados: [{ equipamento: '', fabricante: '', local: '', numeroSerie: '', status: 'conforme' as const }] as ItemInspecionado[]
	});

	let initialized = $state(false);

	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			loadData();
		}
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			console.log('🔄 Carregando dados da página de mesclagem...');
			
			const [reportsResponse, templatesData, osData, colaboradoresData] = await Promise.all([
				api.get<{ reports: Report[]; total: number }>('/reports'),
				api.get<Template[]>('/admin/templates?type=merge'),
				api.get<ServiceOrder[]>('/admin/service-orders'),
				api.get<Colaborador[]>('/admin/colaboradores')
			]);
			
			console.log('📊 Relatórios carregados:', reportsResponse.reports?.length || 0);
			console.log('📄 Templates carregados:', templatesData.length);
			console.log('📋 OSs carregadas:', osData.length);
			console.log('👥 Colaboradores carregados:', colaboradoresData.length);
			
			reports = reportsResponse.reports || [];
			templates = templatesData;
			serviceOrders = osData;
			colaboradores = colaboradoresData;
		} catch (err) {
			console.error('❌ Erro ao carregar dados:', err);
			error = err instanceof Error ? err.message : 'Erro ao carregar dados';
		} finally {
			loading = false;
		}
	}

	function handleOsChange() {
		const os = serviceOrders.find(o => o.id === selectedOsId);
		if (os) {
			formData.cliente = os.clientName;
			formData.liderEquipe = os.teamLeader;
			formData.localizacao = os.location;
			formData.numeroOSSercamp = os.osNumber;
			formData.periodo = `${formatDateBR(os.periodStart)} a ${formatDateBR(os.periodEnd)}`;
			formData.dataIda = os.periodStart.split('T')[0];
			formData.dataVolta = os.periodEnd.split('T')[0];
		}
	}

	function toggleReportSelection(reportId: string) {
		if (selectedReportIds.includes(reportId)) {
			selectedReportIds = selectedReportIds.filter(id => id !== reportId);
		} else {
			selectedReportIds = [...selectedReportIds, reportId];
		}
	}

	function selectAllReports() {
		if (selectedReportIds.length === reports.length) {
			selectedReportIds = [];
		} else {
			selectedReportIds = reports.map(r => r.id);
		}
	}

	function toggleColaborador(colaboradorId: string) {
		if (formData.colaboradoresSelecionados.includes(colaboradorId)) {
			formData.colaboradoresSelecionados = formData.colaboradoresSelecionados.filter(id => id !== colaboradorId);
		} else {
			formData.colaboradoresSelecionados = [...formData.colaboradoresSelecionados, colaboradorId];
		}
	}

	function addAcompanhante() {
		formData.acompanhantes = [...formData.acompanhantes, ''];
	}

	function removeAcompanhante(index: number) {
		formData.acompanhantes = formData.acompanhantes.filter((_, i) => i !== index);
	}

	function addEquipamento() {
		formData.equipamentosUtilizados = [...formData.equipamentosUtilizados, { nome: '', modelo: '', numeroSerie: '', certificadoCalibracao: '' }];
	}

	function removeEquipamento(index: number) {
		formData.equipamentosUtilizados = formData.equipamentosUtilizados.filter((_, i) => i !== index);
	}

	function addItemInspecionado() {
		formData.itensInspecionados = [...formData.itensInspecionados, { equipamento: '', fabricante: '', local: '', numeroSerie: '', status: 'conforme' }];
	}

	function removeItemInspecionado(index: number) {
		formData.itensInspecionados = formData.itensInspecionados.filter((_, i) => i !== index);
	}

	async function handleMerge() {
		if (!selectedTemplateId) {
			error = 'Selecione um template de mesclagem';
			return;
		}
		if (selectedReportIds.length === 0) {
			error = 'Selecione pelo menos um relatório';
			return;
		}

		generating = true;
		error = '';
		success = '';

		try {
			const colaboradoresNomes = formData.colaboradoresSelecionados
				.map(id => colaboradores.find(c => c.id === id)?.nome)
				.filter(Boolean) as string[];

			const mergeData = {
				templateId: selectedTemplateId,
				reportIds: selectedReportIds,
				fields: {
					data: formData.data,
					cliente: formData.cliente,
					tituloServico: formData.tituloServico,
					liderEquipe: formData.liderEquipe,
					logoCliente: formData.logoCliente,
					periodo: formData.periodo,
					numeroOSSercamp: formData.numeroOSSercamp,
					localizacao: formData.localizacao,
					representanteCliente: formData.representanteCliente,
					setorCliente: formData.setorCliente,
					acompanhantes: formData.acompanhantes.filter(a => a.trim()),
					colaboradores: colaboradoresNomes,
					dataIda: formData.dataIda,
					dataVolta: formData.dataVolta,
					datasAtividades: formData.datasAtividades,
					equipamentosUtilizados: formData.equipamentosUtilizados.filter(e => e.nome.trim()),
					itensInspecionados: formData.itensInspecionados.filter(i => i.equipamento.trim())
				}
			};

			const response = await api.post<{ fileUrl: string; fileName: string }>('/admin/merge', mergeData);
			window.open(`http://localhost:3000${response.fileUrl}`, '_blank');
			success = 'Documento mesclado gerado com sucesso!';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao gerar documento mesclado';
		} finally {
			generating = false;
		}
	}

	function formatDateBR(dateString: string): string {
		return new Date(dateString).toLocaleDateString('pt-BR');
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function getReportTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			fotografico: 'Fotográfico',
			tecnico: 'Técnico',
			spda: 'SPDA',
			rdo: 'RDO',
			gastos: 'Gastos'
		};
		return labels[type] || type;
	}

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			conforme: 'bg-green-500/20 text-green-400',
			alerta: 'bg-yellow-500/20 text-yellow-400',
			corretiva: 'bg-red-500/20 text-red-400'
		};
		return colors[status] || 'bg-gray-500/20 text-gray-400';
	}

	function getStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			conforme: 'Conforme',
			alerta: 'Alerta',
			corretiva: 'Corretiva'
		};
		return labels[status] || status;
	}

	async function handleTemplateUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (!file) return;

		// Validate file type
		const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
		if (!validTypes.includes(file.type)) {
			error = 'Formato de arquivo inválido. Use PDF ou DOCX.';
			input.value = '';
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			error = 'Arquivo muito grande. Tamanho máximo: 10MB';
			input.value = '';
			return;
		}

		uploadingTemplate = true;
		error = '';
		success = '';

		try {
			// Convert file to base64
			const reader = new FileReader();
			const base64Promise = new Promise<string>((resolve, reject) => {
				reader.onload = () => {
					const result = reader.result as string;
					// Remove data URL prefix (e.g., "data:application/pdf;base64,")
					const base64 = result.split(',')[1];
					resolve(base64);
				};
				reader.onerror = reject;
			});

			reader.readAsDataURL(file);
			const fileData = await base64Promise;

			// Determine file extension
			const extension = file.name.split('.').pop()?.toLowerCase() || '';
			const category = extension === 'pdf' ? 'PDF' : 'DOCX';

			// Create template in database
			const templateData = {
				name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
				type: 'merge',
				category: category,
				fileName: file.name,
				fileData: fileData,
				fileSize: file.size
			};

			const newTemplate = await api.post<Template>('/admin/templates', templateData);
			
			// Add to templates list and select it
			templates = [...templates, newTemplate];
			selectedTemplateId = newTemplate.id;
			
			success = `Template "${file.name}" enviado com sucesso!`;
			input.value = ''; // Clear input
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao enviar template';
			input.value = '';
		} finally {
			uploadingTemplate = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<h1 class="text-2xl font-bold text-theme-primary">Mesclar Relatórios</h1>
			<button
				onclick={loadData}
				disabled={loading}
				class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm"
				style="background-color: var(--bg-secondary); color: var(--text-secondary);"
				title="Recarregar dados"
			>
				{#if loading}
					<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
				{:else}
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
				{/if}
				Atualizar
			</button>
		</div>
		<button
			onclick={handleMerge}
			disabled={generating || selectedReportIds.length === 0 || !selectedTemplateId}
			class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#if generating}
				<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
			{:else}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
			{/if}
			Gerar Documento Mesclado
		</button>
	</div>

	{#if error}
		<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">{error}</div>
	{/if}

	{#if success}
		<div class="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">{success}</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Left Column: Template and Header Fields -->
			<div class="space-y-6">
				<!-- Template Selection -->
				<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
					<h2 class="text-lg font-semibold text-theme-primary mb-4">Template de Mesclagem</h2>
					
					<!-- Template Selector -->
					<select bind:value={selectedTemplateId} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
						<option value="">Selecione um template...</option>
						{#each templates as template}
							<option value={template.id}>{template.name} ({template.category})</option>
						{/each}
					</select>
					
					{#if templates.length === 0}
						<div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-2">
							<p class="text-yellow-400 text-sm font-medium">⚠️ Nenhum template de mesclagem cadastrado</p>
							<p class="text-yellow-300/70 text-xs mt-1">Use o campo abaixo para enviar um template PDF ou DOCX</p>
						</div>
					{:else}
						<p class="text-green-400 text-sm mt-2">✓ {templates.length} template(s) disponível(is)</p>
					{/if}
					
					<!-- Upload New Template -->
					<div class="mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
						<h3 class="text-sm font-medium text-theme-secondary mb-2">Enviar Novo Template</h3>
						<div class="flex items-center gap-2">
							<input 
								type="file" 
								accept=".pdf,.docx" 
								onchange={handleTemplateUpload}
								class="flex-1 text-sm text-theme-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
								style="background-color: var(--bg-input); border: 1px solid var(--border-color);"
							/>
						</div>
						<p class="text-theme-muted text-xs mt-1">Formatos aceitos: PDF, DOCX</p>
						{#if uploadingTemplate}
							<div class="flex items-center gap-2 mt-2 text-blue-400 text-sm">
								<div class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
								Enviando template...
							</div>
						{/if}
					</div>
				</div>

				<!-- OS Selection -->
				<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
					<h2 class="text-lg font-semibold text-theme-primary mb-4">Ordem de Serviço</h2>
					<select bind:value={selectedOsId} onchange={handleOsChange} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
						<option value="">Selecione uma OS (opcional)...</option>
						{#each serviceOrders as os}
							<option value={os.id}>{os.osNumber} - {os.clientName}</option>
						{/each}
					</select>
					<p class="text-theme-muted text-sm mt-2">Selecionar uma OS preenche automaticamente alguns campos</p>
				</div>

				<!-- Header Fields -->
				<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
					<h2 class="text-lg font-semibold text-theme-primary mb-4">Campos do Cabeçalho</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-theme-secondary mb-1">Data</label>
							<input type="date" bind:value={formData.data} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
						</div>
						<div>
							<label class="block text-sm font-medium text-theme-secondary mb-1">Nº OS SERCAMP</label>
							<input type="text" bind:value={formData.numeroOSSercamp} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
						</div>
						<div class="md:col-span-2">
							<label class="block text-sm font-medium text-theme-secondary mb-1">Cliente</label>
							<input type="text" bind:value={formData.cliente} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
						</div>
						<div class="md:col-span-2">
							<label class="block text-sm font-medium text-theme-secondary mb-1">Título do Serviço</label>
							<input type="text" bind:value={formData.tituloServico} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
						</div>
						<div>
							<label class="block text-sm font-medium text-theme-secondary mb-1">Líder da Equipe</label>
							<input type="text" bind:value={formData.liderEquipe} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
						</div>
						<div>
							<label class="block text-sm font-medium text-theme-secondary mb-1">Período</label>
							<input type="text" bind:value={formData.periodo} placeholder="Ex: 01/01/2026 a 15/01/2026" class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
						</div>
					</div>
				</div>
			</div>

			<!-- Right Column: Reports Selection -->
			<div class="space-y-6">
				<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold text-theme-primary">Relatórios Disponíveis</h2>
						{#if reports.length > 0}
							<button onclick={selectAllReports} class="text-sm text-blue-400 hover:text-blue-300">
								{selectedReportIds.length === reports.length ? 'Desmarcar todos' : 'Selecionar todos'}
							</button>
						{/if}
					</div>
					
					{#if reports.length === 0}
						<div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
							<svg class="w-12 h-12 mx-auto mb-3 text-yellow-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<p class="text-yellow-400 font-medium mb-1">Nenhum relatório disponível</p>
							<p class="text-yellow-300/70 text-sm">Gere relatórios primeiro nas páginas de Fotográfico, Técnico, SPDA, RDO ou Gastos</p>
						</div>
					{:else}
						<div class="space-y-2 max-h-96 overflow-y-auto p-1">
							{#each reports as report}
								<label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition {selectedReportIds.includes(report.id) ? 'ring-2 ring-blue-500' : ''}" style="background-color: var(--bg-secondary);">
									<input type="checkbox" checked={selectedReportIds.includes(report.id)} onchange={() => toggleReportSelection(report.id)} class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" style="background-color: var(--bg-input); border-color: var(--border-color);" />
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2">
											<span class="text-theme-primary font-medium truncate">{report.fileName}</span>
											<span class="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">{getReportTypeLabel(report.type)}</span>
										</div>
										<div class="text-theme-muted text-sm">OS: {report.osNumber} | {report.clientName} | {formatDateBR(report.createdAt)}</div>
									</div>
								</label>
							{/each}
						</div>
					{/if}
					
					<div class="mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
						<p class="text-theme-muted text-sm">{selectedReportIds.length} relatório(s) selecionado(s)</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Location and Client Data -->
		<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
			<h2 class="text-lg font-semibold text-theme-primary mb-4">Localização e Dados do Cliente</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div class="lg:col-span-2">
					<label class="block text-sm font-medium text-theme-secondary mb-1">Localização</label>
					<input type="text" bind:value={formData.localizacao} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
				</div>
				<div>
					<label class="block text-sm font-medium text-theme-secondary mb-1">Setor do Cliente</label>
					<input type="text" bind:value={formData.setorCliente} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
				</div>
				<div>
					<label class="block text-sm font-medium text-theme-secondary mb-1">Representante do Cliente</label>
					<input type="text" bind:value={formData.representanteCliente} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
				</div>
				<div>
					<label class="block text-sm font-medium text-theme-secondary mb-1">Data Ida</label>
					<input type="date" bind:value={formData.dataIda} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
				</div>
				<div>
					<label class="block text-sm font-medium text-theme-secondary mb-1">Data Volta</label>
					<input type="date" bind:value={formData.dataVolta} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
				</div>
				<div class="md:col-span-2 lg:col-span-3">
					<label class="block text-sm font-medium text-theme-secondary mb-1">Datas das Atividades</label>
					<input type="text" bind:value={formData.datasAtividades} placeholder="Ex: 02/01/2026 a 14/01/2026" class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
				</div>
			</div>
		</div>

		<!-- Acompanhantes -->
		<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-theme-primary">Acompanhantes</h2>
				<button onclick={addAcompanhante} class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
					Adicionar
				</button>
			</div>
			<div class="space-y-2">
				{#each formData.acompanhantes as _, index}
					<div class="flex items-center gap-2">
						<input type="text" bind:value={formData.acompanhantes[index]} placeholder="Nome do acompanhante" class="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
						{#if formData.acompanhantes.length > 1}
							<button onclick={() => removeAcompanhante(index)} class="p-2 text-red-400 hover:text-red-300">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Colaboradores -->
		<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
			<h2 class="text-lg font-semibold text-theme-primary mb-4">Colaboradores</h2>
			{#if colaboradores.length === 0}
				<p class="text-theme-muted">Nenhum colaborador cadastrado</p>
			{:else}
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
					{#each colaboradores as colaborador}
						<label class="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition {formData.colaboradoresSelecionados.includes(colaborador.id) ? 'ring-2 ring-blue-500' : ''}" style="background-color: var(--bg-secondary);">
							<input type="checkbox" checked={formData.colaboradoresSelecionados.includes(colaborador.id)} onchange={() => toggleColaborador(colaborador.id)} class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" style="background-color: var(--bg-input); border-color: var(--border-color);" />
							<div class="min-w-0">
								<p class="text-theme-primary text-sm truncate">{colaborador.nome}</p>
								<p class="text-theme-muted text-xs truncate">{colaborador.funcao}</p>
							</div>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Equipamentos Utilizados -->
		<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-theme-primary">Equipamentos Utilizados</h2>
				<button onclick={addEquipamento} class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
					Adicionar
				</button>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="text-left text-theme-muted text-sm" style="border-bottom: 1px solid var(--border-color);">
							<th class="pb-2">Nome</th>
							<th class="pb-2">Modelo</th>
							<th class="pb-2">Nº Série</th>
							<th class="pb-2">Certificado Calibração</th>
							<th class="pb-2 w-10"></th>
						</tr>
					</thead>
					<tbody class="divide-y" style="border-color: var(--border-color);">
						{#each formData.equipamentosUtilizados as _, index}
							<tr>
								<td class="py-2 pr-2"><input type="text" bind:value={formData.equipamentosUtilizados[index].nome} class="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" /></td>
								<td class="py-2 pr-2"><input type="text" bind:value={formData.equipamentosUtilizados[index].modelo} class="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" /></td>
								<td class="py-2 pr-2"><input type="text" bind:value={formData.equipamentosUtilizados[index].numeroSerie} class="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" /></td>
								<td class="py-2 pr-2"><input type="text" bind:value={formData.equipamentosUtilizados[index].certificadoCalibracao} class="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" /></td>
								<td class="py-2">
									{#if formData.equipamentosUtilizados.length > 1}
										<button onclick={() => removeEquipamento(index)} class="p-1 text-red-400 hover:text-red-300">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
										</button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Itens Inspecionados -->
		<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-theme-primary">Itens Inspecionados</h2>
				<button onclick={addItemInspecionado} class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
					Adicionar
				</button>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="text-left text-theme-muted text-sm" style="border-bottom: 1px solid var(--border-color);">
							<th class="pb-2">Equipamento</th>
							<th class="pb-2">Fabricante</th>
							<th class="pb-2">Local</th>
							<th class="pb-2">Nº Série</th>
							<th class="pb-2">Status</th>
							<th class="pb-2 w-10"></th>
						</tr>
					</thead>
					<tbody class="divide-y" style="border-color: var(--border-color);">
						{#each formData.itensInspecionados as _, index}
							<tr>
								<td class="py-2 pr-2"><input type="text" bind:value={formData.itensInspecionados[index].equipamento} class="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" /></td>
								<td class="py-2 pr-2"><input type="text" bind:value={formData.itensInspecionados[index].fabricante} class="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" /></td>
								<td class="py-2 pr-2"><input type="text" bind:value={formData.itensInspecionados[index].local} class="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" /></td>
								<td class="py-2 pr-2"><input type="text" bind:value={formData.itensInspecionados[index].numeroSerie} class="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" /></td>
								<td class="py-2 pr-2">
									<select bind:value={formData.itensInspecionados[index].status} class="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
										<option value="conforme">Conforme</option>
										<option value="alerta">Alerta</option>
										<option value="corretiva">Corretiva</option>
									</select>
								</td>
								<td class="py-2">
									{#if formData.itensInspecionados.length > 1}
										<button onclick={() => removeItemInspecionado(index)} class="p-1 text-red-400 hover:text-red-300">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
										</button>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

