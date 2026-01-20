<script lang="ts">
	/**
	 * SatisfactionSurveyModal Component
	 * Modal para coleta de pesquisa de satisfação do cliente
	 * Requirements: 14.1, 14.2, 14.3, 14.4
	 */

	import { api } from '$lib/api';

	interface Props {
		osNumber?: string;
		onClose: () => void;
		onSuccess?: () => void;
	}

	let { osNumber = '', onClose, onSuccess }: Props = $props();

	// Form state
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	// Client data (Requirement 14.1)
	let razaoSocial = $state('');
	let responsavel = $state('');
	let telefone = $state('');
	let cidade = $state('');
	let uf = $state('');
	let cep = $state('');
	let endereco = $state('');
	let osNumberInput = $state('');

	// Initialize osNumberInput from prop
	$effect(() => {
		if (osNumber && !osNumberInput) {
			osNumberInput = osNumber;
		}
	});

	// Ratings 1-5 (Requirement 14.2)
	let atendimento = $state(0);
	let apresentacao = $state(0);
	let prazo = $state(0);
	let competencia = $state(0);
	let confiabilidade = $state(0);

	// Recommendation (Requirement 14.3)
	let recomendaria = $state<boolean | null>(null);

	// Suggestions/Complaints (Requirement 14.4)
	let sugestoes = $state('');

	// Brazilian states
	const estados = [
		'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
		'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
		'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
	];

	// Rating labels
	const ratingLabels = [
		{ key: 'atendimento', label: 'Atendimento' },
		{ key: 'apresentacao', label: 'Apresentação' },
		{ key: 'prazo', label: 'Prazo' },
		{ key: 'competencia', label: 'Competência' },
		{ key: 'confiabilidade', label: 'Confiabilidade' }
	];

	function getRatingValue(key: string): number {
		switch (key) {
			case 'atendimento': return atendimento;
			case 'apresentacao': return apresentacao;
			case 'prazo': return prazo;
			case 'competencia': return competencia;
			case 'confiabilidade': return confiabilidade;
			default: return 0;
		}
	}

	function setRatingValue(key: string, value: number) {
		switch (key) {
			case 'atendimento': atendimento = value; break;
			case 'apresentacao': apresentacao = value; break;
			case 'prazo': prazo = value; break;
			case 'competencia': competencia = value; break;
			case 'confiabilidade': confiabilidade = value; break;
		}
	}

	function formatCEP(value: string): string {
		const numbers = value.replace(/\D/g, '');
		if (numbers.length <= 5) return numbers;
		return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
	}

	function formatPhone(value: string): string {
		const numbers = value.replace(/\D/g, '');
		if (numbers.length <= 2) return numbers;
		if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
		return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
	}

	function handleCEPInput(e: Event) {
		const input = e.target as HTMLInputElement;
		cep = formatCEP(input.value);
	}

	function handlePhoneInput(e: Event) {
		const input = e.target as HTMLInputElement;
		telefone = formatPhone(input.value);
	}

	function validateForm(): boolean {
		if (!osNumberInput.trim()) {
			error = 'Número da OS é obrigatório';
			return false;
		}
		if (!razaoSocial.trim()) {
			error = 'Razão Social é obrigatória';
			return false;
		}
		if (!responsavel.trim()) {
			error = 'Nome do responsável é obrigatório';
			return false;
		}
		if (!telefone.trim()) {
			error = 'Telefone é obrigatório';
			return false;
		}
		if (!cidade.trim()) {
			error = 'Cidade é obrigatória';
			return false;
		}
		if (!uf) {
			error = 'UF é obrigatório';
			return false;
		}
		if (!cep.trim()) {
			error = 'CEP é obrigatório';
			return false;
		}
		if (!endereco.trim()) {
			error = 'Endereço é obrigatório';
			return false;
		}
		if (atendimento === 0 || apresentacao === 0 || prazo === 0 || competencia === 0 || confiabilidade === 0) {
			error = 'Todas as avaliações são obrigatórias';
			return false;
		}
		if (recomendaria === null) {
			error = 'Por favor, responda se recomendaria a SERCAMP';
			return false;
		}
		return true;
	}

	async function handleSubmit() {
		error = '';
		
		if (!validateForm()) return;

		loading = true;

		try {
			await api.post('/reports/pesquisa', {
				osNumber: osNumberInput,
				razaoSocial,
				responsavel,
				telefone,
				cidade,
				uf,
				cep,
				endereco,
				atendimento,
				apresentacao,
				prazo,
				competencia,
				confiabilidade,
				recomendaria,
				sugestoes: sugestoes.trim() || null
			});

			success = true;
			onSuccess?.();
			
			// Close after showing success message
			setTimeout(() => {
				onClose();
			}, 2000);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao enviar pesquisa';
		} finally {
			loading = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
	class="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
	style="background-color: rgba(0, 0, 0, 0.6);"
	onclick={handleBackdropClick}
>
	<div class="rounded-lg w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto" style="background-color: var(--bg-secondary);">
		<!-- Header -->
		<div class="sticky top-0 px-6 py-4 flex items-center justify-between" style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
			<h2 class="text-xl font-bold" style="color: var(--text-primary);">Pesquisa de Satisfação</h2>
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

		{#if success}
			<!-- Success Message -->
			<div class="p-6 text-center">
				<div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: rgba(16, 185, 129, 0.2);">
					<svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold mb-2" style="color: var(--text-primary);">Pesquisa Enviada!</h3>
				<p style="color: var(--text-muted);">Obrigado pelo seu feedback.</p>
			</div>
		{:else}
			<!-- Form -->
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-6 space-y-6">
				{#if error}
					<div class="modern-alert-error">
						{error}
					</div>
				{/if}

				<!-- OS Number -->
				<div>
					<label for="osNumber" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
						Número da OS <span class="text-red-500">*</span>
					</label>
					<input
						id="osNumber"
						type="text"
						bind:value={osNumberInput}
						placeholder="Ex: OS-2024-001"
						class="modern-input"
					/>
				</div>

				<!-- Client Data Section -->
				<div class="space-y-4">
					<h3 class="text-lg font-semibold pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
						Dados do Cliente
					</h3>

					<div>
						<label for="razaoSocial" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
							Razão Social <span class="text-red-500">*</span>
						</label>
						<input
							id="razaoSocial"
							type="text"
							bind:value={razaoSocial}
							placeholder="Nome da empresa"
							class="modern-input"
						/>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label for="responsavel" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
								Responsável <span class="text-red-500">*</span>
							</label>
							<input
								id="responsavel"
								type="text"
								bind:value={responsavel}
								placeholder="Nome do responsável"
								class="modern-input"
							/>
						</div>

						<div>
							<label for="telefone" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
								Telefone <span class="text-red-500">*</span>
							</label>
							<input
								id="telefone"
								type="tel"
								value={telefone}
								oninput={handlePhoneInput}
								placeholder="(00) 00000-0000"
								maxlength="15"
								class="modern-input"
							/>
						</div>
					</div>

					<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div class="col-span-2 md:col-span-2">
							<label for="cidade" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
								Cidade <span class="text-red-500">*</span>
							</label>
							<input
								id="cidade"
								type="text"
								bind:value={cidade}
								placeholder="Cidade"
								class="modern-input"
							/>
						</div>

						<div>
							<label for="uf" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
								UF <span class="text-red-500">*</span>
							</label>
							<select
								id="uf"
								bind:value={uf}
								class="modern-select"
							>
								<option value="">UF</option>
								{#each estados as estado}
									<option value={estado}>{estado}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="cep" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
								CEP <span class="text-red-500">*</span>
							</label>
							<input
								id="cep"
								type="text"
								value={cep}
								oninput={handleCEPInput}
								placeholder="00000-000"
								maxlength="9"
								class="modern-input"
							/>
						</div>
					</div>

					<div>
						<label for="endereco" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
							Endereço <span class="text-red-500">*</span>
						</label>
						<input
							id="endereco"
							type="text"
							bind:value={endereco}
							placeholder="Rua, número, bairro"
							class="modern-input"
						/>
					</div>
				</div>

				<!-- Ratings Section -->
				<div class="space-y-4">
					<h3 class="text-lg font-semibold pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
						Avaliação do Serviço
					</h3>
					<p class="text-sm" style="color: var(--text-muted);">Avalie de 1 (ruim) a 5 (excelente)</p>

					{#each ratingLabels as { key, label }}
						<div class="flex items-center justify-between">
							<span style="color: var(--text-secondary);">{label} <span class="text-red-500">*</span></span>
							<div class="flex gap-2">
								{#each [1, 2, 3, 4, 5] as value}
									<button
										type="button"
										onclick={() => setRatingValue(key, value)}
										class="w-10 h-10 rounded-lg font-semibold transition"
										style={getRatingValue(key) === value 
											? 'background-color: #3b82f6; color: white;' 
											: `background-color: var(--bg-tertiary); color: var(--text-muted);`}
										onmouseenter={(e) => { if (getRatingValue(key) !== value) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
										onmouseleave={(e) => { if (getRatingValue(key) !== value) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
									>
										{value}
									</button>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<!-- Recommendation Section -->
				<div class="space-y-4">
					<h3 class="text-lg font-semibold pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
						Recomendação
					</h3>

					<div>
						<p class="mb-3" style="color: var(--text-secondary);">Você recomendaria a SERCAMP? <span class="text-red-500">*</span></p>
						<div class="flex gap-4">
							<button
								type="button"
								onclick={() => recomendaria = true}
								class="flex-1 py-3 rounded-lg font-semibold transition"
								style={recomendaria === true 
									? 'background-color: #10b981; color: white;' 
									: `background-color: var(--bg-tertiary); color: var(--text-muted);`}
								onmouseenter={(e) => { if (recomendaria !== true) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
								onmouseleave={(e) => { if (recomendaria !== true) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
							>
								SIM
							</button>
							<button
								type="button"
								onclick={() => recomendaria = false}
								class="flex-1 py-3 rounded-lg font-semibold transition"
								style={recomendaria === false 
									? 'background-color: #ef4444; color: white;' 
									: `background-color: var(--bg-tertiary); color: var(--text-muted);`}
								onmouseenter={(e) => { if (recomendaria !== false) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
								onmouseleave={(e) => { if (recomendaria !== false) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
							>
								NÃO
							</button>
						</div>
					</div>
				</div>

				<!-- Suggestions Section -->
				<div class="space-y-4">
					<h3 class="text-lg font-semibold pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
						Sugestões / Reclamações
					</h3>

					<div>
						<label for="sugestoes" class="block text-sm font-medium mb-2" style="color: var(--text-secondary);">
							Deixe seu comentário (opcional)
						</label>
						<textarea
							id="sugestoes"
							bind:value={sugestoes}
							rows="4"
							placeholder="Suas sugestões, reclamações ou comentários..."
							class="modern-textarea"
						></textarea>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-3 justify-end pt-4" style="border-top: 1px solid var(--border-color);">
					<button
						type="button"
						onclick={onClose}
						disabled={loading}
						class="px-4 py-2 rounded-lg transition disabled:opacity-50"
						style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
						onmouseenter={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
						onmouseleave={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
					>
						Cancelar
					</button>
					<button
						type="submit"
						disabled={loading}
						class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
					>
						{#if loading}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							Enviando...
						{:else}
							Enviar Pesquisa
						{/if}
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
