<script lang="ts">
	import { api } from '$lib/api';
	import { browser } from '$app/environment';
	import { fadeIn, staggerIn, scaleIn, shake } from '$lib/utils/animations';

	interface User {
		id: string;
		name: string;
		email: string;
		role: 'admin' | 'funcionario';
		modules: string[];
		status: 'ativo' | 'inativo';
		createdAt: string;
		updatedAt: string;
	}

	const AVAILABLE_MODULES = [
		{ id: 'fotografico', label: 'Relatório Fotográfico' },
		{ id: 'spda', label: 'Relatório SPDA' },
		{ id: 'rdo', label: 'RDO de Montagem' },
		{ id: 'tecnico', label: 'Relatório Técnico' },
		{ id: 'gastos', label: 'Relatório de Gastos' },
		{ id: 'banco_dados', label: 'Banco de Dados' },
		{ id: 'gerenciar_usuarios', label: 'Gerenciar Usuários' }
	];

	let users = $state<User[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let showModal = $state(false);
	let editingUser = $state<User | null>(null);
	let saving = $state(false);
	let showDeleteConfirm = $state(false);
	let userToDelete = $state<User | null>(null);
	let showClearConfirm = $state(false);
	let clearing = $state(false);

	// Form state
	let formName = $state('');
	let formEmail = $state('');
	let formPassword = $state('');
	let formRole = $state<'admin' | 'funcionario'>('funcionario');
	let formModules = $state<string[]>([]);
	let formStatus = $state<'ativo' | 'inativo'>('ativo');

	// Element refs for animations
	let pageContainer: HTMLElement | undefined = $state();
	let tableRows: HTMLElement[] = $state([]);
	let modalElement: HTMLElement | undefined = $state();
	let errorElement: HTMLElement | undefined = $state();
	
	let initialized = $state(false);

	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			loadUsers();
			if (pageContainer) {
				fadeIn(pageContainer, { duration: 0.4 });
			}
		}
	});

	async function loadUsers() {
		loading = true;
		error = null;
		try {
			users = await api.get<User[]>('/admin/users');
			setTimeout(() => {
				if (tableRows.length > 0) {
					staggerIn(tableRows.filter(Boolean), { duration: 0.3, stagger: 0.05 });
				}
			}, 100);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erro ao carregar usuários';
			if (errorElement) shake(errorElement);
		} finally {
			loading = false;
		}
	}

	function openCreateModal() {
		editingUser = null;
		formName = '';
		formEmail = '';
		formPassword = '';
		formRole = 'funcionario';
		formModules = [];
		formStatus = 'ativo';
		showModal = true;
		setTimeout(() => {
			if (modalElement) scaleIn(modalElement, { duration: 0.25 });
		}, 10);
	}

	function openEditModal(user: User) {
		editingUser = user;
		formName = user.name;
		formEmail = user.email;
		formPassword = '';
		formRole = user.role;
		formModules = [...user.modules];
		formStatus = user.status;
		showModal = true;
		setTimeout(() => {
			if (modalElement) scaleIn(modalElement, { duration: 0.25 });
		}, 10);
	}

	function closeModal() {
		showModal = false;
		editingUser = null;
	}

	function toggleModule(moduleId: string) {
		if (formModules.includes(moduleId)) {
			formModules = formModules.filter(m => m !== moduleId);
		} else {
			formModules = [...formModules, moduleId];
		}
	}

	async function handleSubmit() {
		if (!formName || !formEmail || (!editingUser && !formPassword)) {
			error = 'Preencha todos os campos obrigatórios';
			if (errorElement) shake(errorElement);
			return;
		}

		saving = true;
		error = null;

		try {
			if (editingUser) {
				const updateData: Record<string, unknown> = {
					name: formName,
					email: formEmail,
					role: formRole,
					modules: formModules,
					status: formStatus
				};
				if (formPassword) {
					updateData.password = formPassword;
				}
				await api.put(`/admin/users/${editingUser.id}`, updateData);
			} else {
				await api.post('/admin/users', {
					name: formName,
					email: formEmail,
					password: formPassword,
					role: formRole,
					modules: formModules
				});
			}
			closeModal();
			await loadUsers();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erro ao salvar usuário';
			if (errorElement) shake(errorElement);
		} finally {
			saving = false;
		}
	}

	function confirmDelete(user: User) {
		userToDelete = user;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		if (!userToDelete) return;
		try {
			await api.delete(`/admin/users/${userToDelete.id}`);
			showDeleteConfirm = false;
			userToDelete = null;
			await loadUsers();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erro ao excluir usuário';
		}
	}

	async function handleClearTestData() {
		clearing = true;
		error = null;
		try {
			await api.post('/admin/clear-test-data', {});
			showClearConfirm = false;
			await loadUsers();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Erro ao limpar dados';
		} finally {
			clearing = false;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}
</script>

<div bind:this={pageContainer} class="space-y-6" style="opacity: 0;">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold" style="color: var(--text-primary);">Gerenciar Usuários</h1>
			<p class="mt-1" style="color: var(--text-muted);">Crie, edite e gerencie os usuários do sistema</p>
		</div>
		<div class="flex gap-3">
			<button
				onclick={() => showClearConfirm = true}
				class="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02]"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
				</svg>
				Limpar Sistema
			</button>
			<button
				onclick={openCreateModal}
				class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02]"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				Novo Usuário
			</button>
		</div>
	</div>

	{#if error}
		<div bind:this={errorElement} class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
			<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			{error}
		</div>
	{/if}

	<div class="rounded-lg overflow-hidden transition-colors duration-300" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">
		{#if loading}
			<div class="p-8 text-center">
				<div class="relative inline-block">
					<div class="w-10 h-10 border-4 border-blue-500/30 rounded-full"></div>
					<div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
				</div>
				<p class="mt-4" style="color: var(--text-muted);">Carregando usuários...</p>
			</div>
		{:else if users.length === 0}
			<div class="p-8 text-center">
				<svg class="w-12 h-12 mx-auto mb-4" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
				<p style="color: var(--text-muted);">Nenhum usuário cadastrado</p>
				<button onclick={openCreateModal} class="mt-4 text-blue-400 hover:text-blue-300 transition-colors">
					Criar primeiro usuário
				</button>
			</div>
		{:else}
			<table class="w-full">
				<thead style="background-color: var(--bg-tertiary);">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-secondary);">Nome</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-secondary);">Email</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-secondary);">Função</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-secondary);">Status</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-secondary);">Módulos</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style="color: var(--text-secondary);">Criado em</th>
						<th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style="color: var(--text-secondary);">Ações</th>
					</tr>
				</thead>
				<tbody>
					{#each users as user, i}
						<tr bind:this={tableRows[i]} class="transition-colors duration-200 admin-table-row" style="opacity: 0; border-bottom: 1px solid var(--border-color);">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/25">
										<span class="text-white text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
									</div>
									<span class="font-medium" style="color: var(--text-primary);">{user.name}</span>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap" style="color: var(--text-secondary);">{user.email}</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 py-1 text-xs rounded-full {user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}">
									{user.role === 'admin' ? 'Administrador' : 'Funcionário'}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="px-2 py-1 text-xs rounded-full {user.status === 'ativo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
									{user.status === 'ativo' ? 'Ativo' : 'Inativo'}
								</span>
							</td>
							<td class="px-6 py-4">
								<div class="flex flex-wrap gap-1 max-w-xs">
									{#if user.role === 'admin'}
										<span class="px-2 py-0.5 text-xs rounded" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Todos</span>
									{:else if user.modules.length === 0}
										<span class="text-xs" style="color: var(--text-muted);">Nenhum</span>
									{:else}
										{#each user.modules.slice(0, 3) as mod}
											<span class="px-2 py-0.5 text-xs rounded" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">{mod}</span>
										{/each}
										{#if user.modules.length > 3}
											<span class="px-2 py-0.5 text-xs rounded" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">+{user.modules.length - 3}</span>
										{/if}
									{/if}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm" style="color: var(--text-muted);">{formatDate(user.createdAt)}</td>
							<td class="px-6 py-4 whitespace-nowrap text-right">
								<div class="flex items-center justify-end gap-2">
									<button onclick={() => openEditModal(user)} class="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-gray-400 hover:text-blue-400" title="Editar">
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</button>
									<button onclick={() => confirmDelete(user)} class="p-2 rounded-lg transition-all duration-200 hover:scale-110 text-gray-400 hover:text-red-400" title="Excluir">
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>


{#if showModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div bind:this={modalElement} class="rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto" style="background-color: var(--bg-card); opacity: 0;">
			<div class="p-6" style="border-bottom: 1px solid var(--border-color);">
				<h2 class="text-xl font-semibold" style="color: var(--text-primary);">
					{editingUser ? 'Editar Usuário' : 'Novo Usuário'}
				</h2>
			</div>

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-6 space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">Nome *</label>
					<input type="text" id="name" bind:value={formName} class="w-full px-3 py-2 rounded-lg transition-colors admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="Nome completo" required />
				</div>

				<div>
					<label for="email" class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">Email *</label>
					<input type="email" id="email" bind:value={formEmail} class="w-full px-3 py-2 rounded-lg transition-colors admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="email@exemplo.com" required />
				</div>

				<div>
					<label for="password" class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">
						Senha {editingUser ? '(deixe em branco para manter)' : '*'}
					</label>
					<input type="password" id="password" bind:value={formPassword} class="w-full px-3 py-2 rounded-lg transition-colors admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);" placeholder="••••••••" required={!editingUser} minlength="6" />
				</div>

				<div>
					<label for="role" class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">Função *</label>
					<select id="role" bind:value={formRole} class="w-full px-3 py-2 rounded-lg transition-colors admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
						<option value="funcionario">Funcionário</option>
						<option value="admin">Administrador</option>
					</select>
				</div>

				{#if editingUser}
					<div>
						<label for="status" class="block text-sm font-medium mb-1" style="color: var(--text-secondary);">Status</label>
						<select id="status" bind:value={formStatus} class="w-full px-3 py-2 rounded-lg transition-colors admin-input" style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);">
							<option value="ativo">Ativo</option>
							<option value="inativo">Inativo</option>
						</select>
					</div>
				{/if}

				<div>
					<span class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">Módulos de Acesso</span>
					{#if formRole === 'admin'}
						<p class="text-sm" style="color: var(--text-muted);">Administradores têm acesso a todos os módulos.</p>
					{:else}
						<div class="grid grid-cols-2 gap-2">
							{#each AVAILABLE_MODULES as mod}
								<label class="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors" style="background-color: var(--bg-input);">
									<input type="checkbox" checked={formModules.includes(mod.id)} onchange={() => toggleModule(mod.id)} class="w-4 h-4 rounded border-gray-500 text-blue-600" />
									<span class="text-sm" style="color: var(--text-secondary);">{mod.label}</span>
								</label>
							{/each}
						</div>
					{/if}
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button type="button" onclick={closeModal} class="px-4 py-2 rounded-lg transition-all duration-200" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">
						Cancelar
					</button>
					<button type="submit" disabled={saving} class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/25">
						{#if saving}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						{/if}
						{editingUser ? 'Salvar' : 'Criar'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showDeleteConfirm && userToDelete}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="rounded-lg w-full max-w-md" style="background-color: var(--bg-card);">
			<div class="p-6">
				<div class="flex items-center gap-4 mb-4">
					<div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<div>
						<h3 class="text-lg font-semibold" style="color: var(--text-primary);">Excluir Usuário</h3>
						<p class="text-sm" style="color: var(--text-muted);">Esta ação não pode ser desfeita.</p>
					</div>
				</div>
				<p class="mb-6" style="color: var(--text-secondary);">
					Tem certeza que deseja excluir o usuário <span class="font-semibold" style="color: var(--text-primary);">{userToDelete.name}</span>?
				</p>
				<div class="flex justify-end gap-3">
					<button onclick={() => { showDeleteConfirm = false; userToDelete = null; }} class="px-4 py-2 rounded-lg transition-all duration-200" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">
						Cancelar
					</button>
					<button onclick={handleDelete} class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200">
						Excluir
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if showClearConfirm}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="rounded-lg w-full max-w-md" style="background-color: var(--bg-card);">
			<div class="p-6">
				<div class="flex items-center gap-4 mb-4">
					<div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
						<svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>
					<div>
						<h3 class="text-lg font-semibold" style="color: var(--text-primary);">Limpar Sistema</h3>
						<p class="text-sm" style="color: var(--text-muted);">Esta ação não pode ser desfeita.</p>
					</div>
				</div>
				<p class="mb-4" style="color: var(--text-secondary);">Esta ação irá remover:</p>
				<ul class="text-sm mb-6 space-y-1 list-disc list-inside" style="color: var(--text-muted);">
					<li>Todos os usuários funcionários</li>
					<li>Todos os relatórios gerados</li>
					<li>Todas as ordens de serviço</li>
					<li>Todas as pesquisas de satisfação</li>
					<li>Todos os colaboradores</li>
				</ul>
				<p class="text-yellow-400 text-sm mb-6">⚠️ Usuários administradores serão mantidos.</p>
				<div class="flex justify-end gap-3">
					<button onclick={() => showClearConfirm = false} class="px-4 py-2 rounded-lg transition-all duration-200" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">
						Cancelar
					</button>
					<button onclick={handleClearTestData} disabled={clearing} class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
						{#if clearing}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						{/if}
						Limpar Sistema
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.admin-table-row:hover {
		background-color: var(--bg-hover);
	}
	
	.admin-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}
</style>
