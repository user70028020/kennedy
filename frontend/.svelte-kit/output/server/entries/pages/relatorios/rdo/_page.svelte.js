import { y as attr_style, F as bind_props, z as stringify, w as ensure_array_like } from "../../../../chunks/index2.js";
import { P as PhotoCapture } from "../../../../chunks/PhotoCapture.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
import { a as attr } from "../../../../chunks/attributes.js";
function SignatureCapture($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      label = "Assinatura",
      width = 400,
      height = 200,
      value = "",
      onchange
    } = $$props;
    $$renderer2.push(`<div class="space-y-3"><span class="modern-label">${escape_html(label)}</span> <div class="relative"><canvas${attr("width", width)}${attr("height", height)} class="w-full rounded-xl cursor-crosshair touch-none"${attr_style(`max-width: ${stringify(width)}px; aspect-ratio: ${stringify(width)}/${stringify(height)}; background-color: var(--bg-tertiary); border: 2px solid var(--border-color);`)}></canvas> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="absolute inset-0 flex items-center justify-center pointer-events-none"><span class="text-sm" style="color: var(--text-muted);">Assine aqui</span></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex gap-3"><button type="button" class="btn-modern btn-modern-secondary"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Limpar</button> <button type="button"${attr("disabled", true, true)} class="btn-modern btn-modern-success"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Confirmar</button></div> `);
    if (value) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-xs flex items-center gap-1" style="color: var(--color-success);"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Assinatura capturada</p>`);
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
    let reportDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let projeto = "";
    let clientName = "";
    let location = "";
    let descricaoServico = "";
    let representatives = [
      {
        id: generateId(),
        nome: "",
        cargo: "",
        empresa: "",
        assinatura: ""
      }
    ];
    let teamMembers = [{ id: generateId(), nome: "", funcao: "", empresa: "" }];
    let workSchedule = {
      inicio: "08:00",
      intervaloInicio: "12:00",
      intervaloFim: "13:00",
      fim: "17:00",
      horasExtras: ""
    };
    let atividades = "";
    let photos = [];
    let observations = "";
    let assinaturaResponsavel = "";
    let assinaturaCliente = "";
    let loading = false;
    let searchingOS = false;
    function generateId() {
      return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    function updateRepresentative(id, field, value) {
      representatives = representatives.map((r) => r.id === id ? { ...r, [field]: value } : r);
    }
    const horasTrabalhadas = () => {
      try {
        const [inicioH, inicioM] = workSchedule.inicio.split(":").map(Number);
        const [intInicioH, intInicioM] = workSchedule.intervaloInicio.split(":").map(Number);
        const [intFimH, intFimM] = workSchedule.intervaloFim.split(":").map(Number);
        const [fimH, fimM] = workSchedule.fim.split(":").map(Number);
        const manha = intInicioH * 60 + intInicioM - (inicioH * 60 + inicioM);
        const tarde = fimH * 60 + fimM - (intFimH * 60 + intFimM);
        const total = manha + tarde;
        const horas = Math.floor(total / 60);
        const minutos = total % 60;
        return `${horas}h${minutos > 0 ? ` ${minutos}min` : ""}`;
      } catch {
        return "0h";
      }
    };
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="max-w-5xl mx-auto animate-in"><div class="modern-card"><div class="modern-card-header"><div class="modern-card-title"><div class="modern-card-title-icon" style="background: var(--gradient-purple);"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div> RDO de Montagem</div> <div class="text-sm" style="color: var(--text-muted);">Relatório Diário de Obra</div></div> <form class="space-y-8"><section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Template</h3> <div class="radio-group"><label class="radio-label"><input type="radio"${attr("checked", template === "nx_energy", true)} value="nx_energy" class="modern-radio"/> <span style="color: var(--text-primary);">NX Energy</span></label> <label class="radio-label"><input type="radio"${attr("checked", template === "sercamp", true)} value="sercamp" class="modern-radio"/> <span style="color: var(--text-primary);">SERCAMP</span></label></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Informações Gerais</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-5"><div class="form-group"><label for="osNumber" class="modern-label modern-label-required">Número da OS</label> <div class="flex gap-2"><input id="osNumber" type="text"${attr("value", osNumber)} required class="modern-input flex-1" placeholder="Ex: OS-2024-001"/> <button type="button"${attr("disabled", searchingOS, true)} class="btn-modern btn-modern-secondary px-3" title="Buscar OS">`);
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`);
      }
      $$renderer3.push(`<!--]--></button></div></div> <div class="form-group"><label for="reportDate" class="modern-label">Data</label> <input id="reportDate" type="date"${attr("value", reportDate)} class="modern-input"/></div> <div class="form-group"><label for="projeto" class="modern-label">Projeto</label> <input id="projeto" type="text"${attr("value", projeto)} class="modern-input" placeholder="Nome do projeto"/></div> <div class="form-group"><label for="clientName" class="modern-label modern-label-required">Cliente</label> <input id="clientName" type="text"${attr("value", clientName)} required class="modern-input" placeholder="Nome do cliente"/></div> <div class="form-group md:col-span-2"><label for="location" class="modern-label">Local</label> <input id="location" type="text"${attr("value", location)} class="modern-input" placeholder="Local da obra"/></div></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Descrição do Serviço <span style="color: var(--color-danger);">*</span></h3> <textarea rows="4" required class="modern-textarea" placeholder="Descreva o serviço a ser executado...">`);
      const $$body = escape_html(descricaoServico);
      if ($$body) {
        $$renderer3.push(`${$$body}`);
      }
      $$renderer3.push(`</textarea></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Representantes</h3> <div class="space-y-4"><!--[-->`);
      const each_array = ensure_array_like(representatives);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let rep = each_array[$$index];
        $$renderer3.push(`<div class="p-4 rounded-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"><div class="flex justify-between items-start mb-4"><span class="text-sm font-semibold" style="color: var(--text-secondary);">Representante</span> `);
        if (representatives.length > 1) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<button type="button" class="p-1.5 rounded-lg transition-colors" style="color: var(--color-danger);" title="Remover representante"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div> <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"><div class="form-group"><label${attr("for", `rep-nome-${stringify(rep.id)}`)} class="modern-label">Nome</label> <input${attr("id", `rep-nome-${stringify(rep.id)}`)} type="text"${attr("value", rep.nome)} class="modern-input" placeholder="Nome do representante"/></div> <div class="form-group"><label${attr("for", `rep-cargo-${stringify(rep.id)}`)} class="modern-label">Cargo</label> <input${attr("id", `rep-cargo-${stringify(rep.id)}`)} type="text"${attr("value", rep.cargo)} class="modern-input" placeholder="Cargo"/></div> <div class="form-group"><label${attr("for", `rep-empresa-${stringify(rep.id)}`)} class="modern-label">Empresa</label> <input${attr("id", `rep-empresa-${stringify(rep.id)}`)} type="text"${attr("value", rep.empresa)} class="modern-input" placeholder="Empresa"/></div></div> `);
        SignatureCapture($$renderer3, {
          label: "Assinatura do Representante",
          value: rep.assinatura,
          onchange: (sig) => updateRepresentative(rep.id, "assinatura", sig)
        });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]--> <button type="button" class="w-full py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2" style="border: 2px dashed var(--border-color); color: var(--text-muted); background-color: transparent;"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Adicionar Representante</button></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Equipe de Trabalho</h3> <div class="overflow-x-auto rounded-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"><table class="w-full"><thead><tr style="border-bottom: 1px solid var(--border-color);"><th class="text-left text-sm font-semibold p-3" style="color: var(--text-secondary);">Nome</th><th class="text-left text-sm font-semibold p-3" style="color: var(--text-secondary);">Função</th><th class="text-left text-sm font-semibold p-3" style="color: var(--text-secondary);">Empresa</th><th class="p-3 w-10"></th></tr></thead><tbody><!--[-->`);
      const each_array_1 = ensure_array_like(teamMembers);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let member = each_array_1[$$index_1];
        $$renderer3.push(`<tr style="border-bottom: 1px solid var(--border-color);"><td class="p-3"><input type="text"${attr("value", member.nome)} class="modern-input" placeholder="Nome"/></td><td class="p-3"><input type="text"${attr("value", member.funcao)} class="modern-input" placeholder="Função"/></td><td class="p-3"><input type="text"${attr("value", member.empresa)} class="modern-input" placeholder="Empresa"/></td><td class="p-3">`);
        if (teamMembers.length > 1) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<button type="button" class="p-2 rounded-lg transition-colors" style="color: var(--color-danger);" title="Remover membro"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></td></tr>`);
      }
      $$renderer3.push(`<!--]--></tbody></table></div> <button type="button" class="mt-4 w-full py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2" style="border: 2px dashed var(--border-color); color: var(--text-muted); background-color: transparent;"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Adicionar Membro da Equipe</button></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Resumo da Jornada de Trabalho</h3> <div class="grid grid-cols-2 md:grid-cols-5 gap-4"><div class="form-group"><label for="inicio" class="modern-label">Início</label> <input id="inicio" type="time"${attr("value", workSchedule.inicio)} class="modern-input"/></div> <div class="form-group"><label for="intervaloInicio" class="modern-label">Intervalo Início</label> <input id="intervaloInicio" type="time"${attr("value", workSchedule.intervaloInicio)} class="modern-input"/></div> <div class="form-group"><label for="intervaloFim" class="modern-label">Intervalo Fim</label> <input id="intervaloFim" type="time"${attr("value", workSchedule.intervaloFim)} class="modern-input"/></div> <div class="form-group"><label for="fim" class="modern-label">Fim</label> <input id="fim" type="time"${attr("value", workSchedule.fim)} class="modern-input"/></div> <div class="form-group"><label for="horasExtras" class="modern-label">Horas Extras</label> <input id="horasExtras" type="text"${attr("value", workSchedule.horasExtras)} class="modern-input" placeholder="Ex: 2h"/></div></div> <div class="mt-4 p-4 rounded-xl flex items-center justify-between" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"><span class="text-sm" style="color: var(--text-muted);">Total de horas trabalhadas:</span> <span class="text-xl font-bold" style="color: var(--color-primary);">${escape_html(horasTrabalhadas())}</span></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Atividades Realizadas</h3> <textarea rows="6" class="modern-textarea" placeholder="Descreva as atividades realizadas durante o dia...">`);
      const $$body_1 = escape_html(atividades);
      if ($$body_1) {
        $$renderer3.push(`${$$body_1}`);
      }
      $$renderer3.push(`</textarea></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Fotos</h3> `);
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
      $$renderer3.push(`<!----></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Observações</h3> <textarea rows="4" class="modern-textarea" placeholder="Observações gerais...">`);
      const $$body_2 = escape_html(observations);
      if ($$body_2) {
        $$renderer3.push(`${$$body_2}`);
      }
      $$renderer3.push(`</textarea></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Assinaturas Finais</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="p-4 rounded-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">`);
      SignatureCapture($$renderer3, {
        label: "Assinatura do Responsável SERCAMP",
        get value() {
          return assinaturaResponsavel;
        },
        set value($$value) {
          assinaturaResponsavel = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div class="p-4 rounded-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">`);
      SignatureCapture($$renderer3, {
        label: "Assinatura do Cliente",
        get value() {
          return assinaturaCliente;
        },
        set value($$value) {
          assinaturaCliente = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div></section> `);
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
        $$renderer3.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> <span>Gerar RDO de Montagem</span>`);
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
