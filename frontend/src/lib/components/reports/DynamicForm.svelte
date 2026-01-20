<script lang="ts">
	import type { EquipmentType } from './EquipmentSelector.svelte';
	import TransformadorSection from './TransformadorSection.svelte';
	import TCTPSection from './TCTPSection.svelte';

	export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';

	export interface SelectOption {
		value: string;
		label: string;
	}

	export interface FormField {
		id: string;
		label: string;
		type: FieldType;
		required?: boolean;
		placeholder?: string;
		options?: SelectOption[];
		defaultValue?: string | number | boolean;
		min?: number;
		max?: number;
		step?: number;
		rows?: number;
		section?: string;
	}

	const INSPECAO_OPTIONS: SelectOption[] = [
		{ value: '', label: 'Selecione...' },
		{ value: 'ok', label: 'OK - Conforme' },
		{ value: 'nc', label: 'NC - Não Conforme' },
		{ value: 'na', label: 'NA - Não Aplicável' }
	];

	const STATUS_OPTIONS: SelectOption[] = [
		{ value: '', label: 'Selecione...' },
		{ value: 'verde', label: '🟢 Conforme' },
		{ value: 'amarelo', label: '🟡 Alerta' },
		{ value: 'vermelho', label: '🔴 Não Conforme' }
	];

	// ============================================
	// TRANSFORMADOR - PÁGINA 1: DADOS E SERVIÇOS
	// ============================================
	const TRANSFORMADOR_FIELDS: FormField[] = [
		// Dados do Equipamento
		{ id: 'tipoTransformador', label: 'Tipo', type: 'select', required: true, section: 'Dados do Equipamento', options: [
			{ value: '', label: 'Selecione...' }, { value: 'a_seco', label: 'A seco' }, { value: 'a_oleo', label: 'A óleo' }
		]},
		{ id: 'localInstalacao', label: 'Local de Instalação', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroColeta', label: 'Número da Coleta', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroSerie', label: 'Número de Série', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'potencia', label: 'Potência (KVA)', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'dataFabricacao', label: 'Data de Fabricação', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'impedancia', label: 'Impedância (%)', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'volumeOleo', label: 'Volume de Óleo (L)', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tensaoInferior', label: 'Tensão Inferior (V)', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tensaoSuperior', label: 'Tensão Sup. (KV)', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'outros', label: 'Outros', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tampaInspecaoSim', label: 'Tampa de Inspeção: SIM', type: 'checkbox', section: 'Dados do Equipamento' },
		{ id: 'tampaInspecaoNao', label: 'Tampa de Inspeção: NÃO', type: 'checkbox', section: 'Dados do Equipamento' },
		{ id: 'registroSuperior', label: 'Registro: SUPERIOR', type: 'checkbox', section: 'Dados do Equipamento' },
		{ id: 'registroInferior', label: 'Registro: INFERIOR', type: 'checkbox', section: 'Dados do Equipamento' },
		{ id: 'distanciaTVTrafo', label: 'Distância entre T.V. e Trafo', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'veiculoQueAcessa', label: 'Veículo que Acessa', type: 'text', section: 'Dados do Equipamento' },
		// Tipo de Coleta
		{ id: 'coletaFQ', label: 'FQ (Físico-Química)', type: 'checkbox', section: 'Tipo de Coleta' },
		{ id: 'coletaCR', label: 'CR (Cromatografia)', type: 'checkbox', section: 'Tipo de Coleta' },
		{ id: 'coletaPCB', label: 'PCB', type: 'checkbox', section: 'Tipo de Coleta' },
		{ id: 'coleta2FALL', label: '2 FALL (Furfuraldeído)', type: 'checkbox', section: 'Tipo de Coleta' },
		// Tipo de Fluidos Isolantes
		{ id: 'tipoOleoA', label: 'Óleo Mineral – TIPO A (Naftênico)', type: 'checkbox', section: 'Tipo de Fluidos Isolantes' },
		{ id: 'tipoOleoB', label: 'Óleo Mineral – TIPO B (Parafínico)', type: 'checkbox', section: 'Tipo de Fluidos Isolantes' },
		{ id: 'tipoOleoC', label: 'Óleo Mineral – TIPO C (Misto)', type: 'checkbox', section: 'Tipo de Fluidos Isolantes' },
		{ id: 'tipoOleoVegetal', label: 'Óleo Vegetal', type: 'checkbox', section: 'Tipo de Fluidos Isolantes' },
		{ id: 'tipoOleoSilicone', label: 'Óleo Silicone', type: 'checkbox', section: 'Tipo de Fluidos Isolantes' },
		{ id: 'tipoOleoOutro', label: 'Outro', type: 'text', placeholder: 'Especifique...', section: 'Tipo de Fluidos Isolantes' },
		// Condições Ambientais
		{ id: 'temperaturaOleo', label: 'T. ÓLEO (ºC)', type: 'text', section: 'Condições Ambientais' },
		{ id: 'temperaturaAmbiente', label: 'TA (ºC)', type: 'text', section: 'Condições Ambientais' },
		{ id: 'umidadeRelativa', label: 'URA (%)', type: 'text', section: 'Condições Ambientais' },
		// Serviços Executados
		{ id: 'servicoColetaOleo', label: 'Coleta de óleo', type: 'checkbox', section: 'Serviços Executados' },
		{ id: 'servicoLimpezaGeral', label: 'Limpeza geral', type: 'checkbox', section: 'Serviços Executados' },
		{ id: 'servicoRetiradaVazamento', label: 'Retirada de vazamento', type: 'checkbox', section: 'Serviços Executados' },
		{ id: 'servicoTrocaComponentes', label: 'Troca de componentes', type: 'checkbox', section: 'Serviços Executados' },
		{ id: 'servicoInspecoesGerais', label: 'Inspeções gerais', type: 'checkbox', section: 'Serviços Executados' },
		{ id: 'servicoEnsaiosEletricos', label: 'Ensaios elétricos', type: 'checkbox', section: 'Serviços Executados' },
		{ id: 'servicoRetiradaOficina', label: 'Retirada do equipamento para oficina', type: 'checkbox', section: 'Serviços Executados' },
		{ id: 'servicoTratamentoTermoVacuo', label: 'Tratamento termo vácuo', type: 'checkbox', section: 'Serviços Executados' },
		{ id: 'servicoComplementoNivelOleo', label: 'Complemento de nível de óleo', type: 'checkbox', section: 'Serviços Executados' },
		{ id: 'servicoSubstituicaoOleo', label: 'Substituição de óleo', type: 'checkbox', section: 'Serviços Executados' },
		// Inspeções Gerais (18 itens)
		{ id: 'inspecaoIndicadorNivelOleo', label: 'Indicador de Nível de Óleo', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoTampaPrincipal', label: 'Tampa Principal', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoReleGasBuchholz', label: 'Relé de Gás - Buchholz', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoTampaInspecao', label: 'Tampa de Inspeção', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoTermometroOleo', label: 'Termômetro de Óleo', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoBuchaATBT', label: 'Bucha AT e BT', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoValvulaAlivio', label: 'Válvula de Alívio de Pressão', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoPintura', label: 'Pintura', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoRelePressaoSubita', label: 'Relé de Pressão Súbita', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoComutador', label: 'Comutador', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoTuboExplosao', label: 'Tubo de Explosão', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoVedacoes', label: 'Vedações', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoTanqueExpansao', label: 'Tanque de Expansão', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoRegistros', label: 'Registros', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoSilicaGel', label: 'Sílica Gel', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoNivelOleo', label: 'Nível de Óleo', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoRadiadores', label: 'Radiadores', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		{ id: 'inspecaoAterramento', label: 'Aterramento', type: 'select', section: 'Inspeções Gerais', options: INSPECAO_OPTIONS },
		// Relação de Transformação - TTR
		{ id: 'ttrRelacaoNominal', label: 'Relação Nominal', type: 'text', section: 'Relação de Transformação - TTR' },
		{ id: 'ttrLigacao', label: 'Ligação', type: 'text', placeholder: 'Ex: Dv N1', section: 'Relação de Transformação - TTR' },
		{ id: 'ttrH1H3_X1X0', label: 'H1-H3 | X1-X0', type: 'text', section: 'Relação de Transformação - TTR' },
		{ id: 'ttrH2H1_X2X0', label: 'H2-H1 | X2-X0', type: 'text', section: 'Relação de Transformação - TTR' },
		{ id: 'ttrH3H2_X3X0', label: 'H3-H2 | X3-X0', type: 'text', section: 'Relação de Transformação - TTR' },
		// Resistência Ôhmica
		{ id: 'resOhmicaH1H2', label: 'H1-H2', type: 'text', section: 'Resistência Ôhmica - Enrolamentos' },
		{ id: 'resOhmicaH1H2Unidade', label: 'Unidade H1-H2', type: 'select', section: 'Resistência Ôhmica - Enrolamentos', options: [
			{ value: 'mΩ', label: 'mΩ' }, { value: 'µΩ', label: 'µΩ' }, { value: 'Ω', label: 'Ω' }
		]},
		{ id: 'resOhmicaH2H3', label: 'H2-H3', type: 'text', section: 'Resistência Ôhmica - Enrolamentos' },
		{ id: 'resOhmicaH2H3Unidade', label: 'Unidade H2-H3', type: 'select', section: 'Resistência Ôhmica - Enrolamentos', options: [
			{ value: 'mΩ', label: 'mΩ' }, { value: 'µΩ', label: 'µΩ' }, { value: 'Ω', label: 'Ω' }
		]},
		{ id: 'resOhmicaH3H1', label: 'H3-H1', type: 'text', section: 'Resistência Ôhmica - Enrolamentos' },
		{ id: 'resOhmicaH3H1Unidade', label: 'Unidade H3-H1', type: 'select', section: 'Resistência Ôhmica - Enrolamentos', options: [
			{ value: 'mΩ', label: 'mΩ' }, { value: 'µΩ', label: 'µΩ' }, { value: 'Ω', label: 'Ω' }
		]},
		{ id: 'resOhmicaX1X0', label: 'X1-X0', type: 'text', section: 'Resistência Ôhmica - Enrolamentos' },
		{ id: 'resOhmicaX1X0Unidade', label: 'Unidade X1-X0', type: 'select', section: 'Resistência Ôhmica - Enrolamentos', options: [
			{ value: 'mΩ', label: 'mΩ' }, { value: 'µΩ', label: 'µΩ' }, { value: 'Ω', label: 'Ω' }
		]},
		{ id: 'resOhmicaX2X0', label: 'X2-X0', type: 'text', section: 'Resistência Ôhmica - Enrolamentos' },
		{ id: 'resOhmicaX2X0Unidade', label: 'Unidade X2-X0', type: 'select', section: 'Resistência Ôhmica - Enrolamentos', options: [
			{ value: 'mΩ', label: 'mΩ' }, { value: 'µΩ', label: 'µΩ' }, { value: 'Ω', label: 'Ω' }
		]},
		{ id: 'resOhmicaX3X0', label: 'X3-X0', type: 'text', section: 'Resistência Ôhmica - Enrolamentos' },
		{ id: 'resOhmicaX3X0Unidade', label: 'Unidade X3-X0', type: 'select', section: 'Resistência Ôhmica - Enrolamentos', options: [
			{ value: 'mΩ', label: 'mΩ' }, { value: 'µΩ', label: 'µΩ' }, { value: 'Ω', label: 'Ω' }
		]},
		// Resistência de Isolamento
		{ id: 'resIsolATBTMassa', label: 'AT–BT-MASSA (5.000 VCC) MΩ', type: 'text', section: 'Resistência de Isolamento - Megômetro' },
		{ id: 'resIsolATMassaBT', label: 'AT–MASSA-BT (5.000 VCC) MΩ', type: 'text', section: 'Resistência de Isolamento - Megômetro' },
		{ id: 'resIsolBTMassaAT', label: 'BT–MASSA-AT (500 VCC) MΩ', type: 'text', section: 'Resistência de Isolamento - Megômetro' },
		// Observações
		{ id: 'observacoesRecomendacoes', label: 'Observações | Recomendações', type: 'textarea', rows: 4, section: 'Observações' },
		// === PÁGINA 2: ANÁLISE FÍSICO-QUÍMICA ===
		{ id: 'fqAparencia', label: 'Aparência', type: 'text', section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqCor', label: 'Cor', type: 'text', section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqDensidade', label: 'Densidade a 20/4ºC (g/cm³)', type: 'text', section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqTensaoInterfacial', label: 'Tensão Interfacial a 25ºC (mN/m)', type: 'text', section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqTeorAgua', label: 'Teor de Água Medido (ppm)', type: 'text', section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqIndiceNeutralizacao', label: 'Índice de Neutralização (mgKOH/g)', type: 'text', section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqRigidezDieletrica', label: 'Rigidez Dielétrica (disco) (KV)', type: 'text', section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqFatorPotencia90', label: 'Fator de Potência a 90ºC (%)', type: 'text', section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqFatorPotencia100', label: 'Fator de Potência a 100ºC (%)', type: 'text', section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqDiagnostico', label: 'Diagnóstico/Conclusão FQ', type: 'textarea', rows: 3, section: 'Análise Físico-Química (FQ)' },
		{ id: 'fqStatus', label: 'Status FQ', type: 'select', section: 'Análise Físico-Química (FQ)', options: STATUS_OPTIONS },
		// === CROMATOGRAFIA (CR) ===
		{ id: 'crH2', label: 'H₂ Hidrogênio', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crO2', label: 'O₂ Oxigênio', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crN2', label: 'N₂ Nitrogênio', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crCO', label: 'CO Monóxido de Carbono', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crCH4', label: 'CH₄ Metano', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crCO2', label: 'CO₂ Dióxido de Carbono', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crC2H4', label: 'C₂H₄ Etileno', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crC2H6', label: 'C₂H₆ Etano', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crC2H2', label: 'C₂H₂ Acetileno', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crTotal', label: 'Total', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crTotalGasesCombustiveis', label: 'Total de Gases Combustíveis', type: 'text', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crDiagnostico', label: 'Diagnóstico/Conclusão CR', type: 'textarea', rows: 3, section: 'Cromatografia (CR) - Gases Dissolvidos' },
		{ id: 'crStatus', label: 'Status CR', type: 'select', section: 'Cromatografia (CR) - Gases Dissolvidos', options: STATUS_OPTIONS },
		{ id: 'crProximaAmostragem', label: 'Próxima Amostragem', type: 'text', placeholder: 'Ex: APÓS 12 MESES', section: 'Cromatografia (CR) - Gases Dissolvidos' },
		// === ANÁLISE PCB ===
		{ id: 'pcbTeor', label: 'Teor de PCB e Clorado (Mg/kg)', type: 'text', section: 'Análise de PCB' },
		{ id: 'pcbDiagnostico', label: 'Diagnóstico/Conclusão PCB', type: 'textarea', rows: 3, section: 'Análise de PCB' },
		{ id: 'pcbStatus', label: 'Status PCB', type: 'select', section: 'Análise de PCB', options: STATUS_OPTIONS },
		// === ANÁLISE FURFURALDEÍDO (2FALL) ===
		{ id: 'fall5HMF', label: '5-Hidroximetil-2-Furfural (5HMF)', type: 'text', section: 'Análise Teor de Furfuraldeído (2FALL)' },
		{ id: 'fall2FOL', label: '2-Furfurilalcool (2FOL)', type: 'text', section: 'Análise Teor de Furfuraldeído (2FALL)' },
		{ id: 'fall2FAL', label: '2-Furfural (2FAL)', type: 'text', section: 'Análise Teor de Furfuraldeído (2FALL)' },
		{ id: 'fall2ACF', label: '2-Acetil Furano (2ACF)', type: 'text', section: 'Análise Teor de Furfuraldeído (2FALL)' },
		{ id: 'fall5MEF', label: '5-Metil-2-Furfural (5MEF)', type: 'text', section: 'Análise Teor de Furfuraldeído (2FALL)' },
		{ id: 'fallGP', label: 'Grau de Polimerização (GP)', type: 'text', section: 'Análise Teor de Furfuraldeído (2FALL)' },
		{ id: 'fallDiagnostico', label: 'Diagnóstico/Conclusão 2FALL', type: 'textarea', rows: 3, section: 'Análise Teor de Furfuraldeído (2FALL)' },
		{ id: 'fallStatus', label: 'Status 2FALL', type: 'select', section: 'Análise Teor de Furfuraldeído (2FALL)', options: STATUS_OPTIONS },
		{ id: 'fallProximaAmostragem', label: 'Próxima Amostragem', type: 'text', placeholder: 'Ex: 12 MESES', section: 'Análise Teor de Furfuraldeído (2FALL)' },
	];

	// Outros equipamentos (simplificados)
	const DISJUNTOR_FIELDS: FormField[] = [
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tipo', label: 'Tipo', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroSerie', label: 'Número de Série', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'localInstalacao', label: 'Local de Instalação', type: 'text', section: 'Dados do Equipamento' },
	];

	const RELE_PROTECAO_FIELDS: FormField[] = [
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tipoModelo', label: 'Tipo/Modelo', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroSerie', label: 'Número de Série', type: 'text', section: 'Dados do Equipamento' },
	];

	const CHAVE_SECCIONADORA_FIELDS: FormField[] = [
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tipo', label: 'Tipo', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroSerie', label: 'Número de Série', type: 'text', section: 'Dados do Equipamento' },
	];

	const RELIGADOR_FIELDS: FormField[] = [
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tipo', label: 'Tipo', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroSerie', label: 'Número de Série', type: 'text', section: 'Dados do Equipamento' },
	];

	const TC_TP_FIELDS: FormField[] = [
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tipo', label: 'Tipo (TC/TP)', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroSerie', label: 'Número de Série', type: 'text', section: 'Dados do Equipamento' },
	];

	const RETIFICADOR_BATERIA_FIELDS: FormField[] = [
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tipo', label: 'Tipo', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroSerie', label: 'Número de Série', type: 'text', section: 'Dados do Equipamento' },
	];

	const BANCO_CAPACITORES_FIELDS: FormField[] = [
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tipo', label: 'Tipo', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroSerie', label: 'Número de Série', type: 'text', section: 'Dados do Equipamento' },
	];

	const PARA_RAIO_FIELDS: FormField[] = [
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tipo', label: 'Tipo', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'numeroSerie', label: 'Número de Série', type: 'text', section: 'Dados do Equipamento' },
	];

	const CABOS_FIELDS: FormField[] = [
		{ id: 'fabricante', label: 'Fabricante', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'tipo', label: 'Tipo', type: 'text', section: 'Dados do Equipamento' },
		{ id: 'comprimento', label: 'Comprimento (m)', type: 'text', section: 'Dados do Equipamento' },
	];

	const EQUIPMENT_FIELDS: Record<EquipmentType, FormField[]> = {
		'transformador': TRANSFORMADOR_FIELDS,
		'transformador_instrumento': TC_TP_FIELDS,
		'disjuntor': DISJUNTOR_FIELDS,
		'rele_protecao': RELE_PROTECAO_FIELDS,
		'chave_seccionadora': CHAVE_SECCIONADORA_FIELDS,
		'chave_religadora': RELIGADOR_FIELDS,
		'painel_religador': RELIGADOR_FIELDS,
		'retificador_bateria': RETIFICADOR_BATERIA_FIELDS,
		'banco_capacitores': BANCO_CAPACITORES_FIELDS,
		'para_raio': PARA_RAIO_FIELDS,
		'cabos': CABOS_FIELDS,
	};

	// Props
	let { 
		equipmentType = $bindable<EquipmentType | null>(null),
		values = $bindable<Record<string, any>>({}),
		onchange
	}: {
		equipmentType?: EquipmentType | null;
		values?: Record<string, any>;
		onchange?: (values: Record<string, any>) => void;
	} = $props();

	let fields = $derived(equipmentType ? EQUIPMENT_FIELDS[equipmentType] || [] : []);

	let fieldsBySection = $derived(() => {
		const sections: Record<string, FormField[]> = {};
		for (const field of fields) {
			const section = field.section || 'Geral';
			if (!sections[section]) sections[section] = [];
			sections[section].push(field);
		}
		return sections;
	});

	// Seções especiais do transformador que usam componente customizado
	const TRANSFORMADOR_SPECIAL_SECTIONS = [
		'Resistência Ôhmica - Enrolamentos',
		'Resistência de Isolamento - Megômetro'
	];

	function isTransformadorSpecialSection(sectionName: string): boolean {
		return equipmentType === 'transformador' && TRANSFORMADOR_SPECIAL_SECTIONS.includes(sectionName);
	}

	// Verifica se é transformador de instrumento (usa componente especial completo)
	function isTransformadorInstrumento(): boolean {
		return equipmentType === 'transformador_instrumento';
	}

	// Verifica se deve mostrar seção baseado em condições
	function shouldShowSection(sectionName: string): boolean {
		// Seção "Tipo de Fluidos Isolantes" só aparece se tipo for "a_oleo"
		if (sectionName === 'Tipo de Fluidos Isolantes') {
			return values['tipoTransformador'] === 'a_oleo';
		}
		return true;
	}

	function handleFieldChange(fieldId: string, value: any) {
		values = { ...values, [fieldId]: value };
		onchange?.(values);
	}

	function getFieldValue(fieldId: string, defaultValue: any = ''): any {
		return values[fieldId] ?? defaultValue;
	}

</script>

{#if equipmentType}
	<div class="dynamic-form space-y-6">
		<!-- Componente especial para Transformador de Instrumento (TC/TP) -->
		{#if equipmentType === 'transformador_instrumento'}
			<TCTPSection bind:data={values} />
		{:else if fields.length > 0}
			{#each Object.entries(fieldsBySection()) as [sectionName, sectionFields]}
				{#if !isTransformadorSpecialSection(sectionName) && shouldShowSection(sectionName)}
					<div class="form-section">
						<h4 class="text-sm font-semibold mb-3 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">
							{sectionName}
						</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{#each sectionFields as field (field.id)}
								<div class="form-group" class:md:col-span-2={field.type === 'textarea'} class:lg:col-span-3={field.type === 'textarea'}>
									{#if field.type === 'checkbox'}
										<label class="flex items-center gap-2 cursor-pointer">
											<input id={field.id} type="checkbox" checked={getFieldValue(field.id, false)} onchange={(e) => handleFieldChange(field.id, e.currentTarget.checked)} class="modern-checkbox" />
											<span class="text-sm" style="color: var(--text-secondary);">{field.label}</span>
										</label>
									{:else}
										<label for={field.id} class="modern-label text-xs" class:modern-label-required={field.required}>{field.label}</label>
										{#if field.type === 'text'}
											<input id={field.id} type="text" value={getFieldValue(field.id, '')} oninput={(e) => handleFieldChange(field.id, e.currentTarget.value)} required={field.required} placeholder={field.placeholder} class="modern-input text-sm" />
										{:else if field.type === 'number'}
											<input id={field.id} type="number" value={getFieldValue(field.id, '')} oninput={(e) => handleFieldChange(field.id, e.currentTarget.valueAsNumber || e.currentTarget.value)} required={field.required} placeholder={field.placeholder} class="modern-input text-sm" />
										{:else if field.type === 'select' && field.options}
											<select id={field.id} value={getFieldValue(field.id, '')} onchange={(e) => handleFieldChange(field.id, e.currentTarget.value)} required={field.required} class="modern-select text-sm">
												{#each field.options as option}
													<option value={option.value}>{option.label}</option>
												{/each}
											</select>
										{:else if field.type === 'textarea'}
											<textarea id={field.id} value={getFieldValue(field.id, '')} oninput={(e) => handleFieldChange(field.id, e.currentTarget.value)} required={field.required} placeholder={field.placeholder} rows={field.rows || 3} class="modern-textarea text-sm"></textarea>
										{/if}
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}

			<!-- Componente especial para seções de Transformador -->
			{#if equipmentType === 'transformador'}
				<TransformadorSection bind:values onchange={onchange} />
			{/if}
		{/if}
	</div>
{:else}
	<div class="text-center py-8 rounded-xl" style="background-color: var(--bg-secondary); border: 2px dashed var(--border-color);">
		<p class="text-sm" style="color: var(--text-muted);">Selecione um tipo de equipamento para ver os campos</p>
	</div>
{/if}
