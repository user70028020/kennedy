<script lang="ts">
	import { api } from '$lib/api';

	interface ServiceOrder {
		id: string;
		osNumber: string;
		clientName: string;
		teamLeader: string;
		equipmentType: string;
		location: string;
		status: string;
		periodStart: string;
		periodEnd: string;
		_count?: {
			reports: number;
		};
		reports?: Array<{
			id: string;
			type: string;
			fileName: string;
			createdAt: string;
		}>;
	}

	interface Props {
		onClose: () => void;
		onSuccess?: () => void;
	}

	let { onClose, onSuccess }: Props = $props();

	let loading = $state(true);
	let submitting = $state(false);
	let serviceOrders = $state<ServiceOrder[]>([]);
	let selectedOS = $state<string>('');
	let selectedOSDetails = $state<ServiceOrder | null>(null);
	let error = $state<string>('');
	let successMessage = $state<string>('');

	$effect(() => {
		loadServiceOrders();
	});

	async function loadServiceOrders() {
		try {
			loading = true;
			error = '';
			const data = await api.get<ServiceOrder[]>('/reports/service-orders');
			serviceOrders = data;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao carregar ordens de serviço';
		} finally {
			loading = false;
		}
	}

	async function loadOSDetails(osNumber: string) {
		if (!osNumber) {
			selectedOSDetails = null;
			return;
		}

		try {
			const data = await api.get<{ serviceOrder: ServiceOrder; reports: any[]; reportCount: number }>(
				`/reports/service-orders/${osNumber}/reports`
			);
			selectedOSDetails = {
				...data.serviceOrder,
				reports: data.reports,
				_count: { reports: data.reportCount }
			};
		} catch (err) {
			console.error('Error loading OS details:', err);
		}
	}

	function handleOSChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedOS = target.value;
		loadOSDetails(target.value);
	}

	async function handleFinalize() {
		if (!selectedOS) {
			error = 'Selecione uma ordem de serviço';
			return;
		}

		try {
			submitting = true;
			error = '';

			const result = await api.post<{ success: boolean; message: string; reportCount: number }>(
				'/reports/finalizar-os',
				{ osNumber: selectedOS }
			);

			successMessage = `${result.message}. ${result.reportCount} relatório(s) disponível(is) para mesclagem.`;
			
			// Wait a moment to show success message
			setTimeout(() => {
				onSuccess?.();
				onClose();
			}, 2000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao finalizar ordem de serviço';
		} finally {
			submitting = false;
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('pt-BR');
	}

	function getReportTypeName(type: string): string {
		const names: Record<string, string> = {
			fotografico: 'Fotográfico',
			tecnico: 'Técnico',
			spda: 'SPDA',
			rdo: 'RDO',
			gastos: 'Gastos',
			mesclado: 'Mesclado'
		};
		return names[type] || type;
	}
</script>

<!-- Modal Backdrop -->
<div 
	class="fixed inset-0 flex items-center justify-center z-50 p-4"
	style="background-color: rgba(0, 0, 0, 0.7);"
	onclick={(e) => e.target === e.currentTarget && onClose()}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
	tabindex="-1"
>
	<div class="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden" style="background-color: var(--bg-secondary);">
		<!-- Header -->
		<div class="flex items-center justify-between p-4" style="border-bottom: 1px solid var(--border-color);">
			<h2 id="modal-title" class="text-xl font-semibold" style="color: var(--text-primary);">Finalizar Ordem de Serviço</h2>
			<button
				onclick={onClose}
				class="transition"
				style="color: var(--text-muted);"
				onmouseenter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
				onmouseleave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
				aria-label="Fechar"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
			{#if loading}
				<div class="flex items-center justify-center py-8">
					<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			{:else if successMessage}
				<div class="modern-alert-success">
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						{successMessage}
					</div>
				</div>
			{:else}
				{#if error}
					<div class="modern-alert-error">
						{error}
					</div>
				{/if}

				{#if serviceOrders.length === 0}
					<div class="text-center py-8" style="color: var(--text-muted);">
						<svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<p>Nenhuma ordem de serviço ativa encontrada.</p>
						<p class="text-sm mt-2">Solicite ao administrador para criar uma nova OS.</p>
					</div>
				{:else}
					<div class="space-y-4">
						<!-- OS Selection -->
						<div>
							<label for="os-select" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
								Selecione a Ordem de Serviço
							</label>
							<select
								id="os-select"
								value={selectedOS}
								onchange={handleOSChange}
								class="modern-select"
							>
								<option value="">-- Selecione uma OS --</option>
								{#each serviceOrders as os}
									<option value={os.osNumber}>
										{os.osNumber} - {os.clientName} ({os._count?.reports || 0} relatórios)
									</option>
								{/each}
							</select>
						</div>

						<!-- OS Details -->
						{#if selectedOSDetails}
							<div class="rounded-lg p-4 space-y-3" style="background-color: var(--bg-tertiary);">
								<h3 class="font-medium" style="color: var(--text-primary);">Detalhes da OS</h3>
								
								<div class="grid grid-cols-2 gap-3 text-sm">
									<div>
										<span style="color: var(--text-muted);">Cliente:</span>
										<span class="ml-2" style="color: var(--text-primary);">{selectedOSDetails.clientName}</span>
									</div>
									<div>
										<span style="color: var(--text-muted);">Líder:</span>
										<span class="ml-2" style="color: var(--text-primary);">{selectedOSDetails.teamLeader}</span>
									</div>
									<div>
										<span style="color: var(--text-muted);">Equipamento:</span>
										<span class="ml-2" style="color: var(--text-primary);">{selectedOSDetails.equipmentType}</span>
									</div>
									<div>
										<span style="color: var(--text-muted);">Local:</span>
										<span class="ml-2" style="color: var(--text-primary);">{selectedOSDetails.location}</span>
									</div>
									<div>
										<span style="color: var(--text-muted);">Período:</span>
										<span class="ml-2" style="color: var(--text-primary);">
											{formatDate(selectedOSDetails.periodStart)} - {formatDate(selectedOSDetails.periodEnd)}
										</span>
									</div>
								</div>

								<!-- Reports List -->
								<div class="mt-4">
									<h4 class="text-sm font-medium mb-2" style="color: var(--text-secondary);">
										Relatórios Gerados ({selectedOSDetails.reports?.length || 0})
									</h4>
									
									{#if selectedOSDetails.reports && selectedOSDetails.reports.length > 0}
										<div class="space-y-2 max-h-40 overflow-y-auto">
											{#each selectedOSDetails.reports as report}
												<div class="flex items-center justify-between rounded px-3 py-2 text-sm" style="background-color: var(--bg-hover);">
													<div class="flex items-center gap-2">
														<span class="px-2 py-0.5 bg-blue-600 rounded text-xs text-white">
															{getReportTypeName(report.type)}
														</span>
														<span class="truncate max-w-[200px]" style="color: var(--text-secondary);">{report.fileName}</span>
													</div>
													<span class="text-xs" style="color: var(--text-muted);">{formatDate(report.createdAt)}</span>
												</div>
											{/each}
										</div>
									{:else}
										<div class="modern-alert-warning">
											⚠️ Nenhum relatório gerado para esta OS. Gere pelo menos um relatório antes de finalizar.
										</div>
									{/if}
								</div>
							</div>
						{/if}

						<!-- Info Box -->
						<div class="modern-alert-info">
							<div class="flex gap-2">
								<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<div>
									<p class="font-medium">Ao finalizar a OS:</p>
									<ul class="mt-1 list-disc list-inside space-y-1">
										<li>O status será alterado para "Concluída"</li>
										<li>Os relatórios ficarão disponíveis para mesclagem no painel admin</li>
										<li>Não será possível gerar novos relatórios para esta OS</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>

		<!-- Footer -->
		{#if !loading && !successMessage && serviceOrders.length > 0}
			<div class="flex items-center justify-end gap-3 p-4" style="border-top: 1px solid var(--border-color);">
				<button
					onclick={onClose}
					class="px-4 py-2 transition"
					style="color: var(--text-secondary);"
					onmouseenter={(e) => !submitting && (e.currentTarget.style.color = 'var(--text-primary)')}
					onmouseleave={(e) => !submitting && (e.currentTarget.style.color = 'var(--text-secondary)')}
					disabled={submitting}
				>
					Cancelar
				</button>
				<button
					onclick={handleFinalize}
					disabled={!selectedOS || submitting || (selectedOSDetails?.reports?.length === 0)}
					class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition flex items-center gap-2"
				>
					{#if submitting}
						<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						Finalizando...
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Finalizar OS
					{/if}
				</button>
			</div>
		{/if}
	</div>
</div>
