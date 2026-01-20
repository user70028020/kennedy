<script lang="ts">
	import { api } from '$lib/api';
	import { browser } from '$app/environment';
	import { fadeIn, staggerIn, scaleIn } from '$lib/utils/animations';

	interface ServiceOrder {
		id: string;
		osNumber: string;
		clientName: string;
		clientLogo?: string;
		teamLeader: string;
		teamMembers: string[];
		equipmentType: string;
		selectedTemplate: 'nx_energy' | 'sercamp';
		serviceType: string;
		location: string;
		periodStart: string;
		periodEnd: string;
		status: 'ativa' | 'concluida' | 'cancelada';
		createdAt: string;
		createdBy: { id: string; name: string; email: string };
		_count?: { reports: number };
	}

	let serviceOrders = $state<ServiceOrder[]>([]);
	let loading = $state(true);
	let error = $state('');
	let showModal = $state(false);
	let editingOS = $state<ServiceOrder | null>(null);
	let saving = $state(false);

	let searchTerm = $state('');
	let statusFilter = $state('');
	let equipmentFilter = $state('');

	let formData = $state({
		osNumber: '',
		clientName: '',
		teamLeader: '',
		teamMembers: [] as string[],
		equipmentType: '',
		selectedTemplate: 'nx_energy' as 'nx_energy' | 'sercamp',
		serviceType: '',
		location: '',
		periodStart: '',
		periodEnd: '',
		status: 'ativa' as 'ativa' | 'concluida' | 'cancelada'
	});

	let teamMemberInput = $state('');
	let pageContainer: HTMLElement | undefined = $state();
	let tableRows: HTMLElement[] = $state([]);
	let modalElement: HTMLElement | undefined = $state();

	const equipmentTypes = ['Transformador', 'Transformador para Instrumentos', 'Disjuntor', 'Para-raios', 'Relé de Proteção', 'Chave Seccionadora', 'Chave Religadora', 'Painel Religador', 'Retificador de Bateria', 'Banco de Capacitores', 'Cabos', 'SPDA'];
	const serviceTypes = ['Manutenção Preventiva', 'Manutenção Corretiva', 'Inspeção', 'Comissionamento', 'Montagem', 'Outros'];

	let initialized = $state(false);

	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			loadServiceOrders();
			if (pageContainer) fadeIn(pageContainer, { duration: 0.4 });
		}
	});

	async function loadServiceOrders() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			if (searchTerm) params.append('search', searchTerm);
			if (statusFilter) params.append('status', statusFilter);
			if (equipmentFilter) params.append('equipmentType', equipmentFilter);
			const queryString = params.toString();
			serviceOrders = await api.get<ServiceOrder[]>(`/admin/service-orders${queryString ? `?${queryString}` : ''}`);
			setTimeout(() => {
				if (tableRows.length > 0) staggerIn(tableRows.filter(Boolean), { duration: 0.3, stagger: 0.05 });
			}, 100);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao carregar ordens de serviço';
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		editingOS = null;
		formData = { osNumber: '', clientName: '', teamLeader: '', teamMembers: [], equipmentType: '', selectedTemplate: 'nx_energy', serviceType: '', location: '', periodStart: '', periodEnd: '', status: 'ativa' };
		teamMemberInput = '';
		showModal = true;
		setTimeout(() => { if (modalElement) scaleIn(modalElement, { duration: 0.25 }); }, 10);
	}

	function openEditModal(os: ServiceOrder) {
		editingOS = os;
		formData = { osNumber: os.osNumber, clientName: os.clientName, teamLeader: os.teamLeader, teamMembers: [...os.teamMembers], equipmentType: os.equipmentType, selectedTemplate: os.selectedTemplate, serviceType: os.serviceType, location: os.location, periodStart: os.periodStart.split('T')[0], periodEnd: os.periodEnd.split('T')[0], status: os.status };
		teamMemberInput = '';
		showModal = true;
		setTimeout(() => { if (modalElement) scaleIn(modalElement, { duration: 0.25 }); }, 10);
	}

	function closeModal() { showModal = false; editingOS = null; }
	function addTeamMember() { if (teamMemberInput.trim() && !formData.teamMembers.includes(teamMemberInput.trim())) { formData.teamMembers = [...formData.teamMembers, teamMemberInput.trim()]; teamMemberInput = ''; } }
	function removeTeamMember(member: string) { formData.teamMembers = formData.teamMembers.filter((m) => m !== member); }

	async function handleSubmit() {
		saving = true;
		error = '';
		try {
			if (editingOS) await api.put(`/admin/service-orders/${editingOS.id}`, formData);
			else await api.post('/admin/service-orders', formData);
			closeModal();
			await loadServiceOrders();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao salvar ordem de serviço';
		} finally {
			saving = false;
		}
	}

	async function handleDelete(os: ServiceOrder) {
		if (!confirm(`Tem certeza que deseja excluir a OS ${os.osNumber}?`)) return;
		try { await api.delete(`/admin/service-orders/${os.id}`); await loadServiceOrders(); }
		catch (err) { error = err instanceof Error ? err.message : 'Erro ao excluir ordem de serviço'; }
	}

	function formatDate(dateString: string): string { return new Date(dateString).toLocaleDateString('pt-BR'); }
	function getStatusColor(status: string): string { return status === 'ativa' ? 'bg-green-500/20 text-green-400' : status === 'concluida' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'; }
	function getStatusLabel(status: string): string { return status === 'ativa' ? 'Ativa' : status === 'concluida' ? 'Concluída' : 'Cancelada'; }

	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearchInput() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => loadServiceOrders(), 300); }
</script>

<div bind:this={pageContainer} class="space-y-6" style="opacity: 0;">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold" style="color: var(--text-primary);">Ordens de Serviço</h1>
		<button onclick={openCreateModal} class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 hover:scale-[1.02]">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
			Nova OS
		</button>
	</div>

	<div class="rounded-lg p-4 transition-colors" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<div>
				<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Buscar</label>
				<input type="text" bind:value={searchTerm} oninput={handleSearchInput} placeholder="OS, cliente, líder..." class="w-full px-3 py-2 rounded-lg transition-colors admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
			</div>
			<div>
				<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Status</label>
				<select bind:value={statusFilter} onchange={loadServiceOrders} class="w-full px-3 py-2 rounded-lg transition-colors admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
					<option value="">Todos</option>
					<option value="ativa">Ativa</option>
					<option value="concluida">Concluída</option>
					<option value="cancelada">Cancelada</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Equipamento</label>
				<select bind:value={equipmentFilter} onchange={loadServiceOrders} class="w-full px-3 py-2 rounded-lg transition-colors admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
					<option value="">Todos</option>
					{#each equipmentTypes as type}<option value={type}>{type}</option>{/each}
				</select>
			</div>
			<div class="flex items-end">
				<button onclick={() => { searchTerm = ''; statusFilter = ''; equipmentFilter = ''; loadServiceOrders(); }} class="px-4 py-2 rounded-lg transition-all duration-200" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Limpar Filtros</button>
			</div>
		</div>
	</div>

	{#if error}
		<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
			{error}
		</div>
	{/if}

	<div class="rounded-lg overflow-hidden transition-colors" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">
		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="relative"><div class="w-10 h-10 border-4 border-blue-500/30 rounded-full"></div><div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div></div>
			</div>
		{:else if serviceOrders.length === 0}
			<div class="text-center py-12" style="color: var(--text-muted);">
				<svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
				<p>Nenhuma ordem de serviço encontrada</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead style="background-color: var(--bg-tertiary);">
						<tr>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">OS</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Cliente</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Equipamento</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Líder</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Período</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Status</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Relatórios</th>
							<th class="px-4 py-3 text-right text-sm font-medium" style="color: var(--text-secondary);">Ações</th>
						</tr>
					</thead>
					<tbody>
						{#each serviceOrders as os, i}
							<tr bind:this={tableRows[i]} class="transition-colors duration-200 admin-table-row" style="opacity: 0; border-bottom: 1px solid var(--border-color);">
								<td class="px-4 py-3 font-medium" style="color: var(--text-primary);">{os.osNumber}</td>
								<td class="px-4 py-3" style="color: var(--text-secondary);">{os.clientName}</td>
								<td class="px-4 py-3" style="color: var(--text-secondary);">{os.equipmentType}</td>
								<td class="px-4 py-3" style="color: var(--text-secondary);">{os.teamLeader}</td>
								<td class="px-4 py-3 text-sm" style="color: var(--text-secondary);">{formatDate(os.periodStart)} - {formatDate(os.periodEnd)}</td>
								<td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium {getStatusColor(os.status)}">{getStatusLabel(os.status)}</span></td>
								<td class="px-4 py-3" style="color: var(--text-secondary);">{os._count?.reports || 0}</td>
								<td class="px-4 py-3 text-right">
									<div class="flex items-center justify-end gap-2">
										<button onclick={() => openEditModal(os)} class="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-gray-400 hover:text-blue-400" title="Editar"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
										<button onclick={() => handleDelete(os)} class="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-gray-400 hover:text-red-400" title="Excluir"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>


{#if showModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div bind:this={modalElement} class="rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" style="background-color: var(--bg-card); opacity: 0;">
			<div class="flex items-center justify-between p-4" style="border-bottom: 1px solid var(--border-color);">
				<h2 class="text-xl font-semibold" style="color: var(--text-primary);">{editingOS ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h2>
				<button onclick={closeModal} class="transition-colors" style="color: var(--text-muted);"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
			</div>
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-4 space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Número da OS *</label>
						<input type="text" bind:value={formData.osNumber} required class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="Ex: OS-2026-001" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Cliente *</label>
						<input type="text" bind:value={formData.clientName} required class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="Nome do cliente" />
					</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Tipo de Equipamento *</label>
						<select bind:value={formData.equipmentType} required class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
							<option value="">Selecione...</option>
							{#each equipmentTypes as type}<option value={type}>{type}</option>{/each}
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Tipo de Serviço *</label>
						<select bind:value={formData.serviceType} required class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
							<option value="">Selecione...</option>
							{#each serviceTypes as type}<option value={type}>{type}</option>{/each}
						</select>
					</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Template *</label>
						<select bind:value={formData.selectedTemplate} required class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
							<option value="nx_energy">NX Energy</option>
							<option value="sercamp">SERCAMP</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Localização *</label>
						<input type="text" bind:value={formData.location} required class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="Cidade, Estado" />
					</div>
				</div>
				<div>
					<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Líder da Equipe *</label>
					<input type="text" bind:value={formData.teamLeader} required class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="Nome do líder" />
				</div>
				<div>
					<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Membros da Equipe</label>
					<div class="flex gap-2 mb-2">
						<input type="text" bind:value={teamMemberInput} onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTeamMember(); } }} class="flex-1 px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="Nome do membro" />
						<button type="button" onclick={addTeamMember} class="px-4 py-2 rounded-lg transition-colors" style="background-color: var(--bg-tertiary); color: var(--text-primary);">Adicionar</button>
					</div>
					{#if formData.teamMembers.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each formData.teamMembers as member}
								<span class="flex items-center gap-1 px-2 py-1 rounded-lg text-sm" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">
									{member}
									<button type="button" onclick={() => removeTeamMember(member)} class="text-gray-400 hover:text-red-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
								</span>
							{/each}
						</div>
					{/if}
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Data Início *</label>
						<input type="date" bind:value={formData.periodStart} required class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Data Fim *</label>
						<input type="date" bind:value={formData.periodEnd} required class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" />
					</div>
				</div>
				{#if editingOS}
					<div>
						<label class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Status</label>
						<select bind:value={formData.status} class="w-full px-3 py-2 rounded-lg admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
							<option value="ativa">Ativa</option>
							<option value="concluida">Concluída</option>
							<option value="cancelada">Cancelada</option>
						</select>
					</div>
				{/if}
				{#if error}
					<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
				{/if}
				<div class="flex justify-end gap-3 pt-4" style="border-top: 1px solid var(--border-color);">
					<button type="button" onclick={closeModal} class="px-4 py-2 rounded-lg transition-colors" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Cancelar</button>
					<button type="submit" disabled={saving} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/25">
						{#if saving}<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{/if}
						{editingOS ? 'Salvar Alterações' : 'Criar OS'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.admin-table-row:hover { background-color: var(--bg-hover); }
	.admin-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
</style>

