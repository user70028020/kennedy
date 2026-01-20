<script lang="ts">
	/**
	 * Relatório de Gastos - Prestação de Contas
	 * Baseado no Next.js FOD expense-report-manager
	 */
	import { browser } from '$app/environment';
	import { auth } from '$lib/stores/auth.svelte';
	import { toast } from '$lib/stores/toast.svelte';

	const API_URL = 'http://localhost:3000/api';

	// Interfaces
	interface Receipt {
		id: string;
		fileName: string;
		fileData: string; // base64
		amount: number;
		description: string;
		category: string;
		uploadDate: string;
	}

	// Estados
	let template = $state<'nx-energy' | 'sercamp'>('sercamp');
	let osNumber = $state('');
	let clientName = $state('');
	let date = $state(new Date().toISOString().split('T')[0]);
	let userName = $state('');
	let receipts = $state<Receipt[]>([]);
	let approved = $state<boolean | null>(null); // null = não selecionado, true = aprovado, false = reprovado
	let observations = $state(''); // Ressalvas
	
	// Camera
	let isCameraOpen = $state(false);
	let videoElement = $state<HTMLVideoElement | null>(null);
	let canvasElement = $state<HTMLCanvasElement | null>(null);
	let stream = $state<MediaStream | null>(null);
	let fileInputElement = $state<HTMLInputElement | null>(null);
	
	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);

	// Inicializar nome do usuário
	$effect(() => {
		if (browser && auth.user) {
			userName = auth.user.name;
		}
	});

	// Cleanup camera stream
	$effect(() => {
		return () => {
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
			}
		};
	});

	async function startCamera() {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
				audio: false
			});
			
			stream = mediaStream;
			isCameraOpen = true;
			
			// Aguardar elemento estar disponível
			setTimeout(() => {
				if (videoElement) {
					videoElement.srcObject = mediaStream;
				}
			}, 100);
		} catch (err) {
			console.error('Erro ao acessar câmera:', err);
			toast.error('Não foi possível acessar a câmera');
		}
	}

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
			stream = null;
		}
		isCameraOpen = false;
	}

	function capturePhoto() {
		if (!videoElement || !canvasElement) return;

		const video = videoElement;
		const canvas = canvasElement;
		
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const context = canvas.getContext('2d');
		if (!context) return;

		context.drawImage(video, 0, 0, canvas.width, canvas.height);
		const imageData = canvas.toDataURL('image/jpeg');

		const newReceipt: Receipt = {
			id: `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			fileName: `Comprovante ${receipts.length + 1}`,
			fileData: imageData,
			amount: 0,
			description: `Comprovante ${receipts.length + 1}`,
			category: 'Geral',
			uploadDate: new Date().toISOString()
		};

		receipts = [...receipts, newReceipt];
		toast.success(`Comprovante ${receipts.length} adicionado`);
	}

	function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		
		if (!files || files.length === 0) return;

		const startIndex = receipts.length;
		
		Array.from(files).forEach((file, index) => {
			const reader = new FileReader();
			
			reader.onload = (event) => {
				const imageData = event.target?.result as string;
				const receiptNumber = startIndex + index + 1;
				
				const newReceipt: Receipt = {
					id: `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
					fileName: `Comprovante ${receiptNumber}`,
					fileData: imageData,
					amount: 0,
					description: `Comprovante ${receiptNumber}`,
					category: 'Geral',
					uploadDate: new Date().toISOString()
				};

				receipts = [...receipts, newReceipt];
			};
			
			reader.readAsDataURL(file);
		});

		toast.success(`${files.length} comprovante(s) adicionado(s)`);
		
		// Reset input
		input.value = '';
	}

	function removeReceipt(id: string) {
		receipts = receipts.filter(r => r.id !== id);
		// Renumerar comprovantes após remoção
		receipts = receipts.map((r, index) => ({
			...r,
			fileName: `Comprovante ${index + 1}`,
			description: r.description.startsWith('Comprovante') ? `Comprovante ${index + 1}` : r.description
		}));
	}

	function updateReceiptAmount(id: string, amount: number) {
		receipts = receipts.map(r => r.id === id ? { ...r, amount } : r);
	}

	function updateReceiptDescription(id: string, description: string) {
		receipts = receipts.map(r => r.id === id ? { ...r, description } : r);
	}

	function updateReceiptCategory(id: string, category: string) {
		receipts = receipts.map(r => r.id === id ? { ...r, category } : r);
	}

	function calculateTotal(): number {
		return receipts.reduce((sum, r) => sum + r.amount, 0);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		success = false;

		if (!osNumber.trim() || !clientName.trim() || receipts.length === 0) {
			error = 'Preencha todos os campos e adicione pelo menos um comprovante';
			return;
		}

		if (!auth.token) {
			error = 'Usuário não autenticado';
			return;
		}

		loading = true;

		try {
			const response = await fetch(`${API_URL}/reports/gastos`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${auth.token}`
				},
				body: JSON.stringify({
					template,
					osNumber,
					clientName,
					userName,
					prestacaoDate: date,
					receipts: receipts.map(r => ({
						id: r.id,
						fileName: r.fileName,
						fileData: r.fileData,
						amount: r.amount,
						description: r.description,
						category: r.category,
						uploadDate: r.uploadDate
					})),
					totalAmount: calculateTotal(),
					aprovacao: approved === true ? 'aprovado' : approved === false ? 'reprovado' : undefined,
					ressalvas: observations
				})
			});

			if (!response.ok) {
				let errorMessage = 'Erro ao gerar relatório';
				try {
					const contentType = response.headers.get('content-type');
					if (contentType && contentType.includes('application/json')) {
						const data = await response.json();
						errorMessage = data.message || data.error || errorMessage;
					} else {
						const text = await response.text();
						console.error('Server error:', text);
						errorMessage = `Erro no servidor (${response.status})`;
					}
				} catch (parseError) {
					console.error('Error parsing response:', parseError);
				}
				throw new Error(errorMessage);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `Relatorio_Gastos_${osNumber}_${date}.docx`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			success = true;
			toast.success('Relatório de gastos gerado com sucesso!');

			// Reset form
			osNumber = '';
			clientName = '';
			date = new Date().toISOString().split('T')[0];
			receipts = [];
			stopCamera();

		} catch (err: any) {
			console.error('Erro ao gerar relatório:', err);
			const errorMessage = err.message || 'Erro ao gerar relatório';
			error = errorMessage;
			toast.error(errorMessage);
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	<div class="header">
		<h1>Relatório de Gastos</h1>
		<p>Prestação de Contas</p>
	</div>

	<form onsubmit={handleSubmit} class="form-container">
		<!-- Informações Gerais -->
		<section class="section">
			<h2>Informações Gerais</h2>
			
			<div class="form-grid">
				<div class="form-group">
					<label for="template">Template</label>
					<select id="template" bind:value={template} class="modern-input">
						<option value="sercamp">SERCAMP</option>
						<option value="nx-energy">NX Energy</option>
					</select>
				</div>

				<div class="form-group">
					<label for="osNumber">Número da OS *</label>
					<input
						type="text"
						id="osNumber"
						bind:value={osNumber}
						placeholder="Ex: 12345"
						class="modern-input"
						required
					/>
				</div>

				<div class="form-group">
					<label for="clientName">Cliente *</label>
					<input
						type="text"
						id="clientName"
						bind:value={clientName}
						placeholder="Nome do cliente"
						class="modern-input"
						required
					/>
				</div>

				<div class="form-group">
					<label for="date">Data da Prestação</label>
					<input
						type="date"
						id="date"
						bind:value={date}
						class="modern-input"
					/>
				</div>

				<div class="form-group full-width">
					<label for="userName">Responsável pela Prestação</label>
					<input
						type="text"
						id="userName"
						bind:value={userName}
						class="modern-input"
						disabled
						style="background: var(--bg-secondary);"
					/>
				</div>
			</div>
		</section>

		<!-- Comprovantes -->
		<section class="section">
			<h2>Comprovantes de Gastos</h2>

			<div class="upload-buttons">
				{#if !isCameraOpen}
					<button type="button" onclick={startCamera} class="btn-modern btn-modern-primary">
						📷 Abrir Câmera
					</button>
					<button type="button" onclick={() => fileInputElement?.click()} class="btn-modern btn-modern-secondary">
						📁 Upload de Arquivos
					</button>
					<input
						bind:this={fileInputElement}
						type="file"
						accept="image/*"
						multiple
						onchange={handleFileUpload}
						style="display: none;"
					/>
				{/if}
			</div>

			{#if isCameraOpen}
				<div class="camera-container">
					<video
						bind:this={videoElement}
						autoplay
						playsinline
						class="camera-video"
					></video>
					<button
						type="button"
						onclick={stopCamera}
						class="camera-close"
					>
						✕
					</button>
				</div>
				<div class="camera-controls">
					<button type="button" onclick={capturePhoto} class="btn-modern btn-modern-primary flex-1">
						📷 Capturar Foto ({receipts.length} capturada{receipts.length !== 1 ? 's' : ''})
					</button>
					<button type="button" onclick={stopCamera} class="btn-modern btn-modern-secondary">
						Fechar Câmera
					</button>
				</div>
				<canvas bind:this={canvasElement} style="display: none;"></canvas>
			{/if}

			{#if receipts.length > 0}
				<div class="receipts-section">
					<h3>Comprovantes Adicionados ({receipts.length})</h3>
					<div class="receipts-list">
						{#each receipts as receipt, index (receipt.id)}
							<div class="receipt-item">
								<div class="receipt-preview">
									<img src={receipt.fileData} alt="Comprovante {index + 1}" />
									<div class="receipt-number">Comprovante {index + 1}</div>
								</div>
								
								<div class="receipt-form">
									<div class="form-row">
										<div class="form-group">
											<label>Descrição</label>
											<input
												type="text"
												value={receipt.description}
												oninput={(e) => updateReceiptDescription(receipt.id, e.currentTarget.value)}
												class="modern-input"
												placeholder="Ex: Almoço, Combustível..."
											/>
										</div>
										
										<div class="form-group">
											<label>Estabelecimento</label>
											<select
												value={receipt.category}
												onchange={(e) => updateReceiptCategory(receipt.id, e.currentTarget.value)}
												class="modern-input"
											>
												<option value="Geral">Geral</option>
												<option value="Alimentação">Alimentação</option>
												<option value="Hospedagem">Hospedagem</option>
												<option value="Transporte">Transporte</option>
												<option value="Combustível">Combustível</option>
												<option value="Pedágio">Pedágio</option>
												<option value="Estacionamento">Estacionamento</option>
												<option value="Material">Material</option>
												<option value="Ferramenta">Ferramenta</option>
												<option value="Outros">Outros</option>
											</select>
										</div>
										
										<div class="form-group">
											<label>Valor (R$)</label>
											<input
												type="number"
												step="0.01"
												min="0"
												value={receipt.amount}
												oninput={(e) => updateReceiptAmount(receipt.id, parseFloat(e.currentTarget.value) || 0)}
												class="modern-input"
												placeholder="0.00"
											/>
										</div>
									</div>
								</div>
								
								<button
									type="button"
									onclick={() => removeReceipt(receipt.id)}
									class="receipt-remove-btn"
									title="Remover comprovante"
								>
									🗑️
								</button>
							</div>
						{/each}
					</div>
					<div class="total-section">
						<span>Total ({receipts.length} comprovante{receipts.length !== 1 ? 's' : ''}):</span>
						<span class="total-amount">R$ {calculateTotal().toFixed(2)}</span>
					</div>
				</div>
			{/if}
		</section>

		<!-- Aprovação -->
		<section class="section">
			<h2>Aprovação de Relatório de Gastos</h2>
			
			<div class="approval-section">
				<label class="checkbox-label">
					<input
						type="checkbox"
						checked={approved === true}
						onchange={() => approved = approved === true ? null : true}
						class="checkbox-input"
					/>
					<span class="checkbox-text">☐ Aprovado</span>
				</label>
				
				<label class="checkbox-label">
					<input
						type="checkbox"
						checked={approved === false}
						onchange={() => approved = approved === false ? null : false}
						class="checkbox-input"
					/>
					<span class="checkbox-text">☐ Reprovado</span>
				</label>
			</div>
		</section>

		<!-- Ressalvas -->
		<section class="section">
			<h2>Ressalvas</h2>
			
			<div class="form-group">
				<textarea
					bind:value={observations}
					class="modern-textarea"
					placeholder="Digite aqui observações, ressalvas ou comentários sobre os gastos..."
					rows="5"
				></textarea>
			</div>
		</section>

		<!-- Mensagens -->
		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		{#if success}
			<div class="alert alert-success">Relatório gerado com sucesso!</div>
		{/if}

		<!-- Submit -->
		<button
			type="submit"
			disabled={loading || receipts.length === 0}
			class="btn-modern btn-modern-primary btn-large"
		>
			{loading ? 'Gerando...' : 'Gerar Relatório de Gastos'}
		</button>
	</form>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.header p {
		color: var(--text-secondary);
	}

	.form-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.section {
		background: var(--bg-secondary);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}

	.section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.full-width {
		grid-column: 1 / -1;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.modern-input {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 1rem;
		transition: all 0.2s;
	}

	.modern-input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
	}

	.modern-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.camera-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		border: 2px dashed var(--border-color);
		border-radius: 8px;
		gap: 1rem;
	}

	.camera-placeholder svg {
		color: var(--text-secondary);
	}

	.camera-placeholder p {
		color: var(--text-secondary);
	}

	.upload-buttons {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.camera-container {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		background: #000;
	}

	.camera-video {
		width: 100%;
		height: auto;
		max-height: 400px;
		display: block;
	}

	.camera-close {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		transition: background 0.2s;
	}

	.camera-close:hover {
		background: rgba(0, 0, 0, 0.7);
	}

	.camera-controls {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.receipts-section {
		margin-top: 1.5rem;
	}

	.receipts-section h3 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	.receipts-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.receipt-item {
		display: grid;
		grid-template-columns: 150px 1fr auto;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background: var(--bg-primary);
		align-items: start;
	}

	.receipt-preview {
		position: relative;
		width: 150px;
		height: 150px;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--border-color);
	}

	.receipt-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.receipt-number {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.receipt-form {
		flex: 1;
	}

	.form-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: 1rem;
	}

	.receipt-remove-btn {
		padding: 0.5rem;
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 1.25rem;
	}

	.receipt-remove-btn:hover {
		background: rgba(239, 68, 68, 0.2);
	}

	.receipts-grid {
		display: none; /* Não usado mais */
	}

	.receipt-card {
		display: none; /* Não usado mais */
	}

	@media (max-width: 768px) {
		.receipt-item {
			grid-template-columns: 1fr;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.receipt-remove-btn {
			width: 100%;
		}
	}

	.total-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-top: 2px solid var(--border-color);
		margin-top: 1rem;
		font-weight: 600;
	}

	.total-amount {
		font-size: 1.25rem;
		color: #22c55e;
	}

	.approval-section {
		display: flex;
		gap: 2rem;
		padding: 1.5rem;
		background: var(--bg-primary);
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 1.125rem;
		font-weight: 500;
		color: var(--text-primary);
	}

	.checkbox-input {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
	}

	.checkbox-text {
		user-select: none;
	}

	.modern-textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
		transition: all 0.2s;
	}

	.modern-textarea:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
	}

	.btn-modern {
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		font-size: 1rem;
	}

	.btn-modern-primary {
		background: var(--primary-color);
		color: white;
	}

	.btn-modern-primary:hover:not(:disabled) {
		background: var(--primary-hover);
	}

	.btn-modern-secondary {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
	}

	.btn-modern-secondary:hover {
		background: var(--bg-primary);
	}

	.btn-modern:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-large {
		width: 100%;
		padding: 1rem;
		font-size: 1.125rem;
	}

	.flex-1 {
		flex: 1;
	}

	.alert {
		padding: 1rem;
		border-radius: 6px;
		font-weight: 500;
	}

	.alert-error {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.alert-success {
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
		border: 1px solid rgba(34, 197, 94, 0.3);
	}
</style>
