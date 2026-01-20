<script lang="ts">
	import { api } from '$lib/api';
	import { browser } from '$app/environment';
	import { fadeIn, staggerIn } from '$lib/utils/animations';

	interface Backup {
		id: string;
		name: string;
		description: string | null;
		fileSize: number;
		createdAt: string;
	}

	let backups = $state<Backup[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let creating = $state(false);
	let deleting = $state<string | null>(null);
	let downloading = $state<string | null>(null);
	
	// Refs for animations
	let pageContainer: HTMLElement;
	let backupCards: HTMLElement[] = [];
	
	// Form state
	let showCreateModal = $state(false);
	let newBackupName = $state('');
	let newBackupDescription = $state('');

	let initialized = $state(false);

	$effect(() => {
		if (browser && !initialized) {
			initialized = true;
			if (pageContainer) {
				fadeIn(pageContainer, { duration: 0.4 });
			}
			loadBackups();
		}
	});

	async function loadBackups() {
		loading = true;
		error = null;
		try {
			const response = await api.get<Backup[]>('/admin/backups');
			backups = response;
			
			// Animate backup cards
			setTimeout(() => {
				if (backupCards.length > 0) {
					staggerIn(backupCards.filter(Boolean), { duration: 0.3, stagger: 0.05 });
				}
			}, 100);
		} catch (e: any) {
			error = e.message || 'Erro ao carregar backups';
		} finally {
			loading = false;
		}
	}

	async function createBackup() {
		if (!newBackupName.trim()) {
			error = 'Nome do backup é obrigatório';
			return;
		}

		creating = true;
		error = null;
		try {
			const backup = await api.post<Backup>('/admin/backups', {
				name: newBackupName.trim(),
				description: newBackupDescription.trim() || null
			});
			backups = [backup, ...backups];
			showCreateModal = false;
			newBackupName = '';
			newBackupDescription = '';
		} catch (e: any) {
			error = e.message || 'Erro ao criar backup';
		} finally {
			creating = false;
		}
	}

	async function downloadBackup(backup: Backup) {
		downloading = backup.id;
		try {
			const response = await fetch(`http://localhost:3000/api/admin/backups/${backup.id}/download`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			
			if (!response.ok) throw new Error('Erro ao baixar backup');
			
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `backup_${backup.name.replace(/\s+/g, '_')}_${new Date(backup.createdAt).toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (e: any) {
			error = e.message || 'Erro ao baixar backup';
		} finally {
			downloading = null;
		}
	}

	async function deleteBackup(backup: Backup) {
		if (!confirm(`Tem certeza que deseja excluir o backup "${backup.name}"?`)) {
			return;
		}

		deleting = backup.id;
		try {
			await api.delete(`/admin/backups/${backup.id}`);
			backups = backups.filter(b => b.id !== backup.id);
		} catch (e: any) {
			error = e.message || 'Erro ao excluir backup';
		} finally {
			deleting = null;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString('pt-BR');
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

<div bind:this={pageContainer} class="space-y-6" style="opacity: 0;">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-theme-primary">💾 Backups</h1>
			<p class="text-theme-muted mt-1">Gerencie backups do sistema</p>
		</div>
		
		<button
			onclick={() => showCreateModal = true}
			class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
		>
			<span>➕</span>
			Criar Backup
		</button>
	</div>

	{#if error}
		<div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 animate-fade-in">
			{error}
			<button onclick={() => error = null} class="ml-2 underline hover:no-underline">Fechar</button>
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
		</div>
	{:else if backups.length === 0}
		<div class="rounded-lg p-12 text-center border transition-colors duration-300" style="background-color: var(--bg-card); border-color: var(--border-color);">
			<div class="text-6xl mb-4">💾</div>
			<h3 class="text-xl font-medium text-theme-primary mb-2">Nenhum backup encontrado</h3>
			<p class="text-theme-muted mb-4">Crie um backup para proteger seus dados</p>
			<button
				onclick={() => showCreateModal = true}
				class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
			>
				Criar primeiro backup
			</button>
		</div>
	{:else}
		<div class="grid gap-4">
			{#each backups as backup, i}
				<div 
					bind:this={backupCards[i]}
					class="rounded-lg p-4 flex items-center justify-between border transition-all duration-300 hover:scale-[1.01] card-hover"
					style="background-color: var(--bg-card); border-color: var(--border-color); opacity: 0;"
				>
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center text-2xl">
							💾
						</div>
						<div>
							<h3 class="text-theme-primary font-medium">{backup.name}</h3>
							{#if backup.description}
								<p class="text-theme-muted text-sm">{backup.description}</p>
							{/if}
							<div class="flex items-center gap-4 mt-1 text-sm text-theme-muted">
								<span>📅 {formatDate(backup.createdAt)}</span>
								<span>📦 {formatFileSize(backup.fileSize)}</span>
							</div>
						</div>
					</div>
					
					<div class="flex items-center gap-2">
						<button
							onclick={() => downloadBackup(backup)}
							disabled={downloading === backup.id}
							class="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded-lg transition-all duration-200 hover:scale-105"
						>
							{downloading === backup.id ? '...' : '⬇️ Baixar'}
						</button>
						<button
							onclick={() => deleteBackup(backup)}
							disabled={deleting === backup.id}
							class="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition-all duration-200 hover:scale-105"
						>
							{deleting === backup.id ? '...' : '🗑️ Excluir'}
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal de criação de backup -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
		<div class="rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in" style="background-color: var(--bg-card); border: 1px solid var(--border-color);">
			<h3 class="text-xl font-bold text-theme-primary mb-4">💾 Criar Backup</h3>
			
			<div class="space-y-4">
				<div>
					<label for="backup-name" class="block text-sm font-medium text-theme-secondary mb-1">Nome do Backup *</label>
					<input
						id="backup-name"
						type="text"
						bind:value={newBackupName}
						placeholder="Ex: Backup semanal"
						class="w-full px-3 py-2 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
						style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
					/>
				</div>
				
				<div>
					<label for="backup-description" class="block text-sm font-medium text-theme-secondary mb-1">Descrição (opcional)</label>
					<textarea
						id="backup-description"
						bind:value={newBackupDescription}
						placeholder="Descrição do backup..."
						rows="3"
						class="w-full px-3 py-2 rounded-lg transition-colors duration-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
						style="background-color: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary);"
					></textarea>
				</div>
			</div>
			
			<div class="flex justify-end gap-3 mt-6">
				<button
					onclick={() => {
						showCreateModal = false;
						newBackupName = '';
						newBackupDescription = '';
					}}
					class="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
					style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
				>
					Cancelar
				</button>
				<button
					onclick={createBackup}
					disabled={creating || !newBackupName.trim()}
					class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-all duration-200 hover:scale-105"
				>
					{creating ? 'Criando...' : 'Criar Backup'}
				</button>
			</div>
		</div>
	</div>
{/if}

