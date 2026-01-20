<script lang="ts">
	import { browser } from '$app/environment';

	interface Props {
		data?: any;
	}

	let { data = $bindable({}) }: Props = $props();

	// Inicializar arrays IMEDIATAMENTE para evitar erros
	if (!data.enrolAplicado) data.enrolAplicado = ['', '', '', '', ''];
	if (!data.tensaoAplicada) data.tensaoAplicada = ['', '', '', '', ''];
	if (!data.enrolMedido) data.enrolMedido = ['', '', '', '', ''];
	if (!data.tensaoMedidaR) data.tensaoMedidaR = ['', '', '', '', ''];
	if (!data.tensaoMedidaS) data.tensaoMedidaS = ['', '', '', '', ''];
	if (!data.tensaoMedidaT) data.tensaoMedidaT = ['', '', '', '', ''];
	if (!data.enrolMedidoRes) data.enrolMedidoRes = ['R', 'S', 'T', '', '', ''];
	if (!data.resistIsoR) data.resistIsoR = ['', '', '', ''];
	if (!data.resistIsoS) data.resistIsoS = ['', '', '', ''];
	if (!data.resistIsoT) data.resistIsoT = ['', '', '', ''];
	if (!data.enrolMedidoOhm) data.enrolMedidoOhm = ['R', 'S', 'T', '', ''];
	if (!data.enrolMedidoPol) data.enrolMedidoPol = ['', '', '', '', ''];
	if (!data.polaridadeR) data.polaridadeR = [false, false, false, false, false];
	if (!data.polaridadeS) data.polaridadeS = [false, false, false, false, false];
	if (!data.polaridadeT) data.polaridadeT = [false, false, false, false, false];

	// Estado das seções colapsáveis
	let caracteristicasOpen = $state(true);
	let verificacoesOpen = $state(true);
	let ensaiosRelacaoOpen = $state(true);
	let resistenciaIsolamentoOpen = $state(true);
	let resistenciaOhmicaOpen = $state(true);
	let polaridadesOpen = $state(true);
	let observacoesOpen = $state(false);

	// Inicializar dados
	$effect(() => {
		if (browser && !data.tipo) {
			// Tipo TC/TP
			data.tipo = null; // 'TC' ou 'TP'
			
			// Dados gerais (já vêm do formulário principal)
			
			// Características
			data.fabricante = '';
			data.tipo_equipamento = '';
			data.numeroSerieR = '';
			data.numeroSerieS = '';
			data.numeroSerieT = '';
			data.relacao = '';
			data.anoFabricacao = '';
			data.tensaoNominal = '';
			data.potenciaNominal = '';
			data.fatorServico = '';
			
			// Classes de precisão
			data.classePrecisao1 = '';
			data.classePrecisao2 = '';
			data.classePrecisao3 = '';
			data.classePrecisao4 = '';
			data.classePrecisao5 = '';
			
			// Verificações (S/N/Inexistente)
			data.verif01 = 'S';
			data.verif02 = 'S';
			data.verif03 = 'S';
			data.verif04 = 'S';
			data.verif05 = 'S';
			data.verif06 = 'I';
			
			// Ensaios de Relação
			data.tensaoAplicadaEm = 'primario'; // 'primario' ou 'secundario'
			
			// Resistência de Isolamento
			data.instrumentoUtilizado = '';
			data.ensaiosDurante = '1 minuto';
			data.temperaturaAmbiente = '';
			data.umidadeRelativa = '';
			
			// Resistência Ôhmica
			data.resistOhmR = '';
			data.resistOhmS = '';
			data.resistOhmT = '';
			
			// Observações
			data.observacoes = '';
		}
	});

	function toggleSection(section: string) {
		if (section === 'caracteristicas') caracteristicasOpen = !caracteristicasOpen;
		if (section === 'verificacoes') verificacoesOpen = !verificacoesOpen;
		if (section === 'ensaiosRelacao') ensaiosRelacaoOpen = !ensaiosRelacaoOpen;
		if (section === 'resistenciaIsolamento') resistenciaIsolamentoOpen = !resistenciaIsolamentoOpen;
		if (section === 'resistenciaOhmica') resistenciaOhmicaOpen = !resistenciaOhmicaOpen;
		if (section === 'polaridades') polaridadesOpen = !polaridadesOpen;
		if (section === 'observacoes') observacoesOpen = !observacoesOpen;
	}
</script>

<div class="tc-tp-section">
	<!-- MENSAGEM DE AJUDA -->
	<div class="help-banner">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span>Selecione o tipo de transformador (TC ou TP) e preencha os dados técnicos abaixo</span>
	</div>

	<!-- SELEÇÃO TC/TP -->
	<div class="tipo-selecao">
		<label class="tipo-checkbox" class:selected={data.tipo === 'TC'}>
			<input
				type="checkbox"
				checked={data.tipo === 'TC'}
				onchange={() => (data.tipo = data.tipo === 'TC' ? null : 'TC')}
			/>
			<div class="tipo-content">
				<span class="tipo-title">TC</span>
				<span class="tipo-subtitle">Transformador de Corrente</span>
			</div>
		</label>
		<label class="tipo-checkbox" class:selected={data.tipo === 'TP'}>
			<input
				type="checkbox"
				checked={data.tipo === 'TP'}
				onchange={() => (data.tipo = data.tipo === 'TP' ? null : 'TP')}
			/>
			<div class="tipo-content">
				<span class="tipo-title">TP</span>
				<span class="tipo-subtitle">Transformador de Potencial</span>
			</div>
		</label>
	</div>

	<!-- CARACTERÍSTICAS -->
	<div class="section">
		<button class="section-header" onclick={() => toggleSection('caracteristicas')}>
			<span class="section-title">CARACTERÍSTICAS</span>
			<span class="toggle-icon">{caracteristicasOpen ? '▼' : '▶'}</span>
		</button>

		{#if caracteristicasOpen}
			<div class="section-content">
				<div class="grid-5">
					<div class="field-group">
						<label>Fabricante:</label>
						<input type="text" bind:value={data.fabricante} />
					</div>
					<div class="field-group">
						<label>Tipo:</label>
						<input type="text" bind:value={data.tipo_equipamento} />
					</div>
					<div class="field-group">
						<label>Nº série - Fase R:</label>
						<input type="text" bind:value={data.numeroSerieR} />
					</div>
					<div class="field-group">
						<label>Nº série - Fase S:</label>
						<input type="text" bind:value={data.numeroSerieS} />
					</div>
					<div class="field-group">
						<label>Nº série - Fase T:</label>
						<input type="text" bind:value={data.numeroSerieT} />
					</div>
				</div>

				<div class="grid-5">
					<div class="field-group">
						<label>Relação:</label>
						<input type="text" bind:value={data.relacao} />
					</div>
					<div class="field-group">
						<label>Ano de fabricação:</label>
						<input type="text" bind:value={data.anoFabricacao} />
					</div>
					<div class="field-group">
						<label>Tensão nominal:</label>
						<input type="text" bind:value={data.tensaoNominal} />
					</div>
					<div class="field-group">
						<label>Potência nominal:</label>
						<input type="text" bind:value={data.potenciaNominal} />
					</div>
					<div class="field-group">
						<label>Fator de serviço:</label>
						<input type="text" bind:value={data.fatorServico} />
					</div>
				</div>

				<div class="grid-5">
					<div class="field-group">
						<label>Classe de precisão do enrol.:</label>
						<input type="text" bind:value={data.classePrecisao1} />
					</div>
					<div class="field-group">
						<label>Classe de precisão do enrol.:</label>
						<input type="text" bind:value={data.classePrecisao2} />
					</div>
					<div class="field-group">
						<label>Classe adicional:</label>
						<input type="text" bind:value={data.classePrecisao3} />
					</div>
					<div class="field-group">
						<label>Classe adicional:</label>
						<input type="text" bind:value={data.classePrecisao4} />
					</div>
					<div class="field-group">
						<label>Classe adicional:</label>
						<input type="text" bind:value={data.classePrecisao5} />
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- VERIFICAÇÕES / SERVIÇOS -->
	<div class="section">
		<button class="section-header" onclick={() => toggleSection('verificacoes')}>
			<span class="section-title">VERIFICAÇÕES / SERVIÇOS</span>
			<span class="toggle-icon">{verificacoesOpen ? '▼' : '▶'}</span>
		</button>

		{#if verificacoesOpen}
			<div class="section-content">
				<!-- Legenda melhorada -->
				<div class="legenda-modern">
					<div class="legenda-item">
						<span class="legenda-icon sim">✓</span>
						<span>S = Sim</span>
					</div>
					<div class="legenda-item">
						<span class="legenda-icon nao">✗</span>
						<span>N = Não</span>
					</div>
					<div class="legenda-item">
						<span class="legenda-icon inexistente">○</span>
						<span>Inexistente / Não executado</span>
					</div>
				</div>

				<!-- Grid de verificações melhorado -->
				<div class="verificacoes-grid-modern">
					{#each [
						{ id: 'verif01', num: '01', label: 'Fixações e alinhamentos' },
						{ id: 'verif02', num: '02', label: 'Integridade dos isoladores' },
						{ id: 'verif03', num: '03', label: 'Aterramentos' },
						{ id: 'verif04', num: '04', label: 'Limpeza dos isoladores' },
						{ id: 'verif05', num: '05', label: 'Reapertos das conexões' },
						{ id: 'verif06', num: '06', label: 'Outro' }
					] as item}
						<div class="verificacao-card">
							<div class="verificacao-header">
								<span class="verif-badge">{item.num}</span>
								<span class="verif-title">{item.label}</span>
							</div>
							<div class="verif-buttons">
								<label class="verif-btn {data[item.id] === 'S' ? 'active sim' : ''}">
									<input
										type="radio"
										name={item.id}
										value="S"
										checked={data[item.id] === 'S'}
										onchange={() => (data[item.id] = 'S')}
									/>
									<span class="btn-icon">✓</span>
									<span class="btn-text">S</span>
								</label>
								<label class="verif-btn {data[item.id] === 'N' ? 'active nao' : ''}">
									<input
										type="radio"
										name={item.id}
										value="N"
										checked={data[item.id] === 'N'}
										onchange={() => (data[item.id] = 'N')}
									/>
									<span class="btn-icon">✗</span>
									<span class="btn-text">N</span>
								</label>
								<label class="verif-btn inexist {data[item.id] === 'I' ? 'active' : ''}">
									<input
										type="radio"
										name={item.id}
										value="I"
										checked={data[item.id] === 'I'}
										onchange={() => (data[item.id] = 'I')}
									/>
									<span class="btn-icon">○</span>
									<span class="btn-text">Inexist.</span>
								</label>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- ENSAIOS DE RELAÇÃO DE TRANSFORMAÇÃO -->
	<div class="section">
		<button class="section-header" onclick={() => toggleSection('ensaiosRelacao')}>
			<span class="section-title">ENSAIOS DE RELAÇÃO DE TRANSFORMAÇÃO</span>
			<span class="toggle-icon">{ensaiosRelacaoOpen ? '▼' : '▶'}</span>
		</button>

		{#if ensaiosRelacaoOpen}
			<div class="section-content">
				<div class="tensao-aplicada-em">
					<span>Tensão Aplicada em:</span>
					<label>
						<input
							type="checkbox"
							checked={data.tensaoAplicadaEm === 'primario'}
							onchange={() => (data.tensaoAplicadaEm = 'primario')}
						/>
						<span>Primário</span>
					</label>
					<label>
						<input
							type="checkbox"
							checked={data.tensaoAplicadaEm === 'secundario'}
							onchange={() => (data.tensaoAplicadaEm = 'secundario')}
						/>
						<span>Secundário</span>
					</label>
				</div>

				<div class="ensaio-table">
					<div class="table-row">
						<span class="row-label">Enrolamento aplicado:</span>
						{#each [0, 1, 2, 3, 4] as i}
							<input type="text" bind:value={data.enrolAplicado[i]} />
						{/each}
					</div>
					<div class="table-row">
						<span class="row-label">Tensão Aplicada:</span>
						{#each [0, 1, 2, 3, 4] as i}
							<input type="text" bind:value={data.tensaoAplicada[i]} />
						{/each}
					</div>
					<div class="table-row">
						<span class="row-label">Enrolamento medido:</span>
						{#each [0, 1, 2, 3, 4] as i}
							<input type="text" bind:value={data.enrolMedido[i]} />
						{/each}
					</div>
				</div>

				<div class="tensao-medida-table">
					<div class="table-header">
						<span>Tensão Medida</span>
						<span>Col 1</span>
						<span>Col 2</span>
						<span>Col 3</span>
						<span>Col 4</span>
						<span>Col 5</span>
					</div>
					<div class="table-row">
						<span class="fase-label">R</span>
						{#each [0, 1, 2, 3, 4] as i}
							<input type="text" bind:value={data.tensaoMedidaR[i]} />
						{/each}
					</div>
					<div class="table-row">
						<span class="fase-label">S</span>
						{#each [0, 1, 2, 3, 4] as i}
							<input type="text" bind:value={data.tensaoMedidaS[i]} />
						{/each}
					</div>
					<div class="table-row">
						<span class="fase-label">T</span>
						{#each [0, 1, 2, 3, 4] as i}
							<input type="text" bind:value={data.tensaoMedidaT[i]} />
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- RESISTÊNCIA DE ISOLAMENTO -->
	<div class="section">
		<button class="section-header" onclick={() => toggleSection('resistenciaIsolamento')}>
			<span class="section-title">ENSAIOS DE RESISTÊNCIA DE ISOLAMENTO (MΩ)</span>
			<span class="toggle-icon">{resistenciaIsolamentoOpen ? '▼' : '▶'}</span>
		</button>

		{#if resistenciaIsolamentoOpen}
			<div class="section-content">
				<div class="condicoes-grid">
					<div class="field-group">
						<label>Instrumento Utilizado:</label>
						<input type="text" bind:value={data.instrumentoUtilizado} />
					</div>
					<div class="field-group">
						<label>Ensaios Durante:</label>
						<input type="text" value="1 minuto" readonly />
					</div>
					<div class="field-group">
						<label>Temperatura Ambiente (°C):</label>
						<input type="text" bind:value={data.temperaturaAmbiente} />
					</div>
					<div class="field-group">
						<label>Umidade Relativa (%):</label>
						<input type="text" bind:value={data.umidadeRelativa} />
					</div>
				</div>

				<div class="enrol-medido-row">
					<span>Enrolamento medido:</span>
					{#each [0, 1, 2, 3, 4, 5] as i}
						<input type="text" bind:value={data.enrolMedidoRes[i]} />
					{/each}
				</div>

				<div class="resistencia-iso-table">
					<div class="table-header">
						<span>Conexões:</span>
						<span>AT x Massa</span>
						<span>AT x Sec.</span>
						<span>Sec x Massa</span>
						<span>Sec x Massa</span>
					</div>
					<div class="table-row">
						<span>Tensão Aplicada:</span>
						<span>Vcc</span>
						<span>Vcc</span>
						<span>Vcc</span>
						<span>Vcc</span>
					</div>
					<div class="table-row">
						<span class="fase-label">Resist. Medida R:</span>
						{#each [0, 1, 2, 3] as i}
							<input type="text" bind:value={data.resistIsoR[i]} placeholder="MΩ" />
						{/each}
					</div>
					<div class="table-row">
						<span class="fase-label">S:</span>
						{#each [0, 1, 2, 3] as i}
							<input type="text" bind:value={data.resistIsoS[i]} placeholder="MΩ" />
						{/each}
					</div>
					<div class="table-row">
						<span class="fase-label">T:</span>
						{#each [0, 1, 2, 3] as i}
							<input type="text" bind:value={data.resistIsoT[i]} placeholder="MΩ" />
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- RESISTÊNCIA ÔHMICA -->
	<div class="section">
		<button class="section-header" onclick={() => toggleSection('resistenciaOhmica')}>
			<span class="section-title">MEDIÇÕES DE RESISTÊNCIA ÔHMICA NOS ENROLAMENTOS</span>
			<span class="toggle-icon">{resistenciaOhmicaOpen ? '▼' : '▶'}</span>
		</button>

		{#if resistenciaOhmicaOpen}
			<div class="section-content">
				<div class="enrol-medido-row">
					<span>Enrolamento medido:</span>
					{#each [0, 1, 2, 3, 4] as i}
						<input type="text" bind:value={data.enrolMedidoOhm[i]} />
					{/each}
				</div>

				<div class="resistencia-ohm-table">
					<div class="table-row">
						<span class="fase-label">Resist. Medida R:</span>
						<input type="text" bind:value={data.resistOhmR} placeholder="Ω" />
					</div>
					<div class="table-row">
						<span class="fase-label">S:</span>
						<input type="text" bind:value={data.resistOhmS} placeholder="Ω" />
					</div>
					<div class="table-row">
						<span class="fase-label">T:</span>
						<input type="text" bind:value={data.resistOhmT} placeholder="Ω" />
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- ENSAIOS DE POLARIDADES -->
	<div class="section">
		<button class="section-header" onclick={() => toggleSection('polaridades')}>
			<span class="section-title">ENSAIOS DE POLARIDADES</span>
			<span class="toggle-icon">{polaridadesOpen ? '▼' : '▶'}</span>
		</button>

		{#if polaridadesOpen}
			<div class="section-content">
				<div class="enrol-medido-row">
					<span>Enrolamento medido:</span>
					{#each [0, 1, 2, 3, 4] as i}
						<input type="text" bind:value={data.enrolMedidoPol[i]} />
					{/each}
				</div>

				<div class="polaridade-table">
					<div class="table-header">
						<span>Polaridade Medida</span>
						<span>☐ Subtrativa</span>
						<span>☐ Subtrativa</span>
						<span>☐ Subtrativa</span>
						<span>☐ Subtrativa</span>
						<span>☐ Subtrativa</span>
					</div>
					<div class="table-row">
						<span class="fase-label">R</span>
						{#each [0, 1, 2, 3, 4] as i}
							<label>
								<input type="checkbox" bind:checked={data.polaridadeR[i]} />
							</label>
						{/each}
					</div>
					<div class="table-row">
						<span class="fase-label">S</span>
						{#each [0, 1, 2, 3, 4] as i}
							<label>
								<input type="checkbox" bind:checked={data.polaridadeS[i]} />
							</label>
						{/each}
					</div>
					<div class="table-row">
						<span class="fase-label">T</span>
						{#each [0, 1, 2, 3, 4] as i}
							<label>
								<input type="checkbox" bind:checked={data.polaridadeT[i]} />
						</label>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- OBSERVAÇÕES / RECOMENDAÇÕES -->
	<div class="section">
		<button class="section-header" onclick={() => toggleSection('observacoes')}>
			<span class="section-title">OBSERVAÇÕES / RECOMENDAÇÕES</span>
			<span class="toggle-icon">{observacoesOpen ? '▼' : '▶'}</span>
		</button>

		{#if observacoesOpen}
			<div class="section-content">
				<textarea
					bind:value={data.observacoes}
					placeholder="Digite aqui as observações e recomendações..."
					rows="10"
				></textarea>
			</div>
		{/if}
	</div>
</div>

<style>
	.tc-tp-section {
		background-color: var(--bg-primary);
		color: var(--text-primary);
		padding: 2rem;
		border-radius: 12px;
		max-width: 100%;
		margin: 0 auto;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		overflow-x: hidden;
	}

	/* Smooth scroll behavior */
	.tc-tp-section * {
		scroll-behavior: smooth;
	}

	/* HELP BANNER */
	.help-banner {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
		font-weight: 600;
		font-size: 0.95rem;
		animation: slideDown 0.3s ease;
	}

	.help-banner svg {
		flex-shrink: 0;
	}

	/* SELEÇÃO TC/TP */
	.tipo-selecao {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.tipo-checkbox {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		color: var(--text-primary);
		padding: 1.75rem 2rem;
		border-radius: 12px;
		transition: all 0.3s ease;
		background-color: var(--bg-secondary);
		border: 3px solid var(--border-color);
		position: relative;
		overflow: hidden;
	}

	.tipo-checkbox::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: 0;
	}

	.tipo-checkbox.selected::before {
		opacity: 0.1;
	}

	.tipo-checkbox > * {
		position: relative;
		z-index: 1;
	}

	.tipo-checkbox:hover {
		border-color: #3b82f6;
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
	}

	.tipo-checkbox.selected {
		border-color: #3b82f6;
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
	}

	.tipo-checkbox input[type='checkbox'] {
		width: 28px;
		height: 28px;
		cursor: pointer;
		accent-color: #3b82f6;
		flex-shrink: 0;
	}

	.tipo-checkbox input[type='checkbox']:checked {
		transform: scale(1.15);
	}

	.tipo-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.tipo-title {
		font-size: 1.5rem;
		font-weight: 900;
		letter-spacing: 0.5px;
	}

	.tipo-subtitle {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text-secondary);
		letter-spacing: 0.3px;
	}

	.tipo-checkbox.selected .tipo-title {
		color: #3b82f6;
	}

	.tipo-checkbox.selected .tipo-subtitle {
		color: #2563eb;
	}

	/* SECTIONS */
	.section {
		background-color: var(--bg-secondary);
		border-radius: 12px;
		margin-bottom: 1.25rem;
		border: 2px solid var(--border-color);
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.section:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.section-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		border: none;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
	}

	.section-header::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.section-header:hover::before {
		opacity: 1;
	}

	.section-header:hover {
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
		padding-left: 2.25rem;
	}

	.section-title {
		font-size: 1.1rem;
		font-weight: 800;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: color 0.3s ease;
	}

	.section-header:hover .section-title {
		color: #3b82f6;
	}

	.toggle-icon {
		color: var(--text-secondary);
		font-size: 1rem;
		transition: all 0.3s ease;
		font-weight: bold;
	}

	.section-header:hover .toggle-icon {
		color: #3b82f6;
		transform: scale(1.2);
	}

	.section-content {
		padding: 2rem;
		background-color: var(--bg-primary);
		animation: slideDown 0.3s ease;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* FIELD GROUPS */
	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-group label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.field-group input,
	.field-group select {
		padding: 0.75rem;
		border: 2px solid var(--border-color);
		border-radius: 8px;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.95rem;
		transition: all 0.2s ease;
	}

	.field-group input:focus,
	.field-group select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
		transform: translateY(-1px);
	}

	.field-group input:hover {
		border-color: #60a5fa;
	}

	/* GRIDS */
	.grid-5 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	/* VERIFICAÇÕES - DESIGN MODERNO */
	.legenda-modern {
		display: flex;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
		flex-wrap: wrap;
	}

	.legenda-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: white;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.legenda-icon {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-weight: bold;
		font-size: 1rem;
	}

	.legenda-icon.sim {
		background: rgba(34, 197, 94, 0.3);
		color: #22c55e;
	}

	.legenda-icon.nao {
		background: rgba(239, 68, 68, 0.3);
		color: #ef4444;
	}

	.legenda-icon.inexistente {
		background: rgba(156, 163, 175, 0.3);
		color: #9ca3af;
	}

	.verificacoes-grid-modern {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 1rem;
	}

	.verificacao-card {
		background: var(--bg-secondary);
		border: 2px solid var(--border-color);
		border-radius: 12px;
		padding: 1.25rem;
		transition: all 0.3s ease;
	}

	.verificacao-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
		transform: translateY(-2px);
	}

	.verificacao-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.verif-badge {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		font-weight: 900;
		font-size: 0.9rem;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
		flex-shrink: 0;
	}

	.verif-title {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 0.95rem;
		line-height: 1.3;
	}

	.verif-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.verif-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem 0.5rem;
		background: var(--bg-primary);
		border: 2px solid var(--border-color);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.verif-btn input[type='radio'] {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.verif-btn .btn-icon {
		font-size: 1.25rem;
		font-weight: bold;
		transition: all 0.2s ease;
	}

	.verif-btn .btn-text {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
		transition: all 0.2s ease;
	}

	.verif-btn:hover {
		border-color: #3b82f6;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
	}

	.verif-btn.active.sim {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		border-color: #22c55e;
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
	}

	.verif-btn.active.sim .btn-icon,
	.verif-btn.active.sim .btn-text {
		color: white;
	}

	.verif-btn.active.nao {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		border-color: #ef4444;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
	}

	.verif-btn.active.nao .btn-icon,
	.verif-btn.active.nao .btn-text {
		color: white;
	}

	.verif-btn.inexist.active {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		border-color: #6b7280;
		box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
	}

	.verif-btn.inexist.active .btn-icon,
	.verif-btn.inexist.active .btn-text {
		color: white;
	}

	/* Manter estilos antigos para compatibilidade */
	.legenda {
		display: flex;
		gap: 2rem;
		margin-bottom: 1.5rem;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		border-radius: 10px;
		font-size: 0.9rem;
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		flex-wrap: wrap;
	}

	.legenda span {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.verificacoes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 1rem;
	}

	.verificacao-row {
		display: grid;
		grid-template-columns: auto 1fr 2fr;
		gap: 1rem;
		align-items: center;
		padding: 1.25rem;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		border-radius: 10px;
		border: 2px solid var(--border-color);
		transition: all 0.3s ease;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
	}

	.verificacao-row:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
		transform: translateY(-2px);
	}

	.verif-num {
		font-weight: 900;
		color: white;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		font-size: 1.1rem;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
	}

	.verif-label {
		font-weight: 700;
		color: var(--text-primary);
		font-size: 1rem;
		letter-spacing: 0.3px;
	}

	.verif-options {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.verif-options label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 600;
		padding: 0.65rem 1rem;
		border-radius: 8px;
		transition: all 0.3s ease;
		background-color: var(--bg-secondary);
		border: 2px solid transparent;
	}

	.verif-options label:hover {
		background-color: var(--bg-primary);
		border-color: #3b82f6;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
	}

	.verif-options input[type='radio'] {
		width: 20px;
		height: 20px;
		cursor: pointer;
		accent-color: #3b82f6;
		transition: transform 0.2s ease;
	}

	.verif-options input[type='radio']:checked {
		transform: scale(1.15);
	}

	/* TENSÃO APLICADA EM */
	.tensao-aplicada-em {
		display: flex;
		align-items: center;
		gap: 2.5rem;
		margin-bottom: 1.5rem;
		padding: 1.25rem;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		border-radius: 8px;
		border: 2px solid var(--border-color);
	}

	.tensao-aplicada-em span:first-child {
		font-weight: 700;
		color: var(--text-primary);
		font-size: 1rem;
	}

	.tensao-aplicada-em label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		font-weight: 600;
		color: var(--text-primary);
		padding: 0.75rem 1.25rem;
		border-radius: 8px;
		transition: all 0.2s ease;
		background-color: var(--bg-secondary);
		border: 2px solid transparent;
	}

	.tensao-aplicada-em label:hover {
		background-color: var(--bg-primary);
		border-color: #3b82f6;
		transform: translateY(-1px);
	}

	.tensao-aplicada-em input[type='checkbox'] {
		width: 22px;
		height: 22px;
		cursor: pointer;
		accent-color: #3b82f6;
	}

	/* TABELAS */
	.ensaio-table,
	.tensao-medida-table,
	.resistencia-iso-table,
	.resistencia-ohm-table,
	.polaridade-table {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
	}

	/* Scrollbar styling */
	.ensaio-table::-webkit-scrollbar,
	.tensao-medida-table::-webkit-scrollbar,
	.resistencia-iso-table::-webkit-scrollbar,
	.resistencia-ohm-table::-webkit-scrollbar,
	.polaridade-table::-webkit-scrollbar {
		height: 8px;
	}

	.ensaio-table::-webkit-scrollbar-track,
	.tensao-medida-table::-webkit-scrollbar-track,
	.resistencia-iso-table::-webkit-scrollbar-track,
	.resistencia-ohm-table::-webkit-scrollbar-track,
	.polaridade-table::-webkit-scrollbar-track {
		background: var(--bg-secondary);
		border-radius: 4px;
	}

	.ensaio-table::-webkit-scrollbar-thumb,
	.tensao-medida-table::-webkit-scrollbar-thumb,
	.resistencia-iso-table::-webkit-scrollbar-thumb,
	.resistencia-ohm-table::-webkit-scrollbar-thumb,
	.polaridade-table::-webkit-scrollbar-thumb {
		background: #3b82f6;
		border-radius: 4px;
	}

	.table-header,
	.table-row {
		display: grid;
		grid-template-columns: 150px repeat(5, minmax(90px, 1fr));
		gap: 0.5rem;
		align-items: center;
		min-width: 700px;
	}

	.resistencia-iso-table .table-header,
	.resistencia-iso-table .table-row {
		grid-template-columns: 150px repeat(4, minmax(90px, 1fr));
		min-width: 600px;
	}

	.resistencia-ohm-table .table-row {
		grid-template-columns: 150px 1fr;
		min-width: 350px;
	}

	.table-header span {
		font-weight: 700;
		color: var(--text-primary);
		background-color: var(--bg-secondary);
		padding: 0.75rem 0.5rem;
		border-radius: 6px;
		text-align: center;
		font-size: 0.85rem;
		border: 2px solid var(--border-color);
	}

	.row-label,
	.fase-label {
		font-weight: 700;
		color: var(--text-primary);
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		padding: 0.75rem 0.5rem;
		border-radius: 6px;
		font-size: 0.9rem;
		border: 2px solid var(--border-color);
		text-align: center;
	}

	.table-row input {
		padding: 0.65rem 0.5rem;
		border: 2px solid var(--border-color);
		border-radius: 6px;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.9rem;
		text-align: center;
		transition: all 0.2s ease;
		width: 100%;
	}

	.table-row input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
		transform: scale(1.02);
	}

	.table-row input:hover {
		border-color: #60a5fa;
	}

	.table-row label {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		background-color: var(--bg-secondary);
		border-radius: 6px;
		border: 2px solid var(--border-color);
		transition: all 0.2s ease;
	}

	.table-row label:hover {
		background-color: var(--bg-primary);
		border-color: #3b82f6;
	}

	.table-row label input[type='checkbox'] {
		width: 24px;
		height: 24px;
		cursor: pointer;
		accent-color: #3b82f6;
	}

	/* ENROLAMENTO MEDIDO ROW */
	.enrol-medido-row {
		display: grid;
		grid-template-columns: 150px repeat(6, minmax(80px, 1fr));
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 1rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
	}

	.enrol-medido-row span {
		font-weight: 600;
		color: var(--text-primary);
		font-size: 0.85rem;
	}

	.enrol-medido-row input {
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 0.85rem;
		text-align: center;
	}

	/* CONDIÇÕES GRID */
	.condicoes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 1.25rem;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
		border-radius: 10px;
		border: 2px solid var(--border-color);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
	}

	/* TEXTAREA */
	textarea {
		width: 100%;
		padding: 1.25rem;
		border: 2px solid var(--border-color);
		border-radius: 8px;
		background-color: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 1rem;
		font-family: inherit;
		resize: vertical;
		min-height: 180px;
		line-height: 1.6;
		transition: all 0.2s ease;
	}

	textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	textarea:hover {
		border-color: #60a5fa;
	}

	textarea::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
	}

	/* RESPONSIVE */
	@media (max-width: 1024px) {
		.tipo-selecao {
			gap: 2rem;
		}

		.verificacoes-grid {
			grid-template-columns: 1fr;
		}

		.table-header,
		.table-row {
			font-size: 0.85rem;
		}
	}

	@media (max-width: 768px) {
		.tc-tp-section {
			padding: 1rem;
		}

		.tipo-selecao {
			grid-template-columns: 1fr;
		}

		.tipo-checkbox {
			font-size: 1rem;
			padding: 1.5rem;
		}

		.grid-5 {
			grid-template-columns: 1fr;
		}

		.verificacoes-grid {
			grid-template-columns: 1fr;
		}

		.verificacao-row {
			grid-template-columns: 1fr;
			gap: 0.75rem;
			padding: 1.25rem;
		}

		.verif-options {
			justify-content: flex-start;
			flex-wrap: wrap;
		}

		.tensao-aplicada-em {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.table-header,
		.table-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.table-header span,
		.row-label,
		.fase-label {
			padding: 0.75rem;
			font-size: 0.85rem;
		}

		.table-row input {
			padding: 0.75rem;
			font-size: 0.9rem;
		}

		.enrol-medido-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
			padding: 1rem;
		}

		.condicoes-grid {
			grid-template-columns: 1fr;
			padding: 1rem;
		}

		.section-content {
			padding: 1.25rem;
		}

		.section-header {
			padding: 1.25rem 1.5rem;
		}

		.section-title {
			font-size: 0.95rem;
		}
	}

	@media (max-width: 480px) {
		.tc-tp-section {
			padding: 0.75rem;
		}

		.tipo-checkbox {
			font-size: 0.95rem;
			padding: 1.25rem;
		}

		.tipo-checkbox input[type='checkbox'] {
			width: 24px;
			height: 24px;
		}

		.section-header {
			padding: 1rem 1.25rem;
		}

		.section-title {
			font-size: 0.85rem;
			letter-spacing: 0.3px;
		}

		.section-content {
			padding: 1rem;
		}

		.field-group label {
			font-size: 0.8rem;
		}

		.field-group input {
			padding: 0.65rem;
			font-size: 0.9rem;
		}

		.legenda {
			flex-direction: column;
			gap: 0.75rem;
			padding: 1rem;
			font-size: 0.85rem;
		}

		.verificacao-row {
			padding: 1rem;
		}

		.verif-num {
			width: 35px;
			height: 35px;
			font-size: 1rem;
		}

		.verif-label {
			font-size: 0.9rem;
		}

		.verif-options label {
			padding: 0.6rem 1rem;
			font-size: 0.85rem;
		}

		textarea {
			padding: 1rem;
			font-size: 0.95rem;
			min-height: 150px;
		}
	}
</style>
