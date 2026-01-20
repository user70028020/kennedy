<script lang="ts">
	import { api } from '$lib/api';
	import { browser } from '$app/environment';
	import { fadeIn, staggerIn, scaleIn } from '$lib/utils/animations';

	interface Colaborador {
		id: string;
		nome: string;
		documento: string;
		funcao: string;
		email?: string;
		telefone?: string;
		osCount: number;
		createdAt: string;
	}

	let colaboradores = $state<Colaborador[]>([]);
	let loading = $state(true);
	let error = $state('');
	let showModal = $state(false);
	let editingColaborador = $state<Colaborador | null>(null);
	let saving = $state(false);
	let searchTerm = $state('');

	let formData = $state({ nome: '', documento: '', funcao: '', email: '', telefone: '' });

	let pageContainer: HTMLElement | undefined = $state();
	let tableRows: HTMLElement[] = $state([]);
	let modalElement: HTMLElement | undefined = $state();

	const funcoes = ['Técnico Eletricista', 'Engenheiro Eletricista', 'Supervisor', 'Coordenador', 'Auxiliar Técnico', 'Motorista', 'Estagiário', 'Outros'];

	let initialized = $state(false);

	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			loadColaboradores();
			if (pageContainer) fadeIn(pageContainer, { duration: 0.4 });
		}
	});

	async function loadColaboradores() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			if (searchTerm) params.append('search', searchTerm);
			colaboradores = await api.get<Colaborador[]>(`/admin/colaboradores${params.toString() ? `?${params}` : ''}`);
			setTimeout(() => { if (tableRows.length > 0) staggerIn(tableRows.filter(Boolean), { duration: 0.3, stagger: 0.05 }); }, 100);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao carregar colaboradores';
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		editingColaborador = null;
		formData = { nome: '', documento: '', funcao: '', email: '', telefone: '' };
		showModal = true;
		setTimeout(() => { if (modalElement) scaleIn(modalElement, { duration: 0.25 }); }, 10);
	}

	function openEditModal(colaborador: Colaborador) {
		editingColaborador = colaborador;
		formData = { nome: colaborador.nome, documento: colaborador.documento, funcao: colaborador.funcao, email: colaborador.email || '', telefone: colaborador.telefone || '' };
		showModal = true;
		setTimeout(() => { if (modalElement) scaleIn(modalElement, { duration: 0.25 }); }, 10);
	}

	function closeModal() { showModal = false; editingColaborador = null; }

	async function handleSubmit() {
		saving = true;
		error = '';
		try {
			const dataToSend = { ...formData, email: formData.email || null, telefone: formData.telefone || null };
			if (editingColaborador) await api.put(`/admin/colaboradores/${editingColaborador.id}`, dataToSend);
			else await api.post('/admin/colaboradores', dataToSend);
			closeModal();
			await loadColaboradores();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao salvar colaborador';
		} finally {
			saving = false;
		}
	}

	async function handleDelete(colaborador: Colaborador) {
		if (!confirm(`Tem certeza que deseja excluir ${colaborador.nome}?`)) return;
		try { await api.delete(`/admin/colaboradores/${colaborador.id}`); await loadColaboradores(); }
		catch (err) { error = err instanceof Error ? err.message : 'Erro ao excluir colaborador'; }
	}

	function formatDate(dateString: string): string { return new Date(dateString).toLocaleDateString('pt-BR'); }
	function getTotalOS(): number { return colaboradores.reduce((sum, c) => sum + c.osCount, 0); }

	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearchInput() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => loadColaboradores(), 300); }
</script>

<div bind:this={pageContainer} class="space-y-6" style="opacity: 0;">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold" style="color: var(--text-primary);">Colaboradores</h1>
		<button onclick={openCreateModal} class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 hover:scale-[1.02]">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
			Novo Colaborador
		</button>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<div class="rounded-lg p-4 card">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-muted);">Total de Colaboradores</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{colaboradores.length}</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg p-4 card">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-muted);">Total de OS Participadas</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{getTotalOS()}</p>
				</div>
			</div>
		</div>
		<div class="rounded-lg p-4 card">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
					<svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
				</div>
				<div>
					<p class="text-sm" style="color: var(--text-muted);">Média OS/Colaborador</p>
					<p class="text-2xl font-bold" style="color: var(--text-primary);">{colaboradores.length > 0 ? (getTotalOS() / colaboradores.length).toFixed(1) : '0'}</p>
				</div>
			</div>
		</div>
	</div>

	<div class="rounded-lg p-4 card">
		<div class="flex gap-4">
			<div class="flex-1">
				<input type="text" bind:value={searchTerm} oninput={handleSearchInput} placeholder="Buscar por nome, documento, função ou email..." class="w-full px-3 py-2 rounded-lg input" />
			</div>
			<button onclick={() => { searchTerm = ''; loadColaboradores(); }} class="px-4 py-2 rounded-lg btn-secondary">Limpar</button>
		</div>
	</div>

	{#if error}
		<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
			{error}
		</div>
	{/if}

	<div class="rounded-lg overflow-hidden table-container">
		{#if loading}
			<div class="flex items-center justify-center py-12"><div class="spinner"></div></div>
		{:else if colaboradores.length === 0}
			<div class="empty-state">
				<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
				<p>Nenhum colaborador encontrado</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="table-header">
						<tr>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Nome</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Documento</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Função</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Contato</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">OS</th>
							<th class="px-4 py-3 text-left text-sm font-medium" style="color: var(--text-secondary);">Cadastro</th>
							<th class="px-4 py-3 text-right text-sm font-medium" style="color: var(--text-secondary);">Ações</th>
						</tr>
					</thead>
					<tbody>
						{#each colaboradores as colaborador, i}
							<tr bind:this={tableRows[i]} class="table-row" style="opacity: 0;">
								<td class="px-4 py-3">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/25">
											<span class="text-white text-sm font-medium">{colaborador.nome.charAt(0).toUpperCase()}</span>
										</div>
										<span class="font-medium" style="color: var(--text-primary);">{colaborador.nome}</span>
									</div>
								</td>
								<td class="px-4 py-3" style="color: var(--text-secondary);">{colaborador.documento}</td>
								<td class="px-4 py-3" style="color: var(--text-secondary);">{colaborador.funcao}</td>
								<td class="px-4 py-3 text-sm" style="color: var(--text-secondary);">
									{#if colaborador.email}<div>{colaborador.email}</div>{/if}
									{#if colaborador.telefone}<div style="color: var(--text-muted);">{colaborador.telefone}</div>{/if}
									{#if !colaborador.email && !colaborador.telefone}<span style="color: var(--text-muted);">-</span>{/if}
								</td>
								<td class="px-4 py-3"><span class="badge badge-info">{colaborador.osCount}</span></td>
								<td class="px-4 py-3 text-sm" style="color: var(--text-muted);">{formatDate(colaborador.createdAt)}</td>
								<td class="px-4 py-3 text-right">
									<div class="flex items-center justify-end gap-2">
										<button onclick={() => openEditModal(colaborador)} class="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-gray-400 hover:text-blue-400" title="Editar"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
										<button onclick={() => handleDelete(colaborador)} class="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-gray-400 hover:text-red-400" title="Excluir"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
	<div class="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
		<div bind:this={modalElement} class="rounded-lg w-full max-w-md card" style="opacity: 0;">
			<div class="flex items-center justify-between p-4" style="border-bottom: 1px solid var(--border-color);">
				<h2 class="text-xl font-semibold" style="color: var(--text-primary);">{editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}</h2>
				<button onclick={closeModal} class="transition-colors" style="color: var(--text-muted);" aria-label="Fechar"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
			</div>
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-4 space-y-4">
				<div>
					<label for="nome" class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Nome *</label>
					<input id="nome" type="text" bind:value={formData.nome} required class="w-full px-3 py-2 rounded-lg input" placeholder="Nome completo" />
				</div>
				<div>
					<label for="documento" class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Documento (CPF/RG) *</label>
					<input id="documento" type="text" bind:value={formData.documento} required class="w-full px-3 py-2 rounded-lg input" placeholder="000.000.000-00" />
				</div>
				<div>
					<label for="funcao" class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Função *</label>
					<select id="funcao" bind:value={formData.funcao} required class="w-full px-3 py-2 rounded-lg input">
						<option value="">Selecione...</option>
						{#each funcoes as funcao}<option value={funcao}>{funcao}</option>{/each}
					</select>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Email</label>
					<input id="email" type="email" bind:value={formData.email} class="w-full px-3 py-2 rounded-lg input" placeholder="email@exemplo.com" />
				</div>
				<div>
					<label for="telefone" class="block text-sm font-medium mb-1" style="color: var(--text-muted);">Telefone</label>
					<input id="telefone" type="tel" bind:value={formData.telefone} class="w-full px-3 py-2 rounded-lg input" placeholder="(00) 00000-0000" />
				</div>
				{#if error}<div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>{/if}
				<div class="flex justify-end gap-3 pt-4" style="border-top: 1px solid var(--border-color);">
					<button type="button" onclick={closeModal} class="px-4 py-2 rounded-lg btn-secondary">Cancelar</button>
					<button type="submit" disabled={saving} class="px-4 py-2 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
						{#if saving}<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{/if}
						{editingColaborador ? 'Salvar Alterações' : 'Criar Colaborador'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

