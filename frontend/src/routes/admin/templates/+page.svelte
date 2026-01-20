<script lang="ts">
	import { api } from '$lib/api';
	import { browser } from '$app/environment';
	import { fadeIn, staggerIn } from '$lib/utils/animations';

	interface Template {
		id: string;
		name: string;
		type: 'equipment' | 'merge';
		category: string;
		fileName: string;
		fileSize: number;
		createdAt: string;
		updatedAt: string;
	}

	let templates = $state<Template[]>([]);
	let loading = $state(true);
	let error = $state('');
	let showModal = $state(false);
	let editingTemplate = $state<Template | null>(null);
	let saving = $state(false);
	let uploading = $state(false);

	// Refs for animations
	let pageContainer: HTMLElement;
	let gridItems: HTMLElement[] = [];

	// Filters
	let searchTerm = $state('');
	let typeFilter = $state('');
	let categoryFilter = $state('');

	// Form data
	let formData = $state({
		name: '',
		type: 'equipment' as 'equipment' | 'merge',
		category: '',
		fileName: '',
		fileData: '',
		fileSize: 0
	});

	const equipmentCategories = [
		'Transformador',
		'Transformador para Instrumentos',
		'Disjuntor',
		'Para-raios',
		'Relé de Proteção',
		'Chave Seccionadora',
		'Chave Religadora',
		'Painel Religador',
		'Retificador de Bateria',
		'Banco de Capacitores',
		'Cabos',
		'SPDA',
		'Fotográfico',
		'RDO',
		'Gastos'
	];

	const mergeCategories = ['Relatório Consolidado', 'Relatório Final', 'Outros'];

	let initialized = $state(false);

	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			if (pageContainer) {
				fadeIn(pageContainer, { duration: 0.4 });
			}
			loadTemplates();
		}
	});

	async function loadTemplates() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			if (searchTerm) params.append('search', searchTerm);
			if (typeFilter) params.append('type', typeFilter);
			if (categoryFilter) params.append('category', categoryFilter);

			const queryString = params.toString();
			const endpoint = `/admin/templates${queryString ? `?${queryString}` : ''}`;
			templates = await api.get<Template[]>(endpoint);
			
			// Animate grid items after load
			setTimeout(() => {
				if (gridItems.length > 0) {
					staggerIn(gridItems.filter(Boolean), { duration: 0.3, stagger: 0.05 });
				}
			}, 100);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao carregar templates';
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		editingTemplate = null;
		formData = {
			name: '',
			type: 'equipment',
			category: '',
			fileName: '',
			fileData: '',
			fileSize: 0
		};
		showModal = true;
	}

	function openEditModal(template: Template) {
		editingTemplate = template;
		formData = {
			name: template.name,
			type: template.type,
			category: template.category,
			fileName: template.fileName,
			fileData: '',
			fileSize: template.fileSize
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editingTemplate = null;
	}

	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.docx')) {
			error = 'Apenas arquivos .docx são permitidos';
			return;
		}

		uploading = true;
		try {
			const reader = new FileReader();
			reader.onload = () => {
				const base64 = (reader.result as string).split(',')[1];
				formData.fileData = base64;
				formData.fileName = file.name;
				formData.fileSize = file.size;
				uploading = false;
			};
			reader.onerror = () => {
				error = 'Erro ao ler arquivo';
				uploading = false;
			};
			reader.readAsDataURL(file);
		} catch (err) {
			error = 'Erro ao processar arquivo';
			uploading = false;
		}
	}

	async function handleSubmit() {
		if (!editingTemplate && !formData.fileData) {
			error = 'Selecione um arquivo';
			return;
		}

		saving = true;
		error = '';
		try {
			const dataToSend = editingTemplate && !formData.fileData
				? { name: formData.name, type: formData.type, category: formData.category }
				: formData;

			if (editingTemplate) {
				await api.put(`/admin/templates/${editingTemplate.id}`, dataToSend);
			} else {
				await api.post('/admin/templates', dataToSend);
			}
			closeModal();
			await loadTemplates();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao salvar template';
		} finally {
			saving = false;
		}
	}

	async function handleDelete(template: Template) {
		if (!confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) return;

		try {
			await api.delete(`/admin/templates/${template.id}`);
			await loadTemplates();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao excluir template';
		}
	}

	function downloadTemplate(template: Template) {
		window.open(`http://localhost:3000/api/admin/templates/${template.id}/download`, '_blank');
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('pt-BR');
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function getTypeLabel(type: string): string {
		return type === 'equipment' ? 'Equipamento' : 'Mesclagem';
	}

	function getTypeColor(type: string): string {
		return type === 'equipment' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400';
	}

	// Debounced search
	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			loadTemplates();
		}, 300);
	}

	function getCategories(): string[] {
		return formData.type === 'equipment' ? equipmentCategories : mergeCategories;
	}
</script>

<div bind:this={pageContainer} class="space-y-6" style="opacity: 0;">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-theme-primary">Templates</h1>
		<button
			onclick={openCreateModal}
			class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Novo Template
		</button>
	</div>

	<!-- Filters -->
	<div class="rounded-lg p-4 border transition-colors duration-300" style="background-color: var(--bg-card); border-color: var(--border-color);">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div>
				<label for="search" class="block text-sm font-medium mb-1 text-theme-secondary">Buscar</label>
				<input
					id="search"
					type="text"
					bind:value={searchTerm}
					oninput={handleSearchInput}
					placeholder="Nome, arquivo..."
					class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
					style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
				/>
			</div>
			<div>
				<label for="type" class="block text-sm font-medium mb-1 text-theme-secondary">Tipo</label>
				<select
					id="type"
					bind:value={typeFilter}
					onchange={loadTemplates}
					class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
					style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
				>
					<option value="">Todos</option>
					<option value="equipment">Equipamento</option>
					<option value="merge">Mesclagem</option>
				</select>
			</div>
			<div>
				<label for="category" class="block text-sm font-medium mb-1 text-theme-secondary">Categoria</label>
				<select
					id="category"
					bind:value={categoryFilter}
					onchange={loadTemplates}
					class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
					style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
				>
					<option value="">Todas</option>
					{#each [...equipmentCategories, ...mergeCategories] as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-end">
				<button
					onclick={() => {
						searchTerm = '';
						typeFilter = '';
						categoryFilter = '';
						loadTemplates();
					}}
					class="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
					style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
				>
					Limpar Filtros
				</button>
			</div>
		</div>
	</div>

	{#if error}
		<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg animate-fade-in">
			{error}
		</div>
	{/if}

	<!-- Grid -->
	<div class="rounded-lg overflow-hidden border transition-colors duration-300" style="background-color: var(--bg-card); border-color: var(--border-color);">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if templates.length === 0}
			<div class="text-center py-12 text-theme-muted">
				<svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p>Nenhum template encontrado</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
				{#each templates as template, i}
					<div 
						bind:this={gridItems[i]}
						class="rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg card-hover"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); opacity: 0;"
					>
						<div class="flex items-start justify-between mb-3">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
									<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<div>
									<h3 class="font-medium text-theme-primary">{template.name}</h3>
									<p class="text-sm text-theme-muted">{template.fileName}</p>
								</div>
							</div>
							<span class="px-2 py-1 rounded-full text-xs font-medium {getTypeColor(template.type)}">
								{getTypeLabel(template.type)}
							</span>
						</div>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-theme-muted">Categoria:</span>
								<span class="text-theme-secondary">{template.category}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-theme-muted">Tamanho:</span>
								<span class="text-theme-secondary">{formatFileSize(template.fileSize)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-theme-muted">Atualizado:</span>
								<span class="text-theme-secondary">{formatDate(template.updatedAt)}</span>
							</div>
						</div>
						<div class="flex items-center justify-end gap-2 mt-4 pt-3" style="border-top: 1px solid var(--border-color);">
							<button
								onclick={() => downloadTemplate(template)}
								class="p-2 text-theme-muted hover:text-green-400 transition-colors duration-200"
								title="Download"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
							</button>
							<button
								onclick={() => openEditModal(template)}
								class="p-2 text-theme-muted hover:text-blue-400 transition-colors duration-200"
								title="Editar"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
							</button>
							<button
								onclick={() => handleDelete(template)}
								class="p-2 text-theme-muted hover:text-red-400 transition-colors duration-200"
								title="Excluir"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Modal -->
{#if showModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
		<div class="rounded-lg w-full max-w-md animate-scale-in" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">
			<div class="flex items-center justify-between p-4" style="border-bottom: 1px solid var(--border-color);">
				<h2 class="text-xl font-semibold text-theme-primary">
					{editingTemplate ? 'Editar Template' : 'Novo Template'}
				</h2>
				<button onclick={closeModal} class="text-theme-muted hover:text-theme-primary transition-colors duration-200" aria-label="Fechar">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-4 space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-theme-secondary mb-1">Nome *</label>
					<input
						id="name"
						type="text"
						bind:value={formData.name}
						required
						class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
						placeholder="Nome do template"
					/>
				</div>

				<div>
					<label for="templateType" class="block text-sm font-medium text-theme-secondary mb-1">Tipo *</label>
					<select
						id="templateType"
						bind:value={formData.type}
						required
						onchange={() => { formData.category = ''; }}
						class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
					>
						<option value="equipment">Equipamento</option>
						<option value="merge">Mesclagem</option>
					</select>
				</div>

				<div>
					<label for="templateCategory" class="block text-sm font-medium text-theme-secondary mb-1">Categoria *</label>
					<select
						id="templateCategory"
						bind:value={formData.category}
						required
						class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
					>
						<option value="">Selecione...</option>
						{#each getCategories() as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="file" class="block text-sm font-medium text-theme-secondary mb-1">
						Arquivo DOCX {editingTemplate ? '(opcional)' : '*'}
					</label>
					<div class="relative">
						<input
							id="file"
							type="file"
							accept=".docx"
							onchange={handleFileUpload}
							class="w-full px-3 py-2 rounded-lg transition-colors duration-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
							style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
						/>
						{#if uploading}
							<div class="absolute right-3 top-1/2 -translate-y-1/2">
								<div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
							</div>
						{/if}
					</div>
					{#if formData.fileName && formData.fileData}
						<p class="text-green-400 text-sm mt-1">
							✓ {formData.fileName} ({formatFileSize(formData.fileSize)})
						</p>
					{:else if editingTemplate}
						<p class="text-theme-muted text-sm mt-1">
							Arquivo atual: {editingTemplate.fileName}
						</p>
					{/if}
				</div>

				{#if error}
					<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				{/if}

				<div class="flex justify-end gap-3 pt-4" style="border-top: 1px solid var(--border-color);">
					<button
						type="button"
						onclick={closeModal}
						class="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
						style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={saving || uploading}
						class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
					>
						{#if saving}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						{/if}
						{editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

