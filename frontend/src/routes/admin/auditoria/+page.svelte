<script lang="ts">
	import { api } from '$lib/api';
	import { browser } from '$app/environment';
	import { fadeIn, staggerIn } from '$lib/utils/animations';

	interface User {
		id: string;
		name: string;
		email: string;
		role: 'admin' | 'funcionario';
	}

	interface AuditLog {
		id: string;
		userId: string;
		userName: string;
		action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'download' | 'generate';
		resourceType: 'user' | 'report' | 'template' | 'service_order' | 'merge';
		resourceId: string | null;
		details: string;
		ipAddress: string | null;
		timestamp: string;
		user?: User;
	}

	interface AuditLogsResponse {
		logs: AuditLog[];
		total: number;
		limit: number;
		offset: number;
	}

	const ACTION_LABELS: Record<string, { label: string; color: string }> = {
		login: { label: 'Login', color: 'bg-green-500/20 text-green-400' },
		logout: { label: 'Logout', color: 'bg-gray-500/20 text-gray-400' },
		create: { label: 'Criar', color: 'bg-blue-500/20 text-blue-400' },
		update: { label: 'Atualizar', color: 'bg-yellow-500/20 text-yellow-400' },
		delete: { label: 'Excluir', color: 'bg-red-500/20 text-red-400' },
		download: { label: 'Download', color: 'bg-purple-500/20 text-purple-400' },
		generate: { label: 'Gerar', color: 'bg-cyan-500/20 text-cyan-400' }
	};

	const RESOURCE_LABELS: Record<string, string> = {
		user: 'Usuário',
		report: 'Relatório',
		template: 'Template',
		service_order: 'Ordem de Serviço',
		merge: 'Mesclagem'
	};

	let logs = $state<AuditLog[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let users = $state<User[]>([]);

	// Refs for animations
	let pageContainer: HTMLElement;
	let tableRows: HTMLElement[] = [];

	// Filters
	let filterStartDate = $state('');
	let filterEndDate = $state('');
	let filterUserId = $state('');
	let filterAction = $state('');
	let filterResourceType = $state('');

	// Pagination
	let currentPage = $state(1);
	let pageSize = $state(20);

	// Detail modal
	let showDetailModal = $state(false);
	let selectedLog = $state<AuditLog | null>(null);

	let initialized = $state(false);

	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			if (pageContainer) {
				fadeIn(pageContainer, { duration: 0.4 });
			}
			loadUsers();
			loadLogs();
		}
	});

	async function loadUsers() {
		try {
			users = await api.get<User[]>('/admin/users');
		} catch (e) {
			console.error('Error loading users:', e);
		}
	}

	async function loadLogs() {
		loading = true;
		error = null;
		try {
			const params = new URLSearchParams();
			
			if (filterStartDate) params.append('startDate', filterStartDate);
			if (filterEndDate) params.append('endDate', filterEndDate);
			if (filterUserId) params.append('userId', filterUserId);
			if (filterAction) params.append('action', filterAction);
			if (filterResourceType) params.append('resourceType', filterResourceType);
			params.append('limit', pageSize.toString());
			params.append('offset', ((currentPage - 1) * pageSize).toString());

			const queryString = params.toString();
			const response = await api.get<AuditLogsResponse>(`/admin/audit-logs${queryString ? '?' + queryString : ''}`);
			
			logs = response.logs;
			total = response.total;

			// Animate table rows
			setTimeout(() => {
				if (tableRows.length > 0) {
					staggerIn(tableRows.filter(Boolean), { duration: 0.2, stagger: 0.03 });
				}
			}, 100);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erro ao carregar logs de auditoria';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		currentPage = 1;
		loadLogs();
	}

	function clearFilters() {
		filterStartDate = '';
		filterEndDate = '';
		filterUserId = '';
		filterAction = '';
		filterResourceType = '';
		currentPage = 1;
		loadLogs();
	}

	function goToPage(page: number) {
		currentPage = page;
		loadLogs();
	}

	function openDetailModal(log: AuditLog) {
		selectedLog = log;
		showDetailModal = true;
	}

	function closeDetailModal() {
		showDetailModal = false;
		selectedLog = null;
	}

	function formatDateTime(dateStr: string): string {
		return new Date(dateStr).toLocaleString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function formatTime(dateStr: string): string {
		return new Date(dateStr).toLocaleTimeString('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	let totalPages = $derived(Math.ceil(total / pageSize));
</script>

<div bind:this={pageContainer} class="space-y-6" style="opacity: 0;">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-bold text-theme-primary">Auditoria e Segurança</h1>
		<p class="text-theme-muted mt-1">Visualize todas as ações realizadas no sistema</p>
	</div>

	<!-- Filters -->
	<div class="rounded-lg p-4 border transition-colors duration-300" style="background-color: var(--bg-card); border-color: var(--border-color);">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
			<div>
				<label for="startDate" class="block text-sm font-medium text-theme-secondary mb-1">Data Início</label>
				<input
					type="date"
					id="startDate"
					bind:value={filterStartDate}
					class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
					style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
				/>
			</div>
			<div>
				<label for="endDate" class="block text-sm font-medium text-theme-secondary mb-1">Data Fim</label>
				<input
					type="date"
					id="endDate"
					bind:value={filterEndDate}
					class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
					style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
				/>
			</div>
			<div>
				<label for="userId" class="block text-sm font-medium text-theme-secondary mb-1">Usuário</label>
				<select
					id="userId"
					bind:value={filterUserId}
					class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
					style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
				>
					<option value="">Todos</option>
					{#each users as user}
						<option value={user.id}>{user.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="action" class="block text-sm font-medium text-theme-secondary mb-1">Ação</label>
				<select
					id="action"
					bind:value={filterAction}
					class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
					style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
				>
					<option value="">Todas</option>
					<option value="login">Login</option>
					<option value="logout">Logout</option>
					<option value="create">Criar</option>
					<option value="update">Atualizar</option>
					<option value="delete">Excluir</option>
					<option value="download">Download</option>
					<option value="generate">Gerar</option>
				</select>
			</div>
			<div>
				<label for="resourceType" class="block text-sm font-medium text-theme-secondary mb-1">Tipo de Recurso</label>
				<select
					id="resourceType"
					bind:value={filterResourceType}
					class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
					style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
				>
					<option value="">Todos</option>
					<option value="user">Usuário</option>
					<option value="report">Relatório</option>
					<option value="template">Template</option>
					<option value="service_order">Ordem de Serviço</option>
					<option value="merge">Mesclagem</option>
				</select>
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-4">
			<button
				onclick={clearFilters}
				class="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
				style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
			>
				Limpar Filtros
			</button>
			<button
				onclick={applyFilters}
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				Filtrar
			</button>
		</div>
	</div>

	{#if error}
		<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg animate-fade-in">
			{error}
		</div>
	{/if}

	<!-- Stats -->
	<div class="flex items-center justify-between text-sm text-theme-muted">
		<span>Total de registros: {total}</span>
		<span>Página {currentPage} de {totalPages || 1}</span>
	</div>

	<!-- Logs table -->
	<div class="rounded-lg overflow-hidden border transition-colors duration-300" style="background-color: var(--bg-card); border-color: var(--border-color);">
		{#if loading}
			<div class="p-8 text-center">
				<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
				<p class="text-theme-muted">Carregando logs...</p>
			</div>
		{:else if logs.length === 0}
			<div class="p-8 text-center">
				<svg class="w-12 h-12 mx-auto mb-4 text-theme-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p class="text-theme-muted">Nenhum log de auditoria encontrado</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead style="background-color: var(--bg-tertiary);">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Data/Hora</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Usuário</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Ação</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Recurso</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">Detalhes</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">IP</th>
							<th class="px-4 py-3 text-right text-xs font-medium text-theme-secondary uppercase tracking-wider">Ações</th>
						</tr>
					</thead>
					<tbody class="divide-y" style="border-color: var(--border-color);">
						{#each logs as log, i}
							<tr 
								bind:this={tableRows[i]}
								class="transition-colors duration-200 hover:bg-theme-hover"
								style="opacity: 0;"
							>
								<td class="px-4 py-3 whitespace-nowrap">
									<div class="text-theme-primary text-sm">{formatDate(log.timestamp)}</div>
									<div class="text-theme-muted text-xs">{formatTime(log.timestamp)}</div>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<div class="flex items-center gap-2">
										<div class="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
											<span class="text-white text-xs font-medium">{log.userName.charAt(0).toUpperCase()}</span>
										</div>
										<span class="text-theme-primary text-sm">{log.userName}</span>
									</div>
								</td>
								<td class="px-4 py-3 whitespace-nowrap">
									<span class="px-2 py-1 text-xs rounded-full {ACTION_LABELS[log.action]?.color || 'bg-gray-500/20 text-gray-400'}">
										{ACTION_LABELS[log.action]?.label || log.action}
									</span>
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-theme-secondary text-sm">
									{RESOURCE_LABELS[log.resourceType] || log.resourceType}
								</td>
								<td class="px-4 py-3">
									<div class="text-theme-secondary text-sm max-w-xs truncate" title={log.details}>
										{log.details}
									</div>
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-theme-muted text-sm font-mono">
									{log.ipAddress || '-'}
								</td>
								<td class="px-4 py-3 whitespace-nowrap text-right">
									<button
										onclick={() => openDetailModal(log)}
										class="p-2 text-theme-muted hover:text-blue-400 transition-colors duration-200"
										title="Ver detalhes"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if totalPages > 1}
				<div class="px-4 py-3 flex items-center justify-between" style="background-color: var(--bg-tertiary);">
					<button
						onclick={() => goToPage(currentPage - 1)}
						disabled={currentPage === 1}
						class="px-3 py-1 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
						style="background-color: var(--bg-secondary); color: var(--text-secondary);"
					>
						Anterior
					</button>
					
					<div class="flex items-center gap-1">
						{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							const start = Math.max(1, currentPage - 2);
							const end = Math.min(totalPages, start + 4);
							const adjustedStart = Math.max(1, end - 4);
							return adjustedStart + i;
						}).filter(p => p <= totalPages) as page}
							<button
								onclick={() => goToPage(page)}
								class="px-3 py-1 rounded transition-all duration-200 {page === currentPage ? 'bg-blue-600 text-white' : ''}"
								style={page !== currentPage ? `background-color: var(--bg-secondary); color: var(--text-secondary);` : ''}
							>
								{page}
							</button>
						{/each}
					</div>

					<button
						onclick={() => goToPage(currentPage + 1)}
						disabled={currentPage === totalPages}
						class="px-3 py-1 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
						style="background-color: var(--bg-secondary); color: var(--text-secondary);"
					>
						Próximo
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Detail Modal -->
{#if showDetailModal && selectedLog}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
		<div class="rounded-lg w-full max-w-lg animate-scale-in" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">
			<div class="p-6 flex items-center justify-between" style="border-bottom: 1px solid var(--border-color);">
				<h2 class="text-xl font-semibold text-theme-primary">Detalhes do Log</h2>
				<button
					onclick={closeDetailModal}
					class="p-2 text-theme-muted hover:text-theme-primary transition-colors duration-200"
					aria-label="Fechar modal"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="p-6 space-y-4">
				<div>
					<span class="text-sm text-theme-muted">ID do Log</span>
					<p class="text-theme-primary font-mono text-sm">{selectedLog.id}</p>
				</div>

				<div>
					<span class="text-sm text-theme-muted">Data e Hora</span>
					<p class="text-theme-primary">{formatDateTime(selectedLog.timestamp)}</p>
				</div>

				<div>
					<span class="text-sm text-theme-muted">Usuário</span>
					<div class="flex items-center gap-2 mt-1">
						<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
							<span class="text-white text-sm font-medium">{selectedLog.userName.charAt(0).toUpperCase()}</span>
						</div>
						<div>
							<p class="text-theme-primary">{selectedLog.userName}</p>
							<p class="text-theme-muted text-xs font-mono">{selectedLog.userId}</p>
						</div>
					</div>
				</div>

				<div>
					<span class="text-sm text-theme-muted">Ação</span>
					<p class="mt-1">
						<span class="px-2 py-1 text-sm rounded-full {ACTION_LABELS[selectedLog.action]?.color || 'bg-gray-500/20 text-gray-400'}">
							{ACTION_LABELS[selectedLog.action]?.label || selectedLog.action}
						</span>
					</p>
				</div>

				<div>
					<span class="text-sm text-theme-muted">Tipo de Recurso</span>
					<p class="text-theme-primary">{RESOURCE_LABELS[selectedLog.resourceType] || selectedLog.resourceType}</p>
				</div>

				{#if selectedLog.resourceId}
					<div>
						<span class="text-sm text-theme-muted">ID do Recurso</span>
						<p class="text-theme-primary font-mono text-sm">{selectedLog.resourceId}</p>
					</div>
				{/if}

				<div>
					<span class="text-sm text-theme-muted">Detalhes</span>
					<p class="text-theme-primary rounded-lg p-3 mt-1" style="background-color: var(--bg-secondary);">{selectedLog.details}</p>
				</div>

				<div>
					<span class="text-sm text-theme-muted">Endereço IP</span>
					<p class="text-theme-primary font-mono">{selectedLog.ipAddress || 'Não disponível'}</p>
				</div>
			</div>

			<div class="p-6" style="border-top: 1px solid var(--border-color);">
				<button
					onclick={closeDetailModal}
					class="w-full px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02]"
					style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
				>
					Fechar
				</button>
			</div>
		</div>
	</div>
{/if}

