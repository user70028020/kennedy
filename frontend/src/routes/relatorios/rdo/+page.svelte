<script lang="ts">
	/**
	 * RDO de Montagem - 1:1 com Next.js FOD
	 * Todos os campos e funcionalidades idênticas
	 */
	import { browser } from '$app/environment';
	import PhotoCapture, { type Photo } from '$lib/components/reports/PhotoCapture.svelte';
	import SignatureCapture from '$lib/components/reports/SignatureCapture.svelte';
	import { auth } from '$lib/stores/auth.svelte';

	const API_URL = 'http://localhost:3000/api';

	// Interfaces
	interface Participante {
		nome: string;
		empresa: string;
		visto: string;
	}

	interface HorasTrabalho {
		horarioNormalInicio: string;
		horarioNormalTermino: string;
		liberacaoHorasExtras: 'sim' | 'nao' | '';
		liberacaoHorasExtrasObs: string;
		horasExtrasInicio: string;
		horasExtrasTermino: string;
		autorizadoPor: string;
		horasDeslocamentoInicio: string;
		horasDeslocamentoTermino: string;
		horasDeslocamentoTotal: string;
		horasTrabalhadasClienteInicio: string;
		horasTrabalhadasClienteTermino: string;
		horasTrabalhadasCliente: string;
		horarioAlmocoInicio: string;
		horarioAlmocoTermino: string;
		horarioAlmoco: string;
		horasJantarInicio: string;
		horasJantarTermino: string;
		horasJantar: string;
		horasDeslocamentoRetornoInicio: string;
		horasDeslocamentoRetornoTermino: string;
		horasDeslocamentoRetorno: string;
		horasDisposicaoInicio: string;
		horasDisposicaoTermino: string;
		horasDisposicao: string;
		horasTotaisTrabalhadas: string;
	}

	interface HorasDisponibilizadas {
		integracaoInicio: string;
		integracaoTermino: string;
		integracaoTotal: string;
		faltaRecursosInicio: string;
		faltaRecursosTermino: string;
		faltaRecursosTotal: string;
		condicoesClimaticasInicio: string;
		condicoesClimaticasTermino: string;
		condicoesClimaticasTotal: string;
		retomadaAtividadesInicio: string;
		retomadaAtividadesTermino: string;
		retomadaAtividadesTotal: string;
		outrosDescricao: string;
		outrosInicio: string;
		outrosTermino: string;
		outrosTotal: string;
		total: string;
	}

	// Estados - TODOS os campos do Next.js
	let template = $state<'nx-energy' | 'sercamp'>('sercamp');
	let numeroOS = $state('');
	let data = $state(new Date().toISOString().split('T')[0]);
	let projeto = $state('');
	let cliente = $state('');
	let cidade = $state('');
	let nomeSubestacao = $state('');
	let naturezaServico = $state('');
	let caracteristicasEquipamento = $state('');
	let numeroSerie = $state('');
	
	// Campos legados (compatibilidade)
	let local = $state('');
	let dadosEquipamento = $state('');
	let servico = $state('');
	let horarioInicio = $state('');
	let horarioTermino = $state('');

	// Participantes (mínimo 4 linhas)
	let participantes = $state<Participante[]>([
		{ nome: '', empresa: '', visto: '' },
		{ nome: '', empresa: '', visto: '' },
		{ nome: '', empresa: '', visto: '' },
		{ nome: '', empresa: '', visto: '' }
	]);

	// Representantes
	let representanteSercamp = $state('Sérgio Lima'); // PRÉ-PREENCHIDO
	let representanteSercampAssinatura = $state(''); // Será preenchido automaticamente no backend
	let representanteCliente = $state('');
	let representanteClienteAssinatura = $state('');
	let certificacaoHorasAssinatura = $state(''); // Certificação de horas

	// Atividades
	let atividadesExecutadas = $state<{ item: string; descricao: string }[]>([
		{ item: '1', descricao: '' }
	]);

	// Fotos
	let photos = $state<Photo[]>([]);

	// Observações
	let observacoes = $state('');

	// Horas de Trabalho - TODOS os campos (horários em 00:00 para facilitar)
	let horasTrabalho = $state<HorasTrabalho>({
		horarioNormalInicio: '00:00',
		horarioNormalTermino: '00:00',
		liberacaoHorasExtras: '',
		liberacaoHorasExtrasObs: '',
		horasExtrasInicio: '00:00',
		horasExtrasTermino: '00:00',
		autorizadoPor: '',
		horasDeslocamentoInicio: '00:00',
		horasDeslocamentoTermino: '00:00',
		horasDeslocamentoTotal: '0:00',
		horasTrabalhadasClienteInicio: '00:00',
		horasTrabalhadasClienteTermino: '00:00',
		horasTrabalhadasCliente: '0:00',
		horarioAlmocoInicio: '00:00',
		horarioAlmocoTermino: '00:00',
		horarioAlmoco: '0:00',
		horasJantarInicio: '00:00',
		horasJantarTermino: '00:00',
		horasJantar: '0:00',
		horasDeslocamentoRetornoInicio: '00:00',
		horasDeslocamentoRetornoTermino: '00:00',
		horasDeslocamentoRetorno: '0:00',
		horasDisposicaoInicio: '00:00',
		horasDisposicaoTermino: '00:00',
		horasDisposicao: '0:00',
		horasTotaisTrabalhadas: '0:00'
	});

	// Horas Disponibilizadas - TODOS os campos
	let horasDisponibilizadas = $state<HorasDisponibilizadas>({
		integracaoInicio: '00:00',
		integracaoTermino: '00:00',
		integracaoTotal: '0:00',
		faltaRecursosInicio: '00:00',
		faltaRecursosTermino: '00:00',
		faltaRecursosTotal: '0:00',
		condicoesClimaticasInicio: '00:00',
		condicoesClimaticasTermino: '00:00',
		condicoesClimaticasTotal: '0:00',
		retomadaAtividadesInicio: '00:00',
		retomadaAtividadesTermino: '00:00',
		retomadaAtividadesTotal: '0:00',
		outrosDescricao: '',
		outrosInicio: '00:00',
		outrosTermino: '00:00',
		outrosTotal: '0:00',
		total: '0:00'
	});

	// UI State
	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);
	let searchingOS = $state(false);
	let vistoDialogOpen = $state(false);
	let currentVistoIndex = $state<number | null>(null);
	let tempVistoSignature = $state('');

	// Funções de cálculo de tempo (corrigidas)
	function parseTimeToMinutes(timeStr: string): number {
		if (!timeStr || timeStr === '' || timeStr === '00:00') return 0;
		const parts = timeStr.split(':');
		if (parts.length !== 2) return 0;
		const hours = parseInt(parts[0], 10) || 0;
		const minutes = parseInt(parts[1], 10) || 0;
		return hours * 60 + minutes;
	}

	function minutesToTimeString(totalMinutes: number): string {
		if (totalMinutes < 0) totalMinutes = 0;
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return `${hours}:${minutes.toString().padStart(2, '0')}`;
	}

	function calculateTimeDifference(inicio: string, termino: string): string {
		// Se ambos forem 00:00 ou vazios, retorna 0:00
		if ((!inicio || inicio === '00:00') && (!termino || termino === '00:00')) {
			return '0:00';
		}
		
		const inicioMinutes = parseTimeToMinutes(inicio);
		const terminoMinutes = parseTimeToMinutes(termino);
		
		// Se término for menor ou igual ao início, retorna 0:00
		if (terminoMinutes <= inicioMinutes) return '0:00';
		
		return minutesToTimeString(terminoMinutes - inicioMinutes);
	}

	// Cálculos automáticos (corrigidos)
	const calculatedHorasTrabalho = $derived(() => {
		// Calcula deslocamento
		const deslocamentoTotal = calculateTimeDifference(
			horasTrabalho.horasDeslocamentoInicio,
			horasTrabalho.horasDeslocamentoTermino
		);

		// Calcula horas normais
		const horasNormaisMinutes = parseTimeToMinutes(
			calculateTimeDifference(horasTrabalho.horarioNormalInicio, horasTrabalho.horarioNormalTermino)
		);

		// Calcula horas extras
		const horasExtrasMinutes = parseTimeToMinutes(
			calculateTimeDifference(horasTrabalho.horasExtrasInicio, horasTrabalho.horasExtrasTermino)
		);

		// Calcula almoço
		const almocoMinutes = parseTimeToMinutes(
			calculateTimeDifference(horasTrabalho.horarioAlmocoInicio, horasTrabalho.horarioAlmocoTermino)
		);

		// Calcula jantar
		const jantarMinutes = parseTimeToMinutes(
			calculateTimeDifference(horasTrabalho.horasJantarInicio, horasTrabalho.horasJantarTermino)
		);

		// Calcula deslocamento retorno
		const deslocamentoRetornoMinutes = parseTimeToMinutes(
			calculateTimeDifference(
				horasTrabalho.horasDeslocamentoRetornoInicio,
				horasTrabalho.horasDeslocamentoRetornoTermino
			)
		);

		// Calcula disposição
		const disposicaoMinutes = parseTimeToMinutes(
			calculateTimeDifference(horasTrabalho.horasDisposicaoInicio, horasTrabalho.horasDisposicaoTermino)
		);

		// Horas trabalhadas no cliente = horas normais + horas extras - almoço - jantar
		const horasTrabalhadasClienteMinutes = Math.max(0, horasNormaisMinutes + horasExtrasMinutes - almocoMinutes - jantarMinutes);
		
		// Deslocamento em minutos
		const deslocamentoMinutes = parseTimeToMinutes(deslocamentoTotal);
		
		// Total = horas cliente + deslocamento + deslocamento retorno + disposição
		const totalMinutes = horasTrabalhadasClienteMinutes + deslocamentoMinutes + deslocamentoRetornoMinutes + disposicaoMinutes;

		return {
			horasDeslocamentoTotal: deslocamentoTotal,
			horasTrabalhadasCliente: minutesToTimeString(horasTrabalhadasClienteMinutes),
			horasTotaisTrabalhadas: minutesToTimeString(totalMinutes),
			horarioAlmoco: calculateTimeDifference(horasTrabalho.horarioAlmocoInicio, horasTrabalho.horarioAlmocoTermino),
			horasJantar: calculateTimeDifference(horasTrabalho.horasJantarInicio, horasTrabalho.horasJantarTermino),
			horasDeslocamentoRetorno: calculateTimeDifference(
				horasTrabalho.horasDeslocamentoRetornoInicio,
				horasTrabalho.horasDeslocamentoRetornoTermino
			),
			horasDisposicao: calculateTimeDifference(
				horasTrabalho.horasDisposicaoInicio,
				horasTrabalho.horasDisposicaoTermino
			)
		};
	});

	const calculatedHorasDisponibilizadas = $derived(() => {
		const integracaoTotal = calculateTimeDifference(
			horasDisponibilizadas.integracaoInicio,
			horasDisponibilizadas.integracaoTermino
		);
		const faltaRecursosTotal = calculateTimeDifference(
			horasDisponibilizadas.faltaRecursosInicio,
			horasDisponibilizadas.faltaRecursosTermino
		);
		const condicoesClimaticasTotal = calculateTimeDifference(
			horasDisponibilizadas.condicoesClimaticasInicio,
			horasDisponibilizadas.condicoesClimaticasTermino
		);
		const retomadaAtividadesTotal = calculateTimeDifference(
			horasDisponibilizadas.retomadaAtividadesInicio,
			horasDisponibilizadas.retomadaAtividadesTermino
		);
		const outrosTotal = calculateTimeDifference(
			horasDisponibilizadas.outrosInicio,
			horasDisponibilizadas.outrosTermino
		);

		const totalMinutes =
			parseTimeToMinutes(integracaoTotal) +
			parseTimeToMinutes(faltaRecursosTotal) +
			parseTimeToMinutes(condicoesClimaticasTotal) +
			parseTimeToMinutes(retomadaAtividadesTotal) +
			parseTimeToMinutes(outrosTotal);

		return {
			integracaoTotal,
			faltaRecursosTotal,
			condicoesClimaticasTotal,
			retomadaAtividadesTotal,
			outrosTotal,
			total: minutesToTimeString(totalMinutes)
		};
	});

	// Atualizar valores calculados automaticamente (corrigido)
	$effect(() => {
		const calc = calculatedHorasTrabalho();
		// Atualiza apenas se os valores mudaram para evitar loops
		if (horasTrabalho.horasDeslocamentoTotal !== calc.horasDeslocamentoTotal) {
			horasTrabalho.horasDeslocamentoTotal = calc.horasDeslocamentoTotal;
		}
		if (horasTrabalho.horasTrabalhadasCliente !== calc.horasTrabalhadasCliente) {
			horasTrabalho.horasTrabalhadasCliente = calc.horasTrabalhadasCliente;
		}
		if (horasTrabalho.horasTotaisTrabalhadas !== calc.horasTotaisTrabalhadas) {
			horasTrabalho.horasTotaisTrabalhadas = calc.horasTotaisTrabalhadas;
		}
		if (horasTrabalho.horarioAlmoco !== calc.horarioAlmoco) {
			horasTrabalho.horarioAlmoco = calc.horarioAlmoco;
		}
		if (horasTrabalho.horasJantar !== calc.horasJantar) {
			horasTrabalho.horasJantar = calc.horasJantar;
		}
		if (horasTrabalho.horasDeslocamentoRetorno !== calc.horasDeslocamentoRetorno) {
			horasTrabalho.horasDeslocamentoRetorno = calc.horasDeslocamentoRetorno;
		}
		if (horasTrabalho.horasDisposicao !== calc.horasDisposicao) {
			horasTrabalho.horasDisposicao = calc.horasDisposicao;
		}
	});

	$effect(() => {
		const calc = calculatedHorasDisponibilizadas();
		// Atualiza apenas se os valores mudaram para evitar loops
		if (horasDisponibilizadas.integracaoTotal !== calc.integracaoTotal) {
			horasDisponibilizadas.integracaoTotal = calc.integracaoTotal;
		}
		if (horasDisponibilizadas.faltaRecursosTotal !== calc.faltaRecursosTotal) {
			horasDisponibilizadas.faltaRecursosTotal = calc.faltaRecursosTotal;
		}
		if (horasDisponibilizadas.condicoesClimaticasTotal !== calc.condicoesClimaticasTotal) {
			horasDisponibilizadas.condicoesClimaticasTotal = calc.condicoesClimaticasTotal;
		}
		if (horasDisponibilizadas.retomadaAtividadesTotal !== calc.retomadaAtividadesTotal) {
			horasDisponibilizadas.retomadaAtividadesTotal = calc.retomadaAtividadesTotal;
		}
		if (horasDisponibilizadas.outrosTotal !== calc.outrosTotal) {
			horasDisponibilizadas.outrosTotal = calc.outrosTotal;
		}
		if (horasDisponibilizadas.total !== calc.total) {
			horasDisponibilizadas.total = calc.total;
		}
	});

	// Funções de manipulação
	function addParticipante() {
		participantes = [...participantes, { nome: '', empresa: '', visto: '' }];
	}

	function removeParticipante(index: number) {
		if (participantes.length > 1) {
			participantes = participantes.filter((_, i) => i !== index);
		}
	}

	function handleVistoClick(index: number) {
		currentVistoIndex = index;
		tempVistoSignature = participantes[index].visto;
		vistoDialogOpen = true;
	}

	function handleVistoSave() {
		if (currentVistoIndex !== null) {
			participantes[currentVistoIndex].visto = tempVistoSignature;
			participantes = [...participantes];
		}
		vistoDialogOpen = false;
		currentVistoIndex = null;
		tempVistoSignature = '';
	}

	function addAtividade() {
		atividadesExecutadas = [
			...atividadesExecutadas,
			{ item: String(atividadesExecutadas.length + 1), descricao: '' }
		];
	}

	function removeAtividade(index: number) {
		atividadesExecutadas = atividadesExecutadas.filter((_, i) => i !== index);
	}

	// Submit handler
	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		success = false;

		if (!numeroOS.trim()) {
			error = 'Número da OS é obrigatório';
			return;
		}

		loading = true;

		try {
			// Send COMPLETE data structure matching RDOMontagemData
			const requestBody = {
				// Template
				template: template === 'nx-energy' ? 'nx-energy' : 'sercamp',
				
				// Identificação
				numeroOS,
				data: data ? new Date(data).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
				projeto,
				cliente,
				cidade,
				nomeSubestacao,
				
				// Equipamento
				naturezaServico,
				caracteristicasEquipamento,
				numeroSerie,
				
				// Equipe
				participantes: participantes.map(p => ({
					nome: p.nome,
					empresa: p.empresa,
					visto: p.visto
				})),
				
				// Representantes
				representanteSercamp,
				representanteSercampAssinatura,
				representanteCliente,
				representanteClienteAssinatura,
				certificacaoHorasAssinatura,
				
				// Atividades
				atividadesExecutadas: atividadesExecutadas.map(a => ({
					item: a.item,
					descricao: a.descricao
				})),
				
				// Horas de Trabalho - COMPLETE
				horasTrabalho: {
					horarioNormalInicio: horasTrabalho.horarioNormalInicio,
					horarioNormalTermino: horasTrabalho.horarioNormalTermino,
					liberacaoHorasExtras: horasTrabalho.liberacaoHorasExtras,
					liberacaoHorasExtrasObs: horasTrabalho.liberacaoHorasExtrasObs,
					horasExtrasInicio: horasTrabalho.horasExtrasInicio,
					horasExtrasTermino: horasTrabalho.horasExtrasTermino,
					autorizadoPor: horasTrabalho.autorizadoPor,
					horasDeslocamentoInicio: horasTrabalho.horasDeslocamentoInicio,
					horasDeslocamentoTermino: horasTrabalho.horasDeslocamentoTermino,
					horasDeslocamentoTotal: horasTrabalho.horasDeslocamentoTotal,
					horasTrabalhadasClienteInicio: horasTrabalho.horasTrabalhadasClienteInicio,
					horasTrabalhadasClienteTermino: horasTrabalho.horasTrabalhadasClienteTermino,
					horasTrabalhadasCliente: horasTrabalho.horasTrabalhadasCliente,
					horarioAlmocoInicio: horasTrabalho.horarioAlmocoInicio,
					horarioAlmocoTermino: horasTrabalho.horarioAlmocoTermino,
					horarioAlmoco: horasTrabalho.horarioAlmoco,
					horasJantarInicio: horasTrabalho.horasJantarInicio,
					horasJantarTermino: horasTrabalho.horasJantarTermino,
					horasJantar: horasTrabalho.horasJantar,
					horasDeslocamentoRetornoInicio: horasTrabalho.horasDeslocamentoRetornoInicio,
					horasDeslocamentoRetornoTermino: horasTrabalho.horasDeslocamentoRetornoTermino,
					horasDeslocamentoRetorno: horasTrabalho.horasDeslocamentoRetorno,
					horasDisposicaoInicio: horasTrabalho.horasDisposicaoInicio,
					horasDisposicaoTermino: horasTrabalho.horasDisposicaoTermino,
					horasDisposicao: horasTrabalho.horasDisposicao,
					horasTotaisTrabalhadas: horasTrabalho.horasTotaisTrabalhadas
				},
				
				// Horas Disponibilizadas - COMPLETE
				horasDisponibilizadas: {
					integracaoInicio: horasDisponibilizadas.integracaoInicio,
					integracaoTermino: horasDisponibilizadas.integracaoTermino,
					integracaoTotal: horasDisponibilizadas.integracaoTotal,
					faltaRecursosInicio: horasDisponibilizadas.faltaRecursosInicio,
					faltaRecursosTermino: horasDisponibilizadas.faltaRecursosTermino,
					faltaRecursosTotal: horasDisponibilizadas.faltaRecursosTotal,
					condicoesClimaticasInicio: horasDisponibilizadas.condicoesClimaticasInicio,
					condicoesClimaticasTermino: horasDisponibilizadas.condicoesClimaticasTermino,
					condicoesClimaticasTotal: horasDisponibilizadas.condicoesClimaticasTotal,
					retomadaAtividadesInicio: horasDisponibilizadas.retomadaAtividadesInicio,
					retomadaAtividadesTermino: horasDisponibilizadas.retomadaAtividadesTermino,
					retomadaAtividadesTotal: horasDisponibilizadas.retomadaAtividadesTotal,
					outrosDescricao: horasDisponibilizadas.outrosDescricao,
					outrosInicio: horasDisponibilizadas.outrosInicio,
					outrosTermino: horasDisponibilizadas.outrosTermino,
					outrosTotal: horasDisponibilizadas.outrosTotal,
					total: horasDisponibilizadas.total
				},
				
				// Fotos
				photos: photos.map(p => ({
					id: p.id,
					data: p.data,
					name: p.name || 'foto'
				})),
				
				// Observações
				observacoes
			};

			const response = await fetch(`${API_URL}/reports/rdo`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${auth.token}`
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Erro ao gerar relatório');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `rdo_montagem_${numeroOS}_${Date.now()}.docx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			success = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro ao gerar relatório';
		} finally {
			loading = false;
		}
	}
</script>


<div class="max-w-7xl mx-auto p-6">
	<div class="modern-card">
		<div class="modern-card-header">
			<h1 class="text-2xl font-bold" style="color: var(--text-primary);">RDO de Montagem</h1>
			<p class="text-sm" style="color: var(--text-muted);">Relatório Diário de Obra - Todos os campos</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Template -->
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<h3 class="font-semibold mb-3" style="color: var(--text-primary);">Template</h3>
				<div class="flex gap-4">
					<label class="flex items-center gap-2">
						<input type="radio" bind:group={template} value="sercamp" class="modern-radio" />
						<span>SERCAMP</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="radio" bind:group={template} value="nx-energy" class="modern-radio" />
						<span>NX Energy</span>
					</label>
				</div>
			</section>

			<!-- Informações Básicas -->
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<h3 class="font-semibold mb-3" style="color: var(--text-primary);">Informações Básicas</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label class="modern-label modern-label-required">Número da OS</label>
						<input type="text" bind:value={numeroOS} required class="modern-input" placeholder="OS-2024-001" />
					</div>
					<div>
						<label class="modern-label">Data</label>
						<input type="date" bind:value={data} class="modern-input" />
					</div>
					<div>
						<label class="modern-label">Projeto</label>
						<input type="text" bind:value={projeto} class="modern-input" />
					</div>
					<div>
						<label class="modern-label">Cliente</label>
						<input type="text" bind:value={cliente} class="modern-input" />
					</div>
					<div>
						<label class="modern-label">Cidade</label>
						<input type="text" bind:value={cidade} class="modern-input" />
					</div>
					<div>
						<label class="modern-label">Nome da Subestação</label>
						<input type="text" bind:value={nomeSubestacao} class="modern-input" />
					</div>
					<div class="md:col-span-3">
						<label class="modern-label">Natureza do Serviço</label>
						<textarea bind:value={naturezaServico} rows="2" class="modern-textarea"></textarea>
					</div>
					<div class="md:col-span-2">
						<label class="modern-label">Características do Equipamento</label>
						<input type="text" bind:value={caracteristicasEquipamento} class="modern-input" />
					</div>
					<div>
						<label class="modern-label">Número de Série</label>
						<input type="text" bind:value={numeroSerie} class="modern-input" />
					</div>
				</div>
			</section>

			<!-- Participantes -->
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<div class="flex justify-between items-center mb-3">
					<h3 class="font-semibold" style="color: var(--text-primary);">Participantes</h3>
					<button type="button" onclick={addParticipante} class="btn-modern btn-modern-secondary btn-sm">
						+ Adicionar
					</button>
				</div>
				<div class="space-y-3">
					{#each participantes as p, i}
						<div class="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded" style="background: var(--bg-primary);">
							<input type="text" bind:value={p.nome} placeholder="Nome" class="modern-input" />
							<input type="text" bind:value={p.empresa} placeholder="Empresa" class="modern-input" />
							<button type="button" onclick={() => handleVistoClick(i)} class="btn-modern btn-modern-secondary">
								{p.visto ? '✓ Visto' : 'Adicionar Visto'}
							</button>
							<button type="button" onclick={() => removeParticipante(i)} class="btn-modern btn-modern-secondary">
								Remover
							</button>
						</div>
					{/each}
				</div>
			</section>

			<!-- Resumo da Jornada de Trabalho -->
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<h3 class="font-semibold mb-4 text-base" style="color: var(--text-primary);">Resumo da Jornada de Trabalho</h3>
				
				<!-- Horário Normal e Horas Extras -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div class="space-y-2">
						<label class="modern-label font-medium">Horário Normal de Trabalho</label>
						<div class="grid grid-cols-2 gap-2">
							<div>
								<label class="text-xs" style="color: var(--text-muted);">Início</label>
								<input type="time" bind:value={horasTrabalho.horarioNormalInicio} class="modern-input" />
							</div>
							<div>
								<label class="text-xs" style="color: var(--text-muted);">Término</label>
								<input type="time" bind:value={horasTrabalho.horarioNormalTermino} class="modern-input" />
							</div>
						</div>
					</div>

					<div class="space-y-2">
						<label class="modern-label font-medium">Liberação de Horas Extras</label>
						<div class="flex gap-6">
							<label class="flex items-center gap-2 cursor-pointer">
								<input 
									type="radio" 
									name="horasExtras" 
									value="sim"
									checked={horasTrabalho.liberacaoHorasExtras === 'sim'}
									onchange={() => horasTrabalho.liberacaoHorasExtras = 'sim'}
									class="w-4 h-4"
								/>
								<span class="text-sm">Sim</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input 
									type="radio" 
									name="horasExtras" 
									value="nao"
									checked={horasTrabalho.liberacaoHorasExtras === 'nao'}
									onchange={() => horasTrabalho.liberacaoHorasExtras = 'nao'}
									class="w-4 h-4"
								/>
								<span class="text-sm">Não</span>
							</label>
						</div>
					</div>
				</div>

				<!-- OBS e Horários de Horas Extras -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
					<div>
						<label class="text-xs" style="color: var(--text-muted);">Observação</label>
						<input type="text" bind:value={horasTrabalho.liberacaoHorasExtrasObs} class="modern-input" placeholder="Observação" />
					</div>
					<div>
						<label class="text-xs" style="color: var(--text-muted);">Início</label>
						<input type="time" bind:value={horasTrabalho.horasExtrasInicio} class="modern-input" />
					</div>
					<div>
						<label class="text-xs" style="color: var(--text-muted);">Término</label>
						<input type="time" bind:value={horasTrabalho.horasExtrasTermino} class="modern-input" />
					</div>
				</div>

				<!-- Autorizado por -->
				<div class="mb-4">
					<label class="modern-label font-medium">Autorizado por</label>
					<input type="text" bind:value={horasTrabalho.autorizadoPor} class="modern-input" placeholder="Nome do autorizador" />
				</div>

				<!-- Separador -->
				<div class="border-t my-4" style="border-color: var(--border-color);"></div>

				<!-- Horas de Deslocamento -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Horas de Deslocamento</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasTrabalho.horasDeslocamentoInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasTrabalho.horasDeslocamentoTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasTrabalho.horasDeslocamentoTotal}
							</div>
						</div>
					</div>
				</div>

				<!-- Horas Trabalhadas no Cliente -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Horas Trabalhadas no Cliente</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasTrabalho.horasTrabalhadasClienteInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasTrabalho.horasTrabalhadasClienteTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasTrabalho.horasTrabalhadasCliente}
							</div>
						</div>
					</div>
				</div>

				<!-- Horário de Almoço -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Horário de Almoço</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasTrabalho.horarioAlmocoInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasTrabalho.horarioAlmocoTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasTrabalho.horarioAlmoco}
							</div>
						</div>
					</div>
				</div>

				<!-- Horas de Jantar -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Horas de Jantar</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasTrabalho.horasJantarInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasTrabalho.horasJantarTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasTrabalho.horasJantar}
							</div>
						</div>
					</div>
				</div>

				<!-- Horas de Deslocamento Retorno -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Horas de Deslocamento Retorno</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasTrabalho.horasDeslocamentoRetornoInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasTrabalho.horasDeslocamentoRetornoTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasTrabalho.horasDeslocamentoRetorno}
							</div>
						</div>
					</div>
				</div>

				<!-- Horas de Disposição -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Horas de Disposição</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasTrabalho.horasDisposicaoInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasTrabalho.horasDisposicaoTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasTrabalho.horasDisposicao}
							</div>
						</div>
					</div>
				</div>

				<!-- Total de Horas Trabalhadas (DESTAQUE) -->
				<div class="mt-6 p-4 rounded-lg" style="background: rgba(34, 197, 94, 0.15); border: 2px solid rgba(34, 197, 94, 0.4);">
					<div class="flex justify-between items-center">
						<span class="text-base font-bold" style="color: rgb(22, 163, 74);">Total de Horas Trabalhadas:</span>
						<span class="text-xl font-bold" style="color: rgb(22, 163, 74);">{horasTrabalho.horasTotaisTrabalhadas}</span>
					</div>
				</div>
			</section>

			<!-- Informações de Horas Disponibilizadas -->
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<h3 class="font-semibold mb-4 text-base" style="color: var(--text-primary);">Informações de Horas Disponibilizadas</h3>
				
				<!-- Integração -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Integração</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasDisponibilizadas.integracaoInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasDisponibilizadas.integracaoTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasDisponibilizadas.integracaoTotal}
							</div>
						</div>
					</div>
				</div>

				<!-- Falta de Recursos -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Falta de Recursos</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasDisponibilizadas.faltaRecursosInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasDisponibilizadas.faltaRecursosTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasDisponibilizadas.faltaRecursosTotal}
							</div>
						</div>
					</div>
				</div>

				<!-- Condições Climáticas -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Condições Climáticas</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasDisponibilizadas.condicoesClimaticasInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasDisponibilizadas.condicoesClimaticasTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasDisponibilizadas.condicoesClimaticasTotal}
							</div>
						</div>
					</div>
				</div>

				<!-- Retomada de Atividades -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Retomada de Atividades</label>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasDisponibilizadas.retomadaAtividadesInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasDisponibilizadas.retomadaAtividadesTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasDisponibilizadas.retomadaAtividadesTotal}
							</div>
						</div>
					</div>
				</div>

				<!-- Outros -->
				<div class="space-y-2 mb-4">
					<label class="modern-label font-medium">Outros</label>
					<div class="mb-2">
						<label class="text-xs" style="color: var(--text-muted);">Descrição</label>
						<input type="text" bind:value={horasDisponibilizadas.outrosDescricao} class="modern-input" placeholder="Descreva outros motivos" />
					</div>
					<div class="grid grid-cols-3 gap-3">
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Início</label>
							<input type="time" bind:value={horasDisponibilizadas.outrosInicio} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Término</label>
							<input type="time" bind:value={horasDisponibilizadas.outrosTermino} class="modern-input" />
						</div>
						<div>
							<label class="text-xs" style="color: var(--text-muted);">Total (calculado)</label>
							<div class="h-10 px-3 flex items-center rounded-md text-sm font-semibold" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: rgb(22, 163, 74);">
								{horasDisponibilizadas.outrosTotal}
							</div>
						</div>
					</div>
				</div>

				<!-- Total de Horas Trabalhadas (DESTAQUE) -->
				<div class="mt-6 p-4 rounded-lg" style="background: rgba(34, 197, 94, 0.15); border: 2px solid rgba(34, 197, 94, 0.4);">
					<div class="flex justify-between items-center">
						<span class="text-base font-bold" style="color: rgb(22, 163, 74);">Total de Horas Trabalhadas:</span>
						<span class="text-xl font-bold" style="color: rgb(22, 163, 74);">{horasDisponibilizadas.total}</span>
					</div>
				</div>
			</section>
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<div class="flex justify-between items-center mb-3">
					<h3 class="font-semibold" style="color: var(--text-primary);">Atividades Executadas</h3>
					<button type="button" onclick={addAtividade} class="btn-modern btn-modern-secondary btn-sm">
						+ Adicionar
					</button>
				</div>
				<div class="space-y-2">
					{#each atividadesExecutadas as ativ, i}
						<div class="flex gap-2">
							<span class="px-3 py-2 rounded" style="background: var(--bg-primary);">{ativ.item}</span>
							<input type="text" bind:value={ativ.descricao} placeholder="Descrição da atividade" class="modern-input flex-1" />
							<button type="button" onclick={() => removeAtividade(i)} class="btn-modern btn-modern-secondary">
								Remover
							</button>
						</div>
					{/each}
				</div>
			</section>

			<!-- Fotos -->
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<h3 class="font-semibold mb-3" style="color: var(--text-primary);">Fotos</h3>
				<PhotoCapture bind:photos maxPhotos={30} />
			</section>

			<!-- Representantes -->
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<h3 class="font-semibold mb-3" style="color: var(--text-primary);">Representantes</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label class="modern-label">Representante SERCAMP</label>
						<input 
							type="text" 
							bind:value={representanteSercamp} 
							class="modern-input mb-3" 
							readonly
							style="background-color: var(--bg-tertiary); cursor: not-allowed;"
						/>
						<div class="p-3 rounded-lg" style="background-color: var(--bg-tertiary); border: 1px solid var(--border-color);">
							<p class="text-sm flex items-center gap-2" style="color: var(--text-muted);">
								<svg class="w-5 h-5" style="color: var(--color-success);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
								<span>Assinatura automática do Sérgio Lima</span>
							</p>
						</div>
					</div>
					<div>
						<label class="modern-label">Representante Cliente</label>
						<input type="text" bind:value={representanteCliente} class="modern-input mb-3" />
						<SignatureCapture label="Assinatura Cliente" bind:value={representanteClienteAssinatura} />
					</div>
				</div>
			</section>

			<!-- Certificação de Horas -->
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<h3 class="font-semibold mb-3" style="color: var(--text-primary);">Certificação de Horas</h3>
				<SignatureCapture label="Assinatura do Responsável" bind:value={certificacaoHorasAssinatura} />
			</section>

			<!-- Observações -->
			<section class="p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
				<h3 class="font-semibold mb-3" style="color: var(--text-primary);">Observações</h3>
				<textarea bind:value={observacoes} rows="4" class="modern-textarea" placeholder="Observações gerais..."></textarea>
			</section>

			<!-- Mensagens -->
			{#if error}
				<div class="modern-alert modern-alert-error">{error}</div>
			{/if}
			{#if success}
				<div class="modern-alert modern-alert-success">RDO gerado com sucesso!</div>
			{/if}

			<!-- Botões -->
			<div class="flex gap-3">
				<button type="submit" disabled={loading} class="btn-modern btn-modern-primary flex-1">
					{loading ? 'Gerando...' : 'Gerar RDO de Montagem'}
				</button>
			</div>
		</form>
	</div>
</div>

<!-- Dialog para Visto -->
{#if vistoDialogOpen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
			<h3 class="text-lg font-semibold mb-4">Adicionar Visto</h3>
			<SignatureCapture label="Assinatura do Visto" bind:value={tempVistoSignature} />
			<div class="flex gap-3 mt-4">
				<button onclick={handleVistoSave} class="btn-modern btn-modern-primary flex-1">Salvar</button>
				<button onclick={() => (vistoDialogOpen = false)} class="btn-modern btn-modern-secondary flex-1">Cancelar</button>
			</div>
		</div>
	</div>
{/if}
