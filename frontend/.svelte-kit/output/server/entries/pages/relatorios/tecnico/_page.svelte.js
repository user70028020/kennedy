import { a as attr } from "../../../../chunks/attributes.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
import { P as PhotoCapture } from "../../../../chunks/PhotoCapture.js";
import { w as ensure_array_like, F as bind_props, x as attr_class, y as attr_style, z as stringify } from "../../../../chunks/index2.js";
/* empty css                                                                 */
function EquipmentSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const EQUIPMENT_CATEGORIES = [
      {
        name: "Transformadores",
        equipment: [
          { id: "transformador", name: "Transformador" },
          {
            id: "transformador_instrumento",
            name: "Transformador para Instrumentos"
          }
        ]
      },
      {
        name: "Proteção e Controle",
        equipment: [
          { id: "disjuntor", name: "Disjuntor" },
          { id: "rele_protecao", name: "Relé de Proteção" },
          { id: "para_raio", name: "Para-raios" }
        ]
      },
      {
        name: "Chaves e Religadores",
        equipment: [
          { id: "chave_seccionadora", name: "Chave Seccionadora" },
          { id: "chave_religadora", name: "Chave Religadora" },
          { id: "painel_religador", name: "Painel Religador" }
        ]
      },
      {
        name: "Sistemas Auxiliares",
        equipment: [
          { id: "retificador_bateria", name: "Retificador de Bateria" },
          { id: "banco_capacitores", name: "Banco de Capacitores" }
        ]
      },
      {
        name: "Outros",
        equipment: [{ id: "cabos", name: "Cabos" }, { id: "spda", name: "SPDA" }]
      }
    ];
    let { value = null, required = false, disabled = false, onchange } = $$props;
    $$renderer2.push(`<div class="equipment-selector"><select${attr("required", required, true)}${attr("disabled", disabled, true)} class="modern-select svelte-sykt1d">`);
    $$renderer2.option(
      { value: "", class: "" },
      ($$renderer3) => {
        $$renderer3.push(`Selecione o tipo de equipamento`);
      },
      "svelte-sykt1d"
    );
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(EQUIPMENT_CATEGORIES);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let category = each_array[$$index_1];
      $$renderer2.push(`<optgroup${attr("label", category.name)} class="svelte-sykt1d"><!--[-->`);
      const each_array_1 = ensure_array_like(category.equipment);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let equipment = each_array_1[$$index];
        $$renderer2.option(
          {
            value: equipment.id,
            selected: value === equipment.id,
            class: ""
          },
          ($$renderer3) => {
            $$renderer3.push(`${escape_html(equipment.name)}`);
          },
          "svelte-sykt1d"
        );
      }
      $$renderer2.push(`<!--]--></optgroup>`);
    }
    $$renderer2.push(`<!--]--></select></div>`);
    bind_props($$props, { value });
  });
}
function DynamicForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const COMMON_FIELDS = [
      {
        id: "fabricante",
        label: "Fabricante",
        type: "text",
        placeholder: "Nome do fabricante"
      },
      {
        id: "modelo",
        label: "Modelo",
        type: "text",
        placeholder: "Modelo do equipamento"
      },
      {
        id: "numeroSerie",
        label: "Número de Série",
        type: "text",
        placeholder: "Nº de série"
      },
      {
        id: "tag",
        label: "TAG",
        type: "text",
        placeholder: "TAG do equipamento"
      },
      {
        id: "cubiculo",
        label: "Cubículo",
        type: "text",
        placeholder: "Localização/Cubículo"
      },
      {
        id: "anoFabricacao",
        label: "Ano de Fabricação",
        type: "number",
        min: 1900,
        max: 2100
      }
    ];
    const EQUIPMENT_FIELDS = {
      transformador: [
        ...COMMON_FIELDS,
        {
          id: "tipoTransformador",
          label: "Tipo",
          type: "select",
          required: true,
          options: [
            { value: "a_oleo", label: "A óleo" },
            { value: "a_seco", label: "A seco" }
          ]
        },
        {
          id: "potencia",
          label: "Potência (kVA)",
          type: "number",
          placeholder: "Ex: 1000"
        },
        {
          id: "tensaoPrimaria",
          label: "Tensão Primária (kV)",
          type: "number",
          step: 0.1
        },
        {
          id: "tensaoSecundaria",
          label: "Tensão Secundária (kV)",
          type: "number",
          step: 0.1
        },
        {
          id: "frequencia",
          label: "Frequência (Hz)",
          type: "number",
          defaultValue: 60
        },
        {
          id: "grupoLigacao",
          label: "Grupo de Ligação",
          type: "text",
          placeholder: "Ex: Dyn1"
        },
        {
          id: "impedancia",
          label: "Impedância (%)",
          type: "number",
          step: 0.01
        },
        {
          id: "classeIsolamento",
          label: "Classe de Isolamento",
          type: "text"
        },
        {
          id: "tipoResfriamento",
          label: "Tipo de Resfriamento",
          type: "text",
          placeholder: "Ex: ONAN"
        }
      ],
      transformador_instrumento: [
        ...COMMON_FIELDS,
        {
          id: "tipoInstrumento",
          label: "Tipo",
          type: "select",
          options: [
            { value: "tc", label: "TC - Transformador de Corrente" },
            { value: "tp", label: "TP - Transformador de Potencial" }
          ]
        },
        {
          id: "relacao",
          label: "Relação",
          type: "text",
          placeholder: "Ex: 600/5A ou 13800/115V"
        },
        {
          id: "classe",
          label: "Classe de Exatidão",
          type: "text",
          placeholder: "Ex: 0.3"
        },
        { id: "burden", label: "Burden (VA)", type: "number" },
        {
          id: "tensaoNominal",
          label: "Tensão Nominal (kV)",
          type: "number",
          step: 0.1
        }
      ],
      disjuntor: [
        ...COMMON_FIELDS,
        {
          id: "tipoDisjuntor",
          label: "Tipo",
          type: "select",
          options: [
            { value: "sf6", label: "SF6" },
            { value: "vacuo", label: "Vácuo" },
            { value: "oleo", label: "Óleo" },
            { value: "ar", label: "Ar Comprimido" }
          ]
        },
        {
          id: "tensaoNominal",
          label: "Tensão Nominal (kV)",
          type: "number",
          step: 0.1
        },
        {
          id: "correnteNominal",
          label: "Corrente Nominal (A)",
          type: "number"
        },
        {
          id: "capacidadeInterrupcao",
          label: "Capacidade de Interrupção (kA)",
          type: "number",
          step: 0.1
        },
        {
          id: "tempoAbertura",
          label: "Tempo de Abertura (ms)",
          type: "number"
        },
        {
          id: "tempoFechamento",
          label: "Tempo de Fechamento (ms)",
          type: "number"
        },
        {
          id: "numeroOperacoes",
          label: "Número de Operações",
          type: "number"
        }
      ],
      para_raio: [
        ...COMMON_FIELDS,
        {
          id: "tipoParaRaio",
          label: "Tipo",
          type: "select",
          options: [
            { value: "oxido_zinco", label: "Óxido de Zinco (ZnO)" },
            {
              value: "carboneto_silicio",
              label: "Carboneto de Silício (SiC)"
            }
          ]
        },
        {
          id: "tensaoNominal",
          label: "Tensão Nominal (kV)",
          type: "number",
          step: 0.1
        },
        {
          id: "classeDescarga",
          label: "Classe de Descarga",
          type: "text"
        },
        {
          id: "correnteDescarga",
          label: "Corrente de Descarga (kA)",
          type: "number"
        }
      ],
      rele_protecao: [
        ...COMMON_FIELDS,
        {
          id: "funcaoProtecao",
          label: "Função de Proteção",
          type: "text",
          placeholder: "Ex: 50/51, 87T"
        },
        {
          id: "tipoRele",
          label: "Tipo",
          type: "select",
          options: [
            { value: "digital", label: "Digital" },
            { value: "eletromecanico", label: "Eletromecânico" },
            { value: "estatico", label: "Estático" }
          ]
        },
        {
          id: "versaoFirmware",
          label: "Versão do Firmware",
          type: "text"
        },
        {
          id: "ajustes",
          label: "Ajustes Principais",
          type: "textarea",
          rows: 3
        }
      ],
      chave_seccionadora: [
        ...COMMON_FIELDS,
        {
          id: "tipoChave",
          label: "Tipo",
          type: "select",
          options: [
            { value: "abertura_carga", label: "Abertura em Carga" },
            { value: "abertura_vazio", label: "Abertura em Vazio" },
            { value: "aterramento", label: "Aterramento" }
          ]
        },
        {
          id: "tensaoNominal",
          label: "Tensão Nominal (kV)",
          type: "number",
          step: 0.1
        },
        {
          id: "correnteNominal",
          label: "Corrente Nominal (A)",
          type: "number"
        },
        {
          id: "acionamento",
          label: "Tipo de Acionamento",
          type: "select",
          options: [
            { value: "manual", label: "Manual" },
            { value: "motorizado", label: "Motorizado" }
          ]
        }
      ],
      chave_religadora: [
        ...COMMON_FIELDS,
        {
          id: "tensaoNominal",
          label: "Tensão Nominal (kV)",
          type: "number",
          step: 0.1
        },
        {
          id: "correnteNominal",
          label: "Corrente Nominal (A)",
          type: "number"
        },
        {
          id: "capacidadeInterrupcao",
          label: "Capacidade de Interrupção (kA)",
          type: "number",
          step: 0.1
        },
        {
          id: "sequenciaReligamento",
          label: "Sequência de Religamento",
          type: "text",
          placeholder: "Ex: 1R-2R-3R"
        },
        {
          id: "meioExtincao",
          label: "Meio de Extinção",
          type: "select",
          options: [
            { value: "vacuo", label: "Vácuo" },
            { value: "sf6", label: "SF6" },
            { value: "oleo", label: "Óleo" }
          ]
        }
      ],
      painel_religador: [
        ...COMMON_FIELDS,
        {
          id: "tensaoAlimentacao",
          label: "Tensão de Alimentação (V)",
          type: "number"
        },
        {
          id: "tipoControle",
          label: "Tipo de Controle",
          type: "select",
          options: [
            { value: "eletronico", label: "Eletrônico" },
            { value: "hidraulico", label: "Hidráulico" }
          ]
        },
        {
          id: "funcoesProtecao",
          label: "Funções de Proteção",
          type: "text",
          placeholder: "Ex: 50/51, 79"
        },
        {
          id: "comunicacao",
          label: "Protocolo de Comunicação",
          type: "text",
          placeholder: "Ex: DNP3, IEC 61850"
        }
      ],
      retificador_bateria: [
        ...COMMON_FIELDS,
        {
          id: "tensaoEntrada",
          label: "Tensão de Entrada (V)",
          type: "number"
        },
        {
          id: "tensaoSaida",
          label: "Tensão de Saída (Vcc)",
          type: "number"
        },
        {
          id: "correnteSaida",
          label: "Corrente de Saída (A)",
          type: "number"
        },
        {
          id: "tipoBateria",
          label: "Tipo de Bateria",
          type: "select",
          options: [
            { value: "chumbo_acido", label: "Chumbo-Ácido" },
            { value: "niquel_cadmio", label: "Níquel-Cádmio" },
            { value: "ion_litio", label: "Íon-Lítio" }
          ]
        },
        {
          id: "capacidadeBateria",
          label: "Capacidade da Bateria (Ah)",
          type: "number"
        },
        {
          id: "autonomia",
          label: "Autonomia (horas)",
          type: "number",
          step: 0.5
        }
      ],
      banco_capacitores: [
        ...COMMON_FIELDS,
        {
          id: "potenciaReativa",
          label: "Potência Reativa (kVAr)",
          type: "number"
        },
        {
          id: "tensaoNominal",
          label: "Tensão Nominal (kV)",
          type: "number",
          step: 0.1
        },
        {
          id: "frequencia",
          label: "Frequência (Hz)",
          type: "number",
          defaultValue: 60
        },
        {
          id: "tipoLigacao",
          label: "Tipo de Ligação",
          type: "select",
          options: [
            { value: "estrela", label: "Estrela" },
            { value: "triangulo", label: "Triângulo" },
            { value: "dupla_estrela", label: "Dupla Estrela" }
          ]
        },
        {
          id: "numeroEstagios",
          label: "Número de Estágios",
          type: "number"
        }
      ],
      cabos: [
        ...COMMON_FIELDS,
        {
          id: "tipoCabo",
          label: "Tipo de Cabo",
          type: "select",
          options: [
            { value: "xlpe", label: "XLPE" },
            { value: "epr", label: "EPR" },
            { value: "pvc", label: "PVC" },
            { value: "papel_oleo", label: "Papel Impregnado a Óleo" }
          ]
        },
        { id: "secao", label: "Seção (mm²)", type: "number" },
        {
          id: "tensaoNominal",
          label: "Tensão Nominal (kV)",
          type: "number",
          step: 0.1
        },
        { id: "comprimento", label: "Comprimento (m)", type: "number" },
        {
          id: "numeroCondutores",
          label: "Número de Condutores",
          type: "number"
        },
        {
          id: "material",
          label: "Material do Condutor",
          type: "select",
          options: [
            { value: "cobre", label: "Cobre" },
            { value: "aluminio", label: "Alumínio" }
          ]
        }
      ],
      spda: [
        ...COMMON_FIELDS,
        {
          id: "classeSPDA",
          label: "Classe do SPDA",
          type: "select",
          options: [
            { value: "i", label: "Classe I" },
            { value: "ii", label: "Classe II" },
            { value: "iii", label: "Classe III" },
            { value: "iv", label: "Classe IV" }
          ]
        },
        {
          id: "metodoProtecao",
          label: "Método de Proteção",
          type: "select",
          options: [
            { value: "gaiola_faraday", label: "Gaiola de Faraday" },
            { value: "franklin", label: "Franklin" },
            { value: "esfera_rolante", label: "Esfera Rolante" }
          ]
        },
        {
          id: "materialCaptores",
          label: "Material dos Captores",
          type: "text",
          placeholder: "Ex: Cobre, Alumínio"
        },
        {
          id: "resistenciaTerra",
          label: "Resistência de Terra (Ω)",
          type: "number",
          step: 0.1
        }
      ]
    };
    let { equipmentType, values = {}, onchange } = $$props;
    const fields = equipmentType ? EQUIPMENT_FIELDS[equipmentType] || [] : [];
    function handleFieldChange(fieldId, value) {
      values = { ...values, [fieldId]: value };
      onchange?.(values);
    }
    function getFieldValue(fieldId, defaultValue = "") {
      return values[fieldId] ?? defaultValue;
    }
    if (equipmentType && fields.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="dynamic-form space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-5"><!--[-->`);
      const each_array = ensure_array_like(fields);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let field = each_array[$$index_1];
        $$renderer2.push(`<div${attr_class("form-group", void 0, { "md:col-span-2": field.type === "textarea" })}><label${attr("for", field.id)}${attr_class("modern-label", void 0, { "modern-label-required": field.required })}>${escape_html(field.label)}</label> `);
        if (field.type === "text") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<input${attr("id", field.id)} type="text"${attr("value", getFieldValue(field.id, field.defaultValue || ""))}${attr("required", field.required, true)}${attr("placeholder", field.placeholder)} class="modern-input"/>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (field.type === "number") {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<input${attr("id", field.id)} type="number"${attr("value", getFieldValue(field.id, field.defaultValue || ""))}${attr("required", field.required, true)}${attr("placeholder", field.placeholder)}${attr("min", field.min)}${attr("max", field.max)}${attr("step", field.step || 1)} class="modern-input"/>`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (field.type === "date") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<input${attr("id", field.id)} type="date"${attr("value", getFieldValue(field.id, field.defaultValue || ""))}${attr("required", field.required, true)} class="modern-input"/>`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (field.type === "select" && field.options) {
                $$renderer2.push("<!--[-->");
                $$renderer2.select(
                  {
                    id: field.id,
                    value: getFieldValue(field.id, field.defaultValue || ""),
                    onchange: (e) => handleFieldChange(field.id, e.currentTarget.value),
                    required: field.required,
                    class: "modern-select"
                  },
                  ($$renderer3) => {
                    $$renderer3.option({ value: "" }, ($$renderer4) => {
                      $$renderer4.push(`Selecione...`);
                    });
                    $$renderer3.push(`<!--[-->`);
                    const each_array_1 = ensure_array_like(field.options);
                    for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                      let option = each_array_1[$$index];
                      $$renderer3.option({ value: option.value }, ($$renderer4) => {
                        $$renderer4.push(`${escape_html(option.label)}`);
                      });
                    }
                    $$renderer3.push(`<!--]-->`);
                  }
                );
              } else {
                $$renderer2.push("<!--[!-->");
                if (field.type === "checkbox") {
                  $$renderer2.push("<!--[-->");
                  $$renderer2.push(`<label class="checkbox-label"><input${attr("id", field.id)} type="checkbox"${attr("checked", getFieldValue(field.id, field.defaultValue || false), true)} class="modern-checkbox"/> <span style="color: var(--text-secondary);">${escape_html(field.placeholder || "Sim")}</span></label>`);
                } else {
                  $$renderer2.push("<!--[!-->");
                  if (field.type === "textarea") {
                    $$renderer2.push("<!--[-->");
                    $$renderer2.push(`<textarea${attr("id", field.id)}${attr("required", field.required, true)}${attr("placeholder", field.placeholder)}${attr("rows", field.rows || 3)} class="modern-textarea">`);
                    const $$body = escape_html(getFieldValue(field.id, field.defaultValue || ""));
                    if ($$body) {
                      $$renderer2.push(`${$$body}`);
                    }
                    $$renderer2.push(`</textarea>`);
                  } else {
                    $$renderer2.push("<!--[!-->");
                  }
                  $$renderer2.push(`<!--]-->`);
                }
                $$renderer2.push(`<!--]-->`);
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (!equipmentType) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="text-center py-8 rounded-xl" style="background-color: var(--bg-secondary); border: 2px dashed var(--border-color);"><svg class="mx-auto h-12 w-12" style="color: var(--text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg> <p class="mt-2 text-sm" style="color: var(--text-muted);">Selecione um tipo de equipamento para ver os campos</p></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { values });
  });
}
function StatusSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const STATUS_OPTIONS = [
      {
        value: "conforme",
        label: "Conforme",
        color: "text-green-400",
        bgColor: "bg-green-900/30",
        borderColor: "border-green-500",
        description: "Equipamento em condições normais de operação"
      },
      {
        value: "alerta",
        label: "Alerta",
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/30",
        borderColor: "border-yellow-500",
        description: "Equipamento requer atenção ou manutenção preventiva"
      },
      {
        value: "corretiva",
        label: "Corretiva",
        color: "text-red-400",
        bgColor: "bg-red-900/30",
        borderColor: "border-red-500",
        description: "Equipamento requer manutenção corretiva imediata"
      }
    ];
    let { value = "", required = false, disabled = false, onchange } = $$props;
    function getSelectedOption() {
      return STATUS_OPTIONS.find((opt) => opt.value === value);
    }
    $$renderer2.push(`<div class="status-selector"><div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><!--[-->`);
    const each_array = ensure_array_like(STATUS_OPTIONS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let option = each_array[$$index];
      $$renderer2.push(`<button type="button"${attr("disabled", disabled, true)}${attr_class(`relative p-4 rounded-xl transition-all duration-200 ${stringify(disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}`)}${attr_style(`background-color: ${stringify(value === option.value ? option.value === "conforme" ? "rgba(16, 185, 129, 0.15)" : option.value === "alerta" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)" : "var(--bg-secondary)")}; border: 2px solid ${stringify(value === option.value ? option.value === "conforme" ? "var(--color-success)" : option.value === "alerta" ? "var(--color-warning)" : "var(--color-danger)" : "var(--border-color)")};`)}><div class="flex items-center gap-3"><div class="w-4 h-4 rounded-full"${attr_style(`background-color: ${stringify(option.value === "conforme" ? "var(--color-success)" : option.value === "alerta" ? "var(--color-warning)" : "var(--color-danger)")};`)}></div> <span class="font-medium"${attr_style(`color: ${stringify(option.value === "conforme" ? "var(--color-success)" : option.value === "alerta" ? "var(--color-warning)" : "var(--color-danger)")};`)}>${escape_html(option.label)}</span></div> <p class="mt-2 text-xs text-left" style="color: var(--text-muted);">${escape_html(option.description)}</p> `);
      if (value === option.value) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute top-2 right-2"${attr_style(`color: ${stringify(option.value === "conforme" ? "var(--color-success)" : option.value === "alerta" ? "var(--color-warning)" : "var(--color-danger)")};`)}><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (required) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<input type="hidden"${attr("required", required, true)}${attr("value", value)} class="sr-only"/>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (value) {
      $$renderer2.push("<!--[-->");
      const selected = getSelectedOption();
      if (selected) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-3 p-3 rounded-xl"${attr_style(`background-color: ${stringify(selected.value === "conforme" ? "rgba(16, 185, 129, 0.1)" : selected.value === "alerta" ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)")}; border: 1px solid ${stringify(selected.value === "conforme" ? "rgba(16, 185, 129, 0.3)" : selected.value === "alerta" ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)")};`)}><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full"${attr_style(`background-color: ${stringify(selected.value === "conforme" ? "var(--color-success)" : selected.value === "alerta" ? "var(--color-warning)" : "var(--color-danger)")};`)}></div> <span class="text-sm font-medium"${attr_style(`color: ${stringify(selected.value === "conforme" ? "var(--color-success)" : selected.value === "alerta" ? "var(--color-warning)" : "var(--color-danger)")};`)}>Status selecionado: ${escape_html(selected.label)}</span></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let template = "nx_energy";
    let osNumber = "";
    let clientName = "";
    let location = "";
    let reportDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let responsible = "";
    let observations = "";
    let equipmentType = null;
    let formValues = {};
    let status = "";
    let photos = [];
    let loading = false;
    let searchingOS = false;
    function handleEquipmentChange(type) {
      equipmentType = type;
      formValues = {};
    }
    function getEquipmentName(type) {
      if (!type) return "";
      const names = {
        transformador: "Transformador",
        transformador_instrumento: "Transformador para Instrumentos",
        disjuntor: "Disjuntor",
        para_raio: "Para-raios",
        rele_protecao: "Relé de Proteção",
        chave_seccionadora: "Chave Seccionadora",
        chave_religadora: "Chave Religadora",
        painel_religador: "Painel Religador",
        retificador_bateria: "Retificador de Bateria",
        banco_capacitores: "Banco de Capacitores",
        cabos: "Cabos",
        spda: "SPDA"
      };
      return names[type] || type;
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="max-w-5xl mx-auto animate-in"><div class="modern-card"><div class="modern-card-header"><div class="modern-card-title"><div class="modern-card-title-icon" style="background: var(--gradient-success);"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg></div> Relatório Técnico</div> <div class="text-sm" style="color: var(--text-muted);">Inspeção de Equipamentos</div></div> <form class="space-y-8"><section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Template</h3> <div class="radio-group"><label class="radio-label"><input type="radio"${attr("checked", template === "nx_energy", true)} value="nx_energy" class="modern-radio"/> <span style="color: var(--text-primary);">NX Energy</span></label> <label class="radio-label"><input type="radio"${attr("checked", template === "sercamp", true)} value="sercamp" class="modern-radio"/> <span style="color: var(--text-primary);">SERCAMP</span></label></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Informações Básicas</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-5"><div class="form-group"><label for="osNumber" class="modern-label modern-label-required">Número da OS</label> <div class="flex gap-2"><input id="osNumber" type="text"${attr("value", osNumber)} required class="modern-input flex-1" placeholder="Ex: OS-2024-001"/> <button type="button"${attr("disabled", searchingOS, true)} class="btn-modern btn-modern-secondary px-3" title="Buscar OS">`);
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`);
      }
      $$renderer3.push(`<!--]--></button></div></div> <div class="form-group"><label for="clientName" class="modern-label modern-label-required">Cliente</label> <input id="clientName" type="text"${attr("value", clientName)} required class="modern-input" placeholder="Nome do cliente"/></div> <div class="form-group"><label for="location" class="modern-label">Local</label> <input id="location" type="text"${attr("value", location)} class="modern-input" placeholder="Local da inspeção"/></div> <div class="form-group"><label for="reportDate" class="modern-label">Data do Relatório</label> <input id="reportDate" type="date"${attr("value", reportDate)} class="modern-input"/></div> <div class="form-group"><label for="responsible" class="modern-label">Responsável</label> <input id="responsible" type="text"${attr("value", responsible)} class="modern-input" placeholder="Nome do responsável"/></div></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Tipo de Equipamento <span style="color: var(--color-danger);">*</span></h3> `);
      EquipmentSelector($$renderer3, {
        required: true,
        onchange: handleEquipmentChange,
        get value() {
          return equipmentType;
        },
        set value($$value) {
          equipmentType = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (equipmentType) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<p class="mt-3 text-sm" style="color: var(--color-primary);"><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style="background-color: rgba(59, 130, 246, 0.1);"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Equipamento selecionado: ${escape_html(getEquipmentName(equipmentType))}</span></p>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></section> `);
      if (equipmentType) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Dados do Equipamento - ${escape_html(getEquipmentName(equipmentType))}</h3> `);
        DynamicForm($$renderer3, {
          equipmentType,
          get values() {
            return formValues;
          },
          set values($$value) {
            formValues = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></section>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Status do Equipamento <span style="color: var(--color-danger);">*</span></h3> `);
      StatusSelector($$renderer3, {
        required: true,
        get value() {
          return status;
        },
        set value($$value) {
          status = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Fotos</h3> `);
      PhotoCapture($$renderer3, {
        maxPhotos: 30,
        get photos() {
          return photos;
        },
        set photos($$value) {
          photos = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Observações</h3> <textarea rows="4" class="modern-textarea" placeholder="Observações gerais sobre a inspeção...">`);
      const $$body = escape_html(observations);
      if ($$body) {
        $$renderer3.push(`${$$body}`);
      }
      $$renderer3.push(`</textarea></section> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="flex flex-col sm:flex-row gap-3 pt-4"><button type="submit"${attr("disabled", loading, true)} class="btn-modern btn-modern-primary flex-1 py-3.5">`);
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> <span>Gerar Relatório Técnico</span>`);
      }
      $$renderer3.push(`<!--]--></button> <button type="button"${attr("disabled", loading, true)} class="btn-modern btn-modern-secondary py-3.5 sm:w-auto"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> <span>Limpar</span></button></div></form></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
