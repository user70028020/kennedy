<script lang="ts">
	import { api } from '$lib/api';
	import { browser } from '$app/environment';
	import { fadeIn, staggerIn } from '$lib/utils/animations';

	interface TrashItem {
		id: string;
		type: 'user' | 'service_order' | 'report' | 'template' | 'colaborador';
		name: string;
		deletedAt: string;
		details?: Record<string, any>;
	}

	let items = $state<TrashItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let restoring = $state<string | null>(null);
	let deleting = $state<string | null>(null);
	let emptyingTrash = $state(false);
	let showConfirmEmpty = $state(false);
	let filterType = $state<string>('all');

	let pageContainer: HTMLElement;
	let tableRows: HTMLElement[] = [];

	const typeLabels: Record<string, string> = {
		user: 'Usuário',
		service_order: 'Ordem de Serviço',
		report: 'Relatório',
		template: 'Template',
		colaborador: 'Colaborador'
	};

	const typeIcons: Record<string, string> = {
		user: '👤',
		service_order: '📋',
		report: '📄',
		template: '📝',
		colaborador: '👷'
	};

	let initialized = $state(false);

	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			if (pageContainer) fadeIn(pageContainer, { duration: 0.4 });
			loadTrash();
		}
	});

	async function loadTrash() {
		loading = true;
		error = null;
		try {
			items = await api.get<TrashItem[]>('/admin/trash');
			setTimeout(() => {
				if (tableRows.length > 0) staggerIn(tableRows.filter(Boolean), { duration: 0.2, stagger: 0.03 });
			}, 100);
		} catch (e: any) {
			error = e.message || 'Erro ao carregar lixeira';
		} finally {
			loading = false;
		}
	}

	async function restoreItem(item: TrashItem) {
		restoring = item.id;
		try {
			await api.post('/admin/trash/restore', { id: item.id, type: item.type });
			items = items.filter(i => i.id !== item.id);
		} catch (e: any) {
			error = e.message || 'Erro ao restaurar item';
		} finally {
			restoring = null;
		}
	}

	async function permanentDelete(item: TrashItem) {
		if (!confirm(`Excluir permanentemente "${item.name}"? Esta ação não pode ser desfeita.`)) return;
		deleting = item.id;
		try {
			await api.delete(`/admin/trash/${item.type}/${item.id}`);
			items = items.filter(i => i.id !== item.id);
		} catch (e: any) {
			error = e.message || 'Erro ao excluir item';
		} finally {
			deleting = null;
		}
	}

	async function emptyTrash() {
		emptyingTrash = true;
		try {
			await api.delete('/admin/trash');
			items = [];
			showConfirmEmpty = false;
		} catch (e: any) {
			error = e.message || 'Erro ao esvaziar lixeira';
		} finally {
			emptyingTrash = false;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString('pt-BR');
	}

	const filteredItems = $derived(filterType === 'all' ? items : items.filter(i => i.type === filterType));
</script>

<div bind:this={pageContainer} class="space-y-6" style="opacity: 0;">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-theme-primary">🗑️ Lixeira</h1>
			<p class="text-theme-muted mt-1">Itens excluídos podem ser restaurados ou removidos permanentemente</p>
		</div>
		{#if items.length > 0}
			<button onclick={() => showConfirmEmpty = true} class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105">
				<span>🗑️</span> Esvaziar Lixeira
			</button>
		{/if}
	</div>

	{#if error}
		<div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 animate-fade-in">
			{error}
			<button onclick={() => error = null} class="ml-2 underline">Fechar</button>
		</div>
	{/if}

	<div class="flex gap-2 flex-wrap">
		<button onclick={() => filterType = 'all'} class="px-3 py-1.5 rounded-lg text-sm transition-all duration-200 {filterType === 'all' ? 'bg-blue-600 text-white' : ''}" style={filterType !== 'all' ? `background-color: var(--bg-tertiary); color: var(--text-secondary);` : ''}>
			Todos ({items.length})
		</button>
		{#each Object.entries(typeLabels) as [type, label]}
			{@const count = items.filter(i => i.type === type).length}
			{#if count > 0}
				<button onclick={() => filterType = type} class="px-3 py-1.5 rounded-lg text-sm transition-all duration-200 {filterType === type ? 'bg-blue-600 text-white' : ''}" style={filterType !== type ? `background-color: var(--bg-tertiary); color: var(--text-secondary);` : ''}>
					{typeIcons[type]} {label} ({count})
				</button>
			{/if}
		{/each}
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if filteredItems.length === 0}
		<div class="rounded-lg p-12 text-center border" style="background-color: var(--bg-card); border-color: var(--border-color);">
			<div class="text-6xl mb-4">🗑️</div>
			<h3 class="text-xl font-medium text-theme-primary mb-2">Lixeira vazia</h3>
			<p class="text-theme-muted">Nenhum item excluído encontrado</p>
		</div>
	{:else}
		<div class="rounded-lg overflow-hidden border" style="background-color: var(--bg-card); border-color: var(--border-color);">
			<table class="w-full">
				<thead style="background-color: var(--bg-tertiary);">
					<tr>
						<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Tipo</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Nome</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Detalhes</th>
						<th class="px-4 py-3 text-left text-sm font-medium text-theme-secondary">Excluído em</th>
						<th class="px-4 py-3 text-right text-sm font-medium text-theme-secondary">Ações</th>
					</tr>
				</thead>
				<tbody class="divide-y" style="border-color: var(--border-color);">
					{#each filteredItems as item, i}
						<tr bind:this={tableRows[i]} class="transition-colors duration-200 hover:bg-theme-hover" style="opacity: 0;">
							<td class="px-4 py-3">
								<span class="inline-flex items-center gap-2 px-2 py-1 rounded text-sm" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">
									{typeIcons[item.type]} {typeLabels[item.type]}
								</span>
							</td>
							<td class="px-4 py-3 text-theme-primary font-medium">{item.name}</td>
							<td class="px-4 py-3 text-theme-muted text-sm">
								{#if item.details}
									{#each Object.entries(item.details) as [key, value]}
										<span class="mr-2">{key}: {value}</span>
									{/each}
								{:else}-{/if}
							</td>
							<td class="px-4 py-3 text-theme-muted text-sm">{formatDate(item.deletedAt)}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex items-center justify-end gap-2">
									<button onclick={() => restoreItem(item)} disabled={restoring === item.id} class="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-lg transition-all duration-200">
										{restoring === item.id ? '...' : '↩️ Restaurar'}
									</button>
									<button onclick={() => permanentDelete(item)} disabled={deleting === item.id} class="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition-all duration-200">
										{deleting === item.id ? '...' : '🗑️ Excluir'}
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

{#if showConfirmEmpty}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
		<div class="rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">
			<h3 class="text-xl font-bold text-theme-primary mb-4">⚠️ Esvaziar Lixeira</h3>
			<p class="text-theme-secondary mb-6">
				Excluir permanentemente todos os {items.length} itens?
				<strong class="text-red-400">Esta ação não pode ser desfeita.</strong>
			</p>
			<div class="flex justify-end gap-3">
				<button onclick={() => showConfirmEmpty = false} class="px-4 py-2 rounded-lg" style="background-color: var(--bg-tertiary); color: var(--text-secondary);">Cancelar</button>
				<button onclick={emptyTrash} disabled={emptyingTrash} class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg">
					{emptyingTrash ? 'Excluindo...' : 'Sim, esvaziar'}
				</button>
			</div>
		</div>
	</div>
{/if}

