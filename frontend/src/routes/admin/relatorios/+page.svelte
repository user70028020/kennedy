<script lang="ts">
	import { api } from '$lib/api';
	import { browser } from '$app/environment';
	import { fadeIn, staggerIn } from '$lib/utils/animations';

	interface Report {
		id: string;
		type: 'fotografico' | 'spda' | 'rdo' | 'tecnico' | 'gastos' | 'mesclado';
		osNumber: string;
		clientName: string;
		fileName: string;
		fileSize: number;
		template: string;
		createdAt: string;
		generatedBy: { id: string; name: string; email: string; };
	}

	interface ReportsResponse {
		reports: Report[];
		total: number;
		limit: number;
		offset: number;
	}

	let reports = $state<Report[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let error = $state('');
	let deleting = $state<string | null>(null);

	let pageContainer: HTMLElement;
	let tableRows: HTMLElement[] = [];

	let searchTerm = $state('');
	let typeFilter = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let currentPage = $state(1);
	let pageSize = $state(20);

	const reportTypes = [
		{ value: 'fotografico', label: 'Fotográfico' },
		{ value: 'tecnico', label: 'Técnico' },
		{ value: 'spda', label: 'SPDA' },
		{ value: 'rdo', label: 'RDO de Montagem' },
		{ value: 'gastos', label: 'Gastos' },
		{ value: 'mesclado', label: 'Mesclado' }
	];

	let initialized = $state(false);

	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			if (pageContainer) fadeIn(pageContainer, { duration: 0.4 });
			loadReports();
		}
	});

	async function loadReports() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			if (searchTerm) params.append('search', searchTerm);
			if (typeFilter) params.append('type', typeFilter);
			if (startDate) params.append('startDate', startDate);
			if (endDate) params.append('endDate', endDate);
			params.append('limit', pageSize.toString());
			params.append('offset', ((currentPage - 1) * pageSize).toString());

			const response = await api.get<ReportsResponse>(`/reports${params.toString() ? `?${params}` : ''}`);
			reports = response.reports;
			total = response.total;

			setTimeout(() => {
				if (tableRows.length > 0) staggerIn(tableRows.filter(Boolean), { duration: 0.2, stagger: 0.03 });
			}, 100);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao carregar relatórios';
		} finally {
			loading = false;
		}
	}

	async function handleDelete(report: Report) {
		if (!confirm(`Excluir "${report.fileName}"?`)) return;
		deleting = report.id;
		try {
			await api.delete(`/reports/${report.id}`);
			await loadReports();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao excluir relatório';
		} finally {
			deleting = null;
		}
	}

	function downloadReport(report: Report) {
		window.open(`http://localhost:3000/api/reports/${report.id}/download`, '_blank');
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function getTypeLabel(type: string): string {
		return reportTypes.find(t => t.value === type)?.label || type;
	}

	function getTypeColor(type: string): string {
		const colors: Record<string, string> = {
			fotografico: 'bg-green-500/20 text-green-400',
			tecnico: 'bg-blue-500/20 text-blue-400',
			spda: 'bg-yellow-500/20 text-yellow-400',
			rdo: 'bg-purple-500/20 text-purple-400',
			gastos: 'bg-orange-500/20 text-orange-400',
			mesclado: 'bg-pink-500/20 text-pink-400'
		};
		return colors[type] || 'bg-gray-500/20 text-gray-400';
	}

	function getTemplateLabel(template: string): string {
		const labels: Record<string, string> = { nx_energy: 'NX Energy', sercamp: 'SERCAMP', merge: 'Mesclagem' };
		return labels[template] || template;
	}

	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => { currentPage = 1; loadReports(); }, 300);
	}

	function handleFilterChange() { currentPage = 1; loadReports(); }
	function clearFilters() { searchTerm = ''; typeFilter = ''; startDate = ''; endDate = ''; currentPage = 1; loadReports(); }
	function getTotalPages(): number { return Math.ceil(total / pageSize); }
	function goToPage(page: number) { currentPage = page; loadReports(); }
</script>

<div bind:this={pageContainer} class="space-y-6" style="opacity: 0;">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-theme-primary">Banco de Relatórios</h1>
		<div class="text-theme-muted text-sm">{total} relatório{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</div>
	</div>

	<div class="rounded-lg p-4 border" style="background-color: var(--bg-card); border-color: var(--border-color);">
		<div class="grid grid-cols-1 md:grid-cols-5 gap-4">
			<div>
				<label for="search" class="block text-sm font-medium text-theme-secondary mb-1">Buscar</label>
				<input id="search" type="text" bind:value={searchTerm} oninput={handleSearchInput} placeholder="OS, cliente, arquivo..." class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
			</div>
			<div>
				<label for="type" class="block text-sm font-medium text-theme-secondary mb-1">Tipo</label>
				<select id="type" bind:value={typeFilter} onchange={handleFilterChange} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
					<option value="">Todos</option>
					{#each reportTypes as type}<option value={type.value}>{type.label}</option>{/each}
				</select>
			</div>
			<div>
				<label for="startDate" class="block text-sm font-medium text-theme-secondary mb-1">Data Início</label>
				<input id="startDate" type="date" bind:value={startDate} onchange={handleFilterChange} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
			</div>
			<div>
				<label for="endDate" class="block text-sm font-medium text-theme-secondary mb-1">Data Fim</label>
				<input id="endDate" type="date" bind:value={endDate} onchange={handleFilterChange} class="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
			</div>
			<div class="flex items-end">
				<button onclick={clearFilters} class="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Limpar Filtros</button>
			</div>
		</div>
	</div>

	{#if error}<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg animate-fade-in">{error}</div>{/if}

	<div class="rounded-lg overflow-hidden border" style="background-color: var(--bg-card); border-color: var(--border-color);">
		{#if loading}
			<div class="flex items-center justify-center py-12"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
		{:else if reports.length === 0}
			<div class="text-center py-12 text-theme-muted">
				<svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
				<p>Nenhum relatório encontrado</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead style="background-color: var(--bg-tertiary);">
						<tr>
							<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Tipo</th>
							<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">OS</th>
							<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Cliente</th>
							<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Arquivo</th>
							<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Template</th>
							<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Tamanho</th>
							<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Gerado por</th>
							<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Data</th>
							<th class="px-4 py-3 text-right text-sm font-medium text-theme-secondary">Ações</th>
						</tr>
					</thead>
					<tbody class="divide-y" style="border-color: var(--border-color);">
						{#each reports as report, i}
							<tr bind:this={tableRows[i]} class="transition-colors duration-200 hover:bg-theme-hover" style="opacity: 0;">
								<td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium {getTypeColor(report.type)}">{getTypeLabel(report.type)}</span></td>
								<td class="px-4 py-3 text-theme-primary font-medium">{report.osNumber}</td>
								<td class="px-4 py-3 text-theme-secondary">{report.clientName}</td>
								<td class="px-4 py-3 text-theme-secondary text-sm truncate max-w-[200px]" title={report.fileName}>{report.fileName}</td>
								<td class="px-4 py-3 text-theme-muted text-sm">{getTemplateLabel(report.template)}</td>
								<td class="px-4 py-3 text-theme-muted text-sm">{formatFileSize(report.fileSize)}</td>
								<td class="px-4 py-3 text-theme-muted text-sm">{report.generatedBy?.name || 'N/A'}</td>
								<td class="px-4 py-3 text-theme-muted text-sm">{formatDate(report.createdAt)}</td>
								<td class="px-4 py-3">
									<div class="flex items-center justify-end gap-2">
										<button onclick={() => downloadReport(report)} class="p-2 text-theme-muted hover:text-green-400 transition-colors" title="Download">
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
										</button>
										<button onclick={() => handleDelete(report)} disabled={deleting === report.id} class="p-2 text-theme-muted hover:text-red-400 transition-colors disabled:opacity-50" title="Excluir">
											{#if deleting === report.id}<div class="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
											{:else}<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>{/if}
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if getTotalPages() > 1}
				<div class="flex items-center justify-between px-4 py-3" style="border-top: 1px solid var(--border-color);">
					<div class="text-sm text-theme-muted">Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, total)} de {total}</div>
					<div class="flex items-center gap-2">
						<button onclick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} class="px-3 py-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Anterior</button>
						<span class="text-theme-muted">Página {currentPage} de {getTotalPages()}</span>
						<button onclick={() => goToPage(currentPage + 1)} disabled={currentPage >= getTotalPages()} class="px-3 py-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Próxima</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

