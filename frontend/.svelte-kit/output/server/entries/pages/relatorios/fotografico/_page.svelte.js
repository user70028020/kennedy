import { a as attr } from "../../../../chunks/attributes.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
import { P as PhotoCapture } from "../../../../chunks/PhotoCapture.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let template = "nx_energy";
    let osNumber = "";
    let clientName = "";
    let location = "";
    let equipmentType = "";
    let serialNumber = "";
    let responsible = "";
    let reportDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let observations = "";
    let photos = [];
    let loading = false;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="max-w-5xl mx-auto animate-in"><div class="modern-card"><div class="modern-card-header"><div class="modern-card-title"><div class="modern-card-title-icon"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div> Relatório Fotográfico</div> <div class="text-sm" style="color: var(--text-muted);">Preencha os dados e adicione as fotos</div></div> <form class="space-y-6"><div class="form-group"><label class="modern-label">Template</label> <div class="radio-group"><label class="radio-label"><input type="radio"${attr("checked", template === "nx_energy", true)} value="nx_energy" class="modern-radio"/> <span style="color: var(--text-primary);">NX Energy</span></label> <label class="radio-label"><input type="radio"${attr("checked", template === "sercamp", true)} value="sercamp" class="modern-radio"/> <span style="color: var(--text-primary);">SERCAMP</span></label></div></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-5"><div class="form-group"><label for="osNumber" class="modern-label modern-label-required">Número da OS</label> <input id="osNumber" type="text"${attr("value", osNumber)} required class="modern-input" placeholder="Ex: OS-2024-001"/></div> <div class="form-group"><label for="clientName" class="modern-label modern-label-required">Cliente</label> <input id="clientName" type="text"${attr("value", clientName)} required class="modern-input" placeholder="Nome do cliente"/></div> <div class="form-group"><label for="location" class="modern-label">Local</label> <input id="location" type="text"${attr("value", location)} class="modern-input" placeholder="Local da inspeção"/></div> <div class="form-group"><label for="equipmentType" class="modern-label">Equipamento</label> <input id="equipmentType" type="text"${attr("value", equipmentType)} class="modern-input" placeholder="Tipo de equipamento"/></div> <div class="form-group"><label for="serialNumber" class="modern-label">Número de Série</label> <input id="serialNumber" type="text"${attr("value", serialNumber)} class="modern-input" placeholder="Nº de série do equipamento"/></div> <div class="form-group"><label for="responsible" class="modern-label">Responsável</label> <input id="responsible" type="text"${attr("value", responsible)} class="modern-input" placeholder="Nome do responsável"/></div> <div class="form-group"><label for="reportDate" class="modern-label">Data</label> <input id="reportDate" type="date"${attr("value", reportDate)} class="modern-input"/></div></div> <div class="form-group"><label for="observations" class="modern-label">Observações</label> <textarea id="observations" rows="4" class="modern-textarea" placeholder="Observações gerais sobre a inspeção...">`);
      const $$body = escape_html(observations);
      if ($$body) {
        $$renderer3.push(`${$$body}`);
      }
      $$renderer3.push(`</textarea></div> <div class="form-group"><label class="modern-label modern-label-required">Fotos</label> `);
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
      $$renderer3.push(`<!----></div> `);
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
        $$renderer3.push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> <span>Gerar Relatório</span>`);
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
