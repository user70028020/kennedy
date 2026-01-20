import { w as ensure_array_like, y as attr_style, z as stringify } from "../../../../chunks/index2.js";
import { P as PhotoCapture } from "../../../../chunks/PhotoCapture.js";
import { a as attr } from "../../../../chunks/attributes.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const SPDA_CLASSES = [
      { id: "I", name: "Classe I" },
      { id: "II", name: "Classe II" },
      { id: "III", name: "Classe III" },
      { id: "IV", name: "Classe IV" }
    ];
    const PROTECTION_METHODS = [
      { id: "franklin", name: "Franklin (Haste)" },
      { id: "gaiola_faraday", name: "Gaiola de Faraday" },
      { id: "esfera_rolante", name: "Esfera Rolante" },
      { id: "misto", name: "Misto" }
    ];
    const STATUS_OPTIONS = [
      {
        value: "APROVADO",
        label: "Aprovado",
        color: "text-green-400",
        bgColor: "bg-green-900/30"
      },
      {
        value: "REPROVADO",
        label: "Reprovado",
        color: "text-red-400",
        bgColor: "bg-red-900/30"
      },
      {
        value: "PENDENTE",
        label: "Pendente",
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/30"
      }
    ];
    let template = "nx_energy";
    let osNumber = "";
    let clientName = "";
    let location = "";
    let reportDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let responsible = "";
    let spdaClass = "";
    let selectedMethods = [];
    let measurementEquipment = "";
    let measurementPoints = [];
    let status = "";
    let conclusion = "";
    let observations = "";
    let photos = [];
    let loading = false;
    let searchingOS = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="max-w-5xl mx-auto animate-in"><div class="modern-card"><div class="modern-card-header"><div class="modern-card-title"><div class="modern-card-title-icon" style="background: var(--gradient-warning);"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div> Relatório SPDA</div> <div class="text-sm" style="color: var(--text-muted);">Sistema de Proteção contra Descargas Atmosféricas</div></div> <form class="space-y-8"><section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Template</h3> <div class="radio-group"><label class="radio-label"><input type="radio"${attr("checked", template === "nx_energy", true)} value="nx_energy" class="modern-radio"/> <span style="color: var(--text-primary);">NX Energy</span></label> <label class="radio-label"><input type="radio"${attr("checked", template === "sercamp", true)} value="sercamp" class="modern-radio"/> <span style="color: var(--text-primary);">SERCAMP</span></label></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Informações Básicas</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-5"><div class="form-group"><label for="osNumber" class="modern-label modern-label-required">Número da OS</label> <div class="flex gap-2"><input id="osNumber" type="text"${attr("value", osNumber)} required class="modern-input flex-1" placeholder="Ex: OS-2024-001"/> <button type="button"${attr("disabled", searchingOS, true)} class="btn-modern btn-modern-secondary px-3" title="Buscar OS">`);
      {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>`);
      }
      $$renderer3.push(`<!--]--></button></div></div> <div class="form-group"><label for="clientName" class="modern-label modern-label-required">Cliente</label> <input id="clientName" type="text"${attr("value", clientName)} required class="modern-input" placeholder="Nome do cliente"/></div> <div class="form-group"><label for="location" class="modern-label">Local</label> <input id="location" type="text"${attr("value", location)} class="modern-input" placeholder="Local da inspeção"/></div> <div class="form-group"><label for="reportDate" class="modern-label">Data do Relatório</label> <input id="reportDate" type="date"${attr("value", reportDate)} class="modern-input"/></div> <div class="form-group"><label for="responsible" class="modern-label">Responsável</label> <input id="responsible" type="text"${attr("value", responsible)} class="modern-input" placeholder="Nome do responsável"/></div> <div class="form-group"><label for="spdaClass" class="modern-label modern-label-required">Classe do SPDA</label> `);
      $$renderer3.select(
        {
          id: "spdaClass",
          value: spdaClass,
          required: true,
          class: "modern-select"
        },
        ($$renderer4) => {
          $$renderer4.option({ value: "" }, ($$renderer5) => {
            $$renderer5.push(`Selecione a classe`);
          });
          $$renderer4.push(`<!--[-->`);
          const each_array = ensure_array_like(SPDA_CLASSES);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let cls = each_array[$$index];
            $$renderer4.option({ value: cls.id }, ($$renderer5) => {
              $$renderer5.push(`${escape_html(cls.name)}`);
            });
          }
          $$renderer4.push(`<!--]-->`);
        }
      );
      $$renderer3.push(`</div></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Métodos de Proteção</h3> <div class="grid grid-cols-2 md:grid-cols-4 gap-3"><!--[-->`);
      const each_array_1 = ensure_array_like(PROTECTION_METHODS);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let method = each_array_1[$$index_1];
        $$renderer3.push(`<label class="checkbox-label cursor-pointer"${attr_style(`background-color: ${stringify(selectedMethods.includes(method.id) ? "rgba(59, 130, 246, 0.1)" : "var(--bg-secondary)")}; border-color: ${stringify(selectedMethods.includes(method.id) ? "var(--color-primary)" : "transparent")};`)}><input type="checkbox"${attr("checked", selectedMethods.includes(method.id), true)} class="modern-checkbox"/> <span class="text-sm" style="color: var(--text-primary);">${escape_html(method.name)}</span></label>`);
      }
      $$renderer3.push(`<!--]--></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Equipamento de Medição</h3> <input type="text"${attr("value", measurementEquipment)} class="modern-input" placeholder="Ex: Terrômetro digital modelo XYZ"/></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Pontos de Medição</h3> <div class="space-y-4"><!--[-->`);
      const each_array_2 = ensure_array_like(measurementPoints);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let point = each_array_2[$$index_2];
        $$renderer3.push(`<div class="p-4 rounded-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"><div class="flex items-start gap-4"><div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: var(--gradient-primary);">${escape_html(point.number)}</div> <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4"><div class="form-group"><label${attr("for", `point-value-${stringify(point.id)}`)} class="modern-label">Valor da Medição (Ω)</label> <input${attr("id", `point-value-${stringify(point.id)}`)} type="text"${attr("value", point.value)} class="modern-input" placeholder="Ex: 5.2"/></div> <div class="form-group"><span class="modern-label">Foto do Ponto</span> `);
        if (point.photo) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="flex items-center gap-2 p-2 rounded-lg" style="background-color: var(--bg-tertiary);"><img${attr("src", point.photo.data)}${attr("alt", `Ponto ${stringify(point.number)}`)} class="w-16 h-16 object-cover rounded-lg"/> <button type="button" class="p-1.5 rounded-lg transition-colors" style="color: var(--color-danger);" title="Remover foto"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<label class="flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200" style="background-color: var(--bg-tertiary); border: 2px dashed var(--border-color); color: var(--text-muted);"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <span class="text-sm">Adicionar foto</span> <input type="file" accept="image/*" class="hidden"/></label>`);
        }
        $$renderer3.push(`<!--]--></div></div> <button type="button" class="p-2 rounded-lg transition-all duration-200" style="color: var(--color-danger);" title="Remover ponto"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div>`);
      }
      $$renderer3.push(`<!--]--> <button type="button" class="w-full py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2" style="border: 2px dashed var(--border-color); color: var(--text-muted); background-color: transparent;"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Adicionar Ponto de Medição</button></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Croqui / Desenho</h3> <div class="p-4 rounded-xl" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"><p class="text-sm mb-3" style="color: var(--text-muted);">Desenhe o croqui do sistema SPDA (opcional)</p> <div class="relative"><canvas width="600" height="400" class="w-full rounded-xl cursor-crosshair touch-none" style="border: 1px solid var(--border-color);"></canvas></div> <div class="flex gap-3 mt-4"><button type="button" class="btn-modern btn-modern-secondary"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Limpar Desenho</button> `);
      {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Status do SPDA <span style="color: var(--color-danger);">*</span></h3> <div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><!--[-->`);
      const each_array_3 = ensure_array_like(STATUS_OPTIONS);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let option = each_array_3[$$index_3];
        $$renderer3.push(`<button type="button" class="relative p-4 rounded-xl transition-all duration-200"${attr_style(`background-color: ${stringify(status === option.value ? option.value === "APROVADO" ? "rgba(16, 185, 129, 0.15)" : option.value === "REPROVADO" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)" : "var(--bg-secondary)")}; border: 2px solid ${stringify(status === option.value ? option.value === "APROVADO" ? "var(--color-success)" : option.value === "REPROVADO" ? "var(--color-danger)" : "var(--color-warning)" : "var(--border-color)")}; color: ${stringify(status === option.value ? option.value === "APROVADO" ? "var(--color-success)" : option.value === "REPROVADO" ? "var(--color-danger)" : "var(--color-warning)" : "var(--text-secondary)")};`)}><div class="flex items-center gap-3"><div class="w-4 h-4 rounded-full"${attr_style(`background-color: ${stringify(option.value === "APROVADO" ? "var(--color-success)" : option.value === "REPROVADO" ? "var(--color-danger)" : "var(--color-warning)")};`)}></div> <span class="font-medium">${escape_html(option.label)}</span></div> `);
        if (status === option.value) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="absolute top-2 right-2"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></button>`);
      }
      $$renderer3.push(`<!--]--></div></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Conclusão</h3> <textarea rows="4" class="modern-textarea" placeholder="Conclusão técnica sobre o sistema SPDA...">`);
      const $$body = escape_html(conclusion);
      if ($$body) {
        $$renderer3.push(`${$$body}`);
      }
      $$renderer3.push(`</textarea></section> <section><h3 class="text-base font-semibold mb-4 pb-2" style="color: var(--text-primary); border-bottom: 1px solid var(--border-color);">Fotos Gerais</h3> `);
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
      const $$body_1 = escape_html(observations);
      if ($$body_1) {
        $$renderer3.push(`${$$body_1}`);
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
        $$renderer3.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> <span>Gerar Relatório SPDA</span>`);
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
